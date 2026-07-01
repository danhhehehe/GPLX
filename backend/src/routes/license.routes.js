import { Router } from 'express';
import {
  getLicenseByCode,
  getLicenses,
  getLicenseStatistics,
  refreshLicenses
} from '../controllers/license.controller.js';
import { adminOnly, writeLimiter } from '../middleware/security.middleware.js';
import { licenseCodeParam } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', getLicenses);
router.get('/statistics', getLicenseStatistics);
router.post('/refresh', writeLimiter, adminOnly, refreshLicenses);
router.get('/:code', licenseCodeParam('code'), getLicenseByCode);

export default router;
