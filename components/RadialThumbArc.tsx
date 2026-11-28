'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; angle: number }>({ y: 0, angle: 0 });
  const touchStartAngleRef = useRef<number>(0);

  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.id === selectedCategory)
  );

  // Setiap kategori ditempatkan dengan selang sudut pada roda radial (misalnya 360 / N atau sepangjang busur arc)
  const totalItems = categories.length;
  const angleStep = 45; // 45 darjah setiap kategori sepanjang busur roda

  // Pastikan sudut roda berputar menghala kategori aktif ke posisi hadapan (focus point)
  useEffect(() => {
    // Putar roda supaya kategori aktif berada pada sudut fokus 0 darjah
    const targetAngle = -activeIndex * angleStep;
    setRotationAngle(targetAngle);
  }, [activeIndex, angleStep]);

  // Putar ke kategori seterusnya / sebelumnya (Rotary Step)
  const handleStep = useCallback((direction: 'next' | 'prev') => {
    if (categories.length === 0) return;
    let nextIdx = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
    if (nextIdx < 0) nextIdx = categories.length - 1;
    if (nextIdx >= categories.length) nextIdx = 0;
    onSelectCategory(categories[nextIdx].id);
  }, [activeIndex, categories, onSelectCategory]);

  // Pengendali sentuhan / gesture rotari (Rotary Motion Drag)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { y: touch.clientY, angle: rotationAngle };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartRef.current.y;
    // Tukar pergerakan seretan jari ke sudut putaran rotari (sensitivity factor 0.6)
    const newAngle = dragStartRef.current.angle + deltaY * 0.6;
    setRotationAngle(newAngle);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap ke kategori terdekat
    const snappedIdx = Math.round(-rotationAngle / angleStep);
    const normalizedIdx = Math.max(0, Math.min(categories.length - 1, ((snappedIdx % totalItems) + totalItems) % totalItems));
    onSelectCategory(categories[normalizedIdx].id);
  };

  const currentCategory = categories[activeIndex] || categories[0];

  return (
    <div className="fixed right-3 sm:right-6 bottom-20 sm:bottom-22 z-40 select-none">
      {/* Busur Radial (Radial Thumb Arc Wheel) */}
      <div className="relative flex items-center justify-center">
        {/* Kontena Arc Mengembang / Menguncup */}
        <div
          className={`absolute pointer-events-none transition-all duration-300 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          style={{ width: '260px', height: '260px' }}
        >
          {/* Roda Putaran Rotari (Rotary Motion Arc) */}
          <div
            className="w-full h-full relative transition-transform ease-out"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transitionDuration: isDragging ? '0ms' : '350ms',
            }}
          >
            {categories.map((cat, idx) => {
              const itemAngle = idx * angleStep; // Sudut kategori pada roda
              const rad = (itemAngle * Math.PI) / 180;
              // Radius busur ~105px dari hab tengah
              const radius = 98;
              const x = -Math.cos(rad) * radius;
              const y = -Math.sin(rad) * radius;

              const isSelected = cat.id === selectedCategory;

              return (
                <div
                  key={cat.id}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${-rotationAngle}deg)`,
                    transition: isDragging ? 'none' : 'transform 350ms ease-out',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer ${
                      isSelected
                        ? 'w-13 h-13 neu-btn-primary shadow-neu-orange ring-2 ring-orange-400 scale-110 z-20'
                        : 'w-11 h-11 neu-card hover:shadow-neu-flat-lg border border-stone-800 text-stone-300'
                    }`}
                    title={`${cat.label} (${cat.count})`}
                  >
                    <span className={`text-lg leading-none ${isSelected ? 'scale-110' : ''}`}>
                      {cat.icon}
                    </span>
                    <span
                      className={`text-[8px] font-black leading-tight tracking-tighter truncate max-w-[42px] mt-0.5 ${
                        isSelected ? 'text-white' : 'text-stone-400'
                      }`}
                    >
                      {cat.label}
                    </span>

                    {/* Lencana Bilangan Item */}
                    <span
                      className={`absolute -top-1 -right-1 text-[8px] font-mono font-black px-1 rounded-full ${
                        isSelected ? 'bg-black/50 text-amber-300' : 'bg-stone-900 text-stone-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hab Tengah Jemari (Thumb Rotary Hub & Stepper Controls) */}
        <div className="relative z-30 flex items-center">
          {/* Butang Putar Undur (Prev) */}
          <button
            type="button"
            onClick={() => handleStep('prev')}
            className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-stone-300 hover:text-white mr-1 active:scale-90 shadow-md"
            title="Kategori Sebelum"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Hab Jemari Utama (Central Rotary Thumb Trigger) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 shadow-neu-flat-lg border-2 ${
              isOpen
                ? 'neu-btn-primary border-orange-400/80 shadow-neu-orange ring-4 ring-orange-500/20'
                : 'neu-card border-stone-700/80 hover:border-orange-500/50'
            }`}
            title="Ketik untuk Buka/Tutup Roda Kategori (Seret untuk Putar)"
          >
            <div className="flex items-center justify-center leading-none">
              <span className="text-xl filter drop-shadow">{currentCategory.icon}</span>
            </div>
            <span className="text-[8px] font-black text-white uppercase tracking-tighter leading-none mt-0.5">
              {currentCategory.label}
            </span>
            <div className="flex items-center gap-0.5 text-[7px] text-amber-200 font-mono leading-none mt-0.5">
              <span>{currentCategory.count} item</span>
            </div>
          </div>

          {/* Butang Putar Maju (Next) */}
          <button
            type="button"
            onClick={() => handleStep('next')}
            className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-stone-300 hover:text-white ml-1 active:scale-90 shadow-md"
            title="Kategori Seterusnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
