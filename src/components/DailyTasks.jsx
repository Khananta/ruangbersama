'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Heart, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckSquare, Edit3 } from 'lucide-react';
import { AddDailyTaskModal } from './AddDailyTaskModal';
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

// Build a dynamic 11-day strip centered around the selected date
const buildDateStrip = (centerDateStr) => {
  const center = parseLocalDateString(centerDateStr);
  const todayStr = toLocalDateString(new Date());
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const days = [];

  for (let offset = -4; offset <= 4; offset++) {
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

export const DailyTasks = ({
  currentUser,
  dailyTasks = [],
  onAddTask,
  onEditTask,
  onToggleTask,
  onDeleteTask,
  profiles,
}) => {
  const todayStr = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const userEmail = currentUser?.email?.toLowerCase() || '';
  const myId = currentUser?.id || null;

  // Resolve my profile & partner profile dynamically
  const isUser1 = (myId && profiles?.user1?.id === myId) || 
                  (userEmail && profiles?.user1?.email?.toLowerCase() === userEmail) ||
                  userEmail.includes('khanif');

  const myProfile = isUser1
    ? (profiles?.user1 || LOCAL_PROFILES['khanif@gmail.com'] || { name: 'Khanif' })
    : (profiles?.user2 || LOCAL_PROFILES['arum@gmail.com'] || { name: 'Arum' });

  const partnerProfile = isUser1
    ? (profiles?.user2 || LOCAL_PROFILES['arum@gmail.com'] || { name: 'Arum' })
    : (profiles?.user1 || LOCAL_PROFILES['khanif@gmail.com'] || { name: 'Khanif' });

  const effectiveMyId = myId || myProfile?.id;
  const partnerId = partnerProfile?.id;

  const isKhanif = userEmail.includes('khanif');

  // Filter tasks by selected date & user
  const isMyTask = (t) => {
    const uid = String(t.user_id || '');
    return (effectiveMyId && uid === String(effectiveMyId)) ||
           (myProfile?.id && uid === String(myProfile.id)) ||
           (isKhanif && (uid === 'e258766b-78f3-43e0-8901-0ae225c75cc3' || uid.includes('khanif') || uid.startsWith('1111'))) ||
           (!isKhanif && (uid === 'afc77284-caab-413b-be18-38f14ca07fc2' || uid.includes('arum') || uid.startsWith('2222')));
  };

  const isPartnerTask = (t) => !isMyTask(t);

  const myTasks = dailyTasks.filter(
    (t) => isMyTask(t) && (t.date === selectedDate || t.task_date === selectedDate)
  );

  const partnerTasks = dailyTasks.filter(
    (t) => isPartnerTask(t) && (t.date === selectedDate || t.task_date === selectedDate)
  );

  const myDoneCount = myTasks.filter((t) => t.is_completed).length;
  const partnerDoneCount = partnerTasks.filter((t) => t.is_completed).length;

  const myProgress = myTasks.length > 0 ? Math.round((myDoneCount / myTasks.length) * 100) : 0;
  const partnerProgress = partnerTasks.length > 0 ? Math.round((partnerDoneCount / partnerTasks.length) * 100) : 0;

  // Exact 1-day navigation
  const handlePrevDay = () => {
    const d = parseLocalDateString(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDateString(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toLocalDateString(d));
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  const dateStrip = useMemo(() => buildDateStrip(selectedDate), [selectedDate]);

  const dateObj = parseLocalDateString(selectedDate);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isSelectedToday = selectedDate === todayStr;

  // Calculate day difference for max 2 days editability (0 = today, 1 = yesterday, 2 = 2 days ago)
  const today = parseLocalDateString(todayStr);
  const diffDays = Math.round((today.getTime() - dateObj.getTime()) / (1000 * 3600 * 24));
  const canToggleTasks = diffDays >= 0 && diffDays <= 2;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* ── Top Header Card with Icon ── */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-stone-900">
                {formattedDate}
              </h2>
              {!canToggleTasks && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  🔒 Riwayat &gt;2 hari (Read-Only)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Catat to-do & daftar kegiatan harianmu dan lihat aktivitas pasanganmu secara realtime.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto flex items-center justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition-all whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Date Strip / Mini Calendar ── */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2 text-xs font-bold text-stone-500">
          <span className="flex items-center gap-1.5 text-stone-700">
            <CalendarIcon className="w-4 h-4 text-sky-600" />
            Pilih Tanggal Kegiatan
          </span>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Direct Calendar Date Input Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
              title="Pilih tanggal langsung"
            />

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

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

        {/* Horizontal Calendar Bar */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {dateStrip.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 border text-xs transition-all ${
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
      </div>

      {/* ── Dua Kolom Kegiatan (Kamu & Pasangan) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Kolom Kiri: Kegiatan Kamu ── */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">List Kamu</span>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 mt-0.5">
                <span>Kegiatan {myProfile.name}</span>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  {myDoneCount}/{myTasks.length} Selesai
                </span>
              </h3>
            </div>

            {myTasks.length > 0 && (
              <span className="text-xs font-bold text-sky-600">
                {myProgress}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {myTasks.length > 0 && (
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 rounded-full transition-all duration-500"
                style={{ width: `${myProgress}%` }}
              />
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-2.5 min-h-[200px] pt-1">
            {myTasks.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-2">
                <p className="text-2xl">📝</p>
                <p className="text-xs font-semibold text-stone-600">Belum ada kegiatan di tanggal ini</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>
            ) : (
              myTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => canToggleTasks && onToggleTask(task.id, !task.is_completed)}
                  className={`group p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    task.is_completed
                      ? 'bg-sky-50/60 border-sky-200'
                      : canToggleTasks
                      ? 'bg-stone-50 border-stone-200 hover:border-sky-300 hover:bg-white cursor-pointer'
                      : 'bg-stone-50/70 border-stone-200 opacity-80 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      disabled={!canToggleTasks}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canToggleTasks) onToggleTask(task.id, !task.is_completed);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        task.is_completed
                          ? 'bg-sky-600 text-white shadow-sm'
                          : canToggleTasks
                          ? 'border border-stone-300 bg-white hover:border-sky-400'
                          : 'border border-stone-200 bg-stone-100 cursor-not-allowed'
                      }`}
                      title={!canToggleTasks ? 'Riwayat >2 hari lalu terkunci' : 'Tandai selesai'}
                    >
                      {task.is_completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        task.is_completed ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}>
                        {task.title}
                      </p>
                      {task.time && (
                        <span className="text-[10px] text-sky-600 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {canToggleTasks && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                            setIsAddModalOpen(true);
                          }}
                          className="text-stone-300 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                          title="Edit kegiatan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTask(task);
                          }}
                          className="text-stone-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus kegiatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Kolom Kanan: Kegiatan Pasangan ── */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-sky-500" />
                List {partnerProfile.name}
              </span>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 mt-0.5">
                <span>Kegiatan {partnerProfile.name}</span>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                  {partnerDoneCount}/{partnerTasks.length} Selesai
                </span>
              </h3>
            </div>

            {partnerTasks.length > 0 && (
              <span className="text-xs font-bold text-stone-600">
                {partnerProgress}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {partnerTasks.length > 0 && (
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-400 rounded-full transition-all duration-500"
                style={{ width: `${partnerProgress}%` }}
              />
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-2.5 min-h-[200px] pt-1">
            {partnerTasks.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-stone-50 border border-dashed border-stone-200">
                <p className="text-2xl mb-2">🌿</p>
                <p className="text-xs font-semibold text-stone-600">{partnerProfile.name} belum mencatat kegiatan</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Kegiatannya akan muncul otomatis di sini</p>
              </div>
            ) : (
              partnerTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    task.is_completed
                      ? 'bg-sky-50/40 border-sky-200'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      task.is_completed
                        ? 'bg-sky-600 text-white'
                        : 'border border-stone-300 bg-stone-50'
                    }`}>
                      {task.is_completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>

                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        task.is_completed ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}>
                        {task.title}
                      </p>
                      {task.time && (
                        <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    task.is_completed
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-stone-100 text-stone-500 border-stone-200'
                  }`}>
                    {task.is_completed ? 'Selesai' : 'Berjalan'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── Modal Popup Tambah / Edit Kegiatan ── */}
      <AddDailyTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        initialData={editingTask}
        initialDate={selectedDate}
        existingTasks={dailyTasks.filter(isMyTask)}
      />

      {/* ── Confirmation Modal for Deleting Daily Task ── */}
      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => {
          if (deletingTask) {
            onDeleteTask(deletingTask.id);
            setDeletingTask(null);
          }
        }}
        title="Hapus Kegiatan? 🗑️"
        message={`Apakah kamu yakin ingin menghapus kegiatan "${deletingTask?.title}"?`}
        confirmText="Ya, Hapus Kegiatan"
        cancelText="Batal"
      />

    </div>
  );
};
