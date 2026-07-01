import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGO_URI is missing. Create backend/.env from .env.example.');
  }

  mongoose.set('strictQuery', true);
  try {
    const connection = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    throw new Error('MongoDB connection failed. Check database configuration.');
  }
};
