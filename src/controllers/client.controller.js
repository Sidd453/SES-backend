import Client from '../models/Client.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(Client, { searchFields: ['name'], filterable: ['isActive'], imageFields: ['logo'], sort: 'order name' });
