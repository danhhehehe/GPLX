import { useEffect, useMemo, useState } from 'react';
import { trafficSignApi } from '../api/trafficSignApi.js';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import TrafficSignCard from '../components/TrafficSignCard.jsx';

const TrafficSigns = () => {
  const [signs, setSigns] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 24 });
  const [filters, setFilters] = useState({ page: 1, limit: 24, group: '', keyword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => {
    const clean = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') clean[key] = value;
    });
    return clean;
  }, [filters]);

  useEffect(() => {
    trafficSignApi.getGroups()
      .then(setGroups)
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    trafficSignApi.getSigns(params)
      .then((payload) => {
        setSigns(payload.data || []);
        setPagination(payload.pagination || { page: 1, totalPages: 1, total: 0, limit: 24 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Biển báo giao thông</p>
        <h1>Tra cứu các nhóm biển báo thường gặp.</h1>
      </div>
      <div className="traffic-summary">
        {groups.map((group) => (
          <button
            key={group.groupSlug}
            className={filters.group === group.groupSlug ? 'group-chip active' : 'group-chip'}
            type="button"
            onClick={() => updateFilter('group', filters.group === group.groupSlug ? '' : group.groupSlug)}
          >
            {group.group} <b>{group.count}</b>
          </button>
        ))}
      </div>
      <div className="filters">
        <input
          placeholder="Tìm theo mã, tên hoặc mô tả biển..."
          value={filters.keyword}
          onChange={(event) => updateFilter('keyword', event.target.value)}
        />
        <select value={filters.group} onChange={(event) => updateFilter('group', event.target.value)}>
          <option value="">Tất cả nhóm biển</option>
          {groups.map((group) => (
            <option key={group.groupSlug} value={group.groupSlug}>{group.group} ({group.count})</option>
          ))}
        </select>
      </div>
      {loading && <Loading />}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && (
        <>
          <div className="traffic-grid">
            {signs.map((sign) => <TrafficSignCard sign={sign} key={sign._id || sign.signHash || sign.code} />)}
          </div>
          {!signs.length && <div className="empty">Không tìm thấy biển báo phù hợp.</div>}
          <Pagination pagination={pagination} onPageChange={(page) => updateFilter('page', page)} />
        </>
      )}
    </section>
  );
};

export default TrafficSigns;
