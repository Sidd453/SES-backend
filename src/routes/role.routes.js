import { Router } from 'express';
import * as c from '../controllers/role.controller.js';
import { authorize } from '../middleware/auth.js';

const r = Router();
r.get('/', authorize('roles:read'), c.list);
r.post('/', authorize('roles:create'), c.create);
r.put('/:id', authorize('roles:update'), c.update);
r.delete('/:id', authorize('roles:delete'), c.remove);
export default r;
