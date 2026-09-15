'use client';

import React, { useState } from 'react';
import { Leaf, Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, Heart, Calendar } from 'lucide-react';
import { supabase, isSupabaseConfigured, DEFAULT_COUPLE_ID } from '../lib/supabaseClient';

export const LoginPage = ({ onLoginSuccess, onLoginFailure }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!error && data?.user) {
          const authUser = data.user;
          const name = authUser.user_metadata?.name || (cleanEmail.includes('khanif') ? 'Khanif' : 'Arum');
          // Ensure public.profiles contains this real Auth user ID
          await supabase.from('profiles').upsert({
            id: authUser.id,
            couple_id: DEFAULT_COUPLE_ID,
            email: cleanEmail,
            name: name,
            role: 'partner',
            updated_at: new Date().toISOString(),
          });
          onLoginSuccess(authUser);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase auth error:', err);
      }
    }

    // 2. Local fallback credentials (offline mode)
    if (cleanEmail === 'khanif@gmail.com' && password === 'khanif2806') {
      onLoginSuccess({
        id: 'user-khanif-local',
        email: 'khanif@gmail.com',
        user_metadata: { name: 'Khanif' },
      });
      setLoading(false);
      return;
    }

    if (cleanEmail === 'arum@gmail.com' && password === 'arum1810') {
      onLoginSuccess({
        id: 'user-arum-local',
        email: 'arum@gmail.com',
        user_metadata: { name: 'Arum' },
      });
      setLoading(false);
      return;
    }

    const failureText = 'Email atau kata sandi tidak cocok. Silakan coba lagi.';
    setErrorMsg(failureText);
    if (onLoginFailure) {
      onLoginFailure(failureText);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAFAFA] font-sans">
      
      {/* ── LEFT SECTION: Visual & Aesthetic Experience (Hidden on Mobile) ── */}
      <div className="hidden lg:flex relative w-1/2 min-h-screen bg-sky-950 p-12 xl:p-16 flex-col justify-between overflow-hidden text-white">
        
        {/* Ambient Decorative Blurs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-300 shadow-inner">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Ruang Bersama</span>
              <span className="text-[11px] text-sky-200/80 font-medium">Private Couple Space</span>
            </div>
          </div>
        </div>

        {/* Center Content: Showcase & Visual Cards */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-semibold">
              🌿 Bangun Kebiasaan Baik Berdua
            </span>
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Tumbuh & Konsisten Bersama Setiap Hari.
            </h1>
            <p className="text-sm text-sky-100/70 leading-relaxed">
              Satu workspace privat untuk saling memantau habit harian, menyelaraskan agenda bersama, dan berefleksi setiap akhir pekan.
            </p>
          </div>

          {/* Feature Showcase Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Habit Card Preview */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Daily Habits
                </span>
                <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full font-bold">
                  Realtime
                </span>
              </div>
              <p className="text-xs text-stone-200 font-medium">
                Ceklis habit kamu & pantau progress satu sama lain.
              </p>
            </div>

            {/* Calendar & Reflection Preview */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Shared Calendar
                </span>
                <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full font-bold">
                  Agenda
                </span>
              </div>
              <p className="text-xs text-stone-200 font-medium">
                Jadwalkan waktu ketemu, agenda pribadi, dan refleksi mingguan berdua.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-sky-400 fill-sky-400/40" />
            <span className="italic text-sky-200/80 text-[11px]">"Langkah kecil setiap hari adalah kunci konsistensi."</span>
          </div>
        </div>

      </div>

      {/* ── RIGHT SECTION: Clean Minimalist Login Form (Full width on Mobile) ── */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-7">

          {/* Form Header */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md mx-auto lg:mx-0 mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Selamat Datang 👋
            </h2>
            <p className="text-sm text-stone-500">
              Masuk ke akunmu untuk mengakses workspace privat Ruang Bersama.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khanif@gmail.com atau arum@gmail.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};
