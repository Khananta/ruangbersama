'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Calendar, CheckSquare } from 'lucide-react';

export const AddDailyTaskModal = ({ isOpen, onClose, onAddTask, onEditTask, initialData = null, initialDate }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.time || '');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDate(initialData.date || initialDate || new Date().toISOString().split('T')[0]);
      setTime(initialData.time || '');
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTime('');
    }
  }, [initialData, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (initialData && onEditTask) {
      onEditTask(initialData.id, {
        title: title.trim(),
        date,
        time: time.trim(),
      });
    } else if (onAddTask) {
      onAddTask({
        title: title.trim(),
        date,
        time: time.trim(),
      });
    }

    setTitle('');
    setTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm font-sans animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sky-600" />
              {initialData ? 'Edit Kegiatan Harian' : 'Tambah Kegiatan Harian'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {initialData ? 'Perbarui jadwal atau detail kegiatan' : 'Catat daftar aktivitas atau to-do hari ini'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4" id="add-daily-task-form">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Nama Kegiatan / To-Do</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Belanja bahan masakan, Meeting project..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Tanggal</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Jam (opsional)</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors font-sans"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-daily-task-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan Kegiatan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
