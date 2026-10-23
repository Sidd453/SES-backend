import Standard from '../models/Standard.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Standard, { searchFields: ['text'], filterable: ['isActive'] });
