import mongoose from 'mongoose';

const trafficSignSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    group: { type: String, required: true, index: true },
    groupSlug: { type: String, required: true, index: true },
    image: { type: String, default: null },
    imageUrl: { type: String, default: null },
    sourceUrl: { type: String, default: 'https://onthigplx.edu.vn/traffic-signs.html' },
    signHash: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true, collection: 'traffic_signs' }
);

trafficSignSchema.index({ code: 1 }, { unique: true, sparse: true });
trafficSignSchema.index({ code: 'text', name: 'text', description: 'text', group: 'text' });

const TrafficSign = mongoose.model('TrafficSign', trafficSignSchema);

export default TrafficSign;
