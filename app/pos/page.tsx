'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Flame, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Printer, 
  Check, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Utensils, 
  Receipt,
  ArrowLeft,
  Send,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Pin,
  PinOff
} from 'lucide-react';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '@/lib/data';
import { MenuItem, Category, OrderItem, Order } from '@/lib/types';

// Senarai Meja Restoran Nipah Satay (Format Minimalis)
const RESTAURANT_TABLES = [
  { id: 'M-01', name: 'Meja 1', short: 'M1' },
  { id: 'M-02', name: 'Meja 2', short: 'M2' },
  { id: 'M-03', name: 'Meja 3', short: 'M3' },
  { id: 'M-04', name: 'Meja 4', short: 'M4' },
  { id: 'M-05', name: 'Meja 5', short: 'M5' },
  { id: 'M-06', name: 'Meja 6', short: 'M6' },
  { id: 'M-07', name: 'Meja 7', short: 'M7' },
  { id: 'M-08', name: 'Meja 8', short: 'M8' },
  { id: 'M-09', name: 'Meja 9', short: 'M9' },
  { id: 'M-10', name: 'Meja 10', short: 'M10' },
  { id: 'M-11', name: 'Meja 11', short: 'M11' },
  { id: 'M-12', name: 'Meja 12', short: 'M12' },
  { id: 'VIP-1', name: 'VIP', short: 'VIP' },
];

// Helper pemetaan ikon makanan Nipah Satay (format lakaran kotak ikon)
function getItemDisplayIcon(item: MenuItem): { emoji: string; accentColor: string } {
  const name = item.name.toLowerCase();
  
  if (name.includes('ayam')) return { emoji: '🐔', accentColor: 'text-amber-400' };
  if (name.includes('daging') || name.includes('lembu')) return { emoji: '🥩', accentColor: 'text-red-400' };
  if (name.includes('kambing')) return { emoji: '🐐', accentColor: 'text-orange-400' };
  if (name.includes('perut') || name.includes('babat')) return { emoji: '🍢', accentColor: 'text-yellow-400' };
  if (name.includes('ketupat')) return { emoji: '🍙', accentColor: 'text-emerald-400' };
  if (name.includes('soto') || name.includes('sup')) return { emoji: '🍲', accentColor: 'text-amber-400' };
  if (name.includes('mee') || name.includes('mihun') || name.includes('bihun')) return { emoji: '🍜', accentColor: 'text-yellow-400' };
  if (name.includes('nasi lemak') || name.includes('set santai')) return { emoji: '🍛', accentColor: 'text-emerald-400' };
  if (name.includes('karipap')) return { emoji: '🥟', accentColor: 'text-amber-400' };
  if (name.includes('lai chee kang') || name.includes('lck')) return { emoji: '🍧', accentColor: 'text-rose-400' };
  if (name.includes('teh')) return { emoji: '🫖', accentColor: 'text-amber-400' };
  if (name.includes('kopi') || name.includes('nescafe')) return { emoji: '☕', accentColor: 'text-amber-600' };
  if (name.includes('milo') || name.includes('horlicks') || name.includes('neslo')) return { emoji: '🍫', accentColor: 'text-amber-500' };
  if (name.includes('limau') || name.includes('lemon')) return { emoji: '🍋', accentColor: 'text-yellow-400' };
  if (name.includes('laici')) return { emoji: '🍒', accentColor: 'text-pink-400' };
  if (name.includes('barli')) return { emoji: '🌾', accentColor: 'text-amber-300' };
  if (name.includes('sirap')) return { emoji: '🧃', accentColor: 'text-rose-400' };
  if (name.includes('coke') || name.includes('100 plus') || name.includes('soya')) return { emoji: '🥫', accentColor: 'text-blue-400' };
  if (name.includes('ais') || name.includes('mineral')) return { emoji: '🧊', accentColor: 'text-cyan-400' };
  if (item.category === 'minuman') return { emoji: '🥤', accentColor: 'text-sky-400' };
  return { emoji: '🍢', accentColor: 'text-orange-400' };
}

// Kategori POS Minimalis
const POS_CATEGORIES = [
  { id: 'all', label: 'Semua', icon: '🔥' },
  { id: 'sate', label: 'Sate', icon: '🍢' },
  { id: 'istimewa', label: 'Sup/Mee', icon: '🍲' },
  { id: 'santai', label: 'Nasi', icon: '🍙' },
  { id: 'karipap', label: 'Karipap', icon: '🥟' },
  { id: 'minuman', label: 'Air', icon: '🥤' },
];

