import mongoose from 'mongoose';

// Design codes / standards (IS 800, AISC 360 ...)
const standardSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Standard', standardSchema);
