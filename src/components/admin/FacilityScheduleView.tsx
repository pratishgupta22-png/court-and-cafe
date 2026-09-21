import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, ScheduleBlock } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Plus,
  Ban,
  Phone,
  QrCode,
  Sparkles,
  X,
  Filter,
} from 'lucide-react';

const OPERATING_HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

interface Props {
  onOpenWalkInModal: (courtId?: string, timeSlot?: string) => void;
  onOpenBlockModal: (courtId?: string, timeSlot?: string) => void;
  onOpenEntryQRModal?: (bookingId?: string) => void;
}

export const FacilityScheduleView: React.FC<Props> = ({
  onOpenWalkInModal,
  onOpenBlockModal,
  onOpenEntryQRModal,
}) => {
  const {
    courts,
    bookings,
    scheduleBlocks,
    checkInBooking,
    cancelBooking,
    removeScheduleBlock,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Filter bookings for selected date
  const dateBookings = bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled');
  const dateBlocks = scheduleBlocks.filter(b => b.date === selectedDate);

  // Calculate day stats
  const totalBookedHours = dateBookings.reduce((sum, b) => sum + b.durationHours, 0);
  const totalRevenueToday = dateBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSlotsCapacity = courts.length * OPERATING_HOURS.length;
  const occupancyPercentage = Math.round((totalBookedHours / totalSlotsCapacity) * 100);

  // Helper to find booking starting or ongoing at slot
  const getSlotData = (courtId: string, hourStr: string) => {
    const hour = parseInt(hourStr.split(':')[0], 10);

    // Check bookings
    for (const b of dateBookings) {
      if (b.courtId === courtId) {
        const bStart = parseInt(b.startTime.split(':')[0], 10);
        const bEnd = bStart + b.durationHours;
        if (hour >= bStart && hour < bEnd) {
          const isPrimary = hour === bStart;
          return { type: 'booking' as const, booking: b, isPrimary };
        }
      }
    }

    // Check blocks
    for (const block of dateBlocks) {
      if (block.courtId === courtId) {
        const blockStart = parseInt(block.startTime.split(':')[0], 10);
        const blockEnd = blockStart + block.durationHours;
        if (hour >= blockStart && hour < blockEnd) {
          const isPrimary = hour === blockStart;
          return { type: 'block' as const, block, isPrimary };
        }
      }
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Operations Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Facility Controller</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Facility Schedule & Court Matrix
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage real-time court availability, check-in members, block maintenance hours, and register walk-ins @ ₹500/hr.
          </p>
        </div>

        {/* Action Controls & Date Picker */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Input */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs font-bold"
            />
          </div>

          {onOpenEntryQRModal && (
            <button
              type="button"
              onClick={() => onOpenEntryQRModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Member Entry QR</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenWalkInModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Walk-in Booking (₹500/hr)</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenBlockModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition"
          >
            <Ban className="w-3.5 h-3.5 text-amber-400" />
            <span>Block Slot</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Today's Reservations</span>
          <p className="text-xl font-black text-white mt-1">{dateBookings.length} Bookings</p>
          <span className="text-[10px] text-emerald-400 font-semibold">{totalBookedHours} Court Hours</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Today's Court Revenue</span>
          <p className="text-xl font-black text-emerald-400 mt-1">₹{totalRevenueToday}</p>
          <span className="text-[10px] text-zinc-400">@ ₹500/hr standard rate</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Occupancy Rate</span>
          <p className="text-xl font-black text-amber-400 mt-1">{occupancyPercentage}%</p>
          <span className="text-[10px] text-zinc-400">{courts.length * OPERATING_HOURS.length - totalBookedHours} slots remaining</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold">Active Courts</span>
          <p className="text-xl font-black text-white mt-1">{courts.length} Courts Open</p>
          <span className="text-[10px] text-emerald-400">All lights & climate online</span>
        </div>
      </div>

      {/* Interactive Schedule Grid */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Interactive Schedule Matrix ({selectedDate})</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Available (Click to book)
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Reserved
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> Checked In (Active)
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-600"></span> Maintenance
            </span>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400">
                <th className="p-3.5 font-bold w-24 text-center border-r border-zinc-800">Time</th>
                {courts.map(court => (
                  <th key={court.id} className="p-3.5 font-bold border-r border-zinc-800 last:border-r-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-extrabold">{court.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        ₹500/hr
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block font-normal">{court.surface}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-xs">
              {OPERATING_HOURS.map(hourStr => (
                <tr key={hourStr} className="hover:bg-zinc-850/40 transition">
                  {/* Time label */}
                  <td className="p-3 text-center font-mono font-bold text-zinc-400 bg-zinc-950/40 border-r border-zinc-800">
                    {hourStr}
                  </td>

                  {/* Court slots */}
                  {courts.map(court => {
                    const slotData = getSlotData(court.id, hourStr);

                    if (!slotData) {
                      // Available slot
                      return (
                        <td
                          key={court.id}
                          className="p-2 border-r border-zinc-800 last:border-r-0 relative group"
                        >
                          <div
                            onClick={() => onOpenWalkInModal(court.id, hourStr)}
                            className="h-12 rounded-xl border border-dashed border-zinc-800 group-hover:border-emerald-500/50 group-hover:bg-emerald-950/20 flex items-center justify-between px-3 cursor-pointer transition-all"
                          >
                            <span className="text-[11px] text-zinc-600 group-hover:text-emerald-400 font-medium">
                              Open Slot
                            </span>
                            <span className="text-[10px] font-bold text-zinc-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                              + Book (₹500)
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (slotData.type === 'booking') {
                      const { booking, isPrimary } = slotData;
                      const isCheckedIn = booking.status === 'checked-in';

                      return (
                        <td
                          key={court.id}
                          className="p-2 border-r border-zinc-800 last:border-r-0"
                        >
                          <div
                            onClick={() => setSelectedBookingDetails(booking)}
                            className={`h-12 rounded-xl p-2.5 cursor-pointer shadow-sm transition-all flex items-center justify-between border ${
                              isCheckedIn
                                ? 'bg-gradient-to-r from-emerald-900/70 to-teal-900/70 border-emerald-500/50 text-emerald-100 hover:brightness-110'
                                : 'bg-gradient-to-r from-amber-950/70 to-yellow-950/70 border-amber-500/50 text-amber-100 hover:brightness-110'
                            }`}
                          >
                            <div className="truncate flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs truncate text-white">
                                  {booking.memberName}
                                </span>
                                {isCheckedIn && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-300 font-mono block">
                                #{booking.id} • {booking.startTime} ({booking.durationHours}h)
                              </span>
                            </div>

                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/40 text-amber-300 ml-1">
                              ₹{booking.totalAmount}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (slotData.type === 'block') {
                      const { block } = slotData;
                      return (
                        <td
                          key={court.id}
                          className="p-2 border-r border-zinc-800 last:border-r-0"
                        >
                          <div className="h-12 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 p-2.5 flex items-center justify-between">
                            <div className="truncate">
                              <span className="font-bold text-xs block truncate">{block.reason}</span>
                              <span className="text-[10px] opacity-75">Maintenance Block</span>
                            </div>
                            <button
                              onClick={() => removeScheduleBlock(block.id)}
                              className="text-[10px] font-bold text-red-400 hover:underline ml-1"
                            >
                              Unblock
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return <td key={court.id} />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal (Staff Management) */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  #{selectedBookingDetails.id}
                </span>
                <span className="text-zinc-600">•</span>
                <h3 className="text-base font-bold text-white">Reservation Details</h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Court</span>
                <span className="font-bold text-white">{selectedBookingDetails.courtName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Date & Slot</span>
                <span className="font-bold text-white">
                  {selectedBookingDetails.date} at {selectedBookingDetails.startTime} ({selectedBookingDetails.durationHours} hr)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Member / Guest</span>
                <span className="font-bold text-white">{selectedBookingDetails.memberName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Phone Contact</span>
                <span className="font-bold text-emerald-400">{selectedBookingDetails.memberPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Gate Verification Code</span>
                <span className="font-mono font-bold text-amber-400">{selectedBookingDetails.qrCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Court Rate</span>
                <span className="font-bold text-white">
                  {selectedBookingDetails.durationHours}h @ ₹{selectedBookingDetails.hourlyRate}/hr = ₹{selectedBookingDetails.courtFee}
                </span>
              </div>
              {selectedBookingDetails.addOnsTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Rentals / Coaching</span>
                  <span className="font-bold text-zinc-200">+₹{selectedBookingDetails.addOnsTotal}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 text-sm font-bold">
                <span className="text-white">Total Bill</span>
                <span className="text-emerald-400 font-black text-base">₹{selectedBookingDetails.totalAmount}</span>
              </div>
            </div>

            {/* Management Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {onOpenEntryQRModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenEntryQRModal(selectedBookingDetails.id);
                    setSelectedBookingDetails(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Entry QR Pass</span>
                </button>
              )}

              {selectedBookingDetails.status !== 'checked-in' && selectedBookingDetails.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    checkInBooking(selectedBookingDetails.id);
                    setSelectedBookingDetails(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check In Player & Activate Lights</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  cancelBooking(selectedBookingDetails.id);
                  setSelectedBookingDetails(null);
                }}
                className="py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold text-xs border border-red-800/40 transition"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
