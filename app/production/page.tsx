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
  const [transferMeat, setTransferMeat] = useState<'ayam' | 'daging' | 'kambing'>('ayam');
  const [transferAmount, setTransferAmount] = useState<number>(200);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // New Skewer Log state
  const [workerName, setWorkerName] = useState('Kak Linda');
  const [sticksCut, setSticksCut] = useState(600);
  const [workerShift, setWorkerShift] = useState<'Pagi' | 'Petang'>('Pagi');

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
    const rate = 0.08; // RM 0.08 per skewer piece-rate
    const newLog: SkeweringWorkerLog = {
      id: `SKW-${Date.now().toString().slice(-4)}`,
      workerName,
      date: new Date().toISOString().split('T')[0],
      shift: workerShift,
      meatType: 'Sate Ayam',
      sticksCompleted: Number(sticksCut),
      ratePerStick: rate,
      totalEarnings: Number((sticksCut * rate).toFixed(2)),
      qualityCheck: 'Pass',
    };

    setSkewerLogs([newLog, ...skewerLogs]);
    // update chiller stock
    setStorage((prev) => ({
      ...prev,
      ayamRawChiller: prev.ayamRawChiller + Number(sticksCut),
      bambooSkewersLeft: prev.bambooSkewersLeft - Number(sticksCut),
    }));
  };

  const handleTransferToKitchen = () => {
    setStorage((prev) => {
      if (transferMeat === 'ayam') {
        return { ...prev, ayamRawChiller: Math.max(0, prev.ayamRawChiller - transferAmount) };
      } else if (transferMeat === 'daging') {
        return { ...prev, dagingRawChiller: Math.max(0, prev.dagingRawChiller - transferAmount) };
      } else {
        return { ...prev, kambingRawChiller: Math.max(0, prev.kambingRawChiller - transferAmount) };
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 border border-orange-900/50 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Pindah ke Dapur Bakar</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/50"
          >
            <Plus className="w-4 h-4" />
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
        {/* Left Column (7 cols): Meat Intake & Yield Table */}
        <div className="lg:col-span-7 space-y-4">
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

        {/* Right Column (5 cols): Worker Piece-Rate Payroll & Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <h2 className="font-extrabold text-base text-white">
                Gaji & Output Pekerja Cucuk
              </h2>
            </div>
            <span className="text-xs text-amber-400 font-mono">RM 0.08 / cucuk</span>
          </div>

          {/* Quick Add Log Form */}
          <form onSubmit={handleAddSkewerLog} className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3 shadow-md">
            <span className="text-xs font-bold text-stone-300 block">
              + Catat Output Pencucuk Harian
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Nama Pekerja:</label>
                <select
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white font-medium focus:outline-none"
                >
                  <option value="Kak Linda (Ketua Pencucuk)">Kak Linda</option>
                  <option value="Cik Yana">Cik Yana</option>
                  <option value="Pak Usop">Pak Usop</option>
                  <option value="Pekerja Sambilan 1">Pekerja Sambilan 1</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Syif Kerja:</label>
                <select
                  value={workerShift}
                  onChange={(e) => setWorkerShift(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white font-medium focus:outline-none"
                >
                  <option value="Pagi">Pagi (8 AM - 12 PM)</option>
                  <option value="Petang">Petang (2 PM - 6 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-stone-400 mb-1">
                <span>Bilangan Cucuk Berjaya Siap:</span>
                <span className="font-bold text-amber-400">{sticksCut} cucuk</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={sticksCut}
                onChange={(e) => setSticksCut(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
              <span className="text-stone-400">Anggaran Upah Hari Ini:</span>
              <span className="font-mono text-base font-extrabold text-emerald-400">
                RM {(sticksCut * 0.08).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Simpan & Masukkan ke Chiller (+{sticksCut} Cucuk)
            </button>
          </form>

          {/* List of Today's Workers Output */}
          <div className="space-y-2">
            {skewerLogs.map((log) => (
              <div
                key={log.id}
                className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{log.workerName}</div>
                  <div className="text-stone-400 text-[11px]">
                    Syif {log.shift} • {log.meatType}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-amber-400">
                    {log.sticksCompleted} cucuk
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold font-mono">
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
