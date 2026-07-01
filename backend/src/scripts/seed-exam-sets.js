import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedExamSets } from '../services/exam.service.js';

const run = async () => {
  try {
    await connectDB();
    const result = await seedExamSets();
    console.table(result);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
