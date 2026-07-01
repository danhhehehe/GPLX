import RoadSituation from '../models/RoadSituation.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pickRoadSituationPayload = (body = {}) => Object.fromEntries(
  Object.entries({
    title: body.title,
    type: body.type,
    description: body.description,
    instruction: body.instruction,
    imageUrl: body.imageUrl,
    tags: body.tags,
    sortOrder: body.sortOrder,
    isActive: body.isActive
  }).filter(([, value]) => value !== undefined)
);

const buildFilter = (query = {}) => {
  const filter = {};
  if (query.includeInactive !== 'true') filter.isActive = true;
  if (query.type) filter.type = query.type;
  if (query.keyword || query.search) {
    const keyword = escapeRegex(query.keyword || query.search);
    filter.$or = [
      { title: new RegExp(keyword, 'i') },
      { description: new RegExp(keyword, 'i') },
      { instruction: new RegExp(keyword, 'i') },
      { tags: new RegExp(keyword, 'i') }
    ];
  }
  return filter;
};

export const getRoadSituations = asyncHandler(async (req, res) => {
  const rows = await RoadSituation.find(buildFilter(req.query)).sort({ sortOrder: 1, title: 1 });
  res.json({ data: rows });
});

export const createRoadSituation = asyncHandler(async (req, res) => {
  const row = await RoadSituation.create(pickRoadSituationPayload(req.body));
  res.status(201).json(row);
});

export const updateRoadSituation = asyncHandler(async (req, res) => {
  const row = await RoadSituation.findByIdAndUpdate(req.params.id, pickRoadSituationPayload(req.body), { new: true, runValidators: true });
  if (!row) {
    res.status(404);
    throw new Error('Road situation not found');
  }
  res.json(row);
});

export const deleteRoadSituation = asyncHandler(async (req, res) => {
  const row = await RoadSituation.findByIdAndDelete(req.params.id);
  if (!row) {
    res.status(404);
    throw new Error('Road situation not found');
  }
  res.json({ deleted: true, id: req.params.id });
});
