import { Router } from 'express';
import { authorize } from '../middleware/auth.js';

/** Builds a standard RBAC-protected REST router: GET /, GET /:id, POST /, PUT /:id, DELETE /:id */
export const resourceRouter = (resource, c) => {
  const r = Router();
  r.get('/', authorize(`${resource}:read`), c.list);
  r.get('/:id', authorize(`${resource}:read`), c.get);
  r.post('/', authorize(`${resource}:create`), c.create);
  r.put('/:id', authorize(`${resource}:update`), c.update);
  r.delete('/:id', authorize(`${resource}:delete`), c.remove);
  return r;
};
