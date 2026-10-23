import mongoose from 'mongoose';
import { imageField } from './_image.js';

// One editable block on a page, bound in HTML with data-cms="<key>".
const contentSchema = new mongoose.Schema({
  page: { type: String, required: true, index: true },
  key: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['text', 'html', 'image', 'count'], default: 'text' },
  label: { type: String, trim: true },
  section: { type: String, trim: true, default: '' },
  value: { type: String, default: '' },      // text/html, or count number
  suffix: { type: String, default: '' },     // for count
  href: { type: String, default: '' },       // optional link target
  hasHref: { type: Boolean, default: false },
  image: imageField,                         // for type=image
  alt: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Content', contentSchema);
