import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import Question from '../models/Question.js';
import LicenseClass from '../models/LicenseClass.js';
import TrafficSign from '../models/TrafficSign.js';
import DataSourceStatus from '../models/DataSourceStatus.js';
import ExamSet from '../models/ExamSet.js';
import { normalizeQuestion, normalizeImageUrl, seedQuestions } from './seed.service.js';
import { seedLicenses } from './license.service.js';
import { seedTrafficSigns } from './traffic-sign.service.js';
import { createQuestionHash, normalizeText, uniqueArray } from '../utils/question-dedupe.js';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const IMAGE_STORAGE_DIR = path.join(STORAGE_DIR, 'images');
const QUESTIONS_IMAGE_DIR = path.join(IMAGE_STORAGE_DIR, 'questions');
const TRAFFIC_IMAGE_DIR = path.join(IMAGE_STORAGE_DIR, 'traffic-signs');
const SOURCE_BASE_URL = process.env.SOURCE_BASE_URL || 'https://onthigplx.edu.vn';

const REMOTE_CONFIG = {
  questions: {
    name: 'All Questions',
    url: process.env.SOURCE_ALL_URL || 'https://onthigplx.edu.vn/data/questions/all-questions.json',
    type: 'questions'
  },
  a1Questions: {
    name: 'A1 Questions',
    url: process.env.SOURCE_A1_URL || 'https://onthigplx.edu.vn/data/a-a1-questions/a-a1-questions.json',
    type: 'questions'
  },
  licenses: {
    name: 'License Config',
    url: process.env.LICENSE_CONFIG_URL || 'https://onthigplx.edu.vn/data/b1-question-config.js?v=20250803',
    type: 'licenses'
  },
  trafficSigns: {
    name: 'Traffic Signs',
    url: process.env.TRAFFIC_SIGNS_JS_URL || 'https://onthigplx.edu.vn/js/traffic-signs-data.js',
    altUrl: process.env.TRAFFIC_SIGNS_PAGE_URL || 'https://onthigplx.edu.vn/traffic-signs.html',
    type: 'traffic-signs'
  }
};

const ensureDirectory = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const setStatus = async ({ sourceName, sourceUrl, type, status, totalRecords, isUsingFallback, errorMessage }) => {
  const now = new Date();
  const update = {
    sourceName,
    sourceUrl,
    type,
    status,
    totalRecords: Number(totalRecords || 0),
    isUsingFallback: Boolean(isUsingFallback)
  };
  if (status === 'success') {
    update.lastSuccessAt = now;
    update.lastErrorMessage = '';
  }
  if (status === 'failed') {
    update.lastFailedAt = now;
    update.lastErrorMessage = String(errorMessage || 'Unknown error');
  }
  return DataSourceStatus.findOneAndUpdate(
    { type, sourceName },
    { $set: update },
    { upsert: true, new: true }
  );
};

const fetchRemoteJson = async (url) => {
  const response = await axios.get(url, { timeout: 30000, responseType: 'json' });
  return response.data;
};

const fetchRemoteText = async (url) => {
  const response = await axios.get(url, { timeout: 30000, responseType: 'text' });
  return response.data;
};

const saveQuestionsToMongo = async (questions) => {
  if (!questions.length) return [];
  const operations = questions.map((question) => ({
    updateOne: {
      filter: { questionHash: question.questionHash },
      update: {
        $set: {
          questionNumber: question.questionNumber,
          sourceQuestionId: question.sourceQuestionId,
          sourceKey: question.sourceKey,
          sourceType: question.sourceType,
          question: question.question,
          normalizedQuestion: question.normalizedQuestion,
          questionHash: question.questionHash,
          category: question.category,
          topic: question.topic,
          examFormat: question.examFormat,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          image: question.image,
          imageUrl: question.imageUrl,
          hasImage: question.hasImage,
          difficulty: question.difficulty
        },
        $addToSet: {
          sourceTypes: { $each: question.sourceTypes },
          licenseTypes: { $each: question.licenseTypes || [] },
          topics: { $each: question.topics || [] },
          references: { $each: question.references || [] }
        },
        $max: { isPointDeduction: question.isPointDeduction }
      },
      upsert: true
    }
  }));

  const result = await Question.bulkWrite(operations, { ordered: false });
  return Question.find({ questionHash: { $in: questions.map((item) => item.questionHash) } });
};

