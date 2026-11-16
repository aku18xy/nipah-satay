'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Calendar, 
  Phone, 
  Truck, 
  CheckCircle2, 
  Flame, 
  FileText, 
  Plus, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_STORAGE } from '@/lib/data';

interface WholesaleOrder {
  id: string;
  clientName: string;
  category: 'frozen_pack' | 'live_catering';
  details: string;
  quantity: number;
  totalPrice: number;
  status: 'confirmed' | 'pending_deposit' | 'delivered';
  dateRequired: string;
  phone: string;
}

export default function WholesalePage() {
  const [storage] = useState(INITIAL_STORAGE);
  const [orders, setOrders] = useState<WholesaleOrder[]>([
    {
      id: 'B2B-801',
      clientName: 'Kantin Kilang Kimia Pulau Indah',
      category: 'frozen_pack',
      details: 'Pek Beku 50 Sate Ayam (6 pek) + 3kg Kuah Beku',
      quantity: 300,
      totalPrice: 360.00,
      status: 'confirmed',
      dateRequired: '2026-11-18',
      phone: '019-3321122',
    },
    {
      id: 'CAT-902',
      clientName: 'Kenduri Aqiqah En. Farid (Telok Gong)',
      category: 'live_catering',
      details: 'Pakej Bakar Live 800 Cucuk (500 Ayam, 300 Lembu) + Pitmaster 2 Orang',
      quantity: 800,
      totalPrice: 1250.00,
      status: 'pending_deposit',
      dateRequired: '2026-11-22',
      phone: '012-9876543',
    },
  ]);

  const [clientName, setClientName] = useState('');
  const [category, setCategory] = useState<'frozen_pack' | 'live_catering'>('frozen_pack');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState<number>(300);
  const [date, setDate] = useState('2026-11-20');
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddB2B = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: WholesaleOrder = {
      id: `${category === 'frozen_pack' ? 'B2B' : 'CAT'}-${Date.now().toString().slice(-4)}`,
      clientName,
      category,
      details,
      quantity: 200,
      totalPrice: Number(price),
      status: 'confirmed',
      dateRequired: date,
      phone,
    };
    setOrders([newOrder, ...orders]);
    setModalOpen(false);
    setClientName('');
    setPhone('');
    setDetails('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/60 border border-amber-900/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-stone-950 uppercase">
              B2B & Katering Acara
            </span>
            <span className="text-xs text-stone-400 font-mono">Bekalan Kantin, Ejen & Kenduri</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Pek Sate Beku & Tempahan Katering Pitmaster
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Urus stok sate beku pek vakum (mudah simpan hingga 6 bulan) dan jadual slot pembakar sate live di majlis kenduri & korporat.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Tempahan Katering / Borong Baru</span>
        </button>
      </div>

      {/* Stock Cards for Frozen Products */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Stok Sedia Ada: Pek Beku 20s</span>
            <div className="text-2xl font-black text-white mt-1">
              {storage.frozenPacks20} <span className="text-xs text-stone-400 font-normal">pek</span>
            </div>
            <span className="text-[11px] text-emerald-400">Harga Ejen: RM 24.00/pek</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Stok Sedia Ada: Pek Beku 50s</span>
            <div className="text-2xl font-black text-white mt-1">
              {storage.frozenPacks50} <span className="text-xs text-stone-400 font-normal">pek</span>
            </div>
            <span className="text-[11px] text-amber-400">Khas Kantin & Majlis: RM 58.00/pek</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-950/60 text-orange-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Kuah Kacang Pek Vakum (1kg)</span>
            <div className="text-2xl font-black text-white mt-1">
              {storage.kuahKacangLiters} <span className="text-xs text-stone-400 font-normal">liter</span>
            </div>
            <span className="text-[11px] text-stone-400">Pekat & tahan beku</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
        <h2 className="font-extrabold text-base text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          Senarai Tempahan Borong & Slot Katering Masuk
        </h2>

        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                    {ord.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ord.category === 'live_catering'
                      ? 'bg-orange-950 text-orange-300 border border-orange-800/40'
                      : 'bg-sky-950 text-sky-300 border border-sky-800/40'
                  }`}>
                    {ord.category === 'live_catering' ? '🎪 Katering Live Arang' : '📦 Sate Beku Vakum'}
                  </span>
                  <h3 className="font-bold text-sm text-white">{ord.clientName}</h3>
                </div>
                <p className="text-xs text-stone-300">{ord.details}</p>
                <div className="text-[11px] text-stone-400 flex items-center gap-3">
                  <span>Tarikh Perlu: <strong className="text-stone-200">{ord.dateRequired}</strong></span>
                  <span>•</span>
                  <span>Tel: <strong className="text-stone-200">{ord.phone}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:border-l sm:border-stone-800 sm:pl-4 justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-xs text-stone-400">Jumlah Bil:</div>
                  <div className="font-mono font-extrabold text-base text-amber-400">
                    RM {ord.totalPrice.toFixed(2)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    ord.status === 'confirmed'
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-amber-950 text-amber-400'
                  }`}>
                    {ord.status === 'confirmed' ? 'Disahkan & Deposit Selesai' : 'Menunggu Bayaran'}
                  </span>
                </div>

                <a
                  href={`https://wa.me/6${ord.phone.replace(/[^0-9]/g, '')}?text=Salam%20${encodeURIComponent(ord.clientName)},%20Nipah%20Satay%20mengesahkan%20tempahan%20${encodeURIComponent(ord.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-900/40"
                  title="Hubungi WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal New Wholesale */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddB2B}
            className="bg-stone-900 border border-amber-900/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white">Daftar Tempahan Borong / Katering</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-stone-400 block mb-1">Kategori Pesanan:</label>
                <div className="grid grid-cols-2 gap-2 font-bold">
                  <button
                    type="button"
                    onClick={() => setCategory('frozen_pack')}
                    className={`p-2 rounded-lg border ${
                      category === 'frozen_pack'
                        ? 'bg-amber-600 text-stone-950 border-amber-500'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    📦 Pek Sate Beku
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('live_catering')}
                    className={`p-2 rounded-lg border ${
                      category === 'live_catering'
                        ? 'bg-orange-600 text-white border-orange-500'
                        : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    🎪 Katering Bakar Live
                  </button>
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nama Syarikat / Pelanggan:</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="cth. Kantin Port Klang / Pn. Aini"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nombor Telefon WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="012-XXXXXXX"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Butiran Pesanan (Bilangan cucuk & jenis):</label>
                <textarea
                  rows={2}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="cth. 500 sate ayam + 200 daging, live pitmaster 2 jam"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Tarikh Penghantaran:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Jumlah Harga (RM):</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow-lg mt-2"
            >
              Simpan & Rekod Tempahan
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
