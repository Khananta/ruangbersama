'use client';

import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3, 
  AlertCircle,
  X,
  Check,
  BookOpen
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

// Helper: Format Date object to local YYYY-MM-DD string
const toLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Parse YYYY-MM-DD string to local Date object
const parseLocalDateString = (str) => {
  if (!str) return new Date();
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const CollegeAssignments = ({
  assignments = [],
  onAddAssignment,
  onEditAssignment,
  onToggleAssignment,
  onDeleteAssignment,
  currentUser,
  profiles,
}) => {
  const todayStr = toLocalDateString(new Date());
  const [filter, setFilter] = useState('active'); // 'active' | 'completed' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deletingAssignment, setDeletingAssignment] = useState(null);

  // Form states for modal
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    due_date: todayStr,
    due_time: '23:59',
    notes: '',
  });

  const openAddModal = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      course: '',
      due_date: todayStr,
      due_time: '23:59',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingAssignment(item);
    setFormData({
      title: item.title || '',
      course: item.course || '',
      due_date: item.due_date || todayStr,
      due_time: item.due_time || '23:59',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingAssignment) {
      onEditAssignment(editingAssignment.id, formData);
    } else {
      onAddAssignment(formData);
    }
    setIsModalOpen(false);
  };

  // Helper for deadline status calculation
  const getDeadlineInfo = (dueDateStr, dueTimeStr, isCompleted) => {
    if (isCompleted) {
      return {
        label: 'Selesai',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        isPast: false,
      };
    }

    if (!dueDateStr) return { label: 'Tanpa deadline', color: 'bg-stone-100 text-stone-600 border-stone-200', isPast: false };

    const today = parseLocalDateString(todayStr);
    const dueDate = parseLocalDateString(dueDateStr);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    const timeLabel = dueTimeStr ? ` • ${dueTimeStr}` : '';

    if (diffDays < 0) {
      return {
        label: `Terlewat ${Math.abs(diffDays)} hari${timeLabel}`,
        color: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        isPast: true,
      };
    }
    if (diffDays === 0) {
      return {
        label: `Hari Ini${timeLabel}`,
        color: 'bg-amber-50 text-amber-700 border-amber-300 font-bold animate-pulse',
        isPast: false,
      };
    }
    if (diffDays === 1) {
      return {
        label: `Besok${timeLabel}`,
        color: 'bg-sky-50 text-sky-700 border-sky-300 font-semibold',
        isPast: false,
      };
    }
    return {
      label: `${diffDays} hari lagi${timeLabel}`,
      color: 'bg-stone-50 text-stone-600 border-stone-200',
      isPast: false,
    };
  };

  // Filtered and sorted assignments
  const filteredAssignments = useMemo(() => {
    let list = [...(assignments || [])];
    
    // Sort: uncompleted first, then by nearest due_date + due_time
    list.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      const dateA = `${a.due_date || '9999-99-99'} ${a.due_time || '23:59'}`;
      const dateB = `${b.due_date || '9999-99-99'} ${b.due_time || '23:59'}`;
      return dateA.localeCompare(dateB);
    });

    if (filter === 'active') {
      return list.filter((a) => !a.is_completed);
    }
    if (filter === 'completed') {
      return list.filter((a) => a.is_completed);
    }
    return list;
  }, [assignments, filter]);

  const activeCount = (assignments || []).filter((a) => !a.is_completed).length;
  const completedCount = (assignments || []).filter((a) => a.is_completed).length;

  return (
    <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4 font-sans">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              Tugas Kuliah
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {activeCount} tugas aktif • {completedCount} selesai
            </p>
          </div>
        </div>

        {/* Add Assignment Button */}
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-stone-50 rounded-xl border border-stone-200/70 text-xs">
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all text-center ${
            filter === 'active'
              ? 'bg-white text-sky-700 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Aktif ({activeCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all text-center ${
            filter === 'completed'
              ? 'bg-white text-sky-700 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Selesai ({completedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all text-center ${
            filter === 'all'
              ? 'bg-white text-sky-700 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Semua
        </button>
      </div>

      {/* ── Assignment List ── */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-1.5">
            <p className="text-2xl">🎓</p>
            <p className="text-xs font-semibold text-stone-600">
              {filter === 'completed' ? 'Belum ada tugas yang selesai' : 'Tidak ada tugas kuliah pending'}
            </p>
            <p className="text-[11px] text-stone-400">
              {filter === 'active' ? 'Semua tugas kuliah sudah beres! ✨' : 'Klik tombol Tambah untuk mencatat tugas baru.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map((item) => {
            const deadline = getDeadlineInfo(item.due_date, item.due_time, item.is_completed);
            
            return (
              <div
                key={item.id}
                onClick={() => onToggleAssignment(item.id, !item.is_completed)}
                className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-2.5 ${
                  item.is_completed
                    ? 'bg-stone-50/70 border-stone-200 opacity-75'
                    : deadline.isPast
                    ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                    : 'bg-white border-stone-200 hover:border-sky-300 shadow-sm'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAssignment(item.id, !item.is_completed);
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      item.is_completed
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'border border-stone-300 bg-white hover:border-sky-500'
                    }`}
                  >
                    {item.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Course tag */}
                    {item.course && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block truncate">
                        {item.course}
                      </span>
                    )}

                    {/* Title */}
                    <p
                      className={`text-xs font-semibold leading-snug break-words ${
                        item.is_completed ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}
                      title={item.title}
                    >
                      {item.title}
                    </p>

                    {/* Deadline status badge */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${deadline.color}`}>
                        <Clock className="w-2.5 h-2.5" />
                        <span>{deadline.label}</span>
                      </span>
                    </div>

                    {/* Notes if any */}
                    {item.notes && (
                      <p className="text-[10px] text-stone-400 mt-1 italic line-clamp-1">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    className="text-stone-300 hover:text-sky-600 p-1 rounded-lg hover:bg-sky-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                    title="Edit tugas"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingAssignment(item);
                    }}
                    className="text-stone-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                    title="Hapus tugas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal Add / Edit Assignment ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-bento border border-stone-200 relative animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {editingAssignment ? 'Edit Tugas Kuliah' : 'Tambah Tugas Kuliah'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Catat tugas & tenggat pengumpulan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Nama Tugas */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Nama Tugas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Misal: Makalah Metodologi Penelitian..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Mata Kuliah */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Mata Kuliah (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="Misal: AI, Statistika, Jaringan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                />
              </div>

              {/* Deadline Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    Tenggat Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    Jam Pengumpulan
                  </label>
                  <input
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Catatan / Instruksi
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Link submit, format PDF, ketentuan kelompok..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim()}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  {editingAssignment ? 'Simpan Perubahan' : 'Simpan Tugas'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Modal Delete ── */}
      <ConfirmModal
        isOpen={Boolean(deletingAssignment)}
        onClose={() => setDeletingAssignment(null)}
        onConfirm={() => {
          if (deletingAssignment) {
            onDeleteAssignment(deletingAssignment.id);
            setDeletingAssignment(null);
          }
        }}
        title="Hapus Tugas Kuliah? 🗑️"
        message={`Apakah kamu yakin ingin menghapus tugas "${deletingAssignment?.title}"?`}
        confirmText="Ya, Hapus Tugas"
        cancelText="Batal"
      />

    </div>
  );
};
