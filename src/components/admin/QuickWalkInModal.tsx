import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, X, Clock, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCourtId?: string;
  defaultSlot?: string;
}

const TIME_SLOTS = [
  '04:00', '04:30', '05:00', '05:30',
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

export const QuickWalkInModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultCourtId,
  defaultSlot,
}) => {
  const { courts, createBooking, isSlotAvailable } = useApp();

  const [courtId, setCourtId] = useState<string>(defaultCourtId || courts[0]?.id || 'court-1');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>(defaultSlot || '14:00');
  const [duration, setDuration] = useState<number>(1);
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [paddleCount, setPaddleCount] = useState<number>(0);
  const [ballCanCount, setBallCanCount] = useState<number>(0);

  if (!isOpen) return null;

  const selectedCourt = courts.find(c => c.id === courtId) || courts[0];
  const hourlyRate = 500; // Guaranteed rate: 500 hour rate
  const getCourtFee = (dur: number) => {
    if (dur === 0.5) return 300;
    if (dur === 1) return 500;
    if (dur === 1.5) return 750;
    if (dur === 2) return 950;
    return Math.round(dur * 500);
  };
  const courtFee = getCourtFee(duration);
  const addOnsTotal = paddleCount * 50 + ballCanCount * 30;
  const totalAmount = courtFee + addOnsTotal;

  const slotAvailable = isSlotAvailable(courtId, date, timeSlot, duration);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotAvailable) {
      alert('Selected slot is not available. Please choose another time slot or court.');
      return;
    }

    createBooking({
      courtId,
      courtName: selectedCourt.name,
      date,
      startTime: timeSlot,
      durationHours: duration,
      hourlyRate,
      courtFee,
      addOns: {
        paddles: paddleCount,
        ballCans: ballCanCount,
        coaching: false,
      },
      addOnsTotal,
      totalAmount,
      memberName: guestName || 'Walk-in Guest',
      memberPhone: guestPhone || '+91 99000 00000',
      memberEmail: 'walkin@courtcafe.club',
      notes: 'Registered by Staff at reception counter',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Walk-in Booking</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">Standard Rate: ₹500 / hr (₹300 / 30m)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Court selection */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Pickleball Court</label>
            <select
              value={courtId}
              onChange={e => setCourtId(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              {courts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (₹500/hr)
                </option>
              ))}
            </select>
          </div>

          {/* Date & Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Start Time Slot</label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Duration: {duration === 0.5 ? '30 Mins' : `${duration} hour${duration > 1 ? 's' : ''}`} (Court Fee: ₹{courtFee})
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { dur: 0.5, label: '30m (₹300)' },
                { dur: 1, label: '1h (₹500)' },
                { dur: 1.5, label: '1.5h (₹750)' },
                { dur: 2, label: '2h (₹950)' },
              ].map(opt => (
                <button
                  key={opt.dur}
                  type="button"
                  onClick={() => setDuration(opt.dur)}
                  className={`py-1.5 px-1 rounded-lg font-bold border text-center transition ${
                    duration === opt.dur
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guest details */}
          <div className="space-y-2 pt-1">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Guest / Member Name</label>
              <input
                type="text"
                placeholder="e.g. Karan Singhania"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98200 11223"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Equipment add-ons quick toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300">Paddles (+₹50):</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaddleCount(Math.max(0, paddleCount - 1))}
                  className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center font-bold text-white"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-white">{paddleCount}</span>
                <button
                  type="button"
                  onClick={() => setPaddleCount(paddleCount + 1)}
                  className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center font-bold text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300">Ball Can (+₹30):</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBallCanCount(Math.max(0, ballCanCount - 1))}
                  className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center font-bold text-white"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-white">{ballCanCount}</span>
                <button
                  type="button"
                  onClick={() => setBallCanCount(ballCanCount + 1)}
                  className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center font-bold text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pricing summary & validation */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block">Total Due:</span>
              <span className="text-lg font-black text-emerald-400">₹{totalAmount}</span>
            </div>
            {!slotAvailable ? (
              <span className="text-red-400 font-bold text-[11px]">Slot Unavailable</span>
            ) : (
              <span className="text-emerald-400 font-bold text-[11px]">Slot Open</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!slotAvailable}
            className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              slotAvailable
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm Walk-in & Collect ₹{totalAmount}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
