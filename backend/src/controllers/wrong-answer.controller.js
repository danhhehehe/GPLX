import Question from '../models/Question.js';
import WrongAnswerHistory from '../models/WrongAnswerHistory.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export const getWrongQuestions = asyncHandler(async (req, res) => {
  const filter = { fixedAt: null };
  if (req.query.licenseType) filter.licenseType = String(req.query.licenseType).toUpperCase();

  const rows = await WrongAnswerHistory.find(filter)
    .populate('question')
    .sort({ lastWrongAt: -1, updatedAt: -1 })
    .limit(Math.min(Number(req.query.limit || 200), 500));

  res.json({
    data: rows.filter((row) => row.question)
  });
});

export const saveWrongAnswer = asyncHandler(async (req, res) => {
  const questionId = req.body.questionId || req.body.question;
  if (!questionId) {
    res.status(400);
    throw new Error('questionId is required');
  }

  const question = await Question.findById(questionId);
  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  const licenseType = String(req.body.licenseType || question.licenseTypes?.[0] || '').toUpperCase();
  const row = await WrongAnswerHistory.findOneAndUpdate(
    { question: question._id, licenseType },
    {
      $set: {
        questionHash: question.questionHash,
        selectedAnswer: req.body.selectedAnswer ?? req.body.answer ?? [],
        correctAnswer: question.correctAnswer,
        fixedAt: null,
        lastWrongAt: new Date()
      },
      $inc: { attemptCount: 1 }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('question');

  res.status(201).json(row);
});

export const removeFixedQuestion = asyncHandler(async (req, res) => {
  const row = await WrongAnswerHistory.findByIdAndDelete(req.params.id);
  if (!row) {
    res.status(404);
    throw new Error('Wrong answer history not found');
  }
  res.json({ deleted: true, id: req.params.id });
});
