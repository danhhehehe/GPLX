export const notFound = (req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const safeMessage = statusCode >= 500 && isProduction
    ? 'Server error'
    : err.message || 'Server error';

  const payload = {
    success: false,
    message: safeMessage
  };

  if (!isProduction && err.errors) {
    payload.errors = err.errors;
  }

  if (!isProduction) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
