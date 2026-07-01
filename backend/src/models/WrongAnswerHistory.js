import mongoose from 'mongoose';

const wrongAnswerHistorySchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    questionHash: { type: String, index: true },
    selectedAnswer: { type: mongoose.Schema.Types.Mixed, default: [] },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, default: [] },
    licenseType: { type: String, default: '', index: true },
    attemptCount: { type: Number, default: 1 },
    fixedAt: { type: Date, default: null },
    lastWrongAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'wrong_answer_histories' }
);

wrongAnswerHistorySchema.index({ question: 1, licenseType: 1 }, { unique: true });

const WrongAnswerHistory = mongoose.model('WrongAnswerHistory', wrongAnswerHistorySchema);

export default WrongAnswerHistory;
