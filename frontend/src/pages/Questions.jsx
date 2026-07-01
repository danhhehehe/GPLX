import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { licenseApi } from '../api/licenseApi.js';
import { questionApi } from '../api/questionApi.js';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import QuestionPracticeCard from '../components/QuestionPracticeCard.jsx';
import { useQuestions } from '../hooks/useQuestions.js';

const Questions = () => {
  const [searchParams] = useSearchParams();
  const initialLicense = searchParams.get('licenseType') || '';
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    licenseType: initialLicense,
    category: '',
    keyword: '',
    isPointDeduction: ''
  });
  const [categories, setCategories] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const params = useMemo(() => {
    const clean = { mode: 'practice' };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') clean[key] = value;
    });
    return clean;
  }, [filters]);
  const { data, pagination, loading, error } = useQuestions(params);

  useEffect(() => {
    questionApi.getCategories().then(setCategories).catch(() => setCategories([]));
    licenseApi.getLicenses().then(setLicenses).catch(() => setLicenses([]));
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Ngân hàng câu hỏi</p>
        <h1>Tra cứu, lọc và trả lời trực tiếp câu hỏi GPLX</h1>
      </div>
      <div className="filters">
        <input
          placeholder="Tìm nội dung câu hỏi..."
          value={filters.keyword}
          onChange={(event) => updateFilter('keyword', event.target.value)}
        />
        <select value={filters.licenseType} onChange={(event) => updateFilter('licenseType', event.target.value)}>
          <option value="">Tất cả hạng</option>
          {licenses.map((license) => <option key={license.code} value={license.code}>{license.code} - {license.name}</option>)}
        </select>
        <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
          <option value="">Tất cả chương</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={filters.isPointDeduction} onChange={(event) => updateFilter('isPointDeduction', event.target.value)}>
          <option value="">Tất cả loại câu</option>
          <option value="true">Chỉ câu điểm liệt</option>
          <option value="false">Không điểm liệt</option>
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
          {!data.length && <div className="empty">Không tìm thấy câu hỏi phù hợp.</div>}
          <Pagination pagination={pagination} onPageChange={(page) => updateFilter('page', page)} />
        </>
      )}
    </section>
  );
};

export default Questions;
