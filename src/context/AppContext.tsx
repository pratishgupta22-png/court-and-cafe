import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Court, CafeItem, Booking, CafeOrder, ScheduleBlock, CartItem, SocialMixer, EquipmentItem, StockItem, ShiftLog, User, PaymentDetails, StaffUser, StaffNotification, WaterRequest, Recipe } from '../types';
import {
  INITIAL_COURTS,
  INITIAL_CAFE_ITEMS,
  INITIAL_BOOKINGS,
  INITIAL_CAFE_ORDERS,
  INITIAL_SCHEDULE_BLOCKS,
  INITIAL_SOCIAL_MIXERS,
  INITIAL_EQUIPMENT,
  INITIAL_STOCK_ITEMS,
  INITIAL_SHIFT_LOGS,
  INITIAL_USERS,
  INITIAL_STAFF_USERS,
  INITIAL_STAFF_NOTIFICATIONS,
  INITIAL_WATER_REQUESTS,
  getTodayDateString,
} from '../data/initialData';
import { INITIAL_RECIPES } from '../data/recipeData';

export interface PaymentConfig {
  title: string;
  amount: number;
  itemDescription: string;
  category: 'court' | 'cafe' | 'wallet';
  bookingPayload?: Omit<Booking, 'id' | 'createdAt' | 'status' | 'qrCode' | 'payment'>;
  cafePayload?: {
    deliveryType: 'court_delivery' | 'counter_pickup';
    targetCourtId?: string;
    targetCourtName?: string;
    notes?: string;
  };
  onSuccess: (details: PaymentDetails) => void;
  onCancel?: () => void;
}

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'order' | 'booking' | 'info';
  timestamp: number;
}

interface AppContextType {
  role: 'member' | 'staff';
  setRole: (role: 'member' | 'staff') => void;
  courts: Court[];
  cafeItems: CafeItem[];
  bookings: Booking[];
  cafeOrders: CafeOrder[];
  scheduleBlocks: ScheduleBlock[];
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  
  // Auth & User Management
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  login: (emailOrPhone: string, password: string) => { success: boolean; message: string };
  register: (userData: { name: string; email: string; phone: string; password: string; skillLevel?: string }) => { success: boolean; message: string };
  logout: () => void;
  resetPassword: (emailOrPhone: string, newPass: string) => { success: boolean; message: string };
  updateCurrentUser: (user: Partial<User>) => void;

  // Payment Modal Gateway
  isPaymentModalOpen: boolean;
  paymentConfig: PaymentConfig | null;
  openPaymentModal: (config: PaymentConfig) => void;
  closePaymentModal: () => void;
  
