import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hasPermission } from '../utils/permissions.js';

/** Verifies the Bearer token and attaches req.user (with populated role). */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized();
  let payload;
  try { payload = jwt.verify(token, env.jwtSecret); } catch { throw ApiError.unauthorized('Session expired, please log in again'); }
  const user = await User.findById(payload.id).populate('role');
  if (!user || !user.isActive || !user.role) throw ApiError.unauthorized('Account disabled or removed');
  req.user = user;
  next();
});

/** RBAC gate: authorize('services:update') — superadmin ('*') passes everything. */
export const authorize = (...needed) => (req, _res, next) => {
  const granted = req.user?.role?.permissions || [];
  if (needed.every((p) => hasPermission(granted, p))) return next();
  next(ApiError.forbidden());
};

export const isSuperAdmin = (user) => user?.role?.name === 'superadmin';
