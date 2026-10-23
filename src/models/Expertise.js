import mongoose from 'mongoose';

const expertiseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  text: { type: String, trim: true },
  icon: { type: String, default: 'cog', trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Expertise', expertiseSchema);
