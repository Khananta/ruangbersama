'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { DualDashboard } from '../components/DualDashboard';
import { DailyTasks } from '../components/DailyTasks';
import { SharedCalendar } from '../components/SharedCalendar';
import { WeeklyEvaluation } from '../components/WeeklyEvaluation';
import { AnalyticsView } from '../components/AnalyticsView';
import { AddHabitModal } from '../components/AddHabitModal';
import { AddEventModal } from '../components/AddEventModal';
import { LoginPage } from '../components/LoginPage';
import { Toast } from '../components/Toast';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AUTH_STORAGE_KEY = 'ruang_bersama_auth_user';
const ACTIVE_TAB_KEY = 'ruang_bersama_active_tab';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTabState] = useState('dashboard');
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [toast, setToast] = useState(null);

  // Tab change with persistence
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACTIVE_TAB_KEY, tab);
      } catch (e) {
        console.warn('Failed to save active tab:', e);
      }
    }
  }, []);

  // Restore auth session & active tab on initial load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Restore active tab
        const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
        if (savedTab && ['dashboard', 'tasks', 'calendar', 'evaluation', 'analytics'].includes(savedTab)) {
          setActiveTabState(savedTab);
        }

        // 1. Check Supabase session first if available
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setCurrentUser(session.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session.user));
            setIsInitializing(false);
            return;
          }
        }

        // 2. Check localStorage for user
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.id || parsed.email)) {
            setCurrentUser(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to restore auth session:', e);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const {
    data,
    connectionStatus,
    isLoading,
    effectiveUserId,
    toggleHabitLog,
    addHabit,
    editHabit,
    deleteHabit,
    addDailyTask,
    editDailyTask,
    toggleDailyTask,
    deleteDailyTask,
    addAgendaEvent,
    editAgendaEvent,
    toggleAgendaEvent,
    deleteAgendaEvent,
    saveWeeklyReflection,
    deleteWeeklyReflection,
    saveDailyJournal,
    addCollegeAssignment,
    editCollegeAssignment,
    toggleCollegeAssignment,
    deleteCollegeAssignment,
    clearUserState,
  } = useSupabaseRealtime(currentUser);

  // ─── Wrapped Actions with Toast Notifications ────────────────
  const handleAddHabit = useCallback(async (habitData) => {
    const result = await addHabit(habitData);
    setToast({
      type: 'success',
      title: 'Habit Ditambahkan! 🌿',
      message: `Habit "${habitData.title}" berhasil disimpan.`,
    });
    return result;
  }, [addHabit]);

  const handleEditHabit = useCallback(async (habitId, updatedData) => {
    const result = await editHabit(habitId, updatedData);
    setToast({
      type: 'success',
      title: 'Habit Diperbarui! 🌿',
      message: `Perubahan pada habit "${updatedData.title}" berhasil disimpan.`,
    });
    return result;
  }, [editHabit]);

  const handleDeleteHabit = useCallback(async (habitId) => {
    const result = await deleteHabit(habitId);
    setToast({
      type: 'success',
      title: 'Habit Dihapus 🗑️',
      message: 'Habit berhasil dihapus dari daftar tracker.',
    });
    return result;
  }, [deleteHabit]);

  const handleAddDailyTask = useCallback(async (taskData) => {
    const result = await addDailyTask(taskData);
    setToast({
      type: 'success',
      title: 'Kegiatan Ditambahkan! 📋',
      message: `Kegiatan "${taskData.title}" berhasil dicatat.`,
    });
    return result;
  }, [addDailyTask]);

  const handleEditDailyTask = useCallback(async (taskId, updatedData) => {
    const result = await editDailyTask(taskId, updatedData);
    setToast({
      type: 'success',
      title: 'Kegiatan Diperbarui! 📋',
      message: `Perubahan kegiatan "${updatedData.title}" berhasil disimpan.`,
    });
    return result;
  }, [editDailyTask]);

  const handleDeleteDailyTask = useCallback(async (taskId) => {
    const result = await deleteDailyTask(taskId);
    setToast({
      type: 'success',
      title: 'Kegiatan Dihapus 🗑️',
      message: 'Kegiatan berhasil dihapus dari daftar.',
    });
    return result;
  }, [deleteDailyTask]);

  const handleAddAgendaEvent = useCallback(async (eventData) => {
    const result = await addAgendaEvent(eventData);
    setToast({
      type: 'success',
      title: 'Agenda Ditambahkan! 📅',
      message: `Agenda "${eventData.title}" berhasil dijadwalkan.`,
    });
    return result;
  }, [addAgendaEvent]);

  const handleEditAgendaEvent = useCallback(async (eventId, updatedData) => {
    const result = await editAgendaEvent(eventId, updatedData);
    setToast({
      type: 'success',
      title: 'Agenda Diperbarui! 📅',
      message: `Perubahan agenda "${updatedData.title}" berhasil disimpan.`,
    });
    return result;
  }, [editAgendaEvent]);

  const handleToggleAgendaEvent = useCallback(async (eventId, isCompleted) => {
    const result = await toggleAgendaEvent(eventId, isCompleted);
    return result;
  }, [toggleAgendaEvent]);

  const handleDeleteAgendaEvent = useCallback(async (eventId) => {
    const result = await deleteAgendaEvent(eventId);
    setToast({
      type: 'success',
      title: 'Agenda Dihapus 🗑️',
      message: 'Agenda berhasil dihapus dari kalender.',
    });
    return result;
  }, [deleteAgendaEvent]);

  const handleSaveWeeklyReflection = useCallback(async (reflectionData) => {
    const result = await saveWeeklyReflection(reflectionData);
    setToast({
      type: 'success',
      title: 'Refleksi Tersimpan! 📝',
      message: 'Catatan refleksi mingguan berhasil disimpan.',
    });
    return result;
  }, [saveWeeklyReflection]);

  const handleDeleteWeeklyReflection = useCallback(async (reflectionId) => {
    const result = await deleteWeeklyReflection(reflectionId);
    setToast({
      type: 'success',
      title: 'Refleksi Dihapus 🗑️',
      message: 'Riwayat refleksi mingguan berhasil dihapus.',
    });
    return result;
  }, [deleteWeeklyReflection]);

  const handleSaveDailyJournal = useCallback(async (note, date) => {
    const result = await saveDailyJournal(note, date);
    setToast({
      type: 'success',
      title: 'Pesan Terkirim! 💌',
      message: 'Pesan harian berhasil disimpan dan dikirim.',
    });
    return result;
  }, [saveDailyJournal]);

  const handleAddCollegeAssignment = useCallback(async (assignmentData) => {
    const result = await addCollegeAssignment(assignmentData);
    setToast({
      type: 'success',
      title: 'Tugas Ditambahkan! 🎓',
      message: `Tugas "${assignmentData.title}" berhasil dicatat.`,
    });
    return result;
  }, [addCollegeAssignment]);

  const handleEditCollegeAssignment = useCallback(async (assignmentId, updatedData) => {
    const result = await editCollegeAssignment(assignmentId, updatedData);
    setToast({
      type: 'success',
      title: 'Tugas Diperbarui! 🎓',
      message: `Perubahan tugas "${updatedData.title}" berhasil disimpan.`,
    });
    return result;
  }, [editCollegeAssignment]);

  const handleDeleteCollegeAssignment = useCallback(async (assignmentId) => {
    const result = await deleteCollegeAssignment(assignmentId);
    setToast({
      type: 'success',
      title: 'Tugas Dihapus 🗑️',
      message: 'Tugas kuliah berhasil dihapus dari daftar.',
    });
    return result;
  }, [deleteCollegeAssignment]);

  const handleLoginSuccess = useCallback((user) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to persist user session:', e);
      }
    }
    const name = user?.user_metadata?.name || (user?.email?.includes('khanif') ? 'Khanif' : 'Arum');
    setToast({
      type: 'success',
      title: 'Berhasil Masuk! 👋',
      message: `Selamat datang kembali di Ruang Bersama, ${name}!`,
    });
  }, []);

  const handleLoginFailure = useCallback((message) => {
    setToast({
      type: 'error',
      title: 'Gagal Masuk',
      message: message || 'Email atau kata sandi tidak cocok. Silakan coba lagi.',
    });
  }, []);

  const handleLogout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut failed:', e);
      }
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear stored auth user:', e);
      }
    }
    clearUserState();
    setCurrentUser(null);
    setActiveTab('dashboard');
    setToast({
      type: 'logout',
      title: 'Berhasil Keluar',
      message: 'Kamu telah keluar dari akun. Sampai jumpa! 🌿',
    });
  }, [clearUserState, setActiveTab]);

  // Loading screen while checking stored session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-stone-500">Membuka Ruang Bersama...</span>
        </div>
      </div>
    );
  }

  // ── Show login page if not authenticated ──
  if (!currentUser) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
        />
      </>
    );
  }

  // ── Main App ──
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAFA] text-stone-900">

      {/* Floating SweetAlert Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto pb-16">

        {/* Non-blocking sync indicator */}
        {isLoading && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-sky-200 shadow-md rounded-full text-xs font-semibold text-sky-600 transition-all animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
            <span>Menyelaraskan data...</span>
          </div>
        )}

        {/* 1. Habit Tab */}
        {activeTab === 'dashboard' && (
          <DualDashboard
            currentUser={currentUser}
            profiles={data.profiles}
            habits={data.habits}
            habitLogs={data.habit_logs}
            onToggleHabit={toggleHabitLog}
            onOpenAddHabit={() => {
              setEditingHabit(null);
              setIsAddHabitOpen(true);
            }}
            onOpenEditHabit={(habit) => {
              setEditingHabit(habit);
              setIsAddHabitOpen(true);
            }}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            saveDailyJournal={handleSaveDailyJournal}
            dailyJournals={data.daily_journals}
            collegeAssignments={data.college_assignments}
            onAddCollegeAssignment={handleAddCollegeAssignment}
            onEditCollegeAssignment={handleEditCollegeAssignment}
            onToggleCollegeAssignment={toggleCollegeAssignment}
            onDeleteCollegeAssignment={handleDeleteCollegeAssignment}
          />
        )}

        {/* 2. Kegiatan Harian Tab */}
        {activeTab === 'tasks' && (
          <DailyTasks
            currentUser={currentUser}
            dailyTasks={data.daily_tasks}
            onAddTask={handleAddDailyTask}
            onEditTask={handleEditDailyTask}
            onToggleTask={toggleDailyTask}
            onDeleteTask={handleDeleteDailyTask}
            profiles={data.profiles}
          />
        )}

        {/* 3. Kalender Tab */}
        {activeTab === 'calendar' && (
          <SharedCalendar
            events={data.agenda_events}
            onOpenAddEvent={(date) => {
              setEditingEvent(null);
              setSelectedEventDate(date || null);
              setIsAddEventOpen(true);
            }}
            onEditEvent={(evt) => {
              setEditingEvent(evt);
              setIsAddEventOpen(true);
            }}
            onToggleEvent={handleToggleAgendaEvent}
            profiles={data.profiles}
            currentUser={currentUser}
            onDeleteEvent={handleDeleteAgendaEvent}
          />
        )}

        {/* 4. Refleksi Tab */}
        {activeTab === 'evaluation' && (
          <WeeklyEvaluation
            evaluations={data.weekly_evaluations}
            onSaveReflection={handleSaveWeeklyReflection}
            onDeleteReflection={handleDeleteWeeklyReflection}
            profiles={data.profiles}
            currentUser={currentUser}
            habits={data.habits}
            habitLogs={data.habit_logs}
          />
        )}

        {/* 5. Analitik Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            habits={data.habits}
            habitLogs={data.habit_logs}
            dailyTasks={data.daily_tasks}
            collegeAssignments={data.college_assignments}
            currentUser={currentUser}
            profiles={data.profiles}
          />
        )}
      </main>

      {/* Modals */}
      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => {
          setIsAddHabitOpen(false);
          setEditingHabit(null);
        }}
        onAddHabit={handleAddHabit}
        onEditHabit={handleEditHabit}
        initialData={editingHabit}
      />

      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => {
          setIsAddEventOpen(false);
          setEditingEvent(null);
        }}
        onAddEvent={handleAddAgendaEvent}
        onEditEvent={handleEditAgendaEvent}
        initialData={editingEvent}
        initialDate={selectedEventDate}
        existingEvents={data.agenda_events}
        currentUser={currentUser}
        profiles={data.profiles}
      />

    </div>
  );
}
