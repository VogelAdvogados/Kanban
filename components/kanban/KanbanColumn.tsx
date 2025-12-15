
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ColumnDefinition, Case, User, SystemSettings, SystemTag } from '../../types';
import { CaseCard } from '../CaseCard';
import { TRANSITION_RULES, ACTION_ZONES } from '../../constants';
import { MoveRight, FileText, AlertCircle, Sparkles, Inbox } from 'lucide-react';
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
  onContextMenu?: (e: React.MouseEvent, c: Case) => void; 
  recurrencyMap: Map<string, number>;
  users: User[];
  currentUser?: User;
  isSuggested: boolean;
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
  isCompact?: boolean;
}

const getDragFeedback = (targetColId: string, draggedCase: Case | undefined) => {
    if (!draggedCase) return null;
    
    // Check if it's a zone using the constants
    const actionZone = ACTION_ZONES.find(z => z.id === targetColId);
    if (actionZone) {
        return { label: actionZone.label, color: actionZone.colorClass, icon: actionZone.icon };
    }

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
    return { label: 'Mover para cá', color: 'bg-slate-50 border-slate-200 text-slate-500', icon: MoveRight };
};

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ 
    column, cases, draggedCase, onDrop, onDragStart, onDragEnd, onCardClick, onContextMenu, recurrencyMap, users, currentUser, isSuggested, systemSettings, systemTags, isCompact = false
}) => {
    
    // Use the injected zoneConfig instead of checking ID prefix manually
    const isZone = !!column.zoneConfig;
    const [isDragOver, setIsDragOver] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const feedback = useMemo(() => isDragOver && !isZone ? getDragFeedback(column.id, draggedCase) : null, [isDragOver, column.id, draggedCase, isZone]);
    const zoneConfig = column.zoneConfig;

    // PERFORMANCE OPTIMIZATION:
    // Only re-sort if the cases actually changed.
    // We create a "signature" of the cases (Ids + UpdateTime) to fast-check changes without deep comparison.
    const casesSignature = useMemo(() => {
        return cases.map(c => c.id + '_' + c.lastUpdate).join('|');
    }, [cases]);

    const sortedCases = useMemo(() => {
        if (isZone) return [];
        
        // Sorting logic remains the same, but now memoized against signature
        const sorted = [...cases].sort((a, b) => {
            const deadA = getDaysDiff(a.deadlineEnd);
            const deadB = getDaysDiff(b.deadlineEnd);
            const isCriticalA = deadA !== null && deadA <= 5 && deadA >= -5; 
            const isCriticalB = deadB !== null && deadB <= 5 && deadB >= -5;
            if (isCriticalA && !isCriticalB) return -1;
            if (!isCriticalA && isCriticalB) return 1;
            if (isCriticalA && isCriticalB) return (deadA || 0) - (deadB || 0);
            
            const urgencyWeight: Record<string, number> = { 'CRITICAL': 3, 'HIGH': 2, 'NORMAL': 1 };
            const weightA = urgencyWeight[a.urgency] || 1;
            const weightB = urgencyWeight[b.urgency] || 1;
            if (weightA !== weightB) return weightB - weightA;

            return new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
        });
        return sorted;
    }, [casesSignature, isZone]); // Depend on signature string, not array reference

    useEffect(() => { setVisibleCount(20); }, [cases.length, column.id]); 

    useEffect(() => {
        if (isZone) return; 
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) setVisibleCount(prev => Math.min(prev + 20, cases.length));
        }, { rootMargin: '200px' });
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [cases.length, isZone]);

    const handleDropInternal = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (draggedCase && draggedCase.columnId !== column.id) onDrop(column.id);
    };

    const visibleCases = useMemo(() => {
        const list = isZone ? [] : sortedCases.slice(0, visibleCount);
        // Ensure dragged case is visible if dropped here immediately
        if (draggedCase && draggedCase.columnId === column.id && !list.find(c => c.id === draggedCase.id)) list.push(draggedCase);
        return list;
    }, [isZone, sortedCases, visibleCount, draggedCase, column.id]);

    return (
        <div 
            className={`
                flex-shrink-0 flex flex-col rounded-2xl transition-all duration-200 relative
                ${isZone ? `w-full ${isCompact ? 'h-[50px] aspect-square flex items-center justify-center' : 'h-[100px]'} cursor-default border-2 ${isDragOver ? zoneConfig?.hoverClass : `${zoneConfig?.colorClass} hover:shadow-md`}` : 'w-[340px] h-full bg-slate-100/50 border border-slate-200/60'}
                ${isDragOver && !isZone ? 'ring-2 ring-blue-400 bg-blue-50/50 shadow-xl z-20 scale-[1.02]' : ''}
                ${isSuggested && !isDragOver && !isZone ? 'ring-2 ring-blue-300 ring-dashed bg-blue-50/20' : ''}
                ${isDragOver && isZone ? 'scale-[1.03] shadow-lg z-20' : ''}
            `}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => { e.preventDefault(); if (draggedCase && draggedCase.columnId !== column.id) setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDropInternal}
            title={isCompact && zoneConfig ? zoneConfig.label : undefined}
        >
            {isZone && zoneConfig ? (
                <div className={`flex flex-col items-center justify-center h-full pointer-events-none transition-all ${isCompact ? '' : 'p-2'}`}>
                     <zoneConfig.icon size={isCompact ? 20 : 24} className={isDragOver ? 'scale-110 transition-transform duration-200' : ''} />
                     {!isCompact && <><h3 className="font-bold text-sm mt-2 text-center leading-tight">{zoneConfig.label}</h3><p className="text-[10px] opacity-70 uppercase tracking-wide font-semibold mt-0.5 text-center">{zoneConfig.subLabel}</p></>}
                </div>
            ) : (
                <div className="p-3 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl bg-slate-100/80 backdrop-blur-md border-b border-slate-200/50">
                     <div className="flex items-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${column.color.replace('border-', 'bg-')}`}></div>
                         <h3 className="font-bold text-xs uppercase tracking-wide text-slate-500">{column.title}</h3>
                     </div>
                     <span className="bg-white/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400 shadow-sm border border-slate-100">{cases.length}</span>
                </div>
            )}

            {isDragOver && !isZone && feedback && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-[1px] rounded-2xl border-2 border-dashed border-blue-400 animate-in fade-in duration-200">
                    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg border ${feedback.color}`}>
                        <feedback.icon size={24} />
                        <span className="font-bold text-sm text-center">{feedback.label}</span>
                    </div>
                </div>
            )}

            {!isZone && (
                <div className="flex-1 overflow-y-auto p-2 space-y-2.5 kanban-scroll relative">
                    {visibleCases.length === 0 && !isDragOver && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-300 select-none">
                            <div className="w-16 h-16 bg-slate-200/50 rounded-full flex items-center justify-center mb-2"><Inbox size={32} className="opacity-50"/></div>
                            <p className="text-xs font-medium">Nenhum processo</p>
                        </div>
                    )}
                    {visibleCases.map((c) => (
                        <div key={c.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '120px' }}>
                            <CaseCard 
                                data={c}
                                recurrentCount={recurrencyMap.get(c.cpf.replace(/\D/g, '')) || 0}
                                onClick={() => onCardClick(c)}
                                onContextMenu={onContextMenu} 
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                users={users}
                                currentUser={currentUser}
                                systemSettings={systemSettings}
                                systemTags={systemTags}
                            />
                        </div>
                    ))}
                    {visibleCases.length < cases.length && <div ref={sentinelRef} className="h-4 w-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div></div>}
                </div>
            )}
        </div>
    );
});
