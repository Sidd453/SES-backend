import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { cloudinaryEnabled } from './config/cloudinary.js';
import app from './app.js';

await connectDB();
const server = app.listen(env.port, () => {
  console.log(`SES server running on http://localhost:${env.port}`);
  console.log(`  Website : http://localhost:${env.port}/`);
  console.log(`  Admin   : http://localhost:${env.port}/admin/`);
  console.log(`  API     : http://localhost:${env.port}/api/health`);
  if (!cloudinaryEnabled) console.warn('  ! Cloudinary not configured - image uploads from the admin panel are disabled until CLOUDINARY_* are set.');
});

const shutdown = (sig) => () => {
  console.log(`${sig} received, shutting down...`);
  server.close(async () => { await mongoose.disconnect(); process.exit(0); });
};
process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
