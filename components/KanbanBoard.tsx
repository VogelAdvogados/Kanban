
import React, { useMemo } from 'react';
import { ColumnDefinition, Case, ViewType, User } from '../types';
import { CaseCard } from './CaseCard';
import { ArrowRight, FileText, Scale, Archive, Gavel, Siren, LayoutDashboard, Zap } from 'lucide-react';
import { VIEW_THEMES } from '../constants';

interface KanbanBoardProps {
  currentView: ViewType;
  columns: ColumnDefinition[];
  filteredCases: Case[];
  draggedCaseId: string | null;
  onDrop: (colId: string) => void;
  onDragStart: (id: string) => void;
  onCardClick: (c: Case) => void;
  getRecurrentCount: (cpf: string) => number;
  onWhatsApp: (c: Case) => void;
  users: User[]; // Receive users list
}

// Sub-component optimized to prevent re-rendering ALL columns when one card moves
const KanbanColumn: React.FC<{
  column: ColumnDefinition;
  cases: Case[];
  activeTheme: any;
  draggedCaseId: string | null;
  onDrop: (colId: string) => void;
  onDragStart: (id: string) => void;
  onCardClick: (c: Case) => void;
  getRecurrentCount: (cpf: string) => number;
  onWhatsApp: (c: Case) => void;
  users: User[];
}> = React.memo(({ column, cases, activeTheme, draggedCaseId, onDrop, onDragStart, onCardClick, getRecurrentCount, onWhatsApp, users }) => {
    
    const isZone = column.id.startsWith('zone_');

    const handleDropEvent = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrop(column.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    if (isZone) {
        // --- DROP ZONE RENDERING (COMPACT & VERTICAL) ---
        let ZoneIcon = ArrowRight;
        let zoneStyles = 'border-slate-300 text-slate-400 bg-white/50';
        
        if (column.id === 'zone_recurso') { ZoneIcon = FileText; zoneStyles = 'border-indigo-300 text-indigo-600 bg-indigo-50/50'; }
        if (column.id === 'zone_judicial') { ZoneIcon = Scale; zoneStyles = 'border-blue-300 text-blue-600 bg-blue-50/50'; }
        if (column.id === 'zone_arquivo') { ZoneIcon = Archive; zoneStyles = 'border-slate-300 text-slate-600 bg-slate-50/50'; }
        if (column.id === 'zone_mesa_decisao') { ZoneIcon = Gavel; zoneStyles = 'border-fuchsia-300 text-fuchsia-600 bg-fuchsia-50/50'; }
        if (column.id === 'zone_ms') { ZoneIcon = Siren; zoneStyles = 'border-red-400 text-red-600 bg-red-50/50'; }
        if (column.id === 'zone_admin') { ZoneIcon = LayoutDashboard; zoneStyles = 'border-blue-300 text-blue-600 bg-blue-50/50'; }

        return (
            <div 
                onDragOver={handleDragOver} 
                onDrop={handleDropEvent}
                className="flex flex-col w-full transition-all duration-300"
            >
                <div className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${draggedCaseId ? 'scale-105 shadow-lg bg-white opacity-100 ring-2 ring-offset-2 ring-blue-100 ' + zoneStyles : 'opacity-60 grayscale border-slate-300 bg-transparent hover:opacity-100 hover:grayscale-0'}`}>
                    <div className={`p-2.5 rounded-full bg-white shadow-sm border border-slate-100 ${draggedCaseId ? 'animate-bounce' : ''}`}>
                        <ZoneIcon size={20} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-[10px] uppercase tracking-wider leading-tight">{column.title}</h3>
                    </div>
                </div>
            </div>
        );
    }

    // --- STANDARD COLUMN RENDERING (Standard Width & Floating Header) ---
    return (
        <div onDragOver={handleDragOver} onDrop={handleDropEvent} className="flex flex-col w-96 max-h-full group/col flex-shrink-0">
            {/* Floating Header */}
            <div className={`flex justify-between items-center mb-5 px-2 pb-2 border-b-2 ${activeTheme.accent}`}>
                <div className="flex items-center gap-3">
                    <h3 className={`font-extrabold text-sm uppercase tracking-wider ${activeTheme.secondary}`}>{column.title}</h3>
                    <span className="bg-white/80 shadow-sm text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{cases.length}</span>
                </div>
            </div>
            
            {/* Card List */}
            <div className="flex-1 overflow-y-auto min-h-[150px] pb-4 pr-2 kanban-scroll rounded-xl space-y-4">
                {cases.length > 0 ? (
                    cases.map(c => (
                        <CaseCard 
                            key={c.id} 
                            data={c} 
                            recurrentCount={getRecurrentCount(c.cpf)}
                            onClick={() => onCardClick(c)} 
                            onDragStart={(e, id) => onDragStart(id)}
                            onWhatsApp={onWhatsApp}
                            users={users}
                        />
                    ))
                ) : (
                    <div className="h-40 border-2 border-dashed border-slate-200/50 rounded-2xl flex flex-col items-center justify-center text-slate-300 opacity-0 group-hover/col:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">Vazio</span>
                    </div>
                )}
            </div>
        </div>
    );
});

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  currentView, columns, filteredCases, draggedCaseId, onDrop, onDragStart, onCardClick, getRecurrentCount, onWhatsApp, users
}) => {

  const activeTheme = VIEW_THEMES[currentView];

  // Separate Standard Columns from Zones
  const standardColumns = columns.filter(c => !c.id.startsWith('zone_'));
  const zoneColumns = columns.filter(c => c.id.startsWith('zone_'));

  return (
    <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT AREA: Standard Kanban (Horizontal Scroll) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-scroll p-6 lg:p-10">
            <div className="flex h-full gap-8 min-w-max pb-4">
                {standardColumns.map((column) => (
                    <KanbanColumn 
                        key={column.id}
                        column={column}
                        cases={filteredCases.filter(c => c.columnId === column.id)}
                        activeTheme={activeTheme}
                        draggedCaseId={draggedCaseId}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onCardClick={onCardClick}
                        getRecurrentCount={getRecurrentCount}
                        onWhatsApp={onWhatsApp}
                        users={users}
                    />
                ))}
            </div>
        </div>

        {/* RIGHT AREA: Action Zones Sidebar (Vertical Stack) */}
        {zoneColumns.length > 0 && (
            <div className={`w-72 border-l border-slate-200/50 bg-slate-50/50 p-6 flex flex-col gap-4 overflow-y-auto transition-all duration-300 ${draggedCaseId ? 'translate-x-0 opacity-100 bg-blue-50/30' : ''}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Zap size={14} className={draggedCaseId ? "text-blue-500 animate-pulse" : ""}/>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ações Rápidas</span>
                </div>
                
                {zoneColumns.map((column) => (
                    <KanbanColumn 
                        key={column.id}
                        column={column}
                        cases={[]} // Zones usually don't hold cards permanently, logic handles transition
                        activeTheme={activeTheme}
                        draggedCaseId={draggedCaseId}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onCardClick={onCardClick}
                        getRecurrentCount={getRecurrentCount}
                        onWhatsApp={onWhatsApp}
                        users={users}
                    />
                ))}
            </div>
        )}
    </main>
  );
};
