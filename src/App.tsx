import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CartDrawer } from './components/member/CartDrawer';
import { CourtBookingView } from './components/member/CourtBookingView';
import { CafeMenuView } from './components/member/CafeMenuView';
import { MyPassesView } from './components/member/MyPassesView';
import { SocialMixersView } from './components/member/SocialMixersView';
import { AuthModal } from './components/auth/AuthModal';
import { StaffLoginModal } from './components/auth/StaffLoginModal';
import { StaffOwnerApp } from './components/admin/StaffOwnerApp';
import { PaymentModal } from './components/payment/PaymentModal';
import { MatchScoreboard } from './components/match/MatchScoreboard';
import { ClubWalletModal } from './components/member/ClubWalletModal';
import {
  Calendar,
  Coffee,
  QrCode,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Trophy,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { cafeOrders, bookings, currentUser, isLoggedIn, openAuthModal, appPortal } = useApp();

  // Primary Member Navigation: 'booking' | 'cafe' | 'community' | 'referee' | 'passes'
  const [memberTab, setMemberTab] = useState<'booking' | 'cafe' | 'community' | 'referee' | 'passes'>('booking');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length;
  const activeOrdersCount = cafeOrders.filter(o => o.status !== 'delivered').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950 pb-20 sm:pb-8 arena-ambient-bg">
      {/* Global Header with Authentication, Two-App Switcher & Club Pass Wallet */}
      <Header onOpenWalletModal={() => setIsWalletModalOpen(true)} />

      {/* Conditional Rendering: Staff & Owner App vs. Member App */}
      {appPortal === 'staff' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <StaffOwnerApp />
        </main>
      ) : (
        <>
          {/* Aesthetic Member Navigation Bar */}
          <div className="border-b border-amber-500/20 bg-zinc-950/80 sticky top-16 z-30 backdrop-blur-xl shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-x-auto py-3 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setMemberTab('booking')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border ${
                    memberTab === 'booking'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-emerald-500/40 hover:bg-zinc-850'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Court</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    memberTab === 'booking' ? 'bg-zinc-950/30 text-zinc-950' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    ₹500/hr
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMemberTab('cafe')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border ${
                    memberTab === 'cafe'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-amber-500/40 hover:bg-zinc-850'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Artisanal Cafe & Kitchen</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    memberTab === 'cafe' ? 'bg-zinc-950/30 text-zinc-950' : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                  }`}>
                    Courtside
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMemberTab('community')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border ${
                    memberTab === 'community'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-zinc-950 border-teal-400 shadow-lg shadow-teal-500/20'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-teal-500/40 hover:bg-zinc-850'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Open Play & Mixers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMemberTab('referee')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border ${
                    memberTab === 'referee'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 border-emerald-300 shadow-lg shadow-emerald-400/20'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-emerald-400/40 hover:bg-zinc-850'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Referee Scoreboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMemberTab('passes')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border relative ${
                    memberTab === 'passes'
                      ? 'bg-zinc-100 text-zinc-950 border-white shadow-lg'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-850'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>My Passes & Orders</span>
                  {(activeBookingsCount > 0 || activeOrdersCount > 0) && (
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Championship Facility Ribbon with ₹100 bonus reminder and live status */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1 w-full">
            <div className="rounded-2xl bg-gradient-to-r from-amber-950/35 via-zinc-900/95 to-emerald-950/35 border border-amber-500/30 p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>Court & Cafe Arena & Lounge</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      1 Championship Court Live
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    Court: 4 AM – 12 AM Midnight • Cafe: 11 AM – 11 PM • 1,000-Lux Lighting • ₹500/hr (₹300/30m) • Chilled ₹20 Water
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isLoggedIn ? (
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/25 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>🎁 Claim ₹100 Registration Bonus</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 hidden md:inline">Welcome back, <strong className="text-white">{currentUser?.name}</strong></span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                      Bonus Applied
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Body Container for Member App */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            {memberTab === 'booking' && (
              <CourtBookingView
                onSwitchToCafe={() => setMemberTab('cafe')}
                onViewPasses={() => setMemberTab('passes')}
              />
            )}
            {memberTab === 'cafe' && <CafeMenuView />}
            {memberTab === 'community' && (
              <SocialMixersView
                onBookCourt={() => setMemberTab('booking')}
                onOrderCafe={() => setMemberTab('cafe')}
              />
            )}
            {memberTab === 'referee' && (
              <MatchScoreboard />
            )}
            {memberTab === 'passes' && (
              <MyPassesView
                onBookCourt={() => setMemberTab('booking')}
                onOrderCafe={() => setMemberTab('cafe')}
              />
            )}
          </main>

          {/* Mobile App Bottom Floating Tab Bar (Safari iOS & Play Store Experience) */}
          <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-lg px-3 py-2 flex items-center justify-around pb-[max(env(safe-area-inset-bottom),0.65rem)]">
            <button
              onClick={() => setMemberTab('booking')}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-bold transition-colors ${
                memberTab === 'booking' ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span>Court</span>
            </button>

            <button
              onClick={() => setMemberTab('cafe')}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-bold transition-colors ${
                memberTab === 'cafe' ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              <Coffee className="w-5 h-5 mb-0.5" />
              <span>Cafe</span>
            </button>

            <button
              onClick={() => setMemberTab('community')}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-bold transition-colors ${
                memberTab === 'community' ? 'text-teal-400' : 'text-zinc-400'
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span>Mixers</span>
            </button>

            <button
              onClick={() => setMemberTab('referee')}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-bold transition-colors ${
                memberTab === 'referee' ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              <Trophy className="w-5 h-5 mb-0.5" />
              <span>Referee</span>
            </button>

            <button
              onClick={() => setMemberTab('passes')}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-bold relative transition-colors ${
                memberTab === 'passes' ? 'text-white' : 'text-zinc-400'
              }`}
            >
              <QrCode className="w-5 h-5 mb-0.5" />
              <span>Passes</span>
              {(activeBookingsCount > 0 || activeOrdersCount > 0) && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </nav>
        </>
      )}

      {/* Cart Drawer */}
      <CartDrawer onOrderPlaced={() => setMemberTab('passes')} />

      {/* Member Authentication Modal (Register / Login for Members Only) */}
      <AuthModal />

      {/* Staff & Owner Authentication Modal (Restricted by Employee ID & PIN) */}
      <StaffLoginModal />

      {/* Secure Payment Modal (UPI, Cards, NetBanking, Club Wallet, Desk) */}
      <PaymentModal />

      {/* Real-Time Toast Notifications */}
      <ToastContainer />

      {/* Club Pass & Multi-Session Play Cards Digital Wallet Modal */}
      <ClubWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Play / App Store PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
