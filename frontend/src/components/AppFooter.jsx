import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { licenseApi } from '../api/licenseApi.js';

const fallbackLicenses = [
  { code: 'A1', label: 'Mô tô phổ thông' },
  { code: 'A', label: 'Mô tô phân khối lớn' },
  { code: 'B1', label: 'Ô tô số tự động' },
  { code: 'B', label: 'Ô tô con' },
  { code: 'C1', label: 'Xe tải trung' },
  { code: 'C', label: 'Xe tải nặng' },
  { code: 'D1', label: 'Xe khách nhỏ' },
  { code: 'D2', label: 'Xe khách trung' },
  { code: 'D', label: 'Xe khách lớn' },
  { code: 'BE', label: 'Ô tô kéo rơ-moóc' },
  { code: 'C1E', label: 'Xe tải C1 kéo rơ-moóc' },
  { code: 'CE', label: 'Xe tải C kéo rơ-moóc' },
  { code: 'D1E', label: 'Xe khách D1 kéo rơ-moóc' },
  { code: 'D2E', label: 'Xe khách D2 kéo rơ-moóc' },
  { code: 'DE', label: 'Xe khách D kéo rơ-moóc' }
];

const resources = [
  'Hệ thống biển báo',
  'Câu điểm liệt',
  'Đề thi thử',
  'Luyện tập lý thuyết'
];

const statistics = [
  '300+ biển báo',
  '600+ câu hỏi',
  'Đầy đủ câu điểm liệt',
  'Miễn phí sử dụng'
];

const licenseGroups = [
  { key: 'motorcycle', title: 'Xe máy, mô tô' },
  { key: 'car', title: 'Ô tô con' },
  { key: 'truck-bus', title: 'Xe tải, xe khách' },
  { key: 'trailer', title: 'Hạng kéo rơ-moóc' }
];

const licenseLabelByCode = {
  A1: 'Mô tô phổ thông',
  A: 'Mô tô phân khối lớn',
  B1: 'Ô tô số tự động',
  B2: 'Ô tô số sàn',
  B: 'Ô tô con',
  C1: 'Xe tải trung',
  C: 'Xe tải nặng',
  D1: 'Xe khách nhỏ',
  D2: 'Xe khách trung',
  D: 'Xe khách',
  BE: 'Ô tô kéo rơ-moóc',
  C1E: 'Xe tải C1 kéo rơ-moóc',
  CE: 'Xe tải C kéo rơ-moóc',
  D1E: 'Xe khách D1 kéo rơ-moóc',
  D2E: 'Xe khách D2 kéo rơ-moóc',
  DE: 'Xe khách D kéo rơ-moóc'
};

const getLicenseGroup = (code = '') => {
  if (code.endsWith('E')) return 'trailer';
  if (code.startsWith('A')) return 'motorcycle';
  if (code.startsWith('B')) return 'car';
  return 'truck-bus';
};

const toLicenseItem = (license) => ({
  code: license.code,
  label: licenseLabelByCode[license.code] || license.vehicleType || license.name || license.label || 'Hạng bằng lái',
  sortOrder: license.sortOrder || 0
});

const FooterColumn = ({ title, items }) => (
  <div className="app-footer-column">
    <h3>{title}</h3>
    <ul>
      {items.map((item, index) => (
        <li key={typeof item === 'string' ? item : item.key || index}>{item}</li>
      ))}
    </ul>
  </div>
);

const LicenseGroups = ({ licenses }) => (
  <div className="app-footer-column app-footer-license-column">
    <h3>Loại bằng lái</h3>
    <div className="app-footer-license-groups">
      {licenseGroups.map((group) => {
        const items = licenses.filter((license) => getLicenseGroup(license.code) === group.key);
        if (!items.length) return null;

        return (
          <details className="app-footer-license-group" key={group.key}>
            <summary>{group.title}</summary>
            <ul>
              {items.map((license) => (
                <li key={license.code}>
                  <Link to={`/?licenseType=${license.code}#chon-hang`}>
                    Bằng {license.code} - {license.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  </div>
);

const AppFooter = () => {
  const [licenses, setLicenses] = useState(fallbackLicenses);

  useEffect(() => {
    let mounted = true;

    licenseApi.getLicenses()
      .then((items) => {
        if (!mounted || !Array.isArray(items) || items.length === 0) return;
        setLicenses(items.map(toLicenseItem).filter((license) => license.code));
      })
      .catch(() => {
        // Keep the local fallback if the API is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sortedLicenses = useMemo(() => (
    [...licenses].sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
  ), [licenses]);

  return (
    <footer className="app-footer">
      <div className="container app-footer-container">
        <div className="app-footer-brand">
          <h2>Ôn thi GPLX</h2>
          <p>
            Hệ thống luyện thi giấy phép lái xe trực tuyến miễn phí. Đầy đủ đề thi thử và lý thuyết
            cho tất cả các hạng bằng lái có trên hệ thống.
          </p>
        </div>

        <LicenseGroups licenses={sortedLicenses} />
        <FooterColumn title="Tài nguyên" items={resources} />
        <FooterColumn title="Thống kê" items={statistics} />
      </div>

      <div className="container app-footer-bottom">
        Code by{' '}
        <a
          href="https://www.facebook.com/huynh.thanh.danh.634137/?locale=vi_VN"
          target="_blank"
          rel="noreferrer"
        >
          @caubevacauvang
        </a>
      </div>
    </footer>
  );
};

export default AppFooter;
