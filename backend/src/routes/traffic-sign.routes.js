import { Router } from 'express';
import {
  getTrafficSignByCode,
  getTrafficSignGroups,
  getTrafficSignStatistics,
  getTrafficSigns,
  getTrafficSignsByGroup
} from '../controllers/traffic-sign.controller.js';
import {
  safeCodeParam,
  safeSlugParam,
  trafficQuery
} from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', trafficQuery, getTrafficSigns);
router.get('/groups', getTrafficSignGroups);
router.get('/statistics', getTrafficSignStatistics);
router.get('/group/:group', safeSlugParam('group'), getTrafficSignsByGroup);
router.get('/:code', safeCodeParam('code'), getTrafficSignByCode);

export default router;
