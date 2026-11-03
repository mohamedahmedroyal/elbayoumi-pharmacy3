import { useEffect, useState } from 'react';
import { getAllBatches, addBatch, Batch } from './batches.service';
import { getAllItems, Item } from '../items/items.service';

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    item_id: '',
    batch_number: '',
    expiry_date: '',
    qty: '',
    price: ''
  });

  const loadData = async () => {
    try {
      const [bData, iData] = await Promise.all([getAllBatches(), getAllItems()]);
      setBatches(bData);
      setItems(iData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setError('');
    if (!formData.item_id || !formData.batch_number || !formData.expiry_date || !formData.qty || !formData.price) {
      setError('جميع الحقول مطلوبة');
      return;
    }
    try {
      // تحويل السعر إلى قروش (Fixed Point)
      const pricePiasters = Math.round(Number(formData.price) * 100);
      const qty = Number(formData.qty);
      
      await addBatch({
        item_id: Number(formData.item_id),
        batch_number: formData.batch_number,
        expiry_date: formData.expiry_date,
        qty_received: qty,
        qty_remaining: qty,
        purchase_price: pricePiasters
      });
      setIsAdding(false);
      setFormData({ item_id: '', batch_number: '', expiry_date: '', qty: '', price: '' });
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  return (
    <div>
      <div className="brand">إدارة التشغيلات (FEFO)</div>
      
      {batches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
          لا توجد تشغيلات. اضغط على + لاستلام بضاعة جديدة.
        </div>
      ) : (
        <div className="card">
          {batches.map((batch) => (
            <div key={batch.id} className="list-item">
              <div className="item-info">
                <h4>{batch.item_name}</h4>
                <p>تشغيلة: {batch.batch_number} | ينتهي: {formatDate(batch.expiry_date)}</p>
                <p style={{ color: batch.qty_remaining > 0 ? '#2f855a' : '#c53030', fontWeight: 'bold' }}>
                  المتاح: {batch.qty_remaining}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setIsAdding(true)}>+</button>

      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>استلام تشغيلة جديدة</h3>
            {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
            
            <div className="input-group">
              <label>الصنف</label>
              <select 
                value={formData.item_id} 
                onChange={e => setFormData({...formData, item_id: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontFamily: 'inherit' }}
              >
                <option value="">-- اختر الصنف --</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>رقم التشغيلة</label>
              <input type="text" value={formData.batch_number} onChange={e => setFormData({...formData, batch_number: e.target.value})} />
            </div>

            <div className="input-group">
              <label>تاريخ الانتهاء</label>
              <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
            </div>

            <div className="input-group">
              <label>الكمية الواردة</label>
              <input type="number" step="0.01" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} />
            </div>

            <div className="input-group">
              <label>سعر الشراء (جنيه)</label>
              <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>

            <button className="btn" onClick={handleSave}>حفظ التشغيلة</button>
            <button className="close-btn" onClick={() => setIsAdding(false)}>إلغاء</button>
          </div>
        </div>
      )}
    </div>
  );
}
