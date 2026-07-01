import { useEffect, useMemo, useRef, useState } from 'react';
import { clipApi } from '../api/clipApi.js';
import Loading from './Loading.jsx';

const VIEW_WINDOW_MS = 30 * 60 * 1000;

const formatViews = (views = 0) => `${Number(views || 0).toLocaleString('vi-VN')} lượt xem`;

const getViewStorageKey = (clipId) => `clip_viewed_${clipId}`;

const canCountView = (clipId) => {
  try {
    const lastViewedAt = Number(localStorage.getItem(getViewStorageKey(clipId)) || 0);
    return Date.now() - lastViewedAt > VIEW_WINDOW_MS;
  } catch (error) {
    return true;
  }
};

const markViewCounted = (clipId) => {
  try {
    localStorage.setItem(getViewStorageKey(clipId), String(Date.now()));
  } catch (error) {
    // Ignore storage errors in restricted browser modes.
  }
};

const TrafficSafetyClips = () => {
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [hoveredClipId, setHoveredClipId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const playerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    clipApi.getClips()
      .then(({ featured, data }) => {
        if (!mounted) return;
        setClips(data);
        setSelectedClip(featured || data[0] || null);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => () => {
    clearTimeout(hoverTimerRef.current);
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
      previewVideoRef.current.currentTime = 0;
    }
  }, []);

  const orderedClips = useMemo(() => {
    if (!selectedClip) return clips;

    return [...clips].sort((left, right) => {
      if (left.id === selectedClip.id) return -1;
      if (right.id === selectedClip.id) return 1;
      return 0;
    });
  }, [clips, selectedClip]);

  const handleSelectClip = (clip) => {
    clearPreview();
    setSelectedClip(clip);

    if (window.matchMedia('(max-width: 860px)').matches) {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clearPreview = () => {
    clearTimeout(hoverTimerRef.current);

    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
      previewVideoRef.current.currentTime = 0;
    }

    setHoveredClipId(null);
  };

  const handlePreviewEnter = (clipId) => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredClipId(clipId);
    }, 400);
  };

  const handlePlay = async () => {
    if (!selectedClip?.id || !canCountView(selectedClip.id)) return;

    markViewCounted(selectedClip.id);

    try {
      const response = await clipApi.recordView(selectedClip.id);
      const updatedViews = response?.data?.views;
      if (!response?.counted || typeof updatedViews !== 'number') return;

      setClips((items) => items.map((clip) => (
        clip.id === selectedClip.id ? { ...clip, views: updatedViews } : clip
      )));
      setSelectedClip((clip) => (
        clip?.id === selectedClip.id ? { ...clip, views: updatedViews } : clip
      ));
    } catch (requestError) {
      // The video should keep playing even if analytics cannot be recorded.
    }
  };

  return (
    <section className="traffic-safety-clips">
      <div className="page-heading traffic-safety-clips-heading">
        <p className="eyebrow">An toàn giao thông</p>
        <h1>Video tuyên truyền an toàn giao thông</h1>
        <p>Các clip tuyên truyền giúp nâng cao ý thức khi tham gia giao thông.</p>
      </div>

      {loading && <Loading text="Đang tải video tuyên truyền..." />}
      {!loading && error && <div className="alert error">{error}</div>}
      {!loading && !error && clips.length === 0 && (
        <div className="empty">Chưa có video tuyên truyền. Vui lòng thêm video vào thư mục clip.</div>
      )}
      {!loading && !error && selectedClip && (
        <div className="traffic-safety-watch-layout">
          <article className="traffic-safety-featured" ref={playerRef}>
            <video
              key={selectedClip.id}
              className="traffic-safety-featured-video"
              controls
              preload="metadata"
              poster={selectedClip.thumbnailUrl || undefined}
              src={selectedClip.videoUrl}
              onPlay={handlePlay}
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
            <div className="traffic-safety-featured-content">
              <h2>{selectedClip.title}</h2>
              <div className="traffic-safety-clip-meta">
                <span>{formatViews(selectedClip.views)}</span>
                {selectedClip.source && (
                  <span>
                    Nguồn:{' '}
                    {selectedClip.sourceUrl ? (
                      <a href={selectedClip.sourceUrl} target="_blank" rel="noreferrer">{selectedClip.source}</a>
                    ) : selectedClip.source}
                  </span>
                )}
              </div>
              {selectedClip.description && <p>{selectedClip.description}</p>}
            </div>
          </article>

          <aside className="traffic-safety-playlist" aria-label="Danh sách video tuyên truyền">
            {orderedClips.map((clip) => {
              const isActive = clip.id === selectedClip.id;

              return (
                <button
                  className={`traffic-safety-playlist-item ${isActive ? 'active' : ''}`}
                  type="button"
                  key={clip.id || clip.videoUrl}
                  onMouseEnter={() => handlePreviewEnter(clip.id)}
                  onMouseLeave={clearPreview}
                  onFocus={() => handlePreviewEnter(clip.id)}
                  onBlur={clearPreview}
                  onClick={() => handleSelectClip(clip)}
                >
                  <span className="traffic-safety-thumb">
                    {hoveredClipId === clip.id ? (
                      <video
                        ref={previewVideoRef}
                        className="traffic-safety-preview-video"
                        src={clip.videoUrl}
                        muted
                        playsInline
                        autoPlay
                        preload="metadata"
                        onLoadedMetadata={(event) => {
                          event.currentTarget.currentTime = 0;
                        }}
                        onTimeUpdate={(event) => {
                          if (event.currentTarget.currentTime >= 5) {
                            event.currentTarget.currentTime = 0;
                          }
                        }}
                      />
                    ) : clip.thumbnailUrl ? (
                      <img src={clip.thumbnailUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="traffic-safety-thumb-placeholder" aria-hidden="true">▶</span>
                    )}
                  </span>
                  <span className="traffic-safety-playlist-copy">
                    <strong>{clip.title}</strong>
                    {clip.description && <span>{clip.description}</span>}
                    <small>{clip.source || 'B PRODUCTIONS'} · {formatViews(clip.views)}</small>
                  </span>
                </button>
              );
            })}
          </aside>
        </div>
      )}
    </section>
  );
};

export default TrafficSafetyClips;
