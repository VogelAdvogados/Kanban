
import React, { useState } from 'react';
import { Zap, ChevronLeft } from 'lucide-react';
import { ColumnDefinition, Case, User, SystemSettings, SystemTag } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanActionZonesProps {
  zoneColumns: ColumnDefinition[];
  activeTheme: any;
  draggedCaseId: string | null;
  draggedCase: Case | undefined;
  onDrop: (colId: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onCardClick: (c: Case) => void;
  recurrencyMap: Map<string, number>;
  users: User[];
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
}

export const KanbanActionZones: React.FC<KanbanActionZonesProps> = ({
  zoneColumns, activeTheme, draggedCaseId, draggedCase, onDrop, onDragStart, onDragEnd,
  onCardClick, recurrencyMap, users, systemSettings, systemTags
}) => {
  
  const [isHovered, setIsHovered] = useState(false);
  const isDragging = !!draggedCaseId;
  const isExpanded = isDragging || isHovered;

  if (zoneColumns.length === 0) return null;

  return (
    <div 
        className={`
            border-l border-slate-200/50 bg-slate-50/80 backdrop-blur-sm 
            flex flex-col gap-4 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out relative
            ${isExpanded ? 'w-72 p-6' : 'w-16 p-2 items-center'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        {/* Header / Toggle Indicator */}
        <div className={`flex items-center gap-2 mb-2 text-slate-400 transition-all duration-300 ${isExpanded ? '' : 'justify-center py-2'}`}>
            <Zap size={isExpanded ? 14 : 20} className={`${draggedCaseId ? "text-blue-500 animate-pulse" : ""} transition-all`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                Ações Rápidas
            </span>
        </div>

        {zoneColumns.map((column) => {
            // Intelligent Visual Highlighting Logic
            let shouldPulse = false;
            
            if (draggedCase) {
                const tags = draggedCase.tags || [];
                const isDenied = tags.includes('INDEFERIDO');
                const isGranted = tags.includes('CONCEDIDO');

                // If Denied -> Highlight Judicial or Recurso
                if (isDenied && (column.id === 'zone_judicial' || column.id === 'zone_recurso')) {
                    shouldPulse = true;
                }
                // If Granted -> Highlight Arquivo/Financeiro
                if (isGranted && (column.id === 'zone_arquivo')) {
                    shouldPulse = true;
                }
            }

            return (
                <div key={column.id} className={`transition-all duration-300 ${shouldPulse ? 'animate-pulse ring-2 ring-offset-2 ring-red-400 rounded-xl' : ''} ${isExpanded ? 'w-full' : 'w-10'}`}>
                    <KanbanColumn 
                        column={column}
                        cases={[]} 
                        activeTheme={activeTheme}
                        draggedCase={draggedCase}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onCardClick={onCardClick}
                        recurrencyMap={recurrencyMap}
                        users={users}
                        isSuggested={shouldPulse} // Use suggestion visual for pulse
                        systemSettings={systemSettings}
                        systemTags={systemTags}
                        isCompact={!isExpanded} // Pass compact state
                    />
                </div>
            );
        })}
        
        {/* Toggle Hint when collapsed */}
        {!isExpanded && !isDragging && (
            <div className="mt-auto mb-4 text-slate-300 flex justify-center animate-bounce">
                <ChevronLeft size={16} />
            </div>
        )}
    </div>
  );
};
