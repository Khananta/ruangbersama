'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Check, CheckCircle2, Trash2, Clock, Edit3 } from 'lucide-react';
import { LOCAL_PROFILES } from '../lib/supabaseClient';
import { ConfirmModal } from './ConfirmModal';

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

export const SharedCalendar = ({
  events = [],
  onOpenAddEvent,
  onEditEvent,
  onToggleEvent,
  profiles,
  currentUser,
  onDeleteEvent,
}) => {
  const todayStr = toLocalDateString(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewMode, setViewMode] = useState('selected'); // 'selected' or 'all'
  const [deletingEvent, setDeletingEvent] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(toLocalDateString(now));
  };

  const eventsByDate = events.reduce((acc, evt) => {
    if (!acc[evt.date]) acc[evt.date] = [];
    acc[evt.date].push(evt);
    return acc;
  }, {});

  // Resolve creator name
  const getCreatorName = (createdBy) => {
    if (!createdBy) return 'Bersama';
    const u1 = profiles?.user1;
    const u2 = profiles?.user2;
    if (u1 && (u1.id === createdBy || u1.email?.toLowerCase().includes(String(createdBy).toLowerCase()))) return u1.name;
    if (u2 && (u2.id === createdBy || u2.email?.toLowerCase().includes(String(createdBy).toLowerCase()))) return u2.name;
    const allProfiles = Object.values(LOCAL_PROFILES);
    const found = allProfiles.find((p) => p.id === createdBy || p.email?.toLowerCase().includes(String(createdBy).toLowerCase()));
    if (found) return found.name;
    return 'Bersama';
  };

  const userEmail = currentUser?.email?.toLowerCase() || '';
  const isUser1 = (currentUser?.id && profiles?.user1?.id === currentUser?.id) ||
                  (userEmail && profiles?.user1?.email?.toLowerCase() === userEmail) ||
                  userEmail.includes('khanif');
  const myProfile = isUser1 ? (profiles?.user1 || { name: 'Khanif' }) : (profiles?.user2 || { name: 'Arum' });

  const isSelectedPast = selectedDate < todayStr;
  const isSelectedToday = selectedDate === todayStr;

  const selectedDateEvents = eventsByDate[selectedDate] || [];

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((e) => e.date >= todayStr);

  const pastEvents = [...events]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((e) => e.date < todayStr);

  const allSorted = [...upcomingEvents, ...pastEvents];

  const selectedDateObj = parseLocalDateString(selectedDate);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Agenda & Kalender 📅</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Tandai jadwal dan rencana aktivitas bersama.
            </p>
          </div>
        </div>

        {/* Legend & Add Button (Stacked vertically on mobile) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 text-xs bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="flex items-center gap-1.5 font-semibold text-sky-600">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
              Bersama
            </span>
            <span className="w-px h-4 bg-stone-200" />
            <span className="flex items-center gap-1.5 font-semibold text-stone-500">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400 inline-block" />
              Pribadi
            </span>
          </div>

          <button
            onClick={() => onOpenAddEvent(selectedDate >= todayStr ? selectedDate : todayStr)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition-all whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Calendar + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
          
          {/* Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
            <div>
              <h3 className="font-bold text-lg text-stone-900">
                {monthNames[month]} {year}
              </h3>
              <p className="text-[11px] text-stone-400">Klik tanggal untuk melihat atau menambah agenda</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Direct date picker to jump anywhere */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    const parsed = parseLocalDateString(e.target.value);
                    setCurrentDate(parsed);
                    setSelectedDate(e.target.value);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                title="Lompat ke tanggal tertentu"
              />

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 border border-stone-200 transition-colors"
                  title="Bulan sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 border border-stone-200 transition-colors"
                  title="Bulan berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Hari Ini Button */}
              {(!isSelectedToday || currentDate.getMonth() !== new Date().getMonth() || currentDate.getFullYear() !== new Date().getFullYear()) && (
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all whitespace-nowrap"
                >
                  Hari Ini
                </button>
              )}
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-stone-400 uppercase tracking-wider py-1">
            {dayLabels.map((d) => <span key={d}>{d}</span>)}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-14 sm:h-16 rounded-2xl bg-stone-50/30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  type="button"
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-14 sm:h-16 p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between text-left cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/70 shadow-md scale-[1.02] z-10'
                      : isToday
                      ? 'bg-sky-50/50 border-2 border-sky-400 shadow-sm hover:bg-sky-50'
                      : isPast
                      ? 'bg-stone-50/50 border-stone-100 hover:border-stone-300 hover:bg-white'
                      : 'bg-white border-stone-200 hover:border-sky-300 hover:bg-sky-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected
                          ? 'w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm'
                          : isToday
                          ? 'w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center text-[10px] font-bold'
                          : isPast
                          ? 'text-stone-300'
                          : 'text-stone-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {/* Hide event count badge on mobile to keep cells clean and uncluttered */}
                    {dayEvents.length > 0 && (
                      <span className={`hidden sm:inline-block text-[9px] font-bold px-1 rounded-md ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Dot indicator on mobile when events exist */}
                  {dayEvents.length > 0 && (
                    <div className="flex sm:hidden items-center justify-center gap-0.5 mt-auto">
                      {dayEvents.slice(0, 3).map((evt, dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            evt.category === 'together' ? 'bg-sky-500' : 'bg-stone-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Event pills on desktop */}
                  <div className="hidden sm:block space-y-0.5 overflow-hidden w-full">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`text-[9px] font-semibold truncate px-1.5 py-0.5 rounded-lg ${
                          evt.is_completed
                            ? 'line-through opacity-60 bg-stone-100 text-stone-400'
                            : evt.category === 'together'
                            ? 'bg-sky-100/90 text-sky-800 border border-sky-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                        title={`${evt.title}${evt.time ? ` (${evt.time})` : ''}`}
                      >
                        {evt.time && <span className="font-bold mr-0.5">{evt.time}</span>}
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar: Selected Day Detail + All Events ── */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('selected')}
                className={`flex-1 py-1.5 rounded-xl transition-all text-center ${
                  viewMode === 'selected'
                    ? 'bg-white text-sky-600 font-bold shadow-sm border border-sky-100'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Hari Terpilih
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`flex-1 py-1.5 rounded-xl transition-all text-center ${
                  viewMode === 'all'
                    ? 'bg-white text-sky-600 font-bold shadow-sm border border-sky-100'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Semua Agenda ({events.length})
              </button>
            </div>

            {/* ── View 1: Selected Day Details ── */}
            {viewMode === 'selected' && (
              <div className="space-y-3">
                <div className="border-b border-stone-100 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      {isSelectedToday ? '📅 Hari Ini' : isSelectedPast ? '🔒 Tanggal Berlalu' : '📅 Jadwal Mendatang'}
                    </span>
                    {isSelectedPast && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200">
                        Read Only
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {formattedSelectedDate}
                  </h4>
                </div>

                {/* Action button on selected date if not past */}
                {!isSelectedPast && (
                  <button
                    type="button"
                    onClick={() => onOpenAddEvent(selectedDate)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-sky-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Agenda di Tanggal Ini</span>
                  </button>
                )}

                {/* List of events on selected date */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-1">
                      <p className="text-2xl">🌱</p>
                      <p className="text-xs font-semibold text-stone-600">
                        {isSelectedPast ? 'Tidak ada agenda di hari ini' : 'Belum ada agenda di tanggal ini'}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {isSelectedPast ? 'Tanggal sudah berlalu' : 'Klik tombol di atas untuk menambah'}
                      </p>
                    </div>
                  ) : (
                    selectedDateEvents.map((evt) => {
                      const isTogether = evt.category === 'together';
                      const creatorName = getCreatorName(evt.created_by);
                      const canDelete = !isSelectedPast && myProfile && (myProfile.id === evt.created_by || currentUser?.id === evt.created_by);

                      return (
                        <div
                          key={evt.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            evt.is_completed
                              ? 'bg-stone-50/70 border-stone-200 opacity-80'
                              : isSelectedPast
                              ? 'bg-stone-50/70 border-stone-200 opacity-80'
                              : isTogether
                              ? 'bg-sky-50/60 border-sky-200'
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isTogether ? 'bg-sky-600 text-white' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {isTogether ? 'Bersama' : 'Pribadi'}
                              </span>

                              {evt.time && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {evt.time}
                                </span>
                              )}

                              {evt.is_completed && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                                  ✓ Terlaksana
                                </span>
                              )}
                            </div>

                            {/* Actions: Checkmark Toggle, Edit & Delete */}
                            <div className="flex items-center gap-1.5">
                              {/* Checkmark Toggle */}
                              {onToggleEvent && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleEvent(evt.id, !evt.is_completed);
                                  }}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                    evt.is_completed
                                      ? 'bg-sky-600 text-white shadow-sm'
                                      : 'border border-stone-300 bg-white hover:border-sky-400 text-stone-400'
                                  }`}
                                  title={evt.is_completed ? 'Tandai belum terlaksana' : 'Tandai terlaksana'}
                                >
                                  {evt.is_completed ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 stroke-[2] opacity-0 hover:opacity-50" />
                                  )}
                                </button>
                              )}

                              {canDelete && (
                                <>
                                  {onEditEvent && (
                                    <button
                                      type="button"
                                      onClick={() => onEditEvent(evt)}
                                      className="text-stone-300 hover:text-sky-600 transition-colors p-1 rounded-lg hover:bg-sky-50"
                                      title="Edit agenda"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteEvent && (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingEvent(evt)}
                                      className="text-stone-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                                      title="Hapus agenda"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <h5 className={`text-sm font-semibold mt-2 ${
                            evt.is_completed ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}>
                            {evt.title}
                          </h5>
                          {evt.notes && (
                            <p className="text-[11px] text-stone-500 mt-1">{evt.notes}</p>
                          )}

                          <div className="mt-2 pt-2 border-t border-stone-200/50 text-[10px] text-stone-400 flex items-center justify-between">
                            <span>Dibuat: {creatorName}</span>
                            {isSelectedPast && <span className="text-stone-400 italic">Arsip</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── View 2: All Events List ── */}
            {viewMode === 'all' && (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {allSorted.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-2xl mb-2">📭</p>
                    <p className="text-xs text-stone-400">Belum ada agenda terdaftar.</p>
                  </div>
                ) : (
                  allSorted.map((evt) => {
                    const isTogether = evt.category === 'together';
                    const creatorName = getCreatorName(evt.created_by);
                    const isPastEvt = evt.date < todayStr;
                    const canDelete = !isPastEvt && myProfile && (myProfile.id === evt.created_by || currentUser?.id === evt.created_by);

                    return (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setSelectedDate(evt.date);
                          const parsed = parseLocalDateString(evt.date);
                          setCurrentDate(parsed);
                          setViewMode('selected');
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:border-sky-300 ${
                          evt.is_completed
                            ? 'opacity-70 bg-stone-50 border-stone-200'
                            : isPastEvt
                            ? 'opacity-60 bg-stone-50 border-stone-200'
                            : isTogether
                            ? 'bg-sky-50/60 border-sky-200'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isTogether ? 'bg-sky-600 text-white' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isTogether ? 'Bersama' : 'Pribadi'}
                            </span>

                            {evt.time && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {evt.time}
                              </span>
                            )}

                            {evt.is_completed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                                ✓ Terlaksana
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-stone-500">
                              {parseLocalDateString(evt.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>

                            {/* Checkmark Toggle */}
                            {onToggleEvent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleEvent(evt.id, !evt.is_completed);
                                }}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                                  evt.is_completed
                                    ? 'bg-sky-600 text-white shadow-sm'
                                    : 'border border-stone-300 bg-white hover:border-sky-400 text-stone-400'
                                }`}
                                title={evt.is_completed ? 'Tandai belum terlaksana' : 'Tandai terlaksana'}
                              >
                                {evt.is_completed && <Check className="w-3 h-3 stroke-[3] text-white" />}
                              </button>
                            )}

                            {canDelete && (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {onEditEvent && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditEvent(evt);
                                    }}
                                    className="text-stone-300 hover:text-sky-600 transition-colors p-0.5"
                                    title="Edit agenda"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onDeleteEvent && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingEvent(evt);
                                    }}
                                    className="text-stone-300 hover:text-red-500 transition-colors p-0.5"
                                    title="Hapus agenda"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <h5 className={`text-sm font-semibold mt-2 ${
                          evt.is_completed ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}>
                          {evt.title}
                        </h5>
                        {evt.notes && (
                          <p className="text-[11px] text-stone-500 mt-1">{evt.notes}</p>
                        )}

                        <div className="mt-2 pt-2 border-t border-stone-200/50 text-[10px] text-stone-400">
                          Dibuat oleh: {creatorName}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Deleting Agenda */}
      <ConfirmModal
        isOpen={Boolean(deletingEvent)}
        onClose={() => setDeletingEvent(null)}
        onConfirm={() => {
          if (deletingEvent) {
            onDeleteEvent(deletingEvent.id);
            setDeletingEvent(null);
          }
        }}
        title="Hapus Agenda? 🗑️"
        message={`Apakah kamu yakin ingin menghapus agenda "${deletingEvent?.title}"?`}
        confirmText="Ya, Hapus Agenda"
        cancelText="Batal"
      />
    </div>
  );
};
