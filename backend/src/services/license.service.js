import axios from 'axios';
import vm from 'vm';
import LicenseClass from '../models/LicenseClass.js';
import { fallbackLicenses } from './license.seed-data.js';

const LICENSE_CONFIG_URL = process.env.LICENSE_CONFIG_URL || 'https://onthigplx.edu.vn/data/b1-question-config.js?v=20250803';

const normalizeLicense = (raw, index = 0, sourceUrl = 'fallback') => ({
  code: String(raw.code || raw.licenseType || raw.type || 'B1').trim().toUpperCase(),
  name: raw.name || raw.title || raw.vehicleType || `Hạng ${raw.code || 'B1'}`,
  description: raw.description || raw.desc || '',
  minAge: Number.isFinite(Number(raw.minAge)) ? Number(raw.minAge) : null,
  requirements: Array.isArray(raw.requirements) ? raw.requirements : [],
  vehicleType: raw.vehicleType || raw.vehicle || raw.name || '',
  questionCount: Number.isFinite(Number(raw.questionCount)) ? Number(raw.questionCount) : null,
  passingScore: Number.isFinite(Number(raw.passingScore)) ? Number(raw.passingScore) : null,
  durationMinutes: Number.isFinite(Number(raw.durationMinutes)) ? Number(raw.durationMinutes) : null,
  sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : index + 1,
  isActive: raw.isActive !== false,
  sourceUrl,
  rawData: raw.rawData || raw
});

const b1FromConfig = (config, sourceUrl) => {
  if (!config || typeof config !== 'object') return null;
  return normalizeLicense({
    code: 'B1',
    name: 'Mô tô ba bánh',
    vehicleType: 'Mô tô ba bánh',
    description: 'Hạng B1 sử dụng 300 câu hỏi chọn lọc từ bộ 600 câu theo cấu hình nguồn.',
    minAge: 18,
    questionCount: config.examStructure?.totalExamQuestions,
    passingScore: config.examStructure?.passThreshold,
    durationMinutes: config.examStructure?.timeLimit,
    sortOrder: 3,
    requirements: ['Không sai câu điểm liệt', `${config.totalQuestions || 300} câu trong ngân hàng ôn tập`],
    rawData: config
  }, 2, sourceUrl);
};

const extractLicenses = (value, sourceUrl) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item, index) => normalizeLicense(item, index, sourceUrl));

  if (typeof value === 'object') {
    const directLists = ['licenses', 'licenseClasses', 'classes', 'data'];
    for (const key of directLists) {
      if (Array.isArray(value[key])) return value[key].map((item, index) => normalizeLicense(item, index, sourceUrl));
    }

    const b1 = b1FromConfig(value, sourceUrl);
    if (b1) return [b1];

    const objectValues = Object.values(value);
    if (objectValues.length && objectValues.every((item) => item && typeof item === 'object')) {
      return objectValues.map((item, index) => normalizeLicense(item, index, sourceUrl));
    }
  }

  return [];
};

const parseConfigJs = (source, sourceUrl) => {
  const sandbox = { window: {}, module: { exports: {} }, exports: {}, console: { log: () => {}, warn: () => {}, error: () => {} } };
  vm.runInNewContext(source, sandbox, { timeout: 3000 });

  const candidates = [
    sandbox.module.exports,
    sandbox.window.licenseClasses,
    sandbox.window.LICENSE_CLASSES,
    sandbox.window.B1_QUESTION_CONFIG,
    sandbox.B1_QUESTION_CONFIG
  ];

  for (const candidate of candidates) {
    const parsed = extractLicenses(candidate, sourceUrl);
    if (parsed.length) return parsed;
  }

  const windowObjects = Object.values(sandbox.window || {});
  for (const candidate of windowObjects) {
    const parsed = extractLicenses(candidate, sourceUrl);
    if (parsed.length) return parsed;
  }

  return [];
};

const fetchLicensesFromSource = async () => {
  const response = await axios.get(LICENSE_CONFIG_URL, { timeout: 30000, responseType: 'text' });
  const parsed = parseConfigJs(response.data, LICENSE_CONFIG_URL);
  return parsed;
};

export const seedLicenses = async () => {
  let parsed = [];
  let sourceUrl = LICENSE_CONFIG_URL;
  let sourceLoaded = false;

  try {
    parsed = await fetchLicensesFromSource();
    sourceLoaded = true;
  } catch (error) {
    console.warn(`[licenses] Cannot fetch/parse source config: ${error.message}`);
  }

  const fallback = fallbackLicenses.map((item, index) => normalizeLicense(item, index, 'fallback'));
  const merged = new Map(fallback.map((item) => [item.code, item]));

  for (const item of parsed) {
    merged.set(item.code, {
      ...(merged.get(item.code) || {}),
      ...item,
      sourceUrl,
      isActive: true
    });
  }

  const licenses = [...merged.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  const operations = licenses.map((license) => ({
    updateOne: {
      filter: { code: license.code },
      update: { $set: license },
      upsert: true
    }
  }));

  const result = await LicenseClass.bulkWrite(operations, { ordered: false });
  const totalSaved = await LicenseClass.countDocuments({ isActive: true });

  return {
    sourceLoaded,
    sourceUrl,
    parsed: parsed.length,
    saved: totalSaved,
    upserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0
  };
};
