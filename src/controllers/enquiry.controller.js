import Enquiry from '../models/Enquiry.js';
import { crud } from './crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const base = crud(Enquiry, { searchFields: ['name', 'email', 'company', 'message', 'service'], filterable: ['status'], sort: '-createdAt' });
export const { list, get, remove } = base;

// Admin may only change status/notes
export const update = asyncHandler(async (req, res) => {
  const e = await Enquiry.findById(req.params.id);
  if (!e) throw ApiError.notFound();
  if (req.body.status) e.status = req.body.status;
  if (req.body.notes !== undefined) e.notes = req.body.notes;
  await e.save();
  res.json({ success: true, data: e });
});

// Public form submission
export const submit = asyncHandler(async (req, res) => {
  const { name, company, email, phone, service, message, website } = req.body || {};
  if (website) return res.status(201).json({ success: true }); // honeypot: pretend success to bots
  await Enquiry.create({ name, company, email, phone, service, message, ip: req.ip });
  res.status(201).json({ success: true, message: 'Thank you — your enquiry has been received.' });
});
