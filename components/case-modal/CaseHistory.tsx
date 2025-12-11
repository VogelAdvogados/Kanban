

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, FileText, ArrowRight, ShieldAlert, Sparkles, AlertCircle, User, Phone, MessageCircle } from 'lucide-react';
import { Case } from '../../types';

interface CaseHistoryProps {
  data: Case;
  onAddNote: (note: string) => void;
  // Note: onAddNote in parent handles the lastContactDate logic if string contains trigger
}

export const CaseHistory: React.FC<CaseHistoryProps> = ({ data, onAddNote }) => {
  const [currentNote, setCurrentNote] = useState('');
  const [isContact, setIsContact] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // FIX: Use scrollTop on the container instead of scrollIntoView to prevent page jump
  useEffect(() => {
      if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
  }, [data.history]);

  const handleAdd = () => {
      if (currentNote.trim()) {
          const prefix = isContact ? '[CONTATO CLIENTE] ' : '';
          onAddNote(prefix + currentNote);
          setCurrentNote('');
          setIsContact(false);
      }
  };

  const getActionIcon = (action: string, details: string) => {
      if (action.includes('WhatsApp') || details.includes('[WHATSAPP]')) return <MessageCircle size={12} />;
      if (action.includes('Nota') && details.includes('[CONTATO')) return <Phone size={12} />;
      if (action.includes('Nota')) return <MessageSquare size={12} />;
      if (action.includes('Movimentação')) return <ArrowRight size={12} />;
      if (action.includes('Criação')) return <Sparkles size={12} />;
      if (action.includes('Segurança') || action.includes('MS')) return <ShieldAlert size={12} />;
      if (action.includes('Edição') || action.includes('Atualização') || action.includes('Documentos')) return <FileText size={12} />;
      return <AlertCircle size={12} />;
  };

  const getActionColor = (action: string, details: string) => {
      if (action.includes('WhatsApp') || details.includes('[WHATSAPP]')) return 'bg-green-500 text-white border-green-600 shadow-md';
      if (action.includes('Nota') && details.includes('[CONTATO')) return 'bg-green-100 text-green-600 border-green-200';
      if (action.includes('Nota')) return 'bg-blue-100 text-blue-600 border-blue-200';
      if (action.includes('Movimentação')) return 'bg-purple-100 text-purple-600 border-purple-200';
      if (action.includes('Criação')) return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      if (action.includes('Segurança')) return 'bg-red-100 text-red-600 border-red-200';
      return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
         <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <MessageSquare size={14}/> Linha do Tempo
             </h3>
         </div>
         
         <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-0 bg-white kanban-scroll relative">
             {data.history.length === 0 && (
                 <div className="text-center py-10 text-slate-300 text-xs">Nenhum histórico ainda.</div>
             )}
             
             {/* Timeline Connector Line */}
             <div className="absolute left-9 top-6 bottom-6 w-px bg-slate-200"></div>

             {data.history.map((h, i) => {
                 const isNote = h.action === 'Nota Rápida';
                 const isWhatsApp = h.action.includes('WhatsApp') || (h.details && h.details.includes('[WHATSAPP]'));
                 const colorClass = getActionColor(h.action, h.details || '');

                 return (
                     <div key={h.id || i} className="relative pl-10 pb-6 group last:pb-0">
                         {/* Icon Bubble */}
                         <div className={`absolute left-5 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 ${colorClass}`}>
                             {getActionIcon(h.action, h.details || '')}
                         </div>

                         {/* Content Card */}
                         <div className={`rounded-xl p-3 border text-sm transition-all ${isWhatsApp ? 'bg-green-50 border-green-100' : isNote ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'}`}>
                             <div className="flex justify-between items-start mb-1">
                                 <span className={`font-bold text-xs ${isWhatsApp ? 'text-green-800' : isNote ? 'text-blue-700' : 'text-slate-700'}`}>
                                     {h.action}
                                 </span>
                                 <span className="text-[10px] text-slate-400">
                                     {new Date(h.date).toLocaleDateString()} • {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </span>
                             </div>
                             
                             <p className={`text-xs leading-relaxed ${isWhatsApp ? 'text-green-900 font-medium' : isNote ? 'text-blue-900' : 'text-slate-600'}`}>
                                 {h.details?.replace('[CONTATO CLIENTE]', '').replace('[WHATSAPP]', '')}
                             </p>

                             <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                 <User size={10} /> {h.user}
                             </div>
                         </div>
                     </div>
                 );
             })}
         </div>

         <div className="p-3 border-t border-slate-100 bg-white rounded-b-xl space-y-2">
             <div className="flex items-center gap-2 px-1">
                 <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none hover:bg-slate-50 px-2 py-1 rounded transition-colors">
                     <input 
                        type="checkbox" 
                        checked={isContact} 
                        onChange={(e) => setIsContact(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                     />
                     <span className={isContact ? 'font-bold text-blue-700' : ''}>Registrar como Contato Realizado (Atualiza 360º)</span>
                 </label>
             </div>
             <div className="relative">
                 <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={isContact ? "Resumo da conversa..." : "Adicionar nota ao processo..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all focus:bg-white"
                 />
                 <button 
                    onClick={handleAdd}
                    disabled={!currentNote.trim()}
                    className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white w-9 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                 >
                     <Send size={14}/>
                 </button>
             </div>
         </div>
    </div>
  );
};