export const optionEntries = (options = {}) => (
  ['a', 'b', 'c', 'd']
    .map((key) => [key, options[key]])
    .filter(([, value]) => Boolean(value))
);

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remain = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remain}`;
};

export const answerStats = (questions, answers) => {
  const answered = questions.filter((question) => answers[question._id]).length;
  return {
    answered,
    unanswered: Math.max(questions.length - answered, 0)
  };
};

export const normalizeAnswer = (answer) => {
  if (!answer) return [];

  if (Array.isArray(answer)) {
    return answer.map((value) => String(value).toLowerCase().trim()).filter(Boolean);
  }

  return String(answer)
    .toLowerCase()
    .replace(/\s+/g, '')
    .split(/[,|;/]+/)
    .flatMap((part) => {
      if (part.length > 1 && /^[abcd]+$/.test(part)) return part.split('');
      return [part];
    })
    .filter(Boolean);
};

export const isCorrectAnswer = (selected, correctAnswer) => {
  const selectedArr = normalizeAnswer(selected).sort();
  const correctArr = normalizeAnswer(correctAnswer).sort();
  return selectedArr.length === correctArr.length
    && selectedArr.every((value, index) => value === correctArr[index]);
};

export const hasMultipleCorrectAnswers = (correctAnswer) => normalizeAnswer(correctAnswer).length > 1;
