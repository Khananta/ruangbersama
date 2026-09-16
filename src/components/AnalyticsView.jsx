'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  Award, 
  Zap, 
  Target, 
  BrainCircuit, 
  ShieldCheck, 
  Clock, 
  Activity, 
  ArrowUpRight,
  ChevronRight,
  Flame,
  Lightbulb,
  Check
} from 'lucide-react';
import { LOCAL_PROFILES } from '../lib/supabaseClient';

// Helper: Format Date object to local YYYY-MM-DD string
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

export const AnalyticsView = ({
  habits = [],
  habitLogs = [],
  dailyTasks = [],
  collegeAssignments = [],
  currentUser,
  profiles,
}) => {
  const [timeRange, setTimeRange] = useState(7); // 7, 14, 30 days

  const userEmail = currentUser?.email?.toLowerCase() || '';
  const myId = currentUser?.id || null;
  const isKhanif = userEmail.includes('khanif');

  // Resolve profiles
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

  // Filter helper functions
  const isMyItem = (item) => {
    const uid = String(item.user_id || item.created_by || '');
    return (effectiveMyId && uid === String(effectiveMyId)) ||
           (myProfile?.id && uid === String(myProfile.id)) ||
           (isKhanif && (uid === 'e258766b-78f3-43e0-8901-0ae225c75cc3' || uid.includes('khanif') || uid.startsWith('1111'))) ||
           (!isKhanif && (uid === 'afc77284-caab-413b-be18-38f14ca07fc2' || uid.includes('arum') || uid.startsWith('2222')));
  };

  // Generate date list for the selected timeframe
  const dateRangeList = useMemo(() => {
    const list = [];
    const today = new Date();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const str = toLocalDateString(d);
      list.push({
        dateStr: str,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
      });
    }
    return list;
  }, [timeRange]);

  // Habits breakdown
  const myHabits = useMemo(() => (habits || []).filter(isMyItem), [habits, effectiveMyId, myProfile?.id, isKhanif]);
  const partnerHabits = useMemo(() => (habits || []).filter((h) => !isMyItem(h)), [habits, effectiveMyId, myProfile?.id, isKhanif]);

  // Calculate Habit metrics in timeframe
  const habitAnalytics = useMemo(() => {
    const datesSet = new Set(dateRangeList.map((d) => d.dateStr));
    const relevantLogs = (habitLogs || []).filter((l) => datesSet.has(l.completed_at));

    // My logs & Partner logs
    const myLogs = relevantLogs.filter((l) => isMyItem(l));
    const partnerLogs = relevantLogs.filter((l) => !isMyItem(l));

    const totalPossibleMy = myHabits.length * timeRange;
    const totalPossiblePartner = partnerHabits.length * timeRange;

    const myRate = totalPossibleMy > 0 ? Math.round((myLogs.length / totalPossibleMy) * 100) : 0;
    const partnerRate = totalPossiblePartner > 0 ? Math.round((partnerLogs.length / totalPossiblePartner) * 100) : 0;
    const combinedRate = (totalPossibleMy + totalPossiblePartner) > 0 
      ? Math.round(((myLogs.length + partnerLogs.length) / (totalPossibleMy + totalPossiblePartner)) * 100)
      : 0;

    // Daily breakdown for visual chart
    const dailyChart = dateRangeList.map((d) => {
      const myCount = myLogs.filter((l) => l.completed_at === d.dateStr).length;
      const partnerCount = partnerLogs.filter((l) => l.completed_at === d.dateStr).length;
      const myPct = myHabits.length > 0 ? Math.round((myCount / myHabits.length) * 100) : 0;
      const partnerPct = partnerHabits.length > 0 ? Math.round((partnerCount / partnerHabits.length) * 100) : 0;

      return {
        ...d,
        myCount,
        partnerCount,
        myPct,
        partnerPct,
      };
    });

    // Per-habit breakdown (Strengths vs Remedials)
    const habitStats = (myHabits || []).map((h) => {
      const compCount = myLogs.filter((l) => String(l.habit_id) === String(h.id)).length;
      const rate = timeRange > 0 ? Math.round((compCount / timeRange) * 100) : 0;
      return {
        ...h,
        completionCount: compCount,
        rate,
      };
    }).sort((a, b) => b.rate - a.rate);

    return {
      myRate,
      partnerRate,
      combinedRate,
      dailyChart,
      habitStats,
      myCompletedTotal: myLogs.length,
      partnerCompletedTotal: partnerLogs.length,
    };
  }, [dateRangeList, habitLogs, myHabits, partnerHabits, timeRange, effectiveMyId, myProfile?.id, isKhanif]);

  // Calculate Daily Tasks & Assignments metrics
  const taskAnalytics = useMemo(() => {
    const datesSet = new Set(dateRangeList.map((d) => d.dateStr));
    const relevantTasks = (dailyTasks || []).filter((t) => datesSet.has(t.date || t.task_date));

    const myTasks = relevantTasks.filter(isMyItem);
    const partnerTasks = relevantTasks.filter((t) => !isMyItem(t));

    const myDone = myTasks.filter((t) => t.is_completed).length;
    const partnerDone = partnerTasks.filter((t) => t.is_completed).length;

    const myTaskRate = myTasks.length > 0 ? Math.round((myDone / myTasks.length) * 100) : 0;
    const partnerTaskRate = partnerTasks.length > 0 ? Math.round((partnerDone / partnerTasks.length) * 100) : 0;

    // College assignments
    const totalAssignments = (collegeAssignments || []).length;
    const doneAssignments = (collegeAssignments || []).filter((a) => a.is_completed).length;
    const assignmentRate = totalAssignments > 0 ? Math.round((doneAssignments / totalAssignments) * 100) : 0;

    return {
      myTotal: myTasks.length,
      myDone,
      myRate: myTaskRate,
      partnerTotal: partnerTasks.length,
      partnerDone,
      partnerRate: partnerTaskRate,
      totalAssignments,
      doneAssignments,
      assignmentRate,
    };
  }, [dateRangeList, dailyTasks, collegeAssignments, effectiveMyId, myProfile?.id, isKhanif]);

  // Overall Productivity & Consistency Score (0 - 100)
  const expertScore = useMemo(() => {
    const habitWeight = 0.55;
    const taskWeight = 0.30;
    const assignmentWeight = 0.15;

    const score = Math.round(
      (habitAnalytics.combinedRate * habitWeight) +
      (taskAnalytics.myRate * taskWeight) +
      (taskAnalytics.assignmentRate * assignmentWeight)
    );
    return Math.min(100, Math.max(0, score || 78));
  }, [habitAnalytics.combinedRate, taskAnalytics.myRate, taskAnalytics.assignmentRate]);

  // Expert diagnosis diagnosis generator
  const expertDiagnosis = useMemo(() => {
    if (expertScore >= 85) {
      return {
        level: 'Sangat Prima (Peak Performance)',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        summary: `Ritme kebiasaan Khanif & ${partnerProfile.name} berada pada level yang sangat solid dan konsisten. Kalian berhasil menjaga momentum harian dengan sangat baik dan memiliki koordinasi to-do yang efisien.`,
        recommendation: 'Pertahankan sistem micro-habits ini. Mulai tambahkan tantangan baru berdua secara bertahap tanpa mengorbankan waktu istirahat yang berkualitas.',
      };
    } else if (expertScore >= 70) {
      return {
        level: 'Konsisten & Bertumbuh (Solid Momentum)',
        badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
        summary: `Konsistensi kebiasaan dan kegiatan harian berdua berjalan dengan stabil. Terdapat sedikit fluktuasi pada hari-hari tertentu, namun kembalinya ritme (bounce-back rate) tergolong cepat.`,
        recommendation: 'Gunakan teknik Habit Stacking (menautkan kebiasaan baru tepat setelah kebiasaan rutin yang sudah kuat) untuk mempercepat pembiasaan tugas yang masih sering terlewat.',
      };
    } else {
      return {
        level: 'Perlu Penyesuaian Beban (Adjustment Needed)',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        summary: `Terdeteksi beberapa hambatan konsistensi, terutama saat jadwal perkuliahan atau to-do menumpuk. Ini adalah respons wajar saat energi terbagi ke banyak prioritas.`,
        recommendation: 'Fokuskan energi pada 2 habit inti (Core Habits) terlebih dahulu. Hindari membuat to-do harian yang terlalu padat agar tidak terjadi burnout.',
      };
    }
  }, [expertScore, partnerProfile.name]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* ── Top Header Card with Icon ── */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900">
                Analitik & Diagnosa Pakar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                Expert Insight
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Evaluasi mendalam perilaku kebiasaan, ritme to-do harian, dan rekomendasi taktis berdua.
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/70 text-xs font-semibold self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === 7
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setTimeRange(14)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === 14
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            14 Hari
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === 30
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            30 Hari
          </button>
        </div>
      </div>

      {/* ── 4 Top KPI Score Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Expert Index */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Indeks Konsistensi
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              Top Tier
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{expertScore}%</span>
            <span className="text-xs text-stone-400 font-medium">skor komposit</span>
          </div>
          <p className="text-[11px] text-stone-500 line-clamp-1">
            {expertDiagnosis.level}
          </p>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-sky-600 rounded-full" style={{ width: `${expertScore}%` }} />
          </div>
        </div>

        {/* KPI 2: Habit Completion Rate */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-600" /> Habit Berdua
            </span>
            <span className="text-xs font-bold text-stone-600">
              {habitAnalytics.combinedRate}%
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs text-stone-600">
            <span>Kamu: <strong className="text-stone-900">{habitAnalytics.myRate}%</strong></span>
            <span>{partnerProfile.name}: <strong className="text-stone-900">{habitAnalytics.partnerRate}%</strong></span>
          </div>
          <p className="text-[11px] text-stone-400">
            {habitAnalytics.myCompletedTotal + habitAnalytics.partnerCompletedTotal} total habit tercentang
          </p>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${habitAnalytics.combinedRate}%` }} />
          </div>
        </div>

        {/* KPI 3: To-Do & Kegiatan Harian */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> To-Do Selesai
            </span>
            <span className="text-xs font-bold text-stone-600">
              {taskAnalytics.myRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{taskAnalytics.myDone}</span>
            <span className="text-xs text-stone-400">/ {taskAnalytics.myTotal} tugas harian</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Tingkat penyelesaian to-do harian
          </p>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-sky-600 rounded-full" style={{ width: `${taskAnalytics.myRate}%` }} />
          </div>
        </div>

        {/* KPI 4: Tugas Kuliah & Deadlines */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-sky-600" /> Tugas Kuliah
            </span>
            <span className="text-xs font-bold text-stone-600">
              {taskAnalytics.assignmentRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{taskAnalytics.doneAssignments}</span>
            <span className="text-xs text-stone-400">/ {taskAnalytics.totalAssignments} selesai</span>
          </div>
          <p className="text-[11px] text-stone-400">
            {taskAnalytics.totalAssignments - taskAnalytics.doneAssignments} deadline masih berjalan
          </p>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-sky-600 rounded-full" style={{ width: `${taskAnalytics.assignmentRate}%` }} />
          </div>
        </div>

      </div>

      {/* ── Main Bento 2-Col Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Expert Evaluation & Visual Comparison */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Expert Diagnosis Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base leading-tight">
                    Rangkuman Diagnosa Pakar Perilaku
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Sintesis algoritma performa habit & kegiatan {timeRange} hari terakhir
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${expertDiagnosis.badgeColor}`}>
                {expertDiagnosis.level}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
              <p className="text-xs text-stone-800 leading-relaxed font-medium">
                {expertDiagnosis.summary}
              </p>
            </div>

            {/* Rekomendasi Taktis */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Rekomendasi Taktis Minggu Ini:
              </span>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {expertDiagnosis.recommendation}
              </p>
            </div>
          </div>

          {/* 2. Visual Daily Trend Comparison Chart (Kamu vs Pasangan) */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base leading-tight">
                    Tren Performa Habit Harian
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Evaluasi komparasi konsistensi {timeRange} hari terakhir
                  </p>
                </div>
              </div>

              {/* Legend & Average Comparison Pill */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                  <span>Kamu ({habitAnalytics.myRate}%)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-500 shrink-0" />
                  <span>{partnerProfile.name} ({habitAnalytics.partnerRate}%)</span>
                </div>
              </div>
            </div>

            {/* Chart Area with Y-Axis Background Grid Lines */}
            <div className="relative pt-6 pb-2">
              
              {/* Background Reference Grid Lines (0%, 25%, 50%, 75%, 100%) */}
              <div className="absolute inset-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none z-0">
                <div className="border-b border-stone-100 w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-stone-300 bg-white pr-1">100%</span>
                  <span className="text-[9px] font-semibold text-stone-300">Target Maksimal</span>
                </div>
                <div className="border-b border-dashed border-stone-100 w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-stone-300 bg-white pr-1">75%</span>
                </div>
                <div className="border-b border-stone-100 w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-stone-300 bg-white pr-1">50%</span>
                </div>
                <div className="border-b border-dashed border-stone-100 w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-stone-300 bg-white pr-1">25%</span>
                </div>
                <div className="border-b border-stone-200 w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-stone-400 bg-white pr-1">0%</span>
                </div>
              </div>

              {/* Interactive Dual Bars */}
              <div className="relative z-10 flex items-end justify-between gap-1.5 sm:gap-3 h-52 pt-4 px-2">
                {habitAnalytics.dailyChart.map((d, idx) => {
                  const isBestDay = Math.max(d.myPct, d.partnerPct) === 100;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer"
                    >
                      {/* Interactive Floating Hover Popover */}
                      <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-40 pointer-events-none animate-fade-in">
                        <div className="p-2.5 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white text-[11px] shadow-2xl border border-stone-700 min-w-[140px] space-y-1">
                          <div className="flex items-center justify-between border-b border-stone-700 pb-1">
                            <span className="font-bold text-sky-300">{d.dayName}, {d.dayNum}/{d.monthNum}</span>
                            {isBestDay && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">100% ⭐</span>}
                          </div>
                          <div className="flex items-center justify-between text-stone-200">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Kamu:</span>
                            <span className="font-bold text-sky-300">{d.myPct}% ({d.myCount} habit)</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-300">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-stone-400" /> {partnerProfile.name}:</span>
                            <span className="font-bold">{d.partnerPct}% ({d.partnerCount} habit)</span>
                          </div>
                        </div>
                        <div className="border-4 border-transparent border-t-stone-900/95 -mt-0.5" />
                      </div>

                      {/* Dual Bars Container */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36 bg-stone-50/50 rounded-2xl p-1 border border-stone-100 group-hover:border-sky-300 transition-colors">
                        
                        {/* Bar 1: Kamu (Sky) */}
                        <div className="flex-1 max-w-[16px] bg-sky-100/70 rounded-xl relative h-full flex items-end overflow-hidden">
                          <div
                            className="w-full bg-sky-600 group-hover:bg-sky-500 rounded-xl transition-all duration-700 shadow-sm"
                            style={{ height: `${Math.max(6, (d.myPct / 100) * 100)}%` }}
                          />
                        </div>

                        {/* Bar 2: Pasangan (Stone) */}
                        <div className="flex-1 max-w-[16px] bg-stone-200/70 rounded-xl relative h-full flex items-end overflow-hidden">
                          <div
                            className="w-full bg-stone-500 group-hover:bg-stone-600 rounded-xl transition-all duration-700 shadow-sm"
                            style={{ height: `${Math.max(6, (d.partnerPct / 100) * 100)}%` }}
                          />
                        </div>

                      </div>

                      {/* Day Label Pill below bar */}
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-stone-700 group-hover:text-sky-600 transition-colors">
                          {d.dayNum}
                        </span>
                        <span className="text-[9px] font-semibold text-stone-400 uppercase">
                          {d.dayName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Insight Footer */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-medium">
                <span className="text-base">💡</span>
                <span>
                  Tingkat konsistensi rata-rata berdua: <strong className="text-sky-700 font-bold">{habitAnalytics.combinedRate}%</strong>
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                Arahkan kursor ke tiap batang untuk melihat detail persentase
              </span>
            </div>
          </div>

          {/* 3. 3 Langkah Aksi Taktis (Actionable Framework) */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" />
              <span>3 Protokol Peningkatan Konsistensi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xl">🔗</span>
                <h4 className="text-xs font-bold text-stone-900">1. Habit Stacking</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Tempelkan kebiasaan belajar / baca 15 menit tepat setelah mandi pagi atau minum teh.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xl">⏱️</span>
                <h4 className="text-xs font-bold text-stone-900">2. Buffer 2 Jam</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Selesaikan tugas kuliah minimal 2 jam sebelum tenggat waktu resmi untuk mencegah stres.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xl">💌</span>
                <h4 className="text-xs font-bold text-stone-900">3. Check-In Malam</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Manfaatkan Pesan Singkat Harian untuk saling mengapresiasi pencapaian kecil setiap malam.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Strengths, Remedials & Badges */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. Habit Strengths & Remedial List */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base leading-tight">
                Peringkat Habit Kamu
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Berdasarkan tingkat penyelesaian {timeRange} hari
              </p>
            </div>

            <div className="space-y-2.5">
              {habitAnalytics.habitStats.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">
                  Belum ada data habit untuk dianalisis
                </p>
              ) : (
                habitAnalytics.habitStats.map((h, idx) => (
                  <div
                    key={h.id || idx}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-base shrink-0">{h.icon || '🌿'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-stone-800 truncate" title={h.title}>
                          {h.title}
                        </p>
                        <span className="text-[10px] text-stone-400">
                          {h.completionCount}/{timeRange} hari
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        h.rate >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : h.rate >= 50
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {h.rate}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Couple Synergy Badges */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Badge Pencapaian Bersama
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Apresiasi konsistensi Ruang Bersama</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white text-lg shrink-0">
                  🏆
                </div>
                <div>
                  <h4 className="text-xs font-bold text-sky-900">Power Duo Level 4</h4>
                  <p className="text-[10px] text-sky-700/80 mt-0.5">Saling mengisi habit dan mencatat kegiatan</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 text-lg shrink-0">
                  🎓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Academic Master</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Tugas kuliah tercatat & terpantau rapi</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 text-lg shrink-0">
                  💌
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Affection Keepers</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Aktif bertukar pesan penyemangat harian</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
