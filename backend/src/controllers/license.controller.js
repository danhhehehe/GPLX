import LicenseClass from '../models/LicenseClass.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { seedLicenses } from '../services/license.service.js';

export const getLicenses = asyncHandler(async (req, res) => {
  const licenses = await LicenseClass.find({ isActive: true }).sort({ sortOrder: 1, code: 1 });
  res.json(licenses);
});

export const getLicenseByCode = asyncHandler(async (req, res) => {
  const license = await LicenseClass.findOne({ code: req.params.code.toUpperCase(), isActive: true });
  if (!license) {
    res.status(404);
    throw new Error('License class not found');
  }
  res.json(license);
});

export const getLicenseStatistics = asyncHandler(async (req, res) => {
  const licenses = await LicenseClass.find({ isActive: true }).sort({ sortOrder: 1, code: 1 }).select('code');
  res.json({
    total: licenses.length,
    codes: licenses.map((license) => license.code)
  });
});

export const refreshLicenses = asyncHandler(async (req, res) => {
  const result = await seedLicenses();
  res.json(result);
});
