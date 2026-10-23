import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (uri = env.mongoUri) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};
