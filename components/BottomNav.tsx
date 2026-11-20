'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Flame, 
  Store, 
  CookingPot, 
  Factory, 
  BarChart3,
  Package
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: 'Utama', icon: Flame },
    { href: '/pos', label: 'POS', icon: Store },
    { href: '/kitchen', label: 'Dapur', icon: CookingPot },
    { href: '/production', label: 'Kilang', icon: Factory },
    { href: '/reports', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <nav 
      aria-label="Navigasi Mudah Alih"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121110]/98 backdrop-blur-lg border-t border-orange-950/60 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 px-2 shadow-2xl"
    >
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? 'bg-orange-600/25 text-orange-400 font-extrabold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110 text-orange-400' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] leading-tight mt-0.5 tracking-tight ${isActive ? 'font-black text-orange-300' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
