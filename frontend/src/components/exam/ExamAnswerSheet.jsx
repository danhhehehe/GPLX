import './ExamAnswerSheet.css';

const OPTION_KEYS = ['a', 'b', 'c', 'd'];

function normalizeSelectedAnswer(answer) {
  if (!answer) return [];
  if (Array.isArray(answer)) {
    return answer.map((x) => String(x).toLowerCase().trim()).filter(Boolean);
  }
  return String(answer)
    .toLowerCase()
    .replace(/\s+/g, '')
    .split(/[.,|;/]+/)
    .flatMap((part) => {
      if (part.length > 1 && /^[abcd]+$/.test(part)) {
        return part.split('');
      }
      return [part];
    })
    .filter(Boolean);
}

function getQuestionOptions(question) {
  const options = question?.options;
  if (!options) {
    return OPTION_KEYS;
  }
  return OPTION_KEYS.filter((key) => {
    const value = options[key];
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}

function getQuestionId(question, fallbackIndex) {
  return String(question?._id || question?.id || question?.questionHash || fallbackIndex).trim();
}

function getReviewStatus(questionId, reviewMap, reviewDetails) {
  if (reviewMap && reviewMap[questionId]) {
    return reviewMap[questionId];
  }
  if (!reviewDetails) {
    return '';
  }
  const detail = reviewDetails.find((item) => String(item.questionId) === String(questionId));
  if (!detail) {
    return '';
  }
  const selected = Array.isArray(detail.selectedAnswer) ? detail.selectedAnswer : [];
  return detail.isCorrect ? 'correct' : selected.length ? 'wrong' : 'unanswered';
}

function AnswerSheetRow({
  question,
  index,
  selectedAnswer,
  isActive,
  reviewStatus,
  onSelectQuestion,
  onToggleAnswer
}) {
  const selected = normalizeSelectedAnswer(selectedAnswer);
  const options = getQuestionOptions(question);
  const canToggleAnswer = typeof onToggleAnswer === 'function' && !reviewStatus;
  const rowClass = [
    'exam-sheet-row',
    isActive ? 'active' : '',
    selected.length > 0 ? 'answered' : '',
    reviewStatus ? `review-${reviewStatus}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rowClass}
      onClick={() => onSelectQuestion(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectQuestion(index);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="exam-sheet-number">Câu {index + 1}</span>
      <span className="exam-sheet-options">
        <span className="exam-sheet-option-labels">
          {options.map((key, optionIndex) => (
            <span key={key}>{optionIndex + 1}</span>
          ))}
        </span>
        <span className="exam-sheet-option-boxes">
          {options.map((key) => (
            <button
              key={key}
              type="button"
              className={['exam-sheet-box', selected.includes(key) ? 'selected' : '']
                .filter(Boolean)
                .join(' ')}
              aria-label={`Chọn đáp án ${key.toUpperCase()} cho câu ${index + 1}`}
              disabled={!canToggleAnswer}
              onClick={(event) => {
                event.stopPropagation();
                onToggleAnswer?.(index, key);
              }}
            />
          ))}
        </span>
      </span>
    </div>
  );
}

export default function ExamAnswerSheet({
  questions = [],
  answers = {},
  currentIndex = 0,
  currentQuestionIndex,
  onSelect,
  onSelectQuestion,
  onToggleAnswer,
  reviewDetails,
  reviewMap
}) {
  const activeIndex = typeof currentQuestionIndex === 'number' ? currentQuestionIndex : currentIndex;
  const handleSelectQuestion = onSelectQuestion || onSelect || (() => {});
  const splitIndex = Math.ceil(questions.length / 2);
  const leftQuestions = questions.slice(0, splitIndex);
  const rightQuestions = questions.slice(splitIndex);

  const normalizedReviewMap = reviewMap ||
    (reviewDetails
      ? reviewDetails.reduce((map, item) => {
          const id = String(item.questionId);
          const selected = Array.isArray(item.selectedAnswer) ? item.selectedAnswer : [];
          map[id] = item.isCorrect ? 'correct' : selected.length ? 'wrong' : 'unanswered';
          return map;
        }, {})
      : {});

  const renderColumn = (columnQuestions, startIndex) => (
    <div className="exam-sheet-column">
      {columnQuestions.map((question, localIndex) => {
        const realIndex = startIndex + localIndex;
        const questionId = getQuestionId(question, realIndex);
        return (
          <AnswerSheetRow
            key={questionId}
            question={question}
            index={realIndex}
            selectedAnswer={answers[questionId]}
            isActive={realIndex === activeIndex}
            reviewStatus={getReviewStatus(questionId, normalizedReviewMap, reviewDetails)}
            onSelectQuestion={handleSelectQuestion}
            onToggleAnswer={onToggleAnswer}
          />
        );
      })}
    </div>
  );

  return (
    <aside className="exam-answer-sheet">
      <div className="exam-sheet-grid">
        {renderColumn(leftQuestions, 0)}
        {renderColumn(rightQuestions, splitIndex)}
      </div>
    </aside>
  );
}
