import React, { useMemo } from 'react';
import { ColumnDefinition, Case, ViewType, User } from '../types';
import { VIEW_THEMES } from '../constants';
import { ArrowRight, Zap } from 'lucide-react';
import { KanbanColumn } from './kanban/KanbanColumn';

interface KanbanBoardProps {
  cases: Case[];
  currentView: ViewType;
  columns: ColumnDefinition[];
  casesByColumn: Record<string, Case[]>; 
  recurrencyMap: Map<string, number>; 
  draggedCaseId: string | null;
  onDrop: (colId: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onCardClick: (c: Case) => void;
  onWhatsApp: (c: Case) => void;
  onQuickCheck: (c: Case) => void;
  users: User[]; 
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  cases, currentView, columns, casesByColumn, recurrencyMap, draggedCaseId, onDrop, onDragStart, onDragEnd, onCardClick, onWhatsApp, onQuickCheck, users
}) => {
  const activeTheme = VIEW_THEMES[currentView];
  const standardColumns = columns.filter(c => !c.id.startsWith('zone_'));
  const zoneColumns = columns.filter(c => c.id.startsWith('zone_'));
  
  const draggedCase = useMemo(() => cases.find(c => c.id === draggedCaseId), [cases, draggedCaseId]);

  // Logic to determine the "Suggested" next column
  const getSuggestedColumnId = () => {
      if (!draggedCase) return null;
      
      // 1. Find current column index
      const currentIndex = standardColumns.findIndex(c => c.id === draggedCase.columnId);
      
      // 2. Default: Next column in line
      if (currentIndex !== -1 && currentIndex < standardColumns.length - 1) {
          return standardColumns[currentIndex + 1].id;
      }
      
      return null;
  };

  const suggestedColId = getSuggestedColumnId();

  return (
    <main className="flex-1 flex overflow-hidden relative">
        
        {/* DRAG CONTEXT BANNER */}
        {draggedCase && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 border border-slate-700 pointer-events-none">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Movendo</span>
                    <span className="font-bold text-sm">{draggedCase.clientName}</span>
                </div>
                <ArrowRight size={16} className="text-slate-500"/>
                <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origem</span>
                     <span className="font-bold text-sm text-blue-300">{draggedCase.columnId.split('_').pop()?.toUpperCase()}</span>
                </div>
            </div>
        )}

        {/* LEFT AREA: Standard Kanban */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-scroll p-6 lg:p-10">
            <div className="flex h-full gap-8 min-w-max pb-4">
                {standardColumns.map((column) => (
                    <KanbanColumn 
                        key={column.id}
                        column={column}
                        cases={casesByColumn[column.id] || []}
                        activeTheme={activeTheme}
                        draggedCase={draggedCase}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onCardClick={onCardClick}
                        recurrencyMap={recurrencyMap}
                        onWhatsApp={onWhatsApp}
                        onQuickCheck={onQuickCheck}
                        users={users}
                        isSuggested={suggestedColId === column.id}
                    />
                ))}
            </div>
        </div>

        {/* RIGHT AREA: Action Zones */}
        {zoneColumns.length > 0 && (
            <div className={`w-72 border-l border-slate-200/50 bg-slate-50/50 p-6 flex flex-col gap-4 overflow-y-auto transition-all duration-300 ${draggedCaseId ? 'translate-x-0 opacity-100 bg-blue-50/30 shadow-inner' : ''}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Zap size={14} className={draggedCaseId ? "text-blue-500 animate-pulse" : ""}/>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ações Rápidas</span>
                </div>
                {zoneColumns.map((column) => (
                    <KanbanColumn 
                        key={column.id}
                        column={column}
                        cases={[]} 
                        activeTheme={activeTheme}
                        draggedCase={draggedCase}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onCardClick={onCardClick}
                        recurrencyMap={recurrencyMap}
                        onWhatsApp={onWhatsApp}
                        onQuickCheck={onQuickCheck}
                        users={users}
                        isSuggested={false}
                    />
                ))}
            </div>
        )}
    </main>
  );
};