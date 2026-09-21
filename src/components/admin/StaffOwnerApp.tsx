import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Calendar,
  Clock,
  Coffee,
  Droplets,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Zap,
  DollarSign,
  UserCheck,
  LogOut,
  Send,
  Plus,
  RefreshCw,
  QrCode,
  Sparkles,
  Phone,
  Layers,
  FileText,
  Building,
  Check,
  X,
  Flame,
  BookOpen,
  Trophy,
  BarChart3,
  Package,
  Lock,
} from 'lucide-react';
import { QuickWalkInModal } from './QuickWalkInModal';
import { BlockCourtModal } from './BlockCourtModal';
import { FacilityScheduleView } from './FacilityScheduleView';
import { KitchenDisplayView } from './KitchenDisplayView';
import { EquipmentInventoryView } from './EquipmentInventoryView';
import { InventorySectorView } from './InventorySectorView';
import { KitchenRecipeBook } from './KitchenRecipeBook';
import { MatchScoreboard } from '../match/MatchScoreboard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { MemberEntryQRView } from './MemberEntryQRView';
import { MemberEntryQRModal } from './MemberEntryQRModal';
import { DailySettlementModal } from './DailySettlementModal';
import { StaffPOSView } from './StaffPOSView';

export const StaffOwnerApp: React.FC = () => {
  const {
    currentStaffUser,
    staffLogout,
    setAppPortal,
    staffNotifications,
    unreadStaffNotifsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissStaffNotification,
    markNotificationActionDone,
    waterRequests,
    updateWaterRequestStatus,
    bookings,
    cafeOrders,
    checkInBooking,
    courtLights,
    toggleCourtLight,
    shiftLogs,
    addShiftLog,
    stockItems,
    simulateIncomingOrder,
    simulateMemberCheckIn,
    resetAllSalesToZero,
  } = useApp();

  // Internal Staff Tabs: 'pos' | 'messages' | 'schedule' | 'entry_qr' | 'kitchen' | 'recipes' | 'inventory' | 'water' | 'referee' | 'analytics' | 'ledger'
  const [activeStaffTab, setActiveStaffTab] = useState<'pos' | 'messages' | 'schedule' | 'entry_qr' | 'kitchen' | 'recipes' | 'inventory' | 'water' | 'referee' | 'analytics' | 'ledger'>('pos');

  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isEntryQROpen, setIsEntryQROpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [entryQRBookingId, setEntryQRBookingId] = useState<string | undefined>();
  const [selectedSlotForAction, setSelectedSlotForAction] = useState<string | undefined>();
  const [newLogMessage, setNewLogMessage] = useState('');

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const todayCourtRevenue = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const todayCafeOrders = cafeOrders;
  const todayCafeRevenue = todayCafeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenue = todayCourtRevenue + todayCafeRevenue;
  const pendingWaterCount = waterRequests.filter(w => w.status === 'pending').length;
  const activeOrdersCount = cafeOrders.filter(o => o.status !== 'delivered').length;
  const lowStockCount = stockItems ? stockItems.filter(i => i.currentStock <= i.minThreshold).length : 0;

  const handlePostLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogMessage.trim()) return;
    addShiftLog(newLogMessage.trim(), 'general', 'Front Desk');
    setNewLogMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Staff & Owner App Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-900 border border-amber-500/30 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-zinc-950 uppercase tracking-wider">
                  STAFF & OWNER OPERATIONS
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  ID: {currentStaffUser?.staffId || 'STAFF-01'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 flex items-center gap-2">
                <span>{currentStaffUser?.name || 'Sunil Rao'}</span>
                <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {currentStaffUser?.roleTitle || 'Court Operations & Reception'}
                </span>
              </h2>
            </div>
          </div>

          {/* Quick Actions & App Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEntryQRBookingId(undefined);
                setIsEntryQROpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>⚡ Member Entry QR</span>
            </button>

            <button
              onClick={() => setIsSettlementOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>📋 Day-End Z-Report</span>
            </button>

            <button
              onClick={() => staffLogout()}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-1.5 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lock & Switch to Member</span>
            </button>

            <button
              onClick={() => toggleCourtLight('court-1')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                courtLights['court-1']
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Court Lights: {courtLights['court-1'] ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={staffLogout}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold transition"
              title="Lock & Exit Staff Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Operational Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveStaffTab('analytics')}
            className="bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl p-3 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-semibold block">Today's Revenue</span>
              <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition">Analytics →</span>
            </div>
            <span className="text-base sm:text-lg font-black text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-zinc-500 block">Court: ₹{todayCourtRevenue} • Cafe: ₹{todayCafeRevenue}</span>
          </button>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 font-semibold block">Incoming Staff Alerts</span>
            <span className="text-base sm:text-lg font-black text-amber-400">{unreadStaffNotifsCount} New</span>
            <span className="text-[10px] text-zinc-500 block">{staffNotifications.length} total messages in feed</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 font-semibold block">Courtside Water Requests</span>
            <span className="text-base sm:text-lg font-black text-cyan-400">{pendingWaterCount} Pending</span>
            <span className="text-[10px] text-zinc-500 block">Free hydration service for players</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
            <span className="text-[11px] text-zinc-400 font-semibold block">Active Cafe Orders</span>
            <span className="text-base sm:text-lg font-black text-purple-400">{activeOrdersCount} Open</span>
            <span className="text-[10px] text-zinc-500 block">Court delivery & takeaway</span>
          </div>
        </div>
      </div>

      {/* Staff Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        <button
          onClick={() => setActiveStaffTab('pos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap relative ${
            activeStaffTab === 'pos'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-zinc-850 border border-amber-500/30'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>🛒 Take Order & Book Court (POS)</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
            activeStaffTab === 'messages'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Live Messages & Alerts</span>
          {unreadStaffNotifsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
              {unreadStaffNotifsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStaffTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeStaffTab === 'schedule'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Court Master (30m Slots & Desk Cash)</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('entry_qr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
            activeStaffTab === 'entry_qr'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Member Entry QR</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('kitchen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
            activeStaffTab === 'kitchen'
              ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Kitchen POS & Delivery</span>
          {activeOrdersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-zinc-900 text-purple-300">
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStaffTab('recipes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeStaffTab === 'recipes'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Recipe Book & SOPs</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
            activeStaffTab === 'inventory'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory Sector</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStaffTab('water')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
            activeStaffTab === 'water'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Courtside Water Butler</span>
          {pendingWaterCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
              {pendingWaterCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStaffTab('referee')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeStaffTab === 'referee'
              ? 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-400/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Referee Scoreboard</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeStaffTab === 'analytics'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Trends</span>
        </button>

        <button
          onClick={() => setActiveStaffTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeStaffTab === 'ledger'
              ? 'bg-zinc-200 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Shift Logs & Owner Ledger</span>
        </button>
      </div>

      {/* Tab 0: Staff POS (Take Food/Drink Order & Book Court) */}
      {activeStaffTab === 'pos' && (
        <StaffPOSView />
      )}

      {/* Tab 1: Live Staff Messages & Notifications Feed */}
      {activeStaffTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Interconnected Staff Incoming Message Channel
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every member booking, kitchen order, and courtside water request triggers an instant alert here for staff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Mark All Read
              </button>
              <button
                type="button"
                onClick={simulateIncomingOrder}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
              >
                + Test Simulated Alert
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          {staffNotifications.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
              <h4 className="text-sm font-bold text-white">All Staff Notifications Cleared</h4>
              <p className="text-xs text-zinc-400 mt-1">When players book courts, order Maggi/coffee, or ask for water, alerts appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staffNotifications.map(notif => {
                const isBooking = notif.type === 'court_booking';
                const isCafe = notif.type === 'cafe_order';
                const isWater = notif.type === 'water_request';

                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                      !notif.isRead
                        ? 'bg-zinc-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-zinc-900/60 border-zinc-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isBooking
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isCafe
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isWater
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {isBooking && <Calendar className="w-5 h-5" />}
                          {isCafe && <Coffee className="w-5 h-5" />}
                          {isWater && <Droplets className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-sm text-white">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-500 text-zinc-950">
                                NEW
                              </span>
                            )}
                            {notif.actionDone && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                FULFILLED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Action Items for Staff */}
                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-zinc-800/80">
                            {isBooking && notif.metadata?.bookingId && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    checkInBooking(notif.metadata!.bookingId!);
                                    markNotificationActionDone(notif.id);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verify Pass & Collect Cash (₹{notif.metadata?.amount || 270})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleCourtLight('court-1')}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Lights On</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEntryQRBookingId(notif.metadata?.bookingId);
                                    setIsEntryQROpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition flex items-center gap-1"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>Entry QR</span>
                                </button>
                              </>
                            )}

                            {isWater && (
                              <button
                                type="button"
                                onClick={() => {
                                  markNotificationActionDone(notif.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1"
                              >
                                <Droplets className="w-3.5 h-3.5" />
                                <span>Dispatched Water to Bench</span>
                              </button>
                            )}

                            {isCafe && (
                              <button
                                type="button"
                                onClick={() => {
                                  markNotificationActionDone(notif.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Order Acknowledged by Kitchen</span>
                              </button>
                            )}

                            {!notif.actionDone && (
                              <button
                                type="button"
                                onClick={() => markNotificationActionDone(notif.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                              >
                                Mark Done
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => dismissStaffNotification(notif.id)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs transition"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Court Master & Schedule */}
      {activeStaffTab === 'schedule' && (
        <FacilityScheduleView
          onOpenWalkInModal={(courtId, timeSlot) => {
            setSelectedSlotForAction(timeSlot);
            setIsWalkInOpen(true);
          }}
          onOpenBlockModal={(courtId, timeSlot) => {
            setSelectedSlotForAction(timeSlot);
            setIsBlockOpen(true);
          }}
          onOpenEntryQRModal={(bookingId) => {
            setEntryQRBookingId(bookingId);
            setIsEntryQROpen(true);
          }}
        />
      )}

      {/* Tab: Member Entry QR Generator & Turnstile Gate Controller */}
      {activeStaffTab === 'entry_qr' && (
        <MemberEntryQRView initialBookingId={entryQRBookingId} />
      )}

      {/* Tab 3: Kitchen Display View */}
      {activeStaffTab === 'kitchen' && (
        <KitchenDisplayView />
      )}

      {/* Tab: Artisanal Recipe Book & Induction SOPs */}
      {activeStaffTab === 'recipes' && (
        <KitchenRecipeBook />
      )}

      {/* Tab: Comprehensive Staff Inventory Sector */}
      {activeStaffTab === 'inventory' && (
        <InventorySectorView />
      )}

      {/* Tab: Courtside Digital Referee HUD */}
      {activeStaffTab === 'referee' && (
        <MatchScoreboard />
      )}

      {/* Tab 4: Courtside Water & Hydration Butler */}
      {activeStaffTab === 'water' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Courtside Hydration & Towel Dispatch</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complimentary chilled mineral water, hydration electrolytes, and fresh microfiber court towels.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {waterRequests.map(req => {
              const isPending = req.status === 'pending';
              const isDispatched = req.status === 'dispatched';
              const isDelivered = req.status === 'delivered';

              return (
                <div
                  key={req.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition ${
                    isPending
                      ? 'bg-zinc-900 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{req.courtName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isPending
                            ? 'bg-amber-500 text-zinc-950 animate-pulse'
                            : isDispatched
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-300 font-semibold mt-1">
                        {req.quantity}x {req.requestType === 'chilled_water' ? 'Chilled Mineral Water Flask' : req.requestType === 'electrolyte_refill' ? 'Electrolytes Refill' : 'Fresh Court Towels'}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Requested by {req.memberName} • {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {req.notes && (
                        <p className="text-xs text-zinc-400 mt-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800 italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => updateWaterRequestStatus(req.id, 'dispatched')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition"
                        >
                          Dispatch Now
                        </button>
                      )}
                      {(isPending || isDispatched) && (
                        <button
                          type="button"
                          onClick={() => updateWaterRequestStatus(req.id, 'delivered')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {isDelivered && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          On Court Bench
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Business Intelligence & Recharts Visualizations */}
      {activeStaffTab === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {/* Tab 5: Owner Ledger & Shift Logs */}
      {activeStaffTab === 'ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Today's Total Intake</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <div className="mt-3 space-y-1.5 text-xs text-zinc-400 pt-3 border-t border-zinc-800">
                <div className="flex justify-between">
                  <span>Court Bookings ({todayBookings.length})</span>
                  <span className="font-bold text-zinc-200">₹{todayCourtRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cafe Orders ({todayCafeOrders.length})</span>
                  <span className="font-bold text-zinc-200">₹{todayCafeRevenue}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Cash at Front Desk</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">₹{Math.round(totalRevenue * 0.45).toLocaleString('en-IN')}</span>
              <p className="text-xs text-zinc-400 mt-2">
                Physical cash collected at counter desk from members paying for half-hour (₹270), 1 hour (₹500), and Maggi/coffee.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Facility Operating Status</span>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Court Lights</span>
                  <span className={`font-bold ${courtLights['court-1'] ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {courtLights['court-1'] ? 'Active (ON)' : 'Standby (OFF)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Staff on Shift</span>
                  <span className="font-bold text-zinc-200">{currentStaffUser?.name || 'Sunil Rao'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Championship Court</span>
                  <span className="font-bold text-emerald-400">Standard Match Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Handover & Operational Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Staff Shift Handover & Security Log
            </h3>

            <form onSubmit={handlePostLog} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newLogMessage}
                onChange={e => setNewLogMessage(e.target.value)}
                placeholder="Log note (e.g., Court swept at 14:00, cash ₹2,400 counted in drawer, paddle grip replaced)..."
                className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {shiftLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200">{log.author}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                        {log.station}
                      </span>
                    </div>
                    <p className="text-zinc-300 mt-1 leading-relaxed">{log.message}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Walk-In Booking Modal */}
      <QuickWalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        defaultSlot={selectedSlotForAction}
      />

      {/* Block Court Modal */}
      <BlockCourtModal
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        defaultSlot={selectedSlotForAction}
      />

      {/* Member Entry QR Modal */}
      <MemberEntryQRModal
        isOpen={isEntryQROpen}
        onClose={() => setIsEntryQROpen(false)}
        initialBookingId={entryQRBookingId}
      />

      {/* Staff Executive Day-End Z-Report Settlement Modal */}
      <DailySettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
      />
    </div>
  );
};
