import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  Clock,
  Users,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Info,
} from 'lucide-react';
import { playLightSwitch, playPaddleImpact } from '../../utils/audio';

interface Props {
  courtId?: string;
  onBookCourt?: () => void;
  onRequestWater?: () => void;
  compact?: boolean;
}

export const LiveCourtArenaVisualizer: React.FC<Props> = ({
  courtId = 'court-1',
  onBookCourt,
  onRequestWater,
  compact = false,
}) => {
  const {
    courts,
    bookings,
    courtLights,
    toggleCourtLight,
    currentUser,
  } = useApp();

  const selectedCourt = courts.find(c => c.id === courtId) || courts[0];
  const isLightsOn = courtLights[courtId] ?? true;

  // Find active booking right now or closest upcoming booking
  const activeBooking = bookings.find(
    b => b.courtId === courtId && (b.status === 'confirmed' || b.status === 'checked-in')
  );

  // Live countdown timer state (minutes and seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1420); // ~23 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleToggleLights = () => {
    playLightSwitch();
    toggleCourtLight(courtId);
  };

  const handlePaddlePop = () => {
    playPaddleImpact();
  };

  return (
    <div className="rounded-3xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-2xl">
      {/* Visualizer Top Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLightsOn ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLightsOn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                {selectedCourt?.name || 'Center Court Arena'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                REGULATION 44′ × 20′
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Indoor Pro-Cushion 8-Layer Championship Acrylic • Anti-Glare Optical Floor
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleLights}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 ${
              isLightsOn
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/15'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isLightsOn ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
            <span>1,000 Lux Floodlights: {isLightsOn ? 'ON' : 'STANDBY'}</span>
          </button>

          {onRequestWater && (
            <button
              type="button"
              onClick={onRequestWater}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center gap-1 active:scale-95"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chilled Water (₹20)</span>
            </button>
          )}
        </div>
      </div>

      {/* Arena Stage Canvas */}
      <div className="relative p-4 sm:p-8 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
        {/* Dynamic Stadium Floodlight Overhead Glow */}
        {isLightsOn ? (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 via-emerald-500/5 to-transparent pointer-events-none transition-opacity duration-700" />
        ) : (
          <div className="absolute inset-0 bg-black/60 backdrop-brightness-50 pointer-events-none transition-opacity duration-700" />
        )}

        {/* Floodlight Beam Corners */}
        {isLightsOn && (
          <>
            <div className="absolute top-0 left-10 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-10 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Live Match HUD Overlay */}
        <div className="w-full max-w-xl mb-4 flex items-center justify-between px-3 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-zinc-200">
              {activeBooking ? `Match: ${activeBooking.memberName}` : 'Session: Open Dink & Play'}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Court 1 Bay</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsRemaining)} left</span>
            </div>
            <button
              type="button"
              onClick={handlePaddlePop}
              title="Test Acoustic Honeycomb Paddle Sound"
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Scaled Pickleball Court Graphic (44ft x 20ft proportion) */}
        <div className="relative w-full max-w-xl aspect-[2.2/1] rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-2.5 sm:p-3.5 shadow-2xl border-2 border-zinc-700/80 select-none overflow-hidden transition-all duration-500">
          {/* Out of bounds border area / run-off zone */}
          <div className="relative w-full h-full rounded-xl bg-emerald-700/90 border-2 border-white flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Left Court (Side A) */}
            <div className="absolute inset-y-0 left-0 w-1/2 flex border-r-2 border-white">
              {/* Service Court Side A (Top & Bottom divided by center service line) */}
              <div className="w-[68%] h-full relative border-r-2 border-white flex flex-col">
                <div className="h-1/2 border-b-2 border-white relative flex items-center justify-center">
                  <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                    Left Service
                  </span>
                  {/* Player A1 Indicator */}
                  <div className="absolute top-2 left-3 flex items-center gap-1 bg-zinc-950/70 backdrop-blur-sm px-2 py-0.5 rounded-full border border-emerald-400/40 text-[9px] text-white font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Server</span>
                  </div>
                </div>
                <div className="h-1/2 relative flex items-center justify-center">
                  <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                    Right Service
                  </span>
                </div>
              </div>

              {/* Kitchen / Non-Volley Zone Side A (7ft) */}
              <div className="w-[32%] h-full bg-teal-800/85 relative flex items-center justify-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wider rotate-90 sm:rotate-0 text-center uppercase">
                  7′ Kitchen
                </span>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-zinc-950/70 px-1.5 py-0.5 rounded-full border border-amber-400/40 text-[8px] text-amber-300 font-bold">
                  <span>Dink Zone</span>
                </div>
              </div>
            </div>

            {/* Center Net System */}
            <div className="absolute inset-y-0 left-1/2 -tranzinc-x-1/2 w-1.5 sm:w-2 bg-zinc-950 border-x border-zinc-200 z-20 flex flex-col justify-between shadow-lg">
              {/* Top Net Post (36 in) */}
              <div className="w-3 h-3 -ml-0.5 sm:-ml-0.5 rounded-full bg-zinc-200 border-2 border-zinc-950 shadow" />
              {/* Center Net Strap (34 in) */}
              <div className="w-full h-4 bg-white/90 my-auto" />
              {/* Bottom Net Post (36 in) */}
              <div className="w-3 h-3 -ml-0.5 sm:-ml-0.5 rounded-full bg-zinc-200 border-2 border-zinc-950 shadow" />
            </div>

            {/* Right Court (Side B) */}
            <div className="absolute inset-y-0 right-0 w-1/2 flex flex-row-reverse border-l-2 border-white">
              {/* Service Court Side B */}
              <div className="w-[68%] h-full relative border-l-2 border-white flex flex-col">
                <div className="h-1/2 border-b-2 border-white relative flex items-center justify-center">
                  <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                    Right Service
                  </span>
                  {/* Player B1 Indicator */}
                  <div className="absolute top-2 right-3 flex items-center gap-1 bg-zinc-950/70 backdrop-blur-sm px-2 py-0.5 rounded-full border border-teal-400/40 text-[9px] text-white font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span>Receiver</span>
                  </div>
                </div>
                <div className="h-1/2 relative flex items-center justify-center">
                  <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">
                    Left Service
                  </span>
                </div>
              </div>

              {/* Kitchen / Non-Volley Zone Side B (7ft) */}
              <div className="w-[32%] h-full bg-teal-800/85 relative flex items-center justify-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wider rotate-90 sm:rotate-0 text-center uppercase">
                  7′ Kitchen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental & Surface Telemetry Bar */}
        <div className="w-full max-w-xl mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Indoor Temp</div>
              <div className="font-bold text-white">27.5°C (AC)</div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Humidity</div>
              <div className="font-bold text-white">52% Optimal</div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
            <Wind className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Court Traction</div>
              <div className="font-bold text-white">100% Dry Grip</div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Surface Rating</div>
              <div className="font-bold text-white">Tournament Grade</div>
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        {onBookCourt && (
          <div className="w-full max-w-xl mt-4 flex items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
            <div className="text-xs text-zinc-400">
              Next available: <span className="text-emerald-400 font-bold">10:00 AM Today</span> (₹500/hr)
            </div>
            <button
              type="button"
              onClick={onBookCourt}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Reserve Court Slot</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
