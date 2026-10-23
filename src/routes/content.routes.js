import { Router } from 'express';
import * as c from '../controllers/content.controller.js';
import { authorize } from '../middleware/auth.js';

// Page body blocks use the "pages" permission group.
const r = Router();
r.get('/pages', authorize('pages:read'), c.pages);
r.get('/', authorize('pages:read'), c.list);
r.put('/bulk', authorize('pages:update'), c.bulkUpdate);
r.put('/:id', authorize('pages:update'), c.update);
export default r;
