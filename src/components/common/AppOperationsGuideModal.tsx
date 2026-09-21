import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  Zap,
  Coffee,
  Calendar,
  Clock,
  ChefHat,
  TrendingUp,
  Cpu,
  CheckCircle2,
  X,
  Radio,
  QrCode,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToStaffTab?: (tab: 'schedule' | 'kitchen' | 'analytics' | 'equipment') => void;
  onSwitchToMemberTab?: (tab: 'booking' | 'cafe' | 'passes' | 'community') => void;
}

export const AppOperationsGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSwitchToStaffTab,
  onSwitchToMemberTab,
}) => {
  const { setRole, role } = useApp();
  const [activeStation, setActiveStation] = useState<'overview' | 'customer' | 'frontdesk' | 'kitchen' | 'manager'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-lg">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">How Customer & Staff are Managed</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Dual-Surface Architecture
                </span>
              </div>
              <p className="text-xs text-zinc-400">Complete Club Operating Workflow & Persona Separation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Station Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-zinc-950 border-b border-zinc-850 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveStation('overview')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeStation === 'overview' ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Unified Architecture
          </button>
          <button
            onClick={() => setActiveStation('customer')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeStation === 'customer' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Member Experience</span>
          </button>
          <button
            onClick={() => setActiveStation('frontdesk')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeStation === 'frontdesk' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. Front Desk Station</span>
          </button>
          <button
            onClick={() => setActiveStation('kitchen')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeStation === 'kitchen' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>2. Cafe Kitchen (KDS)</span>
          </button>
          <button
            onClick={() => setActiveStation('manager')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeStation === 'manager' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3. Facility Manager</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm">
          
          {activeStation === 'overview' && (
            <div className="space-y-6">
              {/* Architecture Blueprint Card */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Unified Single-App Solution for Play Store & App Store
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Reactive Bridge
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                  Instead of forcing club members and staff to download two fragmented apps from app stores, 
                  <strong> The Kitchen</strong> utilizes a <strong>Role-Secured Dual Persona Architecture</strong>. 
                  A shared reactive state layer synchronizes court availability and kitchen tickets in sub-seconds.
                </p>

                {/* Visual Flow diagram */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 font-black mx-auto flex items-center justify-center text-xs mb-2">
                      <Users className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-xs">Customer (Member)</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Reserve courts @ ₹500/hr, split bills with doubles partners, order smoothies to court bench, and flash QR passes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-col justify-center items-center">
                    <Radio className="w-6 h-6 text-amber-400 animate-pulse mb-1" />
                    <span className="text-xs font-extrabold text-white">Central State Bridge</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Real-time Bookings & Orders</span>
                    <span className="text-[10px] text-amber-400 font-mono mt-1">₹500/hr Rate Guard</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 font-black mx-auto flex items-center justify-center text-xs mb-2">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-xs">Staff Admin Hub</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Front Desk check-ins, Kitchen KDS ticket display with audio bells, court floodlight switches, and revenue analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Strict ₹500 / Hour Pricing Rule
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Hardcoded pricing guarantees members always pay exactly ₹500 per court hour (₹1,000 for 2 hrs), with transparent add-on rental fees for pro paddles (₹50) and balls (₹30).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Audio Synthesizer Alert System
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Web Audio synthesis produces an acoustic dual-tone bell for cafe orders and a pleasant triple chime on court check-ins without loading heavy audio files or buffering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStation === 'customer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <div>
                  <h3 className="font-extrabold text-white text-base">Customer & Member App Workflow</h3>
                  <p className="text-xs text-emerald-400/90">Self-service reservation, ordering, and community matching</p>
                </div>
                <button
                  onClick={() => {
                    setRole('member');
                    onClose();
                    onSwitchToMemberTab?.('booking');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <span>Launch Member View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">1</div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Court Booking & Partner Split</h5>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Select date and time slot across 4 courts at ₹500/hr. Choose optional Pro paddles and balls. Split costs with doubles partners (e.g. ₹125/player).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs">2</div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Courtside Refreshment Ordering</h5>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Browse smoothies, electrolytes, nitro cold brews, and protein snacks. Designate your target court bench for direct in-seat delivery during gameplay.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-teal-400 font-bold text-xs">3</div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Digital Pass & Gate Entry QR</h5>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Upon confirmation, an encrypted QR pass is generated for quick gate turnstile scanning. Also tracks cafe delivery progress in real time.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs">4</div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Open Play Mixer & Match Finder</h5>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Pickleball players can browse open doubles mixers filtered by DUPR skill level, RSVP with 1 click, or recruit a 4th player.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStation === 'frontdesk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-950/30 border border-emerald-500/30">
                <div>
                  <h3 className="font-extrabold text-white text-base">Station 1: Front Desk & Concierge</h3>
                  <p className="text-xs text-teal-400/90">Check-in scanning, walk-in reservations, and equipment rentals</p>
                </div>
                <button
                  onClick={() => {
                    setRole('staff');
                    onClose();
                    onSwitchToStaffTab?.('schedule');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <span>Open Schedule View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    Instant Gate Check-in
                  </span>
                  <p className="text-xs text-zinc-400">
                    When players arrive, receptionist taps 1-click Check-in or scans the member QR. Instantly updates the matrix from amber to emerald green.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Quick Walk-in Booking
                  </span>
                  <p className="text-xs text-zinc-400">
                    For walk-in players at the counter, staff creates reservations on the spot @ ₹500/hr, collects payment, and hands over paddle rentals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStation === 'kitchen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                <div>
                  <h3 className="font-extrabold text-white text-base">Station 2: Cafe Kitchen Display (KDS)</h3>
                  <p className="text-xs text-amber-400/90">Order ticket pipeline, acoustic bell alerts, and runner dispatch</p>
                </div>
                <button
                  onClick={() => {
                    setRole('staff');
                    onClose();
                    onSwitchToStaffTab?.('kitchen');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <span>Open KDS Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  Order Lifecycle Progression:
                </h5>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-300">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-900/60 text-amber-300 border border-amber-700/50">1. Received (Bell Rings)</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-900/60 text-amber-400 border border-amber-700/50">2. Preparing (Blender/Barista)</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">3. Ready (Courtside Runner Dispatched)</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400">4. Delivered</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  The chef marks orders as they move through prep. When designated for courtside delivery, runner takes the drinks straight to the player bench.
                </p>
              </div>
            </div>
          )}

          {activeStation === 'manager' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                <div>
                  <h3 className="font-extrabold text-white text-base">Station 3: Facility Operations & Analytics</h3>
                  <p className="text-xs text-amber-300/90">Revenue reporting, floodlight power toggles, and court maintenance</p>
                </div>
                <button
                  onClick={() => {
                    setRole('staff');
                    onClose();
                    onSwitchToStaffTab?.('analytics');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <span>Open Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Revenue Breakdown
                  </span>
                  <p className="text-xs text-zinc-400">
                    Live tracking of court booking fees (₹500/hr baseline), cafe smoothie/food revenue, and paddle/ball rental margins.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    Smart Court Floodlights
                  </span>
                  <p className="text-xs text-zinc-400">
                    Managers can toggle 1000-lux court lighting per court with 1 tap, reducing facility electricity bills during idle hours.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Currently Active Mode:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold ${
              role === 'member' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {role === 'member' ? 'Customer (Member)' : 'Staff Admin'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRole(role === 'member' ? 'staff' : 'member');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition"
            >
              Switch to {role === 'member' ? 'Staff Admin' : 'Member'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold transition shadow-md"
            >
              Got it, Explore App
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
