import crypto from 'crypto';
import Question from '../models/Question.js';
import LicenseClass from '../models/LicenseClass.js';
import ExamSet from '../models/ExamSet.js';
import { EXAM_TOPIC_KEYS, getExamConfig, topicLabels } from '../config/exam.config.js';
import { isCorrectAnswer, normalizeAnswer } from '../utils/question-dedupe.js';

const publicProject = { correctAnswer: 0, explanation: 0, references: 0 };

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const licenseAliases = (licenseType = 'A1') => {
  const normalized = String(licenseType || 'A1').toUpperCase();
  if (['D', 'D1', 'D2'].includes(normalized)) return ['D', 'D1', 'D2'];
  if (['E', 'BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'].includes(normalized)) return ['BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'];
  return [normalized];
};

const normalizePlainText = (value = '') => (
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
);

const getLicenseConfig = async (licenseType = 'A1') => {
  const normalizedLicense = String(licenseType || 'A1').toUpperCase();
  const defaults = getExamConfig(normalizedLicense);
  const license = await LicenseClass.findOne({ code: normalizedLicense, isActive: true });

  return {
    licenseType: normalizedLicense,
    configKey: defaults.configKey,
    license,
    questionCount: Number(defaults.totalQuestions),
    passingScore: Number(defaults.passScore),
    durationMinutes: Number(defaults.durationMinutes),
    bankSize: Number(defaults.bankSize),
    quota: defaults.quota
  };
};

const questionMatchForLicense = (licenseType) => {
  const normalized = String(licenseType || 'A1').toUpperCase();
  const byLicenseType = {
    licenseTypes: {
      $in: licenseAliases(normalized).map((item) => new RegExp(`^${escapeRegex(item)}$`, 'i'))
    }
  };

  if (normalized === 'B1') {
    return {
      $or: [
        byLicenseType,
        { sourceTypes: 'all', questionNumber: { $gte: 1, $lte: 300 } }
      ]
    };
  }

  return byLicenseType;
};

const getB1QuestionNumbers = (license) => {
  const groups = license?.rawData?.questionNumbers;
  if (!groups || typeof groups !== 'object') return [];

  return [...new Set(
    Object.values(groups)
      .flat()
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
  )].sort((left, right) => left - right);
};

const getQuestionsForConfig = async (config) => {
  const b1QuestionNumbers = config.licenseType === 'B1' ? getB1QuestionNumbers(config.license) : [];
  const match = b1QuestionNumbers.length
    ? { sourceTypes: 'all', questionNumber: { $in: b1QuestionNumbers } }
    : questionMatchForLicense(config.licenseType);
  return Question.find(match).sort({ questionNumber: 1, _id: 1 });
};

export const inferQuestionTopic = (question = {}) => {
  if (question.isPointDeduction || question.isCritical) return 'critical';

  const rawTopics = [
    question.topic,
    ...(Array.isArray(question.topics) ? question.topics : []),
    question.category,
    question.type,
    question.group,
    question.examFormat
  ].filter(Boolean).join(' ');
  const text = normalizePlainText(rawTopics);

  if (/\bcritical\b|\bdiem liet\b|nghiem trong|mat an toan/.test(text)) return 'critical';
  if (/\brules?\b|quy tac|quy dinh|khai niem|nghiep vu|van tai|toc do|khoang cach/.test(text)) return 'rules';
  if (/\bculture\b|van hoa|dao duc|pccc|phong chay|cuu ho|cuu nan/.test(text)) return 'culture';
  if (/\btechnique\b|ky thuat|lai xe|xu ly xe|thao tac/.test(text)) return 'technique';
  if (/\bconstruction\b|cau tao|sua chua|bao duong/.test(text)) return 'construction';
  if (/\bsigns?\b|bien bao|bao hieu|vach ke|hieu lenh/.test(text)) return 'signs';
  if (/\bsituations?\b|sa hinh|tinh huong|the sa|giao nhau/.test(text)) return 'situations';

  const number = Number(question.questionNumber || question.sourceQuestionId);
  if (Number.isFinite(number)) {
    if (number <= 166) return 'rules';
    if (number <= 192) return 'culture';
    if (number <= 248) return 'technique';
    if (number <= 283) return 'construction';
    if (number <= 465) return 'signs';
    if (number <= 600) return 'situations';
  }

  return null;
};

