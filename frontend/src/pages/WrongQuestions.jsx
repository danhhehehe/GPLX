import { useEffect, useState } from 'react';
import { wrongAnswerApi } from '../api/wrongAnswerApi.js';
import Loading from '../components/Loading.jsx';
import QuestionPracticeCard from '../components/QuestionPracticeCard.jsx';

const WrongQuestions = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWrongQuestions = () => {
    setLoading(true);
    setError('');
    wrongAnswerApi.getWrongQuestions()
      .then((payload) => setRows(payload.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const removeFixed = (id) => {
    wrongAnswerApi.removeFixedQuestion(id)
      .then(() => setRows((current) => current.filter((row) => row._id !== id)))
      .catch((err) => setError(err.message));
  };

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Câu đã sai</p>
        <h1>Ôn lại những câu bạn từng trả lời sai.</h1>
      </div>

      {loading && <Loading />}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && !rows.length && (
        <div className="empty">Chưa có câu trả lời sai. Khi bạn làm sai trong phần ôn tập, câu đó sẽ xuất hiện tại đây.</div>
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="question-grid">
          {rows.map((row) => (
            <div className="wrong-question-item" key={row._id}>
              <QuestionPracticeCard question={row.question} />
              <div className="wrong-question-actions">
                <span className="hint-text">Sai {row.attemptCount || 1} lần</span>
                <button className="btn primary" type="button" onClick={() => removeFixed(row._id)}>
                  Đã làm đúng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WrongQuestions;
