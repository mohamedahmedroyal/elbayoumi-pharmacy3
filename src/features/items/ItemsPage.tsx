import { useEffect, useState } from 'react';
import { getAllItems, addItem, Item } from './items.service';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', unit: 'علبة', barcode: '', min_stock: 5 });
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleSave = async () => {
    setError('');
    if (!formData.code || !formData.name) {
      setError('الكود والاسم مطلوبان');
      return;
    }
    try {
      await addItem({ ...formData, min_stock: Number(formData.min_stock) });
      setIsAdding(false);
      setFormData({ code: '', name: '', unit: 'علبة', barcode: '', min_stock: 5 });
      loadItems();
    } catch (e: any) {
      setError(e.message.includes('UNIQUE') ? 'الكود أو الباركود مسجل مسبقاً' : e.message);
    }
  };

  return (
    <div>
      <div className="brand">إدارة الأصناف</div>
      
      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
          لا توجد أصناف. اضغط على الزر بالأسفل لإضافة صنف جديد.
        </div>
      ) : (
        <div className="card">
          {items.map((item) => (
            <div key={item.id} className="list-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>كود: {item.code} | الوحدة: {item.unit}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setIsAdding(true)}>+</button>

      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>إضافة صنف جديد</h3>
            {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
            
            <div className="input-group">
              <label>كود الصنف *</label>
              <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="input-group">
              <label>اسم الصنف *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>الباركود (اختياري)</label>
              <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
            </div>
            <div className="input-group">
              <label>الوحدة (علبة، زجاجة، شريط...)</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            </div>
            <div className="input-group">
              <label>الحد الأدنى للمخزون</label>
              <input type="number" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: Number(e.target.value)})} />
            </div>

            <button className="btn" onClick={handleSave}>حفظ الصنف</button>
            <button className="close-btn" onClick={() => setIsAdding(false)}>إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}
