
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Clock, User, Briefcase, CheckSquare, ArrowRight } from 'lucide-react';
import { Case, ViewType, Task } from '../../types';
import { VIEW_CONFIG } from '../../constants';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  onNavigate: (view: ViewType) => void;
  onAction: (action: string) => void;
}

type SearchResultType = 'CLIENT' | 'CASE' | 'TASK' | 'RECENT';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  icon: any;
  data?: any;
  action: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, cases, onSelectCase }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>(() => {
      try {
          return JSON.parse(localStorage.getItem('rambo_prev_recent_search') || '[]');
      } catch { return []; }
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isOpen) {
          setTimeout(() => inputRef.current?.focus(), 50);
          setQuery('');
          setSelectedIndex(0);
      }
  }, [isOpen]);

  const addToRecent = (id: string) => {
      const newRecents = [id, ...recentIds.filter(r => r !== id)].slice(0, 5);
      setRecentIds(newRecents);
      localStorage.setItem('rambo_prev_recent_search', JSON.stringify(newRecents));
  };

  const results = useMemo(() => {
      let items: SearchResult[] = [];

      // 0. Recents (if query is empty)
      if (!query.trim()) {
          recentIds.forEach(id => {
              // Try to find in cases
              const c = cases.find(x => x.id === id);
              if (c) {
                  items.push({
                      id: `recent_${c.id}`,
                      type: 'RECENT',
                      title: c.clientName,
                      subtitle: `Recente • ${c.internalId}`,
                      icon: Clock,
                      data: c,
                      action: () => { onSelectCase(c); addToRecent(c.id); onClose(); }
                  });
              }
          });
          return items;
      }

      const lowerQuery = query.toLowerCase();

      // 1. Exact ID Match (Priority 1)
      const exactIdMatch = cases.find(c => c.internalId === query || c.internalId === query.toUpperCase());
      if (exactIdMatch) {
          items.push({
              id: `exact_${exactIdMatch.id}`,
              type: 'CASE',
              title: `Processo #${exactIdMatch.internalId}`,
              subtitle: `Correspondência Exata • ${exactIdMatch.clientName}`,
              icon: Briefcase,
              data: exactIdMatch,
              action: () => { onSelectCase(exactIdMatch); addToRecent(exactIdMatch.id); onClose(); }
          });
      }

      // 2. Clients (Grouped by Case)
      const uniqueClients = new Set();
      cases.forEach(c => {
          if (c.clientName.toLowerCase().includes(lowerQuery) || c.cpf.includes(lowerQuery)) {
              if (!uniqueClients.has(c.cpf) && c.id !== exactIdMatch?.id) {
                  uniqueClients.add(c.cpf);
                  items.push({
                      id: `client_${c.id}`,
                      type: 'CLIENT',
                      title: c.clientName,
                      subtitle: `CPF: ${c.cpf} • Último caso: ${VIEW_CONFIG[c.view]?.label}`,
                      icon: User,
                      data: c,
                      action: () => { onSelectCase(c); addToRecent(c.id); onClose(); }
                  });
              }
          }
      });

      // 3. Cases (By Protocol, NB or Partial ID)
      cases.forEach(c => {
          if (c.id === exactIdMatch?.id) return; // Skip if already added
          
          if (
              c.internalId.toLowerCase().includes(lowerQuery) || 
              (c.benefitNumber && c.benefitNumber.includes(lowerQuery)) ||
              (c.protocolNumber && c.protocolNumber.includes(lowerQuery))
          ) {
              items.push({
                  id: `case_${c.id}`,
                  type: 'CASE',
                  title: `Processo #${c.internalId}`,
                  subtitle: `${c.clientName} • ${VIEW_CONFIG[c.view]?.label} • ${c.columnId.replace(/_/g, ' ')}`,
                  icon: Briefcase,
                  data: c,
                  action: () => { onSelectCase(c); addToRecent(c.id); onClose(); }
              });
          }
      });

      // 4. Tasks
      cases.forEach(c => {
          c.tasks?.forEach(t => {
              if (t.text.toLowerCase().includes(lowerQuery) && !t.completed) {
                  items.push({
                      id: `task_${t.id}`,
                      type: 'TASK',
                      title: t.text,
                      subtitle: `Tarefa em: ${c.clientName}`,
                      icon: CheckSquare,
                      data: c,
                      action: () => { onSelectCase(c); onClose(); } // Open case to see task
                  });
              }
          });
      });

      return items.slice(0, 15); // Limit results
  }, [query, cases, recentIds]);

  // Keyboard Navigation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!isOpen) return;

          if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex(prev => (prev + 1) % results.length);
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          } else if (e.key === 'Enter') {
              e.preventDefault();
              if (results[selectedIndex]) {
                  results[selectedIndex].action();
              }
          } else if (e.key === 'Escape') {
              onClose();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  const renderGroupTitle = (type: string) => {
      switch(type) {
          case 'RECENT': return 'Acessados Recentemente';
          case 'CLIENT': return 'Clientes Encontrados';
          case 'CASE': return 'Processos';
          case 'TASK': return 'Tarefas Pendentes';
          default: return 'Resultados';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-900/10 transform transition-all">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100 bg-white">
            <Search className="text-slate-400 w-6 h-6 mr-3" />
            <input 
                ref={inputRef}
                type="text" 
                placeholder="Buscar clientes, processos, tarefas..." 
                className="flex-1 bg-transparent outline-none text-xl text-slate-700 placeholder:text-slate-300 font-medium"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            />
            <div 
                onClick={onClose}
                className="ml-2 p-1 bg-slate-100 rounded text-xs font-bold text-slate-400 cursor-pointer hover:bg-slate-200"
            >
                ESC
            </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto bg-slate-50/50" ref={listRef}>
            {results.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                    <Search size={48} className="opacity-10 mb-2" />
                    {query ? (
                        <>
                            <p className="text-sm font-medium">Nenhum resultado encontrado.</p>
                            <p className="text-xs opacity-70">Tente buscar por nome, CPF ou número do processo.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium">Comece a digitar para buscar...</p>
                            <p className="text-xs opacity-70">Encontre qualquer coisa no escritório.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="p-2 space-y-1">
                    {results.map((item, idx) => {
                        const isSelected = idx === selectedIndex;
                        const showHeader = idx === 0 || results[idx - 1].type !== item.type;

                        return (
                            <React.Fragment key={item.id}>
                                {showHeader && (
                                    <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 backdrop-blur z-10">
                                        {renderGroupTitle(item.type)}
                                    </div>
                                )}
                                <button
                                    onClick={item.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${isSelected ? 'bg-white shadow-sm ring-1 ring-blue-500/20 z-10' : 'hover:bg-slate-100/50'}`}
                                >
                                    <div className={`p-2.5 rounded-lg flex-shrink-0 transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-500 group-hover:bg-white group-hover:text-blue-500'}`}>
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                            {item.title}
                                        </h4>
                                        <p className={`text-xs truncate ${isSelected ? 'text-blue-600/70' : 'text-slate-400'}`}>
                                            {item.subtitle}
                                        </p>
                                    </div>
                                    {isSelected && <ArrowRight size={18} className="text-blue-500 animate-pulse mr-2" />}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400">
            <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-300 rounded px-1 font-sans">↵</kbd> selecionar</span>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-300 rounded px-1 font-sans">↑↓</kbd> navegar</span>
            </div>
            <div>
                <strong>Rambo Prev</strong> Busca Otimizada
            </div>
        </div>

      </div>
    </div>
  );
};
