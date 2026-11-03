import { getDb } from '../../core/db/db-instance';

export interface Item {
  id: number;
  code: string;
  name: string;
  barcode: string | null;
  unit: string;
  min_stock: number;
  is_active: number;
}

export async function getAllItems(): Promise<Item[]> {
  const db = getDb();
  return await db.query<Item>(`SELECT * FROM items ORDER BY name ASC`);
}

export async function addItem(data: Omit<Item, 'id' | 'is_active'>): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO items (code, name, barcode, unit, min_stock, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.code, data.name, data.barcode || null, data.unit, data.min_stock, now, now]
  );
  const res = await db.queryOne<{ id: number }>(`SELECT last_insert_rowid() as id`);
  return res?.id || 0;
}
