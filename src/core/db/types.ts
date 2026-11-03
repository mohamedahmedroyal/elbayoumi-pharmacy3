export interface DatabaseService {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  getVersion(): Promise<number>;
}

export interface Migration {
  version: number;
  name: string;
  up: (db: DatabaseService) => Promise<void>;
}
