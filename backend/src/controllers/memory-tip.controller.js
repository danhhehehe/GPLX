import MemoryTip from '../models/MemoryTip.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pickMemoryTipPayload = (body = {}) => Object.fromEntries(
  Object.entries({
    title: body.title,
    category: body.category,
    content: body.content,
    sortOrder: body.sortOrder,
    isActive: body.isActive
  }).filter(([, value]) => value !== undefined)
);

const buildFilter = (query = {}) => {
  const filter = {};
  if (query.includeInactive !== 'true') filter.isActive = true;
  if (query.category) filter.category = query.category;
  if (query.keyword || query.search) {
    const keyword = escapeRegex(query.keyword || query.search);
    filter.$or = [
      { title: new RegExp(keyword, 'i') },
      { category: new RegExp(keyword, 'i') },
      { 'content.value': new RegExp(keyword, 'i') },
      { 'content.items': new RegExp(keyword, 'i') }
    ];
  }
  return filter;
};

export const getMemoryTips = asyncHandler(async (req, res) => {
  const tips = await MemoryTip.find(buildFilter(req.query)).sort({ sortOrder: 1, title: 1 });
  res.json({ data: tips });
});

export const createMemoryTip = asyncHandler(async (req, res) => {
  const tip = await MemoryTip.create(pickMemoryTipPayload(req.body));
  res.status(201).json(tip);
});

export const updateMemoryTip = asyncHandler(async (req, res) => {
  const tip = await MemoryTip.findByIdAndUpdate(req.params.id, pickMemoryTipPayload(req.body), { new: true, runValidators: true });
  if (!tip) {
    res.status(404);
    throw new Error('Memory tip not found');
  }
  res.json(tip);
});

export const deleteMemoryTip = asyncHandler(async (req, res) => {
  const tip = await MemoryTip.findByIdAndDelete(req.params.id);
  if (!tip) {
    res.status(404);
    throw new Error('Memory tip not found');
  }
  res.json({ deleted: true, id: req.params.id });
});
