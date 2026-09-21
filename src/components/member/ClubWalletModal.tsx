import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  X,
  CreditCard,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Copy,
  Check,
  ShieldCheck,
  Gift,
  Clock,
  Award,
} from 'lucide-react';
import { playCashChime } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface RechargePack {
  amount: number;
  bonus: number;
  totalCredit: number;
  tag?: string;
  popular?: boolean;
}

interface SeasonPass {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  hours: number;
  description: string;
  perks: string[];
  popular?: boolean;
}

const RECHARGE_PACKS: RechargePack[] = [
  { amount: 500, bonus: 0, totalCredit: 500 },
  { amount: 1000, bonus: 100, totalCredit: 1100, tag: '+₹100 Free Credit' },
  { amount: 2500, bonus: 300, totalCredit: 2800, tag: '+₹300 Free Credit', popular: true },
  { amount: 5000, bonus: 750, totalCredit: 5750, tag: '+₹750 VIP Bonus' },
];

const SEASON_PASSES: SeasonPass[] = [
  {
    id: 'pass-5hr',
    title: '5-Hour Morning & Midday Pass',
    price: 2125,
    originalPrice: 2500,
    hours: 5,
    description: '5 hours of court booking at ₹425/hr. Valid for 60 days.',
    perks: ['Save 15% on standard rates', 'Free paddle rental with every slot', 'Priority booking window'],
  },
  {
    id: 'pass-10hr',
    title: '10-Hour Championship Card',
    price: 4000,
    originalPrice: 5000,
    hours: 10,
    description: '10 hours of court time at ₹400/hr. Valid for 90 days.',
    perks: ['Save 20% on court fees', '2x Free Carbon Fiber Paddle Rentals', '2x Chilled Mineral Water bottles', '10% off Cafe & Kitchen orders'],
    popular: true,
  },
  {
    id: 'pass-monthly',
    title: 'Dink & Dine Monthly Unlimited',
    price: 7999,
    originalPrice: 10000,
    hours: 25,
    description: 'Comprehensive month pass with priority access & cafe perks.',
    perks: ['Unlimited off-peak weekday play (6AM - 4PM)', '15% flat discount on all Cafe food', 'VIP Lounge access & towel service', 'Free social mixer admissions'],
  },
];

