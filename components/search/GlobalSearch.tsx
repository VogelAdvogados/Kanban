
// ... imports
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Clock, User, Briefcase, CheckSquare, ArrowRight, StickyNote, FileText, Paperclip, Tag, History, CornerDownRight } from 'lucide-react';
import { Case, ViewType, Task } from '../../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../../constants';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  onNavigate: (view: ViewType) => void;
  onAction: (action: string) => void;
}

type SearchResultType = 'CLIENT' | 'CASE' | 'TASK' | 'NOTE' | 'FILE' | 'HISTORY' | 'RECENT';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: React.ReactNode; // Changed to Node to support highlighting
  icon: any;
  data?: any;
  action: () => void;
  score?: number; // Internal ranking
}

// Regex escape function to prevent crashes
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper for highlighting text
const HighlightMatch = ({ text, match }: { text: string, match: string }) => {
    if (!match.trim() || !text) return <>{text || ''}</>;
    
    try {
        const escapedMatch = escapeRegExp(match);
        const parts = text.split(new RegExp(`(${escapedMatch})`, 'gi'));
        return (
            <>
                {parts.map((part, i) => 
                    part.toLowerCase() === match.toLowerCase() 
                    ? <span key={i} className="bg-yellow-200 text-slate-900 font-semibold px-0.5 rounded-[1px]">{part}</span> 
                    : part
                )}
            </>
        );
    } catch (e) {
        return <>{text}</>; // Fallback if regex fails
    }
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, cases, onSelectCase }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  // ... rest of component logic (same as original, just updating HighlightMatch usage above)
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
          setDebouncedQuery('');
          setSelectedIndex(0);
      }
  }, [isOpen]);

  // Debounce logic
  useEffect(() => {
      const timer = setTimeout(() => {
          setDebouncedQuery(query);
      }, 300); // 300ms delay to improve performance
      return () => clearTimeout(timer);
  }, [query]);

  const addToRecent = (id: string) => {
      const newRecents = [id, ...recentIds.filter(r => r !== id)].slice(0, 5);
      setRecentIds(newRecents);
      localStorage.setItem('rambo_prev_recent_search', JSON.stringify(newRecents));
  };

  const results = useMemo(() => {
      let items: SearchResult[] = [];

      // 0. Recents (if query is empty)
      if (!debouncedQuery.trim()) {
          recentIds.forEach(id => {
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

      const lowerQuery = debouncedQuery.toLowerCase();

      // 1. Exact ID Match (Highest Priority)
      const exactIdMatch = cases.find(c => c.internalId === debouncedQuery || c.internalId === debouncedQuery.toUpperCase());
      if (exactIdMatch) {
          items.push({
              id: `exact_${exactIdMatch.id}`,
              type: 'CASE',
              title: `Processo #${exactIdMatch.internalId}`,
              subtitle: <span className="text-emerald-600 font-bold">Correspondência Exata • {exactIdMatch.clientName}</span>,
              icon: Briefcase,
              data: exactIdMatch,
              action: () => { onSelectCase(exactIdMatch); addToRecent(exactIdMatch.id); onClose(); },
              score: 100
          });
      }

      // Iterate Cases once for performance
      cases.forEach(c => {
          if (c.id === exactIdMatch?.id) return; // Skip if already added

          // 2. Clients & Primary Info
          if (c.clientName.toLowerCase().includes(lowerQuery) || c.cpf.includes(lowerQuery)) {
              items.push({
                  id: `client_${c.id}`,
                  type: 'CLIENT',
                  title: c.clientName,
                  subtitle: <>CPF: <HighlightMatch text={c.cpf} match={debouncedQuery} /> • {VIEW_CONFIG[c.view]?.label}</>,
                  icon: User,
                  data: c,
                  action: () => { onSelectCase(c); addToRecent(c.id); onClose(); },
                  score: 90
              });
          }
          
          // 3. Process Data (NB, Protocol)
          else if (
              c.internalId.toLowerCase().includes(lowerQuery) || 
              (c.benefitNumber && c.benefitNumber.includes(lowerQuery)) ||
              (c.protocolNumber && c.protocolNumber.includes(lowerQuery))
          ) {
              items.push({
                  id: `case_${c.id}`,
                  type: 'CASE',
                  title: `Processo #${c.internalId}`,
                  subtitle: <>{c.clientName} • NB/Protocolo: <HighlightMatch text={c.benefitNumber || c.protocolNumber || ''} match={debouncedQuery}/></>,
                  icon: Briefcase,
                  data: c,
                  action: () => { onSelectCase(c); addToRecent(c.id); onClose(); },
                  score: 80
              });
          }

          // 4. Tags
          if (c.tags && c.tags.some(t => t.toLowerCase().includes(lowerQuery))) {
              const matchedTag = c.tags.find(t => t.toLowerCase().includes(lowerQuery));
              items.push({
                  id: `tag_${c.id}`,
                  type: 'CASE',
                  title: c.clientName,
                  subtitle: <span className="flex items-center gap-1">Tag: <span className="bg-slate-100 px-1 rounded font-bold"><HighlightMatch text={matchedTag || ''} match={debouncedQuery}/></span></span>,
                  icon: Tag,
                  data: c,
                  action: () => { onSelectCase(c); onClose(); },
                  score: 70
              });
          }

          // 5. Tasks
          c.tasks?.forEach(t => {
              if (t.text.toLowerCase().includes(lowerQuery) && !t.completed) {
                  items.push({
                      id: `task_${t.id}`,
                      type: 'TASK',
                      title: t.text, // Simplified, using highlight in render
                      subtitle: <>Tarefa pendente em: <strong>{c.clientName}</strong></>,
                      icon: CheckSquare,
                      data: c,
                      action: () => { onSelectCase(c); onClose(); },
                      score: 60
                  });
              }
          });

          // 6. Sticky Notes (Deep Search)
          c.stickyNotes?.forEach(n => {
              if (n.text.toLowerCase().includes(lowerQuery)) {
                  items.push({
                      id: `note_${n.id}`,
                      type: 'NOTE',
                      title: `Nota: "${n.text.substring(0, 30)}..."`,
                      subtitle: <>Em: <strong>{c.clientName}</strong> • Por: {n.authorName}</>,
                      icon: StickyNote,
                      data: c,
                      action: () => { onSelectCase(c); onClose(); },
                      score: 50
                  });
              }
          });

          // 7. Files (Deep Search)
          c.files?.forEach(f => {
              if (f.name.toLowerCase().includes(lowerQuery)) {
                  items.push({
                      id: `file_${f.id}`,
                      type: 'FILE',
                      title: f.name,
                      subtitle: <>Anexo em: <strong>{c.clientName}</strong></>,
                      icon: Paperclip,
                      data: c,
                      action: () => { onSelectCase(c); onClose(); },
                      score: 40
                  });
              }
          });

          // 8. History / Raio-X (Deepest Search)
          // Search only latest 20 items to performance
          // SAFEGUARD: Ensure history exists
          (c.history || []).slice(-20).forEach(h => {
              if (h.details && h.details.toLowerCase().includes(lowerQuery)) {
                  items.push({
                      id: `hist_${h.id}`,
                      type: 'HISTORY',
                      title: h.action,
                      subtitle: <><HighlightMatch text={h.details.substring(0, 60)} match={debouncedQuery}/>... em <strong>{c.clientName}</strong></>,
                      icon: History,
                      data: c,
                      action: () => { onSelectCase(c); onClose(); },
                      score: 30
                  });
              }
          });
      });

      // Sort by score then alphabetical
      return items.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 20); // Limit results
  }, [debouncedQuery, cases, recentIds]);

  // Keyboard Navigation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!isOpen) return;

          if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex(prev => (prev + 1) % results.length);
              // Auto-scroll
              if (listRef.current) {
                  const el = listRef.current.children[0].children[(selectedIndex + 1) % results.length] as HTMLElement;
                  if (el) el.scrollIntoView({ block: 'nearest' });
              }
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
              if (listRef.current) {
                  const el = listRef.current.children[0].children[(selectedIndex - 1 + results.length) % results.length] as HTMLElement;
                  if (el) el.scrollIntoView({ block: 'nearest' });
              }
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
          case 'CLIENT': return 'Clientes';
          case 'CASE': return 'Processos';
          case 'TASK': return 'Tarefas';
          case 'NOTE': return 'Notas & Post-its';
          case 'FILE': return 'Arquivos';
          case 'HISTORY': return 'Histórico (Raio-X)';
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
                placeholder="Busque tudo: Clientes, Notas, Arquivos, Tarefas..." 
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
                            <p className="text-xs opacity-70">Tente buscar por partes do nome ou conteúdo.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium">Comece a digitar para buscar...</p>
                            <p className="text-xs opacity-70">O sistema pesquisará em todos os campos.</p>
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
                                    <div className="px-3 pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 backdrop-blur z-10 flex items-center gap-2">
                                        {item.type === 'NOTE' ? <StickyNote size={10}/> : item.type === 'TASK' ? <CheckSquare size={10}/> : null}
                                        {renderGroupTitle(item.type)}
                                    </div>
                                )}
                                <button
                                    onClick={item.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${isSelected ? 'bg-white shadow-md ring-1 ring-blue-500/20 z-10 scale-[1.01]' : 'hover:bg-slate-100/50'}`}
                                >
                                    <div className={`p-2.5 rounded-lg flex-shrink-0 transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-500 group-hover:bg-white group-hover:text-blue-500'}`}>
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate flex items-center gap-2 ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                            <HighlightMatch text={item.title} match={debouncedQuery} />
                                        </h4>
                                        <div className={`text-xs truncate flex items-center gap-1 ${isSelected ? 'text-blue-600/70' : 'text-slate-400'}`}>
                                            {item.type === 'HISTORY' || item.type === 'NOTE' ? <CornerDownRight size={10} className="inline"/> : null}
                                            {item.subtitle}
                                        </div>
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
                <strong>Rambo Prev</strong> Deep Search
            </div>
        </div>

      </div>
    </div>
  );
};
