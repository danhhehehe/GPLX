import crypto from 'crypto';
import Question from '../models/Question.js';
import LicenseClass from '../models/LicenseClass.js';
import ExamSet from '../models/ExamSet.js';
import { isCorrectAnswer, normalizeAnswer } from '../utils/question-dedupe.js';

const publicProject = { correctAnswer: 0, explanation: 0, references: 0 };

const DEFAULT_EXAM_CONFIG = {
  A1: { questionCount: 25, durationMinutes: 19, passingScore: 21 },
  A: { questionCount: 25, durationMinutes: 19, passingScore: 23 },
  B: { questionCount: 30, durationMinutes: 20, passingScore: 27 },
  C1: { questionCount: 35, durationMinutes: 22, passingScore: 32 },
  C: { questionCount: 40, durationMinutes: 24, passingScore: 36 },
  D: { questionCount: 45, durationMinutes: 26, passingScore: 41 }
};

const getLicenseConfig = async (licenseType = 'A1') => {
  const normalizedLicense = String(licenseType || 'A1').toUpperCase();
  const license = await LicenseClass.findOne({ code: normalizedLicense, isActive: true });

  const defaults = DEFAULT_EXAM_CONFIG[normalizedLicense] || DEFAULT_EXAM_CONFIG.A1;

  return {
    licenseType: normalizedLicense,
    license,
    questionCount: Number(license?.questionCount ?? defaults.questionCount),
    passingScore: Number(license?.passingScore ?? defaults.passingScore),
    durationMinutes: Number(license?.durationMinutes ?? defaults.durationMinutes)
  };
};

const questionMatchForLicense = (licenseType) => ({
  licenseTypes: new RegExp(`^${licenseType}$`, 'i')
});

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const toPublicQuestion = (question) => {
  const plain = question.toObject ? question.toObject() : question;
  const isMultipleChoice = normalizeAnswer(plain.correctAnswer).length > 1;
  delete plain.correctAnswer;
  delete plain.explanation;
  delete plain.references;
  return { ...plain, isMultipleChoice };
};

const publicQuestions = async (questionIds) => (
  Question.find({ _id: { $in: questionIds } })
    .then((items) => {
      const order = new Map(questionIds.map((id, index) => [String(id), index]));
      return items.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id))).map(toPublicQuestion);
    })
);

export const buildA1Exam = async (licenseType = 'A1') => createExamSession({ licenseType, mode: 'random' });

export const getExamSets = async (licenseType = 'A1') => {
  const normalizedLicense = String(licenseType || 'A1').toUpperCase();
  const codePattern = new RegExp(`^${normalizedLicense}-SET-(0[1-9]|1[0-9]|20)$`, 'i');
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
    selectedIds = questionIds.slice(0, config.questionCount);
  } else if (mode === 'fixed' && setId) {
    selectedSet = await ExamSet.findOne({ code: String(setId).toUpperCase(), licenseType: config.licenseType, isActive: true });
    if (!selectedSet) throw new Error('Exam set not found');
    selectedIds = selectedSet.questionIds;
  } else {
    const match = questionMatchForLicense(config.licenseType);
    const pointDeduction = await Question.aggregate([
      { $match: { ...match, isPointDeduction: true } },
      { $sample: { size: 1 } },
      { $project: { _id: 1 } }
    ]);
    const selectedPointIds = pointDeduction.map((question) => question._id);
    const randomQuestions = await Question.aggregate([
      { $match: { ...match, _id: { $nin: selectedPointIds } } },
      { $sample: { size: Math.max(config.questionCount - selectedPointIds.length, 0) } },
      { $project: { _id: 1 } }
    ]);
    selectedIds = shuffle([...selectedPointIds, ...randomQuestions.map((question) => question._id)]);
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

    if (!isAnswered) unansweredCount += 1;
    else if (isCorrect) correctCount += 1;
    else wrongCount += 1;

    if (question.isPointDeduction && !isCorrect) hasWrongPointDeduction = true;

    return {
      questionId: question._id,
      question: question.question,
      options: question.options,
      image: question.image,
      imageUrl: question.imageUrl,
      isPointDeduction: question.isPointDeduction,
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
      statusText: passed ? 'ĐẬU' : 'RỚT'
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
    const questionCount = Number(license.questionCount || process.env.A1_EXAM_QUESTION_COUNT || 25);
    const questions = await Question.find(questionMatchForLicense(license.code)).sort({ questionNumber: 1, _id: 1 });
    if (!questions.length) continue;

    const pointQuestions = questions.filter((question) => question.isPointDeduction);
    const normalQuestions = questions.filter((question) => !question.isPointDeduction);
    const operations = [];

    for (let index = 1; index <= 20; index += 1) {
      const point = pointQuestions.length ? [pointQuestions[(index - 1) % pointQuestions.length]] : [];
      const requiredNormal = Math.max(questionCount - point.length, 0);
      const offset = requiredNormal > 0 ? ((index - 1) * requiredNormal) % Math.max(normalQuestions.length, 1) : 0;
      const rotated = requiredNormal > 0 ? [...normalQuestions.slice(offset), ...normalQuestions.slice(0, offset)] : [];
      const selected = [...point, ...rotated].slice(0, questionCount);
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
              questionCount: selected.length,
              durationMinutes: Number(license.durationMinutes || process.env.A1_EXAM_DURATION_MINUTES || 19),
              passingScore: Number(license.passingScore || process.env.A1_EXAM_PASS_SCORE || 21),
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
