import { asyncHandler } from '../middleware/error.middleware.js';
import { buildA1Exam, createExamSession, getExamSets, gradeExam } from '../services/exam.service.js';

export const getExamSetsController = asyncHandler(async (req, res) => {
  const payload = await getExamSets(req.query.licenseType || 'A1');
  res.json(payload);
});

export const createExamSessionController = asyncHandler(async (req, res) => {
  const payload = await createExamSession(req.body);
  res.json(payload);
});

export const getA1Exam = asyncHandler(async (req, res) => {
  const exam = await buildA1Exam(req.params.licenseType || 'A1');
  res.json(exam);
});

export const submitExam = asyncHandler(async (req, res) => {
  const result = await gradeExam(
    req.body.answers,
    req.body.licenseType,
    req.body.candidate,
    req.body.sessionId,
    req.body.setId
  );
  res.json(result);
});
