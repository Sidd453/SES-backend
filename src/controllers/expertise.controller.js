import Expertise from '../models/Expertise.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Expertise, { searchFields: ['title', 'text'], filterable: ['isActive'] });
