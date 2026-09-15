'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, LogOut, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isLogout = toast.type === 'logout';

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-fade-in pointer-events-auto">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3.5 backdrop-blur-md transition-all ${
        isSuccess
          ? 'bg-sky-950/95 text-white border-sky-800/60 shadow-sky-950/20'
          : isError
          ? 'bg-red-950/95 text-white border-red-800/60 shadow-red-950/20'
          : isLogout
          ? 'bg-stone-900/95 text-white border-stone-700/60 shadow-stone-950/20'
          : 'bg-stone-900/95 text-white border-stone-700/60 shadow-stone-950/20'
      }`}>
        <div className="p-1 rounded-xl shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-300" />}
          {isLogout && <LogOut className="w-5 h-5 text-sky-400" />}
          {!isSuccess && !isError && !isLogout && <Info className="w-5 h-5 text-sky-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold tracking-tight">
            {toast.title || (isSuccess ? 'Berhasil' : isError ? 'Peringatan' : 'Informasi')}
          </h4>
          <p className="text-xs text-stone-200 mt-0.5 leading-snug">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
