import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExamAnswerSheet from '../components/exam/ExamAnswerSheet.jsx';
import ExamQuestionPanel from '../components/exam/ExamQuestionPanel.jsx';
import ExamReviewPanel from '../components/exam/ExamReviewPanel.jsx';
import '../styles/exam.css';

const ExamResult = () => {
  const navigate = useNavigate();
  const stored = sessionStorage.getItem('gplx_exam_result');
  const payload = stored ? JSON.parse(stored) : null;
  const [review, setReview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const detailById = useMemo(() => new Map((payload?.result?.details || []).map((item) => [String(item.questionId), item])), [payload]);

  if (!payload) {
    return (
      <section className="exam-entry-shell">
        <div className="exam-result-card failed">
          <h1>Chưa có kết quả thi</h1>
          <Link className="btn primary" to="/exam">Về trang thi thử</Link>
        </div>
      </section>
    );
  }

  const { session, answers, result } = payload;
  const finalResult = result.result;
  const currentQuestion = session.questions[currentIndex];
  const currentDetail = detailById.get(String(currentQuestion?._id));

  const reviewMap = useMemo(() => {
    return (result?.details || []).reduce((map, item) => {
      map[String(item.questionId)] = item.isCorrect ? 'correct' : (Array.isArray(item.selectedAnswer) && item.selectedAnswer.length ? 'wrong' : 'unanswered');
      return map;
    }, {});
  }, [result]);

  if (review) {
    return (
      <section className="exam-room-shell review-mode">
        <div className="exam-main-panel">
          <ExamReviewPanel result={result} />
          <ExamQuestionPanel
            question={currentQuestion}
            selected={answers[currentQuestion._id] || []}
            onToggle={null}
            reviewDetail={currentDetail}
          />
        </div>
        <aside className="exam-sidebar">
          <ExamAnswerSheet
            questions={session.questions}
            answers={answers}
            currentQuestionIndex={currentIndex}
            onSelectQuestion={setCurrentIndex}
            reviewDetails={result.details}
            reviewMap={reviewMap}
          />
        </aside>
        <div className="exam-bottom-bar">
          <button className="exam-button" type="button" onClick={() => setReview(false)}>Quay lại kết quả</button>
          <Link className="exam-button primary" to="/exam">Làm đề khác</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="exam-entry-shell">
      <div className={finalResult.passed ? 'exam-result-card passed' : 'exam-result-card failed'}>
        <h1>{finalResult.statusText}</h1>
        <p>{finalResult.passed ? 'Chúc mừng, bạn đã đạt bài thi thử.' : 'Bạn chưa đạt bài thi thử.'}</p>
        {finalResult.hasWrongPointDeduction && <p>Bạn đã trả lời sai câu điểm liệt nên không đạt.</p>}
      </div>
      <div className="candidate-preview">
        <h3>Thông tin kết quả</h3>
        <p><b>Họ tên:</b> {session.candidate.fullName}</p>
        <p><b>Số báo danh:</b> {session.candidate.examNumber}</p>
        <p><b>Hạng GPLX:</b> {session.licenseType}</p>
        <p><b>Bộ đề:</b> {session.setName || session.setId || 'Ngẫu nhiên'}</p>
        <p><b>Tổng số câu:</b> {finalResult.totalQuestions}</p>
        <p><b>Đúng:</b> {finalResult.correctCount} • <b>Sai:</b> {finalResult.wrongCount} • <b>Chưa làm:</b> {finalResult.unansweredCount}</p>
        <p><b>Điểm đạt:</b> {finalResult.passingScore}</p>
      </div>
      <div className="candidate-actions">
        <button className="exam-button" type="button" onClick={() => setReview(true)}>Xem đáp án</button>
        <button className="exam-button" type="button" onClick={() => navigate(`/exam/${session.licenseType}/session`)}>Làm lại đề này</button>
        <Link className="exam-button" to="/exam">Làm đề khác</Link>
        <Link className="exam-button primary" to="/exam">Về trang thi thử</Link>
      </div>
    </section>
  );
};

export default ExamResult;
