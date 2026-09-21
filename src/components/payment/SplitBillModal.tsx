import React, { useState } from 'react';
import {
  Users,
  QrCode,
  Copy,
  Check,
  Share2,
  X,
  Sparkles,
  Smartphone,
  CreditCard,
  Send,
  UserCheck,
} from 'lucide-react';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  itemDescription?: string;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  itemDescription = 'Pickleball Court Session & Cafe Order',
}) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'You (Organizer)',
    'Rohan Patel',
    'Arjun Verma',
    'Kabir Mehta',
  ]);
  const [paidStatus, setPaidStatus] = useState<Record<number, boolean>>({ 0: true });
  const [copiedLink, setCopiedLink] = useState(false);
  const [upiId, setUpiId] = useState('thedinkingroom@icici');

  if (!isOpen) return null;

  const perPersonShare = Math.round((totalAmount / playerCount) * 10) / 10;

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const defaults = ['You (Organizer)', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'];
    setPlayerNames(defaults.slice(0, count));
  };

  const handleNameChange = (index: number, val: string) => {
    setPlayerNames(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const togglePaid = (index: number) => {
    setPaidStatus(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // NPCI UPI String
  const upiPayString = `upi://pay?pa=${upiId}&pn=TheDinkingRoom&am=${perPersonShare}&cu=INR&tn=PickleballSplit`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiPayString
  )}&bgcolor=18181b&color=f59e0b`;

  const whatsappMessage = `🏸 Hey team! Here's the split for ${itemDescription} at The Dinking Room.\n\nTotal: ₹${totalAmount}\nYour share (${playerCount} players): ₹${perPersonShare} each\nPay via UPI ID: ${upiId}\nDirect UPI Link: ${upiPayString}\n\nSee you on the court! 🔥`;

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const settledCount = Object.values(paidStatus).filter(Boolean).length;
  const collectedAmount = settledCount * perPersonShare;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Smart Court Split-Bill & UPI QR</h3>
                <span className="px-2 py-0.2 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  INSTANT
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Split court hire and cafe treats with your doubles team
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Total & Share Highlight */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Total Bill</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">₹{totalAmount}</span>
              <span className="text-[10px] text-zinc-500 block truncate mt-0.5">{itemDescription}</span>
            </div>
            <div className="border-l border-zinc-800 pl-3">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Each Player Pays</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">₹{perPersonShare}</span>
              <span className="text-[10px] text-emerald-400 block font-semibold mt-0.5">
                {playerCount} Equal Portions
              </span>
            </div>
          </div>

          {/* Player Count Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Split Among Players:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 6].map(count => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2 rounded-xl text-xs font-black transition border ${
                    playerCount === count
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          {/* QR Code and Quick UPI Share */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <div className="w-40 h-40 bg-zinc-900 rounded-2xl border border-zinc-700 flex items-center justify-center p-2 flex-shrink-0 shadow-lg">
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="space-y-2.5 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-200">Scan via GPay / PhonePe / Paytm</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scan with any Indian UPI app to pay exact share of <strong className="text-amber-300">₹{perPersonShare}</strong> directly to venue account.
              </p>

              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <button
                  onClick={handleCopyWhatsAppText}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Details!' : 'Copy UPI Share Text'}</span>
                </button>

                <button
                  onClick={handleOpenWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Player Settlement Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Settlement Checklist:
              </label>
              <span className="text-xs font-mono text-zinc-400">
                Collected: <strong className="text-emerald-400">₹{collectedAmount}</strong> / ₹{totalAmount}
              </span>
            </div>

            <div className="space-y-2">
              {playerNames.map((name, idx) => {
                const isPaid = paidStatus[idx];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-mono font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={e => handleNameChange(idx, e.target.value)}
                        className="bg-transparent text-white font-semibold focus:outline-none border-b border-transparent focus:border-amber-400 w-full"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400 font-bold">₹{perPersonShare}</span>
                      <button
                        onClick={() => togglePaid(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {isPaid ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                        <span>{isPaid ? 'Settled' : 'Mark Paid'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
