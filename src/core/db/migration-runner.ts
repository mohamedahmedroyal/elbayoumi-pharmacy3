import type { DatabaseService, Migration } from './types';

export class MigrationRunner {
  private migrations: Migration[];
  constructor(private db: DatabaseService, migrations: Migration[]) {
    this.migrations = [...migrations].sort((a, b) => a.version - b.version);
    const seen = new Set<number>(); 
    for (const m of this.migrations) { 
      if (seen.has(m.version)) throw new Error(`Duplicate v${m.version}`); 
      seen.add(m.version); 
    }
  }
  async run(): Promise<{ from: number; to: number; applied: number[] }> {
    await this.db.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, applied_at TEXT NOT NULL);`);
    const from = await this.db.getVersion(); 
    const pending = this.migrations.filter((m) => m.version > from); 
    const applied: number[] = [];
    for (const m of pending) { 
      await this.db.transaction(async () => { 
        await m.up(this.db); 
        await this.db.execute(`INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)`, [m.version, m.name, new Date().toISOString()]); 
      }); 
      applied.push(m.version); 
    }
    return { from, to: await this.db.getVersion(), applied };
  }
}
