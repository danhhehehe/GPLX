import mongoose from 'mongoose';

const dataSourceStatusSchema = new mongoose.Schema(
  {
    sourceName: { type: String, required: true, trim: true },
    sourceUrl: { type: String, default: '' },
    type: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: ['success', 'failed', 'stale', 'unknown'], default: 'unknown' },
    lastSuccessAt: { type: Date, default: null },
    lastFailedAt: { type: Date, default: null },
    lastErrorMessage: { type: String, default: '' },
    totalRecords: { type: Number, default: 0 },
    localBackupPath: { type: String, default: '' },
    isUsingFallback: { type: Boolean, default: false }
  },
  { timestamps: true }
);

dataSourceStatusSchema.index({ type: 1, sourceName: 1 }, { unique: true });

const DataSourceStatus = mongoose.model('DataSourceStatus', dataSourceStatusSchema);

export default DataSourceStatus;
