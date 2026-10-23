// Single source of truth for RBAC. Permission string = "<resource>:<action>".
export const RESOURCES = [
  'services', 'projects', 'categories', 'team', 'clients', 'software', 'expertise', 'standards',
  'pages', 'menus', 'settings', 'enquiries', 'media', 'users', 'roles',
];
export const ACTIONS = ['read', 'create', 'update', 'delete'];

export const ALL_PERMISSIONS = RESOURCES.flatMap((r) => ACTIONS.map((a) => `${r}:${a}`));

const CONTENT = ['services', 'projects', 'categories', 'team', 'clients', 'software', 'expertise', 'standards', 'pages', 'menus', 'media'];
const perms = (resources, actions) => resources.flatMap((r) => actions.map((a) => `${r}:${a}`));

export const DEFAULT_ROLES = [
  { name: 'superadmin', label: 'Super Admin', description: 'Full access, including roles & users', isSystem: true, permissions: ['*'] },
  {
    name: 'admin', label: 'Admin', description: 'Manage all content, settings, enquiries and users (not roles)', isSystem: true,
    permissions: [...perms(CONTENT, ACTIONS), ...perms(['settings'], ['read', 'update']), ...perms(['enquiries'], ACTIONS),
      ...perms(['users'], ['read', 'create', 'update']), 'roles:read'],
  },
  {
    name: 'editor', label: 'Editor', description: 'Create and edit website content; read enquiries', isSystem: true,
    permissions: [...perms(CONTENT, ['read', 'create', 'update']), 'settings:read', 'enquiries:read', 'enquiries:update'],
  },
  {
    name: 'viewer', label: 'Viewer', description: 'Read-only access', isSystem: true,
    permissions: [...perms([...CONTENT, 'settings', 'enquiries'], ['read'])],
  },
];

export const hasPermission = (granted = [], needed) =>
  granted.includes('*') || granted.includes(needed) || granted.includes(`${needed.split(':')[0]}:*`);
