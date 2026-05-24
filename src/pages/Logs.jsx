import { useState, useEffect } from 'react';
import { getLogs } from '../api';
import toast from 'react-hot-toast';

const MODULE_OPT = ['Projects', 'Costs', 'Documents', 'Disbursements', 'Partners', 'Users'];
const ACTION_OPT = ['เพิ่ม', 'แก้ไข', 'ลบ'];

const ACTION_STYLE = {
  'เพิ่ม':  'bg-emerald-100 text-emerald-700',
  'แก้ไข': 'bg-blue-100 text-blue-700',
  'ลบ':    'bg-red-100 text-red-600',
};

const MODULE_LABEL = {
  Projects:     '📁 Projects',
  Costs:        '💸 ต้นทุน',
  Documents:    '📄 เอกสาร',
  Disbursements:'💳 เบิกจ่าย',
  Partners:     '👥 หุ้นส่วน',
  Users:        '👤 ผู้ใช้',
};

export default function Logs() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLogs();
      setItems(res.data || []);
    } catch (err) {
      toast.error('โหลดไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(i => {
    const matchSearch = !search ||
      i.User?.toLowerCase().includes(search.toLowerCase()) ||
      i.ItemName?.toLowerCase().includes(search.toLowerCase()) ||
      i.Detail?.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'all' || i.Module === filterModule;
    const matchAction = filterAction === 'all' || i.Action === filterAction;
    return matchSearch && matchModule && matchAction;
  });

  // สรุปยอด
  const countAdd    = items.filter(i => i.Action === 'เพิ่ม').length;
  const countEdit   = items.filter(i => i.Action === 'แก้ไข').length;
  const countDelete = items.filter(i => i.Action === 'ลบ').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ประวัติการทำรายการ</h1>
          <p className="text-sm text-gray-500">{items.length} รายการทั้งหมด</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">เพิ่มรายการ</p>
          <p className="text-2xl font-bold text-emerald-600">{countAdd}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">แก้ไขรายการ</p>
          <p className="text-2xl font-bold text-blue-600">{countEdit}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">ลบรายการ</p>
          <p className="text-2xl font-bold text-red-500">{countDelete}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="ค้นหา ผู้ใช้, รายการ..."
          className="input-field sm:max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input-field sm:w-40" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
          <option value="all">ทุกหมวด</option>
          {MODULE_OPT.map(m => <option key={m} value={m}>{MODULE_LABEL[m] || m}</option>)}
        </select>
        <select className="input-field sm:w-36" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="all">ทุกการกระทำ</option>
          {ACTION_OPT.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
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
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">เวลา</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ผู้ทำรายการ</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">การกระทำ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">หมวด</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">รายการ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{item.Timestamp}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{item.User || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_STYLE[item.Action] || 'bg-gray-100 text-gray-600'}`}>
                        {item.Action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {MODULE_LABEL[item.Module] || item.Module}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{item.ItemName || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{item.Detail || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>ยังไม่มีประวัติการทำรายการ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
