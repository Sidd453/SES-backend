import Category from '../models/Category.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Category, { searchFields: ['label'], filterable: ['isActive'] });
