import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { cloudinaryEnabled } from './config/cloudinary.js';
import app from './app.js';

// Start listening FIRST so Render sees the port immediately; connect to MongoDB with retries in the background.
const server = app.listen(env.port, () => {
  console.log(`SES server running on port ${env.port}`);
  console.log(`  API     : /api/health   Site data: /api/public/site?page=home`);
  if (!cloudinaryEnabled) console.warn('  ! Cloudinary not configured - image uploads from the admin panel are disabled until CLOUDINARY_* are set.');
});
const connectWithRetry = async (attempt = 1) => {
  try { await connectDB(); }
  catch (e) {
    console.error(`MongoDB connection failed (attempt ${attempt}): ${e.message}`);
    console.error('  -> Check MONGO_URI on Render and that Atlas > Network Access allows 0.0.0.0/0');
    setTimeout(() => connectWithRetry(attempt + 1), Math.min(30000, 3000 * attempt));
  }
};
connectWithRetry();

const shutdown = (sig) => () => {
  console.log(`${sig} received, shutting down...`);
  server.close(async () => { await mongoose.disconnect(); process.exit(0); });
};
process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
