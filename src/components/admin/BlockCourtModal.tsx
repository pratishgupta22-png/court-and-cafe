import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ban, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCourtId?: string;
  defaultSlot?: string;
}

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const BlockCourtModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultCourtId,
  defaultSlot,
}) => {
  const { courts, addScheduleBlock } = useApp();

  const [courtId, setCourtId] = useState<string>(defaultCourtId || courts[0]?.id || 'court-1');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>(defaultSlot || '12:00');
  const [duration, setDuration] = useState<number>(1);
  const [reason, setReason] = useState<string>('Surface Maintenance & Net Check');
  const [blockType, setBlockType] = useState<'maintenance' | 'tournament' | 'clinic'>('maintenance');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addScheduleBlock({
      courtId,
      date,
      startTime: timeSlot,
      durationHours: duration,
      reason,
      type: blockType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Block Court Schedule</h3>
              <p className="text-[11px] text-zinc-400">Prevent bookings for maintenance or clinics</p>
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
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Pickleball Court</label>
            <select
              value={courtId}
              onChange={e => setCourtId(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {courts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Start Time Slot</label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Block Duration: {duration} hour{duration > 1 ? 's' : ''}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(hrs => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setDuration(hrs)}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                    duration === hrs
                      ? 'bg-amber-500 text-zinc-950 border-amber-400'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {hrs} hr
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Reason / Notes</label>
            <input
              type="text"
              placeholder="e.g. Resurfacing, Net adjustment, Private clinic"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">Block Classification</label>
            <div className="grid grid-cols-3 gap-2">
              {(['maintenance', 'tournament', 'clinic'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBlockType(type)}
                  className={`py-2 rounded-xl font-bold uppercase text-[10px] border transition ${
                    blockType === type
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply Court Block</span>
          </button>
        </form>
      </div>
    </div>
  );
};
