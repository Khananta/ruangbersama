'use client';

import React from 'react';
import { Leaf, Calendar, CheckSquare, ListTodo, Sparkles, LogOut, User, BarChart3 } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-stone-200/80 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Left: Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-stone-900 tracking-tight leading-tight">
                Ruang Bersama
              </h1>
              <p className="text-[11px] text-sky-600/80 font-medium hidden sm:block leading-tight">
                Habit tracker & growth space
              </p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/60 overflow-x-auto max-w-full">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white text-sky-600 shadow-sm border border-sky-100 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <CheckSquare className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-sky-600' : ''}`} />
            <span>Habit</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-white text-sky-600 shadow-sm border border-sky-100 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <ListTodo className={`w-3.5 h-3.5 ${activeTab === 'tasks' ? 'text-sky-600' : ''}`} />
            <span>Kegiatan Harian</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white text-sky-600 shadow-sm border border-sky-100 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${activeTab === 'calendar' ? 'text-sky-600' : ''}`} />
            <span>Kalender</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'evaluation'
                ? 'bg-white text-sky-600 shadow-sm border border-sky-100 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'evaluation' ? 'text-sky-600' : ''}`} />
            <span>Refleksi</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-sky-600 shadow-sm border border-sky-100 font-bold'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'analytics' ? 'text-sky-600' : ''}`} />
            <span>Analitik</span>
          </button>
        </nav>

        {/* Right: Current User & Logout */}
        <div className="flex items-center gap-2">
          {/* Active User Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>{myProfile.name}</span>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Keluar Akun"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-400 hover:text-sky-600 hover:bg-sky-50 border border-stone-200 hover:border-sky-200 transition-all text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

      </div>
    </header>
  );
};
