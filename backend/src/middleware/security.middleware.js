import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const RATE_LIMIT_MESSAGE = 'Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.';

const rateLimitMessage = {
  success: false,
  message: RATE_LIMIT_MESSAGE
};

export const readLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: (req) => req.method !== 'GET'
});

export const apiWriteLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: (req) => req.method === 'GET'
});

export const writeLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: (req) => req.method === 'GET'
});

export const examCreateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage
});

export const examSubmitLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage
});

export const adminOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && !process.env.ADMIN_API_KEY) {
    return next();
  }

  const expectedKey = process.env.ADMIN_API_KEY;
  const providedKey = req.get('x-admin-key');

  if (expectedKey && providedKey === expectedKey) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'This action is not allowed.'
  });
};
