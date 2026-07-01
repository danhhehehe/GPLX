import crypto from 'crypto';

export const normalizeText = (text = '') => (
  String(text)
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
);

export const createQuestionHash = (question) => {
  const options = question.options || {};
  const raw = [
    question.question,
    options.a,
    options.b,
    options.c,
    options.d,
    question.correctAnswer
  ].map(normalizeText).join('|');

  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const uniqueArray = (...values) => (
  [
    ...new Set(
      values
        .flat(Infinity)
        .filter(Boolean)
        .flatMap((value) => String(value).split(','))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ]
);

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
