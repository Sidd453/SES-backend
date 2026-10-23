import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, trim: true, maxlength: 160 },
  email: { type: String, required: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ },
  phone: { type: String, trim: true, maxlength: 30 },
  service: { type: String, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  status: { type: String, enum: ['new', 'in-progress', 'closed'], default: 'new', index: true },
  notes: { type: String, default: '' },
  ip: String,
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
