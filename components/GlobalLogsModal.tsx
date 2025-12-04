import React, { useState, useMemo } from 'react';
import { X, Search, Filter, User, Calendar, ExternalLink, ArrowRight, ShieldAlert, FileText, Activity } from 'lucide-react';
import { Case, User as UserType } from '../types';
import { VIEW_CONFIG } from '../constants';

interface GlobalLogsModalProps {
  cases: Case[];
  users: UserType[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
}

export const GlobalLogsModal: React.FC<GlobalLogsModalProps> = ({ cases, users, onClose, onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // 1. Flatten and Sort Logs
  const allLogs = useMemo(() => {
    return cases.flatMap(c => 
      c.history.map(h => ({
        ...h,
        caseInternalId: c.internalId,
        caseClientName: c.clientName,
        caseView: c.view,
        caseObj: c
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cases]);

  // 2. Apply Filters
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchesSearch = 
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.caseClientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.caseInternalId.includes(searchTerm);
      
      const matchesUser = userFilter ? log.user === userFilter : true;
      const matchesAction = actionFilter ? log.action.includes(actionFilter) : true;

      return matchesSearch && matchesUser && matchesAction;
    });
  }, [allLogs, searchTerm, userFilter, actionFilter]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-blue-600" /> Central de Auditoria & Logs
                </h2>
                <p className="text-sm text-slate-500">Rastreabilidade completa de todas as ações do escritório.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 w-64">
                <Search size={16} className="text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar por cliente, ID ou detalhe..." 
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
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 outline-none focus:border-blue-400"
                >
                    <option value="">Todas as Ações</option>
                    <option value="Movimentação">Movimentações</option>
                    <option value="Criação">Criações</option>
                    <option value="Atualização">Edições</option>
                    <option value="Fluxo">Mudanças de Fluxo</option>
                    <option value="Segurança">Segurança/Senhas</option>
                </select>
            </div>

            <div className="ml-auto text-xs font-bold text-slate-400">
                {filteredLogs.length} registros encontrados
            </div>
        </div>

        {/* LOGS TABLE */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-3">Data / Hora</th>
                        <th className="px-6 py-3">Responsável</th>
                        <th className="px-6 py-3">Ação</th>
                        <th className="px-6 py-3">Processo</th>
                        <th className="px-6 py-3">Detalhes</th>
                        <th className="px-6 py-3 text-right">Link</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredLogs.map((log, idx) => {
                        const viewInfo = VIEW_CONFIG[log.caseView];
                        const userObj = users.find(u => u.name === log.user);
                        
                        // Badge Color Logic
                        let badgeClass = 'bg-slate-100 text-slate-600';
                        if (log.action.includes('Criação')) badgeClass = 'bg-green-100 text-green-700';
                        if (log.action.includes('Movimentação')) badgeClass = 'bg-blue-100 text-blue-700';
                        if (log.action.includes('Fluxo')) badgeClass = 'bg-fuchsia-100 text-fuchsia-700';
                        if (log.action.includes('Segurança')) badgeClass = 'bg-red-100 text-red-700';

                        return (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</span>
                                        <span className="text-xs text-slate-400">{new Date(log.date).toLocaleTimeString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                            style={{ backgroundColor: userObj?.color || '#94a3b8' }}
                                        >
                                            {log.user.substring(0,2).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">{log.user}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">#{log.caseInternalId}</span>
                                        <span className="text-xs text-slate-500 truncate max-w-[150px]">{log.caseClientName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-slate-600 truncate max-w-xs" title={log.details}>
                                        {log.details}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => { onClose(); onSelectCase(log.caseObj); }}
                                        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Abrir Processo"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    
                    {filteredLogs.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                Nenhum registro encontrado com os filtros atuais.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};