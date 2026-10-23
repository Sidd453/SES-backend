import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { stats } from '../controllers/dashboard.controller.js';
import publicRoutes from './public.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import serviceRoutes from './service.routes.js';
import projectRoutes from './project.routes.js';
import categoryRoutes from './category.routes.js';
import teamRoutes from './team.routes.js';
import clientRoutes from './client.routes.js';
import softwareRoutes from './software.routes.js';
import expertiseRoutes from './expertise.routes.js';
import standardRoutes from './standard.routes.js';
import menuRoutes from './menu.routes.js';
import pageRoutes from './page.routes.js';
import contentRoutes from './content.routes.js';
import settingRoutes from './setting.routes.js';
import mediaRoutes from './media.routes.js';
import enquiryRoutes from './enquiry.routes.js';

const api = Router();

api.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));
api.use('/public', publicRoutes);   // no auth
api.use('/auth', authRoutes);

// Everything below requires a valid token; each route adds its own RBAC permission.
api.use(protect);
api.get('/dashboard', stats);
api.use('/users', userRoutes);
api.use('/roles', roleRoutes);
api.use('/services', serviceRoutes);
api.use('/projects', projectRoutes);
api.use('/categories', categoryRoutes);
api.use('/team', teamRoutes);
api.use('/clients', clientRoutes);
api.use('/software', softwareRoutes);
api.use('/expertise', expertiseRoutes);
api.use('/standards', standardRoutes);
api.use('/menus', menuRoutes);
api.use('/pages', pageRoutes);
api.use('/content', contentRoutes);
api.use('/settings', settingRoutes);
api.use('/media', mediaRoutes);
api.use('/enquiries', enquiryRoutes);

export default api;
