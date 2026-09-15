'use client';

import React from 'react';
import { Check, Lock } from 'lucide-react';

export const PartnerHabitCard = ({ habit, isCompleted, partnerName = 'Partner' }) => {
  const iconDisplay = habit.icon || '🌿';
  const isEmoji = iconDisplay.length <= 2 || /\p{Emoji}/u.test(iconDisplay);

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 font-sans ${
        isCompleted
          ? 'bg-sky-50/40 border-sky-200 shadow-sm'
          : 'bg-white border-stone-200 shadow-bento opacity-80'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
              isCompleted ? 'bg-sky-100 border border-sky-200' : 'bg-stone-100'
            }`}
          >
            {isEmoji ? (
              <span>{iconDisplay}</span>
            ) : (
              <span>🌿</span>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600/80 block">
              {partnerName}
            </span>
            <h3
              className={`text-sm font-semibold truncate ${
                isCompleted ? 'line-through text-stone-400' : 'text-stone-700'
              }`}
            >
              {habit.title}
            </h3>
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
              <Check className="w-3 h-3 stroke-[3] text-sky-600" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Pending</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
