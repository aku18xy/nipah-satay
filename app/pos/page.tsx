'use client';

import React, { useState, useEffect } from 'react';
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
  SlidersHorizontal,
  Grid
} from 'lucide-react';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '@/lib/data';
import { MenuItem, Category, OrderItem } from '@/lib/types';

// Helper pemetaan ikon khas mengikut menu Nipah Satay (seperti lakaran)
function getItemDisplayIcon(item: MenuItem): { emoji: string; accentColor: string } {
  const name = item.name.toLowerCase();
  
  if (name.includes('ayam')) {
    return { emoji: '🐔', accentColor: 'text-amber-400' };
  }
  if (name.includes('daging') || name.includes('lembu')) {
    return { emoji: '🥩', accentColor: 'text-red-400' };
  }
  if (name.includes('kambing')) {
    return { emoji: '🐐', accentColor: 'text-orange-400' };
  }
  if (name.includes('perut') || name.includes('babat')) {
    return { emoji: '🍢', accentColor: 'text-yellow-400' };
  }
  if (name.includes('ketupat')) {
    return { emoji: '🍙', accentColor: 'text-emerald-400' };
  }
  if (name.includes('soto') || name.includes('sup')) {
    return { emoji: '🍲', accentColor: 'text-amber-400' };
  }
  if (name.includes('mee') || name.includes('mihun') || name.includes('bihun')) {
    return { emoji: '🍜', accentColor: 'text-yellow-400' };
  }
  if (name.includes('nasi lemak') || name.includes('set santai')) {
    return { emoji: '🍛', accentColor: 'text-emerald-400' };
  }
  if (name.includes('karipap')) {
    return { emoji: '🥟', accentColor: 'text-amber-400' };
  }
  if (name.includes('lai chee kang') || name.includes('lck')) {
    return { emoji: '🍧', accentColor: 'text-rose-400' };
  }
  if (name.includes('teh')) {
    return { emoji: '🫖', accentColor: 'text-amber-400' };
  }
  if (name.includes('kopi') || name.includes('nescafe')) {
    return { emoji: '☕', accentColor: 'text-amber-600' };
  }
  if (name.includes('milo') || name.includes('horlicks') || name.includes('neslo')) {
    return { emoji: '🍫', accentColor: 'text-amber-500' };
  }
  if (name.includes('limau') || name.includes('lemon')) {
    return { emoji: '🍋', accentColor: 'text-yellow-400' };
  }
  if (name.includes('laici')) {
    return { emoji: '🍒', accentColor: 'text-pink-400' };
  }
  if (name.includes('barli')) {
    return { emoji: '🌾', accentColor: 'text-amber-300' };
  }
  if (name.includes('sirap')) {
    return { emoji: '🧃', accentColor: 'text-rose-400' };
  }
  if (name.includes('coke') || name.includes('100 plus') || name.includes('soya')) {
    return { emoji: '🥫', accentColor: 'text-blue-400' };
  }
  if (name.includes('ais') || name.includes('mineral')) {
    return { emoji: '🧊', accentColor: 'text-cyan-400' };
  }
  if (item.category === 'minuman') {
    return { emoji: '🥤', accentColor: 'text-sky-400' };
  }
  return { emoji: '🍢', accentColor: 'text-orange-400' };
}

