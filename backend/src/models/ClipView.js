import mongoose from 'mongoose';

const clipViewSchema = new mongoose.Schema(
  {
    clipId: { type: String, required: true, unique: true, index: true },
    views: { type: Number, default: 0, min: 0 },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: 'clip_views' }
);

const ClipView = mongoose.model('ClipView', clipViewSchema);

export default ClipView;
