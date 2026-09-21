import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplets,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  CupSoda,
  Shirt,
  Flame,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courtName?: string;
}

export const CourtsideWaterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  courtName = 'The Center Court',
}) => {
  const { requestWater, currentUser } = useApp();

  const [requestType, setRequestType] = useState<'chilled_water' | 'electrolyte_refill' | 'court_towel'>('chilled_water');
  const [quantity, setQuantity] = useState<number>(2);
  const [benchNumber, setBenchNumber] = useState('Court Bench 1');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const benchNote = notes.trim() ? `${benchNumber} • ${notes.trim()}` : benchNumber;
    requestWater(
      'court-1',
      courtName,
      requestType,
      quantity,
      benchNote
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Courtside Hydration Butler</h3>
            <p className="text-xs text-zinc-400">Complimentary service for players on court</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Hydration Dispatched to Staff!</h4>
            <p className="text-xs text-zinc-300">
              Staff has received your message in the Operations console. They will bring your order to {benchNumber} shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Select Service
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('chilled_water')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    requestType === 'chilled_water'
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Droplets className="w-4 h-4" />
                  <span>Mineral Water</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('electrolyte_refill')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    requestType === 'electrolyte_refill'
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <CupSoda className="w-4 h-4" />
                  <span>Electrolytes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('court_towel')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    requestType === 'court_towel'
                      ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Shirt className="w-4 h-4" />
                  <span>Fresh Towels</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Quantity
                </label>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-xl p-1.5 justify-between">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(6, quantity + 1))}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Court Bench Location
                </label>
                <select
                  value={benchNumber}
                  onChange={e => setBenchNumber(e.target.value)}
                  className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Court Bench 1 (Near Kitchen)">Court Bench 1 (Near Kitchen)</option>
                  <option value="Court Bench 2 (Baseline Player Side)">Court Bench 2 (Baseline Player Side)</option>
                  <option value="Spectator Lounge Deck">Spectator Lounge Deck</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Special Request / Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Extra ice cubes, lemon wedge..."
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 space-y-1">
              <div>⚡ Free of charge • Instantly notifies staff console on reception & kitchen screens.</div>
              <div className="text-zinc-400 text-[10px]">
                💡 Need sealed packaged bottles? Chilled 1L Mineral Water Bottles are available in the Kitchen for ₹20 each.
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-xs shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Droplets className="w-4 h-4" />
              <span>Send Request to Staff</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
