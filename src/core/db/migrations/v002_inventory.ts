import type { Migration } from '../types';

export const v002: Migration = {
  version: 2,
  name: 'inventory_and_contacts',
  up: async (db) => {
    // 1. العملاء
    await db.execute(`
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        balance INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // 2. الموردين
    await db.execute(`
      CREATE TABLE suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        balance INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // 3. الأصناف
    await db.execute(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        barcode TEXT UNIQUE,
        category_id INTEGER REFERENCES categories(id),
        company_id INTEGER REFERENCES companies(id),
        unit TEXT NOT NULL,
        min_stock REAL NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 4. التشغيلات (Batches) - نظام FEFO
    await db.execute(`
      CREATE TABLE batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id),
        supplier_id INTEGER REFERENCES suppliers(id),
        batch_number TEXT NOT NULL,
        production_date TEXT,
        expiry_date TEXT NOT NULL,
        qty_received REAL NOT NULL,
        qty_remaining REAL NOT NULL,
        purchase_price INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // 5. حركات المخزون (Stock Movements)
    await db.execute(`
      CREATE TABLE stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id),
        batch_id INTEGER REFERENCES batches(id),
        movement_type TEXT NOT NULL,
        qty REAL NOT NULL,
        reference_id INTEGER,
        reference_type TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // إضافة فهارس (Indexes) لتحسين سرعة البحث
    await db.execute(`CREATE INDEX idx_items_barcode ON items(barcode);`);
    await db.execute(`CREATE INDEX idx_batches_item_id ON batches(item_id);`);
    await db.execute(`CREATE INDEX idx_batches_expiry ON batches(expiry_date);`);
  },
};
