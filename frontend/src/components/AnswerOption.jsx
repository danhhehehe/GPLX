const AnswerOption = ({ label, text, selected, correct, wrong, disabled, onChoose }) => {
  const className = ['answer-option', selected ? 'selected' : '', correct ? 'correct' : '', wrong ? 'wrong' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} disabled={disabled} onClick={onChoose}>
      <span className="answer-key">{label.toUpperCase()}</span>
      <span>{text}</span>
    </button>
  );
};

export default AnswerOption;
