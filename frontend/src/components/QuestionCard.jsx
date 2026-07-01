import { optionEntries } from '../utils/examUtils.js';
import QuestionImage from './QuestionImage.jsx';

const QuestionCard = ({ question, showAnswer = false }) => (
  <article className="question-card">
    <div className="question-meta">
      <span>#{question.questionNumber || question.id || question.sourceQuestionId}</span>
      <span>{question.category}</span>
      {question.isPointDeduction && <strong>Câu điểm liệt</strong>}
    </div>
    <h3>{question.question}</h3>
    <QuestionImage src={question.imageUrl || question.image} alt="Hình minh họa câu hỏi" />
    <div className="option-list">
      {optionEntries(question.options).map(([key, value]) => (
        <div className={showAnswer && key === question.correctAnswer ? 'plain-option correct-text' : 'plain-option'} key={key}>
          <b>{key.toUpperCase()}.</b> {value}
        </div>
      ))}
    </div>
    {showAnswer && question.explanation && <p className="explanation">{question.explanation}</p>}
  </article>
);

export default QuestionCard;
