import { Router } from 'express';
import {
  getWrongQuestions,
  removeFixedQuestion,
  saveWrongAnswer
} from '../controllers/wrong-answer.controller.js';
import { writeLimiter } from '../middleware/security.middleware.js';
import {
  mongoIdParam,
  saveWrongAnswerBody,
  wrongAnswerQuery
} from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', wrongAnswerQuery, getWrongQuestions);
router.post('/', writeLimiter, saveWrongAnswerBody, saveWrongAnswer);
router.delete('/:id', writeLimiter, mongoIdParam('id'), removeFixedQuestion);

export default router;
