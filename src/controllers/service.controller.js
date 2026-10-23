import Service from '../models/Service.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Service, { searchFields: ['title', 'short'], filterable: ['isActive'], imageFields: ['image'], populate: { path: 'related', select: 'title slug' } });
