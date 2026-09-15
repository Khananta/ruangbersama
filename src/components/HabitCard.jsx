'use client';

import React from 'react';
import { Check, Trash2, Edit3 } from 'lucide-react';

export const HabitCard = ({ habit, isCompleted, onToggle, onDelete, onEdit, isToday = true }) => {
  const iconDisplay = habit.icon || '🌿';
  const isEmoji = iconDisplay.length <= 4 || /\p{Emoji}/u.test(iconDisplay);

  return (
    <div
      onClick={() => isToday && onToggle(habit.id)}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 font-sans overflow-hidden ${
        isCompleted
          ? 'bg-sky-50/70 border-sky-200 shadow-sm'
          : isToday
          ? 'bg-white border-stone-200 hover:border-sky-300 shadow-bento cursor-pointer'
          : 'bg-white border-stone-200 shadow-bento opacity-75'
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

          {/* Text */}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600 block truncate">
              {habit.category || 'Habit Harian'}
            </span>
            <h3
              className={`text-sm font-semibold transition-all truncate ${
                isCompleted ? 'line-through text-stone-400' : 'text-stone-800'
              }`}
              title={habit.title}
            >
              {habit.title}
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
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

          {isToday && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(habit.id); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isCompleted
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-sky-100 hover:text-sky-700'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              {isCompleted ? 'Done' : 'Cek'}
            </button>
          )}
          {!isToday && isCompleted && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200">
              ✓ Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
