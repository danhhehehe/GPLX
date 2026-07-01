import axios from 'axios';
import Question from '../models/Question.js';
import { fixDuplicateQuestions } from './question-dedupe.service.js';
import { createQuestionHash, normalizeText, uniqueArray } from '../utils/question-dedupe.js';

const SOURCE_BASE_URL = 'https://onthigplx.edu.vn';
const DEFAULT_A1_URL = 'https://onthigplx.edu.vn/data/a-a1-questions/a-a1-questions.json';
const DEFAULT_ALL_URL = 'https://onthigplx.edu.vn/data/questions/all-questions.json';

export const normalizeImageUrl = (image) => {
  if (!image) return null;
  const value = String(image).trim();
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return `${SOURCE_BASE_URL}/${value.replace(/^\/+/, '')}`;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const pickQuestionList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.questions)) return payload.questions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeOptions = (raw = {}) => {
  const options = raw.options || raw.answers || {};
  if (Array.isArray(options)) {
    return {
      a: options[0]?.text || options[0] || '',
      b: options[1]?.text || options[1] || '',
      c: options[2]?.text || options[2] || '',
      d: options[3]?.text || options[3] || ''
    };
  }

  return {
    a: options.a || options.A || raw.optionA || raw.answerA || '',
    b: options.b || options.B || raw.optionB || raw.answerB || '',
    c: options.c || options.C || raw.optionC || raw.answerC || '',
    d: options.d || options.D || raw.optionD || raw.answerD || ''
  };
};

const normalizeCorrectAnswer = (raw) => {
  const value = raw.correctAnswer || raw.answer || raw.correct || raw.correct_answer || '';
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (typeof value === 'number') return ['a', 'b', 'c', 'd'][value - 1] || '';
  if (/^[1-4]$/.test(String(value).trim())) return ['a', 'b', 'c', 'd'][Number(value) - 1];
  return String(value).trim().toLowerCase().replace(/[^a-d,|;/]/g, '');
};

const getSourceQuestionId = (raw, questionNumber, question) => (
  String(raw.id ?? raw.questionId ?? raw.questionNumber ?? raw.no ?? questionNumber ?? normalizeText(question))
);

export const normalizeQuestion = (raw, sourceType) => {
  const id = Number(raw.id ?? raw.questionId ?? raw.questionNumber);
  const questionNumber = Number(raw.questionNumber ?? raw.number ?? raw.no ?? id);
  const image = raw.image || raw.imagePath || raw.image_url || null;
  const imageUrl = normalizeImageUrl(raw.imageUrl || image);
  const question = raw.question || raw.content || raw.title || raw.text || '';
  const correctAnswer = normalizeCorrectAnswer(raw);
  const sourceQuestionId = getSourceQuestionId(raw, Number.isFinite(questionNumber) ? questionNumber : undefined, question);

  if (!question || !correctAnswer || (Array.isArray(correctAnswer) && !correctAnswer.length)) {
    return null;
  }

  if ((raw.hasImage === true || raw.hasImage === 'true') && !imageUrl) {
    console.warn(`[seed] Question ${sourceType}:${sourceQuestionId} hasImage=true but image is missing.`);
  }

  const normalized = {
    sourceType,
    sourceTypes: [sourceType],
    sourceQuestionId,
    sourceKey: `${sourceType}:${sourceQuestionId}`,
    questionNumber: Number.isFinite(questionNumber) ? questionNumber : undefined,
    category: raw.category || raw.chapter || raw.group || 'Chưa phân loại',
    licenseTypes: uniqueArray(raw.licenseTypes, raw.licenses, raw.license, raw.type),
    isPointDeduction: Boolean(raw.isPointDeduction ?? raw.pointDeduction ?? raw.isDanger ?? raw.required),
    examFormat: raw.examFormat || raw.format || '',
    question,
    normalizedQuestion: normalizeText(question),
    hasImage: Boolean(raw.hasImage ?? imageUrl),
    image,
    imageUrl,
    options: normalizeOptions(raw),
    correctAnswer,
    explanation: raw.explanation || raw.explain || raw.note || '',
    references: toArray(raw.references || raw.reference),
    difficulty: raw.difficulty || '',
    topics: toArray(raw.topics || raw.topic)
  };

  normalized.questionHash = createQuestionHash(normalized);
  return normalized;
};

