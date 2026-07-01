import { useEffect, useMemo, useState } from 'react';
import { roadSituationApi } from '../api/roadSituationApi.js';
import Loading from '../components/Loading.jsx';

const fallbackSituations = [
  {
    _id: 'road-default-1',
    type: 'road',
    title: 'Quan sát khi nhập làn',
    description: 'Giữ tốc độ ổn định, quan sát gương và bật tín hiệu trước khi chuyển làn.',
    instruction: 'Tập nhận biết khoảng trống an toàn và không cắt đầu xe khác.'
  },
  {
    _id: 'simulation-default-1',
    type: 'simulation',
    title: 'Thứ tự xe qua giao lộ',
    description: 'Ưu tiên xe trên đường ưu tiên, xe bên phải và xe đã vào giao lộ trước.',
    instruction: 'Đọc biển báo, vạch kẻ đường và hướng rẽ trước khi chọn thứ tự.'
  }
];

const RoadPractice = ({ mode = 'road' }) => {
  const [type, setType] = useState(mode);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setType(mode);
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    setError('');
    roadSituationApi.getSituations({ type })
      .then((payload) => setItems(payload.data || []))
      .catch((err) => {
        setError(err.message);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const displayItems = useMemo(() => (
    items.length ? items : fallbackSituations.filter((item) => item.type === type)
  ), [items, type]);

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">{type === 'road' ? 'Đường trường' : 'Sa hình'}</p>
        <h1>{type === 'road' ? 'Luyện tình huống đi đường thực tế.' : 'Luyện nhận diện tình huống sa hình.'}</h1>
      </div>

      <div className="traffic-summary">
        <button className={type === 'road' ? 'group-chip active' : 'group-chip'} type="button" onClick={() => setType('road')}>
          Đường trường
        </button>
        <button className={type === 'simulation' ? 'group-chip active' : 'group-chip'} type="button" onClick={() => setType('simulation')}>
          Sa hình
        </button>
      </div>

      {loading && <Loading />}
      {error && <div className="alert error">{error}</div>}
      {!loading && (
        <div className="quick-grid road-situation-grid">
          {displayItems.map((item) => (
            <article className="app-card road-situation-card" key={item._id}>
              {item.imageUrl && (
                <div className="question-image-wrap">
                  <img className="question-image loaded" src={item.imageUrl} alt={item.title} />
                </div>
              )}
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              {item.instruction && <p className="hint-text">{item.instruction}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default RoadPractice;
