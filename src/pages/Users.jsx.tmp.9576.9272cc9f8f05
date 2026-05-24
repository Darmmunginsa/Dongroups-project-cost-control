import { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { Username: '', Password: '', DisplayName: '', Role: 'user' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error('โหลดไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (u) => { setForm({ ...u, Password: '' }); setModal({ open: true, mode: 'edit', data: u }); };

  const handleSave = async () => {
    if (!form.Username || (modal.mode === 'add' && !form.Password)) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await addUser(form);
        toast.success('เพิ่มผู้ใช้สำเร็จ');
      } else {
        await updateUser({ ...modal.data, ...form });
        toast.success('แก้ไขสำเร็จ');
      }
      setModal({ open: false });
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u) => {
    if (u.UserID === currentUser?.id) { toast.error('ไม่สามารถลบบัญชีตัวเองได้'); return; }
    if (!confirm(`ลบผู้ใช้ "${u.DisplayName || u.Username}" ใช่ไหม?`)) return;
    try {
      await deleteUser(u.UserID);
      toast.success('ลบสำเร็จ');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-gray-500">{users.length} บัญชีทั้งหมด</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">+ เพิ่มผู้ใช้</button>
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
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ชื่อแสดง</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Username</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.UserID} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                        {u.DisplayName?.[0] || u.Username?.[0] || 'U'}
                      </div>
                      <span className="font-medium text-gray-800">{u.DisplayName || '-'}</span>
                      {u.UserID === currentUser?.id && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">คุณ</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{u.Username}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.Role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {u.Role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-blue-500 p-1">✏️</button>
                      <button onClick={() => handleDelete(u)} className="text-gray-400 hover:text-red-500 p-1">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'เพิ่มผู้ใช้' : 'แก้ไขผู้ใช้'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแสดง</label>
            <input className="input-field" value={form.DisplayName} onChange={e => setForm({...form, DisplayName: e.target.value})} placeholder="ชื่อ-นามสกุล" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input className="input-field" value={form.Username} onChange={e => setForm({...form, Username: e.target.value})} placeholder="username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {modal.mode === 'edit' && <span className="text-gray-400 font-normal">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}
            </label>
            <input className="input-field" type="password" value={form.Password} onChange={e => setForm({...form, Password: e.target.value})} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="input-field" value={form.Role} onChange={e => setForm({...form, Role: e.target.value})}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
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
