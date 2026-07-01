import TrafficSign from '../models/TrafficSign.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { slugify } from '../utils/slug.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildTrafficFilter = (query = {}, extra = {}) => {
  const filter = { ...extra };
  const group = query.group || query.groupSlug;
  const keyword = query.keyword || query.search;

  if (group) {
    filter.$or = [{ groupSlug: slugify(group) }, { group: new RegExp(escapeRegex(group), 'i') }];
  }

  if (keyword) {
    const safeKeyword = escapeRegex(keyword);
    const keywordFilter = [
      { code: new RegExp(safeKeyword, 'i') },
      { name: new RegExp(safeKeyword, 'i') },
      { description: new RegExp(safeKeyword, 'i') },
      { group: new RegExp(safeKeyword, 'i') }
    ];

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: keywordFilter }];
      delete filter.$or;
    } else {
      filter.$or = keywordFilter;
    }
  }

  return filter;
};

export const getTrafficSigns = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const skip = (page - 1) * limit;
  const filter = buildTrafficFilter(req.query);

  const [data, total] = await Promise.all([
    TrafficSign.find(filter).sort({ groupSlug: 1, code: 1, name: 1 }).skip(skip).limit(limit),
    TrafficSign.countDocuments(filter)
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
});

export const getTrafficSignGroups = asyncHandler(async (req, res) => {
  const groups = await TrafficSign.aggregate([
    { $group: { _id: '$groupSlug', group: { $first: '$group' }, groupSlug: { $first: '$groupSlug' }, count: { $sum: 1 } } },
    { $sort: { group: 1 } }
  ]);
  res.json(groups);
});

export const getTrafficSignByCode = asyncHandler(async (req, res) => {
  const sign = await TrafficSign.findOne({ code: req.params.code.toUpperCase() });
  if (!sign) {
    res.status(404);
    throw new Error('Traffic sign not found');
  }
  res.json(sign);
});

export const getTrafficSignsByGroup = asyncHandler(async (req, res) => {
  const signs = await TrafficSign.find({ groupSlug: slugify(req.params.group) }).sort({ code: 1, name: 1 });
  res.json(signs);
});

export const getTrafficSignStatistics = asyncHandler(async (req, res) => {
  const [total, withImages, groups] = await Promise.all([
    TrafficSign.countDocuments(),
    TrafficSign.countDocuments({ imageUrl: { $nin: [null, ''] } }),
    TrafficSign.aggregate([
      { $group: { _id: '$groupSlug', group: { $first: '$group' }, groupSlug: { $first: '$groupSlug' }, count: { $sum: 1 } } },
      { $sort: { group: 1 } }
    ])
  ]);

  res.json({
    total,
    withImages,
    groups,
    totalGroups: groups.length
  });
});
