import { useEffect, useRef, useState } from 'react';
import { getDb } from './core/db/db-instance';
import { MigrationRunner } from './core/db/migration-runner';
import { migrations } from './core/db/migrations';

export default function App() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('جاري التهيئة...');
  const [stats, setStats] = useState<{ version: number; tables: string[] } | null>(null);
  const [testOut, setTestOut] = useState<{ kind: 'ok' | 'err' | ''; text: string }>({ kind: '', text: '' });
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return; initRef.current = true;
    (async () => {
      try {
        const db = getDb(); setMessage('جاري فتح قاعدة البيانات...'); await db.open();
        setMessage('جاري تشغيل الترحيلات...');
        const r = await new MigrationRunner(db, migrations).run();
        const tables = await db.query<{ name: string }>(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
        setStats({ version: r.to, tables: tables.map(t => t.name) }); 
        setMessage(`تم التهيئة — قاعدة البيانات v${r.to}`); 
        setStatus('ready');
      } catch (e) { 
        setMessage(`خطأ: ${(e as Error).message}`); 
        setStatus('error'); 
      }
    })();
  }, []);

  const runDbTest = async () => {
    setTestOut({ kind: '', text: 'جاري الاختبار...' });
    try {
      const db = getDb(); const name = `تصنيف اختبار ${Date.now()}`; const now = new Date().toISOString();
      await db.execute(`INSERT INTO categories (name, created_at, updated_at) VALUES (?, ?, ?)`, [name, now, now]);
      const row = await db.queryOne<{ id: number; name: string }>(`SELECT id, name FROM categories WHERE name = ?`, [name]);
      if (!row) throw new Error('لم يُعثر على السجل');
      const count = await db.queryOne<{ c: number }>(`SELECT COUNT(*) AS c FROM categories`);
      setTestOut({ kind: 'ok', text: `نجح الإدراج والقراءة\nالمعرّف: ${row.id}\nالاسم: ${row.name}\nإجمالي التصنيفات: ${count?.c ?? '?'}` });
    } catch (e) { 
      setTestOut({ kind: 'err', text: `${(e as Error).message}` }); 
    }
  };

  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">البيومي فارمسي</div>
        <div className="subtitle">نظام إدارة الصيدليات البيطرية — المرحلة 2</div>
        {status === 'loading' && (<><div className="spinner" /><div className="status">{message}</div></>)}
        {status === 'error' && <div className="result error">{message}</div>}
        {status === 'ready' && stats && (
          <>
            <div className="status">{message}</div>
            <div className="status" style={{ marginTop: 10 }}>
              <span className="badge">DB v{stats.version}</span>
              <span className="badge">{stats.tables.length} جداول</span>
            </div>
            <div style={{ fontSize: '12px', color: '#718096', marginTop: '10px', direction: 'ltr' }}>
              {stats.tables.join(', ')}
            </div>
            <button className="btn" onClick={runDbTest}>اختبار قراءة/كتابة قاعدة البيانات</button>
            {testOut.text && (<div className={`result ${testOut.kind === 'ok' ? 'success' : testOut.kind === 'err' ? 'error' : ''}`}>{testOut.text}</div>)}
          </>
        )}
      </div>
    </div>
  );
}
