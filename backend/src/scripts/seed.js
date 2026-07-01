import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { seedQuestions } from '../services/seed.service.js';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await connectDB();
    const results = await seedQuestions();
    console.table(results.sources);
    console.table([results.summary]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
