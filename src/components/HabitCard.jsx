'use client';

import React from 'react';
import { Check, Trash2, Edit3, Lock } from 'lucide-react';

export const HabitCard = ({ 
  habit, 
  isCompleted, 
  onToggle, 
  onDelete, 
  onEdit, 
  canToggle = true,
  isToday = true 
}) => {
  const iconDisplay = habit.icon || '🌿';

  const handleCardClick = () => {
    if (canToggle) {
      onToggle(habit.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 font-sans ${
        isCompleted
          ? 'bg-sky-50/70 border-sky-200 shadow-sm'
          : canToggle
          ? 'bg-white border-stone-200 hover:border-sky-300 shadow-bento cursor-pointer'
          : 'bg-stone-50/80 border-stone-200/80 shadow-sm cursor-not-allowed opacity-80'
      }`}
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all text-lg ${
              isCompleted
                ? 'bg-sky-100 border border-sky-200'
                : 'bg-stone-100 group-hover:bg-sky-50'
            }`}
          >
            <span>{iconDisplay}</span>
          </div>

          {/* Text & Tooltip Container (Hover triggers tooltip for all habits) */}
          <div className="relative group/tooltip min-w-0 flex-1 py-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600 block truncate">
              {habit.category || 'Habit Harian'}
            </span>

            <h3
              className={`text-sm font-semibold transition-all truncate ${
                isCompleted ? 'line-through text-stone-400' : 'text-stone-800'
              }`}
            >
              {habit.title}
            </h3>

            {/* Floating Hover Tooltip: Muncul otomatis saat diarahkan ke teks/judul habit */}
            <div className="absolute left-0 bottom-full mb-2.5 z-50 w-max max-w-xs px-3.5 py-2 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white text-xs font-medium shadow-2xl border border-stone-700 pointer-events-none opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0">
              <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider mb-0.5">
                {habit.category || 'Habit Harian'}
              </span>
              <p className="leading-snug text-stone-100 font-medium break-words">{habit.title}</p>
              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-stone-900/95" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && canToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(habit);
              }}
              className="text-stone-300 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
              title="Edit habit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(habit);
              }}
              className="text-stone-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
              title="Hapus habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Button when editable (Today, Yesterday, 2 days ago) */}
          {canToggle ? (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggle(habit.id); 
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isCompleted
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-sky-100 hover:text-sky-700'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              {isCompleted ? 'Done' : 'Cek'}
            </button>
          ) : (
            /* Read-only status for > 2 days ago or future dates */
            <div 
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border ${
                isCompleted
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-stone-100 text-stone-400 border-stone-200'
              }`}
              title="Riwayat lebih dari 2 hari lalu terkunci (read-only)"
            >
              {isCompleted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-stone-400" />
                  <span>Terkunci</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
