import { useState } from 'react';
import ItemsPage from './features/items/ItemsPage';
import BatchesPage from './features/batches/BatchesPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'items' | 'batches'>('items');

  return (
    <div className="app-container">
      <div className="main-content">
        {currentTab === 'dashboard' && (
          <div className="card" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2 style={{ color: '#0b6b5c' }}>لوحة التحكم</h2>
            <p style={{ color: '#718096', marginTop: '10px' }}>قريباً: الإحصائيات والرسوم البيانية</p>
          </div>
        )}
        
        {currentTab === 'items' && <ItemsPage />}
        {currentTab === 'batches' && <BatchesPage />}
      </div>

      <div className="bottom-nav">
        <div className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
          <span className="nav-icon">📊</span>
          <span>الرئيسية</span>
        </div>
        <div className={`nav-item ${currentTab === 'items' ? 'active' : ''}`} onClick={() => setCurrentTab('items')}>
          <span className="nav-icon">📦</span>
          <span>الأصناف</span>
        </div>
        <div className={`nav-item ${currentTab === 'batches' ? 'active' : ''}`} onClick={() => setCurrentTab('batches')}>
          <span className="nav-icon">🏷️</span>
          <span>التشغيلات</span>
        </div>
      </div>
    </div>
  );
}