// Subkategori Kiosk KFC mengikut kategori utama
const KIOSK_SUBCATEGORIES: Record<string, { id: string; label: string }[]> = {
  all: [
    { id: 'all', label: 'SEMUA' },
    { id: 'sate', label: 'SATE' },
    { id: 'sup', label: 'SUP/MEE' },
    { id: 'nasi', label: 'NASI' },
    { id: 'karipap', label: 'KARIPAP' },
    { id: 'air', label: 'AIR' },
  ],
  sate: [
    { id: 'all', label: 'SEMUA' },
    { id: 'ayam', label: 'AYAM' },
    { id: 'daging', label: 'DAGING' },
    { id: 'kambing', label: 'KAMBING' },
    { id: 'perut', label: 'PERUT' },
    { id: 'ketupat', label: 'KETUPAT' },
  ],
  istimewa: [
    { id: 'all', label: 'SEMUA' },
    { id: 'sup', label: 'SUP TULANG' },
    { id: 'soto', label: 'SOTO' },
    { id: 'mee', label: 'MEE' },
    { id: 'bihun', label: 'BIHUN' },
  ],
  santai: [
    { id: 'all', label: 'SEMUA' },
    { id: 'lemak', label: 'NASI LEMAK' },
    { id: 'goreng', label: 'NASI GORENG' },
    { id: 'santai', label: 'SET SANTAI' },
  ],
  karipap: [
    { id: 'all', label: 'SEMUA' },
    { id: 'daging', label: 'DAGING' },
    { id: 'ayam', label: 'AYAM' },
    { id: 'kentang', label: 'KENTANG' },
  ],
  minuman: [
    { id: 'all', label: 'SEMUA' },
    { id: 'ais', label: 'AIS' },
    { id: 'panas', label: 'PANAS' },
    { id: 'teh', label: 'TEH' },
    { id: 'kopi', label: 'KOPI' },
    { id: 'buah', label: 'JUS / BUAH' },
  ],
};

