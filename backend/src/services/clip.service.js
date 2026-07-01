import fs from 'fs/promises';
import path from 'path';
import ClipView from '../models/ClipView.js';
import { slugify } from '../utils/slug.js';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv']);
const THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const getClipDirectory = async () => {
  const candidates = [
    path.resolve(process.cwd(), 'clip'),
    path.resolve(process.cwd(), '..', 'clip')
  ];

  for (const directory of candidates) {
    try {
      const stats = await fs.stat(directory);
      if (stats.isDirectory()) return directory;
    } catch (error) {
      // Try the next likely project layout.
    }
  }

  return candidates[0];
};

const isVideoFile = (file) => VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase());

const isSafeClipFile = (file) => {
  if (!file || typeof file !== 'string') return false;
  return path.basename(file) === file && !file.includes('..') && isVideoFile(file);
};

const toDisplayTitle = (file) => {
  const name = path.parse(file).name
    .replace(/^YTSave[_-]?YouTube[_-]?/i, '')
    .replace(/[_-]?Media[_-]?.*$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return name || 'Video tuyên truyền an toàn giao thông';
};

const toPublicUrl = (file) => `/clip/${encodeURIComponent(file)}`;

const findThumbnail = (file, files) => {
  const baseName = path.parse(file).name;
  return THUMBNAIL_EXTENSIONS
    .map((extension) => `${baseName}${extension}`)
    .find((thumbnail) => files.has(thumbnail)) || null;
};

const normalizeClip = (clip, files) => {
  const file = path.basename(clip.file || '');
  if (!isSafeClipFile(file) || !files.has(file)) return null;

  const rawThumbnail = clip.thumbnail ? path.basename(clip.thumbnail) : null;
  const thumbnail = rawThumbnail && files.has(rawThumbnail)
    ? rawThumbnail
    : findThumbnail(file, files);
  const id = slugify(path.parse(file).name);

  return {
    id,
    title: clip.title || toDisplayTitle(file),
    description: clip.description || 'Video tuyên truyền giúp nâng cao ý thức khi tham gia giao thông.',
    source: clip.source || 'B PRODUCTIONS',
    sourceUrl: clip.sourceUrl || 'https://www.youtube.com/@BProductions68',
    videoUrl: toPublicUrl(file),
    thumbnailUrl: thumbnail ? toPublicUrl(thumbnail) : null,
    pinned: Boolean(clip.pinned)
  };
};

const readDirectoryFiles = async (clipDirectory) => {
  try {
    return await fs.readdir(clipDirectory);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const readMetadata = async (clipDirectory) => {
  try {
    const raw = await fs.readFile(path.join(clipDirectory, 'clips.json'), 'utf8');
    const metadata = JSON.parse(raw);
    return Array.isArray(metadata) ? metadata : [];
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    console.warn(`[clips] Cannot read clips.json: ${error.message}`);
    return null;
  }
};

const getBaseClips = async () => {
  const clipDirectory = await getClipDirectory();
  const files = new Set(await readDirectoryFiles(clipDirectory));
  const metadata = await readMetadata(clipDirectory);
  const rawClips = metadata || [...files]
    .filter(isVideoFile)
    .sort((left, right) => left.localeCompare(right, 'vi'))
    .map((file) => ({ file }));

  return rawClips
    .map((clip) => normalizeClip(clip, files))
    .filter(Boolean);
};

const mergeViews = async (clips) => {
  if (!clips.length) return [];

  const viewRows = await ClipView.find({ clipId: { $in: clips.map((clip) => clip.id) } }).lean();
  const viewMap = new Map(viewRows.map((row) => [row.clipId, row.views || 0]));

  return clips.map((clip, index) => ({
    ...clip,
    views: viewMap.get(clip.id) || 0,
    order: index
  }));
};

const sortByViews = (clips) => [...clips].sort((left, right) => {
  if (right.views !== left.views) return right.views - left.views;
  return left.order - right.order;
});

const pickFeaturedClip = (clips) => {
  if (!clips.length) return null;

  const hasViews = clips.some((clip) => clip.views > 0);
  if (hasViews) return sortByViews(clips)[0];

  return clips.find((clip) => clip.pinned) || clips[0];
};

const stripInternalFields = (clip) => {
  if (!clip) return null;
  const { order, ...publicClip } = clip;
  return publicClip;
};

export const getClips = async () => {
  const clips = await mergeViews(await getBaseClips());
  const sortedClips = sortByViews(clips).map(stripInternalFields);

  return {
    featured: stripInternalFields(pickFeaturedClip(clips)),
    data: sortedClips
  };
};

export const incrementClipView = async (clipId) => {
  const clips = await getBaseClips();
  const clip = clips.find((item) => item.id === clipId);

  if (!clip) return null;

  const updated = await ClipView.findOneAndUpdate(
    { clipId },
    { $inc: { views: 1 }, $set: { updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    clipId,
    views: updated.views || 0
  };
};
