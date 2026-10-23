import mongoose from 'mongoose';
import { imageField } from './_image.js';

const person = new mongoose.Schema({ name: String, role: String, phone: String, email: String }, { _id: false });
const link = new mongoose.Schema({ label: String, url: String }, { _id: false });

// Singleton document (key = 'site')
const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'site', unique: true },
  siteName: { type: String, default: 'Samarth Engineering Services' },
  brandPrimary: { type: String, default: 'SAMARTH' },
  brandSecondary: { type: String, default: 'Engineering Services' },
  tagline: String,
  logo: imageField,
  favicon: imageField,
  footerAbout: String,
  copyright: { type: String, default: 'Samarth Engineering Services. All rights reserved.' },
  headerCtaLabel: { type: String, default: 'Request a Consultation' },
  headerCtaHref: { type: String, default: 'contact.html#enquiry' },
  tickerItems: { type: [String], default: [] },
  contact: {
    website: String,
    addressLines: [String],
    mapQuery: String,
    people: [person],
  },
  social: [link],
  enquiryNotifyEmail: String,
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
