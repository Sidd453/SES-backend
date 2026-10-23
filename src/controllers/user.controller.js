import User from '../models/User.js';
import Role from '../models/Role.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isSuperAdmin } from '../middleware/auth.js';

const guardSuperAdmin = async (req, targetRoleId, existingUser) => {
  if (isSuperAdmin(req.user)) return;
  const role = targetRoleId ? await Role.findById(targetRoleId) : null;
  if (role?.name === 'superadmin') throw ApiError.forbidden('Only a Super Admin can assign the Super Admin role');
  if (existingUser?.role?.name === 'superadmin') throw ApiError.forbidden('Only a Super Admin can modify a Super Admin');
};

export const list = asyncHandler(async (req, res) => {
  const filter = req.query.search ? { $or: [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }] } : {};
  const data = await User.find(filter).populate('role', 'name label').sort('-createdAt');
  res.json({ success: true, data, total: data.length });
});

export const get = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id).populate('role', 'name label');
  if (!u) throw ApiError.notFound('User not found');
  res.json({ success: true, data: u });
});

export const create = asyncHandler(async (req, res) => {
  const { name, email, password, role, isActive } = req.body;
  await guardSuperAdmin(req, role);
  const u = await User.create({ name, email, password, role, isActive });
  res.status(201).json({ success: true, data: await u.populate('role', 'name label') });
});

export const update = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id).populate('role');
  if (!u) throw ApiError.notFound('User not found');
  const { name, email, password, role, isActive } = req.body;
  await guardSuperAdmin(req, role, u);
  const isSelf = String(u._id) === String(req.user._id);
  if (isSelf && (isActive === false || (role && String(role) !== String(u.role._id)))) throw ApiError.badRequest('You cannot change your own role or disable yourself');
  if (name !== undefined) u.name = name;
  if (email !== undefined) u.email = email;
  if (isActive !== undefined) u.isActive = isActive;
  if (role) u.role = role;
  if (password) u.password = password;
  await u.save();
  res.json({ success: true, data: await u.populate('role', 'name label') });
});

export const remove = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id).populate('role');
  if (!u) throw ApiError.notFound('User not found');
  if (String(u._id) === String(req.user._id)) throw ApiError.badRequest('You cannot delete your own account');
  await guardSuperAdmin(req, null, u);
  await u.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});
