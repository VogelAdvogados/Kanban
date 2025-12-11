
import React, { useMemo } from 'react';
import { ColumnDefinition, Case, ViewType, User, SmartAction, SystemSettings, SystemTag, StickyNote } from '../types';
import { VIEW_THEMES } from '../constants';
import { KanbanColumn } from './kanban/KanbanColumn';
import { KanbanDragOverlay } from './kanban/KanbanDragOverlay';
import { KanbanActionZones } from './kanban/KanbanActionZones';

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
  onSmartAction: (c: Case, action: SmartAction) => void;
  onStickyNote: (c: Case, note?: StickyNote) => void;
  onSchedule?: (c: Case) => void; // NEW
  users: User[]; 
  currentUser?: User;
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  cases, currentView, columns, casesByColumn, recurrencyMap, draggedCaseId, onDrop, onDragStart, onDragEnd, onCardClick, onWhatsApp, onQuickCheck, onSmartAction, onStickyNote, onSchedule, users, currentUser, systemSettings, systemTags
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
        
        <KanbanDragOverlay draggedCase={draggedCase} />

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
                        onSmartAction={onSmartAction}
                        onStickyNote={onStickyNote}
                        onSchedule={onSchedule}
                        users={users}
                        currentUser={currentUser}
                        isSuggested={suggestedColId === column.id}
                        systemSettings={systemSettings}
                        systemTags={systemTags}
                    />
                ))}
            </div>
        </div>

        {/* RIGHT AREA: Action Zones */}
        <KanbanActionZones 
            zoneColumns={zoneColumns}
            activeTheme={activeTheme}
            draggedCaseId={draggedCaseId}
            draggedCase={draggedCase}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onCardClick={onCardClick}
            recurrencyMap={recurrencyMap}
            onWhatsApp={onWhatsApp}
            onQuickCheck={onQuickCheck}
            onSmartAction={onSmartAction}
            onStickyNote={onStickyNote}
            onSchedule={onSchedule}
            users={users}
            systemSettings={systemSettings}
            systemTags={systemTags}
        />
    </main>
  );
};
