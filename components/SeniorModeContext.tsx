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
    const saved = localStorage.getItem('nipah_senior_mode');
    if (saved === 'true') {
      setIsSeniorMode(true);
      document.documentElement.classList.add('senior-mode');
    }
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
