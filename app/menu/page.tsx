'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Flame, 
  ShoppingBag, 
  Plus, 
  Minus, 
  MapPin, 
  Clock, 
  Phone, 
  Sparkles, 
  Check, 
  Send,
  Truck,
  Store,
  Calendar
} from 'lucide-react';
import { INITIAL_MENU_ITEMS } from '@/lib/data';
import { MenuItem } from '@/lib/types';

export default function CustomerMenuPage() {
  const [menu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'catering'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredItems = selectedCat === 'all' 
    ? menu 
    : menu.filter((i) => i.category === selectedCat);

  const addToCart = (item: MenuItem, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [...prev, { item, quantity: item.category === 'sate' ? Math.max(item.minOrder || 5, qty) : qty }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.item.id === itemId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[];
    });
  };

  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const totalSticks = cart
    .filter((c) => c.item.station === 'grill')
    .reduce((acc, c) => acc + c.quantity, 0);

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    let text = `*TEMPAHAN NIPAH SATAY™ - PULAU INDAH*\n\n`;
    text += `👤 *Nama:* ${customerName || 'Pelanggan'}\n`;
    text += `📞 *Telefon:* ${customerPhone || '-'}\n`;
    text += `🛵 *Jenis Pesanan:* ${orderType === 'delivery' ? 'Penghantaran (Delivery)' : orderType === 'pickup' ? 'Ambil Sendiri (Self-Pickup)' : 'Katering Kenduri'}\n`;
    if (address && orderType === 'delivery') {
      text += `📍 *Alamat:* ${address}\n`;
    }
    text += `\n*SENARAI PESANAN:*\n`;
    cart.forEach((c) => {
      text += `• ${c.quantity}x ${c.item.name} = RM ${(c.item.price * c.quantity).toFixed(2)}\n`;
    });
    text += `\n🍢 *Jumlah Cucuk Sate:* ${totalSticks} cucuk\n`;
    text += `💰 *Jumlah Bayaran:* RM ${subtotal.toFixed(2)}\n`;
    if (notes) {
      text += `📝 *Nota:* ${notes}\n`;
    }
    text += `\n_Pesanan dijana melalui Nipah Satay™ Web App_`;

    const encoded = encodeURIComponent(text);
    // WhatsApp Tempahan Rasmi Nipah Satay Pulau Indah
    window.open(`https://wa.me/60173659302?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-950 via-stone-900 to-amber-950 border border-orange-900/40 p-6 sm:p-8 text-white shadow-2xl">
        <div className="max-w-2xl space-y-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-orange-600 text-white uppercase tracking-wider">
            Rasa Asli... Pasti Dicari!
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Nipah Satay™ Pulau Indah
          </h1>
          <p className="text-sm text-stone-300">
            Sate Ayam, Daging, Kambing, Perut berjus dibakar atas arang bakau asli. Lengkap dengan Soto herba, Mee Rebus, Mee &amp; Bihun Sup, Nasi Lemak Bungkus, Karipap Inti Padat &amp; Lai Chee Kang madu.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-400" />
              Laguna Park, Pulau Indah, Klang
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <Clock className="w-4 h-4 text-amber-400" />
              3:00 PM - 11:00 PM (Ahad Cuti)
            </span>
            <a 
              href="https://wa.me/60173659302" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
            >
              <Phone className="w-4 h-4" />
              017 365 9302
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-stone-400">
            <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700">FB: Nipah Satay Pulau Indah</span>
            <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700">IG: Nipah Satay</span>
            <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700">TikTok: @tok.nipah.satay</span>
          </div>
        </div>
      </div>

      {/* Ordering Method Selector */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xl mx-auto text-xs font-bold">
        {[
          { id: 'pickup', label: 'Ambil Sendiri (Pickup)', icon: Store },
          { id: 'delivery', label: 'Penghantaran (Delivery)', icon: Truck },
          { id: 'catering', label: 'Katering Acara', icon: Calendar },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setOrderType(t.id as any)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                orderType === t.id
                  ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-950/60'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Menu vs Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Menu Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'Semua Menu' },
              { id: 'sate', label: '🍢 Sate' },
              { id: 'istimewa', label: '🍲 Istimewa (Sup & Mee)' },
              { id: 'santai', label: '🍙 Santai & Bungkus' },
              { id: 'karipap', label: '🥟 Karipap & Frozen' },
              { id: 'minuman', label: '🥤 Minuman & LCK' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? 'bg-orange-600 text-white font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c.item.id === item.id);
              const isSatay = item.category === 'sate';

              return (
                <div
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-orange-500/50 transition-all shadow-md group"
                >
                  <div className="h-36 w-full relative bg-stone-950">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-700">
                        <Flame className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-orange-400">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-orange-400">
                        RM {item.price.toFixed(2)}
                        <span className="text-[11px] text-stone-400 font-normal ml-0.5">/{item.unit}</span>
                      </span>

                      <button
                        onClick={() => addToCart(item, isSatay ? 10 : 1)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isSatay ? '+10 Cucuk' : '+ Tambah'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Cart / WhatsApp Order Generator (4 cols) */}
        <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                Bakul Pesanan Anda
              </h2>
              <span className="text-xs text-stone-400 font-mono">
                {cart.reduce((a, b) => a + b.quantity, 0)} item
              </span>
            </div>

            <div className="divide-y divide-stone-800/80 max-h-64 overflow-y-auto my-3 pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  Bakul masih kosong. Pilih hidangan pilihan anda!
                </div>
              ) : (
                cart.map((c) => (
                  <div key={c.item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{c.item.name}</div>
                      <div className="text-stone-400 text-[11px] font-mono">
                        RM {c.item.price.toFixed(2)} × {c.quantity} = RM {(c.item.price * c.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(c.item.id, c.item.category === 'sate' ? -5 : -1)}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold font-mono px-2 text-white">{c.quantity}</span>
                      <button
                        onClick={() => updateQuantity(c.item.id, c.item.category === 'sate' ? 5 : 1)}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-orange-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Contact Details */}
            <div className="space-y-2 text-xs pt-2 border-t border-stone-800">
              <input
                type="text"
                placeholder="Nama Anda..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
              />
              <input
                type="text"
                placeholder="No. Telefon WhatsApp..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
              />
              {orderType === 'delivery' && (
                <textarea
                  rows={2}
                  placeholder="Alamat Penghantaran di Pulau Indah / Klang..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                />
              )}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="flex justify-between items-center text-sm font-extrabold text-white">
              <span>Jumlah Keseluruhan:</span>
              <span className="font-mono text-xl text-orange-400">RM {subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSendWhatsApp}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                cart.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-950/60'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Hantar Pesanan Terus ke WhatsApp Kedai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
