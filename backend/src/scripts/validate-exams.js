import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { generateRandomExam, validateGeneratedExam } from '../services/exam.service.js';

const LICENSES = ['A1', 'A', 'B1', 'B', 'C1', 'C', 'D', 'E'];
const RUNS_PER_LICENSE = 20;

const run = async () => {
  let hasError = false;

  try {
    await connectDB();

    for (const licenseType of LICENSES) {
      let validCount = 0;

      for (let index = 1; index <= RUNS_PER_LICENSE; index += 1) {
        try {
          const { config, questions } = await generateRandomExam(licenseType);
          validateGeneratedExam(questions, config, { label: `random #${index}` });
          validCount += 1;
        } catch (error) {
          hasError = true;
          const details = error.validationErrors || [error.message];
          for (const detail of details) {
            console.error(`[ERROR] ${licenseType}: de random #${index} ${detail}`);
          }
        }
      }

      if (validCount === RUNS_PER_LICENSE) {
        console.log(`[OK] ${licenseType}: ${validCount}/${RUNS_PER_LICENSE} de ngau nhien hop le`);
      } else {
        console.error(`[ERROR] ${licenseType}: ${validCount}/${RUNS_PER_LICENSE} de ngau nhien hop le`);
      }
    }
  } catch (error) {
    hasError = true;
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }

  if (hasError) process.exitCode = 1;
};

run();
