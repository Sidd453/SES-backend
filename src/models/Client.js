import mongoose from 'mongoose';
import { imageField } from './_image.js';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: imageField,
  website: { type: String, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);
