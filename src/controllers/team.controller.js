import TeamMember from '../models/TeamMember.js';
import { crud } from './crudFactory.js';

export const { list, get, create, update, remove } = crud(TeamMember, { searchFields: ['name', 'role'], filterable: ['isActive'], imageFields: ['photo'] });
