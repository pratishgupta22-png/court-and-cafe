import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowUpRight,
  Check,
  AlertTriangle,
  Users,
  Share2,
} from 'lucide-react';
import { SplitBillModal } from '../payment/SplitBillModal';

interface Props {
  onBookCourt?: () => void;
  onOrderCafe?: () => void;
}

export const MyPassesView: React.FC<Props> = ({ onBookCourt, onOrderCafe }) => {
  const { bookings, cancelBooking, cafeOrders, currentUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'passes' | 'orders'>('passes');
  const [splitBillConfig, setSplitBillConfig] = useState<{ amount: number; description: string } | null>(null);

  // Filter bookings for current member
  const myBookings = bookings.filter(b =>
    currentUser
      ? b.memberName.toLowerCase() === currentUser.name.toLowerCase() || b.memberEmail === currentUser.email
      : true
  );

  // If no direct name match, show all current demo user's bookings or fallback to active bookings
  const displayBookings = myBookings.length > 0 ? myBookings : bookings.slice(0, 3);

  // Filter cafe orders
  const myOrders = cafeOrders;

  return (
    <div className="space-y-6 pb-20">
      {/* Header section with SubTabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Member Passes & Live Orders</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Digital check-in QR codes for courts and real-time kitchen tracking for cafe refreshments.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('passes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'passes'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Court Passes ({displayBookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'orders'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cafe Orders ({myOrders.length})
          </button>
        </div>
      </div>

      {/* SubTab 1: Court Passes */}
      {activeSubTab === 'passes' && (
        <div className="space-y-4">
          {displayBookings.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-zinc-800 space-y-4">
              <QrCode className="w-12 h-12 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No active court reservations</h3>
                <p className="text-xs text-zinc-400">Book any available court for ₹500/hour to receive your digital pass.</p>
              </div>
              {onBookCourt && (
                <button
                  onClick={onBookCourt}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
                >
                  Reserve a Court Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayBookings.map(booking => {
                const isConfirmed = booking.status === 'confirmed';
                const isCheckedIn = booking.status === 'checked-in';
                const isCancelled = booking.status === 'cancelled';

                return (
                  <div
                    key={booking.id}
                    className={`rounded-2xl border bg-zinc-900/90 overflow-hidden transition-all shadow-md ${
                      isCheckedIn
                        ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : isCancelled
                        ? 'border-zinc-800 opacity-60'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top status stripe */}
                    <div className="px-5 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">#{booking.id}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400">{booking.date}</span>
                      </div>
                      <div>
                        {isCheckedIn && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Checked-In (Playing)
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                        {booking.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pass Content */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-extrabold text-white text-base">{booking.courtName}</h4>
                          <p className="text-xs text-zinc-400 mt-0.5">Player: {booking.memberName}</p>
                        </div>
                        {/* Scannable Pass Simulator */}
                        <div className="p-2 rounded-xl bg-white border border-zinc-200 flex flex-col items-center justify-center flex-shrink-0">
                          <QrCode className="w-10 h-10 text-zinc-950" />
                          <span className="text-[8px] font-mono text-zinc-900 font-bold mt-0.5">PASS-GATE</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-800 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Time Slot</span>
                          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {booking.startTime} ({booking.durationHours} hr)
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Total Rate Paid</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">
                            ₹{booking.totalAmount} (₹500/hr)
                          </span>
                        </div>
                      </div>

                      {/* Add-ons summary if any */}
                      {(booking.addOns.paddles > 0 || booking.addOns.ballCans > 0 || booking.addOns.coaching) && (
                        <div className="text-[11px] text-zinc-400 flex flex-wrap gap-2">
                          <span className="text-zinc-500">Rentals:</span>
                          {booking.addOns.paddles > 0 && <span>{booking.addOns.paddles}x Paddles</span>}
                          {booking.addOns.ballCans > 0 && <span>{booking.addOns.ballCans}x Balls</span>}
                          {booking.addOns.coaching && <span>1x Pro Coach</span>}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                        <button
                          type="button"
                          onClick={() => setSplitBillConfig({
                            amount: booking.totalAmount,
                            description: `${booking.courtName} Court Fee (${booking.startTime})`,
                          })}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Split Bill (UPI QR)</span>
                        </button>

                        <div className="flex items-center gap-3 ml-auto">
                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => cancelBooking(booking.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-semibold hover:underline"
                            >
                              Cancel Reservation
                            </button>
                          )}
                          {onOrderCafe && !isCancelled && (
                            <button
                              type="button"
                              onClick={onOrderCafe}
                              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Order to Court</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Cafe Orders */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-zinc-800 space-y-4">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No active cafe orders</h3>
                <p className="text-xs text-zinc-400">Order cold smoothies, artisan toasts, or hydration flasks from the cafe.</p>
              </div>
              {onOrderCafe && (
                <button
                  onClick={onOrderCafe}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
                >
                  Browse Cafe Menu
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map(order => {
                const isDelivered = order.status === 'delivered';
                const isReady = order.status === 'ready';
                const isPreparing = order.status === 'preparing';
                const isReceived = order.status === 'received';

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4 shadow-md"
                  >
                    <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">#{order.id}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-xs font-bold text-white">
                            {order.deliveryType === 'court_delivery'
                              ? `Court Bench: ${order.targetCourtName || 'Center Court'}`
                              : order.deliveryType === 'table_dining'
                              ? `Dine-In: ${order.tableNumber || 'Table'}`
                              : order.deliveryType === 'takeaway'
                              ? `Takeaway (${order.estimatedArrival || 'En Route'})`
                              : 'Cafe Counter Pickup'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>For {order.customerName}</span>
                          <span>•</span>
                          <span className={order.paymentOption === 'cash' || order.payment?.method === 'desk' ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                            {order.paymentOption === 'cash' || order.payment?.method === 'desk' ? '💵 Pay Cash' : '💳 Paid Online'}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-amber-400">₹{order.totalAmount}</span>
                    </div>

                    {/* Status Progress Pipeline */}
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={isReceived ? 'text-amber-400 font-bold' : 'text-zinc-500'}>Received</span>
                        <span className={isPreparing ? 'text-amber-400 font-bold' : 'text-zinc-500'}>Preparing</span>
                        <span className={isReady ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>Ready / En Route</span>
                        <span className={isDelivered ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>Delivered</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isDelivered
                              ? 'w-full bg-emerald-500'
                              : isReady
                              ? 'w-3/4 bg-emerald-400'
                              : isPreparing
                              ? 'w-1/2 bg-amber-400'
                              : 'w-1/4 bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Items breakdown */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-zinc-300">
                            {item.quantity}x {item.item.name}
                          </span>
                          <span className="text-zinc-400">₹{item.item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-300/80 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Split Bill Modal */}
      {splitBillConfig && (
        <SplitBillModal
          isOpen={!!splitBillConfig}
          onClose={() => setSplitBillConfig(null)}
          totalAmount={splitBillConfig.amount}
          itemDescription={splitBillConfig.description}
        />
      )}
    </div>
  );
};
