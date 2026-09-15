import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, getInitialState, LOCAL_PROFILES, DEFAULT_COUPLE_ID } from '../lib/supabaseClient';

const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');

const mergeArray = (dbArr, localArr) => {
  if (!Array.isArray(dbArr) || dbArr.length === 0) {
    return Array.isArray(localArr) ? localArr : [];
  }
  if (!Array.isArray(localArr) || localArr.length === 0) {
    return dbArr;
  }
  const dbIds = new Set(dbArr.map((item) => String(item.id)));
  const localOnly = localArr.filter((item) => !dbIds.has(String(item.id)));
  return [...dbArr, ...localOnly];
};

const parseEvalItem = (item) => {
  if (!item) return item;
  let year = item.year;
  let month = item.month;
  let week_number = item.week_number;
  if (item.week_start) {
    const parts = String(item.week_start).split('-');
    if (parts.length === 3) {
      year = Number(parts[0]);
      month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      week_number = Math.min(5, Math.max(1, Math.ceil(day / 7)));
    }
  }
  return {
    ...item,
    year: year !== undefined && !isNaN(year) ? Number(year) : new Date().getFullYear(),
    month: month !== undefined && !isNaN(month) ? Number(month) : new Date().getMonth(),
    week_number: week_number !== undefined && !isNaN(week_number) ? Number(week_number) : 1,
    reflection_user_1: item.reflection_user_1 || '',
    reflection_user_2: item.reflection_user_2 || '',
    goals_next_week: item.goals_next_week || '',
  };
};

/**
 * useSupabaseRealtime
 * Rock-solid persistence with localStorage & Supabase realtime synchronization.
 */
