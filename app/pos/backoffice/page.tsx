'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ArrowLeft, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertTriangle, 
  Layers, 
  Tag, 
  DollarSign, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Sparkles, 
  Filter, 
  Store,
  CheckCircle2,
  Utensils,
  Flame,
  CookingPot,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { MenuItem, MenuCategory, Category } from '@/lib/types';
import { INITIAL_MENU_ITEMS, INITIAL_CATEGORIES } from '@/lib/data';
import { useAuthRole } from '@/components/AuthRoleContext';

// Preset gambar makanan rasmi Nipah Satay
const PRESET_IMAGES = [
  { label: 'Sate Cucuk', path: '/images/satay_skewer.jpg' },
  { label: 'Sate Cup', path: '/images/sate_cup.jpg' },
  { label: 'Soto Dapur', path: '/images/soto.jpg' },
  { label: 'Mi Rebus', path: '/images/mi_rebus.jpg' },
  { label: 'Nasi Lemak Bungkus', path: '/images/nasi_lemak_bungkus.jpg' },
  { label: 'Set Nasi Lemak', path: '/images/set_nasi_lemak.jpg' },
  { label: 'Set Santai', path: '/images/set_santai.jpg' },
  { label: 'Set Gempaq', path: '/images/set_gempaq.jpg' },
  { label: 'Karipap', path: '/images/karipap.jpg' },
  { label: 'Lai Chee Kang', path: '/images/lai_chee_kang.jpg' },
];

// Preset ikon emoji kategori
const PRESET_ICONS = [
  '🔥', '🍢', '🍲', '🍙', '🥟', '🥤', '🍛', '🍜', '🥩', '🍗', 
  '☕', '🍨', '🍧', '🍟', '🍔', '🥪', '🥣', '🥢', '🍱', '📦'
];

