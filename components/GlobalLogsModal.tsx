
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, Filter, User, ExternalLink, Activity, Settings, FileText } from 'lucide-react';
import { Case, User as UserType, SystemLog } from '../types';

interface GlobalLogsModalProps {
  cases: Case[];
  users: UserType[];
  systemLogs: SystemLog[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
}

// Interface unificada para exibição
interface UnifiedLogEntry {
    id: string;
    date: string;
    user: string;
    action: string;
    details: string;
    type: 'CASE' | 'SYSTEM';
    caseId?: string;
    caseInternalId?: string;
    caseClientName?: string;
    caseObj?: Case;
    category?: string;
}

export const GlobalLogsModal: React.FC<GlobalLogsModalProps> = ({ cases, users, systemLogs = [], onClose, onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASE' | 'SYSTEM'>('ALL');
  
  // Virtualization State
  const [displayLimit, setDisplayLimit] = useState(50);
  const observerTarget = useRef<HTMLTableRowElement>(null);

  // 1. Flatten Case Logs and Merge with System Logs
  const allLogs = useMemo(() => {
    const caseLogs: UnifiedLogEntry[] = cases.flatMap(c => 
      c.history.map(h => ({
        id: h.id,
        date: h.date,
        user: h.user,
        action: h.action,
        details: h.details || '',
        type: 'CASE',
        caseId: c.id,
        caseInternalId: c.internalId,
        caseClientName: c.clientName,
        caseObj: c
      }))
    );

    const sysLogs: UnifiedLogEntry[] = systemLogs.map(s => ({
        id: s.id,
        date: s.date,
        user: s.user,
        action: s.action,
        details: s.details,
        type: 'SYSTEM',
        category: s.category
    }));

    return [...caseLogs, ...sysLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cases, systemLogs]);

  // 2. Apply Filters
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = 
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.caseClientName && log.caseClientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.caseInternalId && log.caseInternalId.includes(searchTerm));
      
      const matchesUser = userFilter ? log.user === userFilter : true;
      const matchesType = typeFilter === 'ALL' ? true : log.type === typeFilter;

      return matchesSearch && matchesUser && matchesType;
    });
  }, [allLogs, searchTerm, userFilter, typeFilter]);

  // 3. Slice for View
  const visibleLogs = useMemo(() => {
      return filteredLogs.slice(0, displayLimit);
  }, [filteredLogs, displayLimit]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => Math.min(prev + 50, filteredLogs.length));
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredLogs.length]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-blue-600" /> Auditoria & Logs do Sistema
                </h2>
                <p className="text-sm text-slate-500">Rastreabilidade completa de Processos e Configurações.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={24} />
            </button>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-center flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 w-64">
                <Search size={16} className="text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar ação, usuário, detalhe..." 
                    className="bg-transparent text-sm w-full outline-none text-slate-700 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <Filter size={14} className="text-slate-400 uppercase font-bold text-[10px]"/>
                
                <select 
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 outline-none focus:border-blue-400"
                >
                    <option value="">Todos os Usuários</option>
                    {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    <option value="Sistema">Sistema (Automático)</option>
                </select>

                <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 outline-none focus:border-blue-400"
                >
                    <option value="ALL">Tudo</option>
                    <option value="CASE">Apenas Processos</option>
                    <option value="SYSTEM">Apenas Sistema</option>
                </select>
            </div>

            <div className="ml-auto text-xs font-bold text-slate-400">
                {filteredLogs.length} registros encontrados
            </div>
        </div>

        {/* LOGS TABLE */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 kanban-scroll">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-3 w-40">Data / Hora</th>
                        <th className="px-6 py-3 w-48">Responsável</th>
                        <th className="px-6 py-3 w-40">Tipo</th>
                        <th className="px-6 py-3 w-48">Alvo</th>
                        <th className="px-6 py-3">Detalhes da Ação</th>
                        <th className="px-6 py-3 w-16 text-right">Link</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleLogs.map((log, idx) => {
                        const userObj = users.find(u => u.name === log.user);
                        
                        let badgeClass = 'bg-slate-100 text-slate-600';
                        if (log.action.includes('Criação')) badgeClass = 'bg-emerald-100 text-emerald-700';
                        if (log.action.includes('Movimentação')) badgeClass = 'bg-blue-100 text-blue-700';
                        if (log.action.includes('Exclusão') || log.action.includes('Backup')) badgeClass = 'bg-red-100 text-red-700';
                        if (log.type === 'SYSTEM') badgeClass = 'bg-purple-100 text-purple-700';

                        return (
                            <tr key={log.id + idx} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</span>
                                        <span className="text-xs text-slate-400">{new Date(log.date).toLocaleTimeString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                                            style={{ backgroundColor: userObj?.color || '#94a3b8' }}
                                        >
                                            {(log.user || '?').substring(0,2).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">{log.user}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                                        {log.type === 'SYSTEM' ? (log.category || 'SISTEMA') : log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {log.type === 'CASE' ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">#{log.caseInternalId}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[150px]">{log.caseClientName}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Settings size={14} />
                                            <span className="text-sm font-bold">Configuração</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700">{log.action}</span>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={log.details}>
                                            {log.details}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {log.type === 'CASE' && log.caseObj ? (
                                        <button 
                                            onClick={() => { onClose(); onSelectCase(log.caseObj!); }}
                                            className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Abrir Processo"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    ) : (
                                        <span className="text-slate-200"><Settings size={16}/></span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    
                    {visibleLogs.length < filteredLogs.length && (
                         <tr ref={observerTarget}>
                             <td colSpan={6} className="py-4 text-center text-slate-400 text-xs">Carregando mais...</td>
                         </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
