'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Sparkles } from 'lucide-react';

const QUICK_CHEERS = [
  'Semangat ya hari ini! ❤️',
  'Jangan lupa makan & minum air 🍱',
  'Proud of you selalu! ✨',
  'Kangen kamu 🥰',
  'Semoga harimu lancar & indah! 🌸',
  'Fokus dan tenang, kamu pasti bisa! 💪',
];

export const DailyMessageModal = ({
  isOpen,
  onClose,
  onSave,
  initialContent = '',
  partnerName = 'Pasangan',
  selectedDateStr,
  isToday = true,
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent || '');
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    onSave(content.trim(), selectedDateStr);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-bento border border-stone-200 relative animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                Pesan untuk {partnerName}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {isToday ? 'Kirim kata-kata manis atau penyemangat hari ini' : `Pesan untuk tanggal ${selectedDateStr}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick Cheer Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-sky-500" />
              Pesan Cepat (Pilih Cepat)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHEERS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setContent(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100/80 transition-colors text-left font-medium active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Isi Pesan
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Tulis pesan manis, doa, atau semangat untuk ${partnerName}...`}
              rows={4}
              maxLength={300}
              className="w-full p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all resize-none font-sans"
              autoFocus
            />
            <div className="flex justify-between items-center text-[10px] text-stone-400 px-1">
              <span>Pesan akan tampil di dashboard {partnerName}</span>
              <span>{content.length}/300</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{initialContent ? 'Simpan Perubahan' : 'Kirim Pesan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
