import mongoose from 'mongoose';
import { imageField } from './_image.js';

// Per-page SEO. Page body text/images live in Content.
const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true }, // home, about, services, projects, contact, 404
  name: { type: String, required: true, trim: true },
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  ogImage: imageField,
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);
