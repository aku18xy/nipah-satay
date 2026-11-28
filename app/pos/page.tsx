'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
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
  CheckCircle2, 
  ArrowLeft,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Thermometer,
  Layers
} from 'lucide-react';
import RadialThumbArc from '@/components/RadialThumbArc';
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

// Helper pemetaan ikon makanan Nipah Satay
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

// Kategori POS Utama Nipah Satay
const POS_CATEGORIES = [
  { id: 'all', label: 'Semua', icon: '🔥' },
  { id: 'sate', label: 'Sate', icon: '🍢' },
  { id: 'istimewa', label: 'Sup/Mee', icon: '🍲' },
  { id: 'santai', label: 'Nasi', icon: '🍙' },
  { id: 'karipap', label: 'Karipap', icon: '🥟' },
  { id: 'minuman', label: 'Air', icon: '🥤' },
];

// Pilihan Suhu & Variasi mengikut Kategori (Attribute Panas / Sejuk)
function getItemTemperatureOptions(item: MenuItem): { id: string; label: string; icon: string }[] {
  if (item.category === 'minuman') {
    return [
      { id: 'Ais', label: 'Ais / Sejuk', icon: '🧊' },
      { id: 'Panas', label: 'Panas', icon: '♨️' },
      { id: 'Biasa', label: 'Suam / Biasa', icon: '🥤' },
    ];
  }
  if (item.category === 'sate') {
    return [
      { id: 'Kuah Asing', label: 'Kuah Asing', icon: '🥜' },
      { id: 'Kuah Campur', label: 'Kuah Campur', icon: '🍲' },
      { id: 'Pedas Ekstra', label: 'Pedas Ekstra', icon: '🌶️' },
    ];
  }
  if (item.category === 'istimewa' || item.category === 'santai' || item.category === 'soto' || item.category === 'makanan_panas') {
    return [
      { id: 'Panas Segar', label: 'Panas Segar', icon: '♨️' },
      { id: 'Pedas', label: 'Pedas', icon: '🌶️' },
      { id: 'Kurang Sayur', label: 'Kurang Sayur', icon: '🥬' },
    ];
  }
  if (item.category === 'karipap') {
    return [
      { id: 'Panas Garing', label: 'Panas Garing', icon: '♨️' },
      { id: 'Suhu Bilik', label: 'Suhu Bilik', icon: '🥟' },
      { id: 'Bungkus Asing', label: 'Bungkus Asing', icon: '📦' },
    ];
  }
  return [
    { id: 'Panas', label: 'Panas', icon: '♨️' },
    { id: 'Sejuk', label: 'Sejuk', icon: '🧊' },
  ];
}

// Kata kunci cepat untuk Permintaan Khas (Attribute Open-Ended)
function getItemQuickNotes(item: MenuItem): string[] {
  if (item.category === 'minuman') {
    return ['Kurang Manis', 'Kurang Ais', 'Extra Manis', 'Kaw', 'Kosong', 'Bungkus'];
  }
  if (item.category === 'sate') {
    return ['Bakar Garing', 'Kurang Minyak', 'Kuah Lebih', 'Timun Lebih', 'Bawang Lebih'];
  }
  if (item.category === 'istimewa' || item.category === 'santai' || item.category === 'soto') {
    return ['Tanpa Taugeh', 'Kuah Asing', 'Kuah Lebih', 'Sambal Asing', 'Tak Mau Pedas'];
  }
  return ['Bungkus Asing', 'Panaskan Dulu', 'Makan Sini', 'Sos Lebih'];
}

