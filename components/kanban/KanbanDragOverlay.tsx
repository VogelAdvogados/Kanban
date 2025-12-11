
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Case } from '../../types';

interface KanbanDragOverlayProps {
  draggedCase: Case | undefined;
}

export const KanbanDragOverlay: React.FC<KanbanDragOverlayProps> = ({ draggedCase }) => {
  if (!draggedCase) return null;

  return (
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
  );
};
