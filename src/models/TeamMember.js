import mongoose from 'mongoose';
import { imageField } from './_image.js';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, trim: true },
  qualification: { type: String, trim: true },
  experience: { type: String, trim: true },
  bio: { type: String, trim: true },
  photo: imageField,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamSchema);
