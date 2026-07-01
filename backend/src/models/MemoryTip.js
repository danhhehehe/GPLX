import mongoose from 'mongoose';

const memoryTipBlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['text', 'list'], default: 'text' },
    value: { type: String, default: '' },
    items: [{ type: String }]
  },
  { _id: false }
);

const memoryTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    content: { type: [memoryTipBlockSchema], default: [] },
    category: { type: String, default: 'Chung', index: true },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

memoryTipSchema.index({ title: 'text', category: 'text', 'content.value': 'text', 'content.items': 'text' });

const MemoryTip = mongoose.model('MemoryTip', memoryTipSchema);

export default MemoryTip;
