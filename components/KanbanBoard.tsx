
import React, { useMemo } from 'react';
import { ColumnDefinition, Case, ViewType, User, SystemSettings, SystemTag } from '../types';
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
  onContextMenu?: (e: React.MouseEvent, c: Case) => void; 
  users: User[]; 
  currentUser?: User;
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
}

export const KanbanBoard = React.memo<KanbanBoardProps>(({ 
  cases, currentView, columns, casesByColumn, recurrencyMap, draggedCaseId, onDrop, onDragStart, onDragEnd, onCardClick, onContextMenu, users, currentUser, systemSettings, systemTags
}) => {
  const activeTheme = VIEW_THEMES[currentView];
  
  // Memoize filters to prevent recalculation on every render
  const standardColumns = useMemo(() => columns.filter(c => !c.id.startsWith('zone_')), [columns]);
  const zoneColumns = useMemo(() => columns.filter(c => c.id.startsWith('zone_')), [columns]);
  
  const draggedCase = useMemo(() => cases.find(c => c.id === draggedCaseId), [cases, draggedCaseId]);

  const getSuggestedColumnId = () => {
      if (!draggedCase) return null;
      const currentIndex = standardColumns.findIndex(c => c.id === draggedCase.columnId);
      if (currentIndex !== -1 && currentIndex < standardColumns.length - 1) {
          return standardColumns[currentIndex + 1].id;
      }
      return null;
  };

  const suggestedColId = getSuggestedColumnId();

  return (
    <main className="flex-1 flex overflow-hidden relative">
        <KanbanDragOverlay draggedCase={draggedCase} />
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
                        onContextMenu={onContextMenu} 
                        recurrencyMap={recurrencyMap}
                        users={users}
                        currentUser={currentUser}
                        isSuggested={suggestedColId === column.id}
                        systemSettings={systemSettings}
                        systemTags={systemTags}
                    />
                ))}
            </div>
        </div>
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
            users={users}
            systemSettings={systemSettings}
            systemTags={systemTags}
        />
    </main>
  );
});
