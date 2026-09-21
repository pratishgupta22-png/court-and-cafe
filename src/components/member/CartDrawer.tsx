import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  UtensilsCrossed,
  PackageCheck,
  Banknote,
  CreditCard,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface Props {
  onOrderPlaced?: () => void;
}

export const CartDrawer: React.FC<Props> = ({ onOrderPlaced }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    placeCafeOrder,
    courts,
    bookings,
    currentUser,
    openPaymentModal,
  } = useApp();

  // Delivery type selection: court, table, takeaway, counter
  const [deliveryType, setDeliveryType] = useState<'court_delivery' | 'table_dining' | 'takeaway' | 'counter_pickup'>('court_delivery');
  
  // Table dining state
  const [tableNumber, setTableNumber] = useState<string>('Table 3');
  const [isTableConfirmed, setIsTableConfirmed] = useState<boolean>(true);

  // Court delivery state
  const activeCourtBooking = bookings.find(
    b => (b.status === 'confirmed' || b.status === 'checked-in')
  );
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    () => activeCourtBooking?.courtId || 'court-1'
  );
  const [isCourtConfirmed, setIsCourtConfirmed] = useState<boolean>(true);

  // Takeaway arrival state
  const [estimatedArrival, setEstimatedArrival] = useState<string>('In 10-15 mins');
  const [isTakeawayConfirmed, setIsTakeawayConfirmed] = useState<boolean>(true);

  // Payment option: 'cash' vs 'online'
  const [paymentOption, setPaymentOption] = useState<'cash' | 'online'>('cash');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const targetCourt = courts.find(c => c.id === selectedCourtId);

  // Fast cash checkout handler
  const handleFastCashOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validate presence / arrival confirmation to prevent prank orders
    if (deliveryType === 'court_delivery' && !isCourtConfirmed) {
      setValidationError('Please confirm you are actively playing or present on court.');
      return;
    }
    if (deliveryType === 'table_dining' && !isTableConfirmed) {
      setValidationError(`Please confirm you are seated at ${tableNumber}.`);
      return;
    }
    if (deliveryType === 'takeaway' && !isTakeawayConfirmed) {
      setValidationError('Please confirm your arrival to collect your takeaway.');
      return;
    }

    setValidationError(null);

    const cashTxnId = 'CASH-' + Math.floor(100000 + Math.random() * 900000);
    const verificationNote = deliveryType === 'court_delivery'
      ? `Verified On-Court Player (${targetCourt?.name || 'Center Court'})`
      : deliveryType === 'table_dining'
      ? `Verified Seated Dining at ${tableNumber}`
      : deliveryType === 'takeaway'
      ? `Confirmed Takeaway Arrival (${estimatedArrival})`
      : 'Counter Express Pickup';

    placeCafeOrder({
      deliveryType,
      targetCourtId: deliveryType === 'court_delivery' ? selectedCourtId : undefined,
      targetCourtName: deliveryType === 'court_delivery' ? targetCourt?.name : undefined,
      tableNumber: deliveryType === 'table_dining' ? tableNumber : undefined,
      estimatedArrival: deliveryType === 'takeaway' ? estimatedArrival : undefined,
      isVerifiedPresence: true,
      verificationNote,
      paymentOption: 'cash',
      notes: orderNotes
        ? `${orderNotes} • Pay Cash on Arrival [${verificationNote}]`
        : `Pay Cash on Arrival [${verificationNote}]`,
      paymentDetails: {
        method: 'desk',
        transactionId: cashTxnId,
        amount: subtotal,
        currency: 'INR',
        status: 'completed',
        paidAt: new Date().toISOString(),
      },
    });

    if (onOrderPlaced) {
      onOrderPlaced();
    }
  };

  // Online payment gateway checkout handler
  const handleOnlineCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (deliveryType === 'court_delivery' && !isCourtConfirmed) {
      setValidationError('Please confirm you are actively playing or present on court.');
      return;
    }
    if (deliveryType === 'table_dining' && !isTableConfirmed) {
      setValidationError(`Please confirm you are seated at ${tableNumber}.`);
      return;
    }
    if (deliveryType === 'takeaway' && !isTakeawayConfirmed) {
      setValidationError('Please confirm your arrival to collect your takeaway.');
      return;
    }

    setValidationError(null);

    let destinationLabel = 'Bar Counter Pickup';
    if (deliveryType === 'court_delivery') destinationLabel = `Court Bench: ${targetCourt?.name || 'Center Court'}`;
    if (deliveryType === 'table_dining') destinationLabel = `Seated Dining at ${tableNumber}`;
    if (deliveryType === 'takeaway') destinationLabel = `Takeaway (${estimatedArrival})`;

    openPaymentModal({
      title: 'Cafe Order Checkout (Prepaid)',
      amount: subtotal,
      itemDescription: `${cart.length} items • ${destinationLabel}`,
      category: 'cafe',
      onSuccess: (paymentDetails) => {
        const verificationNote = deliveryType === 'court_delivery'
          ? `Verified On-Court Player (${targetCourt?.name || 'Center Court'})`
          : deliveryType === 'table_dining'
          ? `Verified Seated Dining at ${tableNumber}`
          : deliveryType === 'takeaway'
          ? `Confirmed Takeaway Arrival (${estimatedArrival})`
          : 'Counter Express Pickup';

        placeCafeOrder({
          deliveryType,
          targetCourtId: deliveryType === 'court_delivery' ? selectedCourtId : undefined,
          targetCourtName: deliveryType === 'court_delivery' ? targetCourt?.name : undefined,
          tableNumber: deliveryType === 'table_dining' ? tableNumber : undefined,
          estimatedArrival: deliveryType === 'takeaway' ? estimatedArrival : undefined,
          isVerifiedPresence: true,
          verificationNote,
          paymentOption: 'online',
          notes: orderNotes
            ? `${orderNotes} • Paid Online via ${paymentDetails.method.toUpperCase()} (Ref: ${paymentDetails.transactionId})`
            : `Paid Online via ${paymentDetails.method.toUpperCase()} (Ref: ${paymentDetails.transactionId})`,
          paymentDetails,
        });

        if (onOrderPlaced) {
          onOrderPlaced();
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Cafe & Refreshments Tray</h3>
                <p className="text-xs text-zinc-400">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} • Freshly prepared on order
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              id="close-cart-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 text-zinc-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Your refreshment tray is empty</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Add cheese Maggi, cold coffees, artisan pizzas, chilled ₹20 water bottles, or Alphonso mango shakes to order directly to your court bench or table.
                </p>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Items</span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-red-400 hover:text-red-300 hover:underline"
                      id="clear-cart-items-btn"
                    >
                      Clear all
                    </button>
                  </div>

                  {cart.map(item => (
                    <div
                      key={item.cartId}
                      className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5 flex items-start gap-3 justify-between shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {item.item.name}
                          </h4>
                          <span className="text-xs sm:text-sm font-black text-amber-400 ml-2 whitespace-nowrap">
                            ₹{item.item.price * item.quantity}
                          </span>
                        </div>

                        {/* Options summary */}
                        <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                          {item.selectedOptions?.crust && <div>Crust: {item.selectedOptions.crust}</div>}
                          {item.selectedOptions?.sugarLevel && <div>Sugar: {item.selectedOptions.sugarLevel}</div>}
                          {item.selectedOptions?.iceLevel && <div>Ice: {item.selectedOptions.iceLevel}</div>}
                          {item.selectedOptions?.milk && <div>Milk: {item.selectedOptions.milk}</div>}
                          {item.selectedOptions?.proteinBoost && <div>Boost: {item.selectedOptions.proteinBoost}</div>}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
                            <button
                              onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                              className="w-5 h-5 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-white w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                              className="w-5 h-5 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.cartId)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Destination Options */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      1. Where should we serve?
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      Physical Presence Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Court Delivery */}
                    <button
                      type="button"
                      id="opt-court-delivery"
                      onClick={() => setDeliveryType('court_delivery')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                        deliveryType === 'court_delivery'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          To Court
                        </span>
                      </div>
                      <span className="text-xs font-bold block text-white">Court Bench</span>
                      <span className="text-[10px] opacity-80 mt-0.5">Staff delivers while you play</span>
                    </button>

                    {/* Option 2: Table Dining */}
                    <button
                      type="button"
                      id="opt-table-dining"
                      onClick={() => setDeliveryType('table_dining')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                        deliveryType === 'table_dining'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Table
                        </span>
                      </div>
                      <span className="text-xs font-bold block text-white">Cafe Table Dining</span>
                      <span className="text-[10px] opacity-80 mt-0.5">Order & pay from your seat</span>
                    </button>

                    {/* Option 3: Takeaway */}
                    <button
                      type="button"
                      id="opt-takeaway"
                      onClick={() => setDeliveryType('takeaway')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                        deliveryType === 'takeaway'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <PackageCheck className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          Takeaway
                        </span>
                      </div>
                      <span className="text-xs font-bold block text-white">Packed Takeaway</span>
                      <span className="text-[10px] opacity-80 mt-0.5">Coming to collect</span>
                    </button>

                    {/* Option 4: Counter Pickup */}
                    <button
                      type="button"
                      id="opt-counter-pickup"
                      onClick={() => setDeliveryType('counter_pickup')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                        deliveryType === 'counter_pickup'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          Express
                        </span>
                      </div>
                      <span className="text-xs font-bold block text-white">Counter Pickup</span>
                      <span className="text-[10px] opacity-80 mt-0.5">Collect when notified</span>
                    </button>
                  </div>

                  {/* Contextual verification panels based on deliveryType */}
                  {deliveryType === 'court_delivery' && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-200">
                          Target Court:
                        </label>
                        {activeCourtBooking && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active Reservation Found
                          </span>
                        )}
                      </div>
                      <select
                        value={selectedCourtId}
                        onChange={e => setSelectedCourtId(e.target.value)}
                        className="w-full text-xs rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                        id="select-target-court"
                      >
                        {courts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {/* On-Court Confirmation Checkbox to prevent prank orders */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCourtConfirmed}
                          onChange={e => setIsCourtConfirmed(e.target.checked)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700"
                          id="confirm-on-court-checkbox"
                        />
                        <div className="text-[11px] leading-tight text-zinc-300">
                          <span className="font-bold text-amber-400 block mb-0.5">
                            Court Player Verification
                          </span>
                          I confirm I am currently playing / present on the court as{' '}
                          <strong className="text-white">{currentUser?.name || 'Club Member'}</strong>.
                        </div>
                      </label>
                    </div>
                  )}

                  {deliveryType === 'table_dining' && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2.5">
                      <label className="text-xs font-bold text-zinc-200 block">
                        Select Your Cafe Table:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8'].map(tbl => (
                          <button
                            key={tbl}
                            type="button"
                            onClick={() => setTableNumber(tbl)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                              tableNumber === tbl
                                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {tbl}
                          </button>
                        ))}
                      </div>

                      {/* Seated Table Verification Checkbox */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isTableConfirmed}
                          onChange={e => setIsTableConfirmed(e.target.checked)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700"
                          id="confirm-table-checkbox"
                        />
                        <div className="text-[11px] leading-tight text-zinc-300">
                          <span className="font-bold text-amber-400 block mb-0.5">
                            Seated Presence Verification
                          </span>
                          I confirm I am currently seated at <strong className="text-white">{tableNumber}</strong>. Cafe staff will bring hot orders and bill settlement directly to my table.
                        </div>
                      </label>
                    </div>
                  )}

                  {deliveryType === 'takeaway' && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2.5">
                      <label className="text-xs font-bold text-zinc-200 block">
                        When will you arrive to collect?
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['In 10-15 mins', 'In 20-30 mins', 'Already at club'].map(arr => (
                          <button
                            key={arr}
                            type="button"
                            onClick={() => setEstimatedArrival(arr)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
                              estimatedArrival === arr
                                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {arr}
                          </button>
                        ))}
                      </div>

                      {/* Takeaway Arrival Confirmation Checkbox */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isTakeawayConfirmed}
                          onChange={e => setIsTakeawayConfirmed(e.target.checked)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700"
                          id="confirm-takeaway-checkbox"
                        />
                        <div className="text-[11px] leading-tight text-zinc-300">
                          <span className="font-bold text-amber-400 block mb-0.5">
                            Takeaway Arrival Commitment
                          </span>
                          I confirm I am on my way to the club to pick up this fresh order ({estimatedArrival}).
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Kitchen Special Notes */}
                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-400 block">
                      Special Kitchen Instructions:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Less spicy, extra cheese on Maggi, separate napkins"
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                      className="w-full text-xs rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      id="cart-special-notes-input"
                    />
                  </div>
                </div>

                {/* Payment Option Selector (Cash vs Online) */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    2. Payment Method
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="opt-pay-cash"
                      onClick={() => setPaymentOption('cash')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        paymentOption === 'cash'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                          CASH / DESK
                        </span>
                      </div>
                      <span className="text-xs font-bold block text-white">Pay Cash</span>
                      <span className="text-[10px] opacity-80 mt-0.5">Pay on delivery/counter</span>
                    </button>

                    <button
                      type="button"
                      id="opt-pay-online"
                      onClick={() => setPaymentOption('online')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        paymentOption === 'online'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          INSTANT UPI
                        </span>
                      </div>
                      <span className="text-xs font-bold block text-white">Pay Online</span>
                      <span className="text-[10px] opacity-80 mt-0.5">UPI / Card / NetBanking</span>
                    </button>
                  </div>

                  {paymentOption === 'cash' ? (
                    <div className="text-[11px] text-emerald-400/90 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        Fast 1-tap confirmation. Settle ₹{subtotal} cash directly when staff delivers to court/table!
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Pay securely with Google Pay, PhonePe, Paytm QR, or Debit/Credit Card.
                      </span>
                    </div>
                  )}
                </div>

                {validationError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Member Ordering:</span>
                <span className="text-white font-medium">{currentUser?.name || 'Club Member'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-white">Grand Total:</span>
                <span className="text-2xl font-black text-amber-400">₹{subtotal}</span>
              </div>

              {paymentOption === 'cash' ? (
                <button
                  type="button"
                  id="confirm-fast-cash-btn"
                  onClick={handleFastCashOrder}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Confirm Fast & Pay ₹{subtotal} Cash</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  id="checkout-online-btn"
                  onClick={handleOnlineCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Pay ₹{subtotal} Online (UPI / Card)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}

              <p className="text-[10px] text-center text-zinc-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero service charge • Fresh kitchen preparation guaranteed</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