const toPublicQuestion = (question) => {
  const plain = question.toObject ? question.toObject() : question;
  const isMultipleChoice = normalizeAnswer(plain.correctAnswer).length > 1;
  const topic = inferQuestionTopic(plain);
  delete plain.correctAnswer;
  delete plain.explanation;
  delete plain.references;
  return {
    ...plain,
    topic,
    isCritical: Boolean(plain.isPointDeduction),
    isMultipleChoice
  };
};

const publicQuestions = async (questionIds) => (
  Question.find({ _id: { $in: questionIds } })
    .then((items) => {
      const order = new Map(questionIds.map((id, index) => [String(id), index]));
      return items.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id))).map(toPublicQuestion);
    })
);

const getQuestionKey = (question) => String(question._id || question.id || question.questionHash || question.sourceKey);

const questionBelongsToLicense = (question, licenseType) => {
  const normalized = String(licenseType || 'A1').toUpperCase();
  if ((question.licenseTypes || []).some((item) => licenseAliases(normalized).includes(String(item).toUpperCase()))) {
    return true;
  }

  if (normalized === 'B1') {
    const number = Number(question.questionNumber || question.sourceQuestionId);
    return Number.isFinite(number) && number >= 1 && number <= 600 && (question.sourceTypes || []).includes('all');
  }

  return false;
};

const groupQuestionsByTopic = (questions = []) => {
  const grouped = new Map(EXAM_TOPIC_KEYS.map((topic) => [topic, []]));

  for (const question of questions) {
    const topic = inferQuestionTopic(question);
    if (topic && grouped.has(topic)) {
      grouped.get(topic).push(question);
    }
  }

  return grouped;
};

const takeQuestions = ({ grouped, topics, count, usedIds, licenseType, setIndex = 0, random = true }) => {
  const pool = topics
    .flatMap((topic) => grouped.get(topic) || [])
    .filter((question) => !usedIds.has(getQuestionKey(question)));
  const orderedPool = random ? shuffle(pool) : pool;

  if (orderedPool.length < count) {
    throw new Error(`${licenseType}: topic ${topics.join('+')} thiếu câu. Cần ${count}, hiện có ${orderedPool.length}.`);
  }

  const offset = random ? 0 : (setIndex * count) % orderedPool.length;
  const rotated = [...orderedPool.slice(offset), ...orderedPool.slice(0, offset)];
  const selected = rotated.slice(0, count);
  selected.forEach((question) => usedIds.add(getQuestionKey(question)));
  return selected;
};

const selectQuestionsByQuota = ({ questions, config, setIndex = 0, random = true }) => {
  const grouped = groupQuestionsByTopic(questions);
  const usedIds = new Set();
  const selected = [];

  for (const [topic, count] of Object.entries(config.quota || {})) {
    if (!count) continue;
    const topics = topic === 'techniqueOrConstruction' ? ['technique', 'construction'] : [topic];
    selected.push(...takeQuestions({
      grouped,
      topics,
      count,
      usedIds,
      licenseType: config.licenseType,
      setIndex,
      random
    }));
  }

  return random ? shuffle(selected) : selected;
};

export const validateGeneratedExam = (questions = [], config, { label = 'random exam' } = {}) => {
  const errors = [];
  const idCounts = new Map();
  const topicCounts = new Map(EXAM_TOPIC_KEYS.map((topic) => [topic, 0]));

  for (const question of questions) {
    const id = getQuestionKey(question);
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
    const topic = inferQuestionTopic(question);
    if (topicCounts.has(topic)) topicCounts.set(topic, topicCounts.get(topic) + 1);
    if (!questionBelongsToLicense(question, config.licenseType)) {
      errors.push(`${config.licenseType}: có câu không thuộc hạng ${config.licenseType}. Question ID: ${id}.`);
    }
  }

  if (questions.length !== config.questionCount) {
    errors.push(`${config.licenseType}: ${label} sai tổng số câu. Cần ${config.questionCount}, hiện có ${questions.length}.`);
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) errors.push(`${config.licenseType}: ${label} trùng câu. Question ID: ${id}.`);
  }

  const criticalCount = questions.filter((question) => inferQuestionTopic(question) === 'critical' || question.isPointDeduction).length;
  if (criticalCount !== 1) {
    errors.push(`${config.licenseType}: ${label} có ${criticalCount} câu điểm liệt. Cần 1.`);
  }

  for (const [topic, expected] of Object.entries(config.quota || {})) {
    if (topic === 'techniqueOrConstruction') {
      const received = (topicCounts.get('technique') || 0) + (topicCounts.get('construction') || 0);
      if (received !== expected) {
        errors.push(`${config.licenseType}: topic techniqueOrConstruction sai quota. Cần ${expected}, hiện có ${received}.`);
      }
      continue;
    }

    const received = topic === 'critical' ? criticalCount : (topicCounts.get(topic) || 0);
    if (received !== expected) {
      errors.push(`${config.licenseType}: topic ${topic} (${topicLabels[topic] || topic}) sai quota. Cần ${expected}, hiện có ${received}.`);
    }
  }

  if (errors.length) {
    const error = new Error(errors.join('\n'));
    error.validationErrors = errors;
    throw error;
  }

  return true;
};

