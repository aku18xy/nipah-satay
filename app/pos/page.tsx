'use client';

import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '@/lib/data';
import { MenuItem, Category, OrderItem } from '@/lib/types';

export default function PosPage() {
  const [menu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const completePayment = () => {
    setPaymentSuccess(true);
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
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-y-auto lg:max-h-[calc(100vh-13rem)] pr-1 pb-32 lg:pb-0">
          {filteredMenu.map((item) => {
            const inCart = cart.find((i) => i.itemId === item.id);
            const isSatay = item.category === 'sate';

            return (
              <div
                key={item.id}
                onClick={() => addToCart(item, isSatay ? 5 : 1)}
                className={`group relative bg-stone-900 border rounded-2xl overflow-hidden cursor-pointer select-none transition-all flex flex-col justify-between hover:border-orange-500/80 hover:shadow-lg hover:shadow-orange-950/40 min-h-[185px] sm:min-h-[220px] ${
                  inCart ? 'border-orange-500 ring-2 ring-orange-500/50 shadow-md' : 'border-stone-800'
                }`}
              >
                {/* Photo & Badge */}
                <div className="h-24 sm:h-28 w-full relative bg-stone-950 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-2 text-center">
                      <span className="text-2xl mb-0.5 select-none">
                        {item.category === 'minuman' ? '🥤' : item.category === 'karipap' ? '🥟' : item.category === 'santai' ? '🍙' : '🍲'}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-200 line-clamp-1 max-w-full px-1">
                        {item.name}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/90 text-stone-300 backdrop-blur-sm border border-stone-700/50">
                    {item.station === 'grill' ? '🔥 Panggangan' : item.station === 'wok' ? '🍳 Wok' : '🥤 Bar/Prep'}
                  </span>

                  {/* Selected count badge */}
                  {inCart && (
                    <span className="absolute top-2 right-2 text-xs font-black px-2 py-0.5 rounded-full bg-orange-600 text-white shadow-md animate-pulse">
                      {inCart.quantity}x
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between flex-shrink-0 min-h-[85px]">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-orange-400 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-stone-800/80">
                    <span className="font-mono font-bold text-xs sm:text-sm text-orange-400">
                      RM {item.price.toFixed(2)}
                      <span className="text-[10px] text-stone-400 font-normal ml-0.5">/{item.unit}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, isSatay ? 5 : 1);
                      }}
                      className="p-1 sm:p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
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
