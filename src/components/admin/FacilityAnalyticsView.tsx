import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Coffee,
  Activity,
  Award,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const FacilityAnalyticsView: React.FC = () => {
  const { bookings, cafeOrders, courts } = useApp();

  // Court booking calculations
  const totalCourtRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.courtFee, 0);

  const totalAddOnsRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.addOnsTotal, 0);

  // Cafe revenue calculations
  const totalCafeRevenue = cafeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalGrossRevenue = totalCourtRevenue + totalAddOnsRevenue + totalCafeRevenue;

  const totalBookedHours = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.durationHours, 0);

  // Top court calculation
  const courtUsageMap: { [key: string]: number } = {};
  bookings.filter(b => b.status !== 'cancelled').forEach(b => {
    courtUsageMap[b.courtName] = (courtUsageMap[b.courtName] || 0) + b.durationHours;
  });
  const topCourt = Object.entries(courtUsageMap).sort((a, b) => b[1] - a[1])[0] || ['Court 1', 0];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Facility Revenue & Utilization</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          Financials & Facility Performance
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Real-time analytics combining court bookings @ ₹500/hr, cafe refreshment sales, and rental add-ons.
        </p>
      </div>

      {/* Main Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Total */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-xs font-bold text-emerald-400 uppercase">Total Facility Gross</span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">₹{totalGrossRevenue}</p>
          <p className="text-[11px] text-emerald-400/90 mt-1 font-medium">All courts & cafe combined</p>
          <div className="absolute top-4 right-4 text-emerald-500/20">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>

        {/* Court Bookings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-bold text-zinc-400 uppercase">Court Reservations</span>
          <p className="text-2xl font-black text-white mt-2">₹{totalCourtRevenue}</p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {totalBookedHours} hrs played @ <strong>₹500/hr</strong>
          </p>
        </div>

        {/* Cafe Revenue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-bold text-amber-400 uppercase">Cafe & Refreshments</span>
          <p className="text-2xl font-black text-white mt-2">₹{totalCafeRevenue}</p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {cafeOrders.length} orders served courtside
          </p>
        </div>

        {/* Equipment & Coaching */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-bold text-emerald-400 uppercase">Rentals & Add-ons</span>
          <p className="text-2xl font-black text-white mt-2">₹{totalAddOnsRevenue}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Paddles, balls, pro coaches</p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Court Utilization */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Court Utilization Breakdown
            </h3>
            <span className="text-xs font-bold text-emerald-400">Fixed Rate: ₹500/hr</span>
          </div>

          <div className="space-y-3 pt-2">
            {courts.map(court => {
              const courtHours = bookings
                .filter(b => b.courtId === court.id && b.status !== 'cancelled')
                .reduce((sum, b) => sum + b.durationHours, 0);
              const maxDayHours = 15; // 7am to 10pm
              const pct = Math.min(100, Math.round((courtHours / maxDayHours) * 100));

              return (
                <div key={court.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-200">{court.name}</span>
                    <span className="text-zinc-400 font-mono">
                      {courtHours} hrs ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Busiest Court: <strong className="text-white">{topCourt[0]}</strong></span>
            <span>Standard Hourly: <strong className="text-emerald-400">₹500</strong></span>
          </div>
        </div>

        {/* Right Column: Cafe Performance & Highlights */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              Courtside Cafe Highlights
            </h3>
            <span className="text-xs font-bold text-amber-400">In-Club Kitchen</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
              <span className="text-[11px] text-zinc-400">Avg Ticket Value</span>
              <p className="text-lg font-black text-white mt-1">
                ₹{cafeOrders.length > 0 ? Math.round(totalCafeRevenue / cafeOrders.length) : 0}
              </p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
              <span className="text-[11px] text-zinc-400">Court Delivery %</span>
              <p className="text-lg font-black text-emerald-400 mt-1">
                {cafeOrders.length > 0
                  ? Math.round(
                      (cafeOrders.filter(o => o.deliveryType === 'court_delivery').length /
                        cafeOrders.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Quick Member Activity Feed */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 block">Recent Activity Log:</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {bookings.slice(0, 4).map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between bg-zinc-950/40 p-2 rounded-lg text-zinc-300"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{b.memberName} reserved {b.courtName}</span>
                  </div>
                  <span className="font-mono text-emerald-400 text-[11px] ml-2 flex-shrink-0">
                    ₹{b.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
