'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

// Emoji icon options — grouped for easy selection
const EMOJI_ICONS = [
  { emoji: '💧', label: 'Air / Minum' },
  { emoji: '🏃', label: 'Olahraga' },
  { emoji: '📖', label: 'Baca' },
  { emoji: '✍️', label: 'Jurnal' },
  { emoji: '🧘', label: 'Meditasi' },
  { emoji: '🌞', label: 'Pagi Hari' },
  { emoji: '🥗', label: 'Makan Sehat' },
  { emoji: '😴', label: 'Tidur Cukup' },
  { emoji: '💪', label: 'Gym' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '🌿', label: 'Growth' },
  { emoji: '❤️', label: 'Self Love' },
  { emoji: '🧹', label: 'Bersih-bersih' },
  { emoji: '📱', label: 'No Screen' },
  { emoji: '🙏', label: 'Ibadah' },
  { emoji: '☕', label: 'Morning Ritual' },
  { emoji: '🎨', label: 'Kreativitas' },
  { emoji: '🎵', label: 'Musik' },
];

const CATEGORIES = [
  { value: 'Kesehatan', label: '❤️ Kesehatan & Kebiasaan' },
  { value: 'Self Growth', label: '🌱 Self Growth & Belajar' },
  { value: 'Mindfulness', label: '🧘 Mindfulness & Jurnal' },
  { value: 'Produktivitas', label: '🎯 Produktivitas & Work' },
  { value: 'Ibadah', label: '🙏 Ibadah & Spiritual' },
];

export const AddHabitModal = ({ isOpen, onClose, onAddHabit, onEditHabit, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Kesehatan');
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || '🌿');
  const [customEmoji, setCustomEmoji] = useState('');

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'Kesehatan');
      setSelectedIcon(initialData.icon || '🌿');
      setCustomEmoji(initialData.icon || '');
    } else {
      setTitle('');
      setCategory('Kesehatan');
      setSelectedIcon('🌿');
      setCustomEmoji('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleCustomEmojiChange = (e) => {
    const val = e.target.value;
    setCustomEmoji(val);
    if (val.trim()) {
      setSelectedIcon(val.trim());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalIcon = (customEmoji.trim() || selectedIcon || '🌿');

    if (initialData && onEditHabit) {
      onEditHabit(initialData.id, {
        title: title.trim(),
        category,
        icon: finalIcon,
        frequency: initialData.frequency || 'daily',
      });
    } else if (onAddHabit) {
      onAddHabit({
        title: title.trim(),
        category,
        icon: finalIcon,
        frequency: 'daily',
      });
    }

    setTitle('');
    setSelectedIcon('🌿');
    setCustomEmoji('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm font-sans animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="text-2xl">{selectedIcon}</span>
              {initialData ? 'Edit Habit' : 'Tambah Habit Baru'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {initialData ? 'Perbarui detail habit rutinmu' : 'Habit akan tersimpan ke akunmu'}
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
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4" id="add-habit-form">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Nama Habit</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Minum Air Putih 2L, Baca Buku 15 Menit..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all font-sans appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Emoji Icon Custom Input & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Icon Habit
                </label>
                <span className="text-[11px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  Icon: {selectedIcon}
                </span>
              </div>

              {/* Custom Icon / Emoji text field */}
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-xl shrink-0">
                  {selectedIcon || '🌿'}
                </div>
                <input
                  type="text"
                  value={customEmoji}
                  onChange={handleCustomEmojiChange}
                  placeholder="Ketik emoji bebas di sini (cth: 🚀, 💻, 🐱)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              {/* Presets Grid */}
              <div className="pt-1">
                <p className="text-[10px] text-stone-400 font-semibold mb-1.5 uppercase tracking-wider">
                  Atau pilih dari preset cepat:
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {EMOJI_ICONS.map((item) => {
                    const isSelected = selectedIcon === item.emoji;
                    return (
                      <button
                        key={item.emoji}
                        type="button"
                        title={item.label}
                        onClick={() => {
                          setSelectedIcon(item.emoji);
                          setCustomEmoji(item.emoji);
                        }}
                        className={`h-9 w-full flex items-center justify-center rounded-xl border text-base transition-all ${
                          isSelected
                            ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-200 scale-105'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300'
                        }`}
                      >
                        {item.emoji}
                      </button>
                    );
                  })}
                </div>
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
            form="add-habit-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{initialData ? 'Simpan Perubahan' : 'Simpan Habit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
