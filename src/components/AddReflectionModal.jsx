'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, MessageSquare, Target, Calendar } from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKS = [
  { value: 1, label: 'Minggu ke-1' },
  { value: 2, label: 'Minggu ke-2' },
  { value: 3, label: 'Minggu ke-3' },
  { value: 4, label: 'Minggu ke-4' },
  { value: 5, label: 'Minggu ke-5' },
];

export const AddReflectionModal = ({
  isOpen,
  onClose,
  onSaveReflection,
  initialData = null,
  isUser1 = true,
  userName = 'Kamu',
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(initialData?.month ?? currentMonth);
  const [year, setYear] = useState(initialData?.year ?? currentYear);
  const [weekNumber, setWeekNumber] = useState(initialData?.week_number ?? 1);
  const [reflectionText, setReflectionText] = useState(
    isUser1 ? (initialData?.reflection_user_1 || '') : (initialData?.reflection_user_2 || '')
  );
  const [goalsText, setGoalsText] = useState(initialData?.goals_next_week || '');

  useEffect(() => {
    if (initialData) {
      setMonth(initialData.month ?? currentMonth);
      setYear(initialData.year ?? currentYear);
      setWeekNumber(initialData.week_number ?? 1);
      setReflectionText(isUser1 ? (initialData.reflection_user_1 || '') : (initialData.reflection_user_2 || ''));
      setGoalsText(initialData.goals_next_week || '');
    } else {
      setMonth(currentMonth);
      setYear(currentYear);
      setWeekNumber(1);
      setReflectionText('');
      setGoalsText('');
    }
  }, [initialData, isUser1, currentMonth, currentYear]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    onSaveReflection({
      id: initialData?.id,
      month: Number(month),
      year: Number(year),
      week_number: Number(weekNumber),
      isUser1,
      reflectionText: reflectionText.trim(),
      reflection_user_1: isUser1 ? reflectionText.trim() : (initialData?.reflection_user_1 || ''),
      reflection_user_2: !isUser1 ? reflectionText.trim() : (initialData?.reflection_user_2 || ''),
      goals_next_week: goalsText.trim() || initialData?.goals_next_week || '',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              {initialData ? 'Edit Refleksi Mingguan' : 'Tambah Refleksi Mingguan'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Tulis evaluasi dan apresiasi untuk minggu ini</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4" id="add-reflection-form">

            {/* Bulan & Minggu Keberapa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Bulan</span>
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx} value={idx}>{m} {year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Minggu ke berapa?
                </label>
                <select
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
                >
                  {WEEKS.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refleksi Kamu */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>Refleksi {userName}</span>
              </label>
              <textarea
                required
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Bagaimana perasaanmu di minggu ini? Hal apa yang kamu syukuri bersama pasanganmu?..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white transition-all font-sans resize-none"
              />
            </div>

            {/* Target & Goals Bersama */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-sky-600" />
                <span>Target & Goals Bersama (Opsional)</span>
              </label>
              <textarea
                value={goalsText}
                onChange={(e) => setGoalsText(e.target.value)}
                placeholder="Target bersama untuk minggu berikutnya (misal: lebih rutin olahraga, call tiap malam)..."
                rows={2}
                className="w-full p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white transition-all font-sans resize-none"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors font-sans"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-reflection-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan Refleksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
