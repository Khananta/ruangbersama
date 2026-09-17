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
  BookOpen,
  User,
  Filter,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  CheckCheck
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { LOCAL_PROFILES } from '../lib/supabaseClient';

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
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'completed' | 'all'
  const [ownerFilter, setOwnerFilter] = useState('all'); // 'all' | 'user1' | 'user2'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [completingAssignment, setCompletingAssignment] = useState(null);
  const [permissionAlert, setPermissionAlert] = useState(null); // { title, message, ownerName }

  const userEmail = currentUser?.email?.toLowerCase() || '';
  const myId = currentUser?.id || null;
  const isKhanif = userEmail.includes('khanif') || userEmail.includes('yunan');

  // Resolve user1 (Yunan/Khanif) and user2 (Arum)
  const user1Profile = profiles?.user1 || LOCAL_PROFILES['khanif@gmail.com'] || { name: 'Yunan', id: '11111111-1111-1111-1111-111111111111' };
  const user2Profile = profiles?.user2 || LOCAL_PROFILES['arum@gmail.com'] || { name: 'Arum', id: '22222222-2222-2222-2222-222222222222' };

  const isCurrentUser1 = (myId && profiles?.user1?.id === myId) || 
                         (userEmail && profiles?.user1?.email?.toLowerCase() === userEmail) ||
                         isKhanif;

  const currentUserName = isCurrentUser1 ? (user1Profile.name === 'Khanif' ? 'Yunan' : (user1Profile.name || 'Yunan')) : (user2Profile.name || 'Arum');
  const partnerName = isCurrentUser1 ? (user2Profile.name || 'Arum') : (user1Profile.name === 'Khanif' ? 'Yunan' : (user1Profile.name || 'Yunan'));

  const user1Name = user1Profile.name === 'Khanif' ? 'Yunan' : (user1Profile.name || 'Yunan');
  const user2Name = user2Profile.name || 'Arum';

  const defaultOwnerId = isCurrentUser1 ? (user1Profile.id || myId) : (user2Profile.id || myId);

  // Form states for modal
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    due_date: todayStr,
    due_time: '23:59',
    user_id: defaultOwnerId,
    notes: '',
  });

  const openAddModal = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      course: '',
      due_date: todayStr,
      due_time: '23:59',
      user_id: isCurrentUser1 ? (user1Profile.id || myId) : (user2Profile.id || myId),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    const owner = getOwnerInfo(item);
    const isOwner = isCurrentUser1 ? owner.key === 'user1' : owner.key === 'user2';

    if (!isOwner) {
      setPermissionAlert({
        title: 'Tidak Bisa Mengedit Tugas 🔒',
        message: `Tugas ini milik ${owner.name}. Hanya ${owner.name} yang berhak mengubah isi tugas ini.`,
        ownerName: owner.name,
      });
      return;
    }

    setEditingAssignment(item);
    setFormData({
      title: item.title || '',
      course: item.course || '',
      due_date: item.due_date || todayStr,
      due_time: item.due_time || '23:59',
      user_id: item.user_id || (isCurrentUser1 ? user1Profile.id : user2Profile.id),
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (item) => {
    const owner = getOwnerInfo(item);
    const isOwner = isCurrentUser1 ? owner.key === 'user1' : owner.key === 'user2';

    if (!isOwner) {
      setPermissionAlert({
        title: 'Tidak Bisa Menghapus Tugas 🔒',
        message: `Tugas ini milik ${owner.name}. Hanya ${owner.name} yang berhak menghapus tugas ini.`,
        ownerName: owner.name,
      });
      return;
    }

    setDeletingAssignment(item);
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

  // Helper for determining owner info
  const getOwnerInfo = (item) => {
    const uid = String(item.user_id || '');
    const u1Id = String(user1Profile.id || '');
    const u2Id = String(user2Profile.id || '');

    if (uid === u1Id || uid.includes('khanif') || uid.includes('yunan') || uid.startsWith('1111') || (isCurrentUser1 && myId && uid === String(myId))) {
      return {
        name: user1Name,
        key: 'user1',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        dotColor: 'bg-sky-500',
        icon: '👤',
      };
    }
    return {
      name: user2Name,
      key: 'user2',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      dotColor: 'bg-rose-500',
      icon: '🌸',
    };
  };

  const isMyAssignment = (item) => {
    const owner = getOwnerInfo(item);
    return isCurrentUser1 ? owner.key === 'user1' : owner.key === 'user2';
  };

  // Toggle handler with owner check & validation modal
  const handleItemToggleClick = (item) => {
    const owner = getOwnerInfo(item);
    const isOwner = isMyAssignment(item);

    // 1. Permission check: Yunan cannot toggle Arum's task & vice versa
    if (!isOwner) {
      setPermissionAlert({
        title: 'Akses Dibatasi 🔒',
        message: `Ini tugas kuliah milik ${owner.name}. Hanya ${owner.name} yang dapat menandai tugas ini selesai atau aktif.`,
        ownerName: owner.name,
      });
      return;
    }

    // 2. If marking as completed (from false to true), show confirmation alert modal
    if (!item.is_completed) {
      setCompletingAssignment(item);
    } else {
      // Unchecking back to active
      onToggleAssignment(item.id, false);
    }
  };

  const confirmCompleteAssignment = () => {
    if (completingAssignment) {
      onToggleAssignment(completingAssignment.id, true);
      setCompletingAssignment(null);
    }
  };

  // Helper for deadline status calculation
  const getDeadlineInfo = (dueDateStr, dueTimeStr, isCompleted) => {
    if (isCompleted) {
      return {
        label: 'Selesai ✨',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
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
    
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => 
        (a.title || '').toLowerCase().includes(q) ||
        (a.course || '').toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q)
      );
    }

    // Sort: uncompleted first, then by nearest due_date + due_time
    list.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      const dateA = `${a.due_date || '9999-99-99'} ${a.due_time || '23:59'}`;
      const dateB = `${b.due_date || '9999-99-99'} ${b.due_time || '23:59'}`;
      return dateA.localeCompare(dateB);
    });

    // 1. Status Filter
    if (statusFilter === 'active') {
      list = list.filter((a) => !a.is_completed);
    } else if (statusFilter === 'completed') {
      list = list.filter((a) => a.is_completed);
    }

    // 2. Owner Filter
    if (ownerFilter === 'user1') {
      list = list.filter((a) => getOwnerInfo(a).key === 'user1');
    } else if (ownerFilter === 'user2') {
      list = list.filter((a) => getOwnerInfo(a).key === 'user2');
    }

    return list;
  }, [assignments, searchQuery, statusFilter, ownerFilter, user1Profile, user2Profile]);

  const totalCount = (assignments || []).length;
  const activeCount = (assignments || []).filter((a) => !a.is_completed).length;
  const completedCount = (assignments || []).filter((a) => a.is_completed).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleNoteExpand = (id, e) => {
    e.stopPropagation();
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-bento space-y-4 font-sans transition-all">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-base leading-tight">
                Tugas Kuliah
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {activeCount} aktif
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Kelola tugas kuliah bersama secara mandiri
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

      {/* ── Filter Controls (Status & Owner) ── */}
      <div className="space-y-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/70 rounded-xl border border-stone-200/70 text-xs">
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all text-center ${
              statusFilter === 'active'
                ? 'bg-white text-sky-700 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Aktif ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all text-center ${
              statusFilter === 'completed'
                ? 'bg-white text-sky-700 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Selesai ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all text-center ${
              statusFilter === 'all'
                ? 'bg-white text-sky-700 shadow-sm border border-stone-200 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Semua ({totalCount})
          </button>
        </div>

        {/* Owner Filter Tabs (Yunan / Arum / Semua) */}
        <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
          <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-600" /> Pemilik:
          </span>
          <button
            onClick={() => setOwnerFilter('all')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
              ownerFilter === 'all'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setOwnerFilter('user1')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all flex items-center gap-1 ${
              ownerFilter === 'user1'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-bold'
                : 'bg-white text-sky-700 border-sky-200 hover:bg-sky-50'
            }`}
          >
            <span>👤</span> {user1Name}
          </button>
          <button
            onClick={() => setOwnerFilter('user2')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all flex items-center gap-1 ${
              ownerFilter === 'user2'
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm font-bold'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span>🌸</span> {user2Name}
          </button>
        </div>
      </div>

      {/* ── Assignment List ── */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 pt-1 pb-1">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-1.5">
            <p className="text-2xl">🎓</p>
            <p className="text-xs font-semibold text-stone-600">
              {statusFilter === 'completed' ? 'Belum ada tugas yang selesai' : 'Tidak ada tugas kuliah pending'}
            </p>
            <p className="text-[11px] text-stone-400">
              {statusFilter === 'active' ? 'Semua tugas kuliah beres! ✨' : 'Klik tombol Tambah untuk mencatat tugas baru.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map((item) => {
            const deadline = getDeadlineInfo(item.due_date, item.due_time, item.is_completed);
            const owner = getOwnerInfo(item);
            const isMine = isMyAssignment(item);
            const isExpanded = Boolean(expandedNotes[item.id]);
            
            return (
              <div
                key={item.id}
                onClick={() => handleItemToggleClick(item)}
                className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 ${
                  item.is_completed
                    ? 'bg-stone-50/70 border-stone-200/80 opacity-75 hover:opacity-100'
                    : deadline.isPast
                    ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300 hover:shadow-sm'
                    : isMine
                    ? 'bg-white border-stone-200 hover:border-sky-300 hover:shadow-md'
                    : 'bg-stone-50/50 border-stone-200/90 hover:border-stone-300'
                }`}
              >
                {/* Main Card Content */}
                <div className="flex items-start justify-between gap-2.5">
                  
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    
                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemToggleClick(item);
                      }}
                      title={item.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                      className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                        item.is_completed
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border border-stone-300 bg-white hover:border-sky-500 hover:scale-105'
                      }`}
                    >
                      {item.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      
                      {/* Top Row: Owner Badge & Truncated Course Tag with Hover Tooltip */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        
                        {/* Owner Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${owner.badgeColor}`}>
                          <span>{owner.icon}</span>
                          <span>{owner.name}</span>
                        </span>

                        {/* Course Tag with Downward Tooltip & Truncation */}
                        {item.course && (
                          <div className="relative group/course">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 block max-w-[110px] sm:max-w-[150px] truncate cursor-pointer hover:bg-stone-200/80 transition-colors">
                              {item.course}
                            </span>

                            {/* Floating Hover Tooltip for Course (Opens downward to avoid top container clipping) */}
                            <div className="absolute left-0 top-full mt-1.5 z-50 w-max max-w-xs px-2.5 py-1.5 rounded-xl bg-stone-900/95 backdrop-blur-md text-white text-[11px] font-semibold shadow-2xl border border-stone-700 pointer-events-none opacity-0 invisible group-hover/course:opacity-100 group-hover/course:visible transition-all duration-200 -translate-y-1 group-hover/course:translate-y-0">
                              <span className="text-[9px] text-sky-400 font-bold block uppercase tracking-wider mb-0.5">
                                Mata Kuliah
                              </span>
                              <p className="leading-tight text-stone-100 font-medium whitespace-normal break-words">
                                {item.course}
                              </p>
                              <div className="absolute bottom-full left-3 -mb-1 border-4 border-transparent border-b-stone-900/95" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title with Downward Tooltip */}
                      <div className="relative group/title min-w-0 mt-1">
                        <p
                          className={`text-xs font-semibold leading-snug break-words ${
                            item.is_completed ? 'line-through text-stone-400' : 'text-stone-800'
                          }`}
                        >
                          {item.title}
                        </p>

                        {/* Floating Hover Tooltip for Title (Opens downward to avoid top clipping) */}
                        <div className="absolute left-0 top-full mt-1.5 z-50 w-max max-w-xs px-3 py-2 rounded-xl bg-stone-900/95 backdrop-blur-md text-white text-xs font-medium shadow-2xl border border-stone-700 pointer-events-none opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 -translate-y-1 group-hover/title:translate-y-0">
                          <span className="text-[9px] text-sky-400 font-bold block uppercase tracking-wider mb-0.5">
                            {item.course || 'Tugas Kuliah'}
                          </span>
                          <p className="leading-snug text-stone-100 font-medium whitespace-normal break-words">
                            {item.title}
                          </p>
                          <div className="absolute bottom-full left-3 -mb-1 border-4 border-transparent border-b-stone-900/95" />
                        </div>
                      </div>

                      {/* Deadline info badge */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${deadline.color}`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{deadline.label}</span>
                        </span>

                        {/* Notes toggle button if notes exist */}
                        {item.notes && (
                          <button
                            type="button"
                            onClick={(e) => toggleNoteExpand(item.id, e)}
                            className="text-[10px] font-medium text-stone-500 hover:text-sky-600 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-stone-100 transition-colors"
                          >
                            <FileText className="w-2.5 h-2.5 text-stone-400" />
                            <span>{isExpanded ? 'Tutup Catatan' : 'Lihat Catatan'}</span>
                            {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Right: Actions (Only enabled if mine, or shows tooltip) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isMine 
                          ? 'text-stone-400 hover:text-sky-600 hover:bg-sky-50' 
                          : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                      }`}
                      title={isMine ? "Edit tugas" : `Tugas milik ${owner.name}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(item);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isMine 
                          ? 'text-stone-400 hover:text-red-500 hover:bg-red-50' 
                          : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                      }`}
                      title={isMine ? "Hapus tugas" : `Tugas milik ${owner.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Notes Section */}
                {item.notes && isExpanded && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 p-2.5 rounded-xl bg-stone-100/80 border border-stone-200 text-[11px] text-stone-700 leading-relaxed font-sans whitespace-pre-wrap animate-fade-in"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                      <FileText className="w-3 h-3" /> Catatan Tugas:
                    </div>
                    {item.notes}
                  </div>
                )}
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
                    Catat tugas, pemilik, & tenggat pengumpulan
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

      {/* ── VALIDATION MODAL: Konfirmasi Selesaikan Tugas ── */}
      {completingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-stone-900">
                  Tandai Selesai? 🎓🎉
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Apakah kamu yakin sudah menyelesaikan tugas <span className="font-bold text-stone-900">"{completingAssignment.title}"</span>?
                </p>
                {completingAssignment.course && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    Mata Kuliah: {completingAssignment.course}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCompletingAssignment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Belum, Nanti Dulu
              </button>
              <button
                type="button"
                onClick={confirmCompleteAssignment}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Ya, Sudah Selesai! ✨</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSION ALERT MODAL: Akses Ditolak ── */}
      {permissionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-stone-900">
                  {permissionAlert.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {permissionAlert.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPermissionAlert(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all"
              >
                Mengerti
              </button>
            </div>
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
