import mongoose from 'mongoose';
import { imageField } from './_image.js';
import { toSlug } from '../utils/slug.js';

const projectSchema = new mongoose.Schema({
  slug: { type: String, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  catLabel: { type: String, trim: true },
  location: { type: String, trim: true },
  image: imageField,
  type: { type: String, default: 'Photograph from company profile', trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: ['', 'Ongoing', 'Completed'], default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

projectSchema.pre('validate', function slug(next) { if (!this.slug) this.slug = toSlug(this.title); next(); });

export default mongoose.model('Project', projectSchema);
