
import React from 'react';
import { Zap } from 'lucide-react';
import { ColumnDefinition, Case, User, SmartAction, SystemSettings, SystemTag, StickyNote } from '../../types';
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
  onWhatsApp: (c: Case) => void;
  onQuickCheck: (c: Case) => void;
  onSmartAction: (c: Case, action: SmartAction) => void;
  onStickyNote: (c: Case, note?: StickyNote) => void;
  onSchedule?: (c: Case) => void; // NEW
  users: User[];
  systemSettings: SystemSettings;
  systemTags: SystemTag[];
}

export const KanbanActionZones: React.FC<KanbanActionZonesProps> = ({
  zoneColumns, activeTheme, draggedCaseId, draggedCase, onDrop, onDragStart, onDragEnd,
  onCardClick, recurrencyMap, onWhatsApp, onQuickCheck, onSmartAction, onStickyNote, onSchedule, users, systemSettings, systemTags
}) => {
  
  if (zoneColumns.length === 0) return null;

  return (
    <div className={`w-72 border-l border-slate-200/50 bg-slate-50/50 p-6 flex flex-col gap-4 overflow-y-auto transition-all duration-300 ${draggedCaseId ? 'translate-x-0 opacity-100 bg-blue-50/30 shadow-inner' : ''}`}>
        <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Zap size={14} className={draggedCaseId ? "text-blue-500 animate-pulse" : ""}/>
            <span className="text-[10px] font-bold uppercase tracking-widest">Ações Rápidas</span>
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
                <div key={column.id} className={`${shouldPulse ? 'animate-pulse ring-2 ring-offset-2 ring-red-400 rounded-xl' : ''}`}>
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
                        onWhatsApp={onWhatsApp}
                        onQuickCheck={onQuickCheck}
                        onSmartAction={onSmartAction}
                        onStickyNote={onStickyNote}
                        onSchedule={onSchedule}
                        users={users}
                        isSuggested={shouldPulse} // Use suggestion visual for pulse
                        systemSettings={systemSettings}
                        systemTags={systemTags}
                    />
                </div>
            );
        })}
    </div>
  );
};
