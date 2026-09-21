import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, Booking } from '../../types';
import confetti from 'canvas-confetti';
import { CourtsideWaterModal } from './CourtsideWaterModal';
import { LiveCourtArenaVisualizer } from '../common/LiveCourtArenaVisualizer';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Info,
  Check,
  ShoppingBag,
  Users,
  Wallet,
  Share2,
  Copy,
  Droplets,
} from 'lucide-react';

const TIME_SLOTS = [
  '04:00', '04:30', '05:00', '05:30',
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

interface Props {
  onSwitchToCafe?: () => void;
  onViewPasses?: () => void;
}

export const CourtBookingView: React.FC<Props> = ({ onSwitchToCafe, onViewPasses }) => {
  const {
    courts,
    createBooking,
    isSlotAvailable,
    currentUser,
    walletBalance,
    payWithWallet,
    openPaymentModal,
  } = useApp();

  // Selected state
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || 'court-1');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00');

  // Equipment add-ons
  const [paddles, setPaddles] = useState<number>(0);
  const [ballCans, setBallCans] = useState<number>(0);
  const [coaching, setCoaching] = useState<boolean>(false);
  const [bookingNotes, setBookingNotes] = useState<string>('');

  // Split-Bill with Partners
  const [isSplitBill, setIsSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState<2 | 4>(4);
  const [partnerNames, setPartnerNames] = useState('');
  const [paymentSource, setPaymentSource] = useState<'card' | 'wallet'>('card');
  const [copiedLink, setCopiedLink] = useState(false);

  // Confirmation modal state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);

  // Next 7 days helper
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ iso, weekday, dayNum, month, fullLabel: `${weekday}, ${month} ${dayNum}` });
    }
    return dates;
  }, []);

  const selectedCourt = courts.find(c => c.id === selectedCourtId) || courts[0];

  // Helper to calculate end time cleanly with 30m / 1h / 1.5h / 2h durations
  const getEndTime = (startTime: string, duration: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMins = h * 60 + (m || 0) + Math.round(duration * 60);
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // Pricing calculations: ₹300 for 30 mins, ₹500 for 1 hr (Save ₹100), ₹750 for 1.5 hr, ₹950 for 2 hr
  const getCourtFee = (duration: number) => {
    if (duration === 0.5) return 300;
    if (duration === 1) return 500;
    if (duration === 1.5) return 750;
    if (duration === 2) return 950;
    return Math.round(duration * 500);
  };

  const courtFee = getCourtFee(selectedDuration);
  const hourlyRate = selectedDuration === 0.5 ? 540 : 500;
  const paddleFee = paddles * 50;
  const ballFee = ballCans * 30;
  const coachingFee = coaching ? Math.round(selectedDuration * 200) : 0;
  const addOnsTotal = paddleFee + ballFee + coachingFee;
  const grandTotal = courtFee + addOnsTotal;

  // Slot availability check for current selected duration
  const isCurrentSlotAvailable = isSlotAvailable(selectedCourtId, selectedDate, selectedSlot, selectedDuration);

  const perPersonAmount = isSplitBill ? Math.round(grandTotal / splitCount) : grandTotal;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCurrentSlotAvailable) {
      alert('This slot is already reserved or unavailable. Please choose an available time slot.');
      return;
    }

    const payableAmount = isSplitBill ? perPersonAmount : grandTotal;

    // Launch secure Indian Payment Modal (UPI / Card / Wallet / Netbanking / Pay with Cash at Desk)
    openPaymentModal({
      title: `Reserve ${selectedCourt.name}`,
      amount: payableAmount,
      itemDescription: `${selectedDate} at ${selectedSlot} (${selectedDuration === 0.5 ? '30 mins' : `${selectedDuration} hr`}) • ₹${courtFee}`,
      category: 'court',
      onSuccess: (paymentDetails) => {
        const notesSummary = [
          bookingNotes,
          isSplitBill ? `Split Bill: ${splitCount} Players (₹${perPersonAmount} each). Partners: ${partnerNames || 'Invites sent'}` : '',
          `Paid via ${paymentDetails.method.toUpperCase()} (Ref: ${paymentDetails.transactionId})`,
        ].filter(Boolean).join(' • ');

        const booking = createBooking({
          courtId: selectedCourt.id,
          courtName: selectedCourt.name,
          date: selectedDate,
          startTime: selectedSlot,
          durationHours: selectedDuration,
          hourlyRate,
          courtFee,
          addOns: {
            paddles,
            ballCans,
            coaching,
          },
          addOnsTotal,
          totalAmount: grandTotal,
          memberName: currentUser?.name || 'Club Member',
          memberPhone: currentUser?.phone || '+91 98450 67123',
          memberEmail: currentUser?.email || 'member@courtandcafe.com',
          notes: notesSummary,
          paymentDetails,
        });

        setConfirmedBooking(booking);

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#10b981', '#fbbf24', '#38bdf8'],
          });
        } catch {
          // ignore
        }
      },
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/60 border border-zinc-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Daily: 04:00 AM – 12:00 AM Midnight • ₹300 (30m) / ₹500 (1hr)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reserve Your Pickleball Court
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed">
            Professional cushion acrylic court with tournament-grade LED lighting open from 4:00 AM till 12:00 AM midnight. Book 30 minutes for ₹300 or 1 full hour for only ₹500 (Save ₹100). Order cheese Maggi, cold coffee, chilled ₹20 water bottles, and mango shakes delivered right to your court bench with instant cash or digital payment.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-4 h-4" /> Open Till 12 AM Midnight
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-4 h-4" /> Instant Digital Pass
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-4 h-4" /> Courtside Refreshment Delivery
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-4 h-4" /> Pay Online or Cash at Desk
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsWaterModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition shadow-sm"
            >
              <Droplets className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Request Courtside Water & Towels (Complimentary)</span>
            </button>
            <span className="text-[11px] text-zinc-400">
              Direct alert to courtside staff & butler
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Interactive Regulation Arena & Floodlight HUD */}
      <div className="mb-2">
        <LiveCourtArenaVisualizer
          courtId={selectedCourtId}
          onRequestWater={() => setIsWaterModalOpen(true)}
        />
      </div>

      {/* Booking Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Court & Slot Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Date Selection */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                1. Select Play Date
              </h3>
              <span className="text-xs text-zinc-400">
                {dateOptions.find(d => d.iso === selectedDate)?.fullLabel}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {dateOptions.map(d => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setSelectedDate(d.iso)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-zinc-950 font-bold shadow-md shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className={`text-[11px] uppercase ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`}>
                      {d.weekday}
                    </span>
                    <span className="text-lg font-black my-0.5">{d.dayNum}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {d.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Court */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                2. Choose Court
              </h3>
              <span className="text-xs font-bold text-emerald-400">Fixed Rate: ₹500/hr (₹300/30m)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courts.map(c => {
                const isSelected = selectedCourtId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourtId(c.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-zinc-850 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{c.name}</h4>
                        <p className="text-xs text-emerald-400/90 mt-0.5 font-medium">{c.surface}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        ₹{c.hourlyRate}/hr
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.features.slice(0, 3).map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Duration & Time Slot Selection */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  3. Select Duration & Precise Match Time
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Accurate 30-minute intervals from 06:00 AM to 11:00 PM</p>
              </div>

              {/* Duration selector buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                {[
                  { duration: 0.5, label: '30 Mins', price: '₹300', badge: 'Warm-up' },
                  { duration: 1, label: '1 Hour', price: '₹500', badge: 'Best Value (Save ₹100)' },
                  { duration: 1.5, label: '1.5 Hours', price: '₹750' },
                  { duration: 2, label: '2 Hours', price: '₹950', badge: 'Save ₹50' },
                ].map(opt => (
                  <button
                    key={opt.duration}
                    type="button"
                    onClick={() => setSelectedDuration(opt.duration)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedDuration === opt.duration
                        ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      selectedDuration === opt.duration ? 'bg-zinc-950/20 text-zinc-950 font-black' : 'bg-zinc-800 text-emerald-400'
                    }`}>
                      {opt.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Timing Display Banner */}
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-zinc-300">Selected Reservation Window:</span>
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {selectedSlot} to {getEndTime(selectedSlot, selectedDuration)}
                </span>
                <span className="text-[11px] text-zinc-400">
                  ({selectedDuration === 0.5 ? '30 Mins' : selectedDuration === 1 ? '1 Hour' : `${selectedDuration} Hours`})
                </span>
              </div>
              <span className="text-xs font-black text-emerald-400">
                Court Fee: ₹{courtFee} {selectedDuration === 0.5 ? '(₹270/30m)' : '(₹500/hr)'}
              </span>
            </div>

            {/* Time Slot Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Open for Play
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 ml-2"></span> Booked / Blocked
                </p>
                <span className="text-[11px] text-zinc-500">Click any open 30-min start time</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 pt-2">
                {TIME_SLOTS.map(slot => {
                  const available = isSlotAvailable(selectedCourtId, selectedDate, slot, selectedDuration);
                  const isSelected = selectedSlot === slot && available;
                  const slotEnd = getEndTime(slot, selectedDuration);

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-zinc-950 font-bold shadow-md shadow-emerald-500/20 ring-2 ring-emerald-300'
                          : available
                          ? 'bg-zinc-950/70 border-zinc-800 text-zinc-200 hover:bg-emerald-950/40 hover:border-emerald-500/40'
                          : 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${isSelected ? 'text-zinc-950' : 'text-white'}`}>
                          {slot}
                        </span>
                        <span className={`text-[9px] px-1 rounded ${
                          isSelected
                            ? 'bg-zinc-950/20 text-zinc-900 font-bold'
                            : available
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {available ? 'OPEN' : 'BUSY'}
                        </span>
                      </div>
                      <span className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        to {slotEnd}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isCurrentSlotAvailable && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Selected starting slot ({selectedSlot} to {getEndTime(selectedSlot, selectedDuration)}) is unavailable. Please choose an open slot marked in green.</span>
              </div>
            )}
          </div>

          {/* Step 4: Equipment & Coach Add-ons (Optional) */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              4. Equipment Rental & Coaching (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Paddles */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">Pickleball Honeycomb Paddle</span>
                    <span className="text-xs text-emerald-400 font-semibold">+₹50/ea</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Tournament certified high-spin fiberglass paddle</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaddles(Math.max(0, paddles - 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center">{paddles}</span>
                    <button
                      type="button"
                      onClick={() => setPaddles(Math.min(6, paddles + 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Ball Cans */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">Tournament Ball Can</span>
                    <span className="text-xs text-emerald-400 font-semibold">+₹30/can</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">3x Dura Fast 40 competition balls</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBallCans(Math.max(0, ballCans - 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center">{ballCans}</span>
                    <button
                      type="button"
                      onClick={() => setBallCans(Math.min(4, ballCans + 1))}
                      className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Coaching */}
              <div
                onClick={() => setCoaching(!coaching)}
                className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition ${
                  coaching
                    ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">Coach / Hitting Partner</span>
                    <span className="text-xs text-emerald-400 font-semibold">+₹200/hr</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Certified club pro drills & strategy</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400">Include:</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${coaching ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800'}`}>
                    {coaching && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Booking Summary</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₹270 (30m) • ₹500 (1hr)
              </span>
            </div>

            {/* Selected court details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Court</span>
                <span className="font-bold text-white text-right">{selectedCourt.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Date</span>
                <span className="font-semibold text-zinc-200">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Reserved Slot</span>
                <span className="font-semibold text-emerald-400">
                  {selectedSlot} - {getEndTime(selectedSlot, selectedDuration)} ({selectedDuration === 0.5 ? '30 Mins' : `${selectedDuration} Hour`})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Member</span>
                <span className="font-medium text-zinc-200">{currentUser?.name || 'Club Member'}</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">
                  Court Rate ({selectedDuration === 0.5 ? '30 Mins' : `${selectedDuration} hr`})
                </span>
                <span className="font-bold text-white">₹{courtFee}</span>
              </div>
              {paddles > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Pickleball Paddles ({paddles}x)</span>
                  <span>₹{paddleFee}</span>
                </div>
              )}
              {ballCans > 0 && (
                <div className="flex justify-between text-zinc-300">
                  <span>Ball Cans ({ballCans}x)</span>
                  <span>₹{ballFee}</span>
                </div>
              )}
              {coaching && (
                <div className="flex justify-between text-zinc-300">
                  <span>Pro Coach ({selectedDuration}h)</span>
                  <span>₹{coachingFee}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 border-t border-zinc-800 text-sm">
                <span className="font-bold text-white">Total Amount</span>
                <span className="text-2xl font-black text-emerald-400">₹{grandTotal}</span>
              </div>
            </div>

            {/* Split-Bill with Partners Module */}
            <div className="rounded-xl bg-zinc-950/90 border border-zinc-800 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Split with Playing Partners
                </span>
                <input
                  type="checkbox"
                  checked={isSplitBill}
                  onChange={e => setIsSplitBill(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 cursor-pointer accent-emerald-500"
                />
              </div>

              {isSplitBill && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-850 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Match Format:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSplitCount(2)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                          splitCount === 2 ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        Singles (2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitCount(4)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                          splitCount === 4 ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        Doubles (4)
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Your Share</span>
                      <span className="text-base font-black text-emerald-400">₹{perPersonAmount}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">{splitCount - 1} Partners Pay</span>
                      <span className="text-xs font-bold text-white font-mono">₹{perPersonAmount} each</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Partner names (e.g. Vikram, Tina)"
                      value={partnerNames}
                      onChange={e => setPartnerNames(e.target.value)}
                      className="flex-1 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Share link to partners"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-400">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentSource('card')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition ${
                    paymentSource === 'card'
                      ? 'bg-zinc-800 border-emerald-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="block text-[11px]">UPI / Card</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Instant Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentSource('wallet')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition ${
                    paymentSource === 'wallet'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px]">Club Wallet</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Bal: ₹{walletBalance}</span>
                </button>
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Player Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Competitive doubles warm-up"
                value={bookingNotes}
                onChange={e => setBookingNotes(e.target.value)}
                className="w-full text-xs rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Booking action button */}
            <button
              type="button"
              onClick={handleBooking}
              disabled={!isCurrentSlotAvailable}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                isCurrentSlotAvailable
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                Confirm {isSplitBill ? `Your Share (₹${perPersonAmount})` : `Reservation (₹${grandTotal})`}
              </span>
            </button>

            {/* Direct Courtside Cafe promotion */}
            <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-zinc-300 flex-1">
                <strong>Need refreshments?</strong> Pre-order smoothies, electrolyte slush & cold brew directly to your court.
              </div>
              {onSwitchToCafe && (
                <button
                  type="button"
                  onClick={onSwitchToCafe}
                  className="text-xs font-bold text-amber-400 hover:underline flex-shrink-0"
                >
                  Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-400" />

            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Court Reservation Confirmed!</h3>
              <p className="text-xs text-zinc-300">
                Pass code <strong>#{confirmedBooking.id}</strong> has been generated and added to facility gate schedule.
              </p>
            </div>

            {/* Digital Pass Ticket preview */}
            <div className="mt-6 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">FACILITY PASS</p>
                  <p className="text-sm font-bold text-emerald-400">{confirmedBooking.courtName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-zinc-400">Total Paid</p>
                  <p className="text-base font-black text-white">₹{confirmedBooking.totalAmount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-1">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Date & Time</span>
                  <span className="font-bold text-white">{confirmedBooking.date} • {confirmedBooking.startTime}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Duration & Rate</span>
                  <span className="font-bold text-white">{confirmedBooking.durationHours} hr (@ ₹500/hr)</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Player Name</span>
                  <span className="font-medium text-zinc-300">{confirmedBooking.memberName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Gate Check-In Code</span>
                  <span className="font-mono font-bold text-amber-400">{confirmedBooking.qrCode}</span>
                </div>
              </div>

              {/* Scannable visual simulation */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Show this screen or QR code at reception for instant court lights turn-on</span>
                </div>
                <div className="bg-white p-1 rounded-lg">
                  <div className="w-8 h-8 bg-zinc-950 flex items-center justify-center text-[8px] font-mono text-white font-black">
                    QR
                  </div>
                </div>
              </div>
            </div>

            {/* Next Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              {onSwitchToCafe && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedBooking(null);
                    onSwitchToCafe();
                  }}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Cafe to This Court</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  if (onViewPasses) onViewPasses();
                }}
                className="w-full sm:w-1/2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>View My Passes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Courtside Water & Hydration Butler Modal */}
      <CourtsideWaterModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        courtName={selectedCourt.name}
      />
    </div>
  );
};
