import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import {
  QrCode,
  CheckCircle2,
  Search,
  Printer,
  Share2,
  Copy,
  Check,
  Zap,
  Clock,
  ShieldCheck,
  UserCheck,
  Phone,
  MapPin,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Download,
  Calendar,
  UserPlus,
  X,
  CreditCard,
  Wifi,
} from 'lucide-react';

interface Props {
  initialBookingId?: string;
  onCloseModal?: () => void;
  isModalMode?: boolean;
}

export const MemberEntryQRView: React.FC<Props> = ({
  initialBookingId,
  onCloseModal,
  isModalMode = false,
}) => {
  const {
    bookings,
    courts,
    checkInBooking,
    createBooking,
    courtLights,
    toggleCourtLight,
    addShiftLog,
    currentStaffUser,
  } = useApp();

  // Mode: 'existing' (select from bookings) vs 'instant_walkin' (generate for walk-in/new player)
  const [activeMode, setActiveMode] = useState<'existing' | 'instant_walkin'>('existing');

  // Search filter for existing bookings
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(() => {
    if (initialBookingId) return initialBookingId;
    // Default to first confirmed booking if available
    const firstConfirmed = bookings.find(b => b.status === 'confirmed');
    return firstConfirmed ? firstConfirmed.id : bookings[0]?.id || '';
  });

  // State for generated QR Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrPayloadString, setQrPayloadString] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [lastCheckInSuccess, setLastCheckInSuccess] = useState<string | null>(null);

  // Instant Walk-in generator form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinCourtId, setWalkinCourtId] = useState(courts[0]?.id || 'court-1');
  const [walkinSlot, setWalkinSlot] = useState('18:00');
  const [walkinDuration, setWalkinDuration] = useState<number>(1);
  const [walkinPaymentMethod, setWalkinPaymentMethod] = useState<'cash' | 'upi'>('cash');

  // Filter today's / confirmed bookings
  const todayStr = new Date().toISOString().split('T')[0];
  
  const selectableBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const matchesSearch =
        b.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.memberPhone.includes(searchQuery) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.courtName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [bookings, searchQuery]);

  // Selected Booking object
  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  // Generate real scannable QR code whenever selected booking changes
  useEffect(() => {
    if (!selectedBooking) {
      setQrDataUrl('');
      setQrPayloadString('');
      return;
    }

    // Structured, scannable payload
    // Can be scanned by any smartphone camera or optical reception scanner
    const payload = JSON.stringify({
      club: 'Court & Cafe',
      type: 'COURT_ENTRY_PASS',
      bookingId: selectedBooking.id,
      courtId: selectedBooking.courtId,
      courtName: selectedBooking.courtName,
      slot: selectedBooking.startTime,
      duration: `${selectedBooking.durationHours}h`,
      date: selectedBooking.date,
      member: selectedBooking.memberName,
      phone: selectedBooking.memberPhone,
      status: selectedBooking.status,
      timestamp: Date.now(),
      verifyUrl: `https://courtandcafe.com/entry/verify?bid=${selectedBooking.id}&token=${selectedBooking.qrCode}`,
    });

    setQrPayloadString(payload);

    QRCode.toDataURL(payload, {
      width: 380,
      margin: 2,
      color: {
        dark: '#18181b', // Zinc-900 high contrast dark dots
        light: '#ffffff', // Pure white background for maximum optical scanner readability
      },
      errorCorrectionLevel: 'H', // High error correction allows center branding badge
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR code', err);
      });
  }, [selectedBooking]);

  // Trigger instant check-in for the selected booking
  const handlePerformInstantCheckIn = () => {
    if (!selectedBooking) return;

    // 1. Mark booking checked-in in global context
    checkInBooking(selectedBooking.id);

    // 2. Automatically ensure court tournament floodlights are turned ON
    if (!courtLights[selectedBooking.courtId]) {
      toggleCourtLight(selectedBooking.courtId);
    }

    // 3. Log into shift handover notes
    addShiftLog(
      `QR Gate Check-In: ${selectedBooking.memberName} (${selectedBooking.memberPhone}) verified & granted court access to ${selectedBooking.courtName} for ${selectedBooking.startTime} (${selectedBooking.durationHours === 0.5 ? '30m' : `${selectedBooking.durationHours}h`}). Verified by Staff ID ${currentStaffUser?.staffId || 'DESK'}.`,
      'general',
      'Front Desk'
    );

    // 4. Confetti burst & banner state
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {
      // safe fallback
    }

    setLastCheckInSuccess(selectedBooking.id);
    setTimeout(() => setLastCheckInSuccess(null), 8000);
  };

  // Instant Walk-In Form Submission
  const handleCreateWalkInAndGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    const courtObj = courts.find(c => c.id === walkinCourtId) || courts[0];
    const hourlyRate = walkinCourtId === 'court-1' ? 500 : 400;
    const courtFee = walkinDuration === 0.5 ? Math.round(hourlyRate * 0.54) : Math.round(hourlyRate * walkinDuration);
    const totalAmount = courtFee;

    const newBooking = createBooking(
      {
        courtId: courtObj.id,
        courtName: courtObj.name,
        date: todayStr,
        startTime: walkinSlot,
        durationHours: walkinDuration,
        hourlyRate,
        courtFee,
        addOnsTotal: 0,
        addOns: { paddles: 0, ballCans: 0, coaching: false },
        totalAmount,
        memberName: walkinName.trim(),
        memberPhone: walkinPhone.trim() || '+91 98450 00000',
        memberEmail: 'walkin@courtandcafe.com',
        notes: `Front Desk Walk-In (${walkinPaymentMethod === 'cash' ? 'Cash Received at Desk' : 'UPI Verified'}). Instant QR Generated.`,
      },
      {
        method: walkinPaymentMethod === 'cash' ? 'desk' : 'upi',
        amount: totalAmount,
        transactionId: `TXN-${Date.now().toString().slice(-6)}`,
        paidAt: new Date().toISOString(),
        status: 'completed',
      }
    );

    // Automatically switch to existing tab and select this new booking
    setSelectedBookingId(newBooking.id);
    setActiveMode('existing');

    // Reset walkin fields
    setWalkinName('');
    setWalkinPhone('');
  };

  // Copy QR share link / verification code to clipboard
  const handleCopyLink = () => {
    if (!selectedBooking) return;
    const textToCopy = `🎾 Court & Cafe Entry Pass\nPlayer: ${selectedBooking.memberName}\nCourt: ${selectedBooking.courtName}\nSlot: ${selectedBooking.date} at ${selectedBooking.startTime} (${selectedBooking.durationHours === 0.5 ? '30m' : `${selectedBooking.durationHours}h`})\nGate Code: #${selectedBooking.id} (${selectedBooking.qrCode})\nStatus: Confirmed`;
    navigator.clipboard?.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    if (!selectedBooking) return;
    const text = encodeURIComponent(
      `🎾 *Court & Cafe - Official Member Court Entry Pass*\n` +
      `Player: *${selectedBooking.memberName}*\n` +
      `Court: *${selectedBooking.courtName}*\n` +
      `Time: *${selectedBooking.date} at ${selectedBooking.startTime} (${selectedBooking.durationHours === 0.5 ? '30 mins' : `${selectedBooking.durationHours} hr`})*\n` +
      `Verification Code: *#${selectedBooking.id}*\n` +
      `Gate Access Code: *${selectedBooking.qrCode}*\n` +
      `Please display this pass at reception or scan at the court gate for automatic turnstile access!\n` +
      `📍 Court & Cafe Center Court Arena`
    );
    const cleanPhone = selectedBooking.memberPhone.replace(/\D/g, '');
    const url = cleanPhone.length >= 10 ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Print Gate Pass Receipt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-6 ${isModalMode ? 'p-1' : 'pb-20'}`}>
      {/* Top Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-900 border border-amber-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Member Entry QR Generator</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-zinc-950">
                  RECEPTION & GATE CONTROLLER
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Display scannable optical QR badges on the front desk screen, tablet kiosk, or print gate slips to verify and check in players to their booked court in under 2 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setActiveMode('existing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeMode === 'existing'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Select Active Booking ({selectableBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveMode('instant_walkin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeMode === 'instant_walkin'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>⚡ Instant Walk-In Fast QR</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Selector / Form & Right High-Res QR Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 5 Cols (Booking list or Walk-in generator form) */}
        <div className="lg:col-span-5 space-y-4">
          {activeMode === 'existing' ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Choose Player Reservation</span>
                <span className="text-[11px] text-zinc-500">{selectableBookings.length} bookings found</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter player name, phone, or #PB ID..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scrollable Bookings List */}
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {selectableBookings.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 text-xs">
                    No matching bookings. Switch to "Instant Walk-In Fast QR" to register a player on the spot.
                  </div>
                ) : (
                  selectableBookings.map(b => {
                    const isSelected = b.id === selectedBookingId;
                    const isCheckedIn = b.status === 'checked-in';

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">{b.memberName}</span>
                            <span className="text-[10px] font-mono text-zinc-500">#{b.id}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span className="text-amber-300 font-semibold">{b.courtName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {b.startTime} ({b.durationHours === 0.5 ? '30m' : `${b.durationHours}h`})
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {b.memberPhone}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isCheckedIn ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Checked In
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Confirmed
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            ₹{b.totalAmount}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Mode 2: Instant Walk-In Fast QR Form */
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instant Walk-In Entry Pass</h3>
                  <p className="text-[11px] text-zinc-400">Generate a court pass for an on-spot arrival</p>
                </div>
              </div>

              <form onSubmit={handleCreateWalkInAndGenerateQR} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Player / Guest Name</label>
                  <input
                    type="text"
                    value={walkinName}
                    onChange={e => setWalkinName(e.target.value)}
                    placeholder="e.g. Vikramaditya Mehta"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Phone Number (+91)</label>
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={e => setWalkinPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Court</label>
                    <select
                      value={walkinCourtId}
                      onChange={e => setWalkinCourtId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {courts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Start Time</label>
                    <select
                      value={walkinSlot}
                      onChange={e => setWalkinSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    >
                      {['07:00', '08:00', '09:00', '10:00', '11:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Duration</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWalkinDuration(0.5)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          walkinDuration === 0.5
                            ? 'bg-amber-500 text-zinc-950 border-amber-400'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        30m (₹270)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWalkinDuration(1)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          walkinDuration === 1
                            ? 'bg-amber-500 text-zinc-950 border-amber-400'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        1h (₹500)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Payment Method</label>
                    <select
                      value={walkinPaymentMethod}
                      onChange={e => setWalkinPaymentMethod(e.target.value as 'cash' | 'upi')}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="cash">💵 Cash at Front Desk</option>
                      <option value="upi">📱 UPI QR Paid</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book & Generate QR Badge Instantly</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: 7 Cols (The Actual Scannable Optical QR Pass Display) */}
        <div className="lg:col-span-7">
          {selectedBooking ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative">
              {/* Success Banner if checked in just now */}
              {lastCheckInSuccess === selectedBooking.id && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span>Gate Check-In Confirmed! {selectedBooking.memberName} is now marked as PLAYING on {selectedBooking.courtName}.</span>
                  </div>
                </div>
              )}

              {/* Physical Gate Pass / Scannable Ticket Container */}
              <div
                id="printable-gate-pass"
                className="rounded-2xl bg-white text-zinc-950 p-6 shadow-2xl border-4 border-amber-400/80 relative overflow-hidden"
              >
                {/* Decorative watermarks & header */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-zinc-200 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-serif font-black text-base shadow-sm">
                      CC
                    </div>
                    <div>
                      <h3 className="font-black text-zinc-950 text-base sm:text-lg tracking-tight leading-none">
                        COURT & CAFE
                      </h3>
                      <span className="text-[10px] font-extrabold tracking-wider text-amber-600 uppercase">
                        Center Court Championship Arena
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">
                      PASS: {selectedBooking.id}
                    </span>
                    <div className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                      {selectedBooking.date}
                    </div>
                  </div>
                </div>

                {/* Main QR Code & Player Info Row */}
                <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Left details */}
                  <div className="space-y-3 flex-1 text-left w-full">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        Authorized Member / Player
                      </span>
                      <h4 className="text-xl font-black text-zinc-900 tracking-tight">
                        {selectedBooking.memberName}
                      </h4>
                      <p className="text-xs text-zinc-600 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        {selectedBooking.memberPhone}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">Assigned Court</span>
                        <span className="text-xs font-black text-zinc-900 block truncate">
                          {selectedBooking.courtName}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">Session Slot</span>
                        <span className="text-xs font-black text-amber-600 font-mono block">
                          {selectedBooking.startTime} ({selectedBooking.durationHours === 0.5 ? '30m' : `${selectedBooking.durationHours}h`})
                        </span>
                      </div>
                    </div>

                    {/* Status & Verification code */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Gate Access Token:</span>
                        <span className="font-mono font-black text-zinc-900 text-xs">
                          {selectedBooking.qrCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-400 block">Total Paid:</span>
                        <span className="font-mono font-black text-emerald-600 text-sm">
                          ₹{selectedBooking.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: High-Res Scannable QR Graphic */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border-2 border-zinc-900 shadow-inner shrink-0 relative group">
                    {qrDataUrl ? (
                      <div className="relative">
                        <img
                          src={qrDataUrl}
                          alt="Member Entry QR Code"
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                        />
                        {/* Center Brand Overlay Icon */}
                        <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-amber-400 border-2 border-zinc-950 flex items-center justify-center shadow-md pointer-events-none">
                          <span className="font-serif font-black text-zinc-950 text-xs">CC</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-zinc-100 rounded-xl">
                        <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
                      </div>
                    )}
                    <span className="text-[9px] font-black uppercase text-zinc-600 tracking-wider mt-1">
                      Scan At Court Turnstile
                    </span>
                  </div>
                </div>

                {/* Perforated Bottom Tear Line */}
                <div className="border-t-2 border-dashed border-zinc-300 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-zinc-700">
                      <Wifi className="w-3 h-3 text-amber-500" /> Guest Wifi: CourtCafe_5G (Pass: dink2026)
                    </span>
                    <span>•</span>
                    <span className="text-zinc-500">
                      Light Zone: {courtLights[selectedBooking.courtId] ? '🟢 Active' : '⚪ Ready'}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-zinc-400">
                    ID: {selectedBooking.id} • {selectedBooking.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Instant Check-In & Action Bar */}
              <div className="mt-5 space-y-3">
                {selectedBooking.status !== 'checked-in' ? (
                  <button
                    onClick={handlePerformInstantCheckIn}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Scan & Check In Player Instantly (Activate Lights & Access)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Member is Currently Checked-In & Playing</span>
                    </div>
                    <button
                      onClick={handlePerformInstantCheckIn}
                      className="text-xs text-zinc-400 hover:text-white underline font-semibold"
                    >
                      Re-verify Gate
                    </button>
                  </div>
                )}

                {/* Secondary Utility Actions */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={handlePrint}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition flex items-center justify-center gap-1.5"
                    title="Print Gate Slip Receipt"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Print Slip</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold text-xs border border-zinc-700 transition flex items-center justify-center gap-1.5"
                    title="Send to Member Phone via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition flex items-center justify-center gap-1.5"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-zinc-900 border border-zinc-800">
              <QrCode className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">No Reservation Selected</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Select a confirmed member booking on the left or create a walk-in to display their scannable gate entry QR code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
