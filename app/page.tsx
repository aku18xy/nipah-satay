'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  Store, 
  CookingPot, 
  Factory, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Users, 
  Boxes, 
  ThermometerSnowflake,
  ShieldCheck,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { INITIAL_STORAGE, INITIAL_ORDERS, INITIAL_MEAT_INTAKE } from '@/lib/data';
import { useAuthRole } from '@/components/AuthRoleContext';

export default function DashboardPage() {
  const router = useRouter();
  const { role, isInitialized, setShowAuthModal } = useAuthRole();
  const [storage] = useState(INITIAL_STORAGE);
  const [orders] = useState(INITIAL_ORDERS);
  const [meatIntake] = useState(INITIAL_MEAT_INTAKE);

  // Non-executive users are automatically redirected to their operational module
  useEffect(() => {
    if (isInitialized && role && role !== 'executive') {
      if (role === 'cashier') router.replace('/pos');
      else if (role === 'kitchen') router.replace('/kitchen');
      else if (role === 'production') router.replace('/production');
    }
  }, [isInitialized, role, router]);

  // Executive Access Protection Guard for Utama (/)
  if (isInitialized && role !== 'executive') {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="bg-stone-900 border-2 border-rose-600/70 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/90 border border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Halaman Utama Terhad</h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed">
              Halaman <strong>Utama (Pusat Kawalan Operasi)</strong> hanya boleh diakses oleh <strong>Pengurus / Eksekutif</strong>. Petugas kaunter, dapur, dan kilang sila gunakan modul operasi yang ditetapkan.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 text-white shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-orange-400 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Log Masuk Eksekutif (PIN: 1990)</span>
            </button>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Link
                href="/pos"
                className="py-2.5 rounded-xl font-bold text-xs bg-stone-950 hover:bg-stone-850 text-stone-300 border border-stone-800 text-center block active:scale-95"
              >
                Ke POS Kaunter
              </Link>
              <Link
                href="/kitchen"
                className="py-2.5 rounded-xl font-bold text-xs bg-stone-950 hover:bg-stone-850 text-stone-300 border border-stone-800 text-center block active:scale-95"
              >
                Ke Dapur KDS
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Computed metrics
  const activeOrdersCount = orders.filter(o => o.status === 'cooking' || o.status === 'pending').length;
  const totalSticksInQueue = orders.reduce((acc, order) => {
    return acc + order.items
      .filter(i => i.station === 'grill')
      .reduce((sub, item) => sub + item.quantity, 0);
  }, 0);

  const totalChillerSticks = 
    storage.ayamRawChiller + 
    storage.dagingRawChiller + 
    storage.kambingRawChiller + 
    storage.perutRawChiller;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Operational Status Banner */}
      <div className="bg-gradient-to-r from-orange-950/60 via-stone-900 to-amber-950/50 border border-orange-900/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-600 text-white tracking-wide uppercase">
                Pusat Kawalan Operasi
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold">
                ⏰ 3.00 PM - 11.00 PM • Ahad Cuti
              </span>
              <a 
                href="https://wa.me/60173659302" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-400 font-mono font-bold hover:underline ml-1"
              >
                📞 017 365 9302
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nipah Satay™ @ Pulau Indah
            </h1>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              Sistem integrasi dua sayap: <strong className="text-orange-400">Restoran Terbuka</strong> (Sate Bakar, Soto, Mee Rebus, Karipap &amp; LCK) dan <strong className="text-amber-400">Kilang Pemprosesan Sate</strong> (Perap, Cucuk &amp; Pek Beku).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/pos"
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-950/50 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Store className="w-4 h-4" />
              <span>POS Pesanan Baru</span>
            </Link>
            <Link
              href="/kitchen"
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 border border-orange-900/40 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <CookingPot className="w-4 h-4" />
              <span>Skrin KDS Dapur</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Jualan Hari Ini */}
        <div className="bg-stone-900/90 border border-stone-800/80 rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Jualan Semasa (POS)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">RM 1,284.60</div>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <span>+18.4%</span> berbanding semalam
            </p>
          </div>
        </div>

        {/* Card 2: Giliran Sate Dapur (Grill Queue) */}
        <div className="bg-stone-900/90 border border-orange-900/40 rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Giliran Api Sate</span>
            <div className="w-8 h-8 rounded-lg bg-orange-950/70 text-orange-500 flex items-center justify-center animate-pulse">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-orange-400">{totalSticksInQueue} <span className="text-xs font-normal text-stone-400">cucuk</span></div>
            <p className="text-[11px] text-stone-300 mt-0.5">
              Daripada <strong className="text-white">{activeOrdersCount}</strong> pesanan aktif
            </p>
          </div>
        </div>

        {/* Card 3: Stok Sate Siap Cucuk (Chiller) */}
        <div className="bg-stone-900/90 border border-stone-800/80 rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Stok Sate Siap (Chiller)</span>
            <div className="w-8 h-8 rounded-lg bg-sky-950/60 text-sky-400 flex items-center justify-center">
              <ThermometerSnowflake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{totalChillerSticks.toLocaleString()} <span className="text-xs font-normal text-stone-400">cucuk</span></div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Ayam: {storage.ayamRawChiller} | Lembu: {storage.dagingRawChiller}
            </p>
          </div>
        </div>

        {/* Card 4: Hasil Potong Daging (Yield) */}
        <div className="bg-stone-900/90 border border-stone-800/80 rounded-xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Hasil Trimming Kilang</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400">91.6%</div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Waste: 4.2 kg (Ayam Segar 50kg)
            </p>
          </div>
        </div>
      </div>

      {/* Main 2 Column Grid: Restaurant Wing vs Factory Wing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Restaurant Floor & Live KDS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-600/20 text-orange-400">
                <Store className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-lg text-white">Operasi Restoran & Meja</h2>
            </div>
            <Link href="/kitchen" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold">
              <span>Buka Skrin Penuh KDS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Orders List */}
          <div className="space-y-3">
            {orders.map((order) => {
              const sataySticks = order.items
                .filter(i => i.station === 'grill')
                .reduce((sum, item) => sum + item.quantity, 0);

              const wokDishes = order.items
                .filter(i => i.station === 'wok')
                .map(i => `${i.quantity}x ${i.name}`)
                .join(', ');

              return (
                <div
                  key={order.id}
                  className="bg-stone-900 border border-stone-800 hover:border-orange-900/50 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-orange-400">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          order.type === 'dine_in'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-blue-950 text-blue-300 border border-blue-800/40'
                        }`}>
                          {order.type === 'dine_in' ? `Meja ${order.tableNumber}` : 'Bungkus / Takeaway'}
                        </span>
                        <span className="text-xs text-stone-400">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>Masa: {order.createdAt}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">
                          {order.isPaid ? 'Lunas' : 'Belum Bayar'} (RM {order.total.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                        order.status === 'cooking'
                          ? 'bg-orange-950/80 text-orange-400 border border-orange-800/50'
                          : 'bg-stone-800 text-stone-300'
                      }`}>
                        {order.status === 'cooking' ? 'Sedang Dimasak' : 'Menunggu'}
                      </span>
                    </div>
                  </div>

                  {/* Split Routing Summary */}
                  <div className="mt-3 pt-3 border-t border-stone-800/60 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-950/60 p-2.5 rounded-lg border border-orange-950/40">
                      <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider block mb-1">
                        🔥 Bahagian Sate Arang
                      </span>
                      {sataySticks > 0 ? (
                        <p className="font-semibold text-stone-200">
                          {sataySticks} cucuk sate ({order.stationStatus.grill === 'grilling' ? 'Sedang Dibakar' : 'Menunggu Api'})
                        </p>
                      ) : (
                        <p className="text-stone-400 italic">Tiada pesanan sate</p>
                      )}
                    </div>

                    <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                        🍳 Dapur Soto & Kuali Panas
                      </span>
                      {wokDishes ? (
                        <p className="font-semibold text-stone-200 line-clamp-1">
                          {wokDishes}
                        </p>
                      ) : (
                        <p className="text-stone-400 italic">Tiada hidangan kuali</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Production Line & Chiller Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400">
                <Factory className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-lg text-white">Kilang Pemprosesan Sate</h2>
            </div>
            <Link href="/production" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold">
              <span>Urus Kilang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cold Room Stock Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-400" />
                Inventori Bilik Sejuk (Chiller & Freezer)
              </span>
              <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/40">
                Suhu: 2°C Optimal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
                <div className="text-stone-400">Sate Ayam Mentah</div>
                <div className="text-lg font-black text-white">{storage.ayamRawChiller} <span className="text-xs text-stone-400 font-normal">cucuk</span></div>
              </div>
              <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
                <div className="text-stone-400">Sate Lembu Mentah</div>
                <div className="text-lg font-black text-white">{storage.dagingRawChiller} <span className="text-xs text-stone-400 font-normal">cucuk</span></div>
              </div>
              <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
                <div className="text-stone-400">Sate Kambing</div>
                <div className="text-lg font-black text-white">{storage.kambingRawChiller} <span className="text-xs text-stone-400 font-normal">cucuk</span></div>
              </div>
              <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
                <div className="text-stone-400">Pek Vakum Beku (50s)</div>
                <div className="text-lg font-black text-amber-400">{storage.frozenPacks50} <span className="text-xs text-stone-400 font-normal">pek</span></div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>Baki Lidi Buluh: <strong className="text-stone-200">{storage.bambooSkewersLeft.toLocaleString()}</strong> pcs</span>
              <span>Arang Kayu Bakau: <strong className="text-stone-200">{storage.charcoalBagsLeft}</strong> guni</span>
            </div>
          </div>

          {/* Quick Meat Intake Log */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-orange-400" />
                Kemasukan Daging Terkini (Yield)
              </span>
              <Link href="/production" className="text-[11px] text-orange-400 hover:underline">
                + Rekod Baru
              </Link>
            </div>

            <div className="space-y-2">
              {meatIntake.slice(0, 2).map((intake) => (
                <div key={intake.id} className="bg-stone-950/70 p-2.5 rounded-lg border border-stone-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{intake.meatType}</div>
                    <div className="text-stone-400 text-[11px]">
                      Kotor: {intake.grossWeightKg}kg ➔ Bersih: <strong className="text-amber-400">{intake.netWeightKg}kg</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      {intake.yieldPercent}% Hasil
                    </span>
                    <div className="text-[11px] text-stone-400 mt-1">
                      Anggaran: {intake.targetSticksExpected} cucuk
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wholesale & Event Promotion */}
          <div className="bg-gradient-to-br from-amber-950/40 to-stone-900 border border-amber-900/30 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-amber-300">Tempahan Katering & Frozen</div>
              <p className="text-xs text-stone-300 mt-0.5">
                Stok pek sate beku & slot bakar live katering hujung minggu ini.
              </p>
            </div>
            <Link
              href="/wholesale"
              className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs whitespace-nowrap"
            >
              Urus Borong
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
