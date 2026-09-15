'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Calendar, MessageSquare, Target, Heart, Edit3, Trash2, Filter } from 'lucide-react';
import { AddReflectionModal } from './AddReflectionModal';
import { LOCAL_PROFILES } from '../lib/supabaseClient';
import { ConfirmModal } from './ConfirmModal';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const WeeklyEvaluation = ({
  evaluations = [],
  onSaveReflection,
  onDeleteReflection,
  profiles,
  currentUser,
}) => {
  const userEmail = currentUser?.email?.toLowerCase() || '';
  const myId = currentUser?.id || null;
  const isKhanif = userEmail.includes('khanif');
  const isUser1 = (myId && profiles?.user1?.id === myId) || 
                  (userEmail && profiles?.user1?.email?.toLowerCase() === userEmail) ||
                  isKhanif;

  const myProfile = isUser1 ? (profiles?.user1 || { name: 'Khanif', id: myId }) : (profiles?.user2 || { name: 'Arum', id: myId });
  const partnerProfile = isUser1 ? (profiles?.user2 || { name: 'Arum' }) : (profiles?.user1 || { name: 'Khanif' });

  // Filter state
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [deletingEval, setDeletingEval] = useState(null);

  const handleOpenAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evalItem) => {
    setEditingData(evalItem);
    setIsModalOpen(true);
  };

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return (evaluations || []).filter((item) => {
      if (selectedMonthFilter !== 'all') {
        const itemMonth = item.month !== undefined ? item.month : (item.week_start ? new Date(item.week_start).getMonth() : new Date().getMonth());
        if (Number(itemMonth) !== Number(selectedMonthFilter)) return false;
      }
      if (selectedWeekFilter !== 'all') {
        const itemWeek = item.week_number !== undefined ? item.week_number : 1;
        if (Number(itemWeek) !== Number(selectedWeekFilter)) return false;
      }
      return true;
    });
  }, [evaluations, selectedMonthFilter, selectedWeekFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans">

      {/* ── Top Header Card with Icon ── */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Riwayat Refleksi Mingguan
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Evaluasi berkala setiap akhir pekan untuk saling bertumbuh dan memahami satu sama lain.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition-all whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Refleksi</span>
        </button>
      </div>

      {/* ── Filter Bar (Filter Bulan & Minggu) ── */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-bento flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Filter Riwayat:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Filter Bulan */}
          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
          >
            <option value="all">Semua Bulan</option>
            {MONTH_NAMES.map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>

          {/* Filter Minggu */}
          <select
            value={selectedWeekFilter}
            onChange={(e) => setSelectedWeekFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
          >
            <option value="all">Semua Minggu</option>
            <option value="1">Minggu ke-1</option>
            <option value="2">Minggu ke-2</option>
            <option value="3">Minggu ke-3</option>
            <option value="4">Minggu ke-4</option>
            <option value="5">Minggu ke-5</option>
          </select>

          {(selectedMonthFilter !== 'all' || selectedWeekFilter !== 'all') && (
            <button
              onClick={() => { setSelectedMonthFilter('all'); setSelectedWeekFilter('all'); }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── List Hasil Refleksi ── */}
      <div className="space-y-5">
        {filteredEvaluations.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-stone-200 shadow-bento text-center space-y-3">
            <p className="text-3xl">💌</p>
            <h3 className="text-base font-bold text-stone-800">Belum Ada Hasil Refleksi</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Belum ada catatan refleksi mingguan pada filter yang dipilih. Tulis refleksi pertamamu untuk minggu ini!
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Refleksi Sekarang</span>
            </button>
          </div>
        ) : (
          filteredEvaluations.map((item) => {
            const itemMonth = item.month !== undefined ? item.month : (item.week_start ? new Date(item.week_start).getMonth() : new Date().getMonth());
            const itemWeek = item.week_number || 1;
            const itemYear = item.year || new Date().getFullYear();
            const monthLabel = MONTH_NAMES[itemMonth] || 'Bulan';

            const myReflectionText = isKhanif ? item.reflection_user_1 : item.reflection_user_2;
            const partnerReflectionText = isKhanif ? item.reflection_user_2 : item.reflection_user_1;

            return (
              <div key={item.id} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-5 animate-fade-in">
                
                {/* Header Card Refleksi */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {monthLabel} {itemYear}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                          Minggu ke-{itemWeek}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">Weekend Check-in & Review</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-sky-300 text-xs font-semibold text-stone-700 hover:text-sky-700 flex items-center gap-1.5 hover:bg-sky-50/50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Refleksi</span>
                    </button>
                    {onDeleteReflection && (
                      <button
                        onClick={() => setDeletingEval(item)}
                        className="p-1.5 rounded-xl border border-stone-200 hover:border-sky-300 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus refleksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dua Kolom Refleksi (Kamu & Pasangan) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Refleksi Kamu */}
                  <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                        Refleksi {myProfile.name} (Kamu)
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed italic whitespace-pre-wrap">
                      {myReflectionText ? `"${myReflectionText}"` : <span className="text-stone-400 not-italic">Belum diisi olehmu...</span>}
                    </p>
                  </div>

                  {/* Refleksi Pasangan */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-sky-500" />
                        Refleksi {partnerProfile.name}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed italic whitespace-pre-wrap">
                      {partnerReflectionText ? `"${partnerReflectionText}"` : <span className="text-stone-400 not-italic">Belum diisi oleh {partnerProfile.name}...</span>}
                    </p>
                  </div>

                </div>

                {/* Target & Goals Bersama */}
                {item.goals_next_week && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                    <Target className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
                        Target & Goals Minggu Depan:
                      </span>
                      <p className="text-xs text-stone-600 mt-0.5">{item.goals_next_week}</p>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* ── Modal Tambah / Edit Refleksi ── */}
      <AddReflectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingData(null);
        }}
        onSaveReflection={onSaveReflection}
        initialData={editingData}
        isUser1={isKhanif}
        userName={myProfile.name}
      />

      {/* ── Confirmation Modal for Deleting Reflection ── */}
      <ConfirmModal
        isOpen={Boolean(deletingEval)}
        onClose={() => setDeletingEval(null)}
        onConfirm={() => {
          if (deletingEval) {
            onDeleteReflection(deletingEval.id);
            setDeletingEval(null);
          }
        }}
        title="Hapus Refleksi? 🗑️"
        message="Apakah kamu yakin ingin menghapus riwayat refleksi mingguan ini?"
        confirmText="Ya, Hapus Refleksi"
        cancelText="Batal"
      />

    </div>
  );
};
