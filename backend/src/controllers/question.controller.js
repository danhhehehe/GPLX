import Question from '../models/Question.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const STATISTICS_CACHE_TTL_MS = Number(process.env.QUESTION_STATISTICS_CACHE_TTL_MS || 5 * 60 * 1000);
let statisticsCache = {
  expiresAt: 0,
  data: null
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (query = {}, extra = {}) => {
  const filter = { ...extra };

  if (query.licenseType) filter.licenseTypes = new RegExp(`^${escapeRegex(query.licenseType)}$`, 'i');
  if (query.category) filter.category = query.category;
  if (query.isPointDeduction === 'true') filter.isPointDeduction = true;
  if (query.isPointDeduction === 'false') filter.isPointDeduction = false;
  if (query.pointDeduction === 'true') filter.isPointDeduction = true;
  if (query.pointDeduction === 'false') filter.isPointDeduction = false;
  if (query.keyword || query.search) {
    const keyword = escapeRegex(query.keyword || query.search);
    filter.$or = [
      { question: new RegExp(keyword, 'i') },
      { normalizedQuestion: new RegExp(keyword, 'i') },
      { category: new RegExp(keyword, 'i') },
      { topics: new RegExp(keyword, 'i') }
    ];
  }

  return filter;
};

const paginatedResponse = async (req, res, filter) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 1000);
  const skip = (page - 1) * limit;

  const projection = req.query.mode === 'exam' ? '-correctAnswer -explanation -references' : '';

  const [items, total] = await Promise.all([
    Question.find(filter).select(projection).sort({ questionNumber: 1, _id: 1 }).skip(skip).limit(limit),
    Question.countDocuments(filter)
  ]);

  res.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
};

export const getQuestions = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query));
});

export const getA1Questions = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query, { sourceTypes: 'a1' }));
});

export const getAllQuestions = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query, { sourceTypes: 'all' }));
});

export const getQuestionById = asyncHandler(async (req, res) => {
  const filters = [{ sourceKey: req.params.id }, { questionHash: req.params.id }];
  if (req.params.id.match(/^[a-f\d]{24}$/i)) {
    filters.push({ _id: req.params.id });
  }

  const question = await Question.findOne({ $or: filters });

  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  res.json(question);
});

export const getQuestionsByLicense = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query, { licenseTypes: new RegExp(`^${escapeRegex(req.params.type)}$`, 'i') }));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Question.distinct('category');
  res.json(categories.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi')));
});

export const getPointDeductionQuestions = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query, { isPointDeduction: true }));
});

export const getQuestionsWithImages = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query, {
    $or: [{ hasImage: true }, { imageUrl: { $nin: [null, ''] } }]
  }));
});

export const getQuestionsNoImages = asyncHandler(async (req, res) => {
  await paginatedResponse(req, res, buildFilter(req.query, {
    $and: [
      { $or: [{ hasImage: false }, { hasImage: { $exists: false } }] },
      { $or: [{ imageUrl: null }, { imageUrl: '' }, { imageUrl: { $exists: false } }] }
    ]
  }));
});

export const getImageCheck = asyncHandler(async (req, res) => {
  const missingFilter = {
    hasImage: true,
    $or: [{ imageUrl: null }, { imageUrl: '' }, { imageUrl: { $exists: false } }]
  };

  const [totalQuestions, totalWithImages, totalMissingImages, brokenImageQuestions] = await Promise.all([
    Question.countDocuments(),
    Question.countDocuments({ $or: [{ hasImage: true }, { imageUrl: { $nin: [null, ''] } }] }),
    Question.countDocuments(missingFilter),
    Question.find(missingFilter)
      .select('sourceTypes sourceQuestionId questionNumber question image imageUrl hasImage')
      .sort({ questionNumber: 1 })
      .limit(200)
  ]);

  res.json({
    totalQuestions,
    totalWithImages,
    totalMissingImages,
    brokenImageQuestions
  });
});

export const getQuestionStatistics = asyncHandler(async (req, res) => {
  if (statisticsCache.data && statisticsCache.expiresAt > Date.now()) {
    res.set('Cache-Control', 'public, max-age=60');
    res.json(statisticsCache.data);
    return;
  }

  const [
    totalQuestions,
    totalA1,
    totalAll,
    totalPointDeduction,
    totalWithImages,
    categories,
    licenseTypes
  ] = await Promise.all([
    Question.countDocuments(),
    Question.countDocuments({ sourceTypes: 'a1' }),
    Question.countDocuments({ sourceTypes: 'all' }),
    Question.countDocuments({ isPointDeduction: true }),
    Question.countDocuments({ $or: [{ hasImage: true }, { imageUrl: { $nin: [null, ''] } }] }),
    Question.distinct('category'),
    Question.distinct('licenseTypes')
  ]);

  const data = {
    totalQuestions,
    totalA1,
    totalAll,
    totalPointDeduction,
    totalWithImages,
    totalCategories: categories.filter(Boolean).length,
    totalLicenseTypes: licenseTypes.filter(Boolean).length,
    categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi')),
    licenseTypes: licenseTypes.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi'))
  };

  statisticsCache = {
    expiresAt: Date.now() + STATISTICS_CACHE_TTL_MS,
    data
  };

  res.set('Cache-Control', 'public, max-age=60');
  res.json(data);
});
