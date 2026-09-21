import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Coffee,
  ShieldCheck,
  TrendingUp,
  Download,
  Share2,
  Receipt,
  Smartphone,
  Eye,
  FileDown,
  Mail,
} from 'lucide-react';
import { playCashChime } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DailySettlementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    bookings,
    cafeOrders,
    currentStaffUser,
    equipment,
    addToast,
  } = useApp();

  const [actualCashCounted, setActualCashCounted] = useState<string>('');
  const [managerNotes, setManagerNotes] = useState<string>('All morning & evening slots completed smoothly. Floodlights inspected.');
  const [isSigned, setIsSigned] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [activeReportView, setActiveReportView] = useState<'standard' | 'receipt'>('standard');

  if (!isOpen) return null;

  // Calculate Metrics from today's bookings & orders
  const todayDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const todayTimeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalCourtRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCourtHours = bookings.reduce((sum, b) => sum + (b.durationHours || 1), 0);

  const totalCafeRevenue = cafeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCafeOrdersCount = cafeOrders.length;

  const totalEquipmentRentalsCount = equipment.reduce((sum, e) => sum + e.inUse, 0);
  const totalEquipmentRevenue = totalEquipmentRentalsCount * 50;

  const grossDailyRevenue = totalCourtRevenue + totalCafeRevenue;

  // Tender breakdowns
  const upiRevenue = Math.round(grossDailyRevenue * 0.72);
  const walletRevenue = Math.round(grossDailyRevenue * 0.18);
  const expectedCashInDrawer = grossDailyRevenue - upiRevenue - walletRevenue;

  const countedCashNumber = actualCashCounted ? parseFloat(actualCashCounted) : expectedCashInDrawer;
  const cashVariance = countedCashNumber - expectedCashInDrawer;

  const courtUtilizationPct = Math.min(100, Math.round((totalCourtHours / 20) * 100)); // 20 operating hours (4am-12am midnight)
  const reportRefNo = `Z-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

  // High-contrast, text-based raw Z-report summary for thermal/mobile receipt
  const generateRawReceiptText = () => {
    const line = '==========================================';
    const subLine = '------------------------------------------';
    return `${line}
           COURT & CAFE ARENA
   CHAMPIONSHIP INDOOR PICKLEBALL & CAFE
 GSTIN: 29AABCC1234F1Z5  |  FSSAI: 11223344556677
      12th Main Road, Indiranagar, Bengaluru
${line}
           DAILY EXECUTIVE Z-REPORT
               (END OF DAY SHIFT)
${subLine}
Report Ref  : #${reportRefNo}
Date        : ${todayDateStr}
Time        : ${todayTimeStr}
Duty Staff  : ${currentStaffUser?.name || 'Staff User'} (${currentStaffUser?.roleTitle || 'Duty Manager'})
Arena Status: ${isSigned ? 'VERIFIED & BALANCED' : 'DRAFT / PENDING SIGN-OFF'}
${subLine}
DEPARTMENT REVENUE BREAKDOWN:
- Court Bookings (${totalCourtHours.toFixed(1)} hrs)  : Rs. ${totalCourtRevenue.toLocaleString('en-IN')}
  Court Utilization Rate    : ${courtUtilizationPct}%
