'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const arcContainerRef = useRef<HTMLDivElement | null>(null);
  const wheelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Jejak interaksi pointer (Mouse / Touch drag)
  const pointerDownPos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const dragStartRotation = useRef(0);
  const dragStartAngle = useRef(0);
  const lastHapticIndex = useRef(-1);

  const total = categories.length;

  // Konfigurasi Geometri Radial Arc
  const RADIUS = 146; // Jejari orbit bulatan
  const BUTTON_SIZE = 56; // Saiz butang jemari (56px)
  const FOCAL_ANGLE = 138; // Sudut fokus ibu jari paling selesa (10:45 pada muka jam, mengarah ke tengah skrin)
  const STEP = 36; // Sudut perpisahan antara setiap kategori

  // Sudut asas nod pertama apabila rotation = 0:
  // Kategori 0 berada di 102°, kategori 1 di 138° (focal), dsb.
  const BASE_ANGLE = 102;

  // Had putaran maksimum dan minimum
  const minRot = (1 - (total - 1)) * STEP - 25;
  const maxRot = 1 * STEP + 25;

  // Kira sudut polar relatif kepada pusat butang ibu jari
  const getPointerAngle = useCallback((clientX: number, clientY: number) => {
    if (!buttonRef.current) return 0;
    const rect = buttonRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Koordinat skrin: Y terbalik (cy - clientY memberikan positif untuk ke atas)
    const rad = Math.atan2(cy - clientY, clientX - cx);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  }, []);

  // Selaraskan putaran apabila selectedCategory berubah dari luar
  useEffect(() => {
    if (isDragging) return;
    const idx = categories.findIndex((c) => c.id === selectedCategory);
    if (idx >= 0) {
      // Untuk meletakkan kategori `idx` tepat pada FOCAL_ANGLE:
      // BASE_ANGLE + idx * STEP + rotation = FOCAL_ANGLE
      // rotation = FOCAL_ANGLE - BASE_ANGLE - idx * STEP
      const targetRot = (FOCAL_ANGLE - BASE_ANGLE) - idx * STEP;
      setRotation(targetRot);
    }
  }, [selectedCategory, categories, isDragging, FOCAL_ANGLE, BASE_ANGLE, STEP]);

  // Haptic feedback pembantu
  const triggerHaptic = (index: number) => {
    if (index !== lastHapticIndex.current) {
      lastHapticIndex.current = index;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch {
          // ignore
        }
      }
    }
  };

  // =========================================================================
  // LOGIK SERETAN / PUTARAN ROTARI (POINTER & TOUCH GESTURES)
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent) => {
    // Elakkan interaksi sekiranya klik butang jemari utama bila tertutup
    if (!isOpen) return;

    pointerDownPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    dragStartRotation.current = rotation;
    dragStartAngle.current = getPointerAngle(e.clientX, e.clientY);

    const onPointerMove = (ev: PointerEvent) => {
      const dist = Math.hypot(
        ev.clientX - pointerDownPos.current.x,
        ev.clientY - pointerDownPos.current.y
      );

      if (dist > 5) {
        setIsDragging(true);
      }

      const currAngle = getPointerAngle(ev.clientX, ev.clientY);
      let deltaAngle = currAngle - dragStartAngle.current;

      // Tangani lintasan 0° / 360°
      while (deltaAngle > 180) deltaAngle -= 360;
      while (deltaAngle < -180) deltaAngle += 360;

      let newRot = dragStartRotation.current + deltaAngle;

      // Keanjalan rintangan (rubber-banding) jika melebihi had
      if (newRot > maxRot) {
        newRot = maxRot + (newRot - maxRot) * 0.25;
      } else if (newRot < minRot) {
        newRot = minRot + (newRot - minRot) * 0.25;
      }

      setRotation(newRot);

      // Semak indeks semasa untuk haptic feedback
      const floatIdx = (FOCAL_ANGLE - BASE_ANGLE - newRot) / STEP;
      const currentIdx = Math.max(0, Math.min(total - 1, Math.round(floatIdx)));
      triggerHaptic(currentIdx);
    };

    const onPointerUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const elapsed = Date.now() - pointerDownPos.current.time;
      const dist = Math.hypot(
        ev.clientX - pointerDownPos.current.x,
        ev.clientY - pointerDownPos.current.y
      );

      setIsDragging(false);

      // Jika seretan sebenar berlaku (bukan sekadar ketukan biasa)
      if (dist > 6 || elapsed > 350) {
        // Snap ke kategori terdekat dengan pantas dan kemas
        setRotation((curr) => {
          const floatIdx = (FOCAL_ANGLE - BASE_ANGLE - curr) / STEP;
          const snapIdx = Math.max(0, Math.min(total - 1, Math.round(floatIdx)));
          const snapRot = (FOCAL_ANGLE - BASE_ANGLE) - snapIdx * STEP;
          onSelectCategory(categories[snapIdx].id);
          return snapRot;
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Sokongan Roda Tetikus / Trackpad (Mouse Wheel Scrolling)
  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen) return;
    e.stopPropagation();
    setIsDragging(false);

    const deltaDeg = (e.deltaY || e.deltaX) * 0.16;
    setRotation((prev) => {
      const next = prev - deltaDeg;
      return Math.max(minRot - 10, Math.min(maxRot + 10, next));
    });

    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = setTimeout(() => {
      setRotation((curr) => {
        const floatIdx = (FOCAL_ANGLE - BASE_ANGLE - curr) / STEP;
        const snapIdx = Math.max(0, Math.min(total - 1, Math.round(floatIdx)));
        const snapRot = (FOCAL_ANGLE - BASE_ANGLE) - snapIdx * STEP;
        onSelectCategory(categories[snapIdx].id);
        return snapRot;
      });
    }, 160);
  };

  // Pilih kategori secara langsung apabila nod kad ditekan
  const handleCardClick = (catId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCategory(catId);
    // Putar kad yang dipilih terus ke zon fokus (FOCAL_ANGLE)
    const targetRot = (FOCAL_ANGLE - BASE_ANGLE) - index * STEP;
    setRotation(targetRot);
    triggerHaptic(index);
  };

  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.id === selectedCategory)
  );

  return (
    <>
      {/* Latar Belakang Lutsinar (Klik Luar untuk Tutup) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-black/25 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Kontena Utama Thumb Arc di Bucu Bawah Kanan (Zon Ergonomik Ibu Jari) */}
      <div
        className="fixed right-4 sm:right-6 bottom-20 sm:bottom-22 z-40 select-none"
        style={{ touchAction: isOpen ? 'none' : 'auto' }}
      >
        <div className="relative flex items-center justify-center">
          {/* ======================================================== */}
          {/* BUSUR ORBIT & KAD KATEGORI RADIAL SCROLLABLE              */}
          {/* Hanya dipaparkan & aktif semasa isOpen = true supaya tiada */}
          {/* sebarang pengesanan gesture / touch semasa tersembunyi   */}
          {/* ======================================================== */}
          {isOpen && (
            <div
              ref={arcContainerRef}
              onPointerDown={handlePointerDown}
              onWheel={handleWheel}
              className="absolute transition-all duration-300 cursor-grab active:cursor-grabbing opacity-100 scale-100"
              style={{
                width: RADIUS * 2,
                height: RADIUS * 2,
                right: -(RADIUS - BUTTON_SIZE / 2),
                bottom: -(RADIUS - BUTTON_SIZE / 2),
                touchAction: 'none',
              }}
            >
            {/* Garisan Orbit Bulatan Berbintik (Dashed Orbital Trajectory Arc) */}
            <div
              className="absolute inset-0 rounded-full border border-dashed border-indigo-400/40 pointer-events-none"
              style={{
                boxShadow: '0 0 25px rgba(129, 140, 248, 0.15)',
              }}
            />

            {/* Titik Fokus / Notch Pembidik Ibu Jari di Sudut 138° */}
            <div
              className="absolute w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.9)] pointer-events-none"
              style={{
                left: `${RADIUS + Math.cos((FOCAL_ANGLE * Math.PI) / 180) * RADIUS}px`,
                top: `${RADIUS - Math.sin((FOCAL_ANGLE * Math.PI) / 180) * RADIUS}px`,
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Petunjuk Arah Putaran / Scrollable Dial Hints */}
            <div
              className="absolute pointer-events-none text-xs text-indigo-300/50 flex items-center gap-0.5 animate-pulse"
              style={{
                left: `${RADIUS + Math.cos((82 * Math.PI) / 180) * RADIUS}px`,
                top: `${RADIUS - Math.sin((82 * Math.PI) / 180) * RADIUS}px`,
                transform: 'translate(-50%, -50%) rotate(-45deg)',
              }}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </div>

            <div
              className="absolute pointer-events-none text-xs text-indigo-300/50 flex items-center gap-0.5 animate-pulse"
              style={{
                left: `${RADIUS + Math.cos((225 * Math.PI) / 180) * RADIUS}px`,
                top: `${RADIUS - Math.sin((225 * Math.PI) / 180) * RADIUS}px`,
                transform: 'translate(-50%, -50%) rotate(45deg)',
              }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </div>

            {/* Kad-Kad Kategori Sepanjang Busur Orbit yang Boleh Diputar */}
            {categories.map((cat, idx) => {
              const isSelected = cat.id === selectedCategory;

              // Sudut dinamik nod kategori berdasarkan putaran dial semasa
              const angleDeg = BASE_ANGLE + idx * STEP + rotation;
              const angleRad = (angleDeg * Math.PI) / 180;

              // Kira koordinat X, Y relatif kepada pusat butang jemari (RADIUS, RADIUS)
              const posX = RADIUS + Math.cos(angleRad) * RADIUS;
              const posY = RADIUS - Math.sin(angleRad) * RADIUS;

              // Kira jarak dari sudut fokus (FOCAL_ANGLE)
              const distFromFocus = Math.abs(angleDeg - FOCAL_ANGLE);
              const isFocalActive = distFromFocus < STEP * 0.5;

              // Visibilitas dan pemudaran licin sepanjang tepi busur (60° hingga 235°)
              let opacity = 1;
              let scale = 1;

              if (angleDeg < 80) {
                opacity = Math.max(0, (angleDeg - 55) / 25);
                scale = 0.7 + opacity * 0.3;
              } else if (angleDeg > 215) {
                opacity = Math.max(0, (240 - angleDeg) / 25);
                scale = 0.7 + opacity * 0.3;
              }

              // Jangan paparkan kad jika ia berada terlalu jauh di luar sempadan
              if (opacity <= 0.05) return null;

              return (
                <div
                  key={cat.id}
                  className="absolute pointer-events-auto select-none"
                  style={{
                    left: `${posX}px`,
                    top: `${posY}px`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity,
                    transition: isDragging
                      ? 'none'
                      : 'left 280ms cubic-bezier(0.18, 0.89, 0.32, 1.15), top 280ms cubic-bezier(0.18, 0.89, 0.32, 1.15), transform 280ms, opacity 200ms',
                    zIndex: isSelected ? 30 : isFocalActive ? 25 : 15,
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => handleCardClick(cat.id, idx, e)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'w-16 h-16 bg-[#251f28]/95 border-2 border-orange-400 shadow-[0_0_22px_rgba(249,115,22,0.6)] ring-2 ring-orange-500/30 scale-110'
                        : isFocalActive
                        ? 'w-15 h-15 bg-[#201c27]/95 border border-indigo-400/60 shadow-[0_0_15px_rgba(129,140,248,0.3)] text-stone-200 scale-105'
                        : 'w-14 h-14 bg-[#16141c]/90 border border-purple-500/25 shadow-xl hover:border-purple-400/60 text-stone-300'
                    }`}
                    title={`${cat.label} (${cat.count} item)`}
                  >
                    {/* Ikon Kategori di Atas */}
                    <span
                      className={`text-xl leading-none filter drop-shadow transition-transform ${
                        isSelected ? 'scale-115' : ''
                      }`}
                    >
                      {cat.icon}
                    </span>

                    {/* Label Teks di Bawah */}
                    <span
                      className={`text-[11px] font-bold leading-tight tracking-tight truncate max-w-[54px] mt-1 text-center ${
                        isSelected ? 'text-white font-black' : 'text-stone-300'
                      }`}
                    >
                      {cat.label}
                    </span>

                    {/* Lencana Bilangan Item */}
                    <span
                      className={`absolute -top-1.5 -right-1 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full border shadow-sm ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-300'
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
          )}

          {/* ======================================================== */}
          {/* BUTANG UTAMA KATEGORI TERPILIH (SELECTED CATEGORY BUTTON)  */}
          {/* Tiada pengesanan pointer/wheel semasa isOpen = false       */}
          {/* ======================================================== */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onPointerDown={isOpen ? handlePointerDown : undefined}
            onWheel={isOpen ? handleWheel : undefined}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-2xl z-40 ${
              isOpen
                ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.7)] ring-4 ring-purple-500/30'
                : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] hover:scale-105'
            }`}
            title={isOpen ? `Tutup (${categories[activeIndex]?.label || 'Kategori'})` : `Buka (${categories[activeIndex]?.label || 'Kategori'})`}
          >
            {/* Ikon Kategori Terpilih Menggantikan Ikon Tangan */}
            <span
              className={`text-2xl leading-none filter drop-shadow transition-transform select-none ${
                isOpen ? 'scale-115 rotate-[-6deg]' : 'scale-105'
              }`}
            >
              {categories[activeIndex]?.icon || '🔥'}
            </span>

            {/* Lingkaran Berkilau (Ambient Glow Ring) */}
            <span className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
          </button>
        </div>
      </div>
    </>
  );
}
