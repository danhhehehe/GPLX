import { useEffect, useMemo, useRef, useState } from 'react';
import { wrongAnswerApi } from '../api/wrongAnswerApi.js';
import { hasMultipleCorrectAnswers, isCorrectAnswer, normalizeAnswer, optionEntries } from '../utils/examUtils.js';
import QuestionImage from './QuestionImage.jsx';

const QuestionPracticeCard = ({ question }) => {
  const multi = hasMultipleCorrectAnswers(question.correctAnswer);
  const correctAnswers = useMemo(() => normalizeAnswer(question.correctAnswer), [question.correctAnswer]);
  const [selected, setSelected] = useState([]);
  const pendingWrongAnswers = useRef(new Set());
  const answered = selected.length > 0;
  const correct = answered && isCorrectAnswer(selected, question.correctAnswer);

  useEffect(() => {
    pendingWrongAnswers.current.clear();
  }, [question._id]);

  const saveWrongAnswer = (answer) => {
    if (isCorrectAnswer(answer, question.correctAnswer)) return;
    const requestKey = `${question._id}:${answer.join(',')}`;
    if (pendingWrongAnswers.current.has(requestKey)) return;
    pendingWrongAnswers.current.add(requestKey);

    wrongAnswerApi.saveWrongAnswer({
      questionId: question._id,
      selectedAnswer: answer,
      licenseType: question.licenseTypes?.[0] || ''
    }).catch(() => {}).finally(() => {
      pendingWrongAnswers.current.delete(requestKey);
    });
  };

  const choose = (key) => {
    if (!multi) {
      setSelected([key]);
      saveWrongAnswer([key]);
      return;
    }

    setSelected((prev) => {
      const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
      if (next.length >= correctAnswers.length) {
        saveWrongAnswer(next);
      }
      return next;
    });
  };

  const reset = () => setSelected([]);

  return (
    <article className="question-card practice-card">
      <div className="question-meta">
        <span>#{question.questionNumber || question.sourceQuestionId || question.questionHash}</span>
        <span>{question.category}</span>
        {question.isPointDeduction && <strong>Câu điểm liệt</strong>}
      </div>
      <h3>{question.question}</h3>
      <QuestionImage src={question.imageUrl || question.image} alt="Hình minh họa câu hỏi" />
      <div className="answer-list">
        {optionEntries(question.options).map(([key, value]) => {
          const isSelected = selected.includes(key);
          const isRightKey = correctAnswers.includes(key);
          const stateClass = answered && isRightKey ? 'correct' : answered && isSelected && !isRightKey ? 'wrong' : '';

          return (
            <button
              className={['answer-option', isSelected ? 'selected' : '', stateClass].filter(Boolean).join(' ')}
              key={key}
              type="button"
              onClick={() => choose(key)}
              disabled={answered && !multi}
            >
              <span className="answer-key">{multi ? (isSelected ? '✓' : key.toUpperCase()) : key.toUpperCase()}</span>
              <span>{value}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={correct ? 'alert success' : 'alert error'}>
          <b>{correct ? 'Chính xác.' : 'Chưa đúng.'}</b>
          <p>Đáp án đúng: {correctAnswers.map((item) => item.toUpperCase()).join(', ')}</p>
          {question.explanation && <p>{question.explanation}</p>}
          <button className="btn" type="button" onClick={reset}>Làm lại câu này</button>
        </div>
      )}
      {multi && !answered && <p className="hint-text">Câu này có thể có nhiều đáp án đúng.</p>}
    </article>
  );
};

export default QuestionPracticeCard;
