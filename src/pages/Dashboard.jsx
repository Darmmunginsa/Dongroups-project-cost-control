import { useState, useEffect } from 'react';
import { getSummary } from '../api';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function ProfitShareCard({ partner }) {
  const share = parseFloat(partner.share) || 0;
  const disbursed = parseFloat(partner.disbursed) || 0;
  const remaining = share - disbursed;
  const progress = share > 0 ? Math.min((disbursed / share) * 100, 100) : 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-900">{partner.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${remaining >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
          {remaining >= 0 ? 'คงค้าง' : 'เบิกเกิน'}
        </span>
      </div>
      <div className="space-y-1 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-400">ส่วนแบ่งกำไร</span>
          <span className="font-semibold text-blue-700">{formatCurrency(share)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">เบิกไปแล้ว</span>
          <span className="font-semibold text-orange-500">− {formatCurrency(disbursed)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-1">
          <span className="text-gray-500 font-medium">คงเหลือต้องจ่าย</span>
          <span className={`font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">เบิกไปแล้ว {progress.toFixed(0)}%</p>
    </div>
  );
}

function StatCard({ label, value, icon, color, linkTo, sub }) {
  const card = (
    <div className={`card p-5 ${linkTo ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{card}</Link> : card;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSummary();
      setSummary(res.data);
    } catch (err) {
      toast.error('โหลดข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ภาพรวม</h1>
          <p className="text-sm text-gray-500">สรุปข้อมูลทั้งหมดของระบบ</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
      </div>

      {summary && (
        <>
          {/* Projects Stats */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">สถานะ Projects</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="งานคงค้าง" value={summary['งานคงค้าง']} icon="🔄" color="text-blue-600" linkTo="/projects" />
            <StatCard label="งานเสร็จแล้ว" value={summary['งานที่ทำเสร็จแล้ว']} icon="✅" color="text-green-600" linkTo="/projects" />
          </div>

          {/* Financial Stats */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลการเงิน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <StatCard
              label="รายได้สุทธิ"
              value={formatCurrency(summary['รายได้สุทธิ'])}
              icon="💰"
              color="text-blue-600"
              sub="เฉพาะ Project ที่ลูกค้าจ่ายแล้ว"
            />
            <StatCard
              label="ต้นทุนรวม"
              value={formatCurrency(summary['ต้นทุนรวม'])}
              icon="📉"
              color="text-red-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              label="กำไร"
              value={formatCurrency(summary['กำไร'])}
              icon="📈"
              color={parseFloat(summary['กำไร']) >= 0 ? 'text-emerald-600' : 'text-red-600'}
            />
            <StatCard
              label="💼 เงินกองกลาง"
              value={formatCurrency(summary['เงินกองกลาง'])}
              icon="🏦"
              color={parseFloat(summary['เงินกองกลาง']) >= 0 ? 'text-violet-600' : 'text-red-600'}
              sub="กำไร − ยอดที่เบิกจ่ายแล้ว"
            />
          </div>

          {/* Capital */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">เงินทุน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              label="เงินทุนรวม"
              value={formatCurrency(summary['เงินทุนรวม'] || 0)}
              icon="💰"
              color="text-emerald-600"
              linkTo="/capital"
              sub="ยอดที่หุ้นส่วนสมทบทั้งหมด"
            />
            <StatCard
              label="เงินทุนคงเหลือ"
              value={formatCurrency(summary['เงินทุนคงเหลือ'] || 0)}
              icon="🏦"
              color={parseFloat(summary['เงินทุนคงเหลือ'] || 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}
              linkTo="/capital"
              sub="หลังหักค่าใช้จ่ายบริษัท"
            />
          </div>

          {/* Customer Payment */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ลูกค้าค้างชำระ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              label="Project ที่ลูกค้ายังไม่จ่าย"
              value={summary['รอพิจรณาเพื่อจ่าย']}
              icon="⏳"
              color="text-amber-600"
              linkTo="/projects"
              sub="คลิกเพื่อดู Projects ทั้งหมด"
            />
            <StatCard
              label="รายได้ที่รอรับ"
              value={formatCurrency(summary['รายได้รอรับ'] || 0)}
              icon="💳"
              color="text-amber-700"
              linkTo="/projects"
            />
          </div>

          {/* Disbursement Stats */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">การเบิกจ่าย</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              label="รายการเบิกที่รอจ่าย"
              value={summary['อื่นๆที่รอจ่าย']}
              icon="📋"
              color="text-orange-600"
              linkTo="/disbursements"
            />
            <StatCard
              label="สรุปเบิกจ่ายทั้งหมด"
              value={formatCurrency(summary['สรุปเบิกจ่ายตาม'])}
              icon="💸"
              color="text-purple-600"
              linkTo="/disbursements"
            />
          </div>

          {/* Profit Sharing */}
          {summary.profitSharing && summary.profitSharing.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">ส่วนแบ่งกำไรหุ้นส่วน</h2>
                <Link to="/settings" className="text-xs text-blue-500 hover:underline">⚙️ ตั้งค่า</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.profitSharing.map((p, i) => (
                  <ProfitShareCard key={i} partner={p} />
                ))}
              </div>
            </>
          )}

          {summary.profitSharing && summary.profitSharing.length === 0 && (
            <div className="card p-5 text-center text-gray-400">
              <p className="text-2xl mb-2">👥</p>
              <p className="text-sm">ยังไม่ได้ตั้งค่าหุ้นส่วน</p>
              <Link to="/settings" className="text-blue-500 text-sm hover:underline mt-1 inline-block">ไปตั้งค่าเลย →</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
