import { getDb } from '../../core/db/db-instance';

export interface Batch {
  id: number;
  item_id: number;
  item_name?: string; // تأتي من الربط مع جدول الأصناف
  batch_number: string;
  expiry_date: string;
  qty_received: number;
  qty_remaining: number;
  purchase_price: number; // بالقروش
}

// جلب كل التشغيلات مرتبة حسب تاريخ الانتهاء (FEFO)
export async function getAllBatches(): Promise<Batch[]> {
  const db = getDb();
  return await db.query<Batch>(`
    SELECT b.*, i.name as item_name 
    FROM batches b 
    JOIN items i ON b.item_id = i.id 
    ORDER BY b.expiry_date ASC
  `);
}

export async function addBatch(data: Omit<Batch, 'id' | 'item_name'>): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO batches (item_id, batch_number, expiry_date, qty_received, qty_remaining, purchase_price, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.item_id, data.batch_number, data.expiry_date, data.qty_received, data.qty_remaining, data.purchase_price, now]
  );
  const res = await db.queryOne<{ id: number }>(`SELECT last_insert_rowid() as id`);
  return res?.id || 0;
}