const loadLocalBackup = async (name) => {
  const filePath = path.join(STORAGE_DIR, `${name}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const saveLocalBackup = async (name, data) => {
  await ensureDirectory(STORAGE_DIR);
  const filePath = path.join(STORAGE_DIR, `${name}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
};

const fetchAndSaveQuestions = async () => {
  const primaryUrl = REMOTE_CONFIG.questions.url;
  const a1Url = REMOTE_CONFIG.a1Questions.url;

  const [a1Data, allData] = await Promise.all([
    fetchRemoteJson(a1Url).catch((error) => { throw new Error(`A1 source failed: ${error.message}`); }),
    fetchRemoteJson(primaryUrl).catch((error) => { throw new Error(`All questions source failed: ${error.message}`); })
  ]);

  const pickItems = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (payload.questions) return payload.questions;
    if (payload.data) return payload.data;
    return [];
  };

  const normalized = [
    ...pickItems(a1Data).map((item) => normalizeQuestion(item, 'a1')),
    ...pickItems(allData).map((item) => normalizeQuestion(item, 'all'))
  ]
    .filter(Boolean);

  const merged = new Map();
  for (const question of normalized) {
    const existing = merged.get(question.questionHash);
    if (!existing) {
      merged.set(question.questionHash, question);
      continue;
    }
    merged.set(question.questionHash, {
      ...existing,
      sourceTypes: uniqueArray(existing.sourceTypes, question.sourceTypes),
      licenseTypes: uniqueArray(existing.licenseTypes, question.licenseTypes),
      topic: existing.topic || question.topic,
      topics: uniqueArray(existing.topics, question.topics),
      references: uniqueArray(existing.references, question.references),
      hasImage: existing.hasImage || question.hasImage,
      image: existing.image || question.image,
      imageUrl: existing.imageUrl || question.imageUrl
    });
  }

  const questions = [...merged.values()];
  return questions;
};

const fetchAndSaveTrafficSigns = async () => {
  const responseText = await fetchRemoteText(REMOTE_CONFIG.trafficSigns.url);
  const sandbox = { window: {} };
  vm.runInNewContext(responseText, sandbox, { timeout: 3000 });
  const data = sandbox.window.trafficSignsData;

  if (!data || typeof data !== 'object') {
    const html = await fetchRemoteText(REMOTE_CONFIG.trafficSigns.altUrl);
    const $ = cheerio.load(html);
    const signs = [];
    $('.sign-card').each((index, element) => {
      const card = $(element);
      const code = card.find('.sign-code').text().trim();
      const name = card.find('.sign-title').text().trim();
      const description = card.find('.sign-description').text().trim();
      const image = card.find('img').attr('src');
      const group = card.closest('[data-category], section').attr('data-category') || 'Khác';
      if (code || name) signs.push(normalizeSign({ code, name, description, image, group }, group, REMOTE_CONFIG.trafficSigns.altUrl));
    });
    return signs;
  }

  return Object.entries(data).flatMap(([groupKey, signs]) => (
    Array.isArray(signs) ? signs.map((sign) => normalizeSign(sign, groupKey, REMOTE_CONFIG.trafficSigns.url)) : []
  ));
};

const fetchAndSaveLicenses = async () => {
  const responseText = await fetchRemoteText(REMOTE_CONFIG.licenses.url);
  const sandbox = { window: {}, module: { exports: {} }, exports: {} };
  vm.runInNewContext(responseText, sandbox, { timeout: 3000 });
  const config = sandbox.module.exports || sandbox.window.B1_QUESTION_CONFIG || sandbox.window.LICENSE_CLASSES;
  if (!config) throw new Error('License source content could not be parsed');
  const result = await seedLicenses();
  return result;
};

export const checkRemoteApiHealth = async () => {
  const results = await Promise.allSettled([
    fetchRemoteJson(REMOTE_CONFIG.questions.url),
    fetchRemoteJson(REMOTE_CONFIG.a1Questions.url),
    fetchRemoteText(REMOTE_CONFIG.licenses.url),
    fetchRemoteText(REMOTE_CONFIG.trafficSigns.url)
  ]);

  const statuses = [REMOTE_CONFIG.questions, REMOTE_CONFIG.a1Questions, REMOTE_CONFIG.licenses, REMOTE_CONFIG.trafficSigns].map((config, index) => {
    const outcome = results[index];
    if (outcome.status === 'fulfilled') {
      return { name: config.name, url: config.url, status: 'success', lastErrorMessage: '' };
    }
    return { name: config.name, url: config.url, status: 'failed', lastErrorMessage: outcome.reason?.message || 'Unknown error' };
  });

  return statuses;
};

export const getQuestionsWithFallback = async (query = {}) => {
  const mongoData = await Question.find(query).sort({ questionNumber: 1, _id: 1 });
  if (mongoData.length > 0) {
    return { source: 'mongodb', data: mongoData, isStale: false };
  }

  try {
    const questions = await fetchAndSaveQuestions();
    const saved = await saveQuestionsToMongo(questions);
    await saveLocalBackup('questions', questions);
    await setStatus({ sourceName: 'All Questions', sourceUrl: REMOTE_CONFIG.questions.url, type: 'questions', status: 'success', totalRecords: saved.length, isUsingFallback: false });
    return { source: 'remote-api', data: saved, isStale: false };
  } catch (error) {
    await setStatus({ sourceName: 'All Questions', sourceUrl: REMOTE_CONFIG.questions.url, type: 'questions', status: 'failed', errorMessage: error.message, isUsingFallback: true });
    return { source: 'error', data: [], error: 'MongoDB không có dữ liệu và API nguồn đang lỗi.' };
  }
};

