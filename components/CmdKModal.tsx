import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowRight, LayoutDashboard, Stethoscope, Gavel, FileText, Scale, BarChart2, Calendar, Settings, FileCheck, CheckSquare, User, Tag } from 'lucide-react';
import { Case, ViewType } from '../types';
import { VIEW_CONFIG } from '../constants';

interface CmdKModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  onNavigate: (view: ViewType) => void;
  onAction: (action: string) => void;
}

export const CmdKModal: React.FC<CmdKModalProps> = ({ isOpen, onClose, cases, onSelectCase, onNavigate, onAction }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset state when opening
  useEffect(() => {
      if (isOpen) {
          setSearch('');
          setSelectedIndex(0);
      }
  }, [isOpen]);

  // Command Items Configuration
  const commands = useMemo(() => {
      const items = [];

      // 1. Navigation Commands
      items.push({ type: 'NAV', id: 'nav_admin', label: 'Ir para Administrativo', icon: LayoutDashboard, action: () => onNavigate('ADMIN') });
      items.push({ type: 'NAV', id: 'nav_aux', label: 'Ir para Auxílio-Doença', icon: Stethoscope, action: () => onNavigate('AUX_DOENCA') });
      items.push({ type: 'NAV', id: 'nav_mesa', label: 'Ir para Mesa de Decisão', icon: Gavel, action: () => onNavigate('MESA_DECISAO') });
      items.push({ type: 'NAV', id: 'nav_rec', label: 'Ir para Recurso Adm.', icon: FileText, action: () => onNavigate('RECURSO_ADM') });
      items.push({ type: 'NAV', id: 'nav_jud', label: 'Ir para Judicial', icon: Scale, action: () => onNavigate('JUDICIAL') });

      // 2. Tool Commands
      items.push({ type: 'TOOL', id: 'tool_dash', label: 'Abrir Dashboard', icon: BarChart2, action: () => onAction('DASHBOARD') });
      items.push({ type: 'TOOL', id: 'tool_cal', label: 'Abrir Calendário', icon: Calendar, action: () => onAction('CALENDAR') });
      items.push({ type: 'TOOL', id: 'tool_task', label: 'Central de Tarefas', icon: CheckSquare, action: () => onAction('TASKS') });
      items.push({ type: 'TOOL', id: 'tool_logs', label: 'Logs de Auditoria', icon: FileCheck, action: () => onAction('LOGS') });
      items.push({ type: 'TOOL', id: 'tool_settings', label: 'Configurações', icon: Settings, action: () => onAction('SETTINGS') });

      // 3. Case Search Results
      if (search.trim()) {
          const lowerSearch = search.toLowerCase();
          const matchedCases = cases.filter(c => 
              c.clientName.toLowerCase().includes(lowerSearch) || 
              c.internalId.includes(lowerSearch) ||
              c.cpf.includes(lowerSearch) ||
              (c.tags && c.tags.some(t => t.toLowerCase().includes(lowerSearch)))
          ).slice(0, 5); // Limit to 5 results

          matchedCases.forEach(c => {
              items.push({ 
                  type: 'CASE', 
                  id: c.id, 
                  label: `${c.clientName} (#${c.internalId})`, 
                  subLabel: `${VIEW_CONFIG[c.view]?.label || c.view}`,
                  icon: User, 
                  action: () => onSelectCase(c) 
              });
          });
      }

      // Filter commands based on search if not looking for cases specifically
      if (search.trim()) {
          return items.filter(i => i.type === 'CASE' || i.label.toLowerCase().includes(search.toLowerCase()));
      }

      return items;
  }, [search, cases, onNavigate, onAction, onSelectCase]);

  // Keyboard Navigation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!isOpen) return;

          if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex(prev => (prev + 1) % commands.length);
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
          } else if (e.key === 'Enter') {
              e.preventDefault();
              if (commands[selectedIndex]) {
                  commands[selectedIndex].action();
                  onClose();
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150 ring-1 ring-slate-900/5">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100">
            <Search className="text-slate-400 w-5 h-5 mr-3" />
            <input 
                autoFocus
                type="text" 
                placeholder="O que você procura? (Comandos, Clientes, Ferramentas...)" 
                className="flex-1 bg-transparent outline-none text-lg text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">ESC</div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
            {commands.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                    Nenhum resultado encontrado.
                </div>
            ) : (
                <div className="space-y-1">
                    {commands.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => { item.action(); onClose(); }}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${idx === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            onMouseEnter={() => setSelectedIndex(idx)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${idx === selectedIndex ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${idx === selectedIndex ? 'text-blue-900' : 'text-slate-700'}`}>{item.label}</p>
                                    {item.subLabel && <p className="text-[10px] text-slate-400">{item.subLabel}</p>}
                                </div>
                            </div>
                            {idx === selectedIndex && <ArrowRight size={16} className="text-blue-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <div className="flex gap-2">
                <span>↑↓ para navegar</span>
                <span>↵ para selecionar</span>
            </div>
            <div>Rambo Prev Command Center</div>
        </div>
      </div>
    </div>
  );
};