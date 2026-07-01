import { Link, useLocation } from 'react-router-dom';

const Result = () => {
  const { state } = useLocation();
  const result = state?.result;

  if (!result) {
    return (
      <section className="container page-stack">
        <div className="empty">Chưa có kết quả thi.</div>
        <Link className="btn primary" to="/exam/a1">Làm bài thi thử</Link>
      </section>
    );
  }

  return (
    <section className="container page-stack">
      <div className={result.passed ? 'result-hero pass' : 'result-hero fail'}>
        <p className="eyebrow">Kết quả thi thử</p>
        <h1>{result.passed ? 'Đạt' : 'Chưa đạt'}</h1>
        <p>
          Đúng {result.correctCount}, sai {result.wrongCount}, chưa làm {result.unansweredCount}.
          {result.hasPointDeductionWrong && ' Có câu điểm liệt bị sai.'}
        </p>
      </div>
      <div className="result-grid">
        {result.details.map((item, index) => (
          <article className="question-card" key={item.questionId}>
            <div className="question-meta">
              <span>Câu {index + 1}</span>
              {item.isPointDeduction && <strong>Câu điểm liệt</strong>}
            </div>
            <h3>{item.question}</h3>
            <p>Bạn chọn: {item.userAnswer ? item.userAnswer.toUpperCase() : 'Chưa chọn'}</p>
            <p>Đáp án đúng: <b>{item.correctAnswer.toUpperCase()}</b></p>
            <p className={item.isCorrect ? 'correct-text' : 'wrong-text'}>{item.isCorrect ? 'Đúng' : 'Sai'}</p>
            {item.explanation && <p className="explanation">{item.explanation}</p>}
          </article>
        ))}
      </div>
      <Link className="btn primary" to="/exam/a1">Thi lại</Link>
    </section>
  );
};

export default Result;
