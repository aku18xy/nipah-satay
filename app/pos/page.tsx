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
  Users,
  Send
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

// Helper pemetaan ikon khas mengikut menu Nipah Satay (seperti lakaran pengguna)
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
  
  // Kawalan Saiz Ikon & Teks Boleh Ubah (Minima 3 sebaris melintang)
  const [columnsCount, setColumnsCount] = useState<3 | 4>(3);
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [cardDisplayType, setCardDisplayType] = useState<'icon' | 'photo'>('icon');
  
  // Pilihan Meja & Mod "Makan Dulu Bayar Kemudian"
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('M-02');
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Bayaran Bil Meja (Bila Selesai Makan)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'duitnow_qr' | 'card'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Ambil pesanan aktif dari pangkalan data Neon Postgres (Auto-poll 4s)
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

  // Muat tetapan saiz dari localStorage
  useEffect(() => {
    try {
      const savedCols = localStorage.getItem('pos_cols');
      if (savedCols === '3' || savedCols === '4') setColumnsCount(Number(savedCols) as 3 | 4);
      const savedIcon = localStorage.getItem('pos_icon_size');
      if (savedIcon === 'sm' || savedIcon === 'md' || savedIcon === 'lg') setIconSize(savedIcon);
      const savedText = localStorage.getItem('pos_text_size');
      if (savedText === 'sm' || savedText === 'md' || savedText === 'lg') setTextSize(savedText);
      const savedType = localStorage.getItem('pos_card_type');
      if (savedType === 'icon' || savedType === 'photo') setCardDisplayType(savedType);
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
  const handleSetCardType = (val: 'icon' | 'photo') => {
    setCardDisplayType(val);
    try { localStorage.setItem('pos_card_type', val); } catch (e) {}
  };

  // Semak sama ada meja yang dipilih kini ada pesanan aktif (Sedang Makan / Belum Bayar)
  const activeTableOrder = liveOrders.find(
    (o) => o.type === 'dine_in' && o.tableNumber === tableNumber && !o.isPaid && o.status !== 'cancelled'
  );

  // Filtered menu
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Operasi Troli
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

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. MAKAN DULU: Hantar Pesanan Baru Meja ke Dapur (Tanpa Bayaran Terdahulu)
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

      // Update state tempatan
      setLiveOrders((prev) => [newOrder, ...prev]);
      clearCart();
      showToast(
        orderType === 'dine_in'
          ? `🍽️ Pesanan Meja ${tableNumber} dihantar ke Dapur! Pelanggan makan dulu, bayar kemudian.`
          : `🛍️ Pesanan bungkus dihantar ke dapur!`
      );
    } catch (e) {
      console.error('Failed to submit order:', e);
      showToast('Gagal menghantar pesanan ke dapur');
    }
  };

  // 2. TAMBAH PESANAN: Pelanggan Meja Nak Tambah Makanan Semasa Sedang Makan
  const handleAppendOrder = async () => {
    if (!activeTableOrder || cart.length === 0) return;

    try {
      // Gabungkan item sedia ada dengan item baru
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

      // Kemaskini stesen status jika ada item baru
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
      showToast(`➕ Pesanan tambahan Meja ${tableNumber} dihantar ke Dapur!`);
    } catch (e) {
      showToast('Gagal menambah pesanan meja');
    }
  };

  // 3. BAYAR KEMUDIAN: Buka Modal Kira Bil Meja Bila Selesai Makan
  const handleOpenSettleModal = (orderToSettle: Order) => {
    setSettlingOrder(orderToSettle);
    setCashTendered(Math.ceil(orderToSettle.total / 5) * 5);
    setPaymentModalOpen(true);
  };

  // Selesaikan bayaran meja & kosongkan meja
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
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 border border-orange-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bar Pengurusan Meja Restoran (Konsep: Makan Dulu, Bayar Kemudian) */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-500" />
            <h2 className="font-extrabold text-xs sm:text-sm text-white">
              Pilihan Meja (Konsep: Makan Dulu, Bayar Kemudian)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Kosong
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Sedang Makan (Belum Bayar)
            </span>
          </div>
        </div>

        {/* Butang Grid Meja Restoran */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {RESTAURANT_TABLES.map((tbl) => {
            const activeOrd = liveOrders.find(
              (o) => o.type === 'dine_in' && o.tableNumber === tbl.id && !o.isPaid && o.status !== 'cancelled'
            );
            const isSelected = orderType === 'dine_in' && tableNumber === tbl.id;

            return (
              <button
                key={tbl.id}
                type="button"
                onClick={() => {
                  setOrderType('dine_in');
                  setTableNumber(tbl.id);
                  clearCart();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'ring-2 ring-orange-500 bg-orange-600 text-white border-orange-400 shadow-md'
                    : activeOrd
                    ? 'bg-amber-950/60 text-amber-200 border-amber-700/80 hover:bg-amber-900/60'
                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                <span>{tbl.name}</span>
                {activeOrd ? (
                  <span className="text-[10px] bg-amber-500/25 text-amber-300 px-1.5 py-0.2 rounded font-mono font-black border border-amber-500/40">
                    RM {activeOrd.total.toFixed(0)}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            );
          })}

          {/* Bungkus / Walk-in Button */}
          <button
            type="button"
            onClick={() => {
              setOrderType('takeaway');
              clearCart();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
              orderType === 'takeaway'
                ? 'ring-2 ring-orange-500 bg-orange-600 text-white border-orange-400 shadow-md'
                : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
            }`}
          >
            <span>🛍️ Bungkus / Walk-in</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Catalogue (7 cols) + Right Active Cart / Bill (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Area (7 cols): Menu Catalogue & Filter */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Category Pill Filters & Search */}
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
                      ? 'bg-orange-600 text-white font-bold shadow-sm shadow-orange-900/50'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Bar Pelaras Saiz & Susunan Grid (Boleh Ubah Minima 3 Sebaris) */}
            <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Pilihan Kolum (Minima 3 Sebaris Melintang) */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Susunan:</span>
                <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleSetColumns(3)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ${
                      columnsCount === 3
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                    title="Papar Minima 3 Ikon Sebaris Melintang"
                  >
                    3 Sebaris
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetColumns(4)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ${
                      columnsCount === 4
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                    title="Papar 4 Ikon Sebaris Melintang (Kompak)"
                  >
                    4 Sebaris
                  </button>
                </div>
              </div>

              {/* Pilihan Saiz Ikon (sm / md / lg) */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Saiz Ikon:</span>
                <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleSetIconSize(sz)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                        iconSize === sz
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {sz === 'sm' ? 'Kecil' : sz === 'md' ? 'Sedang' : 'Besar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilihan Saiz Teks (sm / md / lg) */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Saiz Teks:</span>
                <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleSetTextSize(sz)}
                      className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${
                        textSize === sz
                          ? 'bg-amber-500 text-stone-950 shadow-sm'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilihan Mod Paparan: Ikon vs Foto */}
              <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                <button
                  type="button"
                  onClick={() => handleSetCardType('icon')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                    cardDisplayType === 'icon'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Paparan Ikon Bersih Mengikut Lakaran"
                >
                  🎨 Ikon
                </button>
                <button
                  type="button"
                  onClick={() => handleSetCardType('photo')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                    cardDisplayType === 'photo'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title="Paparan Foto Sebenar"
                >
                  📷 Foto
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Grid (Minima 3 Sebaris Melintang & Format Lakaran: [Icon Box] + [Name]) */}
          <div
            className={`${
              columnsCount === 3
                ? 'grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5'
                : 'grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2'
            } overflow-y-auto lg:max-h-[calc(100vh-14rem)] pr-1 pb-32 lg:pb-0`}
          >
            {filteredMenu.map((item) => {
              const inCart = cart.find((i) => i.itemId === item.id);
              const isSatay = item.category === 'sate';
              const displayIcon = getItemDisplayIcon(item);

              const iconBoxClass = {
                sm: 'h-14 sm:h-16 text-2xl sm:text-3xl',
                md: 'h-18 sm:h-20 text-3xl sm:text-4xl',
                lg: 'h-24 sm:h-26 text-4xl sm:text-5xl',
              }[iconSize];

              const titleTextClass = {
                sm: 'text-[11px] sm:text-xs leading-tight font-black',
                md: 'text-xs sm:text-sm leading-snug font-black',
                lg: 'text-sm sm:text-base leading-snug font-black',
              }[textSize];

              const priceTextClass = {
                sm: 'text-[10px] sm:text-xs font-bold',
                md: 'text-xs sm:text-sm font-extrabold',
                lg: 'text-sm sm:text-base font-extrabold',
              }[textSize];

              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item, isSatay ? 5 : 1)}
                  className={`group relative bg-stone-900 border rounded-2xl p-2 sm:p-2.5 cursor-pointer select-none transition-all flex flex-col justify-between hover:border-orange-500 hover:shadow-lg hover:shadow-orange-950/40 active:scale-95 ${
                    inCart ? 'border-orange-500 ring-2 ring-orange-500/60 shadow-md bg-stone-900/90' : 'border-stone-800'
                  }`}
                >
                  {/* 1. ATAS: Kotak Berbingkai Ikon / Gambar (Format Lakaran) */}
                  <div
                    className={`w-full ${iconBoxClass} rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all ${
                      inCart
                        ? 'border-orange-500 bg-orange-950/20'
                        : 'border-stone-700/80 bg-stone-950/90 group-hover:border-stone-500'
                    }`}
                  >
                    {cardDisplayType === 'photo' && item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center select-none">
                        <span className="filter drop-shadow-md transform group-hover:scale-110 transition-transform">
                          {displayIcon.emoji}
                        </span>
                      </div>
                    )}

                    {inCart && (
                      <span className="absolute top-1 right-1 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-orange-600 text-white shadow-md animate-pulse border border-orange-400">
                        {inCart.quantity}x
                      </span>
                    )}

                    <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1 rounded bg-stone-950/80 text-stone-400 border border-stone-800">
                      {item.station === 'grill' ? '🔥' : item.station === 'wok' ? '🍳' : '🥤'}
                    </span>
                  </div>

                  {/* 2. BAWAH: Nama Menu (Format Lakaran: 'Satay ayam' + Harga) */}
                  <div className="mt-1.5 flex-1 flex flex-col justify-between text-center">
                    <h3 className={`${titleTextClass} text-stone-100 group-hover:text-orange-400 line-clamp-2`}>
                      {item.name}
                    </h3>

                    <div className="mt-1 pt-1 border-t border-stone-800/80 flex flex-col items-center">
                      <span className={`font-mono ${priceTextClass} text-orange-400`}>
                        RM {item.price.toFixed(2)}
                      </span>

                      {inCart ? (
                        <div
                          className="flex items-center justify-between w-full mt-1 bg-orange-950/80 border border-orange-600/70 rounded-lg p-0.5 text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, isSatay ? -5 : -1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-stone-900 text-orange-400 hover:bg-orange-600 hover:text-white"
                            title="Tolak kuantiti"
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
                            title="Tambah kuantiti"
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
        </div>

        {/* Right Area (5 cols): Active Cart & Table Tab Panel (Makan Dulu, Bayar Kemudian) */}
        <div id="pos-cart-panel" className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-xl flex flex-col justify-between overflow-hidden shadow-xl scroll-mt-20">
          {/* Header Panel Meja */}
          <div className="p-4 border-b border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-base text-white">
                    {orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Bungkus / Walk-in'}
                  </h3>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {orderType === 'dine_in' ? (
                    activeTableOrder ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Sedang Makan (Makan Dulu) • Tiket {activeTableOrder.orderNumber}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Meja Kosong • Sedia Ambil Pesanan
                      </span>
                    )
                  ) : (
                    'Pesanan bawa pulang / bungkus'
                  )}
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Troli</span>
                </button>
              )}
            </div>

            {/* Nama Pelanggan (Pilihan) */}
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan / nota khas (cth: En Razak)"
              className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Kandungan: Senarai Pesanan Sedia Ada & Troli Tambahan */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-28rem)]">
            {/* JIKA MEJA SEDANG MAKAN: Paparkan bil sedia ada */}
            {activeTableOrder && (
              <div className="space-y-2.5 bg-stone-950/90 border border-amber-900/50 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-800">
                  <span className="font-extrabold text-amber-300 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5" /> Item Telah Dihantar ke Dapur:
                  </span>
                  <span className="font-mono text-stone-400 text-[11px]">{activeTableOrder.createdAt}</span>
                </div>

                <div className="space-y-1.5 divide-y divide-stone-900">
                  {activeTableOrder.items.map((item, idx) => (
                    <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-200">{item.name}</span>
                        <span className="text-stone-400 text-[11px] ml-1.5">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-stone-300">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-amber-900/60 flex justify-between items-center text-xs font-black">
                  <span className="text-stone-300">Jumlah Bil Semasa:</span>
                  <span className="font-mono text-sm text-amber-400">RM {activeTableOrder.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ITEM TAMBAHAN BARU DALAM TROLI */}
            {cart.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-orange-400">
                  <span>{activeTableOrder ? '➕ Item Tambahan Baru:' : '🛒 Item Pesanan Baru:'}</span>
                  <span>{cart.reduce((a, b) => a + b.quantity, 0)} item</span>
                </div>

                <div className="space-y-2">
                  {cart.map((item) => {
                    const isSatay = item.station === 'grill';
                    const step = isSatay ? 5 : 1;

                    return (
                      <div
                        key={item.itemId}
                        className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isSatay && (
                              <span className="text-[10px] text-orange-400 font-mono">🔥 Arang</span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
                            RM {item.price.toFixed(2)} × {item.quantity} = <strong className="text-stone-200">RM {(item.price * item.quantity).toFixed(2)}</strong>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.itemId, -step)}
                            className="p-1 text-stone-400 hover:text-white rounded hover:bg-stone-800"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold font-mono text-sm px-1.5 text-white min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.itemId, step)}
                            className="p-1 text-orange-400 hover:text-white rounded hover:bg-stone-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              !activeTableOrder && (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-stone-500 opacity-60" />
                  <p className="text-xs font-bold text-stone-300">Troli pesanan kosong</p>
                  <p className="text-[11px] text-stone-400">Pilih menu dari katalog untuk mula ambil pesanan meja.</p>
                </div>
              )
            )}
          </div>

          {/* Footer & Tindakan Utama (Hantar ke Dapur vs Kira Bil) */}
          <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
            {/* Automatic Condiment Notification */}
            {totalSticks > 0 && (
              <div className="bg-orange-950/40 border border-orange-900/40 rounded-lg p-2 flex items-center justify-between text-[11px] text-orange-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Kuah Kacang & Timun Percuma:
                </span>
                <strong className="font-bold">{Math.max(1, freeGravyPortions)} hidangan</strong>
              </div>
            )}

            {/* RINGKASAN HARGA */}
            <div className="space-y-1 text-xs">
              {cart.length > 0 && (
                <div className="flex justify-between text-stone-400">
                  <span>Pesanan Tambahan Dalam Troli:</span>
                  <span className="font-mono font-bold text-white">RM {subtotal.toFixed(2)}</span>
                </div>
              )}
              {activeTableOrder && (
                <div className="flex justify-between text-stone-400">
                  <span>Bil Sedia Ada:</span>
                  <span className="font-mono font-bold text-amber-300">RM {activeTableOrder.total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-stone-800">
                <span>Jumlah Keseluruhan</span>
                <span className="font-mono text-xl text-orange-400">
                  RM {(activeTableOrder ? activeTableOrder.total + subtotal : subtotal).toFixed(2)}
                </span>
              </div>
            </div>

            {/* BUTANG TINDAKAN (MAKAN DULU VS BAYAR SELESAI) */}
            <div className="space-y-2 pt-1">
              {/* JIKA ADA PESANAN BARU DALAM TROLI: Hantar ke Dapur */}
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={activeTableOrder ? handleAppendOrder : handleSendToKitchen}
                  className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {activeTableOrder
                      ? `Hantar Tambahan ke Dapur (+RM ${subtotal.toFixed(2)})`
                      : `Hantar ke Dapur (Makan Dulu) • RM ${subtotal.toFixed(2)}`}
                  </span>
                </button>
              )}

              {/* JIKA MEJA SEDANG MAKAN: Butang Kira Bil & Bayar Meja */}
              {activeTableOrder && (
                <button
                  type="button"
                  onClick={() => handleOpenSettleModal(activeTableOrder)}
                  className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Kira Bil &amp; Bayar Meja (RM {activeTableOrder.total.toFixed(2)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button for Mobile View */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-[5.25rem] left-3 right-3 z-40">
          <button
            onClick={() => {
              const cartElem = document.getElementById('pos-cart-panel');
              cartElem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between font-black border border-orange-400 active:scale-95 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cart.reduce((a, b) => a + b.quantity, 0)} Item Dipilih</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold">RM {subtotal.toFixed(2)}</span>
              <span className="text-xs bg-black/30 px-2.5 py-1 rounded-xl">Troli Pesanan ↓</span>
            </div>
          </button>
        </div>
      )}

      {/* Modal Bayaran Bil Meja (Bila Pelanggan Selesai Makan) */}
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
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>

            {/* Ringkasan Item Pesanan */}
            <div className="max-h-36 overflow-y-auto bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1 text-xs">
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

            {/* Pilihan Kaedah Bayaran */}
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

            {/* Input Tunai & Pengiraan Baki */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2.5 bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs">
                <label className="text-stone-400 block font-bold">Pilihan Wang Diterima (RM):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    settlingOrder.total,
                    Math.ceil(settlingOrder.total / 10) * 10,
                    50,
                    100
                  ].map((amt, idx) => (
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
                  <span className="text-stone-400">Baki Wang Pulangan:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    RM {Math.max(0, cashTendered - settlingOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* DuitNow QR View */}
            {paymentMethod === 'duitnow_qr' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-center space-y-2">
                <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed border-rose-600 rounded flex flex-col items-center justify-center p-1">
                    <span className="text-[9px] font-black text-rose-600">DuitNow QR</span>
                    <span className="text-[10px] font-black text-stone-900 font-mono">RM {settlingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400">Imbas melalui Touch &apos;n Go / Bank untuk bayaran meja</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-center space-y-1 text-xs">
                <CreditCard className="w-6 h-6 text-orange-400 mx-auto" />
                <p className="text-stone-300">Tap atau masukkan kad pada terminal juruwang.</p>
              </div>
            )}

            {/* Butang Sahkan Bayaran & Kosongkan Meja */}
            <button
              onClick={handleConfirmSettlement}
              disabled={paymentSuccess}
              className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                paymentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-lg shadow-emerald-950/80 cursor-pointer active:scale-95'
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
