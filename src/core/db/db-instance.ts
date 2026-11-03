import { CapacitorSqliteService } from './capacitor-sqlite.service';
let instance: CapacitorSqliteService | null = null;
export function getDb(): CapacitorSqliteService {
  if (!instance) instance = new CapacitorSqliteService();
  return instance;
}
