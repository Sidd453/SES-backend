import Software from '../models/Software.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Software, { searchFields: ['name', 'note'], filterable: ['isActive'] });
