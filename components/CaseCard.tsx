
import React, { useState, useMemo } from 'react';
import { 
  Clock, MessageCircle, TrendingUp, RefreshCw, Calendar, 
  Eye, Plus, CreditCard, Key, MoreHorizontal, FileText
} from 'lucide-react';
import { Case, User as UserType, SystemSettings, SystemTag } from '../types';
import { getDaysSince, getSuccessProbability } from '../utils';
import { BENEFIT_OPTIONS } from '../constants';
import { useApp } from '../contexts/AppContext';

interface CaseCardProps {
  data: Case;
  recurrentCount?: number;
  onClick: () => void;
  onDragStart: (id: string) => void;
  onDragEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent, c: Case) => void; 
  users: UserType[];
  currentUser?: UserType; 
  isDragging?: boolean;
  isDraggable?: boolean; // New prop
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
}

export const CaseCard: React.FC<CaseCardProps> = React.memo(({ 
    data, recurrentCount = 0, onClick, onDragStart, onDragEnd, onContextMenu, users, isDragging = false, isDraggable = true, systemSettings
}) => {
  const { openWhatsApp, openQuickCheck, openSchedule, openStickyNote } = useApp();
  const [copied, setCopied] = useState<string | null>(null);
  
  // --- HELPERS ---
  const benefitLabel = useMemo(() => {
      if (!data.benefitType) return null;
      const option = BENEFIT_OPTIONS.find(b => b.code === data.benefitType);
      const rawLabel = option ? option.label.split(' - ')[1] : data.benefitType;
      return rawLabel.length > 28 ? rawLabel.substring(0, 26) + '...' : rawLabel;
  }, [data.benefitType]);

  const winProbability = useMemo(() => getSuccessProbability(data), [data]);
  const daysSinceCheck = data.lastCheckedAt ? getDaysSince(data.lastCheckedAt) : getDaysSince(data.lastUpdate);
  const timeInPhase = useMemo(() => getDaysSince(data.lastUpdate) || 0, [data.lastUpdate]);

  const monitoringStatus = useMemo(() => {
      const limit = systemSettings?.sla_spider_web || 45;
      let colorClass = 'text-emerald-600 bg-emerald-50/50 border-emerald-100';
      if (daysSinceCheck !== null) {
          if (daysSinceCheck > limit) colorClass = 'text-red-600 bg-red-50/50 border-red-100';
          else if (daysSinceCheck > 15) colorClass = 'text-orange-600 bg-orange-50/50 border-orange-100';
      }
      return { colorClass, days: daysSinceCheck ?? 0 };
  }, [daysSinceCheck, systemSettings]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(null), 1500); });
  };

  const responsibleUser = users.find(u => u.id === data.responsibleId);
  const responsibleInitials = responsibleUser?.avatarInitials || (data.responsibleName ? data.responsibleName.substring(0,2).toUpperCase() : '??');
  const userColor = responsibleUser?.color || '#94a3b8';

  // --- DESIGN SYSTEMS ---
  
  // Post-it Physics & Look
  const getNoteStyle = (color: string, noteId: string) => {
      // Base styles mapped to colors
      const styles: Record<string, string> = {
          'YELLOW': 'bg-[#fefce8] from-[#fefce8] to-[#fef08a] border-[#fef08a] text-yellow-900', // Yellow-50 to Yellow-200
          'RED': 'bg-[#fff1f2] from-[#fff1f2] to-[#fecaca] border-[#fecaca] text-red-900',       // Rose-50 to Rose-200
          'BLUE': 'bg-[#eff6ff] from-[#eff6ff] to-[#bfdbfe] border-[#bfdbfe] text-blue-900',      // Blue-50 to Blue-200
          'GREEN': 'bg-[#f0fdf4] from-[#f0fdf4] to-[#bbf7d0] border-[#bbf7d0] text-green-900',    // Green-50 to Green-200
      };
      
      // Pseudo-random rotation based on ID hash to ensure stability (prevent jitter when deleting other notes)
      const rotations = ['rotate-[-3deg]', 'rotate-[2deg]', 'rotate-[-1deg]', 'rotate-[4deg]', 'rotate-[-2deg]', 'rotate-[3deg]'];
      const hash = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const rotation = rotations[hash % rotations.length];
      
      return {
          className: `w-5 h-5 rounded-[2px] shadow-sm border-[0.5px] bg-gradient-to-br ${styles[color] || styles['YELLOW']} ${rotation} hover:rotate-0 hover:scale-125 hover:z-50 hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center group/pin`,
          tooltipClass: `absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 rounded-sm shadow-xl border-t-[6px] border-t-black/5 z-50 hidden group-hover/pin:block animate-in fade-in zoom-in-95 pointer-events-none ${styles[color] || styles['YELLOW']}`
      };
  };

  return (
    <div
        draggable={isDraggable}
        onDragStart={(e) => { 
            if (!isDraggable) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', data.id); 
            e.dataTransfer.effectAllowed = 'move'; 
            onDragStart(data.id); 
        }}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onContextMenu={(e) => onContextMenu && onContextMenu(e, data)} 
        className={`group relative rounded-xl transition-all duration-300 select-none overflow-visible
            ${isDragging 
                ? 'bg-slate-50 border-2 border-dashed border-slate-300 opacity-60 shadow-none scale-95' 
                : 'bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-blue-300/50 hover:-translate-y-1'
            }
        `}
    >
        {/* Status Line Indicator (Left Border) */}
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-colors duration-300 ${data.urgency === 'CRITICAL' ? 'bg-red-500 shadow-[2px_0_4px_rgba(239,68,68,0.3)]' : data.urgency === 'HIGH' ? 'bg-orange-400' : 'bg-slate-200 group-hover:bg-blue-400'}`}></div>

        <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
            
            {/* 1. HEADER ROW */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">#{data.internalId}</span>
                    {recurrentCount > 1 && (
                        <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                            <RefreshCw size={8} /> {recurrentCount}x
                        </span>
                    )}
                </div>
                
                {/* Avatar & Prob */}
                <div className="flex items-center gap-2">
                    {systemSettings.show_probabilities && (
                        <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md font-bold border transition-colors ${winProbability >= 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            <TrendingUp size={10} /> {winProbability}%
                        </div>
                    )}
                    <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-white" 
                        style={{ backgroundColor: userColor }} 
                        title={data.responsibleName}
                    >
                        {responsibleInitials}
                    </div>
                </div>
            </div>

            {/* 2. MAIN INFO */}
            <div>
                <h4 className="font-bold text-slate-800 text-[15px] leading-tight group-hover:text-blue-700 transition-colors line-clamp-2 mb-1.5 tracking-tight">
                    {data.clientName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    {benefitLabel && (
                        <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-600 border border-slate-100 truncate max-w-[180px]">
                            {benefitLabel}
                        </span>
                    )}
                    {data.birthDate && (
                        <span className="text-slate-400 text-[10px]">
                            {new Date().getFullYear() - parseInt(data.birthDate.split('-')[0])} anos
                        </span>
                    )}
                </div>
            </div>

            {/* 3. TAGS & TIMERS */}
            <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
                {/* Timers */}
                <div className="flex items-center gap-2 mr-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title="Tempo na fase atual">
                        <Clock size={10}/> {timeInPhase}d
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${monitoringStatus.colorClass}`} title="Dias desde a última verificação">
                        <Eye size={10}/> {monitoringStatus.days}d
                    </div>
                </div>

                {/* Tags */}
                {data.tags?.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">
                        {tag}
                    </span>
                ))}
            </div>

            {/* 4. POST-IT ZONE (The "Desk" Area) */}
            <div className="relative h-6 mt-1 flex items-center gap-1">
                {/* Add Note Button */}
                <button 
                    onClick={(e) => handleAction(e, () => openStickyNote(data))}
                    className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Colar Nota"
                >
                    <Plus size={12}/>
                </button>

                {/* The Realistic Notes */}
                {data.stickyNotes?.slice(-4).reverse().map((note, idx) => {
                    const style = getNoteStyle(note.color, note.id); // Pass ID for stable rotation
                    return (
                        <div key={note.id} className="relative group/note">
                            <div 
                                className={style.className}
                                onClick={(e) => handleAction(e, () => openStickyNote(data, note))}
                            >
                                {/* Micro text lines simulation */}
                                <div className="space-y-[2px] opacity-20">
                                    <div className="w-2.5 h-[1px] bg-black rounded-full"></div>
                                    <div className="w-2 h-[1px] bg-black rounded-full"></div>
                                    <div className="w-1.5 h-[1px] bg-black rounded-full"></div>
                                </div>
                            </div>

                            {/* The "Big View" Tooltip (Paper Effect) */}
                            <div className={style.tooltipClass}>
                                {/* Tape effect */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 rotate-1 backdrop-blur-[1px]"></div>
                                
                                <p className="text-xs font-serif leading-relaxed whitespace-pre-wrap mb-2 line-clamp-6 text-black/80">
                                    "{note.text}"
                                </p>
                                <div className="flex justify-between items-center pt-2 border-t border-black/5 opacity-60 text-[9px] font-bold uppercase tracking-widest">
                                    <span>{new Date(note.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                    <span>{note.authorName?.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 5. FOOTER ACTIONS (Refined) */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
                <div className="flex gap-1.5">
                    <button 
                        onClick={(e) => handleAction(e, () => copyToClipboard(data.cpf, 'cpf'))}
                        className={`
                            h-7 px-2.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all border
                            ${copied === 'cpf' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                            }
                        `}
                    >
                        <CreditCard size={12}/> {copied === 'cpf' ? 'Copiado!' : 'CPF'}
                    </button>
                    
                    <button 
                        onClick={(e) => handleAction(e, () => copyToClipboard(data.govPassword, 'gov'))}
                        disabled={!data.govPassword}
                        className={`
                            h-7 px-2.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all border
                            ${!data.govPassword 
                                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-transparent text-slate-400' 
                                : copied === 'gov' 
                                    ? 'bg-green-50 border-green-200 text-green-700' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                            }
                        `}
                    >
                        <Key size={12}/> Gov
                    </button>

                    <button 
                        onClick={(e) => handleAction(e, () => openSchedule(data))}
                        className="h-7 px-2.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <Calendar size={12}/> Agendar
                    </button>
                </div>

                <div className="flex gap-1">
                    {data.phone && (
                        <button 
                            onClick={(e) => handleAction(e, () => openWhatsApp(data))}
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="WhatsApp"
                        >
                            <MessageCircle size={14} />
                        </button>
                    )}
                    <button 
                        onClick={(e) => handleAction(e, () => openQuickCheck(data))}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Atualizar Status"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
});
