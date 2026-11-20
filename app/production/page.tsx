'use client';

import React, { useState } from 'react';
import { 
  Factory, 
  Scale, 
  Users, 
  ThermometerSnowflake, 
  Plus, 
  ArrowRightLeft, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Calculator,
  Calendar
} from 'lucide-react';
import { INITIAL_MEAT_INTAKE, INITIAL_SKEWER_LOGS, INITIAL_STORAGE } from '@/lib/data';
import { MeatIntakeRecord, SkeweringWorkerLog, ColdStorageInventory } from '@/lib/types';

export default function ProductionPage() {
  const [intakeRecords, setIntakeRecords] = useState<MeatIntakeRecord[]>(INITIAL_MEAT_INTAKE);
  const [skewerLogs, setSkewerLogs] = useState<SkeweringWorkerLog[]>(INITIAL_SKEWER_LOGS);
  const [storage, setStorage] = useState<ColdStorageInventory>(INITIAL_STORAGE);

  // Modal / Form state for new Meat Intake
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meatType, setMeatType] = useState<'Ayam (Dada/Paha)' | 'Daging Batang Pinang' | 'Kambing Premium' | 'Perut Lembu'>('Ayam (Dada/Paha)');
  const [grossWeight, setGrossWeight] = useState<number>(50);
  const [trimLoss, setTrimLoss] = useState<number>(4.0);
  const [costPerKg, setCostPerKg] = useState<number>(13.50);
  const [supplier, setSupplier] = useState('Pembekal Ayam Segar Telok Gong');

  // Transfer to restaurant grill state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferMeat, setTransferMeat] = useState<'ayam' | 'daging' | 'kambing' | 'perut'>('ayam');
  const [transferAmount, setTransferAmount] = useState<number>(200);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // New Skewer Log state
  const [workerName, setWorkerName] = useState('Kak Linda (Ketua Pencucuk)');
  const [workerMeatType, setWorkerMeatType] = useState<'Sate Ayam' | 'Sate Daging' | 'Sate Kambing' | 'Sate Perut'>('Sate Ayam');
  const [sticksCut, setSticksCut] = useState(600);
  const [workerShift, setWorkerShift] = useState<'Pagi' | 'Petang'>('Pagi');
  const [workerSaveSuccess, setWorkerSaveSuccess] = useState(false);

  // Dynamic piece-rate based on meat type
  const getRateForMeat = (type: string) => {
    switch (type) {
      case 'Sate Daging':
        return 0.09;
      case 'Sate Kambing':
        return 0.10;
      case 'Sate Perut':
        return 0.09;
      default:
        return 0.08; // Sate Ayam
    }
  };
  const currentRate = getRateForMeat(workerMeatType);
  const estimatedWage = (sticksCut * currentRate).toFixed(2);

  // Calculations for current form
  const netWeight = Math.max(0, grossWeight - trimLoss);
  const yieldPct = grossWeight > 0 ? ((netWeight / grossWeight) * 100).toFixed(1) : '0';
  // Standard satay meat portion: ~25 grams usable meat per skewer
  const expectedSticks = Math.floor((netWeight * 1000) / 25);
  const totalMeatCost = grossWeight * costPerKg;
  const costPerStickEstimate = expectedSticks > 0 ? (totalMeatCost / expectedSticks).toFixed(2) : '0.00';

  const handleSaveIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MeatIntakeRecord = {
      id: `MI-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      supplier,
      meatType,
      grossWeightKg: Number(grossWeight),
      trimLossKg: Number(trimLoss),
      netWeightKg: Number(netWeight.toFixed(2)),
      yieldPercent: Number(yieldPct),
      targetSticksExpected: expectedSticks,
      costPerKg: Number(costPerKg),
      totalCost: totalMeatCost,
      marinadeBatchCode: `MRN-${Date.now().toString().slice(-4)}`,
      status: 'cucuk',
    };

    setIntakeRecords([newRecord, ...intakeRecords]);
    setIsModalOpen(false);
  };

  const handleAddSkewerLog = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = getRateForMeat(workerMeatType);
    const newLog: SkeweringWorkerLog = {
      id: `SKW-${Date.now().toString().slice(-4)}`,
      workerName,
      date: new Date().toISOString().split('T')[0],
      shift: workerShift,
      meatType: workerMeatType,
      sticksCompleted: Number(sticksCut),
      ratePerStick: rate,
      totalEarnings: Number((sticksCut * rate).toFixed(2)),
      qualityCheck: 'Pass',
    };

    setSkewerLogs([newLog, ...skewerLogs]);
    setWorkerSaveSuccess(true);
    setTimeout(() => setWorkerSaveSuccess(false), 3500);

    // update corresponding chiller stock
    setStorage((prev) => {
      const added = Number(sticksCut);
      const updated = {
        ...prev,
        bambooSkewersLeft: Math.max(0, prev.bambooSkewersLeft - added),
      };
      if (workerMeatType === 'Sate Ayam') {
        updated.ayamRawChiller = prev.ayamRawChiller + added;
      } else if (workerMeatType === 'Sate Daging') {
        updated.dagingRawChiller = prev.dagingRawChiller + added;
      } else if (workerMeatType === 'Sate Kambing') {
        updated.kambingRawChiller = prev.kambingRawChiller + added;
      } else if (workerMeatType === 'Sate Perut') {
        updated.perutRawChiller = prev.perutRawChiller + added;
      }
      return updated;
    });
  };

  const handleTransferToKitchen = () => {
    setStorage((prev) => {
      if (transferMeat === 'ayam') {
        return { ...prev, ayamRawChiller: Math.max(0, prev.ayamRawChiller - transferAmount) };
      } else if (transferMeat === 'daging') {
        return { ...prev, dagingRawChiller: Math.max(0, prev.dagingRawChiller - transferAmount) };
      } else if (transferMeat === 'kambing') {
        return { ...prev, kambingRawChiller: Math.max(0, prev.kambingRawChiller - transferAmount) };
      } else {
        return { ...prev, perutRawChiller: Math.max(0, prev.perutRawChiller - transferAmount) };
      }
    });

    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setTransferModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-stone-950 uppercase tracking-wider">
              Kilang Sate Sebelah Restoran
            </span>
            <span className="text-xs text-stone-400 font-mono">Bilik Suhu Terkawal & HACCP</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Pengurusan Barisan Pengeluaran Sate (Factory Line)
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Pantau hasil timbangan daging, formula perapan serai kunyit, rekod upah pencucuk, dan pemindahan stok ke dapur bakar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="w-full justify-center px-3.5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 border border-orange-900/50 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
            <span>Pindah ke Dapur Bakar</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full justify-center px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-950/50 active:scale-95"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Kemasukan Daging Baru</span>
          </button>
        </div>
      </div>

      {/* Production Storage & Material Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-400" />
            Chiller Sate Ayam
          </div>
          <div className="text-2xl font-black text-white">{storage.ayamRawChiller.toLocaleString()} <span className="text-xs text-stone-400 font-normal">cucuk</span></div>
          <div className="text-[11px] text-emerald-400 font-semibold">Sedia dibakar di pit arang</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-400" />
            Chiller Sate Lembu & Kambing
          </div>
          <div className="text-2xl font-black text-amber-400">{(storage.dagingRawChiller + storage.kambingRawChiller).toLocaleString()} <span className="text-xs text-stone-400 font-normal">cucuk</span></div>
          <div className="text-[11px] text-stone-400">Lembu: {storage.dagingRawChiller} | Kambing: {storage.kambingRawChiller}</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            Baki Lidi Buluh Sate
          </div>
          <div className="text-2xl font-black text-white">{storage.bambooSkewersLeft.toLocaleString()} <span className="text-xs text-stone-400 font-normal">pcs</span></div>
          <div className="text-[11px] text-stone-400">Cukup untuk ~5 hari pengeluaran</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-amber-400" />
            Arang Kayu Bakau Asli
          </div>
          <div className="text-2xl font-black text-white">{storage.charcoalBagsLeft} <span className="text-xs text-stone-400 font-normal">guni</span></div>
          <div className="text-[11px] text-stone-400">Khas untuk api sate beraroma wangi</div>
        </div>
      </div>

      {/* Main Grid: Meat Yield Intake vs Worker Piece-Rate Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Meat Intake & Yield Table (order-2 on mobile so worker form is first) */}
        <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <h2 className="font-extrabold text-base text-white">
                Log Timbangan Daging & Kadar Hasil (Yield %)
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-mono">Formula: 25g/cucuk</span>
          </div>

          <div className="space-y-3">
            {intakeRecords.map((record) => (
              <div
                key={record.id}
                className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                        {record.id}
                      </span>
                      <h3 className="font-bold text-sm text-white">{record.meatType}</h3>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Pembekal: <strong className="text-stone-300">{record.supplier}</strong> • Kod Perap: <span className="font-mono text-orange-400">{record.marinadeBatchCode}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    {record.yieldPercent}% Hasil
                  </span>
                </div>

                {/* Weight & Cost Metric Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-800 text-xs">
                  <div className="bg-stone-950 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Berat Kasar:</span>
                    <span className="font-bold text-stone-200">{record.grossWeightKg} kg</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Lemak/Tulang:</span>
                    <span className="font-bold text-rose-400">-{record.trimLossKg} kg</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Daging Bersih:</span>
                    <span className="font-bold text-amber-400">{record.netWeightKg} kg</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-lg">
                    <span className="text-stone-400 text-[10px] block">Sasaran Cucuk:</span>
                    <span className="font-bold text-white font-mono">{record.targetSticksExpected}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-stone-400 pt-1">
                  <span>Kos Belian: <strong className="text-stone-200">RM {record.totalCost.toFixed(2)}</strong> (RM {record.costPerKg.toFixed(2)}/kg)</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    Kos Daging Mentah: ~RM {(record.totalCost / record.targetSticksExpected).toFixed(2)} / cucuk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Worker Piece-Rate Payroll & Output (order-1 on mobile for instant visibility) */}
        <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  Gaji &amp; Output Pekerja Cucuk
                </h2>
                <p className="text-xs text-stone-400">Kadar bayaran per cucuk mengikut jenis sate</p>
              </div>
            </div>
            <span className="text-xs sm:text-sm text-amber-400 font-mono font-black bg-amber-950/80 border border-amber-800/50 px-2.5 py-1 rounded-xl">
              RM {currentRate.toFixed(2)} / cucuk
            </span>
          </div>

          {/* Senior-Friendly Quick Add Log Form */}
          <form onSubmit={handleAddSkewerLog} className="bg-stone-900 border-2 border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <span className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                <span>📝</span> Catat Output Cucuk Harian
              </span>
              <span className="text-xs text-stone-400">
                Syif: <strong className="text-white">{workerShift}</strong>
              </span>
            </div>

            {/* Banner Kejayaan Bila Simpan */}
            {workerSaveSuccess && (
              <div className="bg-emerald-950 border-2 border-emerald-500 text-emerald-200 p-3 rounded-xl flex items-center gap-3 animate-bounce">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div className="text-xs sm:text-sm font-bold">
                  Berjaya Disimpan! +{sticksCut} cucuk {workerMeatType} dimasukkan ke Chiller.
                </div>
              </div>
            )}

            {/* 1. Pilih Nama Pekerja (Butang Besar Mesra Sentuhan) */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-stone-200 block mb-2">
                1. Pilih Nama Pekerja:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Kak Linda (Ketua Pencucuk)', label: '👩 Kak Linda', short: 'Kak Linda' },
                  { name: 'Pak Usop', label: '👨 Pak Usop', short: 'Pak Usop' },
                  { name: 'Cik Yana', label: '👧 Cik Yana', short: 'Cik Yana' },
                  { name: 'Pekerja Sambilan 1', label: '🧑 Sambilan', short: 'Sambilan' },
                ].map((w) => (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => setWorkerName(w.name)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      workerName === w.name
                        ? 'bg-amber-600 text-stone-950 border-amber-400 font-black shadow-lg shadow-amber-950/60 scale-[1.02]'
                        : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-sm sm:text-base font-extrabold">{w.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pilih Jenis Sate (Butang Besar Warna-Warni) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-stone-200">
                  2. Pilih Jenis Sate:
                </label>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Kadar: RM {currentRate.toFixed(2)} / cucuk
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Sate Ayam', label: '🍗 Ayam', rate: 'RM 0.08' },
                  { id: 'Sate Daging', label: '🥩 Lembu', rate: 'RM 0.09' },
                  { id: 'Sate Kambing', label: '🐐 Kambing', rate: 'RM 0.10' },
                  { id: 'Sate Perut', label: '🫀 Babat', rate: 'RM 0.09' },
                ].map((satay) => (
                  <button
                    key={satay.id}
                    type="button"
                    onClick={() => setWorkerMeatType(satay.id as any)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      workerMeatType === satay.id
                        ? 'bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-950/70 font-black scale-[1.02]'
                        : 'bg-stone-950 text-stone-200 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-sm sm:text-base font-black">{satay.label}</div>
                    <div className={`text-xs mt-1 font-mono font-bold ${workerMeatType === satay.id ? 'text-orange-200' : 'text-stone-400'}`}>
                      {satay.rate} / cucuk
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Bilangan Cucuk (Display Gergasi + Stepper & Preset) */}
            <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-200">
                  3. Bilangan Cucuk Berjaya Siap:
                </label>
                <span className="text-xs text-stone-400">Tekan butang di bawah</span>
              </div>

              {/* Display Nombor Besar */}
              <div className="flex items-center justify-between bg-stone-900 border-2 border-orange-500/50 rounded-2xl p-2.5 sm:p-3">
                <button
                  type="button"
                  onClick={() => setSticksCut(Math.max(50, sticksCut - 50))}
                  className="w-14 h-14 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-black text-2xl flex items-center justify-center border border-stone-700 active:scale-95"
                  title="Tolak 50 cucuk"
                >
                  -50
                </button>

                <div className="text-center px-2">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                    {sticksCut}
                  </div>
                  <div className="text-xs sm:text-sm text-stone-300 font-bold uppercase tracking-wider">
                    Cucuk {workerMeatType}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSticksCut(sticksCut + 50)}
                  className="w-14 h-14 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl flex items-center justify-center border border-orange-500 active:scale-95 shadow-md shadow-orange-950/60"
                  title="Tambah 50 cucuk"
                >
                  +50
                </button>
              </div>

              {/* Butang Pilihan Pantas (Presets) */}
              <div>
                <span className="text-[11px] text-stone-400 font-medium block mb-1.5">
                  Pilihan Pantas Bilangan Cucuk:
                </span>
                <div className="grid grid-cols-6 gap-1.5 font-mono text-xs sm:text-sm font-bold">
                  {[200, 300, 500, 600, 800, 1000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSticksCut(num)}
                      className={`py-2 rounded-lg border transition-all ${
                        sticksCut === num
                          ? 'bg-amber-600 text-stone-950 border-amber-400 font-black'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Kotak Anggaran Gaji Gergasi */}
            <div className="bg-gradient-to-r from-emerald-950/70 via-stone-950 to-stone-950 border-2 border-emerald-600/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm text-stone-300 font-semibold block">
                  Anggaran Upah Hari Ini:
                </span>
                <p className="text-xs text-stone-400 mt-0.5">
                  {sticksCut} cucuk × RM {currentRate.toFixed(2)} ({workerMeatType})
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                  RM {estimatedWage}
                </span>
              </div>
            </div>

            {/* 5. Butang Simpan Gergasi (Tinggi & Terang) */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-base sm:text-lg shadow-xl shadow-orange-950/80 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 border-2 border-orange-400"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>SIMPAN KE CHILLER (+{sticksCut} CUCUK)</span>
            </button>
          </form>

          {/* List of Today's Workers Output */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Rekod Pencucuk Hari Ini (Syif Pagi &amp; Petang):
            </h3>
            {skewerLogs.map((log) => (
              <div
                key={log.id}
                className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm"
              >
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base">{log.workerName}</div>
                  <div className="text-stone-300 text-xs">
                    Syif {log.shift} • <strong className="text-orange-400">{log.meatType}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-amber-400 text-sm sm:text-base">
                    {log.sticksCompleted} cucuk
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-400 font-bold font-mono">
                    RM {log.totalEarnings.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: New Meat Intake */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveIntake}
            className="bg-stone-900 border border-amber-900/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-white">Rekod Timbangan & Intake Daging</h3>
                <p className="text-xs text-stone-400">Pengiraan automatik kadar bersih dan sasaran bilangan cucuk.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Jenis Daging Mentah:</label>
                <select
                  value={meatType}
                  onChange={(e) => setMeatType(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-bold focus:outline-none"
                >
                  <option value="Ayam (Dada/Paha)">Ayam Segar (Dada & Paha)</option>
                  <option value="Daging Batang Pinang">Daging Lembu Batang Pinang</option>
                  <option value="Kambing Premium">Kambing Premium Import</option>
                  <option value="Perut Lembu">Babat / Perut Lembu</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nama Pembekal:</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Berat Kasar (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Potongan Lemak/Sisa (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={trimLoss}
                    onChange={(e) => setTrimLoss(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-rose-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Harga Kos Daging per kg (RM):</label>
                <input
                  type="number"
                  step="0.5"
                  value={costPerKg}
                  onChange={(e) => setCostPerKg(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none"
                />
              </div>

              {/* Dynamic Live Calculations Banner */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Berat Bersih Boleh Diguna:</span>
                  <span className="font-mono font-bold text-amber-400">{netWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Kadar Hasil (Yield %):</span>
                  <span className="font-mono font-bold text-emerald-400">{yieldPct}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Anggaran Cucuk Sate (25g/lidi):</span>
                  <span className="font-mono font-bold text-white text-sm">{expectedSticks} cucuk</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                  <span className="text-stone-400">Anggaran Kos Daging Se-cucuk:</span>
                  <span className="font-mono font-black text-orange-400">RM {costPerStickEstimate}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-sm shadow-lg transition-all"
            >
              Sahkan Kemasukan & Jana Kod Perap
            </button>
          </form>
        </div>
      )}

      {/* Modal: Transfer from Chiller to Grill Pit */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-orange-900/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-white">Pindah Sate ke Dapur Restoran</h3>
                <p className="text-xs text-stone-400">Keluarkan stok sate siap dari chiller kilang ke meja bakar.</p>
              </div>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Pilih Jenis Sate:</label>
                <select
                  value={transferMeat}
                  onChange={(e) => setTransferMeat(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-bold focus:outline-none"
                >
                  <option value="ayam">Sate Ayam (Baki Chiller: {storage.ayamRawChiller})</option>
                  <option value="daging">Sate Lembu (Baki Chiller: {storage.dagingRawChiller})</option>
                  <option value="kambing">Sate Kambing (Baki Chiller: {storage.kambingRawChiller})</option>
                  <option value="perut">Sate Babat / Perut (Baki Chiller: {storage.perutRawChiller})</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Kuantiti Cucuk untuk Dipindahkan:</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 200, 300, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTransferAmount(amt)}
                      className={`py-1.5 rounded text-xs font-mono font-bold ${
                        transferAmount === amt ? 'bg-orange-600 text-white' : 'bg-stone-950 text-stone-300 border border-stone-800'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleTransferToKitchen}
              disabled={transferSuccess}
              className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                transferSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg'
              }`}
            >
              {transferSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Stok Berjaya Dipindahkan ke Dapur Bakar!</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Sahkan Pemindahan ({transferAmount} Cucuk)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
