import mongoose from 'mongoose';
import { imageField } from './_image.js';
import { toSlug } from '../utils/slug.js';

const serviceSchema = new mongoose.Schema({
  slug: { type: String, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true },
  icon: { type: String, default: 'building-2', trim: true }, // Lucide icon name
  image: imageField,
  short: { type: String, trim: true },
  overview: { type: String, trim: true },
  involves: [String],
  uses: [String],
  related: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

serviceSchema.pre('validate', function slug(next) { if (!this.slug) this.slug = toSlug(this.title); next(); });

export default mongoose.model('Service', serviceSchema);
