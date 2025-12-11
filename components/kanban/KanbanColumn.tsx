
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ColumnDefinition, Case, User, SmartAction, SystemSettings, SystemTag, StickyNote } from '../../types';
import { CaseCard } from '../CaseCard';
import { TRANSITION_RULES } from '../../constants';
import { ArrowRight, FileText, Scale, Archive, Gavel, Siren, LayoutDashboard, Sparkles, Inbox, MoveRight, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { getDaysDiff } from '../../utils';

interface KanbanColumnProps {
  column: ColumnDefinition;
  cases: Case[];
  activeTheme: any;
  draggedCase: Case | undefined;
  onDrop: (colId: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onCardClick: (c: Case) => void;
  recurrencyMap: Map<string, number>;
  onWhatsApp: (c: Case) => void;
  onQuickCheck: (c: Case) => void;
  onSmartAction: (c: Case, action: SmartAction) => void;
  onStickyNote: (c: Case, note?: StickyNote) => void;
  onSchedule?: (c: Case) => void; // NEW
  users: User[];
  currentUser?: User;
  isSuggested: boolean;
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
}

// Visual configuration for zones
const getZoneConfig = (id: string) => {
    switch(id) {
        case 'zone_judicial': return { icon: Scale, label: 'Judicializar', subLabel: 'Mover para o Judicial', colorClass: 'bg-blue-50 border-blue-200 text-blue-700', hoverClass: 'bg-blue-100 border-blue-400 ring-4 ring-blue-100' };
        case 'zone_recurso': return { icon: FileText, label: 'Recurso Adm.', subLabel: 'Iniciar Fase Recursal', colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-700', hoverClass: 'bg-indigo-100 border-indigo-400 ring-4 ring-indigo-100' };
        case 'zone_ms': return { icon: Siren, label: 'Mandado de Segurança', subLabel: 'Impetrar MS', colorClass: 'bg-red-50 border-red-200 text-red-700', hoverClass: 'bg-red-100 border-red-400 ring-4 ring-red-100' };
        case 'zone_mesa_decisao': return { icon: Gavel, label: 'Mesa de Decisão', subLabel: 'Definição Estratégica', colorClass: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700', hoverClass: 'bg-fuchsia-100 border-fuchsia-400 ring-4 ring-fuchsia-100' };
        case 'zone_arquivo': return { icon: Archive, label: 'Arquivar', subLabel: 'Encerrar ou Financeiro', colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-700', hoverClass: 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-100' };
        case 'zone_admin': return { icon: LayoutDashboard, label: 'Retornar p/ Admin', subLabel: 'Voltar ao Fluxo', colorClass: 'bg-slate-50 border-slate-200 text-slate-600', hoverClass: 'bg-slate-100 border-slate-400 ring-4 ring-slate-100' };
        default: return { icon: ArrowRight, label: id, subLabel: 'Mover', colorClass: 'bg-slate-50 border-slate-200 text-slate-500', hoverClass: 'bg-slate-100 border-slate-400' };
    }
};

// Helper to determine feedback details during drag
const getDragFeedback = (targetColId: string, draggedCase: Case | undefined) => {
    if (!draggedCase) return null;

    // 1. ZONES (Special Handling)
    if (targetColId.startsWith('zone_')) {
        const conf = getZoneConfig(targetColId);
        return { label: conf.label, color: conf.colorClass, icon: conf.icon };
    }

    // 2. RULES (Popups)
    const rule = TRANSITION_RULES.find(r => (r.from === draggedCase.columnId || r.from === '*') && r.to === targetColId);
    if (rule) {
        switch (rule.type) {
            case 'PROTOCOL_INSS': return { label: 'Registrar Protocolo', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: FileText };
            case 'PROTOCOL_APPEAL': return { label: 'Registrar Recurso', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: FileText };
            case 'DEADLINE': return { label: 'Definir Prazo Fatal', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: AlertCircle };
            case 'PENDENCY': return { label: 'Marcar Pendências', color: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle };
            case 'CONCLUSION_NB': return { label: 'Conclusão / NB', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: Sparkles };
            default: return { label: 'Mover Processo', color: 'bg-slate-50 border-slate-200 text-slate-600', icon: MoveRight };
        }
    }

    // 3. DEFAULT MOVE
    return { label: 'Mover para cá', color: 'bg-slate-50 border-slate-200 text-slate-500', icon: MoveRight };
};

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ 
    column, cases, activeTheme, draggedCase, onDrop, onDragStart, onDragEnd, onCardClick, recurrencyMap, onWhatsApp, onQuickCheck, onSmartAction, onStickyNote, onSchedule, users, currentUser, isSuggested, systemSettings, systemTags
}) => {
    
    const isZone = column.id.startsWith('zone_');
    const [isDragOver, setIsDragOver] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Feedback visual calculation for overlay
    const feedback = useMemo(() => isDragOver && !isZone ? getDragFeedback(column.id, draggedCase) : null, [isDragOver, column.id, draggedCase, isZone]);

    // Zone visual config
    const zoneConfig = useMemo(() => isZone ? getZoneConfig(column.id) : null, [column.id, isZone]);

    // --- SMART SORT ALGORITHM ---
    const sortedCases = useMemo(() => {
        if (isZone) return [];
        
        return [...cases].sort((a, b) => {
            // 1. DEADLINE URGENCY
            const deadA = getDaysDiff(a.deadlineEnd);
            const deadB = getDaysDiff(b.deadlineEnd);
            const isCriticalA = deadA !== null && deadA <= 5 && deadA >= -5; 
            const isCriticalB = deadB !== null && deadB <= 5 && deadB >= -5;

            if (isCriticalA && !isCriticalB) return -1;
            if (!isCriticalA && isCriticalB) return 1;
            if (isCriticalA && isCriticalB) return (deadA || 0) - (deadB || 0);

            // 2. PRIORITY LEVEL
            const urgencyWeight: Record<string, number> = { 'CRITICAL': 3, 'HIGH': 2, 'NORMAL': 1 };
            const weightA = urgencyWeight[a.urgency] || 1;
            const weightB = urgencyWeight[b.urgency] || 1;
            if (weightA !== weightB) return weightB - weightA;

            // 3. STAGNATION (Oldest update first)
            const dateA = new Date(a.lastUpdate).getTime();
            const dateB = new Date(b.lastUpdate).getTime();
            return dateA - dateB;
        });
    }, [cases, isZone]);

    useEffect(() => {
        setVisibleCount(20);
    }, [cases.length, column.id]); 

    useEffect(() => {
        if (isZone) return; 
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => Math.min(prev + 20, cases.length));
            }
        }, { rootMargin: '200px' });

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [cases.length, isZone]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedCase && draggedCase.columnId !== column.id) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDropInternal = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (draggedCase && draggedCase.columnId !== column.id) {
            onDrop(column.id);
        }
    };

    // BUG FIX: Ensure dragged item is visible in source column during drag even if outside virtual window
    const visibleCases = useMemo(() => {
        const list = isZone ? [] : sortedCases.slice(0, visibleCount);
        if (draggedCase && draggedCase.columnId === column.id && !list.find(c => c.id === draggedCase.id)) {
            list.push(draggedCase);
        }
        return list;
    }, [isZone, sortedCases, visibleCount, draggedCase, column.id]);

    return (
        <div 
            className={`
                flex-shrink-0 flex flex-col rounded-xl transition-all duration-200 relative
                ${isZone 
                    ? `w-full h-[100px] cursor-default border-2 ${isDragOver ? zoneConfig?.hoverClass : `${zoneConfig?.colorClass} hover:shadow-md`}` 
                    : 'w-[280px] h-full bg-slate-100/50 border border-slate-200/60'
                }
                ${isDragOver && !isZone ? 'ring-2 ring-blue-400 bg-blue-50/50 shadow-xl z-20 scale-[1.02]' : ''}
                ${isSuggested && !isDragOver && !isZone ? 'ring-2 ring-blue-300 ring-dashed bg-blue-50/20' : ''}
                ${isDragOver && isZone ? 'scale-[1.03] shadow-lg z-20' : ''}
            `}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDropInternal}
        >
            {/* COLUMN HEADER / ZONE CONTENT */}
            {isZone && zoneConfig ? (
                <div className="flex flex-col items-center justify-center h-full pointer-events-none">
                     <zoneConfig.icon size={24} className={isDragOver ? 'scale-110 transition-transform duration-200' : ''} />
                     <h3 className="font-bold text-sm mt-2">{zoneConfig.label}</h3>
                     <p className="text-[10px] opacity-70 uppercase tracking-wide font-semibold mt-0.5">{zoneConfig.subLabel}</p>
                </div>
            ) : (
                <div className="p-3 flex items-center justify-between sticky top-0 z-10 rounded-t-xl bg-slate-100/90 backdrop-blur-sm border-b border-slate-200">
                     <div className="flex items-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${column.color.replace('border-', 'bg-')}`}></div>
                         <h3 className="font-bold text-xs uppercase tracking-wide text-slate-500">
                             {column.title}
                         </h3>
                     </div>
                     <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400 shadow-sm border border-slate-100">
                         {cases.length}
                     </span>
                </div>
            )}

            {/* DRAG FEEDBACK OVERLAY (STANDARD COLUMNS ONLY) */}
            {isDragOver && !isZone && feedback && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-[1px] rounded-xl border-2 border-dashed border-blue-400 animate-in fade-in duration-200">
                    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg border ${feedback.color}`}>
                        <feedback.icon size={24} />
                        <span className="font-bold text-sm text-center">{feedback.label}</span>
                    </div>
                </div>
            )}

            {/* SUGGESTION INDICATOR */}
            {isSuggested && !isDragOver && draggedCase && !isZone && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 flex items-center gap-1 animate-bounce">
                    <ArrowUpCircle size={10}/> Sugestão
                </div>
            )}

            {/* SCROLLABLE AREA */}
            {!isZone && (
                <div className="flex-1 overflow-y-auto p-2 space-y-2.5 kanban-scroll relative">
                    
                    {visibleCases.length === 0 && !isDragOver && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-300 select-none">
                            <div className="w-16 h-16 bg-slate-200/50 rounded-full flex items-center justify-center mb-2">
                                <Inbox size={32} className="opacity-50"/>
                            </div>
                            <p className="text-xs font-medium">Nenhum processo</p>
                        </div>
                    )}

                    {visibleCases.map((c) => (
                        <CaseCard 
                            key={c.id} 
                            data={c}
                            recurrentCount={recurrencyMap.get(c.cpf.replace(/\D/g, '')) || 0}
                            onClick={() => onCardClick(c)}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onWhatsApp={onWhatsApp}
                            onQuickCheck={onQuickCheck}
                            onSmartAction={onSmartAction}
                            onStickyNote={onStickyNote}
                            onSchedule={onSchedule}
                            users={users}
                            currentUser={currentUser}
                            systemSettings={systemSettings}
                            systemTags={systemTags}
                        />
                    ))}
                    
                    {/* Sentinel for infinite scroll */}
                    {visibleCases.length < cases.length && (
                        <div ref={sentinelRef} className="h-4 w-full flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75 mx-1"></div>
                           <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
