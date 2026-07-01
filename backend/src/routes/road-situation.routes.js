import { Router } from 'express';
import {
  createRoadSituation,
  deleteRoadSituation,
  getRoadSituations,
  updateRoadSituation
} from '../controllers/road-situation.controller.js';
import { adminOnly, writeLimiter } from '../middleware/security.middleware.js';
import {
  mongoIdParam,
  roadSituationBody,
  roadSituationQuery,
  roadSituationUpdateBody
} from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', roadSituationQuery, getRoadSituations);
router.post('/', writeLimiter, adminOnly, roadSituationBody, createRoadSituation);
router.put('/:id', writeLimiter, adminOnly, mongoIdParam('id'), roadSituationUpdateBody, updateRoadSituation);
router.delete('/:id', writeLimiter, adminOnly, mongoIdParam('id'), deleteRoadSituation);

export default router;
