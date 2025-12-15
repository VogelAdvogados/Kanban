
import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, MessageCircle, AlertTriangle, 
  Trash2, StickyNote, RefreshCw, Copy, ExternalLink, FileText
} from 'lucide-react';
import { Case } from '../../types';

interface ContextMenuProps {
  x: number;
  y: number;
  caseItem: Case;
  onClose: () => void;
  onAction: (action: string, caseItem: Case) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, caseItem, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', onClose, true); // Close on scroll
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  // Prevent menu from going off-screen
  const style = {
    top: y,
    left: x,
  };
  
  // Adjust if too close to edges (simplified logic)
  if (window.innerHeight - y < 350) style.top = y - 300;
  if (window.innerWidth - x < 200) style.left = x - 200;

  return (
    <div 
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-slate-200 w-56 py-1.5 animate-in fade-in zoom-in-95 duration-100 flex flex-col"
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
        <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-bold text-slate-800 truncate">{caseItem.clientName}</p>
            <p className="text-[10px] text-slate-400">#{caseItem.internalId}</p>
        </div>

        <button onClick={() => onAction('OPEN', caseItem)} className="text-left px-3 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <ExternalLink size={14} className="text-slate-400"/> Abrir Detalhes
        </button>
        <button onClick={() => onAction('WHATSAPP', caseItem)} className="text-left px-3 py-2 hover:bg-green-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <MessageCircle size={14} className="text-green-500"/> Abrir WhatsApp
        </button>
        
        <div className="h-px bg-slate-100 my-1"></div>

        <button onClick={() => onAction('DOC_GEN', caseItem)} className="text-left px-3 py-2 hover:bg-blue-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <FileText size={14} className="text-blue-500"/> Gerar Documento
        </button>

        <div className="h-px bg-slate-100 my-1"></div>

        <button onClick={() => onAction('NOTE', caseItem)} className="text-left px-3 py-2 hover:bg-yellow-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <StickyNote size={14} className="text-yellow-500"/> Nota Rápida
        </button>
        <button onClick={() => onAction('PRIORITY', caseItem)} className="text-left px-3 py-2 hover:bg-red-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500"/> Marcar Prioridade
        </button>
        <button onClick={() => onAction('CHECK', caseItem)} className="text-left px-3 py-2 hover:bg-blue-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <RefreshCw size={14} className="text-blue-500"/> Registrar Consulta
        </button>

        <div className="h-px bg-slate-100 my-1"></div>

        <button onClick={() => onAction('COPY_ID', caseItem)} className="text-left px-3 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2">
            <Copy size={14} className="text-slate-400"/> Copiar ID
        </button>
    </div>
  );
};
