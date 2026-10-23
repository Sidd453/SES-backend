import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true, unique: true },
  folder: { type: String, default: 'general', index: true },
  originalName: String,
  format: String,
  bytes: Number,
  width: Number,
  height: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);
