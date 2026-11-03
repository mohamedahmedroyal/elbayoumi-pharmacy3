import { describe, it, expect } from 'vitest';
import { MigrationRunner } from './migration-runner';
import type { DatabaseService, Migration } from './types';

class FakeDb implements DatabaseService {
  applied = new Map<number, string>();
  async execute(sql: string, params?: unknown[]): Promise<void> {
    if (sql.includes('INSERT INTO schema_migrations') && params) {
      this.applied.set(params[0] as number, params[1] as string);
    }
  }
  async query<T>(): Promise<T[]> { return []; }
  async queryOne<T>(): Promise<T | null> { return null; }
  async transaction<T>(fn: () => Promise<T>): Promise<T> { return fn(); }
  async getVersion(): Promise<number> {
    return this.applied.size ? Math.max(...this.applied.keys()) : 0;
  }
}

describe('MigrationRunner', () => {
  it('runs', async () => {
    const db = new FakeDb(); 
    const m: Migration = { version: 1, name: 'a', up: async () => {} };
    await new MigrationRunner(db, [m]).run(); 
    expect(await db.getVersion()).toBe(1);
  });
});
