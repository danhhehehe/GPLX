import { useEffect, useMemo, useState } from 'react';

const SOURCE_BASE_URL = 'https://onthigplx.edu.vn';

const normalizeImageSrc = (src) => {
  if (!src) return null;
  const value = String(src).trim();
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return encodeURI(value);
  if (value.startsWith('/')) return value;
  return encodeURI(`${SOURCE_BASE_URL}/${value.replace(/^\/+/, '')}`);
};

const QuestionImage = ({ src, alt = 'Ảnh câu hỏi GPLX' }) => {
  const imageSrc = useMemo(() => normalizeImageSrc(src), [src]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [imageSrc]);

  if (!imageSrc) return null;

  return (
    <div className="question-image-wrap">
      {!loaded && !failed && <div className="image-skeleton" />}
      {!failed && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className={loaded ? 'question-image loaded' : 'question-image'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {failed && <div className="image-fallback">Không tải được ảnh câu hỏi</div>}
    </div>
  );
};

export default QuestionImage;
