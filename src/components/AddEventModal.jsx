'use client';

import React, { useState } from 'react';
import { X, Plus, Heart, User, Clock } from 'lucide-react';

export const AddEventModal = ({ isOpen, onClose, onAddEvent, onEditEvent, initialData = null, initialDate }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.time || '');
  const [category, setCategory] = useState(initialData?.category || 'together');
  const [notes, setNotes] = useState(initialData?.notes || '');

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDate(initialData.date || initialDate || new Date().toISOString().split('T')[0]);
      setTime(initialData.time || '');
      setCategory(initialData.category || 'together');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTime('');
      setCategory('together');
      setNotes('');
    }
  }, [initialData, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (initialData && onEditEvent) {
      onEditEvent(initialData.id, {
        title: title.trim(),
        date,
        time: time.trim(),
        category,
        notes: notes.trim(),
      });
    } else if (onAddEvent) {
      onAddEvent({
        title: title.trim(),
        date,
        time: time.trim(),
        category,
        notes: notes.trim(),
      });
    }

    setTitle('');
    setTime('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm font-sans animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              📅 {initialData ? 'Edit Agenda' : 'Tambah Agenda'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {initialData ? 'Perbarui jadwal kegiatan di kalender' : 'Agenda tersimpan di kalender bersama'}
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
          <form onSubmit={handleSubmit} className="space-y-4" id="add-event-form">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Judul Agenda</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Ketemu di Kafe, Ujian UTS, Call Malam..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
              />
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Tanggal</label>
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

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Tipe Agenda</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('together')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    category === 'together'
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-100 text-sky-800 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${category === 'together' ? 'text-sky-600' : 'text-stone-400'}`} />
                  <span className="text-xs">Agenda Bersama</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('personal')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    category === 'personal'
                      ? 'bg-stone-100 border-stone-400 ring-2 ring-stone-200 text-stone-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User className={`w-4 h-4 ${category === 'personal' ? 'text-stone-700' : 'text-stone-400'}`} />
                  <span className="text-xs">Jadwal Pribadi</span>
                </button>
              </div>
            </div>

            {/* Notes (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Catatan <span className="text-stone-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail tempat, link meeting, atau pengingat..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans resize-none"
              />
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
            form="add-event-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan Agenda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
