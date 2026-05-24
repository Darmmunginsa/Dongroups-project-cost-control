import { useState, useEffect } from 'react';
import { getLogs } from '../api';
import toast from 'react-hot-toast';

const MODULE_OPT = ['Projects', 'Costs', 'Documents', 'Disbursements', 'Partners', 'Users', 'Capital'];
const ACTION_OPT = ['เพิ่ม', 'แก้ไข', 'ลบ'];

const ACTION_STYLE = {
  'เพิ่ม':  'bg-emerald-100 text-emerald-700',
  'แก้ไข': 'bg-blue-100 text-blue-700',
  'ลบ':    'bg-red-100 text-red-600',
};

const MODULE_LABEL = {
  Projects:      '📁 Projects',
  Costs:         '💸 ต้นทุน',
  Documents:     '📄 เอกสาร',
  Disbursements: '💳 เบิกจ่าย',
  Partners:      '👥 หุ้นส่วน',
  Users:         '👤 ผู้ใช้',
  Capital:       '💰 เงินทุน',
};

const MODULE_COLOR = {
  Projects:      'bg-blue-50 text-blue-700',
  Costs:         'bg-orange-50 text-orange-700',
  Documents:     'bg-gray-100 text-gray-600',
  Disbursements: 'bg-purple-50 text-purple-700',
  Partners:      'bg-pink-50 text-pink-700',
  Users:         'bg-yellow-50 text-yellow-700',
  Capital:       'bg-emerald-50 text-emerald-700',
};

function formatThaiTime(raw) {
  if (!raw) return '-';
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  try {
    const d = new Date(raw.replace(' ', 'T'));
    if (isNaN(d)) return raw;
    const day = d.getDate();
    const mon = MONTHS[d.getMonth()];
    const yr  = (d.getFullYear() + 543) % 100;
    const hh  = String(d.getHours()).padStart(2, '0');
    const mm  = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${mon} ${yr}  ${hh}:${mm}`;
  } catch { return raw; }
}

function DetailChips({ detail }) {
  if (!detail) return null;
  const parts = detail.split('|').map(s => s.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {parts.map((p, i) => {
        const colonIdx = p.indexOf(':');
        const key = colonIdx >= 0 ? p.slice(0, colonIdx).trim() : p;
        const val = colonIdx >= 0 ? p.slice(colonIdx + 1).trim() : '';
        return (
          <span key={i} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs px-2 py-0.5 rounded-full">
            <span className="text-gray-400">{key}</span>
            <span className="font-semibold text-gray-700">{val || '-'}</span>
          </span>
        );
      })}
    </div>
  );
}

export default function Logs() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [expanded, setExpanded]         = useState(null);

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

  const countAdd    = items.filter(i => i.Action === 'เพิ่ม').length;
  const countEdit   = items.filter(i => i.Action === 'แก้ไข').length;
  const countDelete = items.filter(i => i.Action === 'ลบ').length;

  const toggleExpand = (idx) => setExpanded(expanded === idx ? null : idx);

  return (
    <div className="p-6">
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

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="ค้นหา ผู้ใช้, รายการ, รายละเอียด..."
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-36">เวลา</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32">ผู้ทำรายการ</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 w-20">การกระทำ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28">หมวด</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">รายการ</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const hasDetail = item.Detail && item.Detail !== '-' && item.Detail.trim() !== '';
                  const isOpen = expanded === idx;
                  return (
                    <tbody key={idx}>
                      <tr
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${hasDetail ? 'cursor-pointer' : ''} ${isOpen ? 'bg-blue-50/30' : ''}`}
                        onClick={() => hasDetail && toggleExpand(idx)}
                      >
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{formatThaiTime(item.Timestamp)}</td>
                        <td className="px-4 py-3 font-medium text-gray-700">{item.User || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_STYLE[item.Action] || 'bg-gray-100 text-gray-600'}`}>
                            {item.Action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODULE_COLOR[item.Module] || 'bg-gray-100 text-gray-600'}`}>
                            {MODULE_LABEL[item.Module] || item.Module}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{item.ItemName || '-'}</td>
                        <td className="px-4 py-3 text-center text-gray-300">
                          {hasDetail && (
                            <span className={`text-xs transition-transform inline-block ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                          )}
                        </td>
                      </tr>
                      {isOpen && hasDetail && (
                        <tr className="bg-blue-50/20 border-b border-blue-100">
                          <td colSpan={6} className="px-6 py-3">
                            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-1.5">รายละเอียด</p>
                            <DetailChips detail={item.Detail} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>ไม่พบรายการ</p>
            </div>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          แสดง {filtered.length} จาก {items.length} รายการ • คลิกที่แถวเพื่อดูรายละเอียด
        </p>
      )}
    </div>
  );
}
