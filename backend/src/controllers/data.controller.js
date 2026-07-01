import { asyncHandler } from '../middleware/error.middleware.js';
import {
  getQuestionsWithFallback,
  getTrafficSignsWithFallback,
  getLicensesWithFallback,
  refreshQuestionsFromRemote,
  refreshTrafficSignsFromRemote,
  refreshLicensesFromRemote,
  checkRemoteApiHealth,
  getHealthReport
} from '../services/dataSource.service.js';

const buildQuestionFilter = (query = {}) => {
  const filter = {};
  if (query.licenseType) filter.licenseTypes = String(query.licenseType).toUpperCase();
  if (query.category) filter.category = query.category;
  if (query.isPointDeduction === 'true' || query.pointDeduction === 'true') filter.isPointDeduction = true;
  if (query.isPointDeduction === 'false' || query.pointDeduction === 'false') filter.isPointDeduction = false;
  return filter;
};

const buildTrafficFilter = (query = {}) => {
  const filter = {};
  if (query.groupSlug) filter.groupSlug = query.groupSlug;
  if (query.group) filter.group = query.group;
  return filter;
};

export const getHealth = asyncHandler(async (req, res) => {
  const report = await getHealthReport();
  res.json(report);
});

export const refreshQuestions = asyncHandler(async (req, res) => {
  const result = await refreshQuestionsFromRemote();
  res.json(result);
});

export const refreshTrafficSigns = asyncHandler(async (req, res) => {
  const result = await refreshTrafficSignsFromRemote();
  res.json(result);
});

export const refreshLicenses = asyncHandler(async (req, res) => {
  const result = await refreshLicensesFromRemote();
  res.json(result);
});

export const refreshAll = asyncHandler(async (req, res) => {
  const results = {};
  try {
    results.questions = await refreshQuestionsFromRemote();
  } catch (err) {
    results.questions = { error: err.message };
  }
  try {
    results.licenses = await refreshLicensesFromRemote();
  } catch (err) {
    results.licenses = { error: err.message };
  }
  try {
    results.trafficSigns = await refreshTrafficSignsFromRemote();
  } catch (err) {
    results.trafficSigns = { error: err.message };
  }
  res.json(results);
});

export const getQuestionsForApi = asyncHandler(async (req, res) => {
  const result = await getQuestionsWithFallback(buildQuestionFilter(req.query));
  res.json(result);
});

export const getTrafficSignsForApi = asyncHandler(async (req, res) => {
  const result = await getTrafficSignsWithFallback(buildTrafficFilter(req.query));
  res.json(result);
});

export const getLicensesForApi = asyncHandler(async (req, res) => {
  const result = await getLicensesWithFallback();
  res.json(result);
});

export const remoteHealth = asyncHandler(async (req, res) => {
  const result = await checkRemoteApiHealth();
  res.json(result);
});
