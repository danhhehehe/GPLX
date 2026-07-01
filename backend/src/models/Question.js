import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    a: { type: String, default: '' },
    b: { type: String, default: '' },
    c: { type: String, default: '' },
    d: { type: String, default: '' }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, index: true },
    sourceQuestionId: { type: String, index: true },
    sourceKey: { type: String, index: true },
    sourceType: { type: String, index: true },
    sourceTypes: [{ type: String, index: true }],
    question: { type: String, required: true, trim: true },
    normalizedQuestion: { type: String, required: true, index: true },
    questionHash: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: 'Chua phan loai', index: true },
    topic: { type: String, default: '', index: true },
    licenseTypes: [{ type: String, index: true }],
    isPointDeduction: { type: Boolean, default: false, index: true },
    examFormat: { type: String, default: '' },
    options: { type: optionSchema, default: () => ({}) },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: '' },
    references: [{ type: String }],
    difficulty: { type: String, default: '' },
    topics: [{ type: String }],
    image: { type: String, default: null },
    imageUrl: { type: String, default: null, index: true },
    hasImage: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

questionSchema.index({ question: 'text', normalizedQuestion: 'text', category: 'text', topic: 'text', topics: 'text' });

const Question = mongoose.model('Question', questionSchema);

export default Question;
