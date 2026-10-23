import Service from '../models/Service.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import Client from '../models/Client.js';
import Enquiry from '../models/Enquiry.js';
import Media from '../models/Media.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const stats = asyncHandler(async (_req, res) => {
  const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - 13);
  const [services, projects, team, clients, media, users, byStatus, recent, daily] = await Promise.all([
    Service.countDocuments(), Project.countDocuments(), TeamMember.countDocuments(), Client.countDocuments(),
    Media.countDocuments(), User.countDocuments(),
    Enquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Enquiry.find().sort('-createdAt').limit(6).select('name email service status createdAt'),
    Enquiry.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }]),
  ]);
  const enquiries = { new: 0, 'in-progress': 0, closed: 0 };
  byStatus.forEach((s) => { enquiries[s._id] = s.n; });
  const map = Object.fromEntries(daily.map((d) => [d._id, d.n]));
  const trend = Array.from({ length: 14 }, (_, i) => { const d = new Date(since); d.setDate(since.getDate() + i); const key = d.toISOString().slice(0, 10); return { date: key, n: map[key] || 0 }; });
  res.json({ success: true, data: { counts: { services, projects, team, clients, media, users }, enquiries, recent, trend } });
});
