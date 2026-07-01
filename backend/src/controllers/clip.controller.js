import { asyncHandler } from '../middleware/error.middleware.js';
import { getClips, incrementClipView } from '../services/clip.service.js';

const VIEW_WINDOW_MS = 30 * 60 * 1000;
const recentViews = new Map();

const getViewerKey = (req) => [
  req.params.id,
  req.ip,
  req.get('user-agent') || ''
].join('|');

const cleanupRecentViews = (now) => {
  for (const [key, timestamp] of recentViews.entries()) {
    if (now - timestamp > VIEW_WINDOW_MS) recentViews.delete(key);
  }
};

export const getTrafficSafetyClips = asyncHandler(async (req, res) => {
  const { featured, data } = await getClips();

  res.json({
    success: true,
    featured,
    data
  });
});

export const recordClipView = asyncHandler(async (req, res) => {
  const now = Date.now();
  const key = getViewerKey(req);
  const lastViewedAt = recentViews.get(key);

  cleanupRecentViews(now);

  if (lastViewedAt && now - lastViewedAt < VIEW_WINDOW_MS) {
    return res.json({
      success: true,
      counted: false,
      message: 'View was already counted recently.'
    });
  }

  const result = await incrementClipView(req.params.id);

  if (!result) {
    res.status(404);
    throw new Error('Clip not found');
  }

  recentViews.set(key, now);

  return res.json({
    success: true,
    counted: true,
    data: result
  });
});
