import { body, param, query, validationResult } from 'express-validator';

const LICENSE_CODES = [
  'A1', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D2', 'D',
  'BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'
];

const SAFE_TEXT = /^[\p{L}\p{N}\s.,:;!?()/_\-+&'"%#]+$/u;

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Invalid request data.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg
    }))
  });
};

export const mongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage(`${name} must be a valid ObjectId`),
  validateRequest
];

export const licenseParam = (name = 'licenseType') => [
  param(name).trim().toUpperCase().isIn(LICENSE_CODES).withMessage(`${name} is not supported`),
  validateRequest
];

export const licenseCodeParam = (name = 'code') => [
  param(name).trim().toUpperCase().isIn(LICENSE_CODES).withMessage(`${name} is not supported`),
  validateRequest
];

export const questionIdParam = [
  param('id')
    .trim()
    .isLength({ min: 1, max: 128 })
    .matches(/^[a-zA-Z0-9:_-]+$/)
    .withMessage('id is invalid'),
  validateRequest
];

export const safeCodeParam = (name = 'code') => [
  param(name)
    .trim()
    .isLength({ min: 1, max: 64 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(`${name} is invalid`),
  validateRequest
];

export const safeSlugParam = (name = 'group') => [
  param(name)
    .trim()
    .isLength({ min: 1, max: 120 })
    .matches(SAFE_TEXT)
    .withMessage(`${name} is invalid`),
  validateRequest
];

export const paginationQuery = [
  query('page').optional().isInt({ min: 1, max: 100000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('keyword').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('search').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('category').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('licenseType').optional().trim().toUpperCase().isIn(LICENSE_CODES),
  query('isPointDeduction').optional().isBoolean(),
  query('pointDeduction').optional().isBoolean(),
  query('mode').optional().isIn(['exam', 'practice']),
  validateRequest
];

export const trafficQuery = [
  query('page').optional().isInt({ min: 1, max: 100000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('keyword').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('search').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('group').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('groupSlug').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  validateRequest
];

export const wrongAnswerQuery = [
  query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
  query('licenseType').optional().trim().toUpperCase().isIn(LICENSE_CODES),
  validateRequest
];

export const saveWrongAnswerBody = [
  body('questionId').optional().isMongoId(),
  body('question').optional().isMongoId(),
  body('licenseType').optional().trim().toUpperCase().isIn(LICENSE_CODES),
  body('selectedAnswer').optional(),
  body('answer').optional(),
  validateRequest
];

export const examCreateBody = [
  body('licenseType').optional().trim().toUpperCase().isIn(LICENSE_CODES),
  body('mode').optional().isIn(['random', 'fixed', 'manual']),
  body('setId').optional({ values: 'falsy' }).trim().isLength({ max: 80 }).matches(/^[a-zA-Z0-9_-]+$/),
  validateRequest
];

export const examSubmitBody = [
  body('answers').isArray({ max: 100 }).withMessage('answers must be an array'),
  body('licenseType').optional().trim().toUpperCase().isIn(LICENSE_CODES),
  body('sessionId').optional().trim().isLength({ max: 80 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('setId').optional({ values: 'falsy' }).trim().isLength({ max: 80 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('candidate').optional().isObject(),
  validateRequest
];

export const memoryTipQuery = [
  query('includeInactive').optional().isBoolean(),
  query('category').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('keyword').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('search').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  validateRequest
];

export const memoryTipBody = [
  body('title').trim().isLength({ min: 1, max: 180 }),
  body('category').optional().trim().isLength({ max: 120 }),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt(),
  body('isActive').optional().isBoolean(),
  body('content').optional().isArray({ max: 60 }),
  validateRequest
];

export const memoryTipUpdateBody = [
  body('title').optional().trim().isLength({ min: 1, max: 180 }),
  body('category').optional().trim().isLength({ max: 120 }),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt(),
  body('isActive').optional().isBoolean(),
  body('content').optional().isArray({ max: 60 }),
  validateRequest
];

export const roadSituationQuery = [
  query('includeInactive').optional().isBoolean(),
  query('type').optional().isIn(['road', 'simulation']),
  query('keyword').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  query('search').optional().trim().isLength({ max: 120 }).matches(SAFE_TEXT),
  validateRequest
];

export const roadSituationBody = [
  body('title').trim().isLength({ min: 1, max: 180 }),
  body('type').optional().isIn(['road', 'simulation']),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('instruction').optional().trim().isLength({ max: 4000 }),
  body('imageUrl').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body('tags').optional().isArray({ max: 50 }),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt(),
  body('isActive').optional().isBoolean(),
  validateRequest
];

export const roadSituationUpdateBody = [
  body('title').optional().trim().isLength({ min: 1, max: 180 }),
  body('type').optional().isIn(['road', 'simulation']),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('instruction').optional().trim().isLength({ max: 4000 }),
  body('imageUrl').optional({ nullable: true }).trim().isLength({ max: 1000 }),
  body('tags').optional().isArray({ max: 50 }),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt(),
  body('isActive').optional().isBoolean(),
  validateRequest
];
