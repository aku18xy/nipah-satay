'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'executive' | 'cashier' | 'kitchen' | 'production';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  allowedRoutes: string[];
  requiresPin: boolean;
}

export const ROLES_CONFIG: Record<UserRole, RoleConfig> = {
  executive: {
    id: 'executive',
    label: 'Pengurus / Eksekutif',
    shortLabel: 'Eksekutif',
    icon: '👑',
    description: 'Akses penuh semua modul termasuk Halaman Utama, Laporan Eksekutif, Kos Sulit & Z-Report.',
    allowedRoutes: ['/', '/pos', '/pos/backoffice', '/backoffice', '/kitchen', '/production', '/wholesale', '/reports', '/menu'],
    requiresPin: true,
  },
  cashier: {
    id: 'cashier',
    label: 'Juruwang & Kaunter',
    shortLabel: 'Juruwang',
    icon: '💳',
    description: 'Akses ke POS Kaunter, Pesanan Meja, Status Dapur & Borong.',
    allowedRoutes: ['/pos', '/pos/backoffice', '/backoffice', '/kitchen', '/wholesale', '/menu'],
    requiresPin: false,
  },
  kitchen: {
    id: 'kitchen',
    label: 'Pitmaster & Dapur KDS',
    shortLabel: 'Pitmaster',
    icon: '🔥',
    description: 'Akses terus ke Dapur Pintar KDS untuk giliran bakar sate & pesanan kuali.',
    allowedRoutes: ['/kitchen', '/menu'],
    requiresPin: false,
  },
  production: {
    id: 'production',
    label: 'Kilang & Cucuk Sate',
    shortLabel: 'Kilang',
    icon: '🏭',
    description: 'Akses ke rekod timbangan daging, hasil trimming, dan upah pencucuk sate.',
    allowedRoutes: ['/production', '/wholesale', '/menu'],
    requiresPin: false,
  },
};

// Default PIN for Executive access (Year founded 1990 or fallback 1234)
export const EXECUTIVE_PINS = ['1990', '1234'];

interface AuthRoleContextType {
  role: UserRole | null;
  roleConfig: RoleConfig | null;
  isInitialized: boolean;
  canAccess: (route: string) => boolean;
  loginAsRole: (role: UserRole, pin?: string) => { success: boolean; error?: string };
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
}

const AuthRoleContext = createContext<AuthRoleContextType>({
  role: null,
  roleConfig: null,
  isInitialized: false,
  canAccess: () => true,
  loginAsRole: () => ({ success: false }),
  logout: () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
});

export const AUTH_STORAGE_KEY = 'nipah_satay_user_role';

export function AuthRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Initialize role from localStorage on client startup
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(AUTH_STORAGE_KEY) as UserRole | null;
      if (savedRole && ROLES_CONFIG[savedRole]) {
        setRole(savedRole);
      } else {
        // If no role saved, prompt for role selection during initialization
        setShowAuthModal(true);
      }
    } catch {
      // In case localStorage is blocked/unavailable
      setShowAuthModal(true);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const loginAsRole = (selectedRole: UserRole, pin?: string): { success: boolean; error?: string } => {
    const targetConfig = ROLES_CONFIG[selectedRole];
    if (!targetConfig) {
      return { success: false, error: 'Peranan tidak sah.' };
    }

    if (targetConfig.requiresPin) {
      if (!pin || !EXECUTIVE_PINS.includes(pin.trim())) {
        return { success: false, error: 'PIN Eksekutif tidak sah (Sila guna PIN 1990).' };
      }
    }

    setRole(selectedRole);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, selectedRole);
    } catch (e) {
      console.warn('Could not save role to localStorage', e);
    }
    setShowAuthModal(false);
    return { success: true };
  };

  const logout = () => {
    setRole(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear role from localStorage', e);
    }
    setShowAuthModal(true);
  };

  const canAccess = (route: string): boolean => {
    // If not initialized yet, allow temporary render
    if (!role) return false;
    const config = ROLES_CONFIG[role];
    if (!config) return false;
    
    // Executive has access to all routes
    if (role === 'executive') return true;

    // Check exact or prefix route match
    return config.allowedRoutes.some((allowed) => {
      if (allowed === '/') return route === '/';
      return route.startsWith(allowed);
    });
  };

  const roleConfig = role ? ROLES_CONFIG[role] : null;

  return (
    <AuthRoleContext.Provider
      value={{
        role,
        roleConfig,
        isInitialized,
        canAccess,
        loginAsRole,
        logout,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
}

export function useAuthRole() {
  return useContext(AuthRoleContext);
}
