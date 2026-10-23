import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  location: { type: String, enum: ['header', 'footer'], default: 'header', index: true },
  label: { type: String, required: true, trim: true },
  href: { type: String, required: true, trim: true },
  page: { type: String, trim: true, default: '' }, // matches <body data-page="..."> for the active state
  openInNewTab: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);
