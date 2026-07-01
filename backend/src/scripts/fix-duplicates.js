import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { fixDuplicateQuestions } from '../services/question-dedupe.service.js';

const run = async () => {
  try {
    await connectDB();
    const result = await fixDuplicateQuestions();
    console.table([result]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
