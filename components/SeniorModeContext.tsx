'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SeniorModeContextType {
  isSeniorMode: boolean;
  toggleSeniorMode: () => void;
}

const SeniorModeContext = createContext<SeniorModeContextType>({
  isSeniorMode: false,
  toggleSeniorMode: () => {},
});

export function SeniorModeProvider({ children }: { children: React.ReactNode }) {
  const [isSeniorMode, setIsSeniorMode] = useState(false);

  useEffect(() => {
    // Tanggalkan mod warga emas sekiranya pernah diaktifkan sebelum ini
    try {
      localStorage.removeItem('nipah_senior_mode');
      document.documentElement.classList.remove('senior-mode');
    } catch (e) {}
  }, []);

  const toggleSeniorMode = () => {
    setIsSeniorMode((prev) => {
      const next = !prev;
      localStorage.setItem('nipah_senior_mode', String(next));
      if (next) {
        document.documentElement.classList.add('senior-mode');
      } else {
        document.documentElement.classList.remove('senior-mode');
      }
      return next;
    });
  };

  return (
    <SeniorModeContext.Provider value={{ isSeniorMode, toggleSeniorMode }}>
      {children}
    </SeniorModeContext.Provider>
  );
}

export function useSeniorMode() {
  return useContext(SeniorModeContext);
}
