import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CafeOrder } from '../../types';
import {
  ChefHat,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  BellRing,
  Coffee,
  Check,
} from 'lucide-react';

export const KitchenDisplayView: React.FC = () => {
  const { cafeOrders, updateCafeOrderStatus, simulateIncomingOrder } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('active');

  // Filter orders
  const filteredOrders = cafeOrders.filter(order => {
    if (filterStatus === 'active') return order.status !== 'delivered';
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const activeCount = cafeOrders.filter(o => o.status !== 'delivered').length;
  const preparingCount = cafeOrders.filter(o => o.status === 'preparing').length;
  const readyCount = cafeOrders.filter(o => o.status === 'ready').length;

  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Live Cafe Kitchen Display System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Courtside Refreshment Orders
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Staff dashboard for barista & kitchen. View incoming refreshments, court delivery locations, and order status.
          </p>
        </div>

        {/* Quick Simulator and Audio Alert */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={simulateIncomingOrder}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Cafe Order</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Live Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'active'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Orders ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('preparing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'preparing'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Preparing ({preparingCount})
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'ready'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ready for Court ({readyCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === 'all'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All History ({cafeOrders.length})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 space-y-3">
          <ChefHat className="w-14 h-14 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No orders matching filter</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            When members order from their court pass or mobile app, tickets will automatically appear here with a chime alert.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const minutesAgo = getElapsedMinutes(order.createdAt);
            const isCourtDelivery = order.deliveryType === 'court_delivery';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border bg-zinc-900/95 overflow-hidden shadow-lg flex flex-col justify-between transition-all ${
                  order.status === 'received'
                    ? 'border-amber-500/80 ring-2 ring-amber-500/30'
                    : order.status === 'preparing'
                    ? 'border-amber-400/50'
                    : order.status === 'ready'
                    ? 'border-emerald-500/80 ring-2 ring-emerald-500/30'
                    : 'border-zinc-800 opacity-60'
                }`}
              >
                <div>
                  {/* Destination Banner */}
                  <div
                    className={`px-4 py-3 font-bold text-xs flex items-center justify-between ${
                      order.deliveryType === 'court_delivery'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950'
                        : order.deliveryType === 'table_dining'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950'
                        : order.deliveryType === 'takeaway'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950'
                        : 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {order.deliveryType === 'court_delivery'
                          ? `COURT DELIVERY: ${order.targetCourtName || 'CENTER COURT'}`
                          : order.deliveryType === 'table_dining'
                          ? `DINE-IN: ${order.tableNumber || 'TABLE'}`
                          : order.deliveryType === 'takeaway'
                          ? `TAKEAWAY (${order.estimatedArrival || 'EN ROUTE'})`
                          : 'BAR COUNTER PICKUP'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-black">
                      #{order.id}
                    </span>
                  </div>

                  {/* Ticket Meta */}
                  <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className={minutesAgo > 10 ? 'text-red-400 font-bold' : 'text-zinc-300'}>
                        {minutesAgo}m ago
                      </span>
                      {order.isVerifiedPresence && (
                        <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{order.customerName}</span>
                      <span className="text-zinc-600">•</span>
                      <span className={`font-black px-1.5 py-0.5 rounded text-[11px] ${
                        order.paymentOption === 'cash' || order.payment?.method === 'desk'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {order.paymentOption === 'cash' || order.payment?.method === 'desk' ? 'CASH: ' : 'PAID: '}₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Items Ticket Body */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="pb-2 border-b border-zinc-800/80 last:border-b-0 last:pb-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-sm text-white">
                              {item.quantity}x {item.item.name}
                            </span>
                            <span className="text-xs font-semibold text-zinc-400">
                              ₹{item.item.price * item.quantity}
                            </span>
                          </div>

                          {/* Customization notes */}
                          {item.selectedOptions && (
                            <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                              {item.selectedOptions.milk && (
                                <span className="bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded font-medium">
                                  {item.selectedOptions.milk}
                                </span>
                              )}
                              {item.selectedOptions.proteinBoost && (
                                <span className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                  {item.selectedOptions.proteinBoost}
                                </span>
                              )}
                              {item.selectedOptions.iceLevel && (
                                <span className="bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded font-medium">
                                  {item.selectedOptions.iceLevel}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300">
                        <strong>Member Note:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Status Progression Actions */}
                <div className="p-4 pt-0">
                  {order.status === 'received' && (
                    <button
                      type="button"
                      onClick={() => updateCafeOrderStatus(order.id, 'preparing')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <Coffee className="w-4 h-4" />
                      <span>Start Preparing Order</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      type="button"
                      onClick={() => updateCafeOrderStatus(order.id, 'ready')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>{isCourtDelivery ? 'Dispatch to Court' : 'Mark Ready at Counter'}</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => updateCafeOrderStatus(order.id, 'delivered')}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-black text-xs border border-emerald-500/40 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Delivered to Member</span>
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <div className="text-center py-2 text-xs font-bold text-zinc-400 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      <span>Order Completed & Delivered</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
