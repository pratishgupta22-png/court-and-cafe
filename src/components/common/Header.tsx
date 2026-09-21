import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../PWAInstallButton';
import {
  ShoppingBag,
  User,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  X,
  LogIn,
  LogOut,
  Wallet,
  ShieldCheck,
  ChevronDown,
  Trophy,
  ShieldAlert,
  Bell,
  Users,
  Scan,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  onOpenOperationsGuide?: () => void;
  onOpenWalletModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOperationsGuide, onOpenWalletModal }) => {
  const {
    cart,
    setIsCartOpen,
    currentUser,
    isLoggedIn,
    logout,
    openAuthModal,
    walletBalance,
    openPaymentModal,
    topUpWallet,
    appPortal,
    setAppPortal,
    isStaffLoggedIn,
    currentStaffUser,
    setIsStaffLoginModalOpen,
    staffLogout,
    unreadStaffNotifsCount,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleWalletRecharge = (amount = 500) => {
    setShowUserDropdown(false);
    openPaymentModal({
      title: 'Top Up Club Pass Wallet',
      amount,
      itemDescription: `Add ₹${amount} court & cafe credits with zero surcharge`,
      category: 'wallet',
      onSuccess: (paymentDetails) => {
        topUpWallet(amount, paymentDetails);
      },
    });
  };

  const handleSwitchToStaff = () => {
    // Strict security protocol: require password entry on every staff console access
    setIsStaffLoginModalOpen(true);
  };

  const handleSwitchToMember = () => {
    if (appPortal === 'staff') {
      staffLogout();
    }
    setAppPortal('member');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-zinc-950/95 backdrop-blur-md shadow-2xl">
      {/* Championship Marquee Announcement Bar with App Mode Toggle */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-amber-950/90 border-b border-zinc-800/90 px-3 sm:px-6 py-2 text-xs text-zinc-300 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="hidden md:inline font-medium text-zinc-300">
            <strong className="text-amber-400 font-bold">COURT & CAFE ARENA:</strong> Court: 4 AM – 12 AM Midnight • Cafe & Kitchen: 11 AM – 11 PM • 1 Championship Court • Artisanal Roastery
          </span>
          <span className="md:hidden font-semibold text-amber-400">
            Court: 4 AM–12 AM • Cafe: 11 AM–11 PM
          </span>
          <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ★ DUPR™ Regulation Facility
          </span>
        </div>

        {/* Interconnected Two-App Switcher in top bar */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-0.5 rounded-xl border border-amber-500/30 shadow-inner">
          <button
            type="button"
            onClick={handleSwitchToMember}
            className={`px-3 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 ${
              appPortal === 'member'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Member App</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchToStaff}
            className={`px-3 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 relative ${
              appPortal === 'staff'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
            title="Switch to Staff & Owner Portal"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff Portal</span>
            {unreadStaffNotifsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-500 text-white animate-pulse">
                {unreadStaffNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Left: Handcrafted Club Crest & Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/60 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex flex-col items-center justify-center border border-amber-500/40">
              <span className="font-serif font-black text-amber-400 text-sm tracking-tighter leading-none">CC</span>
              <span className="text-[7px] font-black tracking-widest text-emerald-400 uppercase">CLUB</span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-zinc-950 shadow">
              ★
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Court & Cafe
              </h1>
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-black tracking-wide border ${
                appPortal === 'staff'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
              }`}>
                {appPortal === 'staff' ? 'STAFF & OWNER CONSOLE' : 'BOUTIQUE ARENA & ARTISANAL KITCHEN'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:flex items-center gap-2">
              <span>EST. 2026</span>
              <span className="text-zinc-600">•</span>
              <span>Pro-Cushion Pickleball Arena</span>
              <span className="text-zinc-600">•</span>
              <span>1 Championship Court</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/90 font-semibold">Single-Origin Roastery</span>
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button for Safari / iOS / Android */}
          <PWAInstallButton />

          {/* If Member App: show Wallet Pill & Cafe Cart */}
          {appPortal === 'member' && (
            <>
              <button
                onClick={onOpenWalletModal || (() => handleWalletRecharge(500))}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold transition"
                title="Club Pass Wallet Balance • Click to Manage Pass & Credits"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>₹{walletBalance.toLocaleString('en-IN')}</span>
                <span className="text-[10px] bg-emerald-500 text-zinc-950 px-1 py-0.2 rounded font-black">+Add</span>
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 hover:border-emerald-500/50 transition active:scale-95"
                aria-label="View Cafe Cart"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Cafe Tray</span>
                {cartTotalCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-extrabold text-zinc-950 animate-bounce">
                    {cartTotalCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* User Auth Control for Members */}
          {isLoggedIn && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs text-zinc-200 transition"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] border border-emerald-500/30">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-zinc-100 text-xs truncate max-w-[110px]">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-400">Member • {currentUser.membershipId}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-700 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-zinc-800">
                    <div className="font-bold text-white text-sm">{currentUser.name}</div>
                    <div className="text-xs text-zinc-400 truncate">{currentUser.email}</div>
                    <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
                      <span className="text-zinc-400">Club Wallet</span>
                      <span className="font-bold text-emerald-400">₹{walletBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-zinc-400">Skill Rating</span>
                      <span className="font-semibold text-zinc-300">{currentUser.skillLevel || '3.0 Intermediate'}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onOpenWalletModal) {
                          onOpenWalletModal();
                        } else {
                          handleWalletRecharge(500);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 hover:text-emerald-400 flex items-center gap-2 transition"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Digital Club Pass & Season Cards</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out Member</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Member Sign In / Register</span>
            </button>
          )}

          {/* Quick Staff Mode shortcut if in Member mode */}
          {appPortal === 'member' && (
            <button
              onClick={handleSwitchToStaff}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-300 transition"
              title="Open Staff & Owner App with Face ID or Password"
            >
              <Scan className="w-3.5 h-3.5 text-amber-400" />
              <span>Face ID / Staff Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
