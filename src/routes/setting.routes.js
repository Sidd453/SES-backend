import { Router } from 'express';
import * as c from '../controllers/setting.controller.js';
import { authorize } from '../middleware/auth.js';

const r = Router();
r.get('/', authorize('settings:read'), c.get);
r.put('/', authorize('settings:update'), c.update);
export default r;
