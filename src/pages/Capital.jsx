import { useState, useEffect } from 'react';
import { getCapital, addCapital, updateCapital, deleteCapital } from '../api';
import { formatCurrency, formatDate, formatDateInput, today } from '../utils/formatters';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { Date: today(), Contributor: '', Amount: '', Note: '' };

export default function Capital() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCapital();
      setItems(res.data || []);
    } catch (err) {
      toast.error('โหลดไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (item) => {
    setForm({ ...item, Date: formatDateInput(item.Date) });
    setModal({ open: true, mode: 'edit', data: item });
  };

  const handleSave = async () => {
    if (!form.Contributor) { toast.error('กรุณากรอกชื่อผู้สมทบ'); return; }
    if (!form.Amount) { toast.error('กรุณากรอกจำนวนเงิน'); return; }
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await addCapital(form);
        toast.success('เพิ่มรายการสำเร็จ');
      } else {
        await updateCapital({ ...form, CapitalID: modal.data.CapitalID });
        toast.success('แก้ไขสำเร็จ');
      }
      setModal({ open: false });
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`ลบรายการของ "${item.Contributor}" ใช่ไหม?`)) return;
    try {
      await deleteCapital(item.CapitalID);
      toast.success('ลบสำเร็จ');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const totalCapital = items.reduce((sum, i) => sum + (parseFloat(i.Amount) || 0), 0);

  // สรุปต่อคน
  const byContributor = items.reduce((acc, i) => {
    const name = i.Contributor || 'ไม่ระบุ';
    acc[name] = (acc[name] || 0) + (parseFloat(i.Amount) || 0);
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">เงินทุน</h1>
          <p className="text-sm text-gray-500">{items.length} รายการทั้งหมด</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span>+</span> เพิ่มรายการ
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">เงินทุนรวมทั้งหมด</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCapital)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-2">สมทบต่อคน</p>
          <div className="space-y-1">
            {Object.entries(byContributor).map(([name, amount]) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-gray-600">{name}</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(amount)}</span>
              </div>
            ))}
            {Object.keys(byContributor).length === 0 && (
              <p className="text-gray-400 text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">วันที่</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ผู้สมทบ</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">จำนวนเงิน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">หมายเหตุ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(item.Date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.Contributor}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatCurrency(item.Amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.Note || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-blue-500 p-1">✏️</button>
                        {isAdmin && <button onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-500 p-1">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {items.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700">รวมทั้งหมด</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(totalCapital)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">💰</p>
              <p>ยังไม่มีรายการเงินทุน</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'เพิ่มรายการเงินทุน' : 'แก้ไขรายการ'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
              <input className="input-field" type="date" value={form.Date} onChange={e => setForm({...form, Date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน (บาท) *</label>
              <input className="input-field" type="number" value={form.Amount} onChange={e => setForm({...form, Amount: e.target.value})} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้สมทบ *</label>
            <input className="input-field" value={form.Contributor} onChange={e => setForm({...form, Contributor: e.target.value})} placeholder="ชื่อ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <input className="input-field" value={form.Note} onChange={e => setForm({...form, Note: e.target.value})} placeholder="รายละเอียดเพิ่มเติม..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setModal({ open: false })} className="btn-secondary">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </Modal>
    </div>
  );
}
