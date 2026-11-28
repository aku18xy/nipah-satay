'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Hand, Sparkles, X } from 'lucide-react';

export interface RadialCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
}

interface RadialThumbArcProps {
  categories: RadialCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function RadialThumbArc({
  categories,
  selectedCategory,
  onSelectCategory,
}: RadialThumbArcProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [rotaryOffset, setRotaryOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; offset: number }>({ y: 0, offset: 0 });

  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.id === selectedCategory)
  );

  const total = categories.length;
  // Jejari busur orbit (Orbital Arc Radius)
  const RADIUS = 142;
  const BUTTON_SIZE = 56; // Saiz butang thumb (w-14 h-14 = 56px)

  // Sudut busur semulajadi jemari ibu kanan: daripada 95° (atas) ke 210° (bawah-kiri)
  // Menjamin semua nod berada di sebelah kiri butang (dalam skrin telefon)
  const START_ANGLE = 95;
  const END_ANGLE = 210;
  const ANGLE_SPAN = END_ANGLE - START_ANGLE;
  const STEP = total > 1 ? ANGLE_SPAN / (total - 1) : 0;

  // Laraskan putaran rotari apabila kategori bertukar
  useEffect(() => {
    // Laraskan sedikit offset supaya kategori aktif berada di zon paling selesa
    const targetOffset = 0;
    setRotaryOffset(targetOffset);
  }, [activeIndex]);

  // Pengendali seretan rotari (Rotary Motion Gesture)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { y: touch.clientY, offset: rotaryOffset };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartRef.current.y;
    // Tukar pergerakan sentuhan ke darjah putaran busur
    const newOffset = dragStartRef.current.offset + deltaY * 0.35;
    // Hadkan putaran agar tidak lari terlalu jauh
    const clampedOffset = Math.max(-30, Math.min(30, newOffset));
    setRotaryOffset(clampedOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Kembali perlahan ke posisi seimbang (spring snap)
    setRotaryOffset(0);
  };

  return (
    <>
      {/* Latar Belakang Lutsinar (Klik Luar untuk Tutup) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-black/20 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Kontena Utama Thumb Arc di Bucu Bawah Kanan (Zon Ergonomik Ibu Jari) */}
      <div className="fixed right-4 sm:right-6 bottom-20 sm:bottom-22 z-40 select-none">
        <div className="relative flex items-center justify-center">
          {/* ======================================================== */}
          {/* BUSUR ORBIT & KAD KATEGORI RADIAL (THUMB ARC)             */}
          {/* ======================================================== */}
          <div
            className={`absolute transition-all duration-300 pointer-events-none ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{
              width: RADIUS * 2,
              height: RADIUS * 2,
              right: -(RADIUS - BUTTON_SIZE / 2),
              bottom: -(RADIUS - BUTTON_SIZE / 2),
            }}
          >
            {/* Garisan Orbit Bulatan Berbintik (Dashed Orbital Trajectory Arc) */}
            <div
              className="absolute inset-0 rounded-full border border-dashed border-indigo-400/35 pointer-events-none"
              style={{
                boxShadow: '0 0 20px rgba(129, 140, 248, 0.1)',
              }}
            />

            {/* Kad-Kad Kategori Sepanjang Busur Orbit */}
            {categories.map((cat, idx) => {
              const isSelected = cat.id === selectedCategory;
              // Kira sudut untuk setiap nod pada busur
              const angleDeg = START_ANGLE + idx * STEP + rotaryOffset;
              const angleRad = (angleDeg * Math.PI) / 180;

              // Kira koordinat relatif kepada pusat butang jemari
              // Pusat butang jemari berada di tengah bulatan (RADIUS, RADIUS)
              const posX = RADIUS + Math.cos(angleRad) * RADIUS;
              const posY = RADIUS - Math.sin(angleRad) * RADIUS;

              return (
                <div
                  key={cat.id}
                  className="absolute pointer-events-auto transition-transform"
                  style={{
                    left: `${posX}px`,
                    top: `${posY}px`,
                    transform: 'translate(-50%, -50%)',
                    transitionDuration: isDragging ? '0ms' : '250ms',
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(cat.id);
                    }}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'w-15 h-15 bg-[#251f28]/95 border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)] ring-2 ring-orange-500/30 scale-110 z-20'
                        : 'w-14 h-14 bg-[#18161f]/90 border border-purple-500/25 shadow-xl hover:border-purple-400/60 text-stone-300'
                    }`}
                    title={`${cat.label} (${cat.count} item)`}
                  >
                    {/* Ikon Kategori di Atas */}
                    <span className={`text-xl leading-none filter drop-shadow ${isSelected ? 'scale-115' : ''}`}>
                      {cat.icon}
                    </span>

                    {/* Label Teks di Bawah */}
                    <span
                      className={`text-[9px] font-bold leading-tight tracking-tight truncate max-w-[50px] mt-1 text-center ${
                        isSelected ? 'text-white font-black' : 'text-stone-300'
                      }`}
                    >
                      {cat.label}
                    </span>

                    {/* Lencana Bilangan Item */}
                    <span
                      className={`absolute -top-1.5 -right-1 text-[8px] font-mono font-black px-1.5 py-0.2 rounded-full border ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-300 shadow-sm'
                          : 'bg-[#100e14] text-stone-400 border-stone-800'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* BUTANG JEMARI UTAMA (THE GLOWING THUMB HAND BUTTON)        */}
          {/* ======================================================== */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-2xl z-40 ${
              isOpen
                ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.7)] ring-4 ring-purple-500/30'
                : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] hover:scale-105'
            }`}
            title={isOpen ? 'Tutup Roda Kategori' : 'Buka Thumb Arc Kategori'}
          >
            {/* Ikon Tangan / Thumb Gesture seperti dalam gambar rujukan */}
            <Hand className={`w-6 h-6 text-white filter drop-shadow transition-transform ${isOpen ? 'rotate-[-10deg] scale-110' : ''}`} />

            {/* Lencana Kategori Semasa Bila Kuncup */}
            {!isOpen && (
              <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-[#18161f] border border-orange-500 text-xs flex items-center justify-center shadow-md">
                {categories[activeIndex]?.icon}
              </span>
            )}

            {/* Lingkaran Berkilau (Ambient Glow Ring) */}
            <span className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
          </button>
        </div>
      </div>
    </>
  );
}
