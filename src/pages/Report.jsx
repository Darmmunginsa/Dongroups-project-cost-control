import { useState } from 'react';
import { getAnnualReport } from '../api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

// Load SheetJS from CDN on demand (avoids npm package issues)
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('โหลด SheetJS ไม่สำเร็จ'));
    document.head.appendChild(script);
  });
}

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => THIS_YEAR - 2 + i);
const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function fmt(n) { return parseFloat(n) || 0; }
function fmtNum(n) { return fmt(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Report() {
  const [year, setYear] = useState(THIS_YEAR);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await getAnnualReport(year);
      setReport(res.data);
    } catch (err) {
      toast.error('โหลดไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!report) return;
    setExporting(true);
    try {
      const XLSX = await loadXLSX();
      const wb = XLSX.utils.book_new();
      const buddhistYear = year + 543;

      // ===== Sheet 1: P&L รายเดือน =====
      const plRows = [
        [`รายงาน กำไร-ขาดทุน ประจำปี พ.ศ. ${buddhistYear}`],
        [],
        ['เดือน', 'รายได้', 'ต้นทุน', 'กำไรขั้นต้น', 'ใช้ส่วนตัว', 'เงินเดือน', 'ใช้ในบริษัท', 'ภาษีจ่าย', 'กำไรสุทธิ'],
        ...report.monthly.map(m => [
          m.monthName,
          fmt(m.revenue), fmt(m.cost), fmt(m.profit),
          fmt(m.personal), fmt(m.salary), fmt(m.company), fmt(m.tax),
          fmt(m.netProfit)
        ]),
        [],
        ['รวมทั้งปี',
          report.monthly.reduce((s, m) => s + fmt(m.revenue), 0),
          report.monthly.reduce((s, m) => s + fmt(m.cost), 0),
          report.monthly.reduce((s, m) => s + fmt(m.profit), 0),
          report.monthly.reduce((s, m) => s + fmt(m.personal), 0),
          report.monthly.reduce((s, m) => s + fmt(m.salary), 0),
          report.monthly.reduce((s, m) => s + fmt(m.company), 0),
          report.monthly.reduce((s, m) => s + fmt(m.tax), 0),
          report.monthly.reduce((s, m) => s + fmt(m.netProfit), 0),
        ]
      ];
      const wspl = XLSX.utils.aoa_to_sheet(plRows);
      wspl['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wspl, 'P&L รายเดือน');

      // ===== Sheet 2: Partner Statement =====
      const psRows = [
        [`สรุปส่วนแบ่งกำไร ประจำปี พ.ศ. ${buddhistYear}`],
        [],
        ['ชื่อหุ้นส่วน', 'ส่วนแบ่งกำไร (บาท)', 'เบิกไปแล้ว (บาท)', 'คงค้าง (บาท)'],
        ...report.partnerStatement.map(p => [
          p.name, fmt(p.share), fmt(p.disbursed), fmt(p.remaining)
        ]),
        [],
        ['รวม',
          report.partnerStatement.reduce((s, p) => s + fmt(p.share), 0),
          report.partnerStatement.reduce((s, p) => s + fmt(p.disbursed), 0),
          report.partnerStatement.reduce((s, p) => s + fmt(p.remaining), 0),
        ]
      ];
      const wsps = XLSX.utils.aoa_to_sheet(psRows);
      wsps['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsps, 'ส่วนแบ่งกำไร');

      // ===== Sheet 3: Projects =====
      const projRows = [
        [`รายการ Projects ปี พ.ศ. ${buddhistYear}`],
        [],
        ['ชื่อ Project', 'QT Number', 'Vendor', 'ราคา (บาท)', 'สถานะ', 'สถานะชำระ', 'วันที่', 'หัก %'],
        ...report.projects.map(p => [
          p.ProjectName, p.QTNumber || '', p.MainVendor || '',
          fmt(p.NetPrice), p.Status || '', p.PaymentStatus || '',
          p.Date || '', fmt(p.DeductionPct)
        ])
      ];
      const wsproj = XLSX.utils.aoa_to_sheet(projRows);
      wsproj['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 }];
      XLSX.utils.book_append_sheet(wb, wsproj, 'Projects');

      // ===== Sheet 4: Disbursements =====
      const disbRows = [
        [`รายการเบิกจ่าย ปี พ.ศ. ${buddhistYear}`],
        [],
        ['วันที่', 'รายการ', 'จำนวน (บาท)', 'คนเบิก', 'ประเภท', 'สถานะ'],
        ...report.disbursements.map(d => [
          d['วันที่'] || '', d['รายการที่เบิก'] || '',
          fmt(d['จำนวนเงิน']), d['คนเบิก'] || '',
          d['ประเภท'] || '', d['สถานะ'] || ''
        ])
      ];
      const wsDisb = XLSX.utils.aoa_to_sheet(disbRows);
      wsDisb['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsDisb, 'เบิกจ่าย');

      // ===== Sheet 5: Capital =====
      const capRows = [
        [`รายการเงินทุน ปี พ.ศ. ${buddhistYear}`],
        [],
        ['วันที่', 'ผู้สมทบ', 'จำนวน (บาท)', 'หมายเหตุ'],
        ...report.capital.map(c => [
          c.Date || '', c.Contributor || '', fmt(c.Amount), c.Note || ''
        ]),
        [],
        ['รวม', '', report.capital.reduce((s, c) => s + fmt(c.Amount), 0), '']
      ];
      const wsCap = XLSX.utils.aoa_to_sheet(capRows);
      wsCap['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 24 }];
      XLSX.utils.book_append_sheet(wb, wsCap, 'เงินทุน');

      // Download
      XLSX.writeFile(wb, `รายงานประจำปี_${buddhistYear}.xlsx`);
      toast.success('Export Excel สำเร็จ!');
    } catch (err) {
      toast.error('Export ไม่สำเร็จ: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const totalRevenue  = report ? report.monthly.reduce((s, m) => s + fmt(m.revenue), 0) : 0;
  const totalCost     = report ? report.monthly.reduce((s, m) => s + fmt(m.cost), 0) : 0;
  const totalProfit   = report ? report.monthly.reduce((s, m) => s + fmt(m.profit), 0) : 0;
  const totalPersonal = report ? report.monthly.reduce((s, m) => s + fmt(m.personal), 0) : 0;
  const totalSalary   = report ? report.monthly.reduce((s, m) => s + fmt(m.salary), 0) : 0;
  const totalTax      = report ? report.monthly.reduce((s, m) => s + fmt(m.tax), 0) : 0;
  const totalNet      = report ? report.monthly.reduce((s, m) => s + fmt(m.netProfit), 0) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">รายงานประจำปี</h1>
          <p className="text-sm text-gray-500">สรุป P&L, ส่วนแบ่งกำไร, เบิกจ่าย รายปี</p>
        </div>
        {report && (
          <button onClick={exportExcel} disabled={exporting} className="btn-primary flex items-center gap-2">
            <span>📥</span> {exporting ? 'กำลัง Export...' : 'Export Excel'}
          </button>
        )}
      </div>

      {/* Year Selector */}
      <div className="card p-4 mb-5 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เลือกปี (พ.ศ.)</label>
          <select className="input-field w-36" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y + 543}</option>)}
          </select>
        </div>
        <button onClick={loadReport} disabled={loading} className="btn-primary">
          {loading ? 'กำลังโหลด...' : '🔍 ดูรายงาน'}
        </button>
      </div>

      {report && (
        <>
          {/* Annual Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="card p-4 border-l-4 border-blue-400">
              <p className="text-xs text-gray-400">รายได้รวม</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="card p-4 border-l-4 border-red-300">
              <p className="text-xs text-gray-400">ต้นทุนรวม</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(totalCost)}</p>
            </div>
            <div className="card p-4 border-l-4 border-emerald-400">
              <p className="text-xs text-gray-400">กำไรขั้นต้น</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalProfit)}</p>
            </div>
            <div className="card p-4 border-l-4 border-violet-400">
              <p className="text-xs text-gray-400">กำไรสุทธิ</p>
              <p className="text-lg font-bold text-violet-600">{formatCurrency(totalNet)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-3">
              <p className="text-xs text-gray-400">เบิกส่วนตัว</p>
              <p className="text-base font-bold text-purple-600">{formatCurrency(totalPersonal)}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-gray-400">เงินเดือน</p>
              <p className="text-base font-bold text-orange-600">{formatCurrency(totalSalary)}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-gray-400">ภาษีจ่าย</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(totalTax)}</p>
            </div>
          </div>

          {/* Monthly P&L Table */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">P&L รายเดือน</h2>
          <div className="card overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">เดือน</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-blue-500">รายได้</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-red-400">ต้นทุน</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-emerald-500">กำไรขั้นต้น</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-purple-500">ส่วนตัว</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-orange-500">เงินเดือน</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-red-500">ภาษี</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-violet-600">กำไรสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.monthly.map((m, i) => {
                    const hasData = m.revenue > 0 || m.cost > 0 || m.disbTotal > 0;
                    return (
                      <tr key={i} className={`${hasData ? '' : 'opacity-40'} hover:bg-gray-50`}>
                        <td className="px-3 py-2 font-medium text-gray-700">{m.monthName}</td>
                        <td className="px-3 py-2 text-right text-blue-600 font-medium">{m.revenue > 0 ? formatCurrency(m.revenue) : '-'}</td>
                        <td className="px-3 py-2 text-right text-red-500">{m.cost > 0 ? formatCurrency(m.cost) : '-'}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${m.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {m.revenue > 0 || m.cost > 0 ? formatCurrency(m.profit) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-purple-600">{m.personal > 0 ? formatCurrency(m.personal) : '-'}</td>
                        <td className="px-3 py-2 text-right text-orange-600">{m.salary > 0 ? formatCurrency(m.salary) : '-'}</td>
                        <td className="px-3 py-2 text-right text-red-600">{m.tax > 0 ? formatCurrency(m.tax) : '-'}</td>
                        <td className={`px-3 py-2 text-right font-bold ${m.netProfit >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                          {hasData ? formatCurrency(m.netProfit) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                    <td className="px-3 py-2 text-gray-700">รวมทั้งปี</td>
                    <td className="px-3 py-2 text-right text-blue-700">{formatCurrency(totalRevenue)}</td>
                    <td className="px-3 py-2 text-right text-red-600">{formatCurrency(totalCost)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">{formatCurrency(totalProfit)}</td>
                    <td className="px-3 py-2 text-right text-purple-700">{formatCurrency(totalPersonal)}</td>
                    <td className="px-3 py-2 text-right text-orange-700">{formatCurrency(totalSalary)}</td>
                    <td className="px-3 py-2 text-right text-red-700">{formatCurrency(totalTax)}</td>
                    <td className="px-3 py-2 text-right text-violet-700">{formatCurrency(totalNet)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Partner Statement */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">สรุปส่วนแบ่งกำไรหุ้นส่วน</h2>
          <div className="card overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">ชื่อหุ้นส่วน</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-blue-500">ส่วนแบ่งกำไร</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-orange-500">เบิกไปแล้ว</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-emerald-500">คงค้าง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.partnerStatement.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">{formatCurrency(p.share)}</td>
                    <td className="px-4 py-3 text-right text-orange-500">− {formatCurrency(p.disbursed)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${fmt(p.remaining) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(p.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-4">
            <button onClick={exportExcel} disabled={exporting} className="btn-primary flex items-center gap-2 mx-auto">
              <span>📥</span> {exporting ? 'กำลัง Export...' : 'Export Excel ทั้งหมด 5 sheets'}
            </button>
            <p className="text-xs text-gray-400 mt-2">รวม P&L รายเดือน, ส่วนแบ่งกำไร, Projects, เบิกจ่าย, เงินทุน</p>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p>เลือกปีและกด "ดูรายงาน" เพื่อสร้างรายงาน</p>
        </div>
      )}
    </div>
  );
}
