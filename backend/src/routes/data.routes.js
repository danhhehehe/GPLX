import { Router } from 'express';
import {
  getHealth,
  refreshQuestions,
  refreshTrafficSigns,
  refreshLicenses,
  refreshAll,
  getQuestionsForApi,
  getTrafficSignsForApi,
  getLicensesForApi,
  remoteHealth
} from '../controllers/data.controller.js';
import { adminOnly, writeLimiter } from '../middleware/security.middleware.js';
import { paginationQuery, trafficQuery } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/health', getHealth);
router.get('/remote-health', remoteHealth);

router.get('/questions', paginationQuery, getQuestionsForApi);
router.get('/traffic-signs', trafficQuery, getTrafficSignsForApi);
router.get('/licenses', getLicensesForApi);

router.post('/refresh/questions', writeLimiter, adminOnly, refreshQuestions);
router.post('/refresh/licenses', writeLimiter, adminOnly, refreshLicenses);
router.post('/refresh/traffic-signs', writeLimiter, adminOnly, refreshTrafficSigns);
router.post('/refresh/all', writeLimiter, adminOnly, refreshAll);

export default router;
