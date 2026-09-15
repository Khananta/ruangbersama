'use client';

import React, { useState, useMemo } from 'react';
import { HabitCard } from './HabitCard';
import { PartnerHabitCard } from './PartnerHabitCard';
import { Plus, Sparkles, Heart, CheckCircle2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Send, MessageSquareHeart, Edit3, Check } from 'lucide-react';
import { LOCAL_PROFILES } from '../lib/supabaseClient';
import { ConfirmModal } from './ConfirmModal';

const QUICK_CHEERS = [
  'Semangat ya hari ini! ❤️',
  'Jangan lupa makan & minum air 🍱',
  'Proud of you selalu! ✨',
  'Kangen kamu 🥰',
  'Semoga harimu lancar & indah! 🌸',
];

// Helper: Format Date object to local YYYY-MM-DD string safely without UTC offset shift
const toLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Parse YYYY-MM-DD string to local Date object
const parseLocalDateString = (str) => {
  if (!str) return new Date();
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Build a dynamic 7-day strip centered on selected date
const buildDateStrip = (centerDateStr) => {
  const center = parseLocalDateString(centerDateStr);
  const todayStr = toLocalDateString(new Date());
  const days = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(center);
    d.setDate(center.getDate() + offset);
    const dateStr = toLocalDateString(d);
    days.push({
      day: dayNames[d.getDay()],
      date: d.getDate(),
      dateStr: dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === centerDateStr,
    });
  }
  return days;
};

