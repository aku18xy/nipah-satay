export type Category = 'sate' | 'makanan_panas' | 'soto' | 'sarapan_kuih' | 'minuman' | 'combo';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
  minOrder?: number;
  image?: string;
  description: string;
  station: 'grill' | 'wok' | 'prep_bar';
  available: boolean;
  costEstimate: number; // raw cost per unit
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  station: 'grill' | 'wok' | 'prep_bar';
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'dine_in' | 'takeaway' | 'catering' | 'frozen_delivery';
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: 'pending' | 'cooking' | 'ready' | 'completed' | 'cancelled';
  stationStatus: {
    grill: 'pending' | 'grilling' | 'done';
    wok: 'pending' | 'cooking' | 'done';
    prep_bar: 'pending' | 'ready' | 'done';
  };
  paymentMethod: 'cash' | 'duitnow_qr' | 'card' | 'online_unpaid';
  isPaid: boolean;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  completedAt?: string;
}

export interface MeatIntakeRecord {
  id: string;
  date: string;
  supplier: string;
  meatType: 'Ayam (Dada/Paha)' | 'Daging Batang Pinang' | 'Kambing Premium' | 'Perut Lembu';
  grossWeightKg: number;
  trimLossKg: number;
  netWeightKg: number;
  yieldPercent: number;
  targetSticksExpected: number;
  costPerKg: number;
  totalCost: number;
  marinadeBatchCode: string;
  status: 'perap' | 'cucuk' | 'siap_chiller';
}

export interface SkeweringWorkerLog {
  id: string;
  workerName: string;
  date: string;
  shift: 'Pagi' | 'Petang';
  meatType: string;
  sticksCompleted: number;
  ratePerStick: number; // e.g. RM 0.08 per cucuk
  totalEarnings: number;
  qualityCheck: 'Pass' | 'Need Review';
}

export interface ColdStorageInventory {
  ayamRawChiller: number; // sticks
  dagingRawChiller: number; // sticks
  kambingRawChiller: number; // sticks
  perutRawChiller: number; // sticks
  frozenPacks20: number; // 20-stick vac packs
  frozenPacks50: number; // 50-stick vac packs
  kuahKacangLiters: number;
  bambooSkewersLeft: number;
  charcoalBagsLeft: number;
}
