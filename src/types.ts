export interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'covered';
  surface: string;
  description: string;
  features: string[];
  imageUrl: string;
  hourlyRate: number; // 500
  status: 'active' | 'maintenance';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipId: string;
  skillLevel: string;
  duprRating?: number;
  totalGamesPlayed?: number;
  password?: string;
  avatar?: string;
  walletBalance: number;
  createdAt: string;
}

export interface PaymentDetails {
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'venue' | 'cash' | 'desk';
  transactionId: string;
  amount?: number;
  currency?: string;
  upiId?: string;
  cardLast4?: string;
  bankName?: string;
  paidAt: string;
  status: 'success' | 'pending' | 'failed' | 'completed';
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00"
  durationHours: number; // 1, 1.5, 2, 3
  hourlyRate: number; // 500
  courtFee: number; // durationHours * 500
  addOns: {
    paddles: number; // 50 each
    ballCans: number; // 30 each
    coaching: boolean; // 200/hr
    ballMachine?: boolean; // 150/hr
  };
  addOnsTotal: number;
  totalAmount: number;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  qrCode: string;
  createdAt: string;
  paymentDetails?: PaymentDetails;
  payment?: PaymentDetails;
  notes?: string;
}

export type CafeCategory =
  | 'Artisanal Pizzas'
  | 'Cold Coffees & Iced Brews'
  | 'Hot Coffees & Kaapi'
  | 'Maggi & Fast Bites'
  | 'Mango & Thick Shakes'
  | 'Hydration & Electrolytes'
  | 'Hydration & Coolers'
  | 'Protein Shakes & Bowls'
  | 'Courtside Snacks'
  | 'Chilled Soft Drinks & MRP';

export interface CafeItem {
  id: string;
  name: string;
  category: CafeCategory;
  price: number; // in INR
  mrp?: number; // Maximum Retail Price (MRP)
  description: string;
  calories: number;
  proteinGrams?: number;
  tags: string[];
  imageUrl: string;
  isPopular?: boolean;
  isVeg?: boolean;
  options?: {
    crust?: string[];
    milk?: string[];
    sugarLevel?: string[];
    iceLevel?: string[];
    proteinBoost?: string[];
    extraCheese?: boolean;
  };
}

export interface FaceBiometricProfile {
  staffId: string;
  staffName: string;
  phone: string;
  registeredByPhone: string; // '8146820429' (Master Owner)
  registeredByName: string; // 'Pratish (Master Owner)'
  registeredAt: string; // ISO date
  faceSignatureHash: string; // e.g. 'BIO-8146820429-HEX-9481'
  faceSnapshotUrl?: string; // Captured camera snapshot data URL or avatar
  livenessConfidenceScore: number; // e.g. 99.8
  status: 'active' | 'revoked';
  trustedDevices: string[]; // Authorized devices
  lastScanTime?: string;
  lastDeviceScanned?: string;
}

export interface CartItem {
  cartId: string;
  item: CafeItem;
  quantity: number;
  selectedOptions?: {
    crust?: string;
    milk?: string;
    sugarLevel?: string;
    iceLevel?: string;
    proteinBoost?: string;
    extraCheese?: boolean;
    notes?: string;
  };
}

export interface CafeOrder {
  id: string;
  items: CartItem[];
  totalAmount: number;
  deliveryType: 'court_delivery' | 'table_dining' | 'takeaway' | 'counter_pickup';
  targetCourtId?: string;
  targetCourtName?: string;
  tableNumber?: string;
  estimatedArrival?: string;
  isVerifiedPresence?: boolean;
  verificationNote?: string;
  paymentOption?: 'cash' | 'online';
  customerName: string;
  customerPhone: string;
  status: 'received' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  paymentDetails?: PaymentDetails;
  payment?: PaymentDetails;
  notes?: string;
}

export interface ScheduleBlock {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  durationHours: number;
  reason: string;
  type: 'maintenance' | 'tournament' | 'clinic';
}

export interface SocialMixer {
  id: string;
  title: string;
  courtName: string;
  time: string;
  skillLevel: '2.5 All-Levels' | '3.0 - 3.5 Intermediate' | '4.0+ Advanced DUPR';
  currentPlayers: number;
  maxPlayers: number;
  hostName: string;
  isJoined?: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  brand: string;
  category: 'paddle' | 'balls' | 'machine' | 'eyewear';
  totalStock: number;
  inUse: number;
  rentalPrice: number; // e.g. 50
}

export interface StockItem {
  id: string;
  name: string;
  category: 'kitchen_food' | 'beverages' | 'court_gear' | 'facility';
  currentStock: number;
  unit: string;
  minThreshold: number;
  unitCost: number; // in INR
  supplier: string;
  lastRestocked: string;
  location: string;
  notes?: string;
}

export interface ShiftLog {
  id: string;
  timestamp: string;
  author: string;
  station: 'Front Desk' | 'Cafe KDS' | 'Facility Manager';
  message: string;
  type: 'maintenance' | 'inventory' | 'general';
}

export interface StaffUser {
  staffId: string; // e.g. 'LAGGY-01', 'STAFF-01', 'CHEF-02', 'OWNER-99'
  username?: string; // e.g. 'laggy'
  name: string;
  role: 'court_manager' | 'kitchen_chef' | 'owner';
  roleTitle: string;
  phone: string;
  pin: string; // e.g. 'laggy4532' or PIN
  avatar?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string; // 'pack', 'g', 'ml', 'tbsp', 'tsp', 'cubes', 'scoop', 'slices'
  costEstimate: number; // in INR
  isKeyIngredient?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationSeconds?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  cafeItemId: string;
  title: string;
  category: 'Maggi & Fast Bites' | 'Cold Coffees & Iced Brews' | 'Hot Coffees & Kaapi' | 'Fresh Fruit Shakes' | 'Courtside Bites';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  defaultServings: number;
  difficulty: 'Quick Express' | 'Artisanal Barista' | 'Chef Special';
  costPerServing: number;
  sellingPrice: number;
  dietaryTag: '100% Vegetarian' | 'Jain Friendly' | 'High Energy' | 'Low Calorie';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  chefSecrets: string[];
  allergens: string[];
  equipmentUsed: string[];
  imageUrl: string;
}

export interface StaffNotification {
  id: string;
  type: 'court_booking' | 'cafe_order' | 'water_request' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
  actionDone?: boolean;
  metadata?: {
    bookingId?: string;
    orderId?: string;
    courtName?: string;
    timeSlot?: string;
    memberName?: string;
    memberPhone?: string;
    amount?: number;
    paymentMethod?: string;
    waterType?: string;
    tableNumber?: string;
  };
}

export interface WaterRequest {
  id: string;
  courtId: string;
  courtName: string;
  memberName: string;
  requestType: 'chilled_water' | 'electrolyte_refill' | 'court_towel';
  quantity: number;
  status: 'pending' | 'dispatched' | 'delivered';
  createdAt: string;
  deliveredAt?: string;
  notes?: string;
}
