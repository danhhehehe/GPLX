import { Router } from 'express';
import {
  createExamSessionController,
  getA1Exam,
  getExamSetsController,
  submitExam
} from '../controllers/exam.controller.js';
import { examCreateLimiter, examSubmitLimiter } from '../middleware/security.middleware.js';
import {
  examCreateBody,
  examSubmitBody,
  licenseParam,
  paginationQuery
} from '../middleware/validation.middleware.js';

const router = Router();

router.get('/sets', paginationQuery, getExamSetsController);
router.post('/create', examCreateLimiter, examCreateBody, createExamSessionController);
router.post('/submit', examSubmitLimiter, examSubmitBody, submitExam);
router.get('/a1', getA1Exam);
router.get('/:licenseType', licenseParam('licenseType'), getA1Exam);

export default router;