export const ClubWalletModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    walletBalance,
    topUpWallet,
    openPaymentModal,
    bookings,
    cafeOrders,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'recharge' | 'passes' | 'ledger'>('recharge');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPack = (pack: RechargePack) => {
    openPaymentModal({
      title: 'Top Up Club Pass Wallet',
      amount: pack.amount,
      itemDescription: `Add ₹${pack.totalCredit} club credits (Includes ₹${pack.bonus} free bonus)`,
      category: 'wallet',
      onSuccess: (paymentDetails) => {
        topUpWallet(pack.totalCredit, paymentDetails);
        playCashChime();
        addToast(
          'Wallet Recharged!',
          `₹${pack.totalCredit} has been credited to your pass wallet.`,
          'success'
        );
      },
    });
  };

  const handleCustomRecharge = () => {
    const val = parseInt(customAmount, 10);
    if (isNaN(val) || val < 100) {
      addToast('Invalid Amount', 'Minimum recharge is ₹100.', 'info');
      return;
    }
    openPaymentModal({
      title: 'Custom Wallet Recharge',
      amount: val,
      itemDescription: `Add ₹${val} to your Court & Cafe club wallet`,
      category: 'wallet',
      onSuccess: (paymentDetails) => {
        topUpWallet(val, paymentDetails);
        playCashChime();
        setCustomAmount('');
      },
    });
  };

  const handleBuySeasonPass = (pass: SeasonPass) => {
    openPaymentModal({
      title: pass.title,
      amount: pass.price,
      itemDescription: `${pass.hours} Hours Pass (${pass.description})`,
      category: 'wallet',
      onSuccess: (paymentDetails) => {
        // Add equivalent credits or activate pass
        topUpWallet(pass.originalPrice, paymentDetails);
        playCashChime();
        addToast(
          'Season Pass Activated! 🏆',
          `"${pass.title}" is now linked to ${currentUser?.membershipId || 'your account'}! ₹${pass.originalPrice} play credits added.`,
          'success'
        );
      },
    });
  };

  const copyTxnId = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedTxn(id);
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  // Construct combined transaction ledger
  const recentBookings = bookings.slice(0, 5).map(b => ({
    id: b.id,
    type: 'booking' as const,
    title: `Court Reservation: ${b.courtName}`,
    subtitle: `${b.date} • ${b.startTime} (${b.durationHours}h)`,
    amount: b.totalAmount,
    date: b.createdAt || new Date().toISOString(),
    isCredit: false,
    method: b.paymentDetails?.method || 'wallet',
  }));

  const recentOrders = cafeOrders.slice(0, 5).map(o => ({
    id: o.id,
    type: 'cafe' as const,
    title: `Cafe Order #${o.id.slice(-4)}`,
    subtitle: `${o.items.length} items • ${o.deliveryType === 'court_delivery' ? 'Courtside Butler' : 'Table / Takeaway'}`,
    amount: o.totalAmount,
    date: o.createdAt || new Date().toISOString(),
    isCredit: false,
    method: o.paymentDetails?.method || 'wallet',
  }));

  const sampleCredits = [
    {
      id: 'WAL-TOPUP-9821',
      type: 'topup' as const,
      title: 'Wallet Pass Recharge',
      subtitle: 'Instant UPI Bonus Pack Credit',
      amount: 1100,
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      isCredit: true,
      method: 'upi',
    },
  ];

  const ledger = [...sampleCredits, ...recentBookings, ...recentOrders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-950 border border-zinc-700 shadow-2xl p-4 sm:p-6 my-auto max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Club Pass & Digital Wallet</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                1-TAP PAY
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Zero surcharge instant payments for courts, equipment rentals & artisanal cafe.
            </p>
          </div>
        </div>

        {/* Digital Membership Gold Card Preview */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-900 border border-amber-500/30 p-5 shadow-xl mb-6">
          {/* Subtle gold watermark */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 text-[64px] font-black text-amber-500/5 select-none pointer-events-none">
            CC
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                  COURT & CAFE PASS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Center Court Championship Membership</p>
            </div>
            {/* Holographic Chip */}
            <div className="w-10 h-8 rounded-lg bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-500 border border-amber-400/80 shadow-sm flex items-center justify-center">
              <div className="w-6 h-4 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                <div className="border-r border-amber-800/40" />
                <div />
              </div>
            </div>
          </div>

          <div className="mt-5 relative z-10 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-medium text-zinc-400 block uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span>₹{walletBalance.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-emerald-400">INR</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-medium text-zinc-400 block uppercase tracking-wider">
                Member ID
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {currentUser?.membershipId || 'CC-2026-VIP'}
              </span>
              <div className="text-[11px] text-zinc-300 font-semibold">{currentUser?.name || 'Club Member'}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('recharge')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'recharge'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Recharge Wallet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'passes'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Season Passes (Save 20%)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-zinc-200 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Transactions</span>
          </button>
        </div>

        {/* Tab 1: Instant Wallet Recharge */}
        {activeTab === 'recharge' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-2 block">
                Select Recharge Bonus Pack:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RECHARGE_PACKS.map(pack => (
                  <button
                    key={pack.amount}
                    type="button"
                    onClick={() => handleSelectPack(pack)}
                    className={`relative p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between hover:scale-[1.02] active:scale-95 ${
                      pack.popular
                        ? 'bg-gradient-to-b from-emerald-950/60 to-zinc-900 border-emerald-500 shadow-md shadow-emerald-500/15'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {pack.tag && (
                      <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-zinc-950 shadow-sm">
                        {pack.tag}
                      </span>
                    )}
                    <div>
                      <div className="text-lg font-black text-white">₹{pack.amount}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        Get ₹{pack.totalCredit}
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-zinc-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Instant Add</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                Or Enter Custom Amount (₹):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -tranzinc-y-1/2 text-zinc-500 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount (min ₹100)"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCustomRecharge}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Recharge</span>
                </button>
              </div>
            </div>

            {/* Perks Summary */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero gateway convenience fee</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant 1-tap booking & cafe</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% refundable anytime</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Season Play Passes */}
        {activeTab === 'passes' && (
          <div className="space-y-3">
            {SEASON_PASSES.map(pass => (
              <div
                key={pass.id}
                className={`p-4 rounded-2xl border transition-all ${
                  pass.popular
                    ? 'bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{pass.title}</h4>
                      {pass.popular && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-zinc-950">
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{pass.description}</p>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {pass.perks.map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-700/60"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{p}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-black text-white">₹{pass.price.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-zinc-500 line-through">
                        ₹{pass.originalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuySeasonPass(pass)}
                      className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Activate Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Transaction History Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {ledger.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      item.isCredit
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.isCredit ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-100">{item.title}</div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>{item.subtitle}</span>
                      <span>•</span>
                      <span>{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-black text-sm ${
                      item.isCredit ? 'text-emerald-400' : 'text-zinc-200'
                    }`}
                  >
                    {item.isCredit ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTxnId(item.id)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 ml-auto mt-0.5"
                    title="Copy Transaction ID"
                  >
                    {copiedTxn === item.id ? (
                      <span className="text-emerald-400">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>#{item.id.slice(-6)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
