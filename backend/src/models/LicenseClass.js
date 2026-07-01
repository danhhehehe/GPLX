import mongoose from 'mongoose';

const licenseClassSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    minAge: { type: Number, default: null },
    requirements: [{ type: String }],
    vehicleType: { type: String, default: '' },
    questionCount: { type: Number, default: null },
    passingScore: { type: Number, default: null },
    durationMinutes: { type: Number, default: null },
    sortOrder: { type: Number, default: 999 },
    isActive: { type: Boolean, default: true, index: true },
    sourceUrl: { type: String, default: '' },
    rawData: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true, collection: 'license_classes' }
);

const LicenseClass = mongoose.model('LicenseClass', licenseClassSchema);

export default LicenseClass;
