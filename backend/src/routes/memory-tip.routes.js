import { Router } from 'express';
import {
  createMemoryTip,
  deleteMemoryTip,
  getMemoryTips,
  updateMemoryTip
} from '../controllers/memory-tip.controller.js';
import { adminOnly, writeLimiter } from '../middleware/security.middleware.js';
import {
  memoryTipBody,
  memoryTipQuery,
  memoryTipUpdateBody,
  mongoIdParam
} from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', memoryTipQuery, getMemoryTips);
router.post('/', writeLimiter, adminOnly, memoryTipBody, createMemoryTip);
router.put('/:id', writeLimiter, adminOnly, mongoIdParam('id'), memoryTipUpdateBody, updateMemoryTip);
router.delete('/:id', writeLimiter, adminOnly, mongoIdParam('id'), deleteMemoryTip);

export default router;