export default function PosBackofficePage() {
  const { roleConfig } = useAuthRole();

  // State data menu & kategori
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'categories'>('menu');

  // Filter & Carian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Menu (Tambah / Edit)
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<{
    name: string;
    category: string;
    price: string;
    unit: string;
    minOrder: string;
    image: string;
    description: string;
    station: 'grill' | 'wok' | 'prep_bar';
    available: boolean;
    costEstimate: string;
  }>({
    name: '',
    category: 'sate',
    price: '',
    unit: 'cucuk',
    minOrder: '1',
    image: '/images/satay_skewer.jpg',
    description: '',
    station: 'grill',
    available: true,
    costEstimate: '0.00',
  });

  // Modal Kategori (Tambah / Edit)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    id: string;
    label: string;
    icon: string;
  }>({
    id: '',
    label: '',
    icon: '🍢',
  });

  // Modal Pengesahan Padam (Delete Confirmation)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'menu' | 'category';
    id: string;
    name: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Muat turun data terkini dari API
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setMenuItems(data.items);
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (e) {
      console.error('Gagal mengambil data menu:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // PENGURUSAN MENU (CRUD)
  // ==========================================
  const handleOpenAddMenuModal = () => {
    setEditingMenuItem(null);
    setMenuForm({
      name: '',
      category: categories.find(c => c.id !== 'all')?.id || 'sate',
      price: '',
      unit: 'cucuk',
      minOrder: '1',
      image: '/images/satay_skewer.jpg',
      description: '',
      station: 'grill',
      available: true,
      costEstimate: '0.00',
    });
    setMenuModalOpen(true);
  };

  const handleOpenEditMenuModal = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      unit: item.unit || 'hidangan',
      minOrder: String(item.minOrder || 1),
      image: item.image || '',
      description: item.description || '',
      station: item.station || 'wok',
      available: item.available !== false,
      costEstimate: String(item.costEstimate || 0),
    });
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name.trim() || !menuForm.price) {
      showToast('⚠️ Sila isikan nama dan harga menu!');
      return;
    }

    const priceNum = parseFloat(menuForm.price);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('⚠️ Harga tidak sah!');
      return;
    }

    try {
      if (editingMenuItem) {
        // Kemaskini (Modify)
        const res = await fetch(`/api/menu/${editingMenuItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: menuForm.name.trim(),
            category: menuForm.category,
            price: priceNum,
            unit: menuForm.unit,
            minOrder: parseInt(menuForm.minOrder) || 1,
            image: menuForm.image,
            description: menuForm.description,
            station: menuForm.station,
            available: menuForm.available,
            costEstimate: parseFloat(menuForm.costEstimate) || 0,
          }),
        });

        if (res.ok) {
          setMenuItems((prev) =>
            prev.map((i) =>
              i.id === editingMenuItem.id
                ? {
                    ...i,
                    name: menuForm.name.trim(),
                    category: menuForm.category as Category,
                    price: priceNum,
                    unit: menuForm.unit,
                    minOrder: parseInt(menuForm.minOrder) || 1,
                    image: menuForm.image,
                    description: menuForm.description,
                    station: menuForm.station,
                    available: menuForm.available,
                    costEstimate: parseFloat(menuForm.costEstimate) || 0,
                  }
                : i
            )
          );
          showToast(`✅ Menu "${menuForm.name}" berjaya dikemas kini!`);
        }
      } else {
        // Tambah Menu Baru
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: menuForm.name.trim(),
            category: menuForm.category,
            price: priceNum,
            unit: menuForm.unit,
            minOrder: parseInt(menuForm.minOrder) || 1,
            image: menuForm.image,
            description: menuForm.description,
            station: menuForm.station,
            available: menuForm.available,
            costEstimate: parseFloat(menuForm.costEstimate) || 0,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.item) {
            setMenuItems((prev) => [data.item, ...prev]);
          }
          showToast(`✅ Menu "${menuForm.name}" berjaya ditambah!`);
        }
      }
      setMenuModalOpen(false);
    } catch (e) {
      showToast('❌ Ralat semasa menyimpan menu');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.available;
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus }),
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: newStatus } : i))
      );
      showToast(newStatus ? `🟢 "${item.name}" kini DIBUKA` : `🔴 "${item.name}" ditandakan HABIS`);
    } catch (e) {
      showToast('Ralat mengemas kini status');
    }
  };

  const handleDeleteMenuConfirm = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'menu') return;
    try {
      const res = await fetch(`/api/menu/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((i) => i.id !== deleteConfirm.id));
        showToast(`🗑️ Menu "${deleteConfirm.name}" telah dipadam!`);
      }
    } catch (e) {
      showToast('Ralat memadam menu');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ==========================================
  // PENGURUSAN KATEGORI (CRUD)
  // ==========================================
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      label: '',
      icon: '🍢',
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.label.trim()) {
      showToast('⚠️ Sila isikan nama kategori!');
      return;
    }

    try {
      if (editingCategory) {
        // Kemaskini Kategori
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: categoryForm.label.trim(),
            icon: categoryForm.icon,
          }),
        });

        if (res.ok) {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? { ...c, label: categoryForm.label.trim(), icon: categoryForm.icon }
                : c
            )
          );
          showToast(`✅ Kategori "${categoryForm.label}" dikemas kini!`);
        }
      } else {
        // Tambah Kategori Baru
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: categoryForm.id || undefined,
            label: categoryForm.label.trim(),
            icon: categoryForm.icon,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.category) {
            setCategories((prev) => [...prev, data.category]);
          }
          showToast(`✅ Kategori "${categoryForm.label}" berjaya ditambah!`);
        }
      }
      setCategoryModalOpen(false);
    } catch (e) {
      showToast('❌ Ralat semasa menyimpan kategori');
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'category') return;
    try {
      const res = await fetch(`/api/categories/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
        showToast(`🗑️ Kategori "${deleteConfirm.name}" telah dipadam!`);
      }
    } catch (e) {
      showToast('Ralat memadam kategori');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Filter Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-8 text-stone-100 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 border border-orange-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Utama Backoffice (Soft Neumorphic) */}
      <div className="neu-card-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/pos"
              className="p-2 rounded-xl neu-btn text-stone-300 hover:text-white active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Kembali ke POS Kaunter"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Ke POS</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-base shadow-neu-orange">
                ⚙️
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  POS Backoffice
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-lg neu-inset-sm text-orange-400">
                    Katalog & Menu
                  </span>
                </h1>
                <p className="text-xs text-stone-400">
                  Urus menu, gambar, harga dan kategori POS Restoran & Kios Nipah Satay
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 neu-inset-sm px-3.5 py-2 text-xs">
            <span className="text-stone-400 font-medium">Menu:</span>
            <span className="font-mono font-black text-white">{menuItems.length}</span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400 font-medium">Kategori:</span>
            <span className="font-mono font-black text-orange-400">
              {categories.filter(c => c.id !== 'all').length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl neu-btn text-stone-300 active:scale-95"
            title="Segerakkan Semula Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Pilihan: Pengurusan Menu vs Pengurusan Kategori */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'neu-btn-primary shadow-neu-orange text-white'
                : 'neu-btn text-stone-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Katalog Menu ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'neu-btn-primary shadow-neu-orange text-white'
                : 'neu-btn text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kategori Menu ({categories.filter(c => c.id !== 'all').length})</span>
          </button>
        </div>

        {/* Butang Tambah Utama Mengikut Tab */}
        {activeTab === 'menu' ? (
          <button
            type="button"
            onClick={handleOpenAddMenuModal}
            className="px-4 py-2.5 rounded-2xl neu-btn-emerald text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-neu-green active:scale-95 border border-emerald-400/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenAddCategoryModal}
            className="px-4 py-2.5 rounded-2xl neu-btn-emerald text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-neu-green active:scale-95 border border-emerald-400/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PENGURUSAN MENU (TAMBAH / BUANG / MODIFY)         */}
      {/* ======================================================== */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Baris Carian & Filter Kategori (Soft Neumorphic) */}
          <div className="neu-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama menu..."
                className="neu-input w-full pl-9 pr-7 py-2 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pill Kategori */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
              {categories.map((cat) => {
                const count = cat.id === 'all'
                  ? menuItems.length
                  : menuItems.filter((i) => i.category === cat.id).length;

                const isCatActive = selectedCategoryFilter === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                      isCatActive
                        ? 'neu-btn-primary shadow-neu-orange text-white'
                        : 'neu-btn text-stone-300'
                    }`}
                  >
                    <span>{cat.icon} {cat.label}</span>
                    <span className="ml-1 text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senarai Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredMenuItems.map((item) => {
              const catObj = categories.find((c) => c.id === item.category);

              return (
                <div
                  key={item.id}
                  className={`neu-card p-3.5 flex flex-col justify-between transition-all duration-200 relative group ${
                    item.available ? 'hover:shadow-neu-flat-lg' : 'opacity-75'
                  }`}
                >
                  {/* Status Ketersediaan Tag */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all active:scale-95 ${
                        item.available
                          ? 'neu-btn-emerald shadow-neu-green text-white'
                          : 'neu-btn bg-rose-950/80 text-rose-300 border border-rose-700/60'
                      }`}
                      title="Klik untuk ubah status ketersediaan"
                    >
                      {item.available ? '🟢 Ada' : '🔴 Habis'}
                    </button>
                  </div>

                  {/* Bahagian Atas: Gambar / Ikon Menu (Sunken Well) */}
                  <div>
                    <div className="w-full h-32 rounded-xl neu-inset overflow-hidden relative mb-2.5 flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 100vw, 300px"
                          onError={(e) => {
                            // Fallback jika gambar gagal dimuatkan
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-4xl filter drop-shadow">
                          {catObj?.icon || '🍽️'}
                        </span>
                      )}
                    </div>

                    {/* Kategori Badge & Stesen */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-orange-400">
                        {catObj?.icon || '🏷️'} {catObj?.label || item.category}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 uppercase">
                        {item.station}
                      </span>
                    </div>

                    {/* Nama Menu */}
                    <h3 className="font-black text-sm text-white line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Penerangan */}
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 min-h-[2rem]">
                      {item.description || 'Tiada penerangan khusus'}
                    </p>
                  </div>

                  {/* Bahagian Bawah: Harga, Unit & Tindakan (Edit/Buang) */}
                  <div className="pt-3 border-t border-stone-800/80 mt-2 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-base font-black text-orange-400">
                        RM {item.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        per {item.unit || 'hidangan'}
                      </div>
                    </div>

                    {/* Butang Tindakan */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMenuModal(item)}
                        className="p-2 rounded-xl neu-btn text-stone-200 active:scale-95 transition-all"
                        title="Ubah Suai (Modify) Menu"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'menu',
                            id: item.id,
                            name: item.name,
                          })
                        }
                        className="p-2 rounded-xl neu-btn text-stone-400 hover:text-rose-400 active:scale-95 transition-all"
                        title="Buang (Padam) Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="p-8 text-center neu-card space-y-2 rounded-2xl">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-bold text-stone-300">Tiada menu dijumpai</p>
              <p className="text-xs text-stone-500">
                Cuba cari dengan kata kunci lain atau klik &quot;Tambah Menu&quot; untuk masukkan menu baru.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PENGURUSAN KATEGORI (TAMBAH / BUANG / MODIFY)     */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isAllCat = cat.id === 'all';
              const itemCount = isAllCat
                ? menuItems.length
                : menuItems.filter((i) => i.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="neu-card p-4 flex items-center justify-between gap-3 rounded-2xl hover:shadow-neu-flat-lg transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl w-12 h-12 rounded-xl neu-inset flex items-center justify-center shrink-0">
                      {cat.icon}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-white truncate">
                        {cat.label}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                        <span className="font-mono text-[10px] text-stone-500">ID: {cat.id}</span>
                        <span>•</span>
                        <span className="font-bold text-orange-400">{itemCount} item</span>
                      </div>
                    </div>
                  </div>

                  {/* Tindakan (Kecuali kategori asas 'all') */}
                  {!isAllCat && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategoryModal(cat)}
                        className="p-2 rounded-xl neu-btn text-stone-200 active:scale-95 transition-all"
                        title="Ubah Kategori"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'category',
                            id: cat.id,
                            name: cat.label,
                          })
                        }
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-700 active:scale-95 transition-all"
                        title="Padam Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / UBAH SUAI MENU (Soft Neumorphic)         */}
      {/* ======================================================== */}
      {menuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto animate-fadeIn">
          <div className="neu-card-lg max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-neu-flat-lg relative text-stone-100 my-8 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{editingMenuItem ? '✏️ Ubah Suai Menu' : '✨ Tambah Menu Baru'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setMenuModalOpen(false)}
                className="p-1.5 rounded-xl neu-btn text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-3.5 text-xs">
              {/* 1. Nama Menu */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  placeholder="Cth: Sate Ayam Istimewa / Kopi Tarik"
                  className="neu-input w-full px-3.5 py-2.5 rounded-xl text-white placeholder-stone-600 focus:outline-none font-bold"
                />
              </div>

              {/* 2. Kategori & Stesen Dapur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="neu-input w-full px-3 py-2.5 rounded-xl text-white focus:outline-none font-bold cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Stesen Dapur
                  </label>
                  <select
                    value={menuForm.station}
                    onChange={(e) => setMenuForm({ ...menuForm, station: e.target.value as any })}
                    className="neu-input w-full px-3 py-2.5 rounded-xl text-white focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="grill">🔥 Grill (Bakar Arang)</option>
                    <option value="wok">🍳 Wok (Kuali Panas)</option>
                    <option value="prep_bar">🥤 Prep Bar (Minuman/Kaunter)</option>
                  </select>
                </div>
              </div>

              {/* 3. Harga Jual & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Harga Jual (RM) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                      RM
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      placeholder="1.20"
                      className="neu-input w-full pl-11 pr-3 py-2.5 rounded-xl text-white font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Unit Jualan
                  </label>
                  <input
                    type="text"
                    value={menuForm.unit}
                    onChange={(e) => setMenuForm({ ...menuForm, unit: e.target.value })}
                    placeholder="cucuk / mangkuk / pinggan / cawan"
                    className="neu-input w-full px-3 py-2.5 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Gambar Menu (Pilih Preset atau Masukkan URL) */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Gambar Menu (Pilih Gambar Rasmi atau Masukkan URL)
                </label>
                <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar py-1">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setMenuForm({ ...menuForm, image: preset.path })}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition-all ${
                        menuForm.image === preset.path
                          ? 'border-orange-500 ring-2 ring-orange-500/50 scale-105 shadow-neu-orange'
                          : 'border-stone-800 opacity-60 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <Image src={preset.path} alt={preset.label} fill className="object-cover" />
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuForm.image}
                    onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                    placeholder="URL gambar atau pilih gambar di atas"
                    className="neu-input w-full pl-9 pr-3 py-2 rounded-xl text-white font-mono text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. Penerangan Menu */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Penerangan / Ramuan Ringkas
                </label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  placeholder="Cth: Daging ayam segar perapan serai kunyit hidup tradisi Nipah Satay."
                  className="neu-input w-full px-3 py-2.5 rounded-xl text-white placeholder-stone-600 focus:outline-none resize-none"
                />
              </div>

              {/* 6. Status Ketersediaan */}
              <div className="flex items-center justify-between p-3 neu-inset-sm rounded-xl">
                <div>
                  <div className="font-bold text-white text-xs">Status Menu Sedia Ada</div>
                  <div className="text-[10px] text-stone-400">
                    Jika ditutup, menu ini akan dipaparkan sebagai &quot;Habis Stok&quot; di POS
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuForm({ ...menuForm, available: !menuForm.available })}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 ${
                    menuForm.available
                      ? 'neu-btn-emerald shadow-neu-green text-white'
                      : 'neu-btn text-stone-400'
                  }`}
                >
                  {menuForm.available ? '🟢 Ada Stok' : '🔴 Habis'}
                </button>
              </div>

              {/* Butang Tindakan Form */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl neu-btn text-stone-300 font-bold active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neu-btn-emerald text-white font-black shadow-neu-green border border-emerald-400/40 active:scale-95"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / UBAH SUAI KATEGORI (Soft Neumorphic)     */}
      {/* ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="neu-card-lg max-w-md w-full p-5 sm:p-6 space-y-4 shadow-neu-flat-lg relative text-stone-100 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{editingCategory ? '✏️ Ubah Kategori' : '🏷️ Tambah Kategori Baru'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-xl neu-btn text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              {/* Nama Kategori */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.label}
                  onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                  placeholder="Cth: Pencuci Mulut / Masakan Barat / Set Keluarga"
                  className="neu-input w-full px-3.5 py-2.5 rounded-xl text-white placeholder-stone-600 focus:outline-none font-bold"
                />
              </div>

              {/* Pilihan Ikon Emoji */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Ikon Emoji
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl w-11 h-11 rounded-xl neu-inset flex items-center justify-center shrink-0">
                    {categoryForm.icon}
                  </span>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="Pilih atau taip emoji"
                    className="neu-input flex-1 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 p-2.5 neu-inset-sm rounded-xl max-h-24 overflow-y-auto">
                  {PRESET_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: emoji })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-stone-800 transition-all ${
                        categoryForm.icon === emoji ? 'neu-btn-primary shadow-neu-orange text-white' : 'neu-btn'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Butang Tindakan Form */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl neu-btn text-stone-300 font-bold active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl neu-btn-emerald text-white font-black shadow-neu-green border border-emerald-400/40 active:scale-95"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PENGESAHAN PADAM (Soft Neumorphic)                */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="neu-card-lg max-w-sm w-full p-5 space-y-4 shadow-neu-flat-lg relative text-stone-100 rounded-3xl border border-rose-900/60">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl neu-inset text-rose-400 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </span>
              <div>
                <h3 className="font-black text-sm text-white">
                  Sahkan Padam {deleteConfirm.type === 'menu' ? 'Menu' : 'Kategori'}
                </h3>
                <p className="text-xs text-stone-400">Tindakan ini tidak boleh diundur.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 neu-inset-sm p-3 rounded-xl border border-stone-850">
              Adakah anda pasti mahu memadamkan{' '}
              <strong className="text-rose-400">&quot;{deleteConfirm.name}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800/80">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl neu-btn text-stone-300 font-bold text-xs active:scale-95"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={deleteConfirm.type === 'menu' ? handleDeleteMenuConfirm : handleDeleteCategoryConfirm}
                className="px-4 py-2.5 rounded-xl neu-btn bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg active:scale-95 border border-rose-500/50"
              >
                Ya, Padamkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
