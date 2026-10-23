import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sign = (id) => jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const shape = (u) => ({ id: u._id, name: u.name, email: u.email, role: { name: u.role.name, label: u.role.label }, permissions: u.role.permissions });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw ApiError.badRequest('Email and password are required');
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password').populate('role');
  if (!user || !(await user.matchPassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been disabled');
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });
  res.json({ success: true, token: sign(user._id), user: shape(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: shape(req.user) }));

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) throw ApiError.badRequest('New password must be at least 8 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) throw ApiError.badRequest('Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});
