import { Router } from 'express';
import * as c from '../controllers/media.controller.js';
import { authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const r = Router();
r.get('/', authorize('media:read'), c.list);
r.post('/', authorize('media:create'), upload.array('files', 10), c.upload);
r.delete('/:id', authorize('media:delete'), c.remove);
export default r;