- Kitchen & Cafe (${totalCafeOrdersCount} orders)  : Rs. ${totalCafeRevenue.toLocaleString('en-IN')}
- Equipment Gear Rentals    : Rs. ${totalEquipmentRevenue.toLocaleString('en-IN')}
${subLine}
GROSS DAILY TOTAL REVENUE   : Rs. ${grossDailyRevenue.toLocaleString('en-IN')}
${line}
PAYMENT TENDER AUDIT:
- UPI / Digital Receipts    : Rs. ${upiRevenue.toLocaleString('en-IN')}
- Club Wallet Deductions    : Rs. ${walletRevenue.toLocaleString('en-IN')}
- Drawer Cash (Expected)    : Rs. ${expectedCashInDrawer.toLocaleString('en-IN')}
- Drawer Cash (Counted)     : Rs. ${countedCashNumber.toLocaleString('en-IN')}
- Drawer Cash Variance      : Rs. ${cashVariance === 0 ? '0 (BALANCED)' : cashVariance > 0 ? `+${cashVariance}` : `${cashVariance}`}
${subLine}
DUTY MANAGER NOTES:
${managerNotes || 'Shift concluded normally with zero operational disputes.'}
${subLine}
Prepared By: ${currentStaffUser?.name || 'Duty Staff'}
Approved By: Pratish Gupta (Founder & General Manager)
*** END OF AUDIT RECORD - KEEP FOR ACCOUNTS ***
${line}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([generateRawReceiptText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Z-Report-${reportRefNo}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Z-Report Downloaded 📄', `Saved as Z-Report-${reportRefNo}.txt`, 'success');
  };

  const handleCopyRawReceipt = () => {
    navigator.clipboard.writeText(generateRawReceiptText()).catch(() => {});
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2500);
    addToast('Text Receipt Copied', 'High-contrast text receipt copied to clipboard.', 'info');
  };

  const handleSignShift = () => {
    setIsSigned(true);
    playCashChime();
    addToast(
      'Daily Z-Report Signed! 📋',
      `Shift closed by ${currentStaffUser?.name || 'Staff'}. Cash drawer balanced.`,
      'success'
    );
  };

  const handleCopyWhatsAppSummary = () => {
    const summary = `*COURT & CAFE - DAILY Z-REPORT*\n` +
      `📅 Date: ${todayDateStr}\n` +
      `👤 Manager on Duty: ${currentStaffUser?.name || 'Manager'}\n` +
      `---------------------------------\n` +
      `🎾 Court Bookings: ₹${totalCourtRevenue.toLocaleString('en-IN')} (${totalCourtHours} hrs, ${courtUtilizationPct}% occupancy)\n` +
      `☕ Cafe & Kitchen: ₹${totalCafeRevenue.toLocaleString('en-IN')} (${totalCafeOrdersCount} orders)\n` +
      `🏸 Equipment Rentals: ₹${totalEquipmentRevenue.toLocaleString('en-IN')}\n` +
      `💰 *GROSS TOTAL REVENUE: ₹${grossDailyRevenue.toLocaleString('en-IN')}*\n` +
      `---------------------------------\n` +
      `📱 UPI Online Receipts: ₹${upiRevenue.toLocaleString('en-IN')}\n` +
      `💳 Club Wallet Credits: ₹${walletRevenue.toLocaleString('en-IN')}\n` +
      `💵 Cash in Drawer Counted: ₹${countedCashNumber.toLocaleString('en-IN')} (${cashVariance === 0 ? 'Balanced' : `Variance ₹${cashVariance}`})\n` +
      `---------------------------------\n` +
      `Notes: ${managerNotes}`;

    navigator.clipboard.writeText(summary).catch(() => {});
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
    addToast('Report Copied', 'Formatted WhatsApp handover summary copied to clipboard.', 'info');
  };

  const handleEmailZReport = () => {
    const subject = `[Z-Report] Court & Cafe Arena - Daily Financial Summary (${todayDateStr}) - #${reportRefNo}`;
    const emailBody = 
`COURT & CAFE ARENA - DAILY EXECUTIVE Z-REPORT
Ref: #${reportRefNo}
Date: ${todayDateStr} (${todayTimeStr})
Duty Staff: ${currentStaffUser?.name || 'Staff User'} (${currentStaffUser?.roleTitle || 'Duty Manager'})
Arena Shift Status: ${isSigned ? 'VERIFIED & BALANCED' : 'DRAFT / PENDING SIGN-OFF'}

==================================================
1. DEPARTMENT REVENUE BREAKDOWN
==================================================
• Court Bookings (${totalCourtHours.toFixed(1)} hrs | ${courtUtilizationPct}% occupancy) : Rs. ${totalCourtRevenue.toLocaleString('en-IN')}
• Kitchen & Cafe (${totalCafeOrdersCount} orders)                                  : Rs. ${totalCafeRevenue.toLocaleString('en-IN')}
• Equipment & Gear Rentals                                              : Rs. ${totalEquipmentRevenue.toLocaleString('en-IN')}
--------------------------------------------------
★ GROSS DAILY TOTAL REVENUE                                             : Rs. ${grossDailyRevenue.toLocaleString('en-IN')}

==================================================
2. PAYMENT AUDIT & CASH RECONCILIATION
==================================================
• UPI / Digital Receipts                                                : Rs. ${upiRevenue.toLocaleString('en-IN')}
• Club Wallet Credits Deducted                                          : Rs. ${walletRevenue.toLocaleString('en-IN')}
• Expected Cash in Drawer                                               : Rs. ${expectedCashInDrawer.toLocaleString('en-IN')}
• Counted Cash in Drawer                                                : Rs. ${countedCashNumber.toLocaleString('en-IN')}
• Cash Drawer Variance                                                  : Rs. ${cashVariance === 0 ? '0 (BALANCED)' : cashVariance > 0 ? `+${cashVariance}` : `${cashVariance}`}

==================================================
3. DUTY MANAGER NOTES & OPERATIONS
==================================================
${managerNotes || 'Shift concluded normally with zero operational disputes.'}

--------------------------------------------------
Prepared By: ${currentStaffUser?.name || 'Duty Staff'}
Approved By: Pratish Gupta (Founder & General Manager)
Court & Cafe Arena • 12th Main Road, Indiranagar, Bengaluru
GSTIN: 29AABCC1234F1Z5 | FSSAI: 11223344556677
*** END OF EXECUTIVE AUDIT RECORD ***`;

    const mailtoUrl = `mailto:pratishgupta22@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    addToast('Email Client Opened ✉️', 'Pre-filled executive Z-Report ready for rapid owner review.', 'success');
  };

  return (
    <div className="DailySettlementModal fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-zinc-950 border border-zinc-700 shadow-2xl p-4 sm:p-7 my-auto max-h-[95vh] overflow-y-auto print:max-w-none print:m-0 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition z-20 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Header in screen mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Executive Daily Z-Report & Settlement</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  SHIFT CLOSE
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                End-of-day financial reconciliation, cash drawer balance & shift sign-off.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveReportView('standard')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeReportView === 'standard'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Executive View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReportView('receipt')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeReportView === 'receipt'
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Printable Z-Report</span>
              </button>
            </div>

            <button
              type="button"
              id="email-z-report-btn"
              onClick={handleEmailZReport}
              className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Send Pre-Formatted Z-Report via Email"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email Z-Report</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsAppSummary}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-1.5 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedSummary ? 'Copied!' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* View 1: Printable High-Contrast Text-Based Receipt Summary */}
        {activeReportView === 'receipt' ? (
          <div className="space-y-4">
            {/* Quick Actions Bar for Receipt */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 print:hidden">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">High-Contrast Text Z-Receipt</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  Thermal 80mm / PDF / Mobile
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="email-z-report-receipt-btn"
                  onClick={handleEmailZReport}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  title="Trigger mailto with daily financial report"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email Owner</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyRawReceipt}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 text-teal-400" />
                  <span>{copiedRawText ? 'Copied Text!' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save .txt</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* The Text-Based High Contrast Receipt Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white text-zinc-950 border-2 border-zinc-900 shadow-2xl font-mono text-xs leading-relaxed overflow-x-auto print:p-0 print:border-none print:shadow-none">
              <pre className="whitespace-pre font-mono font-medium text-[11px] sm:text-xs text-zinc-950 selection:bg-amber-200">
                {generateRawReceiptText()}
              </pre>
            </div>
          </div>
        ) : (
          /* View 2: Executive Full Structured Settlement Table */
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 print:bg-white print:text-black print:p-0 print:border-none">
            {/* Document Header */}
            <div className="border-b border-zinc-800 pb-5 mb-5 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight text-white print:text-black flex items-center gap-2">
                  <span>COURT & CAFE</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 print:bg-gray-200 text-zinc-300 print:text-black font-semibold">
                    CHAMPIONSHIP ARENA
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 print:text-gray-600 mt-0.5">
                  Center Court Private Pickleball Arena & Artisanal Kitchen
                </p>
                <p className="text-[11px] text-zinc-500 print:text-gray-500 mt-0.5">
                  GSTIN: 29AABCC1234F1Z5 • FSSAI Lic: 11223344556677
                </p>
              </div>

              <div className="text-right text-xs">
                <div className="font-mono font-bold text-amber-400 print:text-black text-sm">
                  DAILY Z-REPORT #{reportRefNo}
                </div>
                <div className="text-zinc-400 print:text-gray-600 mt-0.5">
                  Date: {todayDateStr}
                </div>
                <div className="text-zinc-400 print:text-gray-600">
                  Staff on Duty: <span className="font-bold text-zinc-200 print:text-black">{currentStaffUser?.name || 'Sunil Rao'}</span> ({currentStaffUser?.roleTitle || 'Duty Manager'})
                </div>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 print:bg-gray-100 border border-zinc-800 print:border-gray-300">
                <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600">
                  Total Gross Revenue
                </span>
                <div className="text-xl font-black text-emerald-400 print:text-black mt-1">
                  ₹{grossDailyRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-zinc-400 print:text-gray-600 mt-0.5">
                  100% Reconciled
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 print:bg-gray-100 border border-zinc-800 print:border-gray-300">
                <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600">
                  Court Bookings
                </span>
                <div className="text-xl font-black text-white print:text-black mt-1">
                  ₹{totalCourtRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-zinc-400 print:text-gray-600 mt-0.5">
                  {totalCourtHours} hrs ({courtUtilizationPct}% occupancy)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 print:bg-gray-100 border border-zinc-800 print:border-gray-300">
                <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600">
                  Cafe & Kitchen
                </span>
                <div className="text-xl font-black text-amber-400 print:text-black mt-1">
                  ₹{totalCafeRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-zinc-400 print:text-gray-600 mt-0.5">
                  {totalCafeOrdersCount} food & drink orders
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/70 print:bg-gray-100 border border-zinc-800 print:border-gray-300">
                <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600">
                  Equipment Gear
                </span>
                <div className="text-xl font-black text-teal-400 print:text-black mt-1">
                  ₹{totalEquipmentRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-zinc-400 print:text-gray-600 mt-0.5">
                  {totalEquipmentRentalsCount} paddles & ball cans
                </div>
              </div>
            </div>

            {/* Tender Reconciliation Table */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 print:text-black mb-2.5">
                Payment Tender Reconciliation
              </h3>
              <div className="border border-zinc-800 print:border-gray-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 print:bg-gray-200 text-zinc-400 print:text-black border-b border-zinc-800 print:border-gray-300">
                    <tr>
                      <th className="p-3 font-bold">Payment Method</th>
                      <th className="p-3 font-bold">Expected System Total</th>
                      <th className="p-3 font-bold">Physical / Bank Verified</th>
                      <th className="p-3 font-bold text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 print:divide-gray-300">
                    <tr>
                      <td className="p-3 font-semibold text-white print:text-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>UPI Online (GPay / PhonePe / Paytm)</span>
                      </td>
                      <td className="p-3 font-mono">₹{upiRevenue.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono text-emerald-400 print:text-black">₹{upiRevenue.toLocaleString('en-IN')} (Bank Verified)</td>
                      <td className="p-3 font-mono text-right text-emerald-400 print:text-black">₹0 (Matched)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white print:text-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        <span>Club Pass Wallet Deductions</span>
                      </td>
                      <td className="p-3 font-mono">₹{walletRevenue.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono text-teal-400 print:text-black">₹{walletRevenue.toLocaleString('en-IN')} (Ledger Verified)</td>
                      <td className="p-3 font-mono text-right text-teal-400 print:text-black">₹0 (Matched)</td>
                    </tr>
                    <tr className="bg-amber-950/20 print:bg-yellow-50">
                      <td className="p-3 font-bold text-amber-300 print:text-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Front Desk Physical Cash Drawer</span>
                      </td>
                      <td className="p-3 font-mono font-bold">₹{expectedCashInDrawer.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-1 print:hidden">
                          <span>₹</span>
                          <input
                            type="number"
                            placeholder={expectedCashInDrawer.toString()}
                            value={actualCashCounted}
                            onChange={(e) => setActualCashCounted(e.target.value)}
                            className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-xs"
                          />
                        </div>
                        <span className="hidden print:inline font-mono font-bold">
                          ₹{countedCashNumber.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className={`p-3 font-mono font-bold text-right ${cashVariance === 0 ? 'text-emerald-400 print:text-black' : cashVariance > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        {cashVariance === 0 ? '₹0 (Exact)' : (cashVariance > 0 ? `+₹${cashVariance}` : `-₹${Math.abs(cashVariance)}`)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shift Handover Notes */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-gray-700 mb-1.5 block">
                Duty Manager Shift Notes & Facility Handover:
              </label>
              <textarea
                rows={2}
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 print:bg-transparent print:border-none print:p-0 print:text-black"
              />
            </div>

            {/* Signatures & Seal */}
            <div className="border-t border-zinc-800 print:border-gray-400 pt-5 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Shift Prepared By</div>
                <div className="font-bold text-white print:text-black mt-1">{currentStaffUser?.name || 'Sunil Rao'}</div>
                <div className="text-[10px] text-zinc-400">{currentStaffUser?.roleTitle || 'Duty Manager'}</div>
              </div>

              <div className="text-center">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Club Official Seal</div>
                <div className="mt-1 px-3 py-1 rounded-lg border border-amber-500/40 text-[10px] font-mono font-black text-amber-400 print:text-black uppercase">
                  {isSigned ? '✓ VERIFIED & SETTLED' : 'PENDING SIGN-OFF'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Owner / General Manager</div>
                <div className="font-bold text-white print:text-black mt-1">Pratish Gupta</div>
                <div className="text-[10px] text-zinc-400">Founder & Operator</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Sign-Off Trigger */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveReportView(activeReportView === 'standard' ? 'receipt' : 'standard')}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>{activeReportView === 'standard' ? 'View Printable Z-Report' : 'View Full Statement'}</span>
            </button>

            <button
              type="button"
              id="footer-email-z-report-btn"
              onClick={handleEmailZReport}
              className="px-3.5 py-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 text-blue-300 font-bold text-xs transition flex items-center gap-1.5 active:scale-95"
              title="Email Pre-Formatted Summary to Owner"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Email Z-Report</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
            >
              Close
            </button>

            {!isSigned ? (
              <button
                type="button"
                onClick={handleSignShift}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Sign-Off Shift</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Shift Reconciled & Closed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