  // Booking actions
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'qrCode'>, paymentDetails?: PaymentDetails) => Booking;
  cancelBooking: (bookingId: string) => void;
  checkInBooking: (bookingId: string) => void;
  isSlotAvailable: (courtId: string, date: string, startTime: string, durationHours: number) => boolean;
  
  // Cafe actions
  addToCart: (item: CafeItem, quantity?: number, selectedOptions?: CartItem['selectedOptions']) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  placeCafeOrder: (orderData: {
    deliveryType: 'court_delivery' | 'counter_pickup' | 'table_dining' | 'takeaway';
    targetCourtId?: string;
    targetCourtName?: string;
    tableNumber?: string;
    estimatedArrival?: string;
    isVerifiedPresence?: boolean;
    verificationNote?: string;
    paymentOption?: 'cash' | 'online';
    notes?: string;
    paymentDetails?: PaymentDetails;
  }, paymentDetails?: PaymentDetails) => CafeOrder;
  updateCafeOrderStatus: (orderId: string, status: CafeOrder['status']) => void;
  
  // Admin Schedule Block actions
  addScheduleBlock: (block: Omit<ScheduleBlock, 'id'>) => void;
  removeScheduleBlock: (blockId: string) => void;
  
  // Court Lighting Management (Energy Control)
  courtLights: Record<string, boolean>;
  toggleCourtLight: (courtId: string) => void;
  
  // Equipment Rental & Pro Shop Inventory
  equipment: EquipmentItem[];
  checkOutEquipment: (id: string) => void;
  returnEquipment: (id: string) => void;

  // Facility & Kitchen Inventory Sector
  stockItems: StockItem[];
  adjustStockItem: (id: string, delta: number) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  
  // Social Mixers & Open Play Match Finder
  socialMixers: SocialMixer[];
  joinMixer: (id: string) => void;
  createMixer: (mixer: Omit<SocialMixer, 'id' | 'currentPlayers' | 'isJoined'>) => void;
  
  // Staff Shift Logs & Handover
  shiftLogs: ShiftLog[];
  addShiftLog: (message: string, type?: ShiftLog['type'], station?: ShiftLog['station']) => void;
  
  // Member Wallet & Perks
  walletBalance: number;
  topUpWallet: (amount: number, paymentDetails?: PaymentDetails) => void;
  payWithWallet: (amount: number) => boolean;
  
  // Demo simulation
  simulateIncomingOrder: () => void;
  simulateMemberCheckIn: () => void;
  resetToDefaultData: () => void;
  resetAllSalesToZero: () => void;

  // Interconnected Dual-App Portal & Staff Auth
  appPortal: 'member' | 'staff';
  setAppPortal: (portal: 'member' | 'staff') => void;
  isStaffLoggedIn: boolean;
  currentStaffUser: StaffUser | null;
  staffUsers: StaffUser[];
  isStaffLoginModalOpen: boolean;
  setIsStaffLoginModalOpen: (open: boolean) => void;
  staffLogin: (staffId: string, pin: string) => { success: boolean; message: string };
  staffLoginWithFaceId: (staffIdOrUsername: string) => { success: boolean; message: string };
  staffLogout: () => void;

  // Real-Time Staff Messages & Alert Feed
  staffNotifications: StaffNotification[];
  unreadStaffNotifsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissStaffNotification: (id: string) => void;
  markNotificationActionDone: (id: string) => void;

  // Courtside Water & Hydration Service
  waterRequests: WaterRequest[];
  requestWater: (courtId: string, courtName: string, requestType?: WaterRequest['requestType'], quantity?: number, notes?: string) => void;
  updateWaterRequestStatus: (id: string, status: WaterRequest['status']) => void;

  // Kitchen Recipe System & SOPs
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio synthesizer for alert chimes without external mp3
function playChime(type: 'order' | 'success') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'order') {
      // Pleasant double chime (staff order alert)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } else {
      // Booking success chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.55);
    }
  } catch {
    // Ignore audio autoplay restrictions if blocked
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'member' | 'staff'>('member');
  const [appPortal, setAppPortalState] = useState<'member' | 'staff'>('member');

  const setAppPortal = (portal: 'member' | 'staff') => {
    if (portal === 'staff' && !currentStaffUser) {
      setIsStaffLoginModalOpen(true);
      return;
    }
    setAppPortalState(portal);
    setRole(portal);
    localStorage.setItem('court_cafe_app_portal', portal);
  };

  // Staff User Directory & Active Staff Profile - STRICT SECURITY: Always require password
  const [staffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUser | null>(null);
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);

  // Real-Time Staff Alert Messages Feed
  const [staffNotifications, setStaffNotifications] = useState<StaffNotification[]>(() => {
    const saved = localStorage.getItem('court_cafe_staff_notifs');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_STAFF_NOTIFICATIONS;
  });

  // Courtside Water & Hydration Service
  const [waterRequests, setWaterRequests] = useState<WaterRequest[]>(() => {
    const saved = localStorage.getItem('court_cafe_water_reqs');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_WATER_REQUESTS;
  });

  // Kitchen Recipe Book & SOPs
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('court_cafe_recipes');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_RECIPES;
  });

  // Facility & Kitchen Stock Inventory Sector
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('court_cafe_stock_items');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_STOCK_ITEMS;
  });

  // Registered Users Directory (stored in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('court_cafe_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('court_cafe_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_USERS[0]; // Default logged in as member Pratish Gupta for seamless preview
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Payment Modal Gateway State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  const [courts] = useState<Court[]>(INITIAL_COURTS);
  const [cafeItems] = useState<CafeItem[]>(INITIAL_CAFE_ITEMS);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('court_cafe_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_BOOKINGS;
  });

  const [cafeOrders, setCafeOrders] = useState<CafeOrder[]>(() => {
    const saved = localStorage.getItem('court_cafe_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_CAFE_ORDERS;
  });

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(() => {
    const saved = localStorage.getItem('court_cafe_blocks');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SCHEDULE_BLOCKS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('court_cafe_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [courtLights, setCourtLights] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('court_cafe_lights');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { 'court-1': true };
  });

  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem('court_cafe_equipment');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_EQUIPMENT;
  });

  const [socialMixers, setSocialMixers] = useState<SocialMixer[]>(() => {
    const saved = localStorage.getItem('court_cafe_mixers');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SOCIAL_MIXERS;
  });

  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>(() => {
    const saved = localStorage.getItem('court_cafe_shift_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SHIFT_LOGS;
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    if (currentUser?.walletBalance !== undefined) return currentUser.walletBalance;
    const saved = localStorage.getItem('court_cafe_wallet');
    if (saved) {
      try { return Number(saved); } catch { /* ignore */ }
    }
    return 1500;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('court_cafe_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('court_cafe_accounts', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('court_cafe_active_user', JSON.stringify(currentUser));
      localStorage.setItem('court_cafe_user', JSON.stringify(currentUser));
      setWalletBalance(currentUser.walletBalance || 0);
    } else {
      localStorage.removeItem('court_cafe_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('court_cafe_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('court_cafe_orders', JSON.stringify(cafeOrders));
  }, [cafeOrders]);

  useEffect(() => {
    localStorage.setItem('court_cafe_blocks', JSON.stringify(scheduleBlocks));
  }, [scheduleBlocks]);

  useEffect(() => {
    localStorage.setItem('court_cafe_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('court_cafe_lights', JSON.stringify(courtLights));
  }, [courtLights]);

  useEffect(() => {
    localStorage.setItem('court_cafe_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('court_cafe_mixers', JSON.stringify(socialMixers));
  }, [socialMixers]);

  useEffect(() => {
    localStorage.setItem('court_cafe_shift_logs', JSON.stringify(shiftLogs));
  }, [shiftLogs]);

  useEffect(() => {
    localStorage.setItem('court_cafe_wallet', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    if (currentStaffUser) {
      localStorage.setItem('court_cafe_active_staff', JSON.stringify(currentStaffUser));
    } else {
      localStorage.removeItem('court_cafe_active_staff');
    }
  }, [currentStaffUser]);

  useEffect(() => {
    localStorage.setItem('court_cafe_staff_notifs', JSON.stringify(staffNotifications));
  }, [staffNotifications]);

  useEffect(() => {
    localStorage.setItem('court_cafe_water_reqs', JSON.stringify(waterRequests));
  }, [waterRequests]);

  useEffect(() => {
    localStorage.setItem('court_cafe_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('court_cafe_stock_items', JSON.stringify(stockItems));
  }, [stockItems]);

  const addToast = useCallback((title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const toast: ToastNotification = { id, title, message, type, timestamp: Date.now() };
    setToasts(prev => [toast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Operations
  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (emailOrPhone: string, pass: string): { success: boolean; message: string } => {
    const cleaned = emailOrPhone.trim().toLowerCase();
    const phoneDigits = emailOrPhone.replace(/\D/g, '');

    const user = registeredUsers.find(u =>
      u.email.toLowerCase() === cleaned ||
      u.phone.replace(/\D/g, '').endsWith(phoneDigits.slice(-10))
    );

    if (!user) {
      return { success: false, message: 'No account found with this email or mobile number.' };
    }

    if (user.password && user.password !== pass) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(user);
    setIsAuthModalOpen(false);
    playChime('success');
    addToast('Welcome Back, ' + user.name + '!', `Logged into The Dinking Room Club Pass.`, 'success');
    return { success: true, message: 'Signed in successfully.' };
  };

  const register = (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    skillLevel?: string;
  }): { success: boolean; message: string } => {
    const emailClean = userData.email.trim().toLowerCase();
    const phoneClean = userData.phone.trim();
    const phoneDigits = phoneClean.replace(/\D/g, '');

    // Check collision
    const existing = registeredUsers.find(
      u => u.email.toLowerCase() === emailClean || (phoneDigits && u.phone.replace(/\D/g, '').endsWith(phoneDigits.slice(-10)))
    );

    if (existing) {
      return { success: false, message: 'An account with this email or phone already exists. Please log in.' };
    }

    const membershipId = 'DK-' + Math.floor(1000 + Math.random() * 9000);
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: userData.name.trim(),
      email: emailClean,
      phone: phoneClean.startsWith('+91') ? phoneClean : `+91 ${phoneClean}`,
      password: userData.password,
      membershipId,
      skillLevel: userData.skillLevel || '3.0 Intermediate',
      duprRating: 3.25,
      walletBalance: 100, // Welcome Joining Credit of ₹100!
      totalGamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    playChime('success');
    addToast(
      'Account Created! 🎉',
      `Welcome to Court & Cafe, ${newUser.name}! ₹100 welcome court credit added to your wallet.`,
      'success'
    );
    return { success: true, message: 'Account registered successfully.' };
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  const resetPassword = (emailOrPhone: string, newPass: string): { success: boolean; message: string } => {
    const cleaned = emailOrPhone.trim().toLowerCase();
    const phoneDigits = emailOrPhone.replace(/\D/g, '');

    const userIndex = registeredUsers.findIndex(u =>
      u.email.toLowerCase() === cleaned ||
      u.phone.replace(/\D/g, '').endsWith(phoneDigits.slice(-10))
    );

    if (userIndex === -1) {
      return { success: false, message: 'Account not found. Please verify details.' };
    }

    const updated = [...registeredUsers];
    updated[userIndex] = { ...updated[userIndex], password: newPass };
    setRegisteredUsers(updated);
    if (currentUser?.id === updated[userIndex].id) {
      setCurrentUser(updated[userIndex]);
    }
    addToast('Password Updated', 'Your security password has been reset. You can now log in.', 'success');
    return { success: true, message: 'Password updated successfully.' };
  };

  const updateCurrentUser = (user: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...user };
    setCurrentUser(updated);
    setRegisteredUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    addToast('Profile Updated', 'Your profile details have been saved.', 'info');
  };

  // Staff Authentication & Session
  const staffLogin = (staffIdOrUsername: string, pin: string): { success: boolean; message: string } => {
    const rawIdentifier = staffIdOrUsername.trim();
    const cleanIdentifier = rawIdentifier.toLowerCase().replace(/[\s\-\+]/g, '');
    const cleanPin = pin.trim();

    const staffMember = staffUsers.find(s => {
      const u = (s.username || '').toLowerCase().replace(/[\s\-\+]/g, '');
      const id = s.staffId.toLowerCase().replace(/[\s\-\+]/g, '');
      const ph = s.phone.replace(/[\s\-\+]/g, '');
      const name = s.name.toLowerCase();

      return (
        u === cleanIdentifier ||
        id === cleanIdentifier ||
        ph === cleanIdentifier ||
        (cleanIdentifier.length >= 10 && ph.endsWith(cleanIdentifier)) ||
        (cleanIdentifier.includes('pratish') && name.includes('pratish')) ||
        (cleanIdentifier.includes('8146820429') && (ph.includes('8146820429') || u.includes('8146820429')))
      );
    });

    if (!staffMember) {
      return {
        success: false,
        message: `Staff Username, Phone, or Employee ID "${rawIdentifier}" not recognized.`,
      };
    }

    // Flexible pin check (supports with or without trailing colon)
    const pinClean = cleanPin.replace(/:$/, '');
    const staffPinClean = staffMember.pin.replace(/:$/, '');
    const pinMatches = staffMember.pin === cleanPin || staffPinClean === pinClean;

    if (!pinMatches) {
      return { success: false, message: 'Incorrect Staff Password / PIN. Please try again.' };
    }

    setCurrentStaffUser(staffMember);
    setIsStaffLoginModalOpen(false);
    setAppPortalState('staff');
    setRole('staff');
    localStorage.setItem('court_cafe_app_portal', 'staff');
    playChime('success');
    addToast(
      `Welcome, ${staffMember.name}!`,
      `Authorized as ${staffMember.roleTitle} (${staffMember.staffId}).`,
      'success'
    );
    return { success: true, message: 'Staff credentials verified.' };
  };

  const staffLoginWithFaceId = (staffIdOrUsername: string): { success: boolean; message: string } => {
    const rawIdentifier = staffIdOrUsername.trim();
    const cleanIdentifier = rawIdentifier.toLowerCase().replace(/[\s\-\+]/g, '');

    const staffMember = staffUsers.find(s => {
      const u = (s.username || '').toLowerCase().replace(/[\s\-\+]/g, '');
      const id = s.staffId.toLowerCase().replace(/[\s\-\+]/g, '');
      const ph = s.phone.replace(/[\s\-\+]/g, '');
      const name = s.name.toLowerCase();

      return (
        u === cleanIdentifier ||
        id === cleanIdentifier ||
        ph === cleanIdentifier ||
        (cleanIdentifier.length >= 10 && ph.endsWith(cleanIdentifier)) ||
        (cleanIdentifier.includes('pratish') && name.includes('pratish')) ||
        (cleanIdentifier.includes('8146820429') && (ph.includes('8146820429') || u.includes('8146820429')))
      );
    });

    if (!staffMember) {
      return { success: false, message: 'Staff biometric profile not recognized. Please use password.' };
    }

    setCurrentStaffUser(staffMember);
    setIsStaffLoginModalOpen(false);
    setAppPortalState('staff');
    setRole('staff');
    localStorage.setItem('court_cafe_app_portal', 'staff');
    playChime('success');
    addToast(
      `Face ID Verified: ${staffMember.name}`,
      `Biometric authentication approved • Authorized as ${staffMember.roleTitle}.`,
      'success'
    );
    return { success: true, message: 'Face ID verified successfully.' };
  };

  const staffLogout = () => {
    setCurrentStaffUser(null);
    setAppPortalState('member');
    setRole('member');
    localStorage.setItem('court_cafe_app_portal', 'member');
    localStorage.removeItem('court_cafe_active_staff');
    addToast('Staff Console Locked', 'Logged out. Staff password required to re-enter.', 'info');
  };

  // Staff Real-Time Message Center
  const markNotificationAsRead = (id: string) => {
    setStaffNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setStaffNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('Notifications Cleared', 'All staff notifications marked as read.', 'info');
  };

  const dismissStaffNotification = (id: string) => {
    setStaffNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationActionDone = (id: string) => {
    setStaffNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, actionDone: true, isRead: true } : n))
    );
    playChime('success');
    addToast('Task Marked Done', 'Staff acknowledged and fulfilled action item.', 'success');
  };

  // Courtside Hydration & Towel Dispatch
  const requestWater = (
    courtId: string,
    courtName: string,
    requestType: WaterRequest['requestType'] = 'chilled_water',
    quantity: number = 2,
    notes: string = ''
  ) => {
    const reqId = 'WR-' + Math.floor(1000 + Math.random() * 9000);
    const newReq: WaterRequest = {
      id: reqId,
      courtId,
      courtName,
      memberName: currentUser?.name || 'Club Member',
      requestType,
      quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes,
    };
    setWaterRequests(prev => [newReq, ...prev]);
    playChime('order');
    const label = requestType === 'chilled_water' ? 'Chilled Mineral Water' : requestType === 'electrolyte_refill' ? 'Electrolyte Hydration Flask' : 'Fresh Court Towels';
    addToast(
      'Courtside Service Requested! 💧',
      `${quantity}x ${label} requested for ${courtName}. Front desk alerted!`,
      'success'
    );

    // Instant message to staff
    const notif: StaffNotification = {
      id: 'notif-' + Date.now(),
      type: 'water_request',
      title: `💧 Courtside Hydration: ${courtName}`,
      message: `${currentUser?.name || 'Player'} on ${courtName} requested ${quantity}x ${label}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionRequired: true,
      actionDone: false,
      metadata: {
        courtName,
        memberName: currentUser?.name || 'Club Member',
        waterType: `${quantity}x ${label}`,
      },
    };
    setStaffNotifications(prev => [notif, ...prev]);
  };

  const updateWaterRequestStatus = (id: string, status: WaterRequest['status']) => {
    setWaterRequests(prev =>
      prev.map(w => (w.id === id ? { ...w, status, deliveredAt: status === 'delivered' ? new Date().toISOString() : w.deliveredAt } : w))
    );
    playChime('success');
    addToast('Courtside Service Updated', `Water request #${id} marked as ${status}.`, 'info');
  };

  // Payment Gateway Modal Triggers
  const openPaymentModal = (config: PaymentConfig) => {
    setPaymentConfig(config);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (paymentConfig?.onCancel) {
      paymentConfig.onCancel();
    }
    setIsPaymentModalOpen(false);
    setPaymentConfig(null);
  };

  // Check if a slot is available
  const isSlotAvailable = useCallback((
    courtId: string,
    date: string,
    startTime: string,
    durationHours: number
  ): boolean => {
    const startHour = parseFloat(startTime.split(':')[0]) + (parseFloat(startTime.split(':')[1]) || 0) / 60;
    const endHour = startHour + durationHours;

    // Check existing confirmed/checked-in bookings
    for (const b of bookings) {
      if (b.courtId === courtId && b.date === date && b.status !== 'cancelled') {
        const bStart = parseFloat(b.startTime.split(':')[0]) + (parseFloat(b.startTime.split(':')[1]) || 0) / 60;
        const bEnd = bStart + b.durationHours;
        if (startHour < bEnd && endHour > bStart) {
          return false;
        }
      }
    }

    // Check maintenance or blocked slots
    for (const block of scheduleBlocks) {
      if (block.courtId === courtId && block.date === date) {
        const blockStart = parseFloat(block.startTime.split(':')[0]) + (parseFloat(block.startTime.split(':')[1]) || 0) / 60;
        const blockEnd = blockStart + block.durationHours;
        if (startHour < blockEnd && endHour > blockStart) {
          return false;
        }
      }
    }

    return true;
  }, [bookings, scheduleBlocks]);

  // Create booking
  const createBooking = (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'qrCode'>,
    paymentDetails?: PaymentDetails
  ): Booking => {
    const id = 'PB-' + Math.floor(1000 + Math.random() * 9000);
    const qrCode = `CENTER-${id}-PASS`;
    const resolvedPayment = paymentDetails || bookingData.paymentDetails;
    const newBooking: Booking = {
      ...bookingData,
      id,
      status: 'confirmed',
      qrCode,
      payment: resolvedPayment,
      paymentDetails: resolvedPayment,
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);
    playChime('success');
    addToast(
      'Court Reserved!',
      `${newBooking.courtName} confirmed for ${newBooking.startTime} (${newBooking.durationHours === 0.5 ? '30 mins' : `${newBooking.durationHours} hr`}) • ₹${newBooking.totalAmount}`,
      'booking'
    );

    // Instant real-time message notification for Staff & Owner Console
    const isPayDesk = resolvedPayment?.method === 'desk' || resolvedPayment?.method === 'cash' || newBooking.notes?.includes('Cash') || newBooking.notes?.includes('DESK');
    const staffNotif: StaffNotification = {
      id: 'notif-' + Date.now(),
      type: 'court_booking',
      title: `🎾 New Booking: ${newBooking.courtName}`,
      message: `${newBooking.memberName} (${newBooking.memberPhone}) reserved ${newBooking.courtName} for ${newBooking.startTime} (${newBooking.durationHours === 0.5 ? '30 Mins' : `${newBooking.durationHours} Hr`}). Payment: ${isPayDesk ? `💵 Collect Cash ₹${newBooking.totalAmount} at Desk` : `💳 Paid Online (₹${newBooking.totalAmount})`}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionRequired: true,
      actionDone: false,
      metadata: {
        bookingId: newBooking.id,
        courtName: newBooking.courtName,
        timeSlot: `${newBooking.startTime} (${newBooking.durationHours === 0.5 ? '30 mins' : `${newBooking.durationHours} hr`})`,
        memberName: newBooking.memberName,
        memberPhone: newBooking.memberPhone,
        amount: newBooking.totalAmount,
        paymentMethod: resolvedPayment?.method || (isPayDesk ? 'desk' : 'upi'),
      },
    };
    setStaffNotifications(prev => [staffNotif, ...prev]);
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );
    addToast('Booking Cancelled', `Reservation #${bookingId} has been released.`, 'info');
  };

  const checkInBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'checked-in' as const } : b))
    );
    playChime('success');
    addToast('Member Checked In', `Court access pass verified for Booking #${bookingId}.`, 'success');
  };

  // Cart actions
  const addToCart = (item: CafeItem, quantity = 1, selectedOptions?: CartItem['selectedOptions']) => {
    const cartId = item.id + '-' + (selectedOptions?.crust || '') + '-' + (selectedOptions?.milk || '') + '-' + (selectedOptions?.sugarLevel || '') + '-' + (selectedOptions?.iceLevel || '');
    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { cartId, item, quantity, selectedOptions }];
    });
    addToast('Added to Refreshment Tray', `${item.name} (₹${item.price}) added.`, 'order');
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateCartQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(prev =>
      prev.map(i => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Place Cafe Order
  const placeCafeOrder = (orderData: {
    deliveryType: 'court_delivery' | 'counter_pickup' | 'table_dining' | 'takeaway';
    targetCourtId?: string;
    targetCourtName?: string;
    tableNumber?: string;
    estimatedArrival?: string;
    isVerifiedPresence?: boolean;
    verificationNote?: string;
    paymentOption?: 'cash' | 'online';
    notes?: string;
    paymentDetails?: PaymentDetails;
  }, paymentDetailsParam?: PaymentDetails): CafeOrder => {
    const totalAmount = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
    const orderId = 'CF-' + Math.floor(100 + Math.random() * 900);
    const resolvedPayment = orderData.paymentDetails || paymentDetailsParam;
    const newOrder: CafeOrder = {
      id: orderId,
      items: [...cart],
      totalAmount,
      deliveryType: orderData.deliveryType,
      targetCourtId: orderData.targetCourtId || 'court-1',
      targetCourtName: orderData.targetCourtName || 'The Center Court',
      tableNumber: orderData.tableNumber,
      estimatedArrival: orderData.estimatedArrival,
      isVerifiedPresence: orderData.isVerifiedPresence ?? true,
      verificationNote: orderData.verificationNote,
      paymentOption: orderData.paymentOption || (resolvedPayment?.method === 'desk' ? 'cash' : 'online'),
      customerName: currentUser?.name || 'Club Member',
      customerPhone: currentUser?.phone || '+91 98450 67123',
      payment: resolvedPayment,
      paymentDetails: resolvedPayment,
      status: 'received',
      createdAt: new Date().toISOString(),
      notes: orderData.notes,
    };

    setCafeOrders(prev => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    playChime('order');

    let dest = 'Ready for pickup at cafe counter';
    if (orderData.deliveryType === 'court_delivery') {
      dest = 'Dispatched to The Center Court bench (Verified Courtside)';
    } else if (orderData.deliveryType === 'table_dining') {
      dest = `Serving to Table #${orderData.tableNumber || '1'} (Seated Dining)`;
    } else if (orderData.deliveryType === 'takeaway') {
      dest = `Packed for takeaway (Arrival: ${orderData.estimatedArrival || '10-15 mins'})`;
    }

    const payNote = orderData.paymentOption === 'cash' || resolvedPayment?.method === 'desk'
      ? 'Pay with Cash on arrival'
      : 'Paid online';

    addToast(
      'Order Placed! 🍕☕',
      `Order #${orderId} (₹${totalAmount}) confirmed • ${payNote}. ${dest}.`,
      'order'
    );

    // Instant real-time message notification for Staff & Owner Console
    const staffNotif: StaffNotification = {
      id: 'notif-' + Date.now(),
      type: 'cafe_order',
      title: `🍕 New Kitchen Order #${orderId}`,
      message: `${newOrder.customerName}: ${newOrder.items.length} item(s) for ${newOrder.deliveryType === 'court_delivery' ? newOrder.targetCourtName || 'Court Bench' : newOrder.deliveryType === 'table_dining' ? `Table #${newOrder.tableNumber || '1'}` : 'Takeaway'}. Amount: ₹${totalAmount} (${newOrder.paymentOption === 'cash' ? '💵 Cash on delivery' : '💳 Paid online'}).`,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionRequired: true,
      actionDone: false,
      metadata: {
        orderId: newOrder.id,
        courtName: newOrder.targetCourtName,
        tableNumber: newOrder.tableNumber,
        amount: totalAmount,
        paymentMethod: newOrder.paymentOption,
      },
    };
    setStaffNotifications(prev => [staffNotif, ...prev]);

    return newOrder;
  };

  const updateCafeOrderStatus = (orderId: string, status: CafeOrder['status']) => {
    setCafeOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    playChime('order');
    const statusLabels = {
      received: 'Received by Kitchen',
      preparing: 'Now Preparing in Cafe',
      ready: 'Ready for Delivery/Pickup',
      delivered: 'Completed & Delivered',
    };
    addToast('Kitchen Status Updated', `Order #${orderId} is now ${statusLabels[status]}.`, 'order');
  };

  // Block management
  const addScheduleBlock = (block: Omit<ScheduleBlock, 'id'>) => {
    const id = 'block-' + Date.now();
    const newBlock: ScheduleBlock = { ...block, id };
    setScheduleBlocks(prev => [...prev, newBlock]);
    addToast('Court Schedule Blocked', `${block.reason} scheduled for ${block.startTime}.`, 'info');
  };

  const removeScheduleBlock = (blockId: string) => {
    setScheduleBlocks(prev => prev.filter(b => b.id !== blockId));
    addToast('Block Removed', 'Court slot has been unblocked and is now open for booking.', 'success');
  };

  // Real-time simulations for testing
  const simulateIncomingOrder = () => {
    const randomCourt = courts[Math.floor(Math.random() * courts.length)];
    const randomItems: CartItem[] = [
      {
        cartId: 'sim-1',
        item: cafeItems[Math.floor(Math.random() * cafeItems.length)],
        quantity: 2,
      },
      {
        cartId: 'sim-2',
        item: cafeItems[Math.floor(Math.random() * cafeItems.length)],
        quantity: 1,
      },
    ];
    const total = randomItems.reduce((acc, i) => acc + i.item.price * i.quantity, 0);
    const names = ['Arjun Kapoor', 'Pooja Hegde', 'Rohan Varma', 'Zoya Akhtar', 'Tanmay Bhat'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const orderId = 'CF-' + Math.floor(100 + Math.random() * 900);

    const simOrder: CafeOrder = {
      id: orderId,
      items: randomItems,
      totalAmount: total,
      deliveryType: 'court_delivery',
      targetCourtId: randomCourt.id,
      targetCourtName: randomCourt.name,
      customerName: randomName,
      customerPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      status: 'received',
      createdAt: new Date().toISOString(),
      notes: `Deliver to ${randomCourt.name} bench`,
    };

    setCafeOrders(prev => [simOrder, ...prev]);
    playChime('order');
    addToast('🔔 Live Cafe Order Received!', `${randomName} ordered refreshments to ${randomCourt.name} (₹${total})`, 'order');
  };

  const simulateMemberCheckIn = () => {
    const unconfirmed = bookings.find(b => b.status === 'confirmed');
    if (unconfirmed) {
      checkInBooking(unconfirmed.id);
    } else {
      addToast('No Pending Bookings', 'All current reservations are already checked in or completed.', 'info');
    }
  };

  // Court Light Control
  const toggleCourtLight = (courtId: string) => {
    setCourtLights(prev => {
      const nextState = !prev[courtId];
      const courtName = courts.find(c => c.id === courtId)?.name || 'Court';
      addToast(
        nextState ? 'Floodlights Activated' : 'Floodlights Deactivated',
        `High-lux LED illumination for ${courtName} turned ${nextState ? 'ON' : 'OFF'}.`,
        'info'
      );
      return { ...prev, [courtId]: nextState };
    });
  };

  // Equipment Checkout & Return
  const checkOutEquipment = (id: string) => {
    setEquipment(prev =>
      prev.map(item => {
        if (item.id === id) {
          if (item.inUse >= item.totalStock) {
            addToast('Out of Stock', `All ${item.name} units are currently rented out.`, 'info');
            return item;
          }
          addToast('Equipment Rented', `Checked out 1x ${item.name} for member.`, 'success');
          return { ...item, inUse: item.inUse + 1 };
        }
        return item;
      })
    );
  };

  const returnEquipment = (id: string) => {
    setEquipment(prev =>
      prev.map(item => {
        if (item.id === id) {
          if (item.inUse <= 0) return item;
          addToast('Equipment Returned', `Returned 1x ${item.name} to equipment rack.`, 'info');
          return { ...item, inUse: item.inUse - 1 };
        }
        return item;
      })
    );
  };

  // Social Mixers
  const joinMixer = (id: string) => {
    setSocialMixers(prev =>
      prev.map(m => {
        if (m.id === id) {
          const joined = !m.isJoined;
          if (joined && m.currentPlayers >= m.maxPlayers) {
            addToast('Mixer Full', 'This session is currently at capacity.', 'info');
            return m;
          }
          const nextCount = joined ? m.currentPlayers + 1 : Math.max(1, m.currentPlayers - 1);
          playChime(joined ? 'success' : 'order');
          addToast(
            joined ? 'RSVP Confirmed!' : 'Left Mixer',
            joined ? `You joined "${m.title}". See you on ${m.courtName}!` : `Removed from "${m.title}".`,
            'booking'
          );
          return { ...m, isJoined: joined, currentPlayers: nextCount };
        }
        return m;
      })
    );
  };

  const createMixer = (mixerData: Omit<SocialMixer, 'id' | 'currentPlayers' | 'isJoined'>) => {
    const newMixer: SocialMixer = {
      ...mixerData,
      id: 'mix-' + Date.now(),
      currentPlayers: 1,
      isJoined: true,
    };
    setSocialMixers(prev => [newMixer, ...prev]);
    playChime('success');
    addToast('Open Play Mixer Posted!', `Your game "${newMixer.title}" is live for members to join.`, 'booking');
  };

  // Shift Logs
  const addShiftLog = (
    message: string,
    type: ShiftLog['type'] = 'general',
    station: ShiftLog['station'] = 'Front Desk'
  ) => {
    const newLog: ShiftLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: currentUser?.name || 'Club Desk',
      station,
      message,
      type,
    };
    setShiftLogs(prev => [newLog, ...prev]);
    addToast('Shift Note Logged', 'Staff handover board has been updated.', 'info');
  };

  // Member Wallet
  const topUpWallet = (amount: number, paymentDetails?: PaymentDetails) => {
    setWalletBalance(prev => {
      const next = prev + amount;
      if (currentUser) {
        updateCurrentUser({ walletBalance: next });
      }
      return next;
    });
    playChime('success');
    addToast(
      'Wallet Recharged! 💳',
      `₹${amount} added successfully via ${paymentDetails?.method ? paymentDetails.method.toUpperCase() : 'UPI/Card'}. Balance: ₹${walletBalance + amount}.`,
      'success'
    );
  };

  const payWithWallet = (amount: number): boolean => {
    if (walletBalance < amount) {
      addToast('Insufficient Wallet Balance', `Requires ₹${amount}. Current balance: ₹${walletBalance}.`, 'info');
      return false;
    }
    setWalletBalance(prev => {
      const next = prev - amount;
      if (currentUser) {
        updateCurrentUser({ walletBalance: next });
      }
      return next;
    });
    return true;
  };

  // Recipe Management Functions
  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const id = 'recipe-' + Date.now();
    const newRecipe: Recipe = { ...recipeData, id };
    setRecipes(prev => [newRecipe, ...prev]);
    addToast('Recipe Added', `"${newRecipe.title}" added to kitchen SOPs.`, 'success');
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    addToast('Recipe Updated', 'SOP instructions and ingredients saved.', 'info');
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    addToast('Recipe Removed', 'Recipe deleted from kitchen database.', 'info');
  };

  // Stock Inventory Management Functions
  const adjustStockItem = (id: string, delta: number) => {
    setStockItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStock = Math.max(0, Number((item.currentStock + delta).toFixed(1)));
          return {
            ...item,
            currentStock: nextStock,
            lastRestocked: delta > 0 ? 'Just now' : item.lastRestocked,
          };
        }
        return item;
      })
    );
    if (delta > 0) {
      playChime('success');
      addToast('Stock Replenished', `Added +${delta} to inventory stock.`, 'success');
    } else {
      addToast('Stock Adjusted', `Deducted ${Math.abs(delta)} units.`, 'info');
    }
  };

  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: 'stock-' + Date.now(),
    };
    setStockItems(prev => [newItem, ...prev]);
    playChime('success');
    addToast('Inventory Item Created', `Added "${newItem.name}" to inventory tracking.`, 'success');
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStockItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    addToast('Stock Record Updated', 'Inventory details saved.', 'info');
  };

  const deleteStockItem = (id: string) => {
    setStockItems(prev => prev.filter(item => item.id !== id));
    addToast('Item Removed', 'Inventory item deleted.', 'info');
  };

  const resetToDefaultData = () => {
    setBookings(INITIAL_BOOKINGS);
    setCafeOrders(INITIAL_CAFE_ORDERS);
    setScheduleBlocks(INITIAL_SCHEDULE_BLOCKS);
    setEquipment(INITIAL_EQUIPMENT);
    setStockItems(INITIAL_STOCK_ITEMS);
    setSocialMixers(INITIAL_SOCIAL_MIXERS);
    setShiftLogs(INITIAL_SHIFT_LOGS);
    setCourtLights({ 'court-1': true });
    setWalletBalance(1500);
    setCart([]);
    addToast('Data Reset', 'Restored pristine court schedules, cafe orders, and facility state.', 'info');
  };

  const resetAllSalesToZero = () => {
    setBookings([]);
    setCafeOrders([]);
    setStaffNotifications([]);
    setWaterRequests([]);
    localStorage.setItem('court_cafe_bookings', JSON.stringify([]));
    localStorage.setItem('court_cafe_orders', JSON.stringify([]));
    localStorage.setItem('court_cafe_staff_notifs', JSON.stringify([]));
    localStorage.setItem('court_cafe_water_reqs', JSON.stringify([]));
    addToast('Sales Zeroed Out', 'All bookings, cafe orders, and sales figures reset to ₹0 for fresh live start.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        courts,
        cafeItems,
        bookings,
        cafeOrders,
        scheduleBlocks,
        cart,
        isCartOpen,
        setIsCartOpen,
        toasts,
        dismissToast,
        addToast,
        currentUser,
        isLoggedIn: !!currentUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        resetPassword,
        updateCurrentUser,
        isPaymentModalOpen,
        paymentConfig,
        openPaymentModal,
        closePaymentModal,
        createBooking,
        cancelBooking,
        checkInBooking,
        isSlotAvailable,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeCafeOrder,
        updateCafeOrderStatus,
        addScheduleBlock,
        removeScheduleBlock,
        courtLights,
        toggleCourtLight,
        equipment,
        checkOutEquipment,
        returnEquipment,
        socialMixers,
        joinMixer,
        createMixer,
        shiftLogs,
        addShiftLog,
        walletBalance,
        topUpWallet,
        payWithWallet,
        simulateIncomingOrder,
        simulateMemberCheckIn,
        resetToDefaultData,
        resetAllSalesToZero,
        appPortal,
        setAppPortal,
        isStaffLoggedIn: !!currentStaffUser,
        currentStaffUser,
        staffUsers,
        isStaffLoginModalOpen,
        setIsStaffLoginModalOpen,
        staffLogin,
        staffLoginWithFaceId,
        staffLogout,
        staffNotifications,
        unreadStaffNotifsCount: staffNotifications.filter(n => !n.isRead).length,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissStaffNotification,
        markNotificationActionDone,
        waterRequests,
        requestWater,
        updateWaterRequestStatus,
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        stockItems,
        adjustStockItem,
        addStockItem,
        updateStockItem,
        deleteStockItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
