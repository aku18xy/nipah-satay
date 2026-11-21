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
  ChevronRight
} from 'lucide-react';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '@/lib/data';
import { MenuItem, Category, OrderItem, Order } from '@/lib/types';

// Senarai Meja Restoran Nipah Satay (Laguna Park, Pulau Indah)
const RESTAURANT_TABLES = [
  { id: 'M-01', name: 'Meja 1' },
  { id: 'M-02', name: 'Meja 2' },
  { id: 'M-03', name: 'Meja 3' },
  { id: 'M-04', name: 'Meja 4' },
  { id: 'M-05', name: 'Meja 5' },
  { id: 'M-06', name: 'Meja 6' },
  { id: 'M-07', name: 'Meja 7' },
  { id: 'M-08', name: 'Meja 8' },
  { id: 'M-09', name: 'Meja 9' },
  { id: 'M-10', name: 'Meja 10' },
  { id: 'M-11', name: 'Meja 11' },
  { id: 'M-12', name: 'Meja 12' },
  { id: 'VIP-1', name: 'Meja VIP' },
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

export default function PosPage() {
  const [menu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigasi POS Dipermudahkan: 'tables' (Page 1) vs 'menu' (Page 2)
  const [posView, setPosView] = useState<'tables' | 'menu'>('tables');

  // Tetapan Diperbaharui: 4 Sebaris, Ikon Sederhana, Font Besar
  const [columnsCount, setColumnsCount] = useState<3 | 4>(4); // Lalai: 4 sebaris
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md'); // Lalai: Sederhana
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('lg'); // Lalai: Font Besar
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  
  // Pilihan Meja & Troli
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('M-01');
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

  // Navigasi: Pilih Meja -> Masuk ke Menu
  const handleSelectTableAndNavigate = (tblId: string) => {
    setOrderType('dine_in');
    setTableNumber(tblId);
    setCart([]);
    setPosView('menu');
  };

  const handleSelectTakeawayAndNavigate = () => {
    setOrderType('takeaway');
    setCart([]);
    setPosView('menu');
  };

  // 1. MAKAN DULU: Hantar Pesanan Baru Meja ke Dapur
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
        isPaid: false, // MAKAN DULU!
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
          : `🛍️ Pesanan bungkus dihantar ke dapur!`
      );
      // Kembali ke skrin pilihan meja untuk layan pelanggan seterusnya
      setPosView('tables');
    } catch (e) {
      console.error('Failed to submit order:', e);
      showToast('Gagal menghantar pesanan ke dapur');
    }
  };

  // 2. TAMBAH PESANAN: Tambah Makanan Semasa Sedang Makan
  const handleAppendOrder = async () => {
    if (!activeTableOrder || cart.length === 0) return;

    try {
      const mergedItems = [...activeTableOrder.items];
      for (const newItem of cart) {
        const existing = mergedItems.find((i) => i.itemId === newItem.itemId);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          mergedItems.push({ ...newItem });
        }
      }

      const newSubtotal = mergedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

      const newStationStatus = { ...activeTableOrder.stationStatus };
      if (cart.some((i) => i.station === 'grill')) newStationStatus.grill = 'pending';
      if (cart.some((i) => i.station === 'wok')) newStationStatus.wok = 'pending';
      if (cart.some((i) => i.station === 'prep_bar')) newStationStatus.prep_bar = 'pending';

      await fetch(`/api/orders/${activeTableOrder.id}`, {
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
          o.id === activeTableOrder.id
            ? { ...o, items: mergedItems, subtotal: newSubtotal, total: newSubtotal, stationStatus: newStationStatus, status: 'cooking' }
            : o
        )
      );

      clearCart();
      setCartModalOpen(false);
      showToast(`➕ Pesanan tambahan Meja ${tableNumber} dihantar ke Dapur!`);
      // Kembali ke skrin meja
      setPosView('tables');
    } catch (e) {
      showToast('Gagal menambah pesanan meja');
    }
  };

  // 3. BAYAR KEMUDIAN: Buka Modal Kira Bil Meja
  const handleOpenSettleModal = (orderToSettle: Order) => {
    setSettlingOrder(orderToSettle);
    setCashTendered(Math.ceil(orderToSettle.total / 5) * 5);
    setPaymentModalOpen(true);
  };

  const handleConfirmSettlement = async () => {
    if (!settlingOrder) return;
    setPaymentSuccess(true);

    try {
      await fetch(`/api/orders/${settlingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPaid: true,
          status: 'completed',
          paymentMethod,
        }),
      });

      setLiveOrders((prev) =>
        prev.map((o) =>
          o.id === settlingOrder.id
            ? { ...o, isPaid: true, status: 'completed', paymentMethod }
            : o
        )
      );
    } catch (e) {
      console.error('Failed to settle payment:', e);
    }

    setTimeout(() => {
      setPaymentSuccess(false);
      setPaymentModalOpen(false);
      const tblName = settlingOrder.tableNumber ? `Meja ${settlingOrder.tableNumber}` : 'Pesanan';
      showToast(`✅ Bayaran ${tblName} (RM ${settlingOrder.total.toFixed(2)}) selesai! Meja kini kosong.`);
      setSettlingOrder(null);
      setPosView('tables');
    }, 1500);
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
      {/* SKRIN 1: PILIHAN MEJA & BUNGKUS (PAGE PERTAMA POS)        */}
      {/* ======================================================== */}
      {posView === 'tables' && (
        <div className="space-y-5">
          {/* Header Ringkasan Operasi */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Pusat Pesanan POS Nipah Satay™
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Konsep: <strong className="text-amber-400">Makan Dulu, Bayar Kemudian</strong>. Pilih meja untuk ambil pesanan baru atau selesaikan bayaran bil.
              </p>
            </div>

            {/* Statistik Meja */}
            <div className="flex items-center gap-3">
              <div className="bg-stone-950 border border-stone-800 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Meja Kosong</span>
                <span className="text-lg font-black text-emerald-400">
                  {RESTAURANT_TABLES.filter(
                    (t) => !liveOrders.some((o) => o.type === 'dine_in' && o.tableNumber === t.id && !o.isPaid && o.status !== 'cancelled')
                  ).length}
                </span>
              </div>
              <div className="bg-stone-950 border border-amber-900/50 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Sedang Makan</span>
                <span className="text-lg font-black text-amber-400 animate-pulse">
                  {liveOrders.filter((o) => o.type === 'dine_in' && !o.isPaid && o.status !== 'cancelled').length}
                </span>
              </div>
            </div>
          </div>

          {/* Kad Utama Pilihan Bungkus (Takeaway) */}
          <div className="bg-gradient-to-r from-orange-950/40 via-stone-900 to-stone-900 border border-orange-800/60 rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-2xl shadow-md">
                🛍️
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">Pesanan Bungkus / Takeaway</h2>
                <p className="text-xs text-stone-300">Ambil pesanan pelanggan yang bawa pulang / bungkus</p>
              </div>
            </div>
            <button
              onClick={handleSelectTakeawayAndNavigate}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Buka Menu Bungkus</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Meja Restoran (Meja 1 hingga Meja 12 & VIP) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Pilih Meja Restoran:</span>
                <span className="text-xs text-stone-400 font-normal">(Tekan meja untuk mula atau urus pesanan)</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
              {RESTAURANT_TABLES.map((tbl) => {
                const activeOrd = liveOrders.find(
                  (o) => o.type === 'dine_in' && o.tableNumber === tbl.id && !o.isPaid && o.status !== 'cancelled'
                );

                return (
                  <div
                    key={tbl.id}
                    className={`rounded-2xl p-3.5 sm:p-4 border-2 transition-all flex flex-col justify-between select-none shadow-md ${
                      activeOrd
                        ? 'bg-gradient-to-b from-amber-950/60 to-stone-900 border-amber-600/90 hover:border-amber-500'
                        : 'bg-stone-900/90 border-stone-800 hover:border-orange-500 hover:bg-stone-850 cursor-pointer active:scale-98'
                    }`}
                    onClick={() => {
                      if (!activeOrd) {
                        handleSelectTableAndNavigate(tbl.id);
                      }
                    }}
                  >
                    {/* Header Meja & Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-white">{tbl.name}</span>
                      {activeOrd ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 uppercase tracking-wider animate-pulse">
                          Sedang Makan
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Kosong
                        </span>
                      )}
                    </div>

                    {/* Maklumat Status Meja */}
                    <div className="my-3">
                      {activeOrd ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-stone-400">Jumlah Bil:</span>
                            <span className="font-mono text-xl font-black text-orange-400">
                              RM {activeOrd.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-300 font-medium">
                            {activeOrd.items.reduce((a, b) => a + b.quantity, 0)} item • Jam {activeOrd.createdAt}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-stone-400">
                          <p className="text-xs text-stone-300 font-bold">Meja Tersedia</p>
                          <p className="text-[10px] text-stone-400">Tekan untuk buka meja baru</p>
                        </div>
                      )}
                    </div>

                    {/* Tindakan Mengikut Status Meja */}
                    <div className="pt-2 border-t border-stone-800/80">
                      {activeOrd ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTableAndNavigate(tbl.id);
                            }}
                            className="py-2 rounded-xl bg-stone-950 border border-stone-700 hover:border-orange-500 text-orange-400 font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSettleModal(activeOrd);
                            }}
                            className="py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Kira Bil</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectTableAndNavigate(tbl.id)}
                          className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Ambil Pesanan Meja</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SKRIN 2: PILIH MENU & HANTAR ORDER (PAGE KEDUA POS)       */}
      {/* ======================================================== */}
      {posView === 'menu' && (
        <div className="space-y-4">
          {/* Header Navigasi Skrin Menu */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 sticky top-14 z-30 backdrop-blur-md bg-stone-900/95">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPosView('tables')}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-stone-700 shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Pilihan Meja</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Pesanan Bungkus'}
                  </h2>
                  {activeTableOrder && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 animate-pulse">
                      Sedang Makan • Bil Semasa RM {activeTableOrder.total.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400">
                  {orderType === 'dine_in' ? 'Makan Dulu, Bayar Kemudian' : 'Pesanan Bawa Pulang'}
                </p>
              </div>
            </div>

            {/* Butang Ringkasan Troli & Kira Bil */}
            <div className="flex items-center gap-2">
              {activeTableOrder && (
                <button
                  type="button"
                  onClick={() => handleOpenSettleModal(activeTableOrder)}
                  className="hidden sm:flex px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md items-center gap-1.5"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Kira Bil (RM {activeTableOrder.total.toFixed(2)})</span>
                </button>
              )}

              {/* Toggle Tetapan Paparan */}
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  showSettingsDrawer ? 'bg-orange-600 text-white border-orange-500' : 'bg-stone-950 text-stone-400 border-stone-800'
                }`}
                title="Laras saiz & susunan"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Pelaras Saiz & Susunan (Bila Ditekan) */}
          {showSettingsDrawer && (
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-bold">Susunan Baris:</span>
                <div className="flex gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                  <button
                    onClick={() => handleSetColumns(4)}
                    className={`px-3 py-1 rounded font-black ${columnsCount === 4 ? 'bg-orange-600 text-white' : 'text-stone-400'}`}
                  >
                    4 Sebaris (Lalai)
                  </button>
                  <button
                    onClick={() => handleSetColumns(3)}
                    className={`px-3 py-1 rounded font-black ${columnsCount === 3 ? 'bg-orange-600 text-white' : 'text-stone-400'}`}
                  >
                    3 Sebaris
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-bold">Saiz Ikon:</span>
                <div className="flex gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                  <button
                    onClick={() => handleSetIconSize('md')}
                    className={`px-2.5 py-1 rounded font-bold ${iconSize === 'md' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
                  >
                    Sederhana (Lalai)
                  </button>
                  <button
                    onClick={() => handleSetIconSize('sm')}
                    className={`px-2.5 py-1 rounded font-bold ${iconSize === 'sm' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
                  >
                    Kecil
                  </button>
                  <button
                    onClick={() => handleSetIconSize('lg')}
                    className={`px-2.5 py-1 rounded font-bold ${iconSize === 'lg' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
                  >
                    Besar
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-bold">Saiz Font:</span>
                <div className="flex gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                  <button
                    onClick={() => handleSetTextSize('lg')}
                    className={`px-2.5 py-1 rounded font-black ${textSize === 'lg' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
                  >
                    Font Besar (Lalai)
                  </button>
                  <button
                    onClick={() => handleSetTextSize('md')}
                    className={`px-2.5 py-1 rounded font-black ${textSize === 'md' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
                  >
                    Font Biasa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bar Carian & Kategori Filter */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari sate ayam, soto, mee goreng, laici kang..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-stone-400 hover:text-white px-2 py-1"
                >
                  Padam
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
              {[
                { id: 'all', label: 'Semua Menu' },
                { id: 'sate', label: '🔥 Sate' },
                { id: 'istimewa', label: '🍲 Istimewa (Sup/Mee)' },
                { id: 'santai', label: '🍙 Santai & Bungkus' },
                { id: 'karipap', label: '🥟 Karipap & Frozen' },
                { id: 'minuman', label: '🥤 Minuman & LCK' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white font-bold shadow-sm'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* GRID MENU: 4 SEBARIS, IKON SEDERHANA, FONT BESAR          */}
          {/* ======================================================== */}
          <div
            className={`${
              columnsCount === 4
                ? 'grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-2.5'
                : 'grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5'
            }`}
          >
            {filteredMenu.map((item) => {
              const inCart = cart.find((i) => i.itemId === item.id);
              const isSatay = item.category === 'sate';
              const displayIcon = getItemDisplayIcon(item);

              // Saiz Ikon Sederhana (Lalai: h-16 sm:h-18, text-3xl)
              const iconBoxClass = {
                sm: 'h-14 text-2xl',
                md: 'h-16 sm:h-18 text-3xl sm:text-4xl',
                lg: 'h-22 sm:h-24 text-4xl',
              }[iconSize];

              // Font Besar (Lalai: text-xs sm:text-sm font-black)
              const titleTextClass = {
                sm: 'text-[11px] leading-tight font-black',
                md: 'text-xs leading-snug font-black',
                lg: 'text-xs sm:text-sm leading-snug font-black',
              }[textSize];

              const priceTextClass = {
                sm: 'text-[10px] font-bold',
                md: 'text-xs font-extrabold',
                lg: 'text-xs sm:text-sm font-extrabold',
              }[textSize];

              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item, isSatay ? 5 : 1)}
                  className={`group relative bg-stone-900 border rounded-2xl p-2 sm:p-2.5 cursor-pointer select-none transition-all flex flex-col justify-between hover:border-orange-500 hover:shadow-lg hover:shadow-orange-950/40 active:scale-95 ${
                    inCart ? 'border-orange-500 ring-2 ring-orange-500/60 shadow-md bg-stone-900/90' : 'border-stone-800'
                  }`}
                >
                  {/* 1. ATAS: Kotak Berbingkai Ikon Sederhana */}
                  <div
                    className={`w-full ${iconBoxClass} rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all ${
                      inCart
                        ? 'border-orange-500 bg-orange-950/20'
                        : 'border-stone-700/80 bg-stone-950/90 group-hover:border-stone-500'
                    }`}
                  >
                    <span className="filter drop-shadow-md transform group-hover:scale-110 transition-transform select-none">
                      {displayIcon.emoji}
                    </span>

                    {/* Lencana Kuantiti */}
                    {inCart && (
                      <span className="absolute top-1 right-1 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-orange-600 text-white shadow animate-pulse border border-orange-400">
                        {inCart.quantity}x
                      </span>
                    )}

                    {/* Simbol Stesen */}
                    <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1 rounded bg-stone-950/80 text-stone-400 border border-stone-800">
                      {item.station === 'grill' ? '🔥' : item.station === 'wok' ? '🍳' : '🥤'}
                    </span>
                  </div>

                  {/* 2. BAWAH: Nama Menu Font Besar + Harga */}
                  <div className="mt-1.5 flex-1 flex flex-col justify-between text-center">
                    <h3 className={`${titleTextClass} text-stone-100 group-hover:text-orange-400 line-clamp-2`}>
                      {item.name}
                    </h3>

                    <div className="mt-1 pt-1 border-t border-stone-800/80 flex flex-col items-center">
                      <span className={`font-mono ${priceTextClass} text-orange-400`}>
                        RM {item.price.toFixed(2)}
                      </span>

                      {/* Stepper Tambah/Tolak Kuantiti */}
                      {inCart ? (
                        <div
                          className="flex items-center justify-between w-full mt-1 bg-orange-950/80 border border-orange-600/70 rounded-lg p-0.5 text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, isSatay ? -5 : -1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-stone-900 text-orange-400 hover:bg-orange-600 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-black text-[11px] text-white">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(item, isSatay ? 5 : 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-orange-600 text-white hover:bg-orange-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-stone-400 font-medium mt-0.5">
                          /{item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* FLOATING ACTION BAR: HANTAR ORDER KE DAPUR               */}
          {/* ======================================================== */}
          <div className="fixed bottom-[4.75rem] left-3 right-3 sm:left-6 sm:right-6 z-40 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-2 border-orange-500/80 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-stone-100 backdrop-blur-md">
              {/* Info Troli */}
              <button
                type="button"
                onClick={() => setCartModalOpen(true)}
                className="flex items-center gap-2.5 text-left active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <span>{orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Bungkus'}</span>
                    <span className="text-orange-400">• {cart.reduce((a, b) => a + b.quantity, 0)} Item Dipilih</span>
                  </div>
                  <div className="font-mono text-base font-black text-white">
                    RM {subtotal.toFixed(2)}
                    {activeTableOrder && (
                      <span className="text-xs text-amber-300 font-normal ml-1">
                        (Bil Semasa: RM {activeTableOrder.total.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Butang Utama: Hantar Order ke Dapur (Makan Dulu) */}
              <div className="flex items-center gap-2">
                {cart.length > 0 ? (
                  <button
                    type="button"
                    onClick={activeTableOrder ? handleAppendOrder : handleSendToKitchen}
                    className="px-5 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-950/80 active:scale-95 flex items-center gap-2 cursor-pointer border border-orange-400"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {activeTableOrder ? 'Hantar Tambahan' : 'Hantar Order (Makan Dulu)'}
                    </span>
                  </button>
                ) : (
                  activeTableOrder && (
                    <button
                      type="button"
                      onClick={() => handleOpenSettleModal(activeTableOrder)}
                      className="px-5 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Kira Bil Meja</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SEMAKAN TROLI PESANAN                              */}
      {/* ======================================================== */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-orange-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-stone-100">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Semakan Pesanan: {orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Bungkus'}
                </h3>
                <p className="text-xs text-stone-400">Konsep: Makan Dulu, Bayar Kemudian</p>
              </div>
              <button onClick={() => setCartModalOpen(false)} className="text-stone-400 hover:text-white text-sm">
                Tutup
              </button>
            </div>

            {/* Senarai Item dalam Troli */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div key={item.itemId} className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-white">{item.name}</span>
                    <div className="text-[11px] text-stone-400 font-mono">
                      RM {item.price.toFixed(2)} × {item.quantity} = RM {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.itemId, item.station === 'grill' ? -5 : -1)} className="p-1 text-stone-400 hover:text-white">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold font-mono text-xs px-1 text-white">{item.quantity}</span>
                    <button onClick={() => addToCart(menu.find(m => m.id === item.itemId)!, item.station === 'grill' ? 5 : 1)} className="p-1 text-orange-400 hover:text-white">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Nota Khas */}
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan / nota (cth: kuah asing, kurang manis)"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
            />

            {/* Ringkasan Subtotal */}
            <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-sm font-black">
              <span className="text-stone-300">Jumlah Pesanan:</span>
              <span className="font-mono text-lg text-orange-400">RM {subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={activeTableOrder ? handleAppendOrder : handleSendToKitchen}
              className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Hantar ke Dapur Sekarang (Makan Dulu)</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KIRA BIL & BAYARAN MEJA (SELESAI MAKAN)             */}
      {/* ======================================================== */}
      {paymentModalOpen && settlingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-orange-800/60 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl relative text-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-white">
                  Kira Bil &amp; Bayaran (Selesai Makan)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {settlingOrder.tableNumber ? `Meja ${settlingOrder.tableNumber}` : 'Pesanan Bungkus'} • Tiket: {settlingOrder.orderNumber}
                </p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-stone-400 hover:text-white text-sm">
                Tutup
              </button>
            </div>

            {/* Ringkasan Makanan yang Dimakan */}
            <div className="max-h-40 overflow-y-auto bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs">
              {settlingOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-stone-300">
                  <span>{it.name} × {it.quantity}</span>
                  <span className="font-mono font-bold">RM {(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-800 flex justify-between font-extrabold text-sm text-orange-400">
                <span>Jumlah Perlu Dibayar:</span>
                <span className="font-mono text-base">RM {settlingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Kaedah Bayaran */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'duitnow_qr', label: 'DuitNow QR', icon: QrCode },
                { id: 'card', label: 'Kad', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                      paymentMethod === m.id
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Tunai & Baki */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs">
                <label className="text-stone-400 block font-bold">Wang Diterima (RM):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[settlingOrder.total, Math.ceil(settlingOrder.total / 10) * 10, 50, 100].map((amt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCashTendered(amt)}
                      className={`py-1.5 rounded font-mono font-black ${
                        cashTendered === amt ? 'bg-orange-600 text-white' : 'bg-stone-900 text-stone-300 border border-stone-800'
                      }`}
                    >
                      RM {amt.toFixed(0)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                  <span className="text-stone-400">Baki Pulangan:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    RM {Math.max(0, cashTendered - settlingOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'duitnow_qr' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-center space-y-1.5">
                <div className="w-24 h-24 mx-auto bg-white p-1.5 rounded-xl flex items-center justify-center">
                  <div className="w-full h-full border border-dashed border-rose-600 rounded flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-rose-600">DuitNow QR</span>
                    <span className="text-[10px] font-black text-stone-900 font-mono">RM {settlingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400">Imbas melalui Touch &apos;n Go / Bank</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-center space-y-1 text-xs">
                <CreditCard className="w-6 h-6 text-orange-400 mx-auto" />
                <p className="text-stone-300">Tap kad pada terminal juruwang.</p>
              </div>
            )}

            {/* Butang Sahkan Bayaran & Kosongkan Meja */}
            <button
              onClick={handleConfirmSettlement}
              disabled={paymentSuccess}
              className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                paymentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-lg cursor-pointer active:scale-95'
              }`}
            >
              {paymentSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                  <span>Bayaran Selesai! Meja Telah Dikosongkan</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Terima Bayaran &amp; Kosongkan Meja</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
