import mongoose from 'mongoose';

const roadSituationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ['road', 'simulation'], default: 'road', index: true },
    description: { type: String, default: '' },
    instruction: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    tags: [{ type: String }],
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

roadSituationSchema.index({ title: 'text', description: 'text', instruction: 'text', tags: 'text' });

const RoadSituation = mongoose.model('RoadSituation', roadSituationSchema);

export default RoadSituation;
