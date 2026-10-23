import Page from '../models/Page.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Page, { searchFields: ['name', 'slug'], imageFields: ['ogImage'], sort: 'slug' });
