import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { DatabaseService } from './types';

const DB_NAME = 'elbayoumi_pharmacy';
const DB_VERSION = 1;

export class CapacitorSqliteService implements DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private opening: Promise<void> | null = null;

  async open(): Promise<void> {
    if (this.db) return;
    if (this.opening) return this.opening;
    this.opening = (async () => {
      const consist = await this.sqlite.checkConnectionsConsistency().catch(() => ({ result: false }));
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;
      if (consist.result && isConn) this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      else this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);
      if (!(await this.db.isDBOpen()).result) await this.db.open();
    })();
    try { await this.opening; } finally { this.opening = null; }
  }

  private ensure(): SQLiteDBConnection {
    if (!this.db) throw new Error('DB not open');
    return this.db;
  }

  async execute(sql: string, params: unknown[] = []): Promise<void> {
    const db = this.ensure();
    if (params.length > 0) {
      await db.run(sql, params as never[]);
    } else {
      await db.execute(sql); 
    }
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const db = this.ensure();
    const r = params.length > 0 ? await db.query(sql, params as never[]) : await db.query(sql);
    return (r.values ?? []) as T[];
  }

  async queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn(); 
  }

  async getVersion(): Promise<number> {
    try {
      const row = await this.queryOne<{ v: number }>(`SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations`);
      return row?.v ?? 0;
    } catch {
      return 0;
    }
  }
}
