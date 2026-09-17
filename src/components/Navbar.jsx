'use client';

import React, { useState } from 'react';
import { 
  Leaf, 
  Calendar, 
  CheckSquare, 
  ListTodo, 
  Sparkles, 
  LogOut, 
  User, 
  BarChart3
} from 'lucide-react';
import { LOCAL_PROFILES } from '../lib/supabaseClient';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout,
}) => {
  const userEmail = currentUser?.email?.toLowerCase() || '';

  // Determine user profile name
  const myProfile = LOCAL_PROFILES[userEmail] || {
    name: currentUser?.user_metadata?.name || userEmail.split('@')[0] || 'User',
  };

  const navItems = [
    { id: 'dashboard', label: 'Habit', shortLabel: 'Habit', icon: CheckSquare },
    { id: 'tasks', label: 'Kegiatan Harian', shortLabel: 'Kegiatan', icon: ListTodo },
    { id: 'calendar', label: 'Kalender', shortLabel: 'Kalender', icon: Calendar },
    { id: 'evaluation', label: 'Refleksi', shortLabel: 'Refleksi', icon: Sparkles },
    { id: 'analytics', label: 'Analitik', shortLabel: 'Analitik', icon: BarChart3 },
  ];

  return (
    <>
      {/* ── Fixed Top Header (Desktop & Mobile) ── */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-stone-200/80 font-sans shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* Left: Brand & Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-[14px] sm:text-[15px] font-bold text-stone-900 tracking-tight leading-tight">
                Ruang Bersama
              </h1>
              <p className="text-[10px] sm:text-[11px] text-sky-600/80 font-medium hidden sm:block leading-tight">
                Habit tracker & growth space
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-sky-600 shadow-sm border border-sky-100 font-bold'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Current User & Logout */}
          <div className="flex items-center gap-2">
            {/* Active User Pill */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span className="max-w-[80px] sm:max-w-none truncate">{myProfile.name}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Keluar Akun"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-stone-400 hover:text-sky-600 hover:bg-sky-50 border border-stone-200 hover:border-sky-200 transition-all text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── Fixed Mobile Bottom Navigation Bar (Mobile App Style) ── */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 font-sans"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-sky-600 font-bold scale-105'
                    : 'text-stone-400 font-medium hover:text-stone-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-sky-50 text-sky-600' : 'text-stone-400'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-600 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? 'font-bold text-sky-700' : 'text-stone-500'
                }`}>
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
