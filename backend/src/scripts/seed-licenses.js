import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedLicenses } from '../services/license.service.js';

const run = async () => {
  try {
    await connectDB();
    const result = await seedLicenses();
    console.table([result]);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
