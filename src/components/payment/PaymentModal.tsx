import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentDetails } from '../../types';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Wallet,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  Copy,
  Check,
  DollarSign,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    paymentConfig,
    closePaymentModal,
    walletBalance,
    payWithWallet,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'wallet' | 'netbanking' | 'court_desk'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('PRATISH GUPTA');

  // Netbanking field
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentDetails | null>(null);

  if (!isPaymentModalOpen || !paymentConfig) return null;

  const totalAmount = paymentConfig.amount;
  const gstAmount = Math.round(totalAmount * 0.18);
  const baseAmount = totalAmount - gstAmount;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const executePaymentSuccess = (method: PaymentDetails['method'], txnId: string) => {
    const details: PaymentDetails = {
      method,
      transactionId: txnId,
      amount: totalAmount,
      currency: 'INR',
      status: 'completed',
      paidAt: new Date().toISOString(),
    };
    setPaymentSuccess(details);
    setIsProcessing(false);
  };

  const handlePayNow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const txnCode = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);

      if (activeTab === 'wallet') {
        const deducted = payWithWallet(totalAmount);
        if (!deducted) {
          setIsProcessing(false);
          return;
        }
        executePaymentSuccess('wallet', txnCode);
      } else if (activeTab === 'upi') {
        executePaymentSuccess('upi', txnCode);
      } else if (activeTab === 'card') {
        executePaymentSuccess('card', txnCode);
      } else if (activeTab === 'netbanking') {
        executePaymentSuccess('netbanking', txnCode);
      } else {
        executePaymentSuccess('venue', txnCode);
      }
    }, 1200);
  };

  const handleCompleteAndDismiss = () => {
    if (paymentSuccess) {
      paymentConfig.onSuccess(paymentSuccess);
    }
    setPaymentSuccess(null);
    closePaymentModal();
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('thedinkingroom@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-zinc-100">Checkout & Pay</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-BIT SSL
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-xs">{paymentConfig.title}</p>
            </div>
          </div>
          {!isProcessing && !paymentSuccess && (
            <button
              onClick={closePaymentModal}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ================= SUCCESS STATE ================= */}
          {paymentSuccess ? (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                  Payment Verified
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">
                  ₹{(paymentSuccess.amount ?? totalAmount).toLocaleString('en-IN')} Paid
                </h3>
                <p className="text-xs text-zinc-400 mt-1">{paymentConfig.itemDescription}</p>
              </div>

              {/* Transaction Receipt Card */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-xs space-y-2 text-left">
                <div className="flex justify-between pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Transaction ID</span>
                  <span className="font-mono font-semibold text-zinc-200">{paymentSuccess.transactionId}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Payment Channel</span>
                  <span className="font-semibold text-emerald-400 capitalize">{paymentSuccess.method.toUpperCase()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Merchant</span>
                  <span className="text-zinc-200">The Dinking Room Boutique Club</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date & Time</span>
                  <span className="text-zinc-200">{new Date(paymentSuccess.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>

              <button
                onClick={handleCompleteAndDismiss}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>View Court Pass / Order Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : isProcessing ? (
            /* ================= PROCESSING STATE ================= */
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                  <Lock className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-base text-zinc-100">Connecting to Bank Gateway</h4>
                <p className="text-xs text-zinc-400 mt-1">Authorizing ₹{totalAmount} with zero latency...</p>
              </div>
            </div>
          ) : (
            /* ================= PAYMENT METHODS SELECTOR ================= */
            <>
              {/* Order Amount Banner */}
              <div className="p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400">Payable Amount</div>
                  <div className="text-2xl font-black text-emerald-400">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right text-[11px] text-zinc-400">
                  <div>Base: ₹{baseAmount}</div>
                  <div>GST (18% incl): ₹{gstAmount}</div>
                </div>
              </div>

              {/* Payment Methods Nav */}
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'upi' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'card' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('wallet')}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'wallet' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'netbanking' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>NetBank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('court_desk')}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'court_desk' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Pay Cash</span>
                </button>
              </div>

              {/* ================= TAB 1: UPI ================= */}
              {activeTab === 'upi' && (
                <div className="space-y-3.5">
                  <div className="text-xs font-semibold text-zinc-300">Choose Instant UPI App</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', name: 'Google Pay', color: 'from-blue-500 to-emerald-500' },
                      { id: 'phonepe', name: 'PhonePe', color: 'from-purple-600 to-indigo-600' },
                      { id: 'paytm', name: 'Paytm UPI', color: 'from-sky-500 to-blue-600' },
                      { id: 'cred', name: 'CRED UPI', color: 'from-zinc-700 to-black' },
                    ].map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          selectedUpiApp === app.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                          {app.id.toUpperCase()}
                        </div>
                        <span className="text-[11px] font-medium">{app.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic QR Code */}
                  <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl flex items-center gap-4">
                    <div className="w-20 h-20 bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center">
                      <div className="w-full h-full bg-zinc-900 rounded flex flex-col items-center justify-center text-[8px] font-mono text-emerald-400 p-1 text-center">
                        <QrCode className="w-8 h-8 text-zinc-100" />
                        <span>UPI SCAN</span>
                      </div>
                    </div>
                    <div className="flex-1 text-xs space-y-1">
                      <div className="font-semibold text-zinc-200">Scan & Pay via any UPI App</div>
                      <div className="text-zinc-400 text-[11px]">Zero merchant surcharge. Supported across India.</div>
                      <div className="flex items-center gap-1 pt-1 font-mono text-[11px] text-emerald-400">
                        <span>thedinkingroom@icici</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 hover:text-white"
                          title="Copy UPI VPA"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Or Enter Custom UPI ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      OR ENTER YOUR UPI VPA ID
                    </label>
                    <input
                      type="text"
                      value={customUpiId}
                      onChange={e => setCustomUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank or user@paytm"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* ================= TAB 2: CREDIT / DEBIT CARD ================= */}
              {activeTab === 'card' && (
                <div className="space-y-3">
                  {/* Visual Card Preview */}
                  <div className="p-4 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-800 to-zinc-900 border border-zinc-700/60 shadow-md text-zinc-100 space-y-3 font-mono">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span>THE DINKING ROOM CLUB CARD</span>
                      <span className="text-emerald-400 font-bold">RuPay / VISA / MC</span>
                    </div>
                    <div className="text-base tracking-widest font-semibold text-zinc-200">
                      {cardNumber || '•••• •••• •••• 4242'}
                    </div>
                    <div className="flex justify-between items-end text-[10px]">
                      <div>
                        <div className="text-zinc-500 text-[8px]">CARDHOLDER</div>
                        <div className="font-sans font-bold uppercase">{cardHolder || 'MEMBER NAME'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-[8px]">EXPIRES</div>
                        <div>{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4532 8821 9021 4242"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="08/28"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: CLUB WALLET ================= */}
              {activeTab === 'wallet' && (
                <div className="space-y-3.5">
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-zinc-400">Club Pass Wallet Balance</div>
                      <div className="text-lg font-black text-emerald-400">
                        ₹{walletBalance.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Order Total</span>
                      <span className="font-bold text-zinc-200">₹{totalAmount}</span>
                    </div>
                    <div className="mt-1 flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Remaining After Payment</span>
                      <span className={`font-bold ${walletBalance >= totalAmount ? 'text-emerald-400' : 'text-red-400'}`}>
                        ₹{(walletBalance - totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {walletBalance < totalAmount ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                      <div className="font-bold">Insufficient Balance in Wallet</div>
                      <div className="text-zinc-400">
                        You need ₹{totalAmount - walletBalance} more. Please switch to UPI or Card, or recharge your wallet.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>1-Tap Instant Deduction enabled. Zero payment OTP needed!</span>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 4: NET BANKING ================= */}
              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-zinc-300">Select Popular Indian Bank</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          selectedBank === b
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 5: PAY AT DESK / CASH ================= */}
              {activeTab === 'court_desk' && (
                <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-zinc-200">Pay with Cash on Arrival / Court Bench</div>
                  <p className="text-zinc-400">
                    Your Center Court reservation or cafe order will be instantly confirmed. You can settle ₹{totalAmount} in cash directly with the staff upon delivery to court/table or at the reception desk.
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Instant confirmation • Pay cash when served or arriving.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer (Pay Action) */}
        {!paymentSuccess && !isProcessing && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={closePaymentModal}
              className="py-2.5 px-4 text-xs font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayNow}
              disabled={activeTab === 'wallet' && walletBalance < totalAmount}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {activeTab === 'court_desk'
                  ? `Confirm & Pay ₹${totalAmount} Cash`
                  : `Pay ₹${totalAmount.toLocaleString('en-IN')} Securely`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
