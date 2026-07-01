import { useEffect, useMemo, useState } from 'react';
import { memoryTipApi } from '../api/memoryTipApi.js';
import MemoryTipsList from '../components/memory/MemoryTipsList.jsx';
import Loading from '../components/Loading.jsx';
import { memoryTips as fallbackTips } from '../data/memoryTips.js';
import '../styles/memoryTips.css';

const normalizeTip = (tip, index) => ({
  ...tip,
  id: tip._id || tip.id || index + 1
});

const MemoryTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    memoryTipApi.getTips()
      .then((payload) => setTips(payload.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const displayTips = useMemo(() => (
    (tips.length ? tips : fallbackTips).map(normalizeTip)
  ), [tips]);

  return (
    <section className="memory-tips-page container">
      <div className="memory-tips-hero">
        <h1>Mẹo ghi nhớ 600 câu hỏi ôn thi GPLX</h1>
        <p>Danh sách mẹo ngắn gọn, dễ nhớ, có thể tìm kiếm và mở rộng để xem chi tiết.</p>
      </div>

      {loading && <Loading />}
      {error && <div className="alert error">Không tải được mẹo từ API, đang dùng dữ liệu mặc định.</div>}
      {!loading && <MemoryTipsList tips={displayTips} />}
    </section>
  );
};

export default MemoryTips;
