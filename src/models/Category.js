import mongoose from 'mongoose';
import { toSlug } from '../utils/slug.js';

const categorySchema = new mongoose.Schema({
  key: { type: String, unique: true, trim: true, lowercase: true },
  label: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.pre('validate', function slug(next) { if (!this.key) this.key = toSlug(this.label); next(); });

export default mongoose.model('Category', categorySchema);