export const DualDashboard = ({
  currentUser,
  profiles,
  habits = [],
  habitLogs = [],
  onToggleHabit,
  onOpenAddHabit,
  onOpenEditHabit,
  onDeleteHabit,
  saveDailyJournal,
  dailyJournals = [],
}) => {
  const todayStr = toLocalDateString(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [journalText, setJournalText] = useState('');
  const [isEditingJournal, setIsEditingJournal] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [deletingHabit, setDeletingHabit] = useState(null);

  const userEmail = currentUser?.email?.toLowerCase() || '';
  const myId = currentUser?.id || null;
  const isKhanif = userEmail.includes('khanif');

  // Resolve my profile & partner profile dynamically
  const isUser1 = (myId && profiles?.user1?.id === myId) || 
                  (userEmail && profiles?.user1?.email?.toLowerCase() === userEmail) ||
                  isKhanif;

  const myProfile = isUser1
    ? (profiles?.user1 || LOCAL_PROFILES['khanif@gmail.com'] || { name: 'Khanif' })
    : (profiles?.user2 || LOCAL_PROFILES['arum@gmail.com'] || { name: 'Arum' });

  const partnerProfile = isUser1
    ? (profiles?.user2 || LOCAL_PROFILES['arum@gmail.com'] || { name: 'Arum' })
    : (profiles?.user1 || LOCAL_PROFILES['khanif@gmail.com'] || { name: 'Khanif' });

  const effectiveMyId = myId || myProfile?.id;
  const partnerId = partnerProfile?.id;

  const dateStrip = useMemo(() => buildDateStrip(selectedDateStr), [selectedDateStr]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Navigation handlers
  const handlePrevDay = () => {
    const d = parseLocalDateString(selectedDateStr);
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(toLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDateString(selectedDateStr);
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(toLocalDateString(d));
  };

  const handleToday = () => {
    setSelectedDateStr(todayStr);
  };

  // Habits split - matching by real Supabase ID, profile ID, or email
  const isMyHabit = (h) => {
    const uid = String(h.user_id || '');
    return (effectiveMyId && uid === String(effectiveMyId)) ||
           (myProfile?.id && uid === String(myProfile.id)) ||
           (isKhanif && (uid === 'e258766b-78f3-43e0-8901-0ae225c75cc3' || uid.includes('khanif') || uid.startsWith('1111'))) ||
           (!isKhanif && (uid === 'afc77284-caab-413b-be18-38f14ca07fc2' || uid.includes('arum') || uid.startsWith('2222')));
  };

  const isPartnerHabit = (h) => !isMyHabit(h);

  const PAGE_SIZE = 10;
  const [myHabitsPage, setMyHabitsPage] = useState(1);
  const [partnerHabitsPage, setPartnerHabitsPage] = useState(1);

  const myHabits = (habits || []).filter(isMyHabit);
  const partnerHabits = (habits || []).filter(isPartnerHabit);

  const myTotalPages = Math.max(1, Math.ceil(myHabits.length / PAGE_SIZE));
  const partnerTotalPages = Math.max(1, Math.ceil(partnerHabits.length / PAGE_SIZE));

  const validMyPage = Math.min(myHabitsPage, myTotalPages);
  const validPartnerPage = Math.min(partnerHabitsPage, partnerTotalPages);

  const pagedMyHabits = myHabits.slice((validMyPage - 1) * PAGE_SIZE, validMyPage * PAGE_SIZE);
  const pagedPartnerHabits = partnerHabits.slice((validPartnerPage - 1) * PAGE_SIZE, validPartnerPage * PAGE_SIZE);

  // Completed for selected date
  const isMyLog = (l) => {
    const uid = String(l.user_id || '');
    return (effectiveMyId && uid === String(effectiveMyId)) ||
           (myProfile?.id && uid === String(myProfile.id)) ||
           (isKhanif && (uid === 'e258766b-78f3-43e0-8901-0ae225c75cc3' || uid.includes('khanif') || uid.startsWith('1111'))) ||
           (!isKhanif && (uid === 'afc77284-caab-413b-be18-38f14ca07fc2' || uid.includes('arum') || uid.startsWith('2222')));
  };

  const myCompletedIds = (habitLogs || [])
    .filter((l) => isMyLog(l) && l.completed_at === selectedDateStr)
    .map((l) => String(l.habit_id));

  const partnerCompletedIds = (habitLogs || [])
    .filter((l) => !isMyLog(l) && l.completed_at === selectedDateStr)
    .map((l) => String(l.habit_id));

  const myProgress = myHabits.length > 0 ? Math.round((myCompletedIds.length / myHabits.length) * 100) : 0;
  const partnerProgress = partnerHabits.length > 0 ? Math.round((partnerCompletedIds.length / partnerHabits.length) * 100) : 0;

  // Resolve daily message for current user and partner on selected date
  const isMyJournal = (j) => {
    const uid = String(j.user_id || '');
    return (effectiveMyId && uid === String(effectiveMyId)) ||
           (myProfile?.id && uid === String(myProfile.id)) ||
           (isKhanif && (uid === 'e258766b-78f3-43e0-8901-0ae225c75cc3' || uid.includes('khanif') || uid.startsWith('1111'))) ||
           (!isKhanif && (uid === 'afc77284-caab-413b-be18-38f14ca07fc2' || uid.includes('arum') || uid.startsWith('2222')));
  };

  const myDailyMessage = useMemo(() => {
    return (dailyJournals || []).find(
      (j) => isMyJournal(j) && j.date === selectedDateStr
    );
  }, [dailyJournals, selectedDateStr, effectiveMyId, myProfile?.id, isKhanif]);

  const partnerDailyMessage = useMemo(() => {
    return (dailyJournals || []).find(
      (j) => !isMyJournal(j) && j.date === selectedDateStr
    );
  }, [dailyJournals, selectedDateStr, effectiveMyId, myProfile?.id, isKhanif]);

  const handleSendMessage = () => {
    if (!journalText.trim()) return;
    saveDailyJournal(journalText.trim(), selectedDateStr);
    setJournalSaved(true);
    setIsEditingJournal(false);
    setJournalText('');
    setTimeout(() => setJournalSaved(false), 2500);
  };

  const handleStartEdit = () => {
    setJournalText(myDailyMessage?.content || '');
    setIsEditingJournal(true);
  };

  const handleCancelEdit = () => {
    setJournalText('');
    setIsEditingJournal(false);
  };

  const selectedDate = parseLocalDateString(selectedDateStr);
  const isSelectedToday = selectedDateStr === todayStr;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">

      {/* ── TOP HEADER CARD with Icon ── */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {isSelectedToday ? `Hi ${myProfile.name}! 👋` : `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Bangun kebiasaan baik dan pantau konsistensi bersama setiap hari.
            </p>
          </div>
        </div>

        {/* Top Header Action Button */}
        <button
          onClick={onOpenAddHabit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition-all whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Habit</span>
        </button>
      </div>

      {/* ── TOP PROGRESS ROW (Side-by-Side Progress Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Progress Kamu */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Progress Kamu
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
              {myProgress}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900">{myCompletedIds.length} <span className="text-sm font-normal text-stone-400">/ {myHabits.length} selesai</span></span>
            <span className="text-xs text-stone-400">{myHabits.length - myCompletedIds.length} tersisa</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${myProgress}%` }}
            />
          </div>
        </div>

        {/* Progress Pasangan */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-sky-500" />
              Progress {partnerProfile.name}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 border border-stone-200">
              {partnerProgress}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900">{partnerCompletedIds.length} <span className="text-sm font-normal text-stone-400">/ {partnerHabits.length} selesai</span></span>
            <span className="text-xs text-stone-400">{partnerHabits.length - partnerCompletedIds.length} tersisa</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-400 rounded-full transition-all duration-500"
              style={{ width: `${partnerProgress}%` }}
            />
          </div>
        </div>

      </div>

      {/* ── MAIN BENTO GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── MAIN HABIT CHECKLIST (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-5">

            {/* Date Strip Header with Calendar Filter & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-bold text-stone-900 text-base sm:text-lg leading-tight">
                  Daftar Habit Harian
                </h3>
                <span className="text-xs font-semibold text-stone-400">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
              </div>

              {/* Navigation Controls: Date Picker + Prev/Next + Hari Ini Button */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Direct Calendar Date Input Picker */}
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => e.target.value && setSelectedDateStr(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                  title="Pilih tanggal langsung dari kalender"
                />

                {/* Day Prev/Next Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevDay}
                    className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
                    title="Hari sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextDay}
                    className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
                    title="Hari berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Hari Ini Button (Appears when not today) */}
                {!isSelectedToday && (
                  <button
                    onClick={handleToday}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all whitespace-nowrap"
                  >
                    Hari Ini
                  </button>
                )}
              </div>
            </div>

            {/* 7-Day Dynamic Date Strip */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {dateStrip.map((item) => (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`py-2.5 rounded-2xl flex flex-col items-center gap-1 border text-xs transition-all ${
                    item.isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-bold scale-[1.02]'
                      : item.isToday
                      ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-75">{item.day}</span>
                  <span className="text-sm font-bold">{item.date}</span>
                  {item.isToday && !item.isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  )}
                </button>
              ))}
            </div>

            {/* ── MY HABITS SECTION ── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                  <span>🏃</span>
                  Habit Kamu — {myCompletedIds.length}/{myHabits.length} selesai
                </h4>
              </div>

              {myHabits.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-2">
                  <p className="text-2xl">🌱</p>
                  <p className="text-xs font-semibold text-stone-600">Belum ada habit yang dibuat</p>
                  <button
                    onClick={onOpenAddHabit}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Habit Baru</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pagedMyHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={myCompletedIds.includes(String(habit.id))}
                        onToggle={(id) => onToggleHabit(id, myId, selectedDateStr)}
                        onEdit={(h) => onOpenEditHabit && onOpenEditHabit(h)}
                        onDelete={(h) => setDeletingHabit(h)}
                        isToday={isSelectedToday}
                      />
                    ))}
                  </div>

                  {/* Pagination for My Habits */}
                  {myTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 px-1 text-xs text-stone-500">
                      <span>
                        Menampilkan {((validMyPage - 1) * PAGE_SIZE) + 1} - {Math.min(validMyPage * PAGE_SIZE, myHabits.length)} dari {myHabits.length} habit
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMyHabitsPage((prev) => Math.max(1, prev - 1))}
                          disabled={validMyPage === 1}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                        <span className="font-semibold text-stone-700">
                          {validMyPage} / {myTotalPages}
                        </span>
                        <button
                          onClick={() => setMyHabitsPage((prev) => Math.min(myTotalPages, prev + 1))}
                          disabled={validMyPage === myTotalPages}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-stone-100 pt-1" />

            {/* ── PARTNER HABITS SECTION ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-sky-500" />
                  Progress {partnerProfile?.name} — {partnerCompletedIds.length}/{partnerHabits.length} selesai
                </h4>
                <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                  {partnerProgress}%
                </span>
              </div>

              {partnerHabits.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-stone-50 border border-dashed border-stone-200">
                  <p className="text-xl mb-1">💤</p>
                  <p className="text-xs text-stone-400">{partnerProfile?.name} belum memiliki habit</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pagedPartnerHabits.map((habit) => (
                      <PartnerHabitCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={partnerCompletedIds.includes(String(habit.id))}
                        partnerName={partnerProfile?.name}
                      />
                    ))}
                  </div>

                  {/* Pagination for Partner Habits */}
                  {partnerTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 px-1 text-xs text-stone-500">
                      <span>
                        Menampilkan {((validPartnerPage - 1) * PAGE_SIZE) + 1} - {Math.min(validPartnerPage * PAGE_SIZE, partnerHabits.length)} dari {partnerHabits.length} habit
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPartnerHabitsPage((prev) => Math.max(1, prev - 1))}
                          disabled={validPartnerPage === 1}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                        <span className="font-semibold text-stone-700">
                          {validPartnerPage} / {partnerTotalPages}
                        </span>
                        <button
                          onClick={() => setPartnerHabitsPage((prev) => Math.min(partnerTotalPages, prev + 1))}
                          disabled={validPartnerPage === partnerTotalPages}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

        </div>

        {/* ── SIDEBAR (4 cols): Daily Growth Notes & Consistency ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Daily Note & Cheer Card (Pesan Singkat Harian Pasangan) */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                  <MessageSquareHeart className="w-4 h-4 text-sky-600" />
                  Pesan Singkat Harian
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">Saling kirim pesan • Reset setiap hari</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isSelectedToday ? 'bg-sky-100 text-sky-700' : 'bg-stone-100 text-stone-600'}`}>
                {isSelectedToday ? 'Hari Ini' : `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()].slice(0, 3)}`}
              </span>
            </div>

            {/* 1. Pesan dari Pasangan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <span>💌</span> Dari {partnerProfile?.name || 'Pasangan'}
                </span>
                {partnerDailyMessage && (
                  <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-sky-500 text-sky-500 inline" /> Terkirim
                  </span>
                )}
              </div>

              {partnerDailyMessage?.content ? (
                <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 shadow-sm relative">
                  <p className="text-xs text-stone-800 leading-relaxed font-medium italic">
                    "{partnerDailyMessage.content}"
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-dashed border-stone-200 text-center">
                  <p className="text-[11px] text-stone-400">
                    Belum ada pesan dari {partnerProfile?.name || 'pasangan'} untuk tanggal ini ✨
                  </p>
                </div>
              )}
            </div>

            {/* 2. Pesan dari Kamu */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <span>✨</span> Dari Kamu ({myProfile?.name || 'Kamu'})
                </span>
                {myDailyMessage && !isEditingJournal && (
                  <button
                    onClick={handleStartEdit}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Ubah
                  </button>
                )}
              </div>

              {myDailyMessage?.content && !isEditingJournal ? (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <p className="text-xs text-stone-800 leading-relaxed font-medium">
                    "{myDailyMessage.content}"
                  </p>
                  <p className="text-[10px] text-stone-400 text-right">
                    ✓ Tersimpan untuk {isSelectedToday ? 'hari ini' : selectedDateStr}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Quick Cheer Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_CHEERS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setJournalText(chip)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-sky-50/80 hover:bg-sky-100 text-sky-800 border border-sky-100 transition-colors text-left font-medium"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder={`Tulis pesan manis / semangat untuk ${partnerProfile?.name || 'pasanganmu'} hari ini...`}
                    rows={3}
                    maxLength={300}
                    className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all resize-none font-sans"
                  />

                  <div className="flex items-center gap-2">
                    {isEditingJournal && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="py-2 px-3 rounded-xl text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!journalText.trim()}
                      className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        journalSaved
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : !journalText.trim()
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                      }`}
                    >
                      {journalSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Pesan Terkirim!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isEditingJournal ? 'Simpan Perubahan' : 'Kirim Pesan'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-stone-400 text-center pt-1">
              🔄 Pesan berganti otomatis setiap hari baru untuk menyambut hari yang segar
            </p>
          </div>

          {/* Weekly Consistency Chart */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Konsistensi 7 Hari</h3>
                <p className="text-[11px] text-stone-400">Rekap penyelesaian habit</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-stone-500">
                <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" /> Selesai
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-20 pt-2">
              {dateStrip.map((item) => {
                const dayMyCompleted = (habitLogs || []).filter(
                  (l) => isMyLog(l) && l.completed_at === item.dateStr
                ).length;
                const ratio = myHabits.length > 0 ? dayMyCompleted / myHabits.length : 0;
                const heightPx = Math.max(6, Math.round(ratio * 60));

                return (
                  <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-xl overflow-hidden bg-stone-100 relative" style={{ height: '60px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-xl transition-all duration-500 ${
                          item.isSelected ? 'bg-sky-600' : 'bg-sky-300'
                        }`}
                        style={{ height: `${heightPx}px` }}
                      />
                    </div>
                    <span className={`text-[8px] font-bold uppercase ${item.isToday ? 'text-sky-600' : 'text-stone-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for deleting habit */}
      <ConfirmModal
        isOpen={Boolean(deletingHabit)}
        onClose={() => setDeletingHabit(null)}
        onConfirm={() => {
          if (deletingHabit) {
            onDeleteHabit(deletingHabit.id);
            setDeletingHabit(null);
          }
        }}
        title="Hapus Habit? 🗑️"
        message={`Apakah kamu yakin ingin menghapus habit "${deletingHabit?.title}"? Riwayat centang habit ini juga akan terhapus.`}
        confirmText="Ya, Hapus Habit"
        cancelText="Batal"
      />
    </div>
  );
};