export default function PosPage() {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string }[]>(POS_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Navigasi POS: 'tables' (Skrin 1) vs 'menu' (Skrin 2)
  const [posView, setPosView] = useState<'tables' | 'menu'>('tables');

  // Top Dynamic Island Notification State (Semua notifikasi menggunakan morph island atas)
  const [islandNotification, setIslandNotification] = useState<string | null>(null);
  const islandNotificationTimer = useRef<NodeJS.Timeout | null>(null);

  const showIslandNotification = useCallback((msg: string, duration = 2500) => {
    // Bersihkan emoji tanda tick berulang jika mesej sudah ada ikon sendiri
    const cleanMsg = msg.replace(/^✅\s*/, '');
    setIslandNotification(cleanMsg);
    if (islandNotificationTimer.current) clearTimeout(islandNotificationTimer.current);
    islandNotificationTimer.current = setTimeout(() => {
      setIslandNotification(null);
    }, duration);
  }, []);

  // Multi-Attribute Accordion Matrix State
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [matrixQty, setMatrixQty] = useState<number>(1);
  const [matrixTemp, setMatrixTemp] = useState<string>('Ais');
  const [matrixNotes, setMatrixNotes] = useState<string>('');
  
  // Pilihan Meja, Bungkus & Troli
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('M-01');
  const [selectedTakeawayOrder, setSelectedTakeawayOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [liveOrders, setLiveOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

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

  // Semak pesanan aktif meja yang dipilih
  const activeTableOrder = liveOrders.find(
    (o) => o.type === 'dine_in' && o.tableNumber === tableNumber && !o.isPaid && o.status !== 'cancelled'
  );

  // Tapis katalog menu mengikut pilihan rotari Radial Thumb Arc
  const filteredMenu = menu.filter((item) => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  const activeExpandedItem = menu.find((m) => m.id === expandedItemId);

  const showToast = (msg: string) => {
    showIslandNotification(msg);
  };

  // Togol Accordion Matrix untuk Item Menu
  const toggleItemAccordion = (item: MenuItem) => {
    if (expandedItemId === item.id) {
      setExpandedItemId(null);
      return;
    }
    setExpandedItemId(item.id);
    // Kuantiti lalai: Sate 10 cucuk (minOrder 5), Makanan & Minuman 1 unit
    const defaultQty = item.category === 'sate' ? Math.max(item.minOrder || 5, 10) : 1;
    setMatrixQty(defaultQty);

    // Suhu/Variasi lalai mengikut kategori
    if (item.category === 'minuman') {
      setMatrixTemp(item.name.toLowerCase().includes('panas') ? 'Panas' : 'Ais');
    } else if (item.category === 'sate') {
      setMatrixTemp('Kuah Asing');
    } else if (item.category === 'istimewa' || item.category === 'santai' || item.category === 'soto') {
      setMatrixTemp('Panas Segar');
    } else if (item.category === 'karipap') {
      setMatrixTemp('Panas Garing');
    } else {
      setMatrixTemp('Panas');
    }

    setMatrixNotes('');
  };

  // Masukkan item dari Multi-Attribute Accordion Matrix ke dalam Troli
  const handleApplyMatrixToCart = (item: MenuItem) => {
    const parts: string[] = [];
    if (matrixTemp) {
      parts.push(`[${matrixTemp}]`);
    }
    if (matrixNotes.trim()) {
      parts.push(matrixNotes.trim());
    }
    const combinedNotes = parts.join(' ');

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.itemId === item.id && (i.notes || '') === combinedNotes
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + matrixQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: matrixQty,
            station: item.station,
            notes: combinedNotes || undefined,
          },
        ];
      }
    });

    const displayNotes = combinedNotes ? combinedNotes.replace(/\[|\]/g, '').trim() : '';
    showToast(`✅ ${matrixQty}x ${item.name}${displayNotes ? ` (${displayNotes})` : ''} ditambah!`);
    setExpandedItemId(null); // Tutup panel ubahsuai selepas berjaya ditambah
  };

  // Kemas kini kuantiti item troli yang spesifik notasinya
  const updateCartItemQuantity = (itemId: string, notes: string | undefined, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.itemId === itemId && (item.notes || '') === (notes || '')) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  // Buang item tertentu dari troli
  const removeCartItem = (itemId: string, notes: string | undefined) => {
    setCart((prev) => prev.filter((i) => !(i.itemId === itemId && (i.notes || '') === (notes || ''))));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
  };

  // Pengiraan Subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Navigasi: Pilih Meja -> Masuk ke Menu
  const handleSelectTableAndNavigate = (tblId: string) => {
    setSelectedTakeawayOrder(null);
    setOrderType('dine_in');
    setTableNumber(tblId);
    setCart([]);
    setCustomerName('');
    setExpandedItemId(null);
    setPosView('menu');
  };

  // Navigasi: Buka Menu Bungkus Baru
  const handleSelectTakeawayAndNavigate = () => {
    setSelectedTakeawayOrder(null);
    setOrderType('takeaway');
    setCart([]);
    setCustomerName('');
    setExpandedItemId(null);
    setPosView('menu');
  };

  // Navigasi: Tambah Menu ke Pesanan Bungkus Sedia Ada
  const handleSelectExistingTakeawayAndNavigate = (ord: Order) => {
    setSelectedTakeawayOrder(ord);
    setOrderType('takeaway');
    setCustomerName(ord.customerName || '');
    setCart([]);
    setExpandedItemId(null);
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
        const existing = mergedItems.find(
          (i) => i.itemId === newItem.itemId && (i.notes || '') === (newItem.notes || '')
        );
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

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <div className="space-y-3 pb-24 sm:pb-20">

      {/* ======================================================== */}
      {/* SKRIN 1: PILIHAN MEJA & BUNGKUS (MINIMALIS)               */}
      {/* ======================================================== */}
      {posView === 'tables' && (
        <div className={`space-y-3 transition-[padding] duration-300 ${selectedDetailOrder ? 'pb-[52vh] sm:pb-[56vh]' : 'pb-20'}`}>
          {/* ======================================================== */}
          {/* TOP DYNAMIC ISLAND: HANYA STATUS MEJA / NOTIFIKASI MORPH */}
          {/* (Gunakan struktur kapsul sama seperti dalam menu)         */}
          {/* ======================================================== */}
          <div className="sticky top-16 z-30 max-w-xl mx-auto w-full px-2 select-none flex justify-center transition-all duration-300">
            {islandNotification ? (
              /* Kapsul Berubah Jadi Pill Oren Notifikasi Persis Gambar Rujukan */
              <div
                onClick={() => setIslandNotification(null)}
                className="cursor-pointer rounded-full px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 border border-orange-400 shadow-[0_4px_22px_rgba(234,88,12,0.6)] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 transform scale-100 animate-fadeIn hover:brightness-110 active:scale-95 max-w-md mx-auto"
                title="Ketik untuk tutup notifikasi"
              >
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">{islandNotification}</span>
              </div>
            ) : (
              /* Status Meja Asal */
              <div className="dynamic-island-top rounded-full px-5 py-2 flex items-center justify-center gap-3 sm:gap-4 shadow-2xl border border-stone-800/80 bg-[#161311]/95 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
                  <span className="text-emerald-400 font-mono">
                    {RESTAURANT_TABLES.filter(t => !liveOrders.some(o => o.type === 'dine_in' && o.tableNumber === t.id && !o.isPaid && o.status !== 'cancelled')).length}
                  </span>
                  <span className="text-stone-300 font-bold">Kosong</span>
                </div>

                <span className="w-1 h-3.5 rounded-full bg-stone-700/60" />

                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
                  <span className="text-amber-400 font-mono">
                    {liveOrders.filter(o => o.type === 'dine_in' && !o.isPaid && o.status !== 'cancelled').length}
                  </span>
                  <span className="text-stone-300 font-bold">Makan</span>
                </div>

                {liveOrders.filter(o => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))).length > 0 && (
                  <>
                    <span className="w-1 h-3.5 rounded-full bg-stone-700/60" />
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                      <span className="text-sm">🛍️</span>
                      <span className="text-orange-400 font-mono">
                        {liveOrders.filter(o => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))).length}
                      </span>
                      <span className="text-stone-300 font-bold">Bungkus</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Grid Meja 4 Sebaris (Square, Soft Neumorphic) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {RESTAURANT_TABLES.map((tbl) => {
              const activeOrd = liveOrders.find(
                (o) => o.type === 'dine_in' && o.tableNumber === tbl.id && !o.isPaid && o.status !== 'cancelled'
              );
              const itemCount = activeOrd
                ? activeOrd.items.reduce((a, b) => a + b.quantity, 0)
                : 0;

              const isSelectedDetail =
                selectedDetailOrder?.type === 'dine_in' &&
                selectedDetailOrder.tableNumber === tbl.id;

              return (
                <button
                  key={tbl.id}
                  type="button"
                  onClick={() => {
                    if (activeOrd) {
                      // Buka kotak terapung untuk meja aktif (Master–Detail)
                      setSelectedDetailOrder(activeOrd);
                    } else {
                      // Meja kosong: Masuk terus ke menu untuk mula order
                      setSelectedDetailOrder(null);
                      handleSelectTableAndNavigate(tbl.id);
                    }
                  }}
                  className={`aspect-square rounded-2xl p-2.5 sm:p-3 text-left transition-all duration-200 flex flex-col justify-between select-none cursor-pointer active:scale-95 active:shadow-neu-pressed ${
                    isSelectedDetail
                      ? 'bg-gradient-to-br from-[#2a1d13] to-[#1e1510] border-2 border-orange-500 ring-4 ring-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-[1.03] z-10'
                      : activeOrd
                      ? 'bg-gradient-to-br from-[#221a15] to-[#181411] border border-amber-500/50 shadow-neu-amber hover:border-amber-400'
                      : 'bg-[#181614] border border-stone-800/40 shadow-neu-flat hover:shadow-neu-flat-lg hover:border-orange-500/40'
                  }`}
                >
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

          {/* Senarai Pesanan Bungkus Aktif di Bawah Meja (Sesuai Rujukan Gambar) */}
          {(() => {
            const activeTakeaways = liveOrders.filter(
              (o) => o.type === 'takeaway' && (!o.isPaid || (o.status !== 'completed' && o.status !== 'cancelled'))
            );

            if (activeTakeaways.length === 0) return null;

            return (
              <div className="neu-card p-2.5 space-y-2 border border-orange-950/40 mt-3">
                <div className="flex items-center justify-between text-[11px] font-black text-stone-300 px-1">
                  <span>🛍️ Pesanan Bungkus Aktif ({activeTakeaways.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {activeTakeaways.map((ord) => {
                    const isSelectedTakeaway = selectedDetailOrder?.id === ord.id;

                    return (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedDetailOrder(ord);
                        }}
                        className={`neu-inset-sm p-2.5 flex items-center justify-between gap-2 text-xs cursor-pointer transition-all active:scale-[0.99] ${
                          isSelectedTakeaway
                            ? 'border-2 border-orange-500 ring-4 ring-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                            : 'hover:border-orange-500/50'
                        }`}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSettleModal(ord);
                              }}
                              className="px-2.5 py-1 rounded-xl neu-btn-emerald font-black text-[11px] flex items-center gap-1 shadow-neu-green active:scale-95"
                            >
                              <Banknote className="w-3 h-3" />
                              <span>Bayar</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTakeawayHandover(ord);
                              }}
                              className="px-2.5 py-1 rounded-xl neu-btn text-stone-300 text-[11px] font-bold active:scale-95"
                            >
                              Selesai
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectExistingTakeawayAndNavigate(ord);
                            }}
                            className="p-1.5 rounded-xl neu-btn text-orange-400 active:scale-95"
                            title="Tambah item"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* FLOATING ACTION BUTTON DI BUCU BAWAH KANAN (Morph Jadi +Bungkus) */}
          {/* Sembunyikan bila kotak perincian meja/bungkus terbuka supaya tidak bertindih */}
          {!selectedDetailOrder && (
            <div className="fixed right-4 sm:right-6 bottom-6 sm:bottom-8 z-40 select-none animate-fadeIn">
              <button
                type="button"
                onClick={handleSelectTakeawayAndNavigate}
                className="group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-2xl z-40 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.7)] ring-4 ring-orange-500/30 hover:scale-105"
                title="Buat Pesanan Bungkus Baharu (+Bungkus)"
              >
                {/* Ikon Beg Bungkus */}
                <ShoppingBag className="w-6 h-6 text-white filter drop-shadow transition-transform group-hover:scale-110" />

                {/* Tanda Plus Mini di Atas */}
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[#161311] text-[11px] font-black flex items-center justify-center border-2 border-[#161311] shadow-md">
                  +
                </span>

                {/* Lingkaran Berkilau (Ambient Glow Ring) */}
                <span className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* MASTER–DETAIL SPLIT PANE (KOTAK PERINCIAN DOCK BAWAH)    */}
          {/* Master di atas boleh discroll bebas sampai ke bawah      */}
          {/* Detail di bawah terapung kemas dengan backdrop blur split*/}
          {/* ======================================================== */}
          {selectedDetailOrder && (
            <>
              {/* Backdrop Blur di Belakang Detail Pane (Membahagi Skrin Dua Bahagian) */}
              <div 
                className="fixed inset-x-0 bottom-0 h-[52vh] sm:h-[56vh] z-30 bg-[#0c0a09]/80 backdrop-blur-md border-t-2 border-orange-500/40 shadow-[0_-16px_40px_rgba(0,0,0,0.85)] animate-fadeIn transition-all pointer-events-none"
              >
                {/* Pemegang Garisan Split-Screen */}
                <div className="flex items-center justify-center pt-2">
                  <div className="w-12 h-1 bg-stone-500/50 rounded-full" />
                </div>
              </div>

              <div className="fixed bottom-3 left-2 right-2 sm:left-6 sm:right-6 z-40 max-w-xl mx-auto select-none animate-fadeIn pointer-events-auto">
                {/* Kotak Terapung: Gaya Persis Rujukan Gambar (rounded-3xl, border-orange-500/80, bg-[#161311]/95) */}
                <div className="rounded-3xl p-4 sm:p-5 max-h-[48vh] sm:max-h-[52vh] flex flex-col space-y-3 shadow-2xl border border-orange-500/80 bg-[#161311]/95 backdrop-blur-xl text-stone-100">
                {/* Header Kotak */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-neu-orange">
                      <span className="text-sm">{selectedDetailOrder.type === 'dine_in' ? '🍽️' : '🛍️'}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-2">
                        <span>
                          {selectedDetailOrder.type === 'dine_in'
                            ? (selectedDetailOrder.tableNumber === 'VIP' ? 'Bilik VIP' : `Meja ${selectedDetailOrder.tableNumber}`)
                            : (selectedDetailOrder.customerName || 'Pesanan Bungkus')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedDetailOrder.isPaid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {selectedDetailOrder.isPaid ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </h3>
                      <span className="text-[10px] text-stone-400 font-mono">
                        #{selectedDetailOrder.orderNumber} • Masa: {selectedDetailOrder.createdAt}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setSelectedDetailOrder(null)} 
                    className="p-1.5 rounded-full neu-btn text-stone-400 hover:text-white flex items-center gap-1 active:scale-90"
                    title="Tutup Perincian"
                  >
                    <ChevronDown className="w-4 h-4 text-orange-400" />
                  </button>
                </div>

                {/* Senarai Makanan yang Dipesan */}
                <div className="text-[11px] font-bold text-stone-400 flex items-center justify-between px-1">
                  <span>Item Dipesan ({selectedDetailOrder.items.reduce((a, b) => a + b.quantity, 0)} item):</span>
                </div>

                <div className="max-h-36 sm:max-h-44 overflow-y-auto space-y-2 pr-0.5 flex-1 min-h-0">
                  {selectedDetailOrder.items.map((item, idx) => (
                    <div key={idx} className="neu-inset-sm p-2.5 rounded-2xl flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-orange-400">{item.quantity}x</span>
                          <span className="font-bold text-white truncate">{item.name}</span>
                        </div>
                        {item.notes && (
                          <span className="block text-[10px] text-amber-300 font-semibold truncate mt-0.5">
                            Nota: {item.notes}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono">
                          RM {item.price.toFixed(2)} seunit {item.station ? `• ${item.station.toUpperCase()}` : ''}
                        </span>
                      </div>
                      <div className="font-mono font-black text-xs text-white shrink-0">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Jumlah Keseluruhan Pesanan */}
                <div className="pt-2 border-t border-stone-800/80 flex justify-between items-center text-xs font-black">
                  <span className="text-stone-300">Jumlah Keseluruhan Bil:</span>
                  <span className="font-mono text-base sm:text-lg text-emerald-400">
                    RM {selectedDetailOrder.total.toFixed(2)}
                  </span>
                </div>

                {/* Dua Pilihan Tindakan: Bayar ATAU Tambah Order (Master–Detail) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* Butang 1: Bayar (atau Selesai jika dah bayar) */}
                  {!selectedDetailOrder.isPaid ? (
                    <button
                      type="button"
                      onClick={() => {
                        const ord = selectedDetailOrder;
                        setSelectedDetailOrder(null);
                        handleOpenSettleModal(ord);
                      }}
                      className="py-3 rounded-2xl neu-btn-emerald font-black text-xs sm:text-sm text-white shadow-neu-green active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400/40"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Bayar RM {selectedDetailOrder.total.toFixed(2)}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const ord = selectedDetailOrder;
                        setSelectedDetailOrder(null);
                        handleCompleteTakeawayHandover(ord);
                      }}
                      className="py-3 rounded-2xl neu-btn font-black text-xs sm:text-sm text-stone-200 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Selesai & Serah</span>
                    </button>
                  )}

                  {/* Butang 2: Tambah Order (Morph ke Tetingkap Menu) */}
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedDetailOrder;
                      setSelectedDetailOrder(null);
                      if (ord.type === 'dine_in') {
                        setTableNumber(ord.tableNumber || 'M-01');
                        setOrderType('dine_in');
                        setSelectedTakeawayOrder(null);
                      } else {
                        setSelectedTakeawayOrder(ord);
                        setOrderType('takeaway');
                        setCustomerName(ord.customerName || '');
                      }
                      setCart([]);
                      setPosView('menu');
                      showIslandNotification(`➕ Tambah order: ${ord.type === 'dine_in' ? `Meja ${ord.tableNumber}` : 'Bungkus'}`);
                    }}
                    className="py-3 rounded-2xl neu-btn-primary font-black text-xs sm:text-sm text-white shadow-neu-orange active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Order</span>
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SKRIN 2: PILIH MENU DENGAN MASTER–DETAIL MODIFIER PANE    */}
      {/* ======================================================== */}
      {posView === 'menu' && (
        <div className={`space-y-3 transition-[padding] duration-300 ${activeExpandedItem ? 'pb-[54vh] sm:pb-[58vh]' : 'pb-24'}`}>
          {/* ======================================================== */}
          {/* TOP BAR / DYNAMIC ISLAND: MEJA, NO MEJA & NOTIFIKASI MORPH*/}
          {/* ======================================================== */}
          <div className="sticky top-16 z-30 max-w-xl mx-auto w-full px-2 select-none flex justify-center transition-all duration-300">
            {islandNotification ? (
              /* Kapsul Berubah Jadi Pill Oren (Persis Gambar Rujukan) Bila Ada Notifikasi */
              <div
                onClick={() => setIslandNotification(null)}
                className="cursor-pointer rounded-full px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 border border-orange-400 shadow-[0_4px_22px_rgba(234,88,12,0.6)] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 transform scale-100 animate-fadeIn hover:brightness-110 active:scale-95 max-w-md mx-auto"
                title="Ketik untuk tutup notifikasi"
              >
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">{islandNotification}</span>
              </div>
            ) : (
              /* Island Asal: [ ← Meja ] [ 🍽️ Meja M-04 ] [ 🔥 Semua (59) ] */
              <div className="dynamic-island-top w-full rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 shadow-2xl transition-all duration-300">
                {/* Kiri: Butang Kembali ke Meja */}
                <button
                  type="button"
                  onClick={() => setPosView('tables')}
                  className="px-3 py-1.5 rounded-full neu-btn text-stone-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer hover:text-white transition-all"
                  title="Kembali ke Senarai Meja"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Meja</span>
                </button>

                {/* Tengah: Lencana Nombor Meja / Bungkus */}
                <div
                  className="px-3.5 py-1.5 rounded-full neu-inset-sm text-xs sm:text-sm font-black text-white flex items-center gap-2 min-w-0"
                >
                  <span className="text-orange-500 text-sm">
                    {orderType === 'dine_in' ? '🍽️' : '🛍️'}
                  </span>
                  <span className="truncate">
                    {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `Meja ${tableNumber}`) : 'Bungkus'}
                  </span>
                  {activeTableOrder && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse shrink-0"
                      title="Ada pesanan sedang makan"
                    />
                  )}
                </div>

                {/* Kanan: Kategori Aktif (Semua / Sate / dll) */}
                <div className="px-3 py-1.5 rounded-full neu-inset-sm text-xs font-bold text-stone-300 flex items-center gap-1.5 shrink-0">
                  <span className="text-sm">{currentCategoryObj.icon}</span>
                  <span className="text-orange-400 font-black">{currentCategoryObj.label}</span>
                  <span className="text-[10px] text-stone-500 font-mono">({filteredMenu.length})</span>
                </div>
              </div>
            )}
          </div>

          {/* Senarai Menu dengan Master–Detail Split Pane */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredMenu.map((item) => {
              const isSelected = expandedItemId === item.id;
              const isSatay = item.category === 'sate';
              const displayIcon = getItemDisplayIcon(item);
              const itemsInCart = cart.filter((c) => c.itemId === item.id);
              const totalInCart = itemsInCart.reduce((sum, c) => sum + c.quantity, 0);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItemAccordion(item)}
                  className={`neu-card p-3 rounded-2xl transition-all duration-200 select-none cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98] ${
                    isSelected
                      ? 'border-2 border-orange-500 ring-4 ring-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-[1.02] bg-gradient-to-br from-[#2a1d13] to-[#1e1510]'
                      : totalInCart > 0
                      ? 'border border-orange-500/50 shadow-neu-flat hover:shadow-neu-flat-lg'
                      : 'border border-stone-800/40 shadow-neu-flat hover:shadow-neu-flat-lg hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Kotak Ikon Sunken Neumorphic */}
                    <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-2xl shrink-0">
                      <span className="filter drop-shadow">{displayIcon.emoji}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-black text-sm truncate ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                          {item.name}
                        </h3>
                        {totalInCart > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full neu-btn-primary text-white shadow-neu-orange shrink-0">
                            {totalInCart}x
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-black text-orange-400">
                          RM {item.price.toFixed(2)}
                          {isSatay ? <span className="text-[10px] text-stone-400 font-sans font-normal"> /cucuk</span> : null}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded neu-inset-sm text-stone-400 uppercase">
                          {item.station === 'grill' ? 'Arang' : item.station === 'wok' ? 'Kuali' : 'Bar Air'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`p-2 rounded-xl neu-btn text-xs font-bold flex items-center justify-center transition-all ${
                        isSelected ? 'text-orange-400 neu-inset' : 'text-stone-300'
                      }`}
                    >
                      {isSelected ? <ChevronDown className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* DETAIL PANE: MODIFIER & ATTRIBUTE CUSTOMIZER DOCK         */}
          {/* (Master-Detail Split Pane: Tetap terapung di bawah dengan */}
          {/* backdrop blur split tanpa mengganggu skrol menu utama)    */}
          {/* ======================================================== */}
          {activeExpandedItem && (() => {
            const isSatay = activeExpandedItem.category === 'sate';
            const displayIcon = getItemDisplayIcon(activeExpandedItem);
            const tempOptions = getItemTemperatureOptions(activeExpandedItem);
            const quickNotes = getItemQuickNotes(activeExpandedItem);
            const qtyPresets = isSatay ? [5, 10, 15, 20, 30, 50] : [1, 2, 3, 4, 5, 10];
            const itemsInCart = cart.filter((c) => c.itemId === activeExpandedItem.id);
            const totalInCart = itemsInCart.reduce((sum, c) => sum + c.quantity, 0);

            return (
              <>
                {/* Backdrop Blur di Belakang Detail Pane (Membahagi Skrin Dua Bahagian) */}
                <div 
                  className="fixed inset-x-0 bottom-0 h-[56vh] sm:h-[60vh] z-30 bg-[#0c0a09]/80 backdrop-blur-md border-t-2 border-orange-500/40 shadow-[0_-16px_40px_rgba(0,0,0,0.85)] animate-fadeIn transition-all pointer-events-none"
                >
                  {/* Pemegang Garisan Split-Screen */}
                  <div className="flex items-center justify-center pt-2">
                    <div className="w-12 h-1 bg-stone-500/50 rounded-full" />
                  </div>
                </div>

                <div className="fixed bottom-3 left-2 right-2 sm:left-6 sm:right-6 z-40 max-w-xl mx-auto select-none animate-fadeIn pointer-events-auto">
                  <div className="rounded-3xl p-4 sm:p-5 max-h-[52vh] sm:max-h-[56vh] flex flex-col space-y-3.5 shadow-2xl border border-orange-500/80 bg-[#161311]/95 backdrop-blur-xl text-stone-100">
                  {/* HEADER DETAIL PANE */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-800 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-xl shrink-0">
                        <span>{displayIcon.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-white truncate">{activeExpandedItem.name}</h3>
                          {totalInCart > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full neu-btn-primary text-white shadow-neu-orange shrink-0">
                              {totalInCart}x dlm troli
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-black text-orange-400">
                            RM {activeExpandedItem.price.toFixed(2)}
                            {isSatay ? <span className="text-[10px] text-stone-400 font-sans font-normal"> /cucuk</span> : null}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded neu-inset-sm text-stone-400 uppercase">
                            {activeExpandedItem.station === 'grill' ? 'Arang' : activeExpandedItem.station === 'wok' ? 'Kuali' : 'Bar Air'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedItemId(null)}
                      className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-stone-400 hover:text-white transition-all active:scale-95 shrink-0"
                      title="Tutup Panel Ubahsuai"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* KANDUNGAN UBAHSUAI (BOLEH DISKROL DALAM PANE) */}
                  <div className="overflow-y-auto space-y-3 pr-1 flex-1 min-h-0 text-xs">
                    {/* ATTRIBUTE 1: KUANTITI */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-stone-300">
                        <span className="flex items-center gap-1.5 text-orange-400">
                          <span>📊</span>
                          <span>Kuantiti ({isSatay ? 'Min. 5 cucuk' : 'Unit'})</span>
                        </span>
                        <span className="font-mono font-black text-white text-sm">
                          {matrixQty} {isSatay ? 'cucuk' : 'unit'}
                        </span>
                      </div>

                      {/* Butang Preset */}
                      <div className="grid grid-cols-6 gap-1.5">
                        {qtyPresets.map((qty) => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setMatrixQty(qty)}
                            className={`py-1.5 rounded-xl font-mono text-xs font-black transition-all active:scale-95 ${
                              matrixQty === qty
                                ? 'neu-btn-primary shadow-neu-orange text-white'
                                : 'neu-btn text-stone-300 hover:text-white'
                            }`}
                          >
                            {qty}
                          </button>
                        ))}
                      </div>

                      {/* Stepper Presisi */}
                      <div className="flex items-center justify-between neu-inset-sm p-1 rounded-xl mt-1">
                        <button
                          type="button"
                          onClick={() => setMatrixQty((prev) => Math.max(isSatay ? 5 : 1, prev - (isSatay ? 5 : 1)))}
                          className="w-8 h-8 rounded-lg neu-btn flex items-center justify-center text-stone-300 hover:text-white active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="flex items-center gap-1 font-mono font-black text-sm text-white">
                          <span>{matrixQty}</span>
                          <span className="text-[10px] text-stone-400 font-sans font-normal">
                            (RM {(activeExpandedItem.price * matrixQty).toFixed(2)})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMatrixQty((prev) => prev + (isSatay ? 5 : 1))}
                          className="w-8 h-8 rounded-lg neu-btn-primary text-white flex items-center justify-center active:scale-90 shadow-neu-orange"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ATTRIBUTE 2: SUHU / VARIASI */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-stone-300 flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Suhu / Variasi Hidangan</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {tempOptions.map((opt) => {
                          const isSelected = matrixTemp === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setMatrixTemp(opt.id)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                isSelected
                                  ? 'neu-btn-primary shadow-neu-orange text-white font-black ring-1 ring-orange-400'
                                  : 'neu-btn text-stone-300 hover:text-white'
                              }`}
                            >
                              <span>{opt.icon}</span>
                              <span className="truncate">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ATTRIBUTE 3: NOTA & PERMINTAAN KHAS */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-stone-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>✍️</span>
                          <span>Permintaan Khas (Pilihan Segera / Tulis)</span>
                        </span>
                      </div>

                      {/* Quick Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {quickNotes.map((chip) => {
                          const isIncluded = matrixNotes.includes(chip);
                          return (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => {
                                if (isIncluded) {
                                  setMatrixNotes((prev) => prev.replace(chip, '').replace(/^,\s*|,\s*$/g, '').trim());
                                } else {
                                  setMatrixNotes((prev) => (prev ? `${prev}, ${chip}` : chip));
                                }
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 ${
                                isIncluded
                                  ? 'neu-btn-primary text-white shadow-neu-orange'
                                  : 'neu-inset-sm text-stone-300 hover:text-white'
                              }`}
                            >
                              {chip}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={matrixNotes}
                          onChange={(e) => setMatrixNotes(e.target.value)}
                          placeholder="Tulis permintaan khas di sini..."
                          className="neu-input w-full px-3 py-2 text-xs text-white placeholder-stone-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        {matrixNotes && (
                          <button
                            type="button"
                            onClick={() => setMatrixNotes('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Senarai Variasi Item Ini Yang Sedang Berada Dalam Troli */}
                    {itemsInCart.length > 0 && (
                      <div className="neu-inset-sm p-2.5 rounded-xl space-y-1.5">
                        <div className="text-[10px] font-bold text-stone-400">
                          Dalam Troli Sekarang ({totalInCart}x):
                        </div>
                        {itemsInCart.map((cItem, cIdx) => (
                          <div key={cIdx} className="flex items-center justify-between text-xs">
                            <span className="text-stone-200">
                              <span className="font-black text-orange-400">{cItem.quantity}x</span>{' '}
                              {cItem.notes ? <span className="text-amber-300 font-semibold">({cItem.notes})</span> : ''}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(activeExpandedItem.id, cItem.notes, isSatay ? -5 : -1)}
                                className="w-6 h-6 rounded-lg neu-btn flex items-center justify-center text-stone-300 active:scale-90"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold text-xs px-1 text-white">{cItem.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(activeExpandedItem.id, cItem.notes, isSatay ? 5 : 1)}
                                className="w-6 h-6 rounded-lg neu-btn-primary flex items-center justify-center text-white active:scale-90"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCartItem(activeExpandedItem.id, cItem.notes)}
                                className="w-6 h-6 rounded-lg neu-btn text-rose-400 flex items-center justify-center ml-1 active:scale-90"
                                title="Buang"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FOOTER DETAIL PANE DENGAN CTA BESAR */}
                  <div className="pt-2.5 border-t border-stone-800 shrink-0 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-stone-400">Jumlah:</div>
                      <div className="font-mono text-base font-black text-orange-400">
                        RM {(activeExpandedItem.price * matrixQty).toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyMatrixToCart(activeExpandedItem)}
                      className="flex-1 py-3 px-4 rounded-2xl neu-btn-primary font-black text-xs sm:text-sm text-white shadow-neu-orange active:scale-95 flex items-center justify-center gap-2 tracking-wide"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Masukkan ke Troli • RM {(activeExpandedItem.price * matrixQty).toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              </div>
              </>
            );
          })()}

          {/* ======================================================== */}
          {/* RADIAL THUMB ARC ROTARY MOTION (Pemilihan Kategori Jemari) */}
          {/* Dinyahlekap semasa Troli atau Modifier terbuka             */}
          {/* ======================================================== */}
          {!cartModalOpen && !activeExpandedItem && (
            <RadialThumbArc
              categories={categories.map((cat) => ({
                id: cat.id,
                label: cat.label,
                icon: cat.icon,
                count: cat.id === 'all' ? menu.length : menu.filter((m) => m.category === cat.id).length,
              }))}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => {
                setSelectedCategory(id);
                setExpandedItemId(null);
                const catObj = categories.find((c) => c.id === id);
                if (catObj) {
                  // Island atas berubah jadi pill oren seketika kemudian kembali ke asal (tanpa toast terapung)
                  showIslandNotification(`${catObj.icon} Kategori: ${catObj.label}`);
                }
              }}
            />
          )}

          {/* ======================================================== */}
          {/* BOTTOM DYNAMIC ISLAND MORPH (Kapsul Bawah Boleh Berubah) */}
          {/* Disembunyikan bila panel ubahsuai (Modifier Pane) dibuka  */}
          {/* ======================================================== */}
          {!activeExpandedItem && (
            <div className="fixed bottom-3 left-2 right-2 sm:left-6 sm:right-6 z-40 max-w-xl mx-auto">
            {/* Latar Belakang Gelap Semasa Island Mengembang */}
            {cartModalOpen && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10 animate-fadeIn"
                onClick={() => setCartModalOpen(false)}
              />
            )}

            {/* Kontena Island Morfisme Bendalir (Fluid Island Morphing) */}
            {/* Persis Kotak Rujukan Gambar (rounded-3xl, border-orange-500/80, bg-[#161311]) */}
            <div 
              className={`dynamic-island-bottom transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                cartModalOpen
                  ? 'rounded-3xl p-4 sm:p-5 max-h-[82vh] flex flex-col space-y-3.5 shadow-2xl border border-orange-500/80 bg-[#161311]'
                  : 'rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 shadow-2xl'
              }`}
            >
              {!cartModalOpen ? (
                /* 1. COMPACT BOTTOM ISLAND CAPSULE (SELURUH PULAU JADI BUTANG BUKA TROLI) */
                <button
                  type="button"
                  onClick={() => setCartModalOpen(true)}
                  className="w-full flex items-center justify-between gap-3 text-stone-100 active:scale-[0.98] group cursor-pointer select-none"
                  title="Ketik untuk buka troli pesanan"
                >
                  {/* Bahagian Kiri: Ikon Beg/Bil & Ringkasan Meja / Troli */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-neu-flat relative transition-all shrink-0 ${
                      activeTableOrder && cart.length === 0 ? 'neu-btn-emerald' : 'neu-btn-primary'
                    }`}>
                      {activeTableOrder && cart.length === 0 ? <Banknote className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#181614] shadow animate-bounce">
                          {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                      )}
                    </div>

                    <div className="text-left min-w-0">
                      <div className="text-[10px] font-black text-stone-300 flex items-center gap-1 uppercase tracking-tight truncate">
                        <span>{orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `Meja ${tableNumber}`) : 'Bungkus'}</span>
                        <span>•</span>
                        <span className="text-orange-400 font-bold">TROLI</span>
                      </div>
                      <div className={`font-mono text-xs sm:text-sm font-black truncate ${activeTableOrder && cart.length === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        RM {(cart.length > 0 ? subtotal : activeTableOrder ? activeTableOrder.total : 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Bahagian Kanan: Indikator Buka Troli Bersih (Bahagian Bertanda Telah Dibuang) */}
                  <div className="flex items-center gap-1.5 text-orange-400 group-hover:text-orange-300 transition-colors pr-1 shrink-0">
                    <span className="text-xs font-black tracking-wide">
                      {cart.length > 0 ? `${cart.reduce((a, b) => a + b.quantity, 0)} item` : 'Buka'}
                    </span>
                    <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 animate-pulse" />
                  </div>
                </button>
              ) : (
                /* 2. EXPANDED BOTTOM ISLAND TROLI SHEET */
                <div className="space-y-3 animate-fadeIn flex flex-col flex-1 min-h-0 text-stone-100">
                  {/* Header Expanded Island */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-neu-orange">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs sm:text-sm text-white">
                          Troli: {orderType === 'dine_in' ? (tableNumber === 'VIP' ? 'VIP' : `Meja ${tableNumber}`) : 'Bungkus'}
                        </h3>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {cart.reduce((a, b) => a + b.quantity, 0)} item dipilih
                        </span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setCartModalOpen(false)} 
                      className="p-1.5 rounded-full neu-btn text-stone-400 hover:text-white text-xs flex items-center gap-1"
                      title="Kuncupkan Island"
                    >
                      <ChevronDown className="w-4 h-4 text-orange-400" />
                    </button>
                  </div>

                  {/* Senarai Item dalam Troli */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-0.5 flex-1 min-h-0">
                    {cart.length === 0 ? (
                      <div className="text-center py-6 text-stone-500 text-xs font-bold">
                        Troli masih kosong. Pilih menu di atas.
                      </div>
                    ) : (
                      cart.map((item, idx) => (
                        <div key={`${item.itemId}-${item.notes || ''}-${idx}`} className="neu-inset-sm p-2.5 rounded-2xl flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white truncate block">{item.name}</span>
                            {item.notes && (
                              <span className="block text-[10px] text-amber-300 font-semibold truncate">
                                {item.notes}
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400 font-mono">
                              RM {item.price.toFixed(2)} × {item.quantity} = RM {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 neu-card rounded-xl p-0.5 shrink-0 border border-stone-850">
                            <button onClick={() => updateCartItemQuantity(item.itemId, item.notes, item.station === 'grill' ? -5 : -1)} className="p-1 text-stone-400 hover:text-white neu-btn rounded-lg">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold font-mono text-xs px-1.5 text-white">{item.quantity}</span>
                            <button onClick={() => updateCartItemQuantity(item.itemId, item.notes, item.station === 'grill' ? 5 : 1)} className="p-1 text-white neu-btn-primary rounded-lg">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Nota */}
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nota Pelanggan / Nama (pilihan)"
                    className="neu-input w-full px-3 py-2 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
                  />

                  {/* Subtotal & Butang Tindakan */}
                  <div className="pt-2 border-t border-stone-800/80 flex justify-between items-center text-xs font-black">
                    <span className="text-stone-400">Jumlah Keseluruhan:</span>
                    <span className="font-mono text-base text-orange-400">RM {subtotal.toFixed(2)}</span>
                  </div>

                  {/* Butang Tindakan dalam Detail Pane: Pilihan Hantar ATAU Hantar & Bayar */}
                  {cart.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(activeTableOrder || selectedTakeawayOrder) ? handleAppendOrder : handleSendToKitchen}
                        className="py-3 rounded-2xl font-black text-xs sm:text-sm neu-btn text-stone-200 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-4 h-4 text-orange-400" />
                        <span>{(activeTableOrder || selectedTakeawayOrder) ? 'Hantar Tambahan' : 'Hantar ke Dapur'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePayNowDirectly}
                        className="py-3 rounded-2xl font-black text-xs sm:text-sm neu-btn-emerald text-white shadow-neu-green active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400/40"
                      >
                        <Banknote className="w-4 h-4" />
                        <span>{orderType === 'takeaway' ? 'Bayar Terus' : 'Hantar & Bayar'}</span>
                      </button>
                    </div>
                  ) : activeTableOrder ? (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenSettleModal(activeTableOrder)}
                        className="w-full py-3 rounded-2xl font-black text-xs sm:text-sm neu-btn-emerald text-white shadow-neu-green active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400/40"
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Kira Bil RM {activeTableOrder.total.toFixed(2)}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          )}
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
                  Kira Bil: {settlingOrder.tableNumber ? (settlingOrder.tableNumber === 'VIP' ? 'VIP' : `Meja ${settlingOrder.tableNumber}`) : (settlingOrder.customerName || 'Bungkus')}
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
                  <div className="truncate pr-2">
                    <span>{it.name} × {it.quantity}</span>
                    {it.notes && <span className="text-[10px] text-amber-300 italic block">{it.notes}</span>}
                  </div>
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
