import mongoose from 'mongoose';

const softwareSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  note: { type: String, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Software', softwareSchema);
