import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CafeItem } from '../../types';
import {
  ShoppingBag,
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  QrCode,
  DollarSign,
  Coffee,
  Sparkles,
  Zap,
  Send,
  RotateCcw,
  Check,
  CreditCard,
  Banknote,
  Receipt,
  Users,
} from 'lucide-react';

const TIME_SLOTS = [
  '04:00', '04:30', '05:00', '05:30',
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30',
];

export const StaffPOSView: React.FC = () => {
  const {
    courts,
    cafeItems,
    bookings,
    cafeOrders,
    createBooking,
    placeCafeOrder,
    isSlotAvailable,
    addToast,
    resetAllSalesToZero,
  } = useApp();

  // Mode: 'take_order' (Cafe POS) vs 'book_court' (Court Booking Desk) vs 'desk_ledger'
  const [activeTab, setActiveTab] = useState<'take_order' | 'book_court' | 'desk_ledger'>('take_order');

  // ===================== CAFE ORDER FORM STATE =====================
  const [orderCategory, setOrderCategory] = useState<string>('All');
  const [orderCart, setOrderCart] = useState<{ item: CafeItem; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderDeliveryType, setOrderDeliveryType] = useState<'court_delivery' | 'counter_pickup' | 'table_dining'>('court_delivery');
  const [tableOrBench, setTableOrBench] = useState('Center Court Bench');
  const [orderPaymentMode, setOrderPaymentMode] = useState<'cash' | 'upi' | 'card'>('cash');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Filter cafe items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(cafeItems.map(i => i.category)));
    return ['All', ...cats];
  }, [cafeItems]);

  const filteredCafeItems = useMemo(() => {
    if (orderCategory === 'All') return cafeItems;
    return cafeItems.filter(i => i.category === orderCategory);
  }, [cafeItems, orderCategory]);

  const addPosItem = (item: CafeItem) => {
    setOrderCart(prev => {
      const idx = prev.findIndex(p => p.item.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removePosItem = (itemId: string) => {
    setOrderCart(prev => prev.filter(p => p.item.id !== itemId));
  };

  const updatePosItemQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removePosItem(itemId);
      return;
    }
    setOrderCart(prev =>
      prev.map(p => (p.item.id === itemId ? { ...p, quantity: qty } : p))
    );
  };

  const orderTotal = orderCart.reduce((sum, p) => sum + p.item.price * p.quantity, 0);

  const handlePlaceStaffOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderCart.length === 0) {
      addToast('Order Empty', 'Please select at least 1 food or drink item.', 'info');
      return;
    }

    // Build Cart items
    const cartItems = orderCart.map((p, idx) => ({
      cartId: `pos-${Date.now()}-${idx}`,
      item: p.item,
      quantity: p.quantity,
    }));

    const newOrder = placeCafeOrder({
      deliveryType: orderDeliveryType,
      targetCourtId: orderDeliveryType === 'court_delivery' ? 'court-1' : undefined,
      targetCourtName: orderDeliveryType === 'court_delivery' ? 'The Center Court' : undefined,
      tableNumber: tableOrBench,
      paymentOption: orderPaymentMode === 'cash' ? 'cash' : 'online',
      notes: `${orderNotes ? orderNotes + ' • ' : ''}Taken by Staff at POS (${orderPaymentMode.toUpperCase()}) - Customer: ${customerName || 'Walk-in Guest'} (${customerPhone || 'Counter'})`,
    });

    setOrderSuccessMsg(`Order #${newOrder.id} placed successfully! Total: ₹${orderTotal} (${orderPaymentMode.toUpperCase()})`);
    setOrderCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');

    setTimeout(() => {
      setOrderSuccessMsg(null);
    }, 5000);
  };

  // ===================== COURT BOOKING FORM STATE =====================
  const [courtDate, setCourtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [courtSlot, setCourtSlot] = useState('16:00');
  const [courtDuration, setCourtDuration] = useState<number>(1); // 0.5, 1, 1.5, 2
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [paddleCount, setPaddleCount] = useState(0);
  const [ballCanCount, setBallCanCount] = useState(0);
  const [courtPaymentMethod, setCourtPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Rates calculation: ₹300 / 30 mins, ₹500 / hr (Save ₹100), ₹750 / 1.5 hr, ₹950 / 2 hr
  const getCourtRate = (duration: number) => {
    if (duration === 0.5) return 300;
    if (duration === 1) return 500;
    if (duration === 1.5) return 750;
    if (duration === 2) return 950;
    return Math.round(duration * 500);
  };

  const courtFee = getCourtRate(courtDuration);
  const addOnsCourtTotal = paddleCount * 50 + ballCanCount * 30;
  const courtBookingGrandTotal = courtFee + addOnsCourtTotal;

  const isSlotFree = isSlotAvailable('court-1', courtDate, courtSlot, courtDuration);

  const handleBookCourtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSlotFree) {
      addToast('Slot Occupied', 'This time slot is already booked on The Center Court. Please select another time.', 'info');
      return;
    }

    const newBooking = createBooking({
      courtId: 'court-1',
      courtName: 'The Center Court (Championship Arena)',
      date: courtDate,
      startTime: courtSlot,
      durationHours: courtDuration,
      hourlyRate: 500,
      courtFee,
      addOns: {
        paddles: paddleCount,
        ballCans: ballCanCount,
        coaching: false,
      },
      addOnsTotal: addOnsCourtTotal,
      totalAmount: courtBookingGrandTotal,
      memberName: playerName.trim() || 'Walk-in Member',
      memberPhone: playerPhone.trim() || '+91 99000 00000',
      memberEmail: 'frontdesk@courtcafe.club',
      notes: `Staff Booking at Desk • Payment: ${courtPaymentMethod.toUpperCase()} (₹${courtBookingGrandTotal})`,
    });

    setBookingSuccessMsg(`Pass #${newBooking.id} created for ${playerName || 'Guest'} at ${courtSlot} (${courtDuration * 60} mins)! Total: ₹${courtBookingGrandTotal}`);
    setPlayerName('');
    setPlayerPhone('');
    setPaddleCount(0);
    setBallCanCount(0);

    setTimeout(() => {
      setBookingSuccessMsg(null);
    }, 6000);
  };

  // Today stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const todayCourtTotal = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const todayCafeTotal = cafeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDeskSales = todayCourtTotal + todayCafeTotal;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-amber-500/30 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-zinc-950 uppercase tracking-wider">
                STAFF POINT OF SALE & RECEPTION
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Desk Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Front Desk POS: Take Orders & Book Courts
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Instant walk-in court reservation (₹500/hr • ₹300/30m) & quick kitchen order placement for members & visitors
            </p>
          </div>

          {/* Quick Metrics & Sales Reset */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-2xl">
              <span className="text-[10px] text-zinc-400 font-bold block">Current Desk Sales</span>
              <span className="text-base font-black text-emerald-400">₹{totalDeskSales.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all bookings and sales records to ₹0 for a fresh start?')) {
                  resetAllSalesToZero();
                }
              }}
              className="px-3 py-2 rounded-2xl bg-zinc-800 hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/40 text-zinc-300 hover:text-red-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Reset all sales to ₹0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sales to ₹0</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-5 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('take_order')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'take_order'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>1. Take Food & Drink Order</span>
            {orderCart.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-950 text-amber-300 text-[10px]">
                {orderCart.reduce((sum, p) => sum + p.quantity, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('book_court')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'book_court'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Book Pickleball Court</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desk_ledger')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'desk_ledger'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>3. Live Desk Log ({bookings.length + cafeOrders.length})</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: TAKE FOOD & DRINK ORDER ======================= */}
      {activeTab === 'take_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Category pills & Item Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Category Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setOrderCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                    orderCategory === cat
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Item Quick Click Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredCafeItems.map(item => {
                const inCartItem = orderCart.find(p => p.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addPosItem(item)}
                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between group active:scale-95 ${
                      inCartItem
                        ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-black text-white group-hover:text-amber-300 transition line-clamp-2">
                          {item.name}
                        </span>
                        {item.mrp && (
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/40 whitespace-nowrap">
                            MRP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <span className="text-sm font-black text-amber-400">
                        ₹{item.price}
                      </span>
                      {inCartItem ? (
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center shadow">
                          {inCartItem.quantity}
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-lg bg-zinc-800 group-hover:bg-amber-500 group-hover:text-zinc-950 text-zinc-300 font-bold text-xs flex items-center justify-center transition">
                          +
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Order Ticket & Checkout */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white">Current Staff Order Ticket</h3>
                </div>
                {orderCart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOrderCart([])}
                    className="text-[11px] text-zinc-400 hover:text-red-400 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Ticket
                  </button>
                )}
              </div>

              {orderSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              {/* Items List */}
              {orderCart.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600" />
                  <p className="text-xs font-medium">Click any item on the left to add to order ticket</p>
                  <p className="text-[11px] text-zinc-600">Maggi, Cold Coffee, Diet Coke, Red Bull, Bisleri, etc.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {orderCart.map(p => (
                    <div
                      key={p.item.id}
                      className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{p.item.name}</div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          ₹{p.item.price} each = ₹{p.item.price * p.quantity}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updatePosItemQty(p.item.id, p.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-black text-white">{p.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updatePosItemQty(p.item.id, p.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removePosItem(p.item.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery and Customer Details */}
              <div className="space-y-3 pt-3 border-t border-zinc-800 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Delivery Destination
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'court_delivery', label: 'Court Bench' },
                      { id: 'table_dining', label: 'Lounge Table' },
                      { id: 'counter_pickup', label: 'Pickup' },
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setOrderDeliveryType(d.id as 'court_delivery' | 'counter_pickup' | 'table_dining')}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition border ${
                          orderDeliveryType === d.id
                            ? 'bg-amber-500 text-zinc-950 border-amber-400'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-0.5">Guest / Member Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul / Walk-in"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-0.5">Phone (Optional)</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="98450 XXXXX"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Payment Collection Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'cash', label: '💵 Cash at Desk', icon: Banknote },
                      { id: 'upi', label: '📱 UPI / QR Scan', icon: QrCode },
                      { id: 'card', label: '💳 Card / POS', icon: CreditCard },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setOrderPaymentMode(m.id as 'cash' | 'upi' | 'card')}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition border flex items-center justify-center gap-1 ${
                          orderPaymentMode === m.id
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total & Submit Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-300">Total Bill:</span>
                  <span className="text-xl font-black text-amber-400">₹{orderTotal}</span>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceStaffOrder}
                  disabled={orderCart.length === 0}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Order to Kitchen KDS (₹{orderTotal})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: BOOK PICKLEBALL GROUND / COURT ======================= */}
      {activeTab === 'book_court' && (
        <div className="max-w-3xl mx-auto rounded-3xl bg-zinc-900 border border-emerald-500/30 p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Staff Court Reservation Desk</h3>
                <p className="text-xs text-emerald-400 font-semibold">
                  The Center Court (Championship Arena) • ₹500 / hr (₹300 / 30m)
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Instant Pass Creation
            </span>
          </div>

          {bookingSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{bookingSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleBookCourtSubmit} className="space-y-4 text-xs">
            {/* Play Date */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Play Date
              </label>
              <input
                type="date"
                value={courtDate}
                onChange={e => setCourtDate(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-semibold"
                required
              />
            </div>

            {/* Match Duration Selection */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Match Duration & Pricing (Official Rates)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { dur: 0.5, label: '30 Mins', price: '₹300' },
                  { dur: 1, label: '1 Hour', price: '₹500', badge: 'Best Value' },
                  { dur: 1.5, label: '1.5 Hours', price: '₹750' },
                  { dur: 2, label: '2 Hours', price: '₹950' },
                ].map(opt => (
                  <button
                    key={opt.dur}
                    type="button"
                    onClick={() => setCourtDuration(opt.dur)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      courtDuration === opt.dur
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 font-black'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">{opt.price}</div>
                    {opt.badge && (
                      <span className="text-[9px] text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded font-bold mt-1 inline-block">
                        {opt.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Select Time Slot
                </label>
                <span className={`text-[11px] font-bold ${isSlotFree ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isSlotFree ? '✓ Slot Available' : '✕ Slot Occupied on Center Court'}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {TIME_SLOTS.map(slot => {
                  const free = isSlotAvailable('court-1', courtDate, slot, courtDuration);
                  const isSelected = courtSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!free}
                      onClick={() => setCourtSlot(slot)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-mono font-bold transition ${
                        isSelected
                          ? 'bg-emerald-500 text-zinc-950 shadow-md ring-2 ring-emerald-400'
                          : free
                          ? 'bg-zinc-950 border border-zinc-800 text-zinc-200 hover:border-emerald-500/50 hover:bg-zinc-850'
                          : 'bg-zinc-900/40 border border-zinc-850 text-zinc-600 line-through cursor-not-allowed opacity-50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Player / Member Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    placeholder="e.g. Vikram Mehta / Ananya Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={playerPhone}
                    onChange={e => setPlayerPhone(e.target.value)}
                    placeholder="98201 XXXXX"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Equipment Add-Ons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Pro Selkirk Carbon Paddles</span>
                  <span className="text-[10px] text-zinc-400">+₹50 per paddle</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaddleCount(Math.max(0, paddleCount - 1))}
                    className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-xs font-black text-white">{paddleCount}</span>
                  <button
                    type="button"
                    onClick={() => setPaddleCount(paddleCount + 1)}
                    className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Dura Fast 40+ Ball Can (3x)</span>
                  <span className="text-[10px] text-zinc-400">+₹30 per tournament can</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBallCanCount(Math.max(0, ballCanCount - 1))}
                    className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-xs font-black text-white">{ballCanCount}</span>
                  <button
                    type="button"
                    onClick={() => setBallCanCount(ballCanCount + 1)}
                    className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Desk Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: '💵 Cash at Counter' },
                  { id: 'upi', label: '📱 UPI / QR Transfer' },
                  { id: 'card', label: '💳 Credit / Debit Card' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCourtPaymentMethod(p.id as 'cash' | 'upi' | 'card')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      courtPaymentMethod === p.id
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary & Submit */}
            <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-zinc-400">Total Court Charge: </span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{courtBookingGrandTotal}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Court fee: ₹{courtFee} ({courtDuration * 60}m) + Rentals: ₹{addOnsCourtTotal}
                </span>
              </div>

              <button
                type="submit"
                disabled={!isSlotFree}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Booking & Issue Entry Pass</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= TAB 3: LIVE DESK LEDGER ======================= */}
      {activeTab === 'desk_ledger' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Court Bookings */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Court Bookings ({bookings.length})</span>
              </h3>
              <span className="text-xs font-black text-emerald-400">₹{todayCourtTotal} total</span>
            </div>

            {bookings.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No active bookings. Sales are at ₹0. Use tab 2 to book a walk-in player.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {bookings.map(b => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{b.memberName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {b.startTime} ({b.durationHours * 60}m)
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {b.date} • {b.memberPhone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">₹{b.totalAmount}</div>
                      <span className="text-[9px] text-zinc-500 uppercase">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Cafe Orders */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Cafe Orders ({cafeOrders.length})</span>
              </h3>
              <span className="text-xs font-black text-amber-400">₹{todayCafeTotal} total</span>
            </div>

            {cafeOrders.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No active cafe orders. Sales are at ₹0. Use tab 1 to take an order.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {cafeOrders.map(o => (
                  <div
                    key={o.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">Order #{o.id}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                          {o.deliveryType === 'court_delivery' ? 'Court Bench' : 'Pickup / Dining'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {o.items.map(i => `${i.quantity}x ${i.item.name}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400">₹{o.totalAmount}</div>
                      <span className="text-[9px] text-zinc-500 uppercase">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
