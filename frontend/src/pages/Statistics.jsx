import { useEffect, useState } from 'react';
import { questionApi } from '../api/questionApi.js';
import Loading from '../components/Loading.jsx';

const statsMap = [
  ['totalQuestions', 'Tổng câu hỏi'],
  ['totalA1', 'Câu A/A1'],
  ['totalAll', 'Câu all'],
  ['totalPointDeduction', 'Câu điểm liệt'],
  ['totalWithImages', 'Câu có ảnh'],
  ['totalCategories', 'Nhóm câu hỏi'],
  ['totalLicenseTypes', 'Hạng GPLX']
];

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [imageCheck, setImageCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([questionApi.getStatistics(), questionApi.getImageCheck()])
      .then(([statistics, check]) => {
        setStats(statistics);
        setImageCheck(check);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Đang tải thống kê..." />;
  if (error) return <div className="container alert error">{error}</div>;

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Thống kê dữ liệu</p>
        <h1>Tổng quan ngân hàng câu hỏi GPLX</h1>
      </div>
      <div className="stat-dashboard">
        {statsMap.map(([key, label]) => (
          <div className="stat-card" key={key}>
            <strong>{stats?.[key] ?? 0}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="image-check-panel">
        <h2>Kiểm tra ảnh</h2>
        <p>Tổng câu có ảnh: <b>{imageCheck?.totalWithImages || 0}</b></p>
        <p>Câu khai báo có ảnh nhưng thiếu URL: <b>{imageCheck?.totalMissingImages || 0}</b></p>
      </div>
    </section>
  );
};

export default Statistics;
