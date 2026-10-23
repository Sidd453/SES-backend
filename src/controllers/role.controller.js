import Role from '../models/Role.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ALL_PERMISSIONS, RESOURCES, ACTIONS } from '../utils/permissions.js';

export const list = asyncHandler(async (_req, res) => {
  const data = await Role.find().sort('createdAt');
  res.json({ success: true, data, meta: { resources: RESOURCES, actions: ACTIONS, allPermissions: ALL_PERMISSIONS } });
});

export const create = asyncHandler(async (req, res) => {
  const { name, label, description, permissions } = req.body;
  if (permissions?.includes('*')) throw ApiError.badRequest('Wildcard permission is reserved for the Super Admin role');
  res.status(201).json({ success: true, data: await Role.create({ name, label, description, permissions }) });
});

export const update = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.name === 'superadmin') throw ApiError.badRequest('The Super Admin role cannot be modified');
  const { label, description, permissions } = req.body;
  if (permissions?.includes('*')) throw ApiError.badRequest('Wildcard permission is reserved for the Super Admin role');
  if (label !== undefined) role.label = label;
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = permissions;
  await role.save();
  res.json({ success: true, data: role });
});

export const remove = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem) throw ApiError.badRequest('System roles cannot be deleted');
  if (await User.exists({ role: role._id })) throw ApiError.conflict('Reassign the users of this role before deleting it');
  await role.deleteOne();
  res.json({ success: true, message: 'Role deleted' });
});
