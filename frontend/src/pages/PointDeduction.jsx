import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { licenseApi } from '../api/licenseApi.js';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import QuestionPracticeCard from '../components/QuestionPracticeCard.jsx';
import { useQuestions } from '../hooks/useQuestions.js';

const PointDeduction = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [licenseType, setLicenseType] = useState(searchParams.get('licenseType') || '');
  const [licenses, setLicenses] = useState([]);
  const params = useMemo(() => ({
    page,
    limit: 12,
    mode: 'practice',
    ...(licenseType ? { licenseType } : {})
  }), [page, licenseType]);
  const { data, pagination, loading, error } = useQuestions(params, 'point');

  useEffect(() => {
    licenseApi.getLicenses().then(setLicenses).catch(() => setLicenses([]));
  }, []);

  return (
    <section className="container page-stack">
      <div className="warning-band">
        <p className="eyebrow">Câu điểm liệt</p>
        <h1>Nhóm câu bắt buộc phải tránh sai.</h1>
        <p>
          Tổng số câu điểm liệt sau khi lọc trùng: <b>{pagination.total || 0}</b>.
          Chọn đáp án ngay trên từng câu để xem đúng/sai và giải thích.
        </p>
      </div>
      <div className="filters">
        <select
          value={licenseType}
          onChange={(event) => {
            setLicenseType(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả hạng</option>
          {licenses.map((license) => <option key={license.code} value={license.code}>{license.code} - {license.name}</option>)}
        </select>
      </div>
      {loading && <Loading />}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && (
        <>
          <div className="question-grid">
            {data.map((question) => (
              <QuestionPracticeCard question={question} key={question._id || question.questionHash} />
            ))}
          </div>
          {!data.length && <div className="empty">Chưa có câu điểm liệt.</div>}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </section>
  );
};

export default PointDeduction;