export const generateRandomExam = async (licenseType = 'A1') => {
  const config = await getLicenseConfig(licenseType);
  const questions = await getQuestionsForConfig(config);

  if (!questions.length) {
    throw new Error(`${config.licenseType}: không có dữ liệu câu hỏi cho hạng này.`);
  }

  const selected = selectQuestionsByQuota({ questions, config, random: true });
  validateGeneratedExam(selected, config);
  return { config, questions: selected };
};

export const buildA1Exam = async (licenseType = 'A1') => createExamSession({ licenseType, mode: 'random' });

export const getExamSets = async (licenseType = 'A1') => {
  const normalizedLicense = String(licenseType || 'A1').toUpperCase();
  const codePattern = new RegExp(`^${escapeRegex(normalizedLicense)}-SET-(0[1-9]|1[0-9]|20)$`, 'i');
  const sets = await ExamSet.find({ licenseType: normalizedLicense, code: codePattern, isActive: true })
    .sort({ code: 1 })
    .select('code name licenseType questionCount durationMinutes passingScore');

  return {
    data: sets.map((set) => ({
      id: set.code,
      code: set.code,
      name: set.name,
      licenseType: set.licenseType,
      questionCount: set.questionCount,
      durationMinutes: set.durationMinutes,
      passingScore: set.passingScore
    }))
  };
};

export const createExamSession = async ({ licenseType = 'A1', mode = 'random', setId = null, candidate = {}, questionIds = [] } = {}) => {
  const config = await getLicenseConfig(licenseType);
  let selectedIds = [];
  let selectedSet = null;

  if (mode === 'manual' && Array.isArray(questionIds) && questionIds.length) {
    const manualQuestions = await Question.find({
      _id: { $in: questionIds.slice(0, config.questionCount) },
      ...questionMatchForLicense(config.licenseType)
    });
    validateGeneratedExam(manualQuestions, config, { label: 'manual exam' });
    selectedIds = manualQuestions.map((question) => question._id);
  } else if (mode === 'fixed' && setId) {
    selectedSet = await ExamSet.findOne({ code: String(setId).toUpperCase(), licenseType: config.licenseType, isActive: true });
    if (!selectedSet) throw new Error('Exam set not found');
    const fixedQuestions = await Question.find({ _id: { $in: selectedSet.questionIds } });
    const order = new Map(selectedSet.questionIds.map((id, index) => [String(id), index]));
    fixedQuestions.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id)));
    try {
      validateGeneratedExam(fixedQuestions, config, { label: selectedSet.code });
      selectedIds = fixedQuestions.map((question) => question._id);
    } catch (error) {
      const match = selectedSet.code.match(/-SET-(\d{2})$/i);
      const setIndex = Math.max(Number(match?.[1] || 1) - 1, 0);
      const questions = await getQuestionsForConfig(config);
      const repairedQuestions = selectQuestionsByQuota({ questions, config, setIndex, random: false });
      validateGeneratedExam(repairedQuestions, config, { label: selectedSet.code });
      selectedIds = repairedQuestions.map((question) => question._id);
      selectedSet.questionIds = selectedIds;
      selectedSet.questionHashes = repairedQuestions.map((question) => question.questionHash);
      selectedSet.questionCount = config.questionCount;
      selectedSet.durationMinutes = config.durationMinutes;
      selectedSet.passingScore = config.passingScore;
      await selectedSet.save();
    }
  } else {
    const randomExam = await generateRandomExam(config.licenseType);
    selectedIds = randomExam.questions.map((question) => question._id);
  }

  const questions = await publicQuestions(selectedIds);

  return {
    sessionId: crypto.randomUUID(),
    candidate,
    licenseType: config.licenseType,
    license: config.license,
    mode,
    setId: selectedSet?.code || setId || null,
    setName: selectedSet?.name || (mode === 'random' ? 'Ngẫu nhiên' : null),
    durationMinutes: selectedSet?.durationMinutes ?? config.durationMinutes,
    questionCount: selectedSet?.questionCount ?? config.questionCount,
    passingScore: selectedSet?.passingScore ?? config.passingScore,
    totalQuestions: questions.length,
    quota: config.quota,
    questions
  };
};

