import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import vm from 'vm';
import TrafficSign from '../models/TrafficSign.js';
import { trafficSignsSeed } from './traffic-sign.seed-data.js';
import { normalizeImageUrl } from './seed.service.js';
import { normalizeText } from '../utils/question-dedupe.js';
import { slugify } from '../utils/slug.js';

const TRAFFIC_SIGNS_PAGE = 'https://onthigplx.edu.vn/traffic-signs.html';
const TRAFFIC_SIGNS_JS = 'https://onthigplx.edu.vn/js/traffic-signs-data.js';

const groupNames = {
  cam: 'Biển báo cấm',
  'nguy-hiem': 'Biển báo nguy hiểm',
  nguyhiem: 'Biển báo nguy hiểm',
  'hieu-lenh': 'Biển báo hiệu lệnh',
  hieulenh: 'Biển báo hiệu lệnh',
  'chi-dan': 'Biển báo chỉ dẫn',
  chidan: 'Biển báo chỉ dẫn',
  phu: 'Biển báo phụ',
  vachke: 'Vạch kẻ đường',
  sahinh: 'Sa hình'
};

const createSignHash = (sign) => {
  const raw = [sign.code, sign.name, sign.group, sign.description].map(normalizeText).join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
};

const normalizeSign = (raw, groupKey, sourceUrl = TRAFFIC_SIGNS_PAGE) => {
  const group = raw.group || groupNames[groupKey] || groupKey || 'Khác';
  const image = raw.image || raw.imagePath || null;
  const sign = {
    code: raw.code ? String(raw.code).trim().toUpperCase() : undefined,
    name: raw.name || raw.title || raw.code || 'Biển báo',
    description: raw.description || raw.desc || '',
    group,
    groupSlug: slugify(groupKey || group),
    image,
    imageUrl: normalizeImageUrl(raw.imageUrl || image),
    sourceUrl
  };
  sign.signHash = createSignHash(sign);
  return sign;
};

const parseSignsFromJs = async () => {
  const response = await axios.get(TRAFFIC_SIGNS_JS, { timeout: 30000, responseType: 'text' });
  const sandbox = { window: {} };
  vm.runInNewContext(response.data, sandbox, { timeout: 2000 });
  const data = sandbox.window.trafficSignsData;

  if (!data || typeof data !== 'object') return [];

  return Object.entries(data).flatMap(([groupKey, signs]) => (
    Array.isArray(signs) ? signs.map((sign) => normalizeSign(sign, groupKey, TRAFFIC_SIGNS_JS)) : []
  ));
};

const parseSignsFromHtml = async () => {
  const response = await axios.get(TRAFFIC_SIGNS_PAGE, { timeout: 30000 });
  const $ = cheerio.load(response.data);
  const signs = [];

  $('.sign-card').each((index, element) => {
    const card = $(element);
    const code = card.find('.sign-code').first().text().trim();
    const name = card.find('.sign-title').first().text().trim();
    const description = card.find('.sign-description').first().text().trim();
    const image = card.find('img').first().attr('src');
    const group = card.closest('[data-category], section').attr('data-category') || 'Khác';
    if (code || name) signs.push(normalizeSign({ code, name, description, image, group }, group, TRAFFIC_SIGNS_PAGE));
  });

  return signs;
};

const fetchTrafficSigns = async () => {
  try {
    const signs = await parseSignsFromJs();
    if (signs.length) return { signs, source: TRAFFIC_SIGNS_JS };
  } catch (error) {
    console.warn(`[traffic-signs] Cannot parse JS source: ${error.message}`);
  }

  try {
    const signs = await parseSignsFromHtml();
    if (signs.length) return { signs, source: TRAFFIC_SIGNS_PAGE };
  } catch (error) {
    console.warn(`[traffic-signs] Cannot parse HTML source: ${error.message}`);
  }

  return {
    signs: trafficSignsSeed.map((sign) => normalizeSign(sign, sign.group, 'local-fallback')),
    source: 'local-fallback'
  };
};

export const seedTrafficSigns = async () => {
  const { signs, source } = await fetchTrafficSigns();
  await TrafficSign.collection.dropIndex('signHash_1').catch(() => {});
  const uniqueSigns = [...new Map(signs.map((sign) => [sign.signHash, sign])).values()];

  const operations = uniqueSigns.map((sign) => ({
    updateOne: {
      filter: sign.code ? { code: sign.code } : { signHash: sign.signHash },
      update: { $set: sign },
      upsert: true
    }
  }));

  const result = operations.length
    ? await TrafficSign.bulkWrite(operations, { ordered: false })
    : { upsertedCount: 0, modifiedCount: 0 };

  if (source !== 'local-fallback') {
    await TrafficSign.deleteMany({ signHash: { $nin: uniqueSigns.map((sign) => sign.signHash) } });
  }

  await TrafficSign.collection.createIndex({ signHash: 1 }, { unique: true });

  const totalSaved = await TrafficSign.countDocuments();
  const groups = await TrafficSign.aggregate([
    { $group: { _id: '$groupSlug', group: { $first: '$group' }, count: { $sum: 1 } } },
    { $sort: { group: 1 } }
  ]);

  return {
    source,
    fetched: signs.length,
    uniqueFetched: uniqueSigns.length,
    upserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    totalSaved,
    groups: groups.length
  };
};
