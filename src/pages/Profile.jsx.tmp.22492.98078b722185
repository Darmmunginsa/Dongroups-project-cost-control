import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { updateUser } from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { theme, changeTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim()) { toast.error('กรุณากรอกชื่อที่แสดง'); return; }
    setSavingName(true);
    try {
      await updateUser({ ...user, DisplayName: displayName });
      refreshUser({ displayName });
      toast.success('อัปเดตชื่อสำเร็จ');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!oldPass || !newPass) { toast.error('กรุณากรอกรหัสผ่านให้ครบ'); return; }
    if (newPass !== confirmPass) { toast.error('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
    if (newPass.length < 6) { toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setSavingPass(true);
    try {
      // Send old password for verification + new password
      await updateUser({ ...user, OldPassword: oldPass, Password: newPass });
      setOldPass(''); setNewPass(''); setConfirmPass('');
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
        <p className="text-sm text-gray-500">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
      </div>

      {/* Avatar + Info */}
      <div className="card p-5 mb-4 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.displayName || user?.username}</p>
          <p className="text-sm text-gray-400">@{user?.username}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
            style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary-text)' }}
          >
            {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
          </span>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-1">🎨 ธีมสี</h2>
        <p className="text-xs text-gray-400 mb-4">เลือกสีที่ใช้แสดงผลทั่วทั้งระบบ (บันทึกเฉพาะบัญชีนี้)</p>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => changeTheme(key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                theme === key ? 'border-current shadow-md scale-105' : 'border-gray-100 hover:border-gray-300'
              }`}
              style={theme === key ? { borderColor: t.primary, backgroundColor: t.light } : {}}
            >
              <div
                className="w-8 h-8 rounded-full shadow-sm"
                style={{ backgroundColor: t.primary }}
              />
              <span className="text-xs font-medium text-gray-700">{t.label}</span>
              {theme === key && <span className="text-xs" style={{ color: t.primary }}>✓ ใช้อยู่</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Display Name */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">✏️ แก้ไขชื่อที่แสดง</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อที่แสดง</label>
            <input
              className="input-field"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="ชื่อที่ต้องการแสดง"
            />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveName} disabled={savingName} className="btn-primary">
              {savingName ? 'กำลังบันทึก...' : 'บันทึกชื่อ'}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">🔒 เปลี่ยนรหัสผ่าน</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
            <input
              className="input-field"
              type="password"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
              placeholder="รหัสผ่านเดิม"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input
              className="input-field"
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              className="input-field"
              type="password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSavePassword} disabled={savingPass} className="btn-primary">
              {savingPass ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
