'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  PieChart, 
  Calculator, 
  Printer, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export default function ReportsPage() {
  const [selectedMeat, setSelectedMeat] = useState<'ayam' | 'daging' | 'kambing'>('ayam');

  // Interactive Cost Breakdown state
  const [rawMeatCostPerKg, setRawMeatCostPerKg] = useState<number>(13.50);
  const [yieldPercent, setYieldPercent] = useState<number>(91.5);
  const [marinadeCostPerStick, setMarinadeCostPerStick] = useState<number>(0.12);
  const [bambooSkewerCost, setBambooSkewerCost] = useState<number>(0.02);
  const [pieceRateWage, setPieceRateWage] = useState<number>(0.08);
  const [charcoalCostPerStick, setCharcoalCostPerStick] = useState<number>(0.06);

  // Computations
  // 1 kg meat trimmed -> yield kg -> sticks at 25g each
  const netKgPer1000g = 1000 * (yieldPercent / 100);
  const sticksPerKg = netKgPer1000g / 25;
  const meatCostPerStick = sticksPerKg > 0 ? rawMeatCostPerKg / sticksPerKg : 0;
  
  const totalCostPerStick = 
    meatCostPerStick + 
    marinadeCostPerStick + 
    bambooSkewerCost + 
    pieceRateWage + 
    charcoalCostPerStick;

  const sellingPrice = selectedMeat === 'ayam' ? 1.30 : selectedMeat === 'daging' ? 1.60 : 2.00;
  const grossProfitPerStick = sellingPrice - totalCostPerStick;
  const marginPercent = sellingPrice > 0 ? ((grossProfitPerStick / sellingPrice) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-orange-950/60 border border-orange-900/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-600 text-white uppercase">
              Kewangan & Analisis
            </span>
            <span className="text-xs text-stone-400 font-mono">Penutup Harian & Kos Se-Cucuk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Laporan Jualan (Z-Report) & Analisis Kos Sate
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Audit ketepatan stok keluar vs jualan duit, penyata tutup kaunter harian, dan analisis untung bersih se-cucuk sate.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 border border-orange-900/40 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Z-Report Harian</span>
        </button>
      </div>

      {/* Daily Settlement (Z-Report) Snapshot */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              Penyata Z-Report (Tutup Kaunter Hari Ini)
            </h2>
            <p className="text-xs text-stone-400">Tarikh: 16 Nov 2026 • Cawangan Pulau Indah</p>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/40 font-bold">
            Status: Seimbang (Tally)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-400 block">Jualan Tunai (Laci):</span>
            <div className="text-xl font-black text-white font-mono mt-1">RM 485.50</div>
            <span className="text-[10px] text-stone-400">Float laci: RM 200.00</span>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-400 block">DuitNow QR Bank:</span>
            <div className="text-xl font-black text-rose-400 font-mono mt-1">RM 624.10</div>
            <span className="text-[10px] text-stone-400">18 transaksi QR</span>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-400 block">Terminal Kad / PayWave:</span>
            <div className="text-xl font-black text-sky-400 font-mono mt-1">RM 175.00</div>
            <span className="text-[10px] text-stone-400">5 transaksi</span>
          </div>

          <div className="bg-gradient-to-br from-orange-950/60 to-stone-950 p-3.5 rounded-xl border border-orange-900/50">
            <span className="text-xs text-orange-300 block font-semibold">Jumlah Kasar Hari Ini:</span>
            <div className="text-2xl font-black text-orange-400 font-mono mt-1">RM 1,284.60</div>
            <span className="text-[10px] text-emerald-400 font-bold">Cucuk Sate Terjual: 620 pcs</span>
          </div>
        </div>

        {/* Stock vs Cash Audit Variance */}
        <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-stone-200">Audit Pengurangan Stok (Variance Audit):</span>
              <p className="text-stone-400 text-[11px]">
                Stok keluar dari Chiller Kilang (625 cucuk) vs Rekod Terjual di POS (620 cucuk)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-stone-300 font-mono font-bold">Varians: -5 cucuk (-0.8%)</span>
            <span className="block text-[10px] text-stone-400">(Bakar hangus/contoh rasa semasa bakar)</span>
          </div>
        </div>
      </div>

      {/* True Cost-Per-Stick Simulator */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              Kalkulator Kos Sebenar Se-Cucuk Sate (Cost Per Stick)
            </h2>
            <p className="text-xs text-stone-400">
              Kira margin keuntungan sebenar selepas mengambil kira susut daging, upah lidi, rempah dan arang.
            </p>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'ayam', label: 'Sate Ayam (RM 1.30)' },
              { id: 'daging', label: 'Sate Lembu (RM 1.60)' },
              { id: 'kambing', label: 'Sate Kambing (RM 2.00)' },
            ].map((meat) => (
              <button
                key={meat.id}
                onClick={() => {
                  setSelectedMeat(meat.id as any);
                  if (meat.id === 'ayam') setRawMeatCostPerKg(13.50);
                  if (meat.id === 'daging') setRawMeatCostPerKg(32.00);
                  if (meat.id === 'kambing') setRawMeatCostPerKg(42.00);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMeat === meat.id
                    ? 'bg-amber-600 text-stone-950 font-black'
                    : 'bg-stone-950 text-stone-400 hover:text-white'
                }`}
              >
                {meat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders and Input Controls */}
          <div className="lg:col-span-7 space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-stone-300 font-semibold mb-1">
                <span>Harga Belian Daging Mentah per kg:</span>
                <span className="font-mono text-amber-400">RM {rawMeatCostPerKg.toFixed(2)}/kg</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="0.5"
                value={rawMeatCostPerKg}
                onChange={(e) => setRawMeatCostPerKg(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-stone-300 font-semibold mb-1">
                <span>Kadar Hasil Trimming Daging (Yield %):</span>
                <span className="font-mono text-emerald-400">{yieldPercent}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                step="0.5"
                value={yieldPercent}
                onChange={(e) => setYieldPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
                <span className="text-stone-400 block mb-1">Rempah & Perapan:</span>
                <span className="font-mono font-bold text-stone-200">RM {marinadeCostPerStick.toFixed(2)} / lidi</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
                <span className="text-stone-400 block mb-1">Lidi Buluh Tebal:</span>
                <span className="font-mono font-bold text-stone-200">RM {bambooSkewerCost.toFixed(2)} / lidi</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
                <span className="text-stone-400 block mb-1">Upah Mencucuk (Piece-rate):</span>
                <span className="font-mono font-bold text-stone-200">RM {pieceRateWage.toFixed(2)} / lidi</span>
              </div>
              <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
                <span className="text-stone-400 block mb-1">Arang Kayu Bakau:</span>
                <span className="font-mono font-bold text-stone-200">RM {charcoalCostPerStick.toFixed(2)} / lidi</span>
              </div>
            </div>
          </div>

          {/* Visual Profit & Margin Result Card */}
          <div className="lg:col-span-5 bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block mb-2">
                Rumusan Margin Bersih Se-Cucuk
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>Kos Daging Sebenar (25g):</span>
                  <span className="font-mono font-bold text-stone-100">RM {meatCostPerStick.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Bahan Tambahan (Perap+Lidi+Arang+Upah):</span>
                  <span className="font-mono font-bold text-stone-100">
                    RM {(marinadeCostPerStick + bambooSkewerCost + pieceRateWage + charcoalCostPerStick).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-200 font-bold pt-2 border-t border-stone-800">
                  <span>Jumlah Kos Sebenar Se-Cucuk:</span>
                  <span className="font-mono text-base text-rose-400">RM {totalCostPerStick.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-200 font-bold">
                  <span>Harga Jualan Semasa:</span>
                  <span className="font-mono text-base text-white">RM {sellingPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-stone-900 border border-emerald-900/50 rounded-xl p-3 text-center">
              <span className="text-[11px] text-emerald-300 block font-semibold">Keuntungan Kasar Se-Cucuk</span>
              <div className="text-2xl font-black text-emerald-400 font-mono my-0.5">
                RM {grossProfitPerStick.toFixed(2)}
              </div>
              <span className="text-xs text-stone-300 font-bold">
                Margin: <strong className="text-emerald-400">{marginPercent}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
