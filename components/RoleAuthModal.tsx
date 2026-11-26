'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  useAuthRole, 
  ROLES_CONFIG, 
  UserRole, 
  EXECUTIVE_PINS 
} from './AuthRoleContext';
import { ShieldCheck, Lock, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function RoleAuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, showAuthModal, setShowAuthModal, loginAsRole } = useAuthRole();

  const [selectedRole, setSelectedRole] = useState<UserRole>('cashier');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!showAuthModal) return null;

  const handleSelectRole = (r: UserRole) => {
    setSelectedRole(r);
    setErrorMsg('');
    if (r !== 'executive') {
      setPin('');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const res = loginAsRole(selectedRole, pin);
    if (!res.success) {
      setErrorMsg(res.error || 'Akses ditolak.');
      return;
    }

    // If current pathname is restricted for this new role, redirect to permitted home
    const allowed = ROLES_CONFIG[selectedRole].allowedRoutes;
    const canKeepPath = allowed.some((r) => (r === '/' ? pathname === '/' : pathname.startsWith(r)));
    
    if (!canKeepPath) {
      if (selectedRole === 'kitchen') router.push('/kitchen');
      else if (selectedRole === 'production') router.push('/production');
      else if (selectedRole === 'cashier') router.push('/pos');
      else router.push('/');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-stone-900 border-2 border-orange-600/80 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-stone-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-xl shadow-lg border border-orange-400">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Log Masuk Petugas
              </h2>
              <p className="text-[11px] text-stone-400">
                Pilih peranan untuk mengaktifkan tab & fungsi sistem
              </p>
            </div>
          </div>

          {/* Close button only available if already logged in */}
          {role && (
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white border border-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Roles List */}
        <div className="space-y-2 my-4">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block px-1">
            Pilih Peranan Anda:
          </span>

          {(Object.keys(ROLES_CONFIG) as UserRole[]).map((rKey) => {
            const cfg = ROLES_CONFIG[rKey];
            const isSelected = selectedRole === rKey;

            return (
              <button
                key={rKey}
                type="button"
                onClick={() => handleSelectRole(rKey)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 relative cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/20 border-orange-500 ring-2 ring-orange-500/60 shadow-md'
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-400 shadow'
                      : 'bg-stone-900 border-stone-800 text-stone-300'
                  }`}
                >
                  {cfg.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">
                      {cfg.label}
                    </span>
                    {cfg.requiresPin && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        PIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5">
                    {cfg.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* PIN Entry for Executive */}
        {selectedRole === 'executive' && (
          <div className="bg-stone-950 border border-amber-500/40 rounded-xl p-3.5 space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Masukkan PIN Eksekutif (4-Digit):</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">Lalai: 1990</span>
            </div>

            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••"
              autoFocus
              className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs p-2.5 rounded-lg flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-xl shadow-orange-950/60 active:scale-95 flex items-center justify-center gap-2 border border-orange-400"
        >
          <span>Sahkan & Masuk Sebagai {ROLES_CONFIG[selectedRole].shortLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-stone-400 text-center mt-3">
          Nipah Satay™ @ Pulau Indah • Kawalan Keselamatan Petugas
        </p>
      </div>
    </div>
  );
}
