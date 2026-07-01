import { Router } from 'express';
import { getTrafficSafetyClips, recordClipView } from '../controllers/clip.controller.js';

const router = Router();

router.get('/', getTrafficSafetyClips);
router.post('/:id/view', recordClipView);

export default router;
