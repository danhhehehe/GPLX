import { Router } from 'express';
import {
  getA1Questions,
  getAllQuestions,
  getCategories,
  getImageCheck,
  getPointDeductionQuestions,
  getQuestionStatistics,
  getQuestionById,
  getQuestionsNoImages,
  getQuestions,
  getQuestionsWithImages,
  getQuestionsByLicense
} from '../controllers/question.controller.js';
import {
  licenseParam,
  paginationQuery,
  questionIdParam
} from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', paginationQuery, getQuestions);
router.get('/a1', paginationQuery, getA1Questions);
router.get('/all', paginationQuery, getAllQuestions);
router.get('/license/:type', licenseParam('type'), paginationQuery, getQuestionsByLicense);
router.get('/categories', getCategories);
router.get('/point-deduction', paginationQuery, getPointDeductionQuestions);
router.get('/with-images', paginationQuery, getQuestionsWithImages);
router.get('/no-images', paginationQuery, getQuestionsNoImages);
router.get('/image-check', getImageCheck);
router.get('/statistics', getQuestionStatistics);
router.get('/:id', questionIdParam, getQuestionById);

export default router;
