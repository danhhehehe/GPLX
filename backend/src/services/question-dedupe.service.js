import Question from '../models/Question.js';
import { createQuestionHash, normalizeText, uniqueArray } from '../utils/question-dedupe.js';

const toPlain = (doc) => (typeof doc.toObject === 'function' ? doc.toObject() : doc);

export const enrichQuestionForHash = (question) => {
  const plain = toPlain(question);
  const normalizedQuestion = plain.normalizedQuestion || normalizeText(plain.question);
  const questionHash = plain.questionHash || createQuestionHash({ ...plain, normalizedQuestion });
  const sourceTypes = uniqueArray(plain.sourceTypes, plain.sourceType);

  return {
    ...plain,
    normalizedQuestion,
    questionHash,
    sourceTypes,
    sourceType: plain.sourceType || sourceTypes[0],
    sourceKey: plain.sourceKey || `${plain.sourceType || sourceTypes[0] || 'source'}:${plain.sourceQuestionId || questionHash}`,
    hasImage: Boolean(plain.hasImage || plain.imageUrl || plain.image)
  };
};

const pickBest = (items) => (
  [...items].sort((a, b) => {
    const score = (item) => (
      (item.sourceTypes?.includes('a1') ? 8 : 0)
      + (item.imageUrl ? 4 : 0)
      + (item.explanation ? 2 : 0)
      + (item.isPointDeduction ? 1 : 0)
    );
    return score(b) - score(a);
  })[0]
);

const mergeQuestions = (items) => {
  const enriched = items.map(enrichQuestionForHash);
  const best = pickBest(enriched);

  return {
    _id: best._id,
    questionNumber: best.questionNumber,
    sourceQuestionId: best.sourceQuestionId,
    sourceKey: best.sourceKey,
    sourceType: best.sourceType,
    sourceTypes: uniqueArray(enriched.map((item) => item.sourceTypes)),
    question: best.question,
    normalizedQuestion: best.normalizedQuestion,
    questionHash: best.questionHash,
    category: best.category || 'Chưa phân loại',
    licenseTypes: uniqueArray(enriched.map((item) => item.licenseTypes)),
    isPointDeduction: enriched.some((item) => item.isPointDeduction),
    examFormat: best.examFormat || '',
    options: best.options || {},
    correctAnswer: best.correctAnswer,
    explanation: best.explanation || enriched.find((item) => item.explanation)?.explanation || '',
    references: uniqueArray(enriched.map((item) => item.references)),
    difficulty: best.difficulty || '',
    topics: uniqueArray(enriched.map((item) => item.topics)),
    image: best.image || enriched.find((item) => item.image)?.image || null,
    imageUrl: best.imageUrl || enriched.find((item) => item.imageUrl)?.imageUrl || null,
    hasImage: enriched.some((item) => item.hasImage || item.imageUrl || item.image)
  };
};

export const fixDuplicateQuestions = async ({ ensureUniqueIndex = true } = {}) => {
  await Question.collection.dropIndex('questionHash_1').catch(() => {});

  const before = await Question.countDocuments();
  const questions = await Question.find({});
  const groups = new Map();

  for (const question of questions) {
    const enriched = enrichQuestionForHash(question);
    if (!groups.has(enriched.questionHash)) groups.set(enriched.questionHash, []);
    groups.get(enriched.questionHash).push(enriched);
  }

  let duplicateGroups = 0;
  let deleted = 0;

  for (const group of groups.values()) {
    const merged = mergeQuestions(group);
    const ids = group.map((item) => item._id);
    const removeIds = ids.filter((id) => String(id) !== String(merged._id));

    if (group.length > 1) duplicateGroups += 1;

    await Question.updateOne(
      { _id: merged._id },
      {
        $set: {
          questionNumber: merged.questionNumber,
          sourceQuestionId: merged.sourceQuestionId,
          sourceKey: merged.sourceKey,
          sourceType: merged.sourceType,
          sourceTypes: merged.sourceTypes,
          question: merged.question,
          normalizedQuestion: merged.normalizedQuestion,
          questionHash: merged.questionHash,
          category: merged.category,
          licenseTypes: merged.licenseTypes,
          isPointDeduction: merged.isPointDeduction,
          examFormat: merged.examFormat,
          options: merged.options,
          correctAnswer: merged.correctAnswer,
          explanation: merged.explanation,
          references: merged.references,
          difficulty: merged.difficulty,
          topics: merged.topics,
          image: merged.image,
          imageUrl: merged.imageUrl,
          hasImage: merged.hasImage
        }
      }
    );

    if (removeIds.length) {
      const result = await Question.deleteMany({ _id: { $in: removeIds } });
      deleted += result.deletedCount || 0;
    }
  }

  if (ensureUniqueIndex) {
    await Question.collection.createIndex({ questionHash: 1 }, { unique: true });
  }

  const after = await Question.countDocuments();

  return {
    before,
    duplicateGroups,
    deleted,
    after
  };
};
