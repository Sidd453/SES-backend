import mongoose from 'mongoose';
import { ALL_PERMISSIONS } from '../utils/permissions.js';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_-]+$/ },
  label: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  permissions: { type: [String], default: [], validate: { validator: (a) => a.every((p) => p === '*' || ALL_PERMISSIONS.includes(p)), message: 'Unknown permission' } },
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