export const getTrafficSignsWithFallback = async (query = {}) => {
  const mongoData = await TrafficSign.find(query).sort({ groupSlug: 1, code: 1 });
  if (mongoData.length > 0) {
    return { source: 'mongodb', data: mongoData, isStale: false };
  }

  try {
    const result = await seedTrafficSigns();
    const saved = await TrafficSign.find(query).sort({ groupSlug: 1, code: 1 });
    await saveLocalBackup('traffic-signs', saved);
    await setStatus({ sourceName: 'Traffic Signs', sourceUrl: result.source || REMOTE_CONFIG.trafficSigns.url, type: 'traffic-signs', status: 'success', totalRecords: saved.length, isUsingFallback: result.source === 'local-fallback' });
    return { source: result.source || 'remote-api', data: saved, isStale: false };
  } catch (error) {
    await setStatus({ sourceName: 'Traffic Signs', sourceUrl: REMOTE_CONFIG.trafficSigns.url, type: 'traffic-signs', status: 'failed', errorMessage: error.message, isUsingFallback: true });
    return { source: 'error', data: [], error: 'MongoDB không có dữ liệu và API nguồn đang lỗi.' };
  }
};

export const getLicensesWithFallback = async () => {
  const mongoData = await LicenseClass.find({ isActive: true }).sort({ sortOrder: 1, code: 1 });
  if (mongoData.length > 0) {
    return { source: 'mongodb', data: mongoData, isStale: false };
  }

  try {
    const result = await seedLicenses();
    const saved = await LicenseClass.find({ isActive: true }).sort({ sortOrder: 1, code: 1 });
    await setStatus({ sourceName: 'License Config', sourceUrl: REMOTE_CONFIG.licenses.url, type: 'licenses', status: 'success', totalRecords: saved.length, isUsingFallback: false });
    return { source: 'remote-api', data: saved, isStale: false };
  } catch (error) {
    await setStatus({ sourceName: 'License Config', sourceUrl: REMOTE_CONFIG.licenses.url, type: 'licenses', status: 'failed', errorMessage: error.message, isUsingFallback: true });
    return { source: 'error', data: [], error: 'MongoDB không có dữ liệu và API nguồn đang lỗi.' };
  }
};

export const refreshQuestionsFromRemote = async () => {
  const questions = await fetchAndSaveQuestions();
  const saved = await saveQuestionsToMongo(questions);
  await saveLocalBackup('questions', questions);
  await setStatus({ sourceName: 'All Questions', sourceUrl: REMOTE_CONFIG.questions.url, type: 'questions', status: 'success', totalRecords: saved.length, isUsingFallback: false });
  return { source: 'remote-api', refreshCount: saved.length };
};

export const refreshTrafficSignsFromRemote = async () => {
  const result = await seedTrafficSigns();
  const signs = await TrafficSign.find({}).sort({ groupSlug: 1, code: 1 });
  await saveLocalBackup('traffic-signs', signs);
  await setStatus({ sourceName: 'Traffic Signs', sourceUrl: result.source || REMOTE_CONFIG.trafficSigns.url, type: 'traffic-signs', status: 'success', totalRecords: signs.length, isUsingFallback: result.source === 'local-fallback' });
  return { source: result.source || 'remote-api', refreshCount: signs.length, result };
};

export const refreshLicensesFromRemote = async () => {
  const result = await seedLicenses();
  const saved = await LicenseClass.find({ isActive: true }).sort({ sortOrder: 1, code: 1 });
  await setStatus({ sourceName: 'License Config', sourceUrl: REMOTE_CONFIG.licenses.url, type: 'licenses', status: 'success', totalRecords: saved.length, isUsingFallback: false });
  return { source: 'remote-api', refreshCount: saved.length, result };
};

export const getRemoteFallbackEnabled = () => process.env.REMOTE_FALLBACK_ENABLED !== 'false';
export const getRemoteRefreshEnabled = () => process.env.REMOTE_REFRESH_ENABLED !== 'false';
export const getRemoteMaxAgeHours = () => Number(process.env.REMOTE_REFRESH_MAX_AGE_HOURS) || 24;

export const getHealthReport = async () => {
  const [questionCount, trafficCount, licenseCount, examSetCount] = await Promise.all([
    Question.countDocuments(),
    TrafficSign.countDocuments(),
    LicenseClass.countDocuments(),
    ExamSet.countDocuments()
  ]);

  const statuses = await DataSourceStatus.find().sort({ type: 1, sourceName: 1 });
  const remoteApis = statuses.map((status) => ({
    name: status.sourceName,
    url: status.sourceUrl,
    status: status.status,
    lastSuccessAt: status.lastSuccessAt,
    lastFailedAt: status.lastFailedAt,
    lastErrorMessage: status.lastErrorMessage,
    totalRecords: status.totalRecords
  }));

  return {
    mode: process.env.DATA_MODE || 'mongodb-first',
    mongodb: {
      connected: true,
      questions: questionCount,
      trafficSigns: trafficCount,
      licenses: licenseCount,
      examSets: examSetCount
    },
    remoteApis,
    fallback: {
      enabled: getRemoteFallbackEnabled(),
      currentSource: questionCount > 0 ? 'mongodb' : 'remote-api'
    }
  };
};
