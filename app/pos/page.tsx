'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

export default function PosPage() {
  const [menu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Ambil pesanan aktif dari Neon Postgres (Auto-poll 4s)
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

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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

  // Tapis katalog menu
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    if (categoryAutoHide) {
      setCategoryPanelOpen(false); // AUTO-HIDE!
    }
    const catObj = POS_CATEGORIES.find((c) => c.id === catId);
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
    <div className="space-y-4 pb-24 lg:pb-8">
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
        <div className="space-y-2.5">
          {/* Top Bar Ringkas (Jimat Ruang) */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white flex items-center gap-1">
                <span className="text-orange-500">🔥</span> POS
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className="px-1.5 py-0.5 rounded bg-stone-950 text-emerald-400 border border-emerald-900/50">
                  🟢 {RESTAURANT_TABLES.filter(t => !liveOrders.some(o => o.type === 'dine_in' && o.tableNumber === t.id && !o.isPaid && o.status !== 'cancelled')).length} Kosong
                </span>
                <span className="px-1.5 py-0.5 rounded bg-stone-950 text-amber-400 border border-amber-900/50">
                  🔴 {liveOrders.filter(o => o.type === 'dine_in' && !o.isPaid && o.status !== 'cancelled').length} Makan
                </span>
                {liveOrders.filter(o => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-stone-950 text-orange-400 border border-orange-900/50">
                    🛍️ {liveOrders.filter(o => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))).length} Bungkus
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSelectTakeawayAndNavigate}
              className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bungkus</span>
            </button>
          </div>

          {/* Senarai Pesanan Bungkus Aktif (Hanya jika wujud) */}
          {(() => {
            const activeTakeaways = liveOrders.filter(
              (o) => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))
            );

            if (activeTakeaways.length === 0) return null;

            return (
              <div className="bg-stone-900/80 border border-orange-900/40 rounded-xl p-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-black text-stone-300 px-1">
                  <span>🛍️ Pesanan Bungkus Aktif ({activeTakeaways.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {activeTakeaways.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-stone-950 border border-stone-800 rounded-lg p-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="text-orange-400 font-black">{ord.orderNumber}</span>
                          <span className="text-stone-300 truncate font-sans">{ord.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className="font-mono font-bold text-white">RM {ord.total.toFixed(2)}</span>
                          <span className={`text-[10px] font-bold ${ord.isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {ord.isPaid ? 'Lunas' : 'Belum Bayar'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!ord.isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleOpenSettleModal(ord)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow active:scale-95"
                          >
                            <Banknote className="w-3 h-3" />
                            <span>Bayar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCompleteTakeawayHandover(ord)}
                            className="px-2 py-1 rounded bg-stone-800 text-stone-300 text-[11px] font-bold active:scale-95"
                          >
                            Selesai
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSelectExistingTakeawayAndNavigate(ord)}
                          className="p-1 rounded bg-stone-900 border border-stone-700 text-orange-400 active:scale-95"
                          title="Tambah item"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Grid Meja 4 Sebaris Melintang (Minimalis - Klik Terus ke Menu) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                  className={`rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border text-left transition-all flex flex-col justify-between select-none cursor-pointer active:scale-95 shadow-sm h-18 sm:h-20 ${
                    activeOrd
                      ? 'bg-amber-950/30 border-amber-500/80 hover:border-amber-400 ring-1 ring-amber-500/50'
                      : 'bg-stone-900/90 border-stone-800 hover:border-orange-500 hover:bg-stone-850'
                  }`}
                >
                  {/* Baris Atas: Label Meja (M1, M2...) + Indicator Dot */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-black text-white">{tbl.short}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeOrd
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                      }`}
                    />
                  </div>

                  {/* Bawah: Harga & Jumlah Item jika diduduki */}
                  <div className="w-full">
                    {activeOrd ? (
                      <div>
                        <div className="font-mono text-xs sm:text-sm font-black text-orange-400 leading-tight">
                          RM {activeOrd.total.toFixed(activeOrd.total % 1 === 0 ? 0 : 2)}
                        </div>
                        <div className="text-[10px] text-stone-400 font-bold leading-tight mt-0.5">
                          {itemCount} item
                        </div>
                      </div>
                    ) : (
                      <div className="h-3" />
                    )}
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
          {/* Header Navigasi Skrin Menu (Padat & Jimat Ruang) */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-2 sm:p-2.5 shadow-lg flex items-center justify-between gap-2 sticky top-14 z-30 backdrop-blur-md bg-stone-900/95">
            {/* Kiri: Butang Kembali + Label Meja */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setPosView('tables')}
                className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1 border border-stone-700 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Meja</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white px-2 py-0.5 rounded bg-stone-800 border border-stone-700">
                  {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `M${tableNumber}`) : 'Bungkus'}
                </span>
                {activeTableOrder && (
                  <button
                    type="button"
                    onClick={() => handleOpenSettleModal(activeTableOrder)}
                    className="text-[10px] font-black px-2 py-1 rounded bg-emerald-600 text-white flex items-center gap-1 active:scale-95 shadow"
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
                className="w-full pl-8 pr-6 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Kanan: Butang Buka Kategori & Tetapan */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCategoryPanelOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-1 shadow active:scale-95 border border-orange-400"
              >
                <span>{POS_CATEGORIES.find((c) => c.id === selectedCategory)?.icon || '🔥'}</span>
                <span className="hidden sm:inline">{POS_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Semua'}</span>
                <Layers className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-1.5 rounded-lg border text-xs ${
                  showSettingsDrawer ? 'bg-orange-600 text-white border-orange-500' : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}
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
          {/* PANEL KATEGORI SEBELAH KIRI (AUTO-HIDE KIOSK STYLE)      */}
          {/* ======================================================== */}

          {/* Tab Terapung Tepi Kiri (Minimalis) */}
          <button
            type="button"
            onClick={() => setCategoryPanelOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-orange-600 hover:bg-orange-500 text-white px-1.5 py-2.5 rounded-r-xl shadow-lg flex flex-col items-center gap-1 border-y border-r border-orange-400 cursor-pointer active:scale-95"
            title="Kategori"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase [writing-mode:vertical-rl] rotate-180">
              {POS_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Menu'}
            </span>
          </button>

          {/* Drawer Kategori Sebelah Kiri (Auto-Hide Selepas Klik) */}
          {categoryPanelOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                onClick={() => setCategoryPanelOpen(false)}
              />

              <aside className="relative z-10 w-60 bg-stone-900 border-r-2 border-orange-600 shadow-2xl flex flex-col justify-between overflow-hidden animate-slideIn">
                {/* Header Padat Panel */}
                <div className="p-3 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <span className="font-black text-white text-xs">Kategori</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryPanelOpen(false)}
                    className="p-1 rounded bg-stone-800 text-stone-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Senarai Vertikal Kategori (KFC Kiosk Style - Jimat Ruang) */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {POS_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    const count = cat.id === 'all'
                      ? menu.length
                      : menu.filter((m) => m.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full p-2 rounded-xl border transition-all text-left flex items-center gap-2.5 active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-400 shadow-md font-black'
                            : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-orange-500'
                        }`}
                      >
                        <span className="text-xl shrink-0">{cat.icon}</span>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <span className="text-xs truncate">{cat.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/30 text-white' : 'text-stone-400'}`}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer Kategori */}
                <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex justify-between items-center text-[10px] text-stone-400">
                  <span>{menu.length} item</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="text-orange-400 font-bold hover:underline"
                  >
                    Semua
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ======================================================== */}
          {/* GRID MENU: 4 SEBARIS MELINTANG (KONSEP MINIMALIS)         */}
          {/* ======================================================== */}
          <div
            className={`${
              columnsCount === 4
                ? 'grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2'
                : 'grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2'
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
                  className={`group relative bg-stone-900 border rounded-xl p-1.5 sm:p-2 cursor-pointer select-none transition-all flex flex-col justify-between active:scale-95 ${
                    inCart ? 'border-orange-500 ring-1 ring-orange-500/60 shadow bg-stone-900' : 'border-stone-800 hover:border-orange-500/60'
                  }`}
                >
                  {/* Kotak Ikon Menu (Mengikut Lakaran Pengguna) */}
                  <div
                    className={`w-full ${iconBoxClass} rounded-lg border flex items-center justify-center relative overflow-hidden transition-all ${
                      inCart
                        ? 'border-orange-500 bg-orange-950/20'
                        : 'border-stone-850 bg-stone-950 group-hover:border-stone-700'
                    }`}
                  >
                    <span className="filter drop-shadow select-none">
                      {displayIcon.emoji}
                    </span>

                    {/* Lencana Kuantiti Jika Dipilih */}
                    {inCart && (
                      <span className="absolute top-1 right-1 text-[9px] font-black px-1 rounded bg-orange-600 text-white shadow">
                        {inCart.quantity}x
                      </span>
                    )}
                  </div>

                  {/* Nama Menu & Harga (Padat & Jelas) */}
                  <div className="mt-1 flex-1 flex flex-col justify-between text-center min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-stone-100 truncate">
                      {item.name}
                    </span>

                    <span className="font-mono text-[10px] sm:text-xs font-bold text-orange-400 mt-0.5">
                      RM {item.price.toFixed(2)}
                    </span>

                    {/* Stepper Tambah/Tolak Jika Dalam Troli */}
                    {inCart && (
                      <div
                        className="flex items-center justify-between w-full mt-1 bg-orange-950/90 border border-orange-600/70 rounded p-0.5 text-xs font-bold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, isSatay ? -5 : -1)}
                          className="w-4 h-4 flex items-center justify-center rounded bg-stone-900 text-orange-400 hover:bg-orange-600 hover:text-white"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="font-mono font-black text-[10px] text-white">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(item, isSatay ? 5 : 1)}
                          className="w-4 h-4 flex items-center justify-center rounded bg-orange-600 text-white hover:bg-orange-500"
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

          {/* ======================================================== */}
          {/* FLOATING ACTION BAR: HANTAR ORDER (PADAT & MINIMALIS)    */}
          {/* ======================================================== */}
          <div className="fixed bottom-[4.75rem] left-2 right-2 sm:left-6 sm:right-6 z-40 max-w-xl mx-auto">
            <div className="bg-stone-900 border border-orange-500/80 rounded-xl px-3 py-2 shadow-2xl flex items-center justify-between gap-2 text-stone-100 backdrop-blur-md">
              {/* Ringkasan Troli */}
              <button
                type="button"
                onClick={() => setCartModalOpen(true)}
                className="flex items-center gap-2 text-left active:scale-95"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow ${activeTableOrder && cart.length === 0 ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                  {activeTableOrder && cart.length === 0 ? <Banknote className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-stone-300">
                    {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `M${tableNumber}`) : 'Bungkus'} •{' '}
                    {cart.length > 0
                      ? `${cart.reduce((a, b) => a + b.quantity, 0)} item baru`
                      : activeTableOrder
                      ? `${activeTableOrder.items.reduce((a, b) => a + b.quantity, 0)} item`
                      : '0 item'}
                  </div>
                  <div className={`font-mono text-sm font-black ${activeTableOrder && cart.length === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    RM {(cart.length > 0 ? subtotal : activeTableOrder ? activeTableOrder.total : 0).toFixed(2)}
                  </div>
                </div>
              </button>

              {/* Butang Tindakan Hantar / Bayar */}
              <div className="flex items-center gap-1.5">
                {cart.length > 0 ? (
                  orderType === 'takeaway' && !selectedTakeawayOrder ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSendToKitchen}
                        className="px-2.5 py-2 rounded-lg font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 active:scale-95"
                      >
                        Hantar
                      </button>
                      <button
                        type="button"
                        onClick={handlePayNowDirectly}
                        className="px-3 py-2 rounded-lg font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow active:scale-95 flex items-center gap-1"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Bayar</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(activeTableOrder || selectedTakeawayOrder) ? handleAppendOrder : handleSendToKitchen}
                      className="px-3.5 py-2 rounded-lg font-black text-xs bg-orange-600 hover:bg-orange-500 text-white shadow active:scale-95 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{(activeTableOrder || selectedTakeawayOrder) ? 'Hantar Tambahan' : 'Hantar Dapur'}</span>
                    </button>
                  )
                ) : (
                  activeTableOrder && (
                    <button
                      type="button"
                      onClick={() => handleOpenSettleModal(activeTableOrder)}
                      className="px-3.5 py-2 rounded-lg font-black text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-lg active:scale-95 flex items-center gap-1.5 border border-emerald-400"
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Kira Bil RM {activeTableOrder.total.toFixed(activeTableOrder.total % 1 === 0 ? 0 : 2)}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SEMAKAN TROLI PESANAN (MINIMALIS)                  */}
      {/* ======================================================== */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative text-stone-100">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="font-black text-sm text-white">
                Pesanan: {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `M${tableNumber}`) : 'Bungkus'}
              </h3>
              <button onClick={() => setCartModalOpen(false)} className="text-stone-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            {/* Senarai Item dalam Troli */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
              {cart.map((item) => (
                <div key={item.itemId} className="bg-stone-950 p-2 rounded-lg border border-stone-800 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-white truncate block">{item.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      RM {item.price.toFixed(2)} × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded p-0.5 shrink-0">
                    <button onClick={() => updateQuantity(item.itemId, item.station === 'grill' ? -5 : -1)} className="p-0.5 text-stone-400 hover:text-white">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold font-mono text-xs px-1 text-white">{item.quantity}</span>
                    <button onClick={() => addToCart(menu.find(m => m.id === item.itemId)!, item.station === 'grill' ? 5 : 1)} className="p-0.5 text-orange-400 hover:text-white">
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
              className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
            />

            {/* Subtotal */}
            <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-xs font-black">
              <span className="text-stone-400">Jumlah:</span>
              <span className="font-mono text-base text-orange-400">RM {subtotal.toFixed(2)}</span>
            </div>

            {/* Tindakan */}
            {orderType === 'takeaway' && !selectedTakeawayOrder ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendToKitchen}
                  className="py-2.5 rounded-lg font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 active:scale-95 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Hantar</span>
                </button>
                <button
                  type="button"
                  onClick={handlePayNowDirectly}
                  className="py-2.5 rounded-lg font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow active:scale-95 flex items-center justify-center gap-1"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Bayar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(activeTableOrder || selectedTakeawayOrder) ? handleAppendOrder : handleSendToKitchen}
                className="w-full py-2.5 rounded-lg font-black text-xs bg-orange-600 hover:bg-orange-500 text-white shadow active:scale-95 flex items-center justify-center gap-1.5"
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
      {/* MODAL KIRA BIL & BAYARAN (MINIMALIS)                     */}
      {/* ======================================================== */}
      {paymentModalOpen && settlingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative text-stone-100">
            <div className="flex items-center justify-between pb-1 border-b border-stone-800">
              <div>
                <h3 className="font-black text-sm text-white">
                  Kira Bil: {settlingOrder.tableNumber ? (settlingOrder.tableNumber === 'VIP' ? 'VIP' : `M${settlingOrder.tableNumber}`) : (settlingOrder.customerName || 'Bungkus')}
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">#{settlingOrder.orderNumber}</span>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-stone-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            {/* Senarai Makanan */}
            <div className="max-h-36 overflow-y-auto bg-stone-950 p-2 rounded-lg border border-stone-800 space-y-1 text-xs">
              {settlingOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-stone-300 text-[11px]">
                  <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                  <span className="font-mono font-bold shrink-0">RM {(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-1.5 border-t border-stone-800 flex justify-between font-black text-xs text-orange-400">
                <span>Perlu Dibayar:</span>
                <span className="font-mono text-sm">RM {settlingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Kaedah Bayaran */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'duitnow_qr', label: 'QR Pay', icon: QrCode },
                { id: 'card', label: 'Kad', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 rounded-lg border flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
                      paymentMethod === m.id
                        ? 'bg-orange-600 text-white border-orange-500 shadow'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
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
              <div className="space-y-1.5 bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs">
                <div className="grid grid-cols-4 gap-1">
                  {[settlingOrder.total, Math.ceil(settlingOrder.total / 10) * 10, 50, 100].map((amt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCashTendered(amt)}
                      className={`py-1 rounded font-mono font-bold text-[10px] ${
                        cashTendered === amt ? 'bg-orange-600 text-white' : 'bg-stone-900 text-stone-300 border border-stone-800'
                      }`}
                    >
                      RM {amt.toFixed(0)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-stone-800 text-[11px]">
                  <span className="text-stone-400">Baki:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    RM {Math.max(0, cashTendered - settlingOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'duitnow_qr' && (
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-2 text-center">
                <div className="w-20 h-20 mx-auto bg-white p-1 rounded-lg flex items-center justify-center">
                  <span className="text-[9px] font-black text-rose-600 font-mono">DuitNow QR</span>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-2 text-center text-xs text-stone-300">
                Tap kad pada terminal.
              </div>
            )}

            {/* Butang Sahkan Bayaran & Selesai */}
            <button
              onClick={handleConfirmSettlement}
              disabled={paymentSuccess}
              className={`w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                paymentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow active:scale-95'
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
