import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedQuestions } from '../services/seed.service.js';
import { seedTrafficSigns } from '../services/traffic-sign.service.js';
import { seedLicenses } from '../services/license.service.js';
import { seedExamSets } from '../services/exam.service.js';

const runStep = async (name, action) => {
  console.log(`\n[seed-all] ${name}`);
  const result = await action();
  if (Array.isArray(result)) {
    console.table(result);
  } else if (result?.sources || result?.summary) {
    if (result.sources) console.table(result.sources);
    if (result.summary) console.table([result.summary]);
  } else {
    console.log(result);
  }
};

const run = async () => {
  try {
    await connectDB();
    await runStep('questions', seedQuestions);
    await runStep('traffic signs', seedTrafficSigns);
    await runStep('licenses', seedLicenses);
    await runStep('exam sets', seedExamSets);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
