import type { Migration } from '../types';
import { v001 } from './v001_initial';
import { v002 } from './v002_inventory';

export const migrations: Migration[] = [v001, v002];