export const useSupabaseRealtime = (currentUser) => {
  const userId = currentUser?.id || null;
  const userEmail = currentUser?.email?.toLowerCase() || null;
  const effectiveUserId = isUuid(userId) ? userId : null;

  // Unified storage key per user
  const storageKey = userId ? `ruang_bersama_v3_${userId}` : 'ruang_bersama_v3_shared';

  const [data, setData] = useState(() => {
    if (typeof window === 'undefined') return getInitialState();
    try {
      // Check specific user key first, then shared key
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('ruang_bersama_v3_shared');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...getInitialState(), ...parsed };
        }
      }
      return getInitialState();
    } catch {
      return getInitialState();
    }
  });

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [connectionStatus, setConnectionStatus] = useState(
    isSupabaseConfigured ? 'connecting' : 'local'
  );
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef(null);

  // When user logs in or restores, load from that user's localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey) || localStorage.getItem('ruang_bersama_v3_shared');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setData((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.warn('Error reading localStorage on user sync:', e);
      }
    }
  }, [storageKey]);

  // ─── Persist to localStorage ───────────────────────────────
  const updateState = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (typeof window !== 'undefined') {
        try {
          if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
          localStorage.setItem('ruang_bersama_v3_shared', JSON.stringify(next));
        } catch (e) {
          console.warn('localStorage save failed:', e);
        }
      }
      return next;
    });
  }, [storageKey]);

  // ─── Build profiles shape from DB array ───────────────────
  const buildProfilesShape = useCallback((profileArr) => {
    const u1 = profileArr.find((p) => p.email?.includes('khanif')) || LOCAL_PROFILES['khanif@gmail.com'];
    const u2 = profileArr.find((p) => p.email?.includes('arum')) || LOCAL_PROFILES['arum@gmail.com'];
    return { user1: u1, user2: u2 };
  }, []);

  // ─── Load all data from Supabase ───────────────────────────
  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    setIsLoading(true);

    try {
      // 0. Ensure current logged-in profile exists in public.profiles table
      if (userId && isUuid(userId)) {
        const pEmail = userEmail || 'user@example.com';
        const pName = currentUser?.user_metadata?.name || (pEmail.includes('khanif') ? 'Khanif' : pEmail.includes('arum') ? 'Arum' : 'Partner');
        await supabase.from('profiles').upsert({
          id: userId,
          couple_id: DEFAULT_COUPLE_ID,
          email: pEmail,
          name: pName,
          role: 'partner',
          updated_at: new Date().toISOString(),
        });
      }

      // 1. Profiles
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*');
      if (profileErr) console.warn('Supabase profiles query:', profileErr.message);

      // 2. Habits
      const { data: habitsData, error: habitsErr } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });
      if (habitsErr) console.warn('Supabase habits query:', habitsErr.message);

      // 3. Habit logs
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const { data: logsData, error: logsErr } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('completed_at', thirtyDaysAgo)
        .order('completed_at', { ascending: false });
      if (logsErr) console.warn('Supabase habit_logs query:', logsErr.message);

      // 4. Daily tasks
      const { data: tasksData, error: tasksErr } = await supabase
        .from('daily_tasks')
        .select('*')
        .order('created_at', { ascending: true });
      if (tasksErr) console.warn('Supabase daily_tasks query:', tasksErr.message);

      // 5. Agenda events
      const { data: agendaData, error: agendaErr } = await supabase
        .from('agenda_events')
        .select('*')
        .order('date', { ascending: true });
      if (agendaErr) console.warn('Supabase agenda_events query:', agendaErr.message);

      // 6. Weekly evaluations
      const { data: evalData, error: evalErr } = await supabase
        .from('weekly_evaluations')
        .select('*')
        .order('created_at', { ascending: false });
      if (evalErr) console.warn('Supabase weekly_evaluations query:', evalErr.message);

      // 7. Daily journals
      const { data: journalData, error: journalErr } = await supabase
        .from('daily_journals')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      if (journalErr) console.warn('Supabase daily_journals query:', journalErr.message);

      // Direct state update from database query
      updateState((prev) => {
        const profiles = buildProfilesShape(profileData || []);
        return {
          ...prev,
          profiles,
          habits: habitsData || [],
          habit_logs: logsData || [],
          daily_tasks: tasksData || [],
          agenda_events: agendaData || [],
          weekly_evaluations: (evalData || []).map(parseEvalItem),
          daily_journals: journalData || [],
        };
      });

      setConnectionStatus('connected');
    } catch (err) {
      console.error('Supabase load error:', err);
      setConnectionStatus('local');
    } finally {
      setIsLoading(false);
    }
  }, [userId, effectiveUserId, userEmail, currentUser?.user_metadata?.name, buildProfilesShape, updateState]);

  // ─── Realtime subscriptions & Periodic Background Sync ─────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !userId) {
      setConnectionStatus('local');
      return;
    }

    // Initial load
    loadFromSupabase();

    // Shared channel for both Khanif & Arum to get instant realtime events
    const channel = supabase
      .channel('ruang_bersama_couple_shared')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          updateState((prev) => ({
            ...prev,
            habits: [...(prev.habits || []).filter((h) => String(h.id) !== String(payload.new.id)), payload.new],
          }));
        } else if (payload.eventType === 'UPDATE') {
          updateState((prev) => ({
            ...prev,
            habits: (prev.habits || []).map((h) => String(h.id) === String(payload.new.id) ? payload.new : h),
          }));
        } else if (payload.eventType === 'DELETE') {
          updateState((prev) => ({
            ...prev,
            habits: (prev.habits || []).filter((h) => String(h.id) !== String(payload.old.id)),
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          updateState((prev) => ({
            ...prev,
            habit_logs: [...(prev.habit_logs || []).filter((l) => String(l.id) !== String(payload.new.id)), payload.new],
          }));
        } else if (payload.eventType === 'DELETE') {
          updateState((prev) => ({
            ...prev,
            habit_logs: (prev.habit_logs || []).filter((l) => String(l.id) !== String(payload.old.id)),
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          updateState((prev) => ({
            ...prev,
            daily_tasks: [...(prev.daily_tasks || []).filter((t) => String(t.id) !== String(payload.new.id)), payload.new],
          }));
        } else if (payload.eventType === 'UPDATE') {
          updateState((prev) => ({
            ...prev,
            daily_tasks: (prev.daily_tasks || []).map((t) => String(t.id) === String(payload.new.id) ? payload.new : t),
          }));
        } else if (payload.eventType === 'DELETE') {
          updateState((prev) => ({
            ...prev,
            daily_tasks: (prev.daily_tasks || []).filter((t) => String(t.id) !== String(payload.old.id)),
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_events' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          updateState((prev) => ({
            ...prev,
            agenda_events: [...(prev.agenda_events || []).filter((e) => String(e.id) !== String(payload.new.id)), payload.new],
          }));
        } else if (payload.eventType === 'UPDATE') {
          updateState((prev) => ({
            ...prev,
            agenda_events: (prev.agenda_events || []).map((e) => String(e.id) === String(payload.new.id) ? payload.new : e),
          }));
        } else if (payload.eventType === 'DELETE') {
          updateState((prev) => ({
            ...prev,
            agenda_events: (prev.agenda_events || []).filter((e) => String(e.id) !== String(payload.old.id)),
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_evaluations' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const parsed = parseEvalItem(payload.new);
          updateState((prev) => {
            const idx = (prev.weekly_evaluations || []).findIndex(
              (e) => String(e.id) === String(parsed.id) || e.week_start === parsed.week_start || (e.year === parsed.year && e.month === parsed.month && e.week_number === parsed.week_number)
            );
            if (idx >= 0) {
              const updated = [...prev.weekly_evaluations];
              updated[idx] = parsed;
              return { ...prev, weekly_evaluations: updated };
            }
            return { ...prev, weekly_evaluations: [parsed, ...(prev.weekly_evaluations || [])] };
          });
        } else if (payload.eventType === 'DELETE') {
          updateState((prev) => ({
            ...prev,
            weekly_evaluations: (prev.weekly_evaluations || []).filter((e) => String(e.id) !== String(payload.old.id)),
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_journals' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          updateState((prev) => {
            const idx = (prev.daily_journals || []).findIndex(
              (j) => String(j.id) === String(payload.new.id) || (j.user_id === payload.new.user_id && j.date === payload.new.date)
            );
            if (idx >= 0) {
              const updated = [...prev.daily_journals];
              updated[idx] = payload.new;
              return { ...prev, daily_journals: updated };
            }
            return { ...prev, daily_journals: [payload.new, ...(prev.daily_journals || [])] };
          });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        }
        if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('local');
        }
      });

    channelRef.current = channel;

    // Periodic silent background sync every 8 seconds
    const intervalId = setInterval(() => {
      loadFromSupabase();
    }, 8000);

    // Sync on tab focus / visibility
    const handleFocus = () => {
      loadFromSupabase();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, loadFromSupabase, updateState]);

  // ─── Actions: Habits ────────────────────────────────────────

  const toggleHabitLog = useCallback(async (habitId, targetUserId, date = new Date().toISOString().split('T')[0]) => {
    const existingLog = (data.habit_logs || []).find(
      (l) => String(l.habit_id) === String(habitId) && String(l.user_id) === String(targetUserId) && l.completed_at === date
    );

    if (existingLog) {
      updateState((prev) => ({
        ...prev,
        habit_logs: (prev.habit_logs || []).filter((l) => String(l.id) !== String(existingLog.id)),
      }));
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('habit_logs').delete().eq('id', existingLog.id);
        if (error) console.error('Supabase delete habit_logs error:', error.message);
      }
    } else {
      const newLog = {
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        habit_id: habitId,
        user_id: targetUserId,
        completed_at: date,
        created_at: new Date().toISOString(),
      };
      updateState((prev) => ({
        ...prev,
        habit_logs: [...(prev.habit_logs || []), newLog],
      }));
      if (isSupabaseConfigured && supabase) {
        const { data: insData, error } = await supabase.from('habit_logs').insert({
          habit_id: habitId,
          user_id: targetUserId,
          completed_at: date,
        }).select();
        if (error) console.error('Supabase insert habit_logs error:', error.message);
        if (insData && insData[0]) {
          updateState((prev) => ({
            ...prev,
            habit_logs: (prev.habit_logs || []).map((l) => l.id === newLog.id ? insData[0] : l),
          }));
        }
      }
    }
  }, [data.habit_logs, updateState]);

  const addHabit = useCallback(async (newHabitData) => {
    if (isSupabaseConfigured && supabase) {
      // Guarantee profile presence
      if (effectiveUserId && isUuid(effectiveUserId)) {
        const pEmail = userEmail || (String(effectiveUserId).startsWith('1111') ? 'khanif@gmail.com' : 'arum@gmail.com');
        const pName = currentUser?.user_metadata?.name || (pEmail.includes('khanif') ? 'Khanif' : 'Arum');
        await supabase.from('profiles').upsert({
          id: effectiveUserId,
          couple_id: DEFAULT_COUPLE_ID,
          email: pEmail,
          name: pName,
          role: 'partner',
        });
      }

      const { data: insData, error } = await supabase.from('habits').insert({
        user_id: effectiveUserId,
        couple_id: DEFAULT_COUPLE_ID,
        title: newHabitData.title,
        category: newHabitData.category || 'Kesehatan',
        icon: newHabitData.icon || '🌿',
        frequency: newHabitData.frequency || 'daily',
        color: newHabitData.color || 'pink',
      }).select();

      if (error) {
        console.error('Supabase insert habits error:', error.message);
      } else if (insData && insData[0]) {
        updateState((prev) => {
          const exists = (prev.habits || []).some((h) => String(h.id) === String(insData[0].id));
          if (exists) return prev;
          return {
            ...prev,
            habits: [...(prev.habits || []), insData[0]],
          };
        });
        return;
      }
    }

    // Local fallback
    const tempId = `h-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const habitObj = {
      id: tempId,
      user_id: effectiveUserId,
      couple_id: DEFAULT_COUPLE_ID,
      frequency: 'daily',
      icon: newHabitData.icon || '🌿',
      is_active: true,
      created_at: new Date().toISOString(),
      ...newHabitData,
    };
    updateState((prev) => ({
      ...prev,
      habits: [...(prev.habits || []), habitObj],
    }));
  }, [effectiveUserId, userEmail, currentUser?.user_metadata?.name, updateState]);

  const editHabit = useCallback(async (habitId, updatedHabitData) => {
    updateState((prev) => ({
      ...prev,
      habits: (prev.habits || []).map((h) => String(h.id) === String(habitId) ? { ...h, ...updatedHabitData } : h),
    }));
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('habits').update({
        title: updatedHabitData.title,
        category: updatedHabitData.category,
        icon: updatedHabitData.icon,
        frequency: updatedHabitData.frequency || 'daily',
        color: updatedHabitData.color || 'pink',
      }).eq('id', habitId);
      if (error) console.error('Supabase update habits error:', error.message);
    }
  }, [updateState]);

  const deleteHabit = useCallback(async (habitId) => {
    updateState((prev) => ({
      ...prev,
      habits: (prev.habits || []).filter((h) => String(h.id) !== String(habitId)),
      habit_logs: (prev.habit_logs || []).filter((l) => String(l.habit_id) !== String(habitId)),
    }));
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('habits').delete().eq('id', habitId);
      if (error) console.error('Supabase delete habits error:', error.message);
    }
  }, [updateState]);

  // ─── Actions: Daily Tasks (Kegiatan Harian) ──────────────────

  const addDailyTask = useCallback(async (taskData) => {
    if (isSupabaseConfigured && supabase) {
      // Guarantee profile presence
      if (effectiveUserId && isUuid(effectiveUserId)) {
        const pEmail = userEmail || (String(effectiveUserId).startsWith('1111') ? 'khanif@gmail.com' : 'arum@gmail.com');
        const pName = currentUser?.user_metadata?.name || (pEmail.includes('khanif') ? 'Khanif' : 'Arum');
        await supabase.from('profiles').upsert({
          id: effectiveUserId,
          couple_id: DEFAULT_COUPLE_ID,
          email: pEmail,
          name: pName,
          role: 'partner',
        });
      }

      const { data: insData, error } = await supabase.from('daily_tasks').insert({
        user_id: effectiveUserId,
        couple_id: DEFAULT_COUPLE_ID,
        title: taskData.title,
        date: taskData.date || new Date().toISOString().split('T')[0],
        time: taskData.time || '',
        is_completed: false,
      }).select();

      if (error) {
        console.error('Supabase insert daily_tasks error:', error.message);
      } else if (insData && insData[0]) {
        updateState((prev) => {
          const exists = (prev.daily_tasks || []).some((t) => String(t.id) === String(insData[0].id));
          if (exists) return prev;
          return {
            ...prev,
            daily_tasks: [...(prev.daily_tasks || []), insData[0]],
          };
        });
        return;
      }
    }

    // Local fallback
    const tempId = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const taskObj = {
      id: tempId,
      user_id: effectiveUserId,
      couple_id: DEFAULT_COUPLE_ID,
      title: taskData.title,
      date: taskData.date || new Date().toISOString().split('T')[0],
      time: taskData.time || '',
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      daily_tasks: [...(prev.daily_tasks || []), taskObj],
    }));
  }, [effectiveUserId, userEmail, currentUser?.user_metadata?.name, updateState]);

  const editDailyTask = useCallback(async (taskId, updatedTaskData) => {
    updateState((prev) => ({
      ...prev,
      daily_tasks: (prev.daily_tasks || []).map((t) => String(t.id) === String(taskId) ? { ...t, ...updatedTaskData } : t),
    }));
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('daily_tasks').update({
        title: updatedTaskData.title,
        date: updatedTaskData.date,
        time: updatedTaskData.time || '',
      }).eq('id', taskId);
      if (error) console.error('Supabase update daily_tasks error:', error.message);
    }
  }, [updateState]);

  const toggleDailyTask = useCallback(async (taskId, isCompleted) => {
    updateState((prev) => ({
      ...prev,
      daily_tasks: (prev.daily_tasks || []).map((t) => String(t.id) === String(taskId) ? { ...t, is_completed: isCompleted } : t),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('daily_tasks').update({ is_completed: isCompleted }).eq('id', taskId);
      if (error) console.error('Supabase update daily_tasks error:', error.message);
    }
  }, [updateState]);

  const deleteDailyTask = useCallback(async (taskId) => {
    updateState((prev) => ({
      ...prev,
      daily_tasks: (prev.daily_tasks || []).filter((t) => String(t.id) !== String(taskId)),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
      if (error) console.error('Supabase delete daily_tasks error:', error.message);
    }
  }, [updateState]);

  // ─── Actions: Agenda Events ─────────────────────────────────

  const addAgendaEvent = useCallback(async (eventData) => {
    const tempId = `e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newEvt = {
      id: tempId,
      couple_id: DEFAULT_COUPLE_ID,
      created_by: effectiveUserId,
      color_tag: eventData.category === 'together' ? 'pink' : 'stone',
      time: eventData.time || '',
      created_at: new Date().toISOString(),
      ...eventData,
    };

    updateState((prev) => ({
      ...prev,
      agenda_events: [...(prev.agenda_events || []), newEvt],
    }));

    if (isSupabaseConfigured && supabase) {
      // Guarantee profile presence
      if (effectiveUserId && isUuid(effectiveUserId)) {
        const pEmail = userEmail || (String(effectiveUserId).startsWith('1111') ? 'khanif@gmail.com' : 'arum@gmail.com');
        const pName = currentUser?.user_metadata?.name || (pEmail.includes('khanif') ? 'Khanif' : 'Arum');
        await supabase.from('profiles').upsert({
          id: effectiveUserId,
          couple_id: DEFAULT_COUPLE_ID,
          email: pEmail,
          name: pName,
          role: 'partner',
        });
      }

      const { data: insData, error } = await supabase.from('agenda_events').insert({
        couple_id: DEFAULT_COUPLE_ID,
        title: eventData.title,
        date: eventData.date,
        category: eventData.category,
        created_by: effectiveUserId,
        color_tag: newEvt.color_tag,
        notes: eventData.notes || '',
        time: eventData.time || '',
      }).select();

      if (error) {
        console.error('Supabase insert agenda_events error:', error.message);
      } else if (insData && insData[0]) {
        updateState((prev) => ({
          ...prev,
          agenda_events: (prev.agenda_events || []).map((e) => e.id === tempId ? insData[0] : e),
        }));
      }
    }
  }, [effectiveUserId, userEmail, currentUser?.user_metadata?.name, updateState]);

  const editAgendaEvent = useCallback(async (eventId, updatedEventData) => {
    updateState((prev) => ({
      ...prev,
      agenda_events: (prev.agenda_events || []).map((e) => String(e.id) === String(eventId) ? { ...e, ...updatedEventData } : e),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('agenda_events').update({
        title: updatedEventData.title,
        date: updatedEventData.date,
        category: updatedEventData.category,
        notes: updatedEventData.notes || '',
        time: updatedEventData.time || '',
        color_tag: updatedEventData.category === 'together' ? 'pink' : 'stone',
      }).eq('id', eventId);
      if (error) console.error('Supabase update agenda_events error:', error.message);
    }
  }, [updateState]);

  const deleteAgendaEvent = useCallback(async (eventId) => {
    updateState((prev) => ({
      ...prev,
      agenda_events: (prev.agenda_events || []).filter((e) => String(e.id) !== String(eventId)),
    }));
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('agenda_events').delete().eq('id', eventId);
      if (error) console.error('Supabase delete agenda_events error:', error.message);
    }
  }, [updateState]);

  // ─── Actions: Weekly Reflection ─────────────────────────────

  const saveWeeklyReflection = useCallback(async (reflectionPayload) => {
    const now = new Date();
    const month = reflectionPayload.month !== undefined ? Number(reflectionPayload.month) : now.getMonth();
    const year = reflectionPayload.year ? Number(reflectionPayload.year) : now.getFullYear();
    const week_number = reflectionPayload.week_number ? Number(reflectionPayload.week_number) : 1;
    const tempId = reflectionPayload.id || `we-${year}-${month}-${week_number}`;
    const startDay = String(Math.min(28, (week_number - 1) * 7 + 1)).padStart(2, '0');
    const week_start = `${year}-${String(month + 1).padStart(2, '0')}-${startDay}`;

    let localExisting = null;

    updateState((prev) => {
      const evals = prev.weekly_evaluations || [];
      const existingIdx = evals.findIndex((e) => 
        String(e.id) === String(tempId) || (e.year === year && e.month === month && e.week_number === week_number) || e.week_start === week_start
      );

      const existing = evals[existingIdx] || {
        id: tempId,
        couple_id: DEFAULT_COUPLE_ID,
        year,
        month,
        week_number,
        week_start,
        reflection_user_1: '',
        reflection_user_2: '',
        goals_next_week: '',
        created_at: new Date().toISOString(),
      };

      localExisting = existing;

      const updated = {
        ...existing,
        year,
        month,
        week_number,
        week_start,
        reflection_user_1: reflectionPayload.isUser1
          ? reflectionPayload.reflectionText
          : (reflectionPayload.reflection_user_1 !== undefined ? reflectionPayload.reflection_user_1 : existing.reflection_user_1),
        reflection_user_2: !reflectionPayload.isUser1
          ? reflectionPayload.reflectionText
          : (reflectionPayload.reflection_user_2 !== undefined ? reflectionPayload.reflection_user_2 : existing.reflection_user_2),
        goals_next_week: reflectionPayload.goals_next_week !== undefined && reflectionPayload.goals_next_week !== ''
          ? reflectionPayload.goals_next_week
          : existing.goals_next_week,
        updated_at: new Date().toISOString(),
      };

      const newEvals = [...evals];
      if (existingIdx >= 0) {
        newEvals[existingIdx] = updated;
      } else {
        newEvals.unshift(updated);
      }

      return { ...prev, weekly_evaluations: newEvals };
    });

    if (isSupabaseConfigured && supabase) {
      let dbExisting = null;
      try {
        const { data: dbRows } = await supabase
          .from('weekly_evaluations')
          .select('*')
          .eq('couple_id', DEFAULT_COUPLE_ID)
          .eq('week_start', week_start)
          .limit(1);
        if (dbRows && dbRows.length > 0) {
          dbExisting = dbRows[0];
        }
      } catch (err) {
        console.warn('Supabase query weekly_evaluations error:', err);
      }

      const finalU1 = reflectionPayload.isUser1
        ? reflectionPayload.reflectionText
        : (dbExisting?.reflection_user_1 ?? localExisting?.reflection_user_1 ?? '');

      const finalU2 = !reflectionPayload.isUser1
        ? reflectionPayload.reflectionText
        : (dbExisting?.reflection_user_2 ?? localExisting?.reflection_user_2 ?? '');

      const finalGoals = (reflectionPayload.goals_next_week !== undefined && reflectionPayload.goals_next_week !== '')
        ? reflectionPayload.goals_next_week
        : (dbExisting?.goals_next_week ?? localExisting?.goals_next_week ?? '');

      const upsertData = {
        couple_id: DEFAULT_COUPLE_ID,
        week_start,
        reflection_user_1: finalU1,
        reflection_user_2: finalU2,
        goals_next_week: finalGoals,
        updated_at: new Date().toISOString(),
      };

      const { data: insData, error } = await supabase.from('weekly_evaluations').upsert(upsertData, { onConflict: 'couple_id,week_start' }).select();
      if (error) {
        console.error('Supabase upsert weekly_evaluations error:', error.message);
      } else if (insData && insData[0]) {
        const parsed = parseEvalItem(insData[0]);
        updateState((prev) => ({
          ...prev,
          weekly_evaluations: (prev.weekly_evaluations || []).map((e) =>
            (e.year === year && e.month === month && e.week_number === week_number) || e.id === tempId || e.week_start === week_start
              ? parsed
              : e
          ),
        }));
      }
    }
  }, [updateState]);

  const deleteWeeklyReflection = useCallback(async (evalId) => {
    updateState((prev) => ({
      ...prev,
      weekly_evaluations: (prev.weekly_evaluations || []).filter((e) => String(e.id) !== String(evalId)),
    }));
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('weekly_evaluations').delete().eq('id', evalId);
      if (error) console.error('Supabase delete weekly_evaluations error:', error.message);
    }
  }, [updateState]);

  const saveDailyJournal = useCallback(async (content, date = new Date().toISOString().split('T')[0]) => {
    const targetUserId = effectiveUserId || userId || (userEmail?.includes('khanif') ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222');
    const journalObj = {
      id: `j-${Date.now()}`,
      user_id: targetUserId,
      couple_id: DEFAULT_COUPLE_ID,
      date,
      content,
      updated_at: new Date().toISOString(),
    };

    updateState((prev) => {
      const idx = (prev.daily_journals || []).findIndex(
        (j) => (String(j.user_id) === String(targetUserId) || String(j.user_id) === String(currentUser?.id) || String(j.user_id) === String(userId)) && j.date === date
      );
      const newJournals = [...(prev.daily_journals || [])];
      if (idx >= 0) {
        newJournals[idx] = { ...newJournals[idx], content, updated_at: journalObj.updated_at };
      } else {
        newJournals.unshift(journalObj);
      }
      return { ...prev, daily_journals: newJournals };
    });

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('daily_journals').upsert({
        user_id: targetUserId,
        couple_id: DEFAULT_COUPLE_ID,
        date,
        content,
      }, { onConflict: 'user_id,date' });

      if (error) console.error('Supabase upsert daily_journals error:', error.message);
    }
  }, [effectiveUserId, userId, userEmail, currentUser?.id, updateState]);

  // Clear state when user logs out
  const clearUserState = useCallback(() => {
    setData(getInitialState());
  }, []);

  return {
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
    deleteAgendaEvent,
    saveWeeklyReflection,
    deleteWeeklyReflection,
    saveDailyJournal,
    clearUserState,
    loadFromSupabase,
  };
};
