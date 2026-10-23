import { Router } from 'express';
import { login, me, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const r = Router();
r.post('/login', loginLimiter, login);
r.get('/me', protect, me);
r.put('/password', protect, changePassword);
export default r;
