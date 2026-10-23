import { Router } from 'express';
import * as c from '../controllers/enquiry.controller.js';
import { authorize } from '../middleware/auth.js';

const r = Router();
r.get('/', authorize('enquiries:read'), c.list);
r.get('/:id', authorize('enquiries:read'), c.get);
r.put('/:id', authorize('enquiries:update'), c.update);
r.delete('/:id', authorize('enquiries:delete'), c.remove);
export default r;
