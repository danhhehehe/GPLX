import { useState } from 'react';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { useQuestions } from '../hooks/useQuestions.js';

const QuestionsWithImages = () => {
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error } = useQuestions({ page, limit: 12 }, 'images');

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Câu hỏi có hình ảnh</p>
        <h1>Ôn các câu cần quan sát biển báo, tình huống và sa hình.</h1>
      </div>
      {loading && <Loading />}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && (
        <>
          <div className="question-grid">
            {data.map((question) => <QuestionCard question={question} key={question._id} showAnswer />)}
          </div>
          {!data.length && <div className="empty">Chưa có câu hỏi có hình ảnh.</div>}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </section>
  );
};

export default QuestionsWithImages;