export const gradeExam = async (answers = [], licenseType = 'A1', candidate = {}, sessionId = null, setId = null) => {
  const config = await getLicenseConfig(licenseType);
  const normalizedAnswers = Array.isArray(answers) ? answers : [];
  const answerMap = new Map(
    normalizedAnswers
      .filter((item) => item?.questionId)
      .map((item) => [
        String(item.questionId),
        item.selectedAnswer ?? item.answer ?? ''
      ])
  );

  const questions = await Question.find({ _id: { $in: [...answerMap.keys()] } });
  const order = new Map([...answerMap.keys()].map((id, index) => [id, index]));
  questions.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id)));

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let hasWrongPointDeduction = false;

  const details = questions.map((question) => {
    const selectedAnswer = answerMap.get(String(question._id));
    const normalizedSelected = normalizeAnswer(selectedAnswer);
    const isAnswered = normalizedSelected.length > 0;
    const isCorrect = isAnswered && isCorrectAnswer(normalizedSelected, question.correctAnswer);
    const isPointDeduction = Boolean(question.isPointDeduction || inferQuestionTopic(question) === 'critical');

    if (!isAnswered) unansweredCount += 1;
    else if (isCorrect) correctCount += 1;
    else wrongCount += 1;

    if (isPointDeduction && !isCorrect) hasWrongPointDeduction = true;

    return {
      questionId: question._id,
      question: question.question,
      options: question.options,
      image: question.image,
      imageUrl: question.imageUrl,
      topic: inferQuestionTopic(question),
      isPointDeduction,
      selectedAnswer: normalizedSelected,
      userAnswer: normalizedSelected,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation
    };
  });

  const totalQuestions = normalizedAnswers.length || questions.length;
  unansweredCount += Math.max(totalQuestions - questions.length, 0);
  const passed = correctCount >= config.passingScore && !hasWrongPointDeduction;

  return {
    sessionId,
    candidate,
    licenseType: config.licenseType,
    setId,
    result: {
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      passingScore: config.passingScore,
      hasWrongPointDeduction,
      hasPointDeductionWrong: hasWrongPointDeduction,
      passed,
      failureReason: hasWrongPointDeduction ? 'Không đạt do sai câu điểm liệt' : '',
      statusText: passed ? 'ĐẠT' : 'KHÔNG ĐẠT'
    },
    passed,
    passScore: config.passingScore,
    totalQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    hasWrongPointDeduction,
    hasPointDeductionWrong: hasWrongPointDeduction,
    details
  };
};

export const seedExamSets = async () => {
  const licenses = await LicenseClass.find({ isActive: true }).sort({ sortOrder: 1 });
  const rows = [];

  for (const license of licenses) {
    const config = await getLicenseConfig(license.code);
    const questions = await getQuestionsForConfig(config);
    if (!questions.length) continue;

    const operations = [];

    for (let index = 1; index <= 20; index += 1) {
      const selected = selectQuestionsByQuota({ questions, config, setIndex: index - 1, random: false });
      validateGeneratedExam(selected, config, { label: `fixed set #${index}` });
      const code = `${license.code}-SET-${String(index).padStart(2, '0')}`.toUpperCase();

      operations.push({
        updateOne: {
          filter: { code },
          update: {
            $set: {
              code,
              name: `Bộ đề cố định ${String(index).padStart(2, '0')}`,
              licenseType: license.code,
              questionIds: selected.map((question) => question._id),
              questionHashes: selected.map((question) => question.questionHash),
              questionCount: config.questionCount,
              durationMinutes: config.durationMinutes,
              passingScore: config.passingScore,
              isActive: true,
              isRandomGenerated: false
            }
          },
          upsert: true
        }
      });
    }

    const result = operations.length ? await ExamSet.bulkWrite(operations, { ordered: false }) : { upsertedCount: 0, modifiedCount: 0 };
    rows.push({
      licenseType: license.code,
      sourceQuestions: questions.length,
      sets: operations.length,
      upserted: result.upsertedCount || 0,
      modified: result.modifiedCount || 0
    });
  }

  return rows;
};

export { publicProject as publicQuestionFields };
