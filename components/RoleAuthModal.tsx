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

    // If current pathname is restricted for this new role (or on '/' and not executive), redirect to permitted home
    const allowed = ROLES_CONFIG[selectedRole].allowedRoutes;
    const canKeepPath = allowed.some((r) => (r === '/' ? pathname === '/' : pathname.startsWith(r)));
    
    if (!canKeepPath || (pathname === '/' && selectedRole !== 'executive')) {
      if (selectedRole === 'kitchen') router.push('/kitchen');
      else if (selectedRole === 'production') router.push('/production');
      else if (selectedRole === 'cashier') router.push('/pos');
      else router.push('/');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#181614] border border-stone-800/80 shadow-neu-flat-lg rounded-3xl max-w-md w-full p-5 sm:p-6 relative text-stone-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xl shadow-neu-orange border border-orange-400/40">
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
              className="p-2 rounded-xl neu-btn text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Roles List */}
        <div className="space-y-2.5 my-4">
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
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 relative cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'neu-inset border-orange-500/80 shadow-neu-pressed text-white ring-1 ring-orange-500/40'
                    : 'neu-card hover:shadow-neu-flat-sm text-stone-300 hover:text-white'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${
                    isSelected
                      ? 'neu-btn-primary shadow-neu-orange border-orange-400'
                      : 'neu-inset-sm border-stone-800 text-stone-300'
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
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg neu-inset-sm text-amber-300 border border-amber-500/30 flex items-center gap-1">
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
          <div className="neu-inset rounded-2xl p-3.5 space-y-2 mb-3 border border-amber-500/30">
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
              className="neu-input w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2.5 rounded-xl text-white placeholder-stone-600 focus:outline-none"
            />
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="neu-card border border-rose-600/70 text-rose-200 text-xs p-2.5 rounded-xl flex items-center gap-2 mb-3 bg-rose-950/40">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="neu-btn-primary w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 flex items-center justify-center gap-2 shadow-neu-orange border border-orange-400/50"
        >
          <span>Sahkan & Masuk Sebagai {ROLES_CONFIG[selectedRole].shortLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-stone-500 text-center mt-3">
          Nipah Satay™ @ Pulau Indah • Kawalan Keselamatan Petugas
        </p>
      </div>
    </div>
  );
}
