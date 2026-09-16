'use client';

import React from 'react';
import { Check, Lock } from 'lucide-react';

export const PartnerHabitCard = ({ habit, isCompleted, partnerName = 'Partner' }) => {
  const iconDisplay = habit.icon || '🌿';

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 font-sans ${
        isCompleted
          ? 'bg-sky-50/40 border-sky-200 shadow-sm'
          : 'bg-white border-stone-200 shadow-bento opacity-80'
      }`}
    >
      <div className="flex items-center justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
              isCompleted ? 'bg-sky-100 border border-sky-200' : 'bg-stone-100'
            }`}
          >
            <span>{iconDisplay}</span>
          </div>

          {/* Text & Tooltip Container (Hover triggers tooltip for all habits) */}
          <div className="relative group/tooltip min-w-0 flex-1 py-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600/80 block truncate">
              {partnerName} • {habit.category || 'Habit'}
            </span>
            <h3
              className={`text-sm font-semibold transition-all truncate ${
                isCompleted ? 'line-through text-stone-400' : 'text-stone-700'
              }`}
            >
              {habit.title}
            </h3>

            {/* Floating Hover Tooltip: Muncul otomatis saat diarahkan ke teks/judul habit */}
            <div className="absolute left-0 bottom-full mb-2.5 z-50 w-max max-w-xs px-3.5 py-2 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white text-xs font-medium shadow-2xl border border-stone-700 pointer-events-none opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0">
              <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider mb-0.5">
                {partnerName} • {habit.category || 'Habit'}
              </span>
              <p className="leading-snug text-stone-100 font-medium break-words">{habit.title}</p>
              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-stone-900/95" />
            </div>
          </div>
        </div>

        {/* Status badge (read-only) */}
        <div
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border shrink-0 ${
            isCompleted
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-stone-50 text-stone-400 border-stone-200'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3] text-sky-600" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Pending</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