export default function PosPage() {
  const [menu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Kawalan Saiz Ikon & Teks Boleh Ubah (Minima 3 sebaris melintang)
  const [columnsCount, setColumnsCount] = useState<3 | 4>(3); // 3 sebaris (minima) atau 4 sebaris
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md'); // Saiz kotak ikon
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md'); // Saiz teks nama & harga
  const [cardDisplayType, setCardDisplayType] = useState<'icon' | 'photo'>('icon'); // Lakaran Ikon vs Foto
  
  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('M-02');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'duitnow_qr' | 'card'>('duitnow_qr');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  // Filtered menu
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (item: MenuItem, qtyDelta: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        const newQty = existing.quantity + qtyDelta;
        if (newQty <= 0) {
          return prev.filter((i) => i.itemId !== item.id);
        }
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
    setNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSticks = cart
    .filter((i) => i.station === 'grill')
    .reduce((acc, i) => acc + i.quantity, 0);

  // Complimentary condiments estimation: 1 complimentary portion of kuah & timun per 10 sticks
  const freeGravyPortions = Math.floor(totalSticks / 10);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCashTendered(Math.ceil(subtotal / 5) * 5); // default cash rounded to next RM5
    setPaymentModalOpen(true);
  };

  const completePayment = async () => {
    setPaymentSuccess(true);
    try {
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `#NS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        customerName: customerName.trim() || (orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Bungkus Walk-in'),
        items: cart,
        status: 'pending',
        stationStatus: {
          grill: cart.some(i => i.station === 'grill') ? 'pending' : 'done',
          wok: cart.some(i => i.station === 'wok') ? 'pending' : 'done',
          prep_bar: cart.some(i => i.station === 'prep_bar') ? 'pending' : 'done',
        },
        paymentMethod,
        isPaid: true,
        subtotal,
        discount: 0,
        total: subtotal,
        createdAt: new Date().toISOString(),
      };

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (e) {
      console.error('Failed to submit order to API:', e);
    }

    setTimeout(() => {
      setPaymentSuccess(false);
      setPaymentModalOpen(false);
      clearCart();
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-20 lg:pb-0">
      {/* Left Area (7 cols): Menu Catalogue & Filter */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Category Pill Filters & Search */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 space-y-3">
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

            // Kelas dinamik saiz kotak ikon
            const iconBoxClass = {
              sm: 'h-14 sm:h-16 text-2xl sm:text-3xl',
              md: 'h-18 sm:h-20 text-3xl sm:text-4xl',
              lg: 'h-24 sm:h-26 text-4xl sm:text-5xl',
            }[iconSize];

            // Kelas dinamik saiz teks nama
            const titleTextClass = {
              sm: 'text-[11px] sm:text-xs leading-tight font-black',
              md: 'text-xs sm:text-sm leading-snug font-black',
              lg: 'text-sm sm:text-base leading-snug font-black',
            }[textSize];

            // Kelas dinamik saiz harga
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
                {/* 1. ATAS: Kotak Berbingkai Ikon / Gambar (Format Lakaran Pengguna) */}
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

                  {/* Lencana Bilangan Dipilih di Bucu Kotak */}
                  {inCart && (
                    <span className="absolute top-1 right-1 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-orange-600 text-white shadow-md animate-pulse border border-orange-400">
                      {inCart.quantity}x
                    </span>
                  )}

                  {/* Simbol Stesen di Bucu Bawah Kiri */}
                  <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1 rounded bg-stone-950/80 text-stone-400 border border-stone-800">
                    {item.station === 'grill' ? '🔥' : item.station === 'wok' ? '🍳' : '🥤'}
                  </span>
                </div>

                {/* 2. BAWAH: Nama Menu (Format Lakaran: 'Satay ayam' + Harga) */}
                <div className="mt-1.5 flex-1 flex flex-col justify-between text-center">
                  <h3 className={`${titleTextClass} text-stone-100 group-hover:text-orange-400 line-clamp-2`}>
                    {item.name}
                  </h3>

                  {/* Harga & Kawalan Kuantiti Pantas */}
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

      {/* Right Area (5 cols): Active Cart & Checkout Panel */}
      <div id="pos-cart-panel" className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-xl flex flex-col justify-between overflow-hidden shadow-xl scroll-mt-20">
        {/* Cart Header */}
        <div className="p-4 border-b border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="font-extrabold text-base text-white">Pesanan Semasa</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Batal Semua</span>
              </button>
            )}
          </div>

          {/* Dine-in vs Takeaway Toggle */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`py-2 rounded-lg transition-all ${
                orderType === 'dine_in'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
              }`}
            >
              Makan Sini (Dine-In)
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-2 rounded-lg transition-all ${
                orderType === 'takeaway'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
              }`}
            >
              Bungkus / Takeaway
            </button>
          </div>

          {/* Table Selector (If Dine-In) */}
          {orderType === 'dine_in' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-semibold">Nombor Meja:</span>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-xs font-bold text-orange-400 focus:outline-none"
              >
                {['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-06', 'M-07', 'M-08', 'M-09', 'M-10', 'VIP-1'].map((tbl) => (
                  <option key={tbl} value={tbl}>{tbl}</option>
                ))}
              </select>
            </div>
          ) : (
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan / No. Telefon..."
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[calc(100vh-25rem)]">
          {cart.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-stone-400 text-center">
              <Flame className="w-10 h-10 mb-2 opacity-30 text-orange-500" />
              <p className="text-sm font-semibold">Bakul pesanan masih kosong</p>
              <p className="text-xs text-stone-400 mt-0.5">Pilih sate atau hidangan dari menu di sebelah kiri</p>
            </div>
          ) : (
            cart.map((item) => {
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
            })
          )}
        </div>

        {/* Cart Footer & Summary */}
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

          {/* Subtotal & Summary */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Jumlah Item ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>RM {subtotal.toFixed(2)}</span>
            </div>
            {totalSticks > 0 && (
              <div className="flex justify-between text-stone-400">
                <span>Jumlah Cucuk Sate</span>
                <span className="font-bold text-orange-400">{totalSticks} cucuk</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-stone-800">
              <span>Jumlah Bayaran</span>
              <span className="font-mono text-xl text-orange-400">RM {subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              cart.length > 0
                ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/80 cursor-pointer hover:scale-[1.01]'
                : 'bg-stone-800 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Bayar & Hantar ke Dapur (RM {subtotal.toFixed(2)})</span>
          </button>
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

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-orange-900/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-white">Pembayaran Pesanan</h3>
                <p className="text-xs text-stone-400">
                  {orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Pesanan Bungkus'} • Jumlah: <strong className="text-orange-400">RM {subtotal.toFixed(2)}</strong>
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'duitnow_qr', label: 'DuitNow QR', icon: QrCode },
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'card', label: 'Kad / Terminal', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                      paymentMethod === m.id
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/60'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Content */}
            {paymentMethod === 'duitnow_qr' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-center space-y-3">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                  {/* Visual DuitNow QR placeholder */}
                  <div className="w-full h-full border-4 border-dashed border-rose-600 rounded flex flex-col items-center justify-center p-1 text-center">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">DuitNow QR</span>
                    <span className="text-[9px] text-stone-700 font-bold mt-1">NIPAH SATAY</span>
                    <span className="text-[11px] font-black text-stone-900 mt-1 font-mono">RM {subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-300">
                  Imbas menggunakan mana-mana Aplikasi Bank / Touch &apos;n Go eWallet
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-stone-950 border border-stone-800 rounded-xl p-4">
                <label className="text-xs text-stone-400 block">Jumlah Tunai Diterima (RM):</label>
                <div className="flex gap-2">
                  {[subtotal, Math.ceil(subtotal / 10) * 10, 50, 100].map((amt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCashTendered(amt)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono font-bold ${
                        cashTendered === amt ? 'bg-orange-600 text-white' : 'bg-stone-900 text-stone-300 border border-stone-800'
                      }`}
                    >
                      RM {amt.toFixed(0)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-800 text-xs">
                  <span className="text-stone-400">Baki Pulangan:</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    RM {Math.max(0, cashTendered - subtotal).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-center space-y-2">
                <CreditCard className="w-8 h-8 text-orange-400 mx-auto" />
                <p className="text-xs text-stone-300">Sila masukkan atau tap kad pada mesin terminal pembayaran.</p>
              </div>
            )}

            {/* Confirm Payment Action */}
            <button
              onClick={completePayment}
              disabled={paymentSuccess}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                paymentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg'
              }`}
            >
              {paymentSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                  <span>Bayaran Disahkan! Tiket Dihantar ke KDS</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Sahkan Bayaran & Cetak Tiket Dapur</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
