
import React, { useState, useMemo } from 'react';
import { X, CheckSquare, ArrowRight, Calendar, AlertCircle, Briefcase, Search, Filter, Check } from 'lucide-react';
import { Case, Task, User } from '../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../constants';
import { getDaysDiff, formatDate } from '../utils';

interface TaskCenterModalProps {
  cases: Case[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSelectCase: (c: Case) => void;
  onToggleTask: (caseId: string, taskId: string) => void;
}

export const TaskCenterModal: React.FC<TaskCenterModalProps> = ({ 
    cases, users, currentUser, onClose, onSelectCase, onToggleTask 
}) => {
  const [filterMode, setFilterMode] = useState<'MY_TASKS' | 'ALL_TASKS'>('MY_TASKS');
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten tasks from all cases into a single list
  const allTasks = useMemo(() => {
      const list: Array<{ task: Task, caseObj: Case }> = [];
      
      cases.forEach(c => {
          if (c.tasks && c.tasks.length > 0) {
              c.tasks.forEach(t => {
                  if (!t.completed) {
                      list.push({ task: t, caseObj: c });
                  }
              });
          }
      });

      // Sort: High Urgency first, then by Deadline
      return list.sort((a, b) => {
          const urgencyWeight = { 'CRITICAL': 3, 'HIGH': 2, 'NORMAL': 1 };
          const diffUrgency = urgencyWeight[b.caseObj.urgency] - urgencyWeight[a.caseObj.urgency];
          if (diffUrgency !== 0) return diffUrgency;
          
          // If urgency same, sort by deadline (closest first)
          const deadlineA = a.caseObj.deadlineEnd || '9999-99-99';
          const deadlineB = b.caseObj.deadlineEnd || '9999-99-99';
          return deadlineA.localeCompare(deadlineB);
      });
  }, [cases]);

  const filteredTasks = useMemo(() => {
      return allTasks.filter(item => {
          // 1. User Filter
          if (filterMode === 'MY_TASKS' && item.caseObj.responsibleId !== currentUser.id) return false;
          
          // 2. Search Filter
          if (searchTerm) {
              const term = searchTerm.toLowerCase();
              return (
                  item.task.text.toLowerCase().includes(term) ||
                  item.caseObj.clientName.toLowerCase().includes(term) ||
                  item.caseObj.internalId.includes(term)
              );
          }
          return true;
      });
  }, [allTasks, filterMode, searchTerm, currentUser]);

  // Grouping for display
  const groupedTasks = {
      CRITICAL: filteredTasks.filter(i => i.caseObj.urgency === 'CRITICAL'),
      HIGH: filteredTasks.filter(i => i.caseObj.urgency === 'HIGH'),
      NORMAL: filteredTasks.filter(i => i.caseObj.urgency === 'NORMAL'),
  };

  const renderTaskGroup = (title: string, tasks: typeof filteredTasks, colorClass: string, icon: any) => {
      if (tasks.length === 0) return null;
      const Icon = icon;
      
      return (
          <div className="mb-8">
              <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${colorClass}`}>
                  <Icon size={16} /> {title} ({tasks.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map((item) => {
                      const { task, caseObj } = item;
                      const ViewIcon = VIEW_CONFIG[caseObj.view]?.icon || Briefcase;
                      const daysLeft = getDaysDiff(caseObj.deadlineEnd);
                      const theme = VIEW_THEMES[caseObj.view] || VIEW_THEMES['ADMIN']; 
                      
                      return (
                          <div key={`${caseObj.id}_${task.id}`} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.bgGradient.replace('from-', 'from-slate-400 ').replace('to-', 'to-slate-500 ')}`}></div>
                              
                              <div className="pl-3 flex flex-col h-full justify-between">
                                  <div>
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                              <span className="font-bold text-slate-700">#{caseObj.internalId}</span>
                                              <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                  <ViewIcon size={10} /> {VIEW_CONFIG[caseObj.view]?.label || caseObj.view}
                                              </span>
                                          </div>
                                          {caseObj.deadlineEnd && (
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${daysLeft !== null && daysLeft <= 3 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                  <Calendar size={10}/> {daysLeft !== null && daysLeft <= 0 ? 'HOJE' : `${daysLeft}d`}
                                              </span>
                                          )}
                                      </div>
                                      
                                      <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                          <span className="truncate">{caseObj.clientName}</span>
                                          <button 
                                              onClick={() => { onClose(); onSelectCase(caseObj); }}
                                              className="text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                              title="Abrir Caso"
                                          >
                                              <ArrowRight size={14} />
                                          </button>
                                      </h4>

                                      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                          <div 
                                              onClick={() => onToggleTask(caseObj.id, task.id)}
                                              className="mt-0.5 w-5 h-5 rounded border border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer flex items-center justify-center transition-colors flex-shrink-0"
                                          ></div>
                                          <span className="text-sm text-slate-700 leading-snug">{task.text}</span>
                                      </div>
                                  </div>
                                  
                                  <div className="mt-3 flex justify-end">
                                      <button 
                                          onClick={() => onToggleTask(caseObj.id, task.id)}
                                          className="text-xs font-bold text-slate-400 hover:text-green-600 flex items-center gap-1 transition-colors"
                                      >
                                          <Check size={12} /> Marcar como Feito
                                      </button>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CheckSquare className="text-emerald-600" /> Central de Tarefas
                </h2>
                <p className="text-sm text-slate-500">Gerencie suas pendências de todos os processos.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 md:hidden">
                <X size={24} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hidden md:block">
                <X size={24} />
            </button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white px-6 py-3 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between flex-shrink-0">
            <div className="flex gap-2">
                <button 
                    onClick={() => setFilterMode('MY_TASKS')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterMode === 'MY_TASKS' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Minhas Tarefas
                </button>
                <button 
                    onClick={() => setFilterMode('ALL_TASKS')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterMode === 'ALL_TASKS' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Todas da Equipe
                </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
                <Search size={16} className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Filtrar tarefas..." 
                    className="bg-transparent text-sm w-full outline-none text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 kanban-scroll">
            {filteredTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare size={32} className="text-slate-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-600">Tudo limpo!</p>
                    <p className="text-sm">Nenhuma tarefa pendente encontrada com estes filtros.</p>
                </div>
            ) : (
                <>
                    {renderTaskGroup('Urgência Crítica', groupedTasks.CRITICAL, 'text-red-600', AlertCircle)}
                    {renderTaskGroup('Alta Prioridade', groupedTasks.HIGH, 'text-orange-600', AlertCircle)}
                    {renderTaskGroup('Tarefas Gerais', groupedTasks.NORMAL, 'text-slate-600', CheckSquare)}
                </>
            )}
            {/* Footer space */}
            <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
};
