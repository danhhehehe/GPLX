import mongoose from 'mongoose';

const examSetSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true },
    licenseType: { type: String, required: true, uppercase: true, index: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    questionHashes: [{ type: String }],
    questionCount: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    passingScore: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isRandomGenerated: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'exam_sets' }
);

const ExamSet = mongoose.model('ExamSet', examSetSchema);

export default ExamSet;
