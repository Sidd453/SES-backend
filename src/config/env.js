import 'dotenv/config';

const required = ['MONGO_URI', 'JWT_SECRET'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing required env var ${k}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  origins: (process.env.CLIENT_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'ses',
  },
};
