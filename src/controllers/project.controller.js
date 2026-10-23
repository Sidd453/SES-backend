import Project from '../models/Project.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Project, { searchFields: ['title', 'location', 'catLabel'], filterable: ['isActive', 'featured', 'status'], imageFields: ['image'], populate: { path: 'categories', select: 'label key' } });
