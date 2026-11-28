'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Flame, 
  CookingPot, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  RotateCcw,
  Coffee,
  Check,
  Database
} from 'lucide-react';
import { INITIAL_ORDERS } from '@/lib/data';
import { Order } from '@/lib/types';

export default function KitchenKdsPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeStation, setActiveStation] = useState<'all' | 'grill' | 'wok' | 'prep_bar'>('all');
  const [isDbLive, setIsDbLive] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        setIsDbLive(Boolean(data.isDbConnected));
        setLastSynced(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      // Keep displaying current orders on network hiccup
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Skewer aggregator for the Grill Master
  const skewerSummary = orders.reduce((acc, order) => {
    if (order.status === 'completed' || order.status === 'cancelled') return acc;
    order.items
      .filter((i) => i.station === 'grill')
      .forEach((item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
    return acc;
  }, {} as Record<string, number>);

  const totalGrillSticks = Object.values(skewerSummary).reduce((a, b) => a + b, 0);

  // Status transitions
  const advanceStationStatus = async (orderId: string, station: 'grill' | 'wok' | 'prep_bar') => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const current = targetOrder.stationStatus[station];
    let next: 'pending' | 'grilling' | 'cooking' | 'ready' | 'done' = 'done';

    if (station === 'grill') {
      next = current === 'pending' ? 'grilling' : 'done';
    } else if (station === 'wok') {
      next = current === 'pending' ? 'cooking' : 'done';
    } else {
      next = current === 'pending' ? 'ready' : 'done';
    }

    const updatedStationStatus = {
      ...targetOrder.stationStatus,
      [station]: next,
    };

    const allDone = Object.values(updatedStationStatus).every((st) => st === 'done');
    const newStatus: Order['status'] = allDone ? 'ready' : 'cooking';

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, stationStatus: updatedStationStatus, status: newStatus }
          : order
      )
    );

    // Persist to Neon DB API
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          stationStatus: updatedStationStatus,
        }),
      });
    } catch (e) {
      console.error('Failed to sync station status:', e);
    }
  };

  const markOrderCompleted = async (orderId: string) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );

    // Persist to Neon DB API
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
    } catch (e) {
      console.error('Failed to mark order completed:', e);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top KDS Station Filter Bar (Soft Neumorphic) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 neu-card p-3.5 sm:p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-xl text-white">Sistem Paparan Dapur (KDS Live)</h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset-sm text-emerald-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              {isDbLive ? 'Neon Postgres Live' : 'Live Sync'}
              {lastSynced && <span className="opacity-70 font-mono text-[9px]">• {lastSynced}</span>}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Pemisahan tiket automatik: Panggangan Sate Arang vs Kuali Panas / Soto vs Bar Minuman
          </p>
        </div>

        {/* Station Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto neu-inset-sm p-1 rounded-2xl text-xs font-bold">
          {[
            { id: 'all', label: 'Semua Tiket' },
            { id: 'grill', label: '🔥 Stesen Sate Arang' },
            { id: 'wok', label: '🍳 Wok & Soto' },
            { id: 'prep_bar', label: '🥤 Minuman & Kuah' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStation(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                activeStation === tab.id
                  ? 'neu-btn-primary shadow-neu-orange text-white'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grill Pit Live Skewer Aggregate (Only if on 'all' or 'grill') */}
      {(activeStation === 'all' || activeStation === 'grill') && totalGrillSticks > 0 && (
        <div className="neu-card-lg p-4 sm:p-5 shadow-neu-flat-lg rounded-3xl border border-orange-700/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl neu-btn-primary text-white shadow-neu-orange animate-pulse">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Ringkasan Bakaran Sate Aktif (Pitmaster Queue)
                </h3>
                <p className="text-xs text-stone-300">
                  Jumlah sate yang perlu diletakkan di atas bara api sekarang
                </p>
              </div>
            </div>
            <div className="neu-inset-sm px-3.5 py-1.5 rounded-xl font-mono text-sm font-black text-orange-300 border border-orange-500/30">
              Jumlah: {totalGrillSticks} Cucuk
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.entries(skewerSummary).map(([name, count]) => (
              <div
                key={name}
                className="neu-card p-3 rounded-xl flex items-center justify-between"
              >
                <span className="text-xs font-bold text-stone-200">{name}</span>
                <span className="font-mono text-lg font-black text-orange-400 neu-inset-sm px-2.5 py-0.5 rounded-lg">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders
          .filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
          .map((order) => {
            const hasGrill = order.items.some((i) => i.station === 'grill');
            const hasWok = order.items.some((i) => i.station === 'wok');
            const hasPrep = order.items.some((i) => i.station === 'prep_bar');

            // Skip ticket if filtered to specific station and doesn't contain items for it
            if (activeStation === 'grill' && !hasGrill) return null;
            if (activeStation === 'wok' && !hasWok) return null;
            if (activeStation === 'prep_bar' && !hasPrep) return null;

            return (
              <div
                key={order.id}
                className={`neu-card flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-200 ${
                  order.status === 'ready'
                    ? 'border-emerald-600/60 shadow-neu-green ring-1 ring-emerald-500/40'
                    : 'hover:shadow-neu-flat-lg'
                }`}
              >
                {/* Ticket Top */}
                <div className="p-4 border-b border-stone-800/80 neu-surface">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-orange-400">
                        {order.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold neu-inset-sm ${
                        order.type === 'dine_in'
                          ? 'text-amber-300'
                          : 'text-blue-300'
                      }`}>
                        {order.type === 'dine_in' ? `Meja ${order.tableNumber}` : 'Bungkus'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.isPaid
                          ? 'neu-inset-sm text-emerald-400'
                          : 'neu-btn-primary text-white font-black'
                      }`}>
                        {order.isPaid ? 'Lunas' : 'Makan Dulu'}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{order.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {order.customerName && (
                    <div className="text-xs text-stone-400 mt-1 font-medium">
                      Pelanggan: <span className="text-stone-200 font-bold">{order.customerName}</span>
                    </div>
                  )}
                </div>

                {/* Items Section */}
                <div className="p-4 flex-1 space-y-3">
                  {/* Grill Station Items */}
                  {hasGrill && (activeStation === 'all' || activeStation === 'grill') && (
                    <div className="neu-inset-sm rounded-xl p-2.5 space-y-2 border border-orange-950/40">
                      <div className="flex items-center justify-between text-[11px] font-bold text-orange-400">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          Bahagian Sate Arang
                        </span>
                        <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-lg neu-card text-orange-300">
                          {order.stationStatus.grill}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items
                          .filter((i) => i.station === 'grill')
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-semibold text-stone-100">
                              <span>{item.name}</span>
                              <span className="font-mono font-bold text-orange-400 neu-card px-2 py-0.5 rounded">
                                {item.quantity} cucuk
                              </span>
                            </div>
                          ))}
                      </div>

                      <button
                        onClick={() => advanceStationStatus(order.id, 'grill')}
                        className={`w-full mt-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          order.stationStatus.grill === 'done'
                            ? 'neu-btn-emerald shadow-neu-green text-white'
                            : 'neu-btn-primary shadow-neu-orange text-white'
                        }`}
                      >
                        {order.stationStatus.grill === 'done' ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Sate Siap Dibakar
                          </>
                        ) : order.stationStatus.grill === 'grilling' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tekan Bila Selesai Bakar
                          </>
                        ) : (
                          <>
                            <Flame className="w-3.5 h-3.5" /> Mula Bakar Sekarang
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Wok Station Items (Soto, Mee Goreng, Bihun) */}
                  {hasWok && (activeStation === 'all' || activeStation === 'wok') && (
                    <div className="neu-inset-sm rounded-xl p-2.5 space-y-2 border border-amber-950/40">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                        <span className="flex items-center gap-1">
                          <CookingPot className="w-3.5 h-3.5" />
                          Dapur Soto & Wok Kuali
                        </span>
                        <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-lg neu-card text-amber-300">
                          {order.stationStatus.wok}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items
                          .filter((i) => i.station === 'wok')
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-semibold text-stone-100">
                              <span>
                                {item.name}
                                {item.notes && <span className="block text-[10px] text-amber-300 italic font-normal">Nota: {item.notes}</span>}
                              </span>
                              <span className="font-mono font-bold text-amber-400 neu-card px-2 py-0.5 rounded">
                                {item.quantity}x
                              </span>
                            </div>
                          ))}
                      </div>

                      <button
                        onClick={() => advanceStationStatus(order.id, 'wok')}
                        className={`w-full mt-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          order.stationStatus.wok === 'done'
                            ? 'neu-btn-emerald shadow-neu-green text-white'
                            : 'neu-btn bg-amber-600 hover:bg-amber-500 text-stone-950 font-black shadow-neu-amber'
                        }`}
                      >
                        {order.stationStatus.wok === 'done' ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Hidangan Panas Siap
                          </>
                        ) : order.stationStatus.wok === 'cooking' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tekan Bila Siap Masak
                          </>
                        ) : (
                          <>
                            <CookingPot className="w-3.5 h-3.5" /> Mula Memasak Wok
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Prep Bar / Drinks Items */}
                  {hasPrep && (activeStation === 'all' || activeStation === 'prep_bar') && (
                    <div className="neu-inset-sm rounded-xl p-2.5 space-y-2 border border-stone-850">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-sky-400" />
                          Bar Air & Kuah Nasi Impit
                        </span>
                        <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-lg neu-card text-stone-300">
                          {order.stationStatus.prep_bar}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items
                          .filter((i) => i.station === 'prep_bar')
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-semibold text-stone-200">
                              <span>{item.name}</span>
                              <span className="font-mono font-bold text-stone-300 neu-card px-2 py-0.5 rounded">
                                {item.quantity}x
                              </span>
                            </div>
                          ))}
                      </div>

                      <button
                        onClick={() => advanceStationStatus(order.id, 'prep_bar')}
                        className={`w-full mt-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          order.stationStatus.prep_bar === 'done'
                            ? 'neu-btn-emerald shadow-neu-green text-white'
                            : 'neu-btn text-white'
                        }`}
                      >
                        {order.stationStatus.prep_bar === 'done' ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Sedia Dihidang
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tandakan Siap
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Ticket Action Bottom */}
                <div className="p-3.5 neu-surface border-t border-stone-800/80">
                  <button
                    onClick={() => markOrderCompleted(order.id)}
                    className="w-full py-3 rounded-xl neu-btn-emerald text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-neu-green transition-all active:scale-95 border border-emerald-400/40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selesai & Hantar ke Meja / Kaunter</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
