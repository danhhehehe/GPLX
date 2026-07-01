import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { licenseApi } from '../api/licenseApi.js';
import { questionApi } from '../api/questionApi.js';
import LicenseClassGrid from '../components/LicenseClassGrid.jsx';
import Loading from '../components/Loading.jsx';
import TrafficSafetyClips from '../components/TrafficSafetyClips.jsx';

const SELECTED_LICENSE_KEY = 'gplx_selected_license';

const getStoredLicense = () => {
  try {
    return localStorage.getItem(SELECTED_LICENSE_KEY) || '';
  } catch (error) {
    return '';
  }
};

const storeSelectedLicense = (code) => {
  try {
    localStorage.setItem(SELECTED_LICENSE_KEY, code);
  } catch (error) {
    // Ignore storage errors in restricted browser modes.
  }
};

const createDashboardItems = (licenseCode) => [
  {
    title: 'Ôn tập 600 câu',
    description: licenseCode
      ? `Lọc và luyện bộ câu hỏi đúng với hạng ${licenseCode}.`
      : 'Lọc, tìm kiếm và luyện trực tiếp toàn bộ ngân hàng câu hỏi.',
    to: licenseCode ? `/questions?licenseType=${licenseCode}` : '/questions',
    icon: '📘',
    iconMotion: 'icon-pop',
    accent: 'primary'
  },
  {
    title: 'Mẹo ghi nhớ',
    description: 'Tổng hợp mẹo ghi nhớ nhanh 600 câu hỏi ôn thi GPLX.',
    to: '/meo-ghi-nho',
    icon: '🧠',
    iconMotion: 'icon-pulse',
    accent: 'accent'
  },
  {
    title: 'Xem câu đã sai',
    description: 'Ôn lại những câu từng trả lời sai và đánh dấu đã làm đúng.',
    to: '/wrong-questions',
    icon: '↻',
    iconMotion: 'icon-pop',
    accent: 'warning'
  },
  {
    title: 'Câu điểm liệt',
    description: licenseCode
      ? `Luyện riêng câu điểm liệt của hạng ${licenseCode}.`
      : 'Nhóm câu bắt buộc phải tránh sai khi thi.',
    to: licenseCode ? `/point-deduction?licenseType=${licenseCode}` : '/point-deduction',
    icon: '!',
    iconMotion: 'icon-pop',
    accent: 'danger'
  },
  {
    title: 'Đường trường',
    description: 'Luyện tình huống quan sát và xử lý khi đi đường thực tế.',
    to: '/duong-truong',
    icon: '🛣️',
    iconMotion: 'icon-slide',
    accent: 'success'
  },
  {
    title: 'Sa hình',
    description: 'Hướng dẫn thi thực hành lái xe số qua vòng số 8, đường thẳng, ziczac và đường gồ ghề.',
    to: '/sa-hinh',
    icon: '🏍️',
    iconMotion: 'icon-tilt',
    accent: 'primary'
  }
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState({ total: 0, point: 0, images: 0 });
  const [licenses, setLicenses] = useState([]);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [licensesLoading, setLicensesLoading] = useState(true);
  const [showClips, setShowClips] = useState(false);

  const routeLicense = String(searchParams.get('licenseType') || '').toUpperCase();

  useEffect(() => {
    let active = true;

    setStatsLoading(true);
    questionApi.getStatistics()
      .then((stats) => {
        if (!active) return;

        setSummary({
          total: stats.totalQuestions || 0,
          point: stats.totalPointDeduction || 0,
          images: stats.totalWithImages || 0
        });
      })
      .catch(() => {
        if (active) setSummary({ total: 0, point: 0, images: 0 });
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setLicensesLoading(true);
    licenseApi.getLicenses()
      .then((licenseItems) => {
        if (!active) return;

        const savedLicense = getStoredLicense().toUpperCase();
        const preferredCode = routeLicense || savedLicense || 'B';
        const preferredLicense = licenseItems.find((item) => item.code === preferredCode)
          || licenseItems.find((item) => item.code === 'B')
          || licenseItems[0]
          || null;

        setLicenses(licenseItems);
        setSelectedLicense(preferredLicense);
        if (preferredLicense?.code) {
          storeSelectedLicense(preferredLicense.code);
        }
      })
      .catch(() => {
        if (!active) return;

        setLicenses([]);
        setSelectedLicense(null);
      })
      .finally(() => {
        if (active) setLicensesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [routeLicense]);

  useEffect(() => {
    if (licensesLoading) return undefined;

    setShowClips(false);

    const show = () => setShowClips(true);
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(show, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(show, 450);
    return () => window.clearTimeout(timeoutId);
  }, [licensesLoading]);

  const selectedCode = selectedLicense?.code || '';
  const dashboard = useMemo(() => createDashboardItems(selectedCode), [selectedCode]);

  const handleSelectLicense = (license) => {
    setSelectedLicense(license);
    if (license?.code) {
      storeSelectedLicense(license.code);
    }
  };

  return (
    <section className="home-page">
      <div className="hero-band">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Luyện thi giấy phép lái xe</p>
            <h1>Chọn hạng trước, ôn đúng nhóm câu hỏi cần thi.</h1>
            <p className="hero-copy">
              Bắt đầu bằng việc chọn hạng bằng lái. Sau đó hệ thống sẽ đưa bạn tới đúng bộ câu hỏi,
              câu điểm liệt và đề thi thử phù hợp với hạng đã chọn.
            </p>
            <div className="actions">
              <a className="btn primary" href="#chon-hang">Chọn hạng bằng lái</a>
              <Link className="btn" to={selectedCode ? `/exam/${selectedCode}` : '/exam'}>Thi thử</Link>
              <Link className="btn ghost" to="/meo-ghi-nho">Mẹo ghi nhớ</Link>
            </div>
          </div>
          <div className="stats-panel">
            {statsLoading ? <Loading text="Đang lấy dữ liệu..." /> : (
              <>
                <div>
                  <strong>{summary.total}</strong>
                  <span>Tổng câu hỏi</span>
                </div>
                <div>
                  <strong>{summary.point}</strong>
                  <span>Câu điểm liệt</span>
                </div>
                <div>
                  <strong>{summary.images}</strong>
                  <span>Câu có hình ảnh</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="container page-stack" id="chon-hang">
        <div className="page-heading">
          <p className="eyebrow">Chọn hạng bằng lái</p>
          <h1>Học đúng nhóm câu hỏi của hạng bạn cần.</h1>
        </div>
        {licensesLoading ? <Loading /> : (
          <>
            <LicenseClassGrid licenses={licenses} selectedCode={selectedCode} onSelect={handleSelectLicense} />
            {selectedLicense && (
              <div className="license-actions">
                <div>
                  <h2>{selectedLicense.code} - {selectedLicense.name}</h2>
                  <p>{selectedLicense.description || selectedLicense.vehicleType}</p>
                  <p className="license-meta">
                    Các mục ôn tập bên dưới sẽ giữ hạng {selectedLicense.code} cho tới khi bạn chọn hạng khác.
                  </p>
                </div>
                <div className="actions">
                  <Link className="btn primary" to={`/questions?licenseType=${selectedLicense.code}`}>Ôn tập hạng này</Link>
                  <Link className="btn" to={`/point-deduction?licenseType=${selectedLicense.code}`}>Câu điểm liệt</Link>
                  <Link className="btn" to={`/exam/${selectedLicense.code}`}>Thi thử hạng này</Link>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="container page-stack">
        <div className="page-heading">
          {/* <p className="eyebrow">Dashboard học GPLX</p> */}
          <h1>{selectedCode ? `Luyện theo hạng ${selectedCode}.` : 'Chọn đúng nội dung cần luyện hôm nay.'}</h1>
        </div>
        <div className="dashboard-grid">
          {dashboard.map((item) => (
            <Link className={`dashboard-card ${item.accent}`} to={item.to} key={item.to}>
              <span className="dashboard-card-mark" />
              {item.icon && <span className={`dashboard-card-icon ${item.iconMotion || ''}`} aria-hidden="true">{item.icon}</span>}
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container page-stack">
        {showClips ? <TrafficSafetyClips /> : <div className="traffic-safety-clips-placeholder" aria-hidden="true" />}
      </section>
    </section>
  );
};

export default Home;