const fetchSource = async (url, sourceType) => {
  try {
    const response = await axios.get(url, { timeout: 30000 });
    const items = pickQuestionList(response.data)
      .map((item) => normalizeQuestion(item, sourceType))
      .filter(Boolean);

    if (!items.length) {
      throw new Error(`No valid questions found from ${url}`);
    }

    return items;
  } catch (error) {
    throw new Error(`Cannot import ${sourceType} source: ${error.message}`);
  }
};

const mergeByHash = (questions) => {
  const merged = new Map();

  for (const question of questions) {
    const current = merged.get(question.questionHash);
    if (!current) {
      merged.set(question.questionHash, { ...question });
      continue;
    }

    merged.set(question.questionHash, {
      ...current,
      questionNumber: current.questionNumber ?? question.questionNumber,
      sourceQuestionId: current.sourceQuestionId || question.sourceQuestionId,
      sourceKey: current.sourceKey || question.sourceKey,
      sourceType: current.sourceType || question.sourceType,
      sourceTypes: uniqueArray(current.sourceTypes, question.sourceTypes),
      licenseTypes: uniqueArray(current.licenseTypes, question.licenseTypes),
      topics: uniqueArray(current.topics, question.topics),
      references: uniqueArray(current.references, question.references),
      isPointDeduction: current.isPointDeduction || question.isPointDeduction,
      image: current.image || question.image,
      imageUrl: current.imageUrl || question.imageUrl,
      hasImage: current.hasImage || question.hasImage || Boolean(current.imageUrl || question.imageUrl),
      explanation: current.explanation || question.explanation,
      category: current.category || question.category,
      examFormat: current.examFormat || question.examFormat
    });
  }

  return [...merged.values()];
};

const upsertQuestions = async (questions) => {
  const operations = questions.map((question) => ({
    updateOne: {
      filter: { questionHash: question.questionHash },
      update: {
        $set: {
          questionNumber: question.questionNumber,
          sourceQuestionId: question.sourceQuestionId,
          sourceKey: question.sourceKey,
          sourceType: question.sourceType,
          question: question.question,
          normalizedQuestion: question.normalizedQuestion,
          questionHash: question.questionHash,
          category: question.category,
          examFormat: question.examFormat,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          image: question.image,
          imageUrl: question.imageUrl,
          hasImage: question.hasImage,
          difficulty: question.difficulty
        },
        $addToSet: {
          sourceTypes: { $each: question.sourceTypes },
          licenseTypes: { $each: question.licenseTypes || [] },
          topics: { $each: question.topics || [] },
          references: { $each: question.references || [] }
        },
        $max: {
          isPointDeduction: question.isPointDeduction
        }
      },
      upsert: true
    }
  }));

  if (!operations.length) return { upsertedCount: 0, modifiedCount: 0 };
  return Question.bulkWrite(operations, { ordered: false });
};

export const seedQuestions = async () => {
  await fixDuplicateQuestions({ ensureUniqueIndex: false });

  const sources = [
    { sourceType: 'a1', url: process.env.SOURCE_A1_URL || DEFAULT_A1_URL },
    { sourceType: 'all', url: process.env.SOURCE_ALL_URL || DEFAULT_ALL_URL }
  ];

  const sourcesSummary = [];
  const allQuestions = [];

  for (const source of sources) {
    const questions = await fetchSource(source.url, source.sourceType);
    allQuestions.push(...questions);
    sourcesSummary.push({
      sourceType: source.sourceType,
      fetched: questions.length,
      uniqueInSource: mergeByHash(questions).length,
      withImages: questions.filter((question) => question.hasImage || question.imageUrl).length,
      pointDeduction: questions.filter((question) => question.isPointDeduction).length
    });
  }

  const normalizedQuestions = mergeByHash(allQuestions);
  const writeResult = await upsertQuestions(normalizedQuestions);
  await fixDuplicateQuestions();

  const [totalSaved, totalWithImages, totalPointDeduction] = await Promise.all([
    Question.countDocuments(),
    Question.countDocuments({ $or: [{ hasImage: true }, { imageUrl: { $nin: [null, ''] } }] }),
    Question.countDocuments({ isPointDeduction: true })
  ]);

  return {
    sources: sourcesSummary,
    summary: {
      totalFetched: allQuestions.length,
      totalUniqueFetched: normalizedQuestions.length,
      upserted: writeResult.upsertedCount || 0,
      modified: writeResult.modifiedCount || 0,
      totalWithImages,
      totalPointDeduction,
      totalSaved
    }
  };
};
