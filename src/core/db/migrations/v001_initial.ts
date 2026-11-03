import type { Migration } from '../types';

export const v001: Migration = {
  version: 1, name: 'initial',
  up: async (db) => {
    await db.execute(`CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL);`);
    await db.execute(`CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
    await db.execute(`CREATE TABLE companies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, phone TEXT, notes TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
    const now = new Date().toISOString();
    await db.execute(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)`, ['app_name', 'البيومي فارمسي', now]);
  },
};