export default function PosPage() {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string }[]>(POS_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');
  const [showCategorySidebar, setShowCategorySidebar] = useState<boolean>(true); // Papar panel kiri secara lalai seperti KFC Kiosk
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigasi POS Dipermudahkan: 'tables' (Page 1) vs 'menu' (Page 2)
  const [posView, setPosView] = useState<'tables' | 'menu'>('tables');
  const [tableFilterTab, setTableFilterTab] = useState<'all' | 'tables' | 'takeaway'>('all');

  // Kategori Sebelah Kiri & Auto-Hide Panel (seperti kiosk KFC)
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const [categoryAutoHide, setCategoryAutoHide] = useState(true); // Lalai: Auto-hide aktif

  // Tetapan Diperbaharui: 4 Sebaris, Ikon Sederhana, Font Besar
  const [columnsCount, setColumnsCount] = useState<3 | 4>(4); // Lalai: 4 sebaris
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md'); // Lalai: Sederhana
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('lg'); // Lalai: Font Besar
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  
  // Pilihan Meja, Bungkus & Troli
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('M-01');
  const [selectedTakeawayOrder, setSelectedTakeawayOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  // Modal Bayaran Bil Meja (Bila Selesai Makan)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'duitnow_qr' | 'card'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Ambil pesanan aktif & data menu dari Neon Postgres
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setLiveOrders(data.orders);
        }
      }
    } catch (e) {}
  }, []);

  const fetchMenuData = useCallback(async () => {
    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setMenu(data.items);
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMenuData();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchMenuData]);

  // Muat tetapan dari localStorage jika ada
  useEffect(() => {
    try {
      const savedCols = localStorage.getItem('pos_cols');
      if (savedCols === '3' || savedCols === '4') setColumnsCount(Number(savedCols) as 3 | 4);
      const savedIcon = localStorage.getItem('pos_icon_size');
      if (savedIcon === 'sm' || savedIcon === 'md' || savedIcon === 'lg') setIconSize(savedIcon);
      const savedText = localStorage.getItem('pos_text_size');
      if (savedText === 'sm' || savedText === 'md' || savedText === 'lg') setTextSize(savedText);
    } catch (e) {}
  }, []);

  const handleSetColumns = (val: 3 | 4) => {
    setColumnsCount(val);
    try { localStorage.setItem('pos_cols', String(val)); } catch (e) {}
  };
  const handleSetIconSize = (val: 'sm' | 'md' | 'lg') => {
    setIconSize(val);
    try { localStorage.setItem('pos_icon_size', val); } catch (e) {}
  };
  const handleSetTextSize = (val: 'sm' | 'md' | 'lg') => {
    setTextSize(val);
    try { localStorage.setItem('pos_text_size', val); } catch (e) {}
  };

  // Semak pesanan aktif meja yang dipilih
  const activeTableOrder = liveOrders.find(
    (o) => o.type === 'dine_in' && o.tableNumber === tableNumber && !o.isPaid && o.status !== 'cancelled'
  );

  // Tapis katalog menu (mengambil kira kategori, subkategori Kiosk KFC & carian)
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesSub = true;
    if (subCategoryFilter !== 'all') {
      const name = item.name.toLowerCase();
      if (selectedCategory === 'all') {
        if (subCategoryFilter === 'sate') matchesSub = item.category === 'sate';
        else if (subCategoryFilter === 'sup') matchesSub = item.category === 'istimewa';
        else if (subCategoryFilter === 'nasi') matchesSub = item.category === 'santai';
        else if (subCategoryFilter === 'karipap') matchesSub = item.category === 'karipap';
        else if (subCategoryFilter === 'air') matchesSub = item.category === 'minuman';
      } else if (subCategoryFilter === 'ais') {
        matchesSub = name.includes('ais') || name.includes('coke') || name.includes('100 plus');
      } else if (subCategoryFilter === 'panas') {
        matchesSub = name.includes('panas') || (!name.includes('ais') && (name.includes('teh') || name.includes('kopi') || name.includes('milo')));
      } else if (subCategoryFilter === 'buah') {
        matchesSub = name.includes('limau') || name.includes('laici') || name.includes('barli') || name.includes('lai chee kang');
      } else {
        matchesSub = name.includes(subCategoryFilter.toLowerCase());
      }
    }

    return matchesCategory && matchesSearch && matchesSub;
  });

  // Operasi troli
  const addToCart = (item: MenuItem, qtyDelta: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        const newQty = existing.quantity + qtyDelta;
        if (newQty <= 0) return prev.filter((i) => i.itemId !== item.id);
        return prev.map((i) => (i.itemId === item.id ? { ...i, quantity: newQty } : i));
      } else {
        const initialQty = item.category === 'sate' ? Math.max(item.minOrder || 5, qtyDelta) : qtyDelta;
        return [
          ...prev,
          {
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: initialQty,
            station: item.station,
          },
        ];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.itemId === itemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
  };

  // Pengiraan
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSticks = cart
    .filter((i) => i.station === 'grill')
    .reduce((acc, i) => acc + i.quantity, 0);
  const freeGravyPortions = Math.floor(totalSticks / 10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pemilihan Kategori dengan Auto-Hide Panel (seperti susunan Kiosk KFC)
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSubCategoryFilter('all');
    if (categoryAutoHide) {
      setCategoryPanelOpen(false); // AUTO-HIDE!
    }
    const catObj = categories.find((c) => c.id === catId);
    if (catObj) {
      showToast(`${catObj.icon} Kategori: ${catObj.label}`);
    }
  };

  // Navigasi: Pilih Meja -> Masuk ke Menu
  const handleSelectTableAndNavigate = (tblId: string) => {
    setSelectedTakeawayOrder(null);
    setOrderType('dine_in');
    setTableNumber(tblId);
    setCart([]);
    setCustomerName('');
    setPosView('menu');
  };

  // Navigasi: Buka Menu Bungkus Baru
  const handleSelectTakeawayAndNavigate = () => {
    setSelectedTakeawayOrder(null);
    setOrderType('takeaway');
    setCart([]);
    setCustomerName('');
    setPosView('menu');
  };

  // Navigasi: Tambah Menu ke Pesanan Bungkus Sedia Ada
  const handleSelectExistingTakeawayAndNavigate = (ord: Order) => {
    setSelectedTakeawayOrder(ord);
    setOrderType('takeaway');
    setCustomerName(ord.customerName || '');
    setCart([]);
    setPosView('menu');
  };

  // 1. MAKAN DULU / BUNGKUS: Hantar Pesanan Baru ke Dapur
  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
      
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `#NS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        customerName: customerName.trim() || (orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Bungkus Walk-in'),
        items: cart,
        status: 'cooking',
        stationStatus: {
          grill: cart.some((i) => i.station === 'grill') ? 'pending' : 'done',
          wok: cart.some((i) => i.station === 'wok') ? 'pending' : 'done',
          prep_bar: cart.some((i) => i.station === 'prep_bar') ? 'pending' : 'done',
        },
        paymentMethod: 'online_unpaid',
        isPaid: false, // MAKAN DULU / BAYAR BILA AMBIL!
        subtotal,
        discount: 0,
        total: subtotal,
        createdAt: timeStr,
      };

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      setLiveOrders((prev) => [newOrder, ...prev]);
      clearCart();
      setCartModalOpen(false);
      showToast(
        orderType === 'dine_in'
          ? `🍽️ Pesanan Meja ${tableNumber} dihantar ke Dapur! Sedia makan dulu.`
          : `🛍️ Pesanan bungkus (${newOrder.orderNumber}) dihantar ke Dapur! Boleh dibayar bila siap/ambil.`
      );
      // Kembali ke skrin pilihan meja untuk layan pelanggan seterusnya
      setPosView('tables');
    } catch (e) {
      console.error('Failed to submit order:', e);
      showToast('Gagal menghantar pesanan ke dapur');
    }
  };

  // 2. TAMBAH PESANAN: Tambah Makanan Semasa Sedang Makan / Bungkus
  const handleAppendOrder = async () => {
    const targetOrder = orderType === 'dine_in' ? activeTableOrder : selectedTakeawayOrder;
    if (!targetOrder || cart.length === 0) return;

    try {
      const mergedItems = [...targetOrder.items];
      for (const newItem of cart) {
        const existing = mergedItems.find((i) => i.itemId === newItem.itemId);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          mergedItems.push({ ...newItem });
        }
      }

      const newSubtotal = mergedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

      const newStationStatus = { ...targetOrder.stationStatus };
      if (cart.some((i) => i.station === 'grill')) newStationStatus.grill = 'pending';
      if (cart.some((i) => i.station === 'wok')) newStationStatus.wok = 'pending';
      if (cart.some((i) => i.station === 'prep_bar')) newStationStatus.prep_bar = 'pending';

      await fetch(`/api/orders/${targetOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: mergedItems,
          subtotal: newSubtotal,
          total: newSubtotal,
          stationStatus: newStationStatus,
          status: 'cooking',
        }),
      });

      setLiveOrders((prev) =>
        prev.map((o) =>
          o.id === targetOrder.id
            ? { ...o, items: mergedItems, subtotal: newSubtotal, total: newSubtotal, stationStatus: newStationStatus, status: 'cooking' }
            : o
        )
      );

      clearCart();
      setCartModalOpen(false);
      setSelectedTakeawayOrder(null);
      showToast(
        orderType === 'dine_in'
          ? `➕ Pesanan tambahan Meja ${tableNumber} dihantar ke Dapur!`
          : `➕ Pesanan tambahan Bungkus (${targetOrder.orderNumber}) dihantar ke Dapur!`
      );
      setPosView('tables');
    } catch (e) {
      showToast('Gagal menambah pesanan');
    }
  };

  // 3. BAYAR TERUS DI KAUNTER (Untuk Pesanan Bungkus Baru)
  const handlePayNowDirectly = () => {
    if (cart.length === 0) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

    const tempOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#NS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'takeaway',
      customerName: customerName.trim() || 'Bungkus Walk-in',
      items: cart,
      status: 'cooking',
      stationStatus: {
        grill: cart.some((i) => i.station === 'grill') ? 'pending' : 'done',
        wok: cart.some((i) => i.station === 'wok') ? 'pending' : 'done',
        prep_bar: cart.some((i) => i.station === 'prep_bar') ? 'pending' : 'done',
      },
      paymentMethod: 'cash',
      isPaid: false,
      subtotal,
      discount: 0,
      total: subtotal,
      createdAt: timeStr,
    };

    setSettlingOrder(tempOrder);
    setCashTendered(Math.ceil(subtotal / 5) * 5);
    setPaymentModalOpen(true);
  };

  // 4. BUKA MODAL KIRA BIL (Meja Makan Dulu atau Bungkus Belum Bayar)
  const handleOpenSettleModal = (orderToSettle: Order) => {
    setSettlingOrder(orderToSettle);
    setCashTendered(Math.ceil(orderToSettle.total / 5) * 5);
    setPaymentModalOpen(true);
  };

  // 5. SAHKAN BAYARAN & SELESAIKAN BIL
  const handleConfirmSettlement = async () => {
    if (!settlingOrder) return;
    setPaymentSuccess(true);

    try {
      const isNewUnsavedOrder = !liveOrders.some((o) => o.id === settlingOrder.id);
      
      if (isNewUnsavedOrder) {
        // Pesanan Bungkus baru yang dibayar terus
        const finalOrder: Order = {
          ...settlingOrder,
          isPaid: true,
          status: 'cooking',
          paymentMethod,
        };
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalOrder),
        });
        setLiveOrders((prev) => [finalOrder, ...prev]);
        clearCart();
        setCartModalOpen(false);
      } else {
        // Pesanan sedia ada (Meja Makan Dulu atau Bungkus)
        await fetch(`/api/orders/${settlingOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isPaid: true,
            status: settlingOrder.type === 'dine_in' ? 'completed' : settlingOrder.status,
            paymentMethod,
          }),
        });

        setLiveOrders((prev) =>
          prev.map((o) =>
            o.id === settlingOrder.id
              ? {
                  ...o,
                  isPaid: true,
                  status: settlingOrder.type === 'dine_in' ? 'completed' : o.status,
                  paymentMethod,
                }
              : o
          )
        );
      }
    } catch (e) {
      console.error('Failed to settle payment:', e);
    }

    setTimeout(() => {
      setPaymentSuccess(false);
      setPaymentModalOpen(false);
      const title = settlingOrder.tableNumber
        ? `Meja ${settlingOrder.tableNumber}`
        : `${settlingOrder.customerName || 'Pesanan Bungkus'} (${settlingOrder.orderNumber})`;
      showToast(`✅ Bayaran ${title} (RM ${settlingOrder.total.toFixed(2)}) selesai!`);
      setSettlingOrder(null);
      setPosView('tables');
    }, 1500);
  };

  // 6. SERAH MAKANAN BUNGKUS KEPADA PELANGGAN (ARKIBKAN)
  const handleCompleteTakeawayHandover = async (ord: Order) => {
    try {
      await fetch(`/api/orders/${ord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      setLiveOrders((prev) =>
        prev.map((o) => (o.id === ord.id ? { ...o, status: 'completed' } : o))
      );

      showToast(`📦 Pesanan Bungkus ${ord.orderNumber} telah diserahkan & selesai!`);
    } catch (e) {
      showToast('Gagal mengemas kini status');
    }
  };

  return (
    <div className="space-y-3 pb-20 sm:pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 border border-orange-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SKRIN 1: PILIHAN MEJA & BUNGKUS (MINIMALIS)               */}
      {/* ======================================================== */}
      {posView === 'tables' && (
        <div className="space-y-3">
          {/* Top Bar Ringkas (Jimat Ruang, Soft Neumorphic) */}
          <div className="neu-card px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white flex items-center gap-1.5">
                <span className="text-orange-500">🔥</span> POS
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-lg neu-inset-sm text-emerald-400">
                  🟢 {RESTAURANT_TABLES.filter(t => !liveOrders.some(o => o.type === 'dine_in' && o.tableNumber === t.id && !o.isPaid && o.status !== 'cancelled')).length} Kosong
                </span>
                <span className="px-2 py-0.5 rounded-lg neu-inset-sm text-amber-400">
                  🔴 {liveOrders.filter(o => o.type === 'dine_in' && !o.isPaid && o.status !== 'cancelled').length} Makan
                </span>
                {liveOrders.filter(o => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))).length > 0 && (
                  <span className="px-2 py-0.5 rounded-lg neu-inset-sm text-orange-400">
                    🛍️ {liveOrders.filter(o => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))).length} Bungkus
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/pos/backoffice"
                className="px-2.5 py-1.5 rounded-xl neu-btn text-stone-200 hover:text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                title="Buka POS Backoffice (Urus Menu & Kategori)"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Backoffice</span>
              </Link>

              <button
                type="button"
                onClick={handleSelectTakeawayAndNavigate}
                className="px-3 py-1.5 rounded-xl neu-btn-primary font-black text-xs flex items-center gap-1 active:scale-95 cursor-pointer shadow-neu-orange"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bungkus</span>
              </button>
            </div>
          </div>

          {/* Senarai Pesanan Bungkus Aktif (Hanya jika wujud) */}
          {(() => {
            const activeTakeaways = liveOrders.filter(
              (o) => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))
            );

            if (activeTakeaways.length === 0) return null;

            return (
              <div className="neu-card p-2.5 space-y-2 border border-orange-950/40">
                <div className="flex items-center justify-between text-[11px] font-black text-stone-300 px-1">
                  <span>🛍️ Pesanan Bungkus Aktif ({activeTakeaways.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {activeTakeaways.map((ord) => (
                    <div
                      key={ord.id}
                      className="neu-inset-sm p-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-orange-400 font-black">{ord.orderNumber}</span>
                          <span className="text-stone-300 truncate font-sans font-bold">{ord.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className="font-mono font-bold text-white">RM {ord.total.toFixed(2)}</span>
                          <span className={`text-[10px] font-bold ${ord.isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {ord.isPaid ? 'Lunas' : 'Belum Bayar'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!ord.isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleOpenSettleModal(ord)}
                            className="px-2.5 py-1 rounded-xl neu-btn-emerald font-black text-[11px] flex items-center gap-1 shadow-neu-green active:scale-95"
                          >
                            <Banknote className="w-3 h-3" />
                            <span>Bayar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCompleteTakeawayHandover(ord)}
                            className="px-2.5 py-1 rounded-xl neu-btn text-stone-300 text-[11px] font-bold active:scale-95"
                          >
                            Selesai
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSelectExistingTakeawayAndNavigate(ord)}
                          className="p-1.5 rounded-xl neu-btn text-orange-400 active:scale-95"
                          title="Tambah item"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Grid Meja 4 Sebaris Melintang (Konsisten Segi Empat / Square, Soft Neumorphic) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {RESTAURANT_TABLES.map((tbl) => {
              const activeOrd = liveOrders.find(
                (o) => o.type === 'dine_in' && o.tableNumber === tbl.id && !o.isPaid && o.status !== 'cancelled'
              );
              const itemCount = activeOrd
                ? activeOrd.items.reduce((a, b) => a + b.quantity, 0)
                : 0;

              return (
                <button
                  key={tbl.id}
                  type="button"
                  onClick={() => handleSelectTableAndNavigate(tbl.id)}
                  className={`aspect-square rounded-2xl p-2.5 sm:p-3 text-left transition-all duration-200 flex flex-col justify-between select-none cursor-pointer active:scale-95 active:shadow-neu-pressed ${
                    activeOrd
                      ? 'bg-gradient-to-br from-[#221a15] to-[#181411] border border-amber-500/50 shadow-neu-amber hover:border-amber-400'
                      : 'bg-[#181614] border border-stone-800/40 shadow-neu-flat hover:shadow-neu-flat-lg hover:border-orange-500/40'
                  }`}
                >
                  {/* Baris Atas: Label Meja (M1, M2...) + Indicator Dot */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm sm:text-base font-black text-white tracking-tight">{tbl.short}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeOrd
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                          : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]'
                      }`}
                    />
                  </div>

                  {/* Bawah: Harga & Jumlah Item (e.g. RM 32 & 20 item) jika diduduki / Bersih Kosong */}
                  <div className="w-full">
                    {activeOrd ? (
                      <div>
                        <div className="font-mono text-xs sm:text-sm font-black text-orange-400 leading-tight">
                          RM {activeOrd.total.toFixed(activeOrd.total % 1 === 0 ? 0 : 2)}
                        </div>
                        <div className="text-[10px] text-stone-300 font-bold leading-tight mt-0.5">
                          {itemCount} item
                        </div>
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SKRIN 2: PILIH MENU & HANTAR ORDER (MINIMALIS)           */}
      {/* ======================================================== */}
      {posView === 'menu' && (
        <div className="space-y-2.5">
          {/* Header Navigasi Skrin Menu (Padat & Jimat Ruang, Soft Neumorphic) */}
          <div className="neu-card p-2 sm:p-2.5 flex items-center justify-between gap-2 sticky top-14 z-30">
            {/* Kiri: Butang Kembali + Label Meja */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setPosView('tables')}
                className="px-2.5 py-1.5 rounded-xl neu-btn text-stone-200 text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Meja</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white px-2.5 py-1 rounded-xl neu-inset-sm">
                  {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `M${tableNumber}`) : 'Bungkus'}
                </span>
                {activeTableOrder && (
                  <button
                    type="button"
                    onClick={() => handleOpenSettleModal(activeTableOrder)}
                    className="text-[10px] font-black px-2.5 py-1 rounded-xl neu-btn-emerald text-white flex items-center gap-1 active:scale-95 shadow-neu-green"
                  >
                    <Banknote className="w-3 h-3" />
                    <span>Bil RM {activeTableOrder.total.toFixed(0)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tengah: Carian Padat */}
            <div className="relative flex-1 max-w-xs min-w-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="neu-input w-full pl-8 pr-6 py-1.5 text-xs text-white placeholder-stone-500 rounded-xl focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Kanan: Butang Buka Kategori, Backoffice & Tetapan */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowCategorySidebar(!showCategorySidebar)}
                className={`px-2.5 py-1.5 rounded-xl text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all ${
                  showCategorySidebar
                    ? 'neu-btn-primary shadow-neu-orange'
                    : 'neu-btn text-stone-300'
                }`}
                title="Togol Panel Kategori Kiri"
              >
                <span>{categories.find((c) => c.id === selectedCategory)?.icon || '🔥'}</span>
                <span className="hidden sm:inline">{categories.find((c) => c.id === selectedCategory)?.label || 'Kategori'}</span>
                <Layers className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/pos/backoffice"
                className="p-2 rounded-xl neu-btn text-stone-300 hover:text-white text-xs active:scale-95 transition-all flex items-center justify-center"
                title="Buka POS Backoffice (Urus Menu & Kategori)"
              >
                ⚙️
              </Link>

              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2 rounded-xl text-xs active:scale-95 transition-all ${
                  showSettingsDrawer ? 'neu-btn-primary shadow-neu-orange' : 'neu-btn text-stone-400'
                }`}
                title="Tetapan Saiz"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Drawer Pelaras Saiz & Baris (Bila Diperlukan) */}
          {showSettingsDrawer && (
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-bold text-[10px]">Baris:</span>
                <div className="flex gap-1 bg-stone-900 p-0.5 rounded border border-stone-800">
                  <button
                    onClick={() => handleSetColumns(4)}
                    className={`px-2 py-0.5 rounded font-black text-[10px] ${columnsCount === 4 ? 'bg-orange-600 text-white' : 'text-stone-400'}`}
                  >
                    4
                  </button>
                  <button
                    onClick={() => handleSetColumns(3)}
                    className={`px-2 py-0.5 rounded font-black text-[10px] ${columnsCount === 3 ? 'bg-orange-600 text-white' : 'text-stone-400'}`}
                  >
                    3
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-bold text-[10px]">Ikon:</span>
                <div className="flex gap-1 bg-stone-900 p-0.5 rounded border border-stone-800">
                  <button
                    onClick={() => handleSetIconSize('sm')}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${iconSize === 'sm' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400'}`}
                  >
                    Kecil
                  </button>
                  <button
                    onClick={() => handleSetIconSize('md')}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${iconSize === 'md' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400'}`}
                  >
                    Sederhana
                  </button>
                  <button
                    onClick={() => handleSetIconSize('lg')}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${iconSize === 'lg' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400'}`}
                  >
                    Besar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUSUN ATUR KIOSK KFC: KATEGORI KIRI + MENU & PIL KANAN   */}
          {/* ======================================================== */}
          <div className="flex gap-2 sm:gap-2.5 items-start">
            {/* 1. SIDEBAR KATEGORI SEBELAH KIRI (SEPERTI KIOSK KFC, Soft Neumorphic) */}
            {showCategorySidebar && (
              <aside className="w-16 sm:w-20 md:w-24 shrink-0 neu-card p-1 sm:p-1.5 flex flex-col gap-1 sticky top-28 select-none">
                {/* Brand / Logo Mini */}
                <div className="flex flex-col items-center justify-center py-1 border-b border-stone-800/80 text-center">
                  <span className="text-xl filter drop-shadow">🔥</span>
                  <span className="text-[8px] sm:text-[9px] font-black text-orange-400 tracking-wider">NIPAH</span>
                </div>

                {/* Senarai Kategori Vertikal Kiosk */}
                <div className="flex flex-col gap-1.5 py-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    const count = cat.id === 'all'
                      ? menu.length
                      : menu.filter((m) => m.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                          isActive
                            ? 'neu-btn-primary shadow-neu-orange font-black'
                            : 'neu-btn text-stone-300'
                        }`}
                      >
                        <span className="text-base sm:text-lg leading-none">{cat.icon}</span>
                        <span className="text-[9px] sm:text-[10px] font-bold mt-1 leading-tight tracking-tight line-clamp-1">
                          {cat.label}
                        </span>
                        <span className={`text-[8px] font-mono px-1 rounded-full mt-0.5 ${isActive ? 'bg-black/30 text-white' : 'text-stone-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}

            {/* 2. KAWASAN MENU & SUBKATEGORI (KANAN) */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header Kategori Terpilih & Sub-filter Horizontal (Soft Neumorphic) */}
              <div className="neu-card p-2 sm:p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">
                      {categories.find((c) => c.id === selectedCategory)?.icon || '🔥'}
                    </span>
                    <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                      {categories.find((c) => c.id === selectedCategory)?.label || 'SEMUA MENU'}
                    </h2>
                    <span className="text-[10px] sm:text-xs text-stone-400 font-mono">
                      ({filteredMenu.length})
                    </span>
                  </div>

                  {/* Butang Auto-Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowCategorySidebar(!showCategorySidebar)}
                    className="text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg neu-btn text-stone-300 hover:text-white flex items-center gap-1 active:scale-95"
                    title={showCategorySidebar ? 'Sembunyikan Sidebar Kategori' : 'Buka Sidebar Kategori'}
                  >
                    <Layers className="w-3 h-3 text-orange-400" />
                    <span>{showCategorySidebar ? 'Auto-hide' : 'Kategori'}</span>
                  </button>
                </div>

                {/* Subcategory Pills (Horizontal Scroll, Soft Neumorphic) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {(KIOSK_SUBCATEGORIES[selectedCategory] || [{ id: 'all', label: 'SEMUA' }]).map((sub) => {
                    const isSubActive = subCategoryFilter === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSubCategoryFilter(sub.id)}
                        className={`px-3 py-1 rounded-xl text-[9px] sm:text-[11px] font-black tracking-tight whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                          isSubActive
                            ? 'neu-btn-primary shadow-neu-orange text-white'
                            : 'neu-btn text-stone-300'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid Menu: Minimalis & Soft Neumorphic */}
              <div
                className={`${
                  columnsCount === 4
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5'
                    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5'
                }`}
              >
                {filteredMenu.map((item) => {
                  const inCart = cart.find((i) => i.itemId === item.id);
                  const isSatay = item.category === 'sate';
                  const displayIcon = getItemDisplayIcon(item);

                  const iconBoxClass = {
                    sm: 'h-12 text-2xl',
                    md: 'h-14 sm:h-16 text-3xl',
                    lg: 'h-18 sm:h-20 text-4xl',
                  }[iconSize];

                  return (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item, isSatay ? 5 : 1)}
                      className={`group relative neu-card p-2 sm:p-2.5 cursor-pointer select-none transition-all duration-200 flex flex-col justify-between active:scale-95 ${
                        inCart ? 'border-orange-500/80 shadow-neu-orange' : 'hover:shadow-neu-flat-lg'
                      }`}
                    >
                      {/* Kotak Ikon Menu (Sunken Neumorphic Well) */}
                      <div
                        className={`w-full ${iconBoxClass} rounded-xl neu-inset flex items-center justify-center relative overflow-hidden transition-all ${
                          inCart ? 'border border-orange-500/40' : ''
                        }`}
                      >
                        <span className="filter drop-shadow select-none">
                          {displayIcon.emoji}
                        </span>

                        {/* Lencana Kuantiti Jika Dipilih */}
                        {inCart && (
                          <span className="absolute top-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg neu-btn-primary text-white shadow-neu-orange">
                            {inCart.quantity}x
                          </span>
                        )}
                      </div>

                      {/* Nama Menu & Harga (Padat & Jelas) */}
                      <div className="mt-1.5 flex-1 flex flex-col justify-between text-center min-w-0">
                        <span className="text-[11px] sm:text-xs font-bold text-stone-100 truncate">
                          {item.name}
                        </span>

                        <span className="font-mono text-[10px] sm:text-xs font-bold text-orange-400 mt-0.5">
                          RM {item.price.toFixed(2)}
                        </span>

                        {/* Stepper Tambah/Tolak Jika Dalam Troli */}
                        {inCart && (
                          <div
                            className="flex items-center justify-between w-full mt-1.5 neu-inset-sm rounded-lg p-0.5 text-xs font-bold border border-orange-500/40"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, isSatay ? -5 : -1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg neu-btn text-orange-400 hover:text-white"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-mono font-black text-[10px] text-white">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(item, isSatay ? 5 : 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg neu-btn-primary text-white"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FLOATING ACTION BAR: HANTAR ORDER (Soft Neumorphic)       */}
          {/* ======================================================== */}
          <div className="fixed bottom-3 left-2 right-2 sm:left-6 sm:right-6 z-40 max-w-xl mx-auto">
            <div className="neu-card-lg border border-orange-500/50 rounded-2xl px-3.5 py-2.5 shadow-neu-flat-lg flex items-center justify-between gap-2 text-stone-100">
              {/* Ringkasan Troli (SHOW BASKET ^) */}
              <button
                type="button"
                onClick={() => setCartModalOpen(true)}
                className="flex items-center gap-2.5 text-left active:scale-95 group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-neu-flat relative transition-all ${
                  activeTableOrder && cart.length === 0 ? 'neu-btn-emerald' : 'neu-btn-primary'
                }`}>
                  {activeTableOrder && cart.length === 0 ? <Banknote className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#181614] shadow">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-black text-stone-300 flex items-center gap-1 uppercase tracking-tight">
                    <span>{orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `Meja ${tableNumber}`) : 'Bungkus'}</span>
                    <span>•</span>
                    <span className="text-orange-400">TROLI ^</span>
                  </div>
                  <div className={`font-mono text-sm sm:text-base font-black ${activeTableOrder && cart.length === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    RM {(cart.length > 0 ? subtotal : activeTableOrder ? activeTableOrder.total : 0).toFixed(2)}
                  </div>
                </div>
              </button>

              {/* Butang Tindakan Kiosk KFC (PLACE ORDER / KIRA BIL) */}
              <div className="flex items-center gap-1.5">
                {cart.length > 0 ? (
                  orderType === 'takeaway' && !selectedTakeawayOrder ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSendToKitchen}
                        className="px-3 py-2 rounded-xl font-bold text-xs neu-btn text-stone-200 active:scale-95"
                      >
                        Hantar
                      </button>
                      <button
                        type="button"
                        onClick={handlePayNowDirectly}
                        className="px-3.5 py-2 rounded-xl font-black text-xs neu-btn-emerald text-white shadow-neu-green active:scale-95 flex items-center gap-1.5 border border-emerald-400/40"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>PLACE ORDER RM {subtotal.toFixed(2)}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(activeTableOrder || selectedTakeawayOrder) ? handleAppendOrder : handleSendToKitchen}
                      className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm neu-btn-emerald text-white shadow-neu-green active:scale-95 flex items-center gap-1.5 border border-emerald-400/40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>PLACE ORDER RM {subtotal.toFixed(2)}</span>
                    </button>
                  )
                ) : (
                  activeTableOrder && (
                    <button
                      type="button"
                      onClick={() => handleOpenSettleModal(activeTableOrder)}
                      className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm neu-btn-emerald text-white shadow-neu-green active:scale-95 flex items-center gap-1.5 border border-emerald-400/40"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>KIRA BIL RM {activeTableOrder.total.toFixed(activeTableOrder.total % 1 === 0 ? 0 : 2)}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SEMAKAN TROLI PESANAN (Soft Neumorphic)            */}
      {/* ======================================================== */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="neu-card-lg max-w-sm w-full p-4 sm:p-5 space-y-3.5 relative text-stone-100 rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
              <h3 className="font-black text-sm text-white">
                Pesanan: {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `M${tableNumber}`) : 'Bungkus'}
              </h3>
              <button onClick={() => setCartModalOpen(false)} className="p-1 rounded-lg neu-btn text-stone-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {/* Senarai Item dalam Troli */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-0.5">
              {cart.map((item) => (
                <div key={item.itemId} className="neu-inset-sm p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-white truncate block">{item.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      RM {item.price.toFixed(2)} × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 neu-card rounded-lg p-0.5 shrink-0 border border-stone-850">
                    <button onClick={() => updateQuantity(item.itemId, item.station === 'grill' ? -5 : -1)} className="p-1 text-stone-400 hover:text-white neu-btn rounded">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold font-mono text-xs px-1 text-white">{item.quantity}</span>
                    <button onClick={() => addToCart(menu.find(m => m.id === item.itemId)!, item.station === 'grill' ? 5 : 1)} className="p-1 text-white neu-btn-primary rounded">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Nota */}
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nota / Nama (pilihan)"
              className="neu-input w-full px-3 py-2 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
            />

            {/* Subtotal */}
            <div className="pt-2 border-t border-stone-800/80 flex justify-between items-center text-xs font-black">
              <span className="text-stone-400">Jumlah:</span>
              <span className="font-mono text-base text-orange-400">RM {subtotal.toFixed(2)}</span>
            </div>

            {/* Tindakan */}
            {orderType === 'takeaway' && !selectedTakeawayOrder ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendToKitchen}
                  className="py-2.5 rounded-xl font-bold text-xs neu-btn text-stone-200 active:scale-95 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Hantar</span>
                </button>
                <button
                  type="button"
                  onClick={handlePayNowDirectly}
                  className="py-2.5 rounded-xl font-black text-xs neu-btn-emerald text-white shadow-neu-green active:scale-95 flex items-center justify-center gap-1 border border-emerald-400/40"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Bayar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(activeTableOrder || selectedTakeawayOrder) ? handleAppendOrder : handleSendToKitchen}
                className="w-full py-3 rounded-xl font-black text-xs neu-btn-primary text-white shadow-neu-orange active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {(activeTableOrder || selectedTakeawayOrder) ? 'Hantar Tambahan' : 'Hantar Dapur'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KIRA BIL & BAYARAN (Soft Neumorphic)               */}
      {/* ======================================================== */}
      {paymentModalOpen && settlingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="neu-card-lg max-w-sm w-full p-4 sm:p-5 space-y-3.5 relative text-stone-100 rounded-3xl">
            <div className="flex items-center justify-between pb-1 border-b border-stone-800/80">
              <div>
                <h3 className="font-black text-sm text-white">
                  Kira Bil: {settlingOrder.tableNumber ? (settlingOrder.tableNumber === 'VIP' ? 'VIP' : `M${settlingOrder.tableNumber}`) : (settlingOrder.customerName || 'Bungkus')}
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">#{settlingOrder.orderNumber}</span>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1 rounded-lg neu-btn text-stone-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {/* Senarai Makanan */}
            <div className="max-h-36 overflow-y-auto neu-inset-sm p-2.5 rounded-xl space-y-1 text-xs">
              {settlingOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-stone-300 text-[11px]">
                  <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                  <span className="font-mono font-bold shrink-0">RM {(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-1.5 border-t border-stone-800/80 flex justify-between font-black text-xs text-orange-400">
                <span>Perlu Dibayar:</span>
                <span className="font-mono text-sm">RM {settlingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Kaedah Bayaran */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'duitnow_qr', label: 'QR Pay', icon: QrCode },
                { id: 'card', label: 'Kad', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2.5 rounded-xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'neu-btn-primary shadow-neu-orange text-white'
                        : 'neu-btn text-stone-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Tunai & Baki */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 neu-inset-sm rounded-xl p-2.5 text-xs">
                <div className="grid grid-cols-4 gap-1.5">
                  {[settlingOrder.total, Math.ceil(settlingOrder.total / 10) * 10, 50, 100].map((amt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCashTendered(amt)}
                      className={`py-1.5 rounded-lg font-mono font-bold text-[10px] transition-all active:scale-95 ${
                        cashTendered === amt ? 'neu-btn-primary shadow-neu-orange text-white' : 'neu-btn text-stone-300'
                      }`}
                    >
                      RM {amt.toFixed(0)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-stone-800/80 text-[11px]">
                  <span className="text-stone-400">Baki:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    RM {Math.max(0, cashTendered - settlingOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'duitnow_qr' && (
              <div className="neu-inset-sm rounded-xl p-2.5 text-center">
                <div className="w-20 h-20 mx-auto bg-white p-1 rounded-xl shadow-neu-flat flex items-center justify-center">
                  <span className="text-[9px] font-black text-rose-600 font-mono">DuitNow QR</span>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="neu-inset-sm rounded-xl p-3 text-center text-xs text-stone-300">
                Tap kad pada terminal POS.
              </div>
            )}

            {/* Butang Sahkan Bayaran & Selesai */}
            <button
              onClick={handleConfirmSettlement}
              disabled={paymentSuccess}
              className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-neu-green border border-emerald-400/40 active:scale-95 ${
                paymentSuccess
                  ? 'neu-btn-emerald text-white'
                  : 'neu-btn-emerald text-white hover:brightness-110'
              }`}
            >
              {paymentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>Selesai & Lunas!</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>Sahkan Bayaran</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
