import Menu from '../models/Menu.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Menu, { searchFields: ['label', 'href'], filterable: ['location', 'isVisible'], sort: 'location order' });
