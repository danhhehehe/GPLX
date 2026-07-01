import QuestionImage from '../QuestionImage.jsx';
import { optionEntries } from '../../utils/examUtils.js';

const ExamQuestionPanel = ({ question, selected = [], onToggle, reviewDetail }) => {
  const isPointDeduction = Boolean(reviewDetail?.isPointDeduction || question?.isPointDeduction);
  const reviewNoteClass = [
    'review-note',
    reviewDetail?.isCorrect ? 'correct' : 'wrong',
    isPointDeduction ? 'point-deduction' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="exam-question-box">
      <h2 className="exam-question-title">{question.question}</h2>
      <QuestionImage src={question.imageUrl || question.image} alt="Ảnh câu hỏi GPLX" />
      <div className="exam-options">
        {optionEntries(question.options).map(([key, value], index) => (
          <button
            type="button"
            key={key}
            className={selected.includes(key) ? 'exam-option selected' : 'exam-option'}
            onClick={() => onToggle?.(key)}
          >
            <span>{index + 1}</span>
            <p className="exam-option-text">{value}</p>
          </button>
        ))}
      </div>
      {reviewDetail && (
        <div className={reviewNoteClass}>
          {isPointDeduction && (
            <div className="point-deduction-alert">
              <span className="point-deduction-icon" aria-hidden="true">!</span>
              <b>Câu điểm liệt</b>
            </div>
          )}
          <p><b>Bạn chọn:</b> {reviewDetail.selectedAnswer?.length ? reviewDetail.selectedAnswer.map((x) => x.toUpperCase()).join(', ') : 'Chưa trả lời'}</p>
          <p><b>Đáp án đúng:</b> {Array.isArray(reviewDetail.correctAnswer) ? reviewDetail.correctAnswer.join(', ').toUpperCase() : String(reviewDetail.correctAnswer).toUpperCase()}</p>
          {reviewDetail.explanation && <p>{reviewDetail.explanation}</p>}
        </div>
      )}
    </div>
  );
};

export default ExamQuestionPanel;
