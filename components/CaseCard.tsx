import React, { useState } from 'react';
import { Clock, AlertCircle, Copy, MessageCircle, Check, Calendar, AlertTriangle, Eye, ShieldAlert, RefreshCw, Key, CheckSquare } from 'lucide-react';
import { Case, User as UserType } from '../types';
import { getAge, getDaysDiff, getDaysSince, formatDate } from '../utils';
import { BENEFIT_OPTIONS, SUGGESTED_ACTIONS } from '../constants';

interface CaseCardProps {
  data: Case;
  recurrentCount?: number;
  onClick: () => void;
  onDragStart: (id: string) => void;
  onDragEnd?: () => void;
  onWhatsApp?: (c: Case) => void;
  onQuickCheck?: (c: Case) => void;
  users: UserType[];
  isDragging?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = React.memo(({ data, recurrentCount = 0, onClick, onDragStart, onDragEnd, onWhatsApp, onQuickCheck, users, isDragging = false }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const isCritical = data.urgency === 'CRITICAL';
  const isHigh = data.urgency === 'HIGH';

  const responsibleUser = users.find(u => u.id === data.responsibleId);
  const userColor = responsibleUser?.color || '#94a3b8';
  const displayResponsibleName = responsibleUser?.name || data.responsibleName;

  const daysUntilDeadline = getDaysDiff(data.deadlineEnd);
  const isDeadlineCritical = daysUntilDeadline !== null && daysUntilDeadline <= 2;
  const age = getAge(data.birthDate);
  const daysToPericia = getDaysDiff(data.periciaDate);
  const isNearPericia = daysToPericia !== null && daysToPericia >= 0 && daysToPericia <= 3;

  const benefitOption = BENEFIT_OPTIONS.find(b => b.code === data.benefitType);
  const benefitLabel = benefitOption ? (benefitOption.label.includes(' - ') ? benefitOption.label.split(' - ')[1] : benefitOption.label) : null;

  const suggestedAction = SUGGESTED_ACTIONS[data.columnId];

  // --- RECURSO MONITORING LOGIC ---
  const isRecursoView = data.view === 'RECURSO_ADM';
  const isRecursoAguardando = isRecursoView && (data.columnId === 'rec_aguardando' || data.columnId === 'rec_protocolado');
  
  const appealDateStr = data.appealProtocolDate || (isRecursoAguardando ? data.lastUpdate : null);
  const daysSinceAppeal = appealDateStr ? getDaysSince(appealDateStr) : 0;
  const daysSinceCheck = data.lastCheckedAt ? getDaysSince(data.lastCheckedAt) : null;
  const suggestMS = daysSinceAppeal !== null && daysSinceAppeal > 120;

  // --- TASKS PROGRESS ---
  const totalTasks = data.tasks?.length || 0;
  const completedTasks = data.tasks?.filter(t => t.completed).length || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
        .then(() => {
            setCopied(label);
            setTimeout(() => setCopied(null), 1500);
        })
        .catch(err => console.error("Falha ao copiar", err));
  };

  // Status Bar Color Logic
  let statusColorClass = 'bg-slate-300';
  if (isCritical) statusColorClass = 'bg-red-500';
  else if (isHigh) statusColorClass = 'bg-orange-500';
  else if (data.benefitNumber) statusColorClass = 'bg-emerald-500';
  else if (suggestMS) statusColorClass = 'bg-red-600';

  return (
    <div
      draggable
      onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', data.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(data.id);
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative rounded-lg cursor-pointer transition-all duration-200 select-none overflow-hidden
        ${isDragging 
            ? 'bg-slate-50 border-2 border-dashed border-slate-300 opacity-50 shadow-none' 
            : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300'
        }
      `}
    >
      {/* Left Status Stripe */}
      {!isDragging && <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${statusColorClass}`}></div>}

      <div className={`pl-3 pr-2 py-2.5 flex flex-col gap-1 ${isDragging ? 'opacity-30 grayscale' : ''}`}>
          
          {/* HEADER: ID & Badges */}
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-slate-400">#{data.internalId}</span>
                  
                  {recurrentCount > 1 && (
                      <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-bold" title="Cliente Recorrente">
                          +{recurrentCount - 1}
                      </span>
                  )}

                  {suggestMS && isRecursoView && (
                      <span className="bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 animate-pulse" title="Mais de 120 dias sem movimento. Avaliar MS.">
                          <ShieldAlert size={10} /> MS?
                      </span>
                  )}
             </div>

             <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-white flex-shrink-0 ml-1"
                style={{ backgroundColor: userColor }}
                title={displayResponsibleName}
             >
                {displayResponsibleName.substring(0,2).toUpperCase()}
             </div>
          </div>

          {/* MAIN: Client Name */}
          <div className="flex items-start justify-between gap-1 mt-0.5">
              <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 line-clamp-2">
                {data.clientName}
              </h4>
              {isCritical && !suggestMS && <AlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />}
          </div>

          {/* INFO: Benefit & Subtext */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
              {benefitLabel ? (
                  <span className="truncate max-w-[140px] bg-slate-50 px-1 rounded">{benefitLabel}</span>
              ) : (
                  <span className="italic opacity-50">Sem benefício</span>
              )}
              {age !== null && <span className="text-slate-300">•</span>}
              {age !== null && <span>{age} anos</span>}
          </div>

          {/* TASK PROGRESS BAR */}
          {totalTasks > 0 && (
              <div className="mt-1.5">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mb-0.5">
                      <span className="flex items-center gap-1"><CheckSquare size={8}/> Tarefas</span>
                      <span>{completedTasks}/{totalTasks}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                          className={`h-full rounded-full transition-all duration-500 ${taskProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          style={{ width: `${taskProgress}%` }}
                      ></div>
                  </div>
              </div>
          )}

          {/* ALERTS SECTION */}
          {isRecursoAguardando ? (
              <div className="mt-2 bg-slate-50 rounded border border-slate-100 p-2 flex items-center justify-between group/monitor">
                  <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500" title="Tempo total desde o protocolo do recurso">
                          <Clock size={10} />
                          <span>Aguardando: <b className={`text-slate-700 ${suggestMS ? 'text-red-600' : ''}`}>{daysSinceAppeal}d</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Eye size={10} className={daysSinceCheck !== null && daysSinceCheck > 15 ? 'text-orange-500' : 'text-slate-400'} />
                          <span>
                              Visto: 
                              {daysSinceCheck === null ? (
                                  <b className="text-orange-600 ml-1">Nunca</b>
                              ) : (
                                  <b className={`ml-1 ${daysSinceCheck > 15 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {daysSinceCheck === 0 ? 'Hoje' : `${daysSinceCheck}d`}
                                  </b>
                              )}
                          </span>
                      </div>
                  </div>
                  
                  {onQuickCheck && (
                      <button
                          onClick={(e) => handleAction(e, () => onQuickCheck(data))}
                          className="bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200 p-1.5 rounded shadow-sm transition-all"
                          title="Atualizar Status"
                      >
                          <RefreshCw size={12} />
                      </button>
                  )}
              </div>
          ) : (
              <div className="flex flex-wrap gap-1 mt-2 empty:mt-0">
                  {data.deadlineEnd && (
                       <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border font-bold ${isDeadlineCritical ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                           <Clock size={9} />
                           {formatDate(data.deadlineEnd).slice(0,5)}
                       </div>
                  )}
                  {data.periciaDate && (
                      <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border font-bold ${isNearPericia ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          <Calendar size={9} />
                          {formatDate(data.periciaDate).slice(0,5)}
                      </div>
                  )}
                  {data.missingDocs && data.missingDocs.length > 0 && (
                      <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border bg-red-50 border-red-100 text-red-600 font-bold" title={data.missingDocs.join(', ')}>
                          <AlertTriangle size={9} />
                          {data.missingDocs.length} pend.
                      </div>
                  )}
              </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">
               <div className="flex gap-2">
                   {data.govPassword && (
                       <button 
                            onClick={(e) => handleAction(e, () => copyToClipboard(data.govPassword, 'gov'))}
                            className={`flex items-center gap-1 text-[9px] font-bold px-1.5 rounded hover:bg-slate-100 transition-colors ${copied === 'gov' ? 'text-green-600 bg-green-50' : 'text-slate-400'}`}
                            title="Copiar Senha Gov"
                       >
                           {copied === 'gov' ? <Check size={10}/> : <Key size={10}/>} Gov
                       </button>
                   )}
                   <button 
                        onClick={(e) => handleAction(e, () => copyToClipboard(data.cpf, 'cpf'))}
                        className={`flex items-center gap-1 text-[9px] font-bold px-1.5 rounded hover:bg-slate-100 transition-colors ${copied === 'cpf' ? 'text-green-600 bg-green-50' : 'text-slate-400'}`}
                        title="Copiar CPF"
                   >
                       {copied === 'cpf' ? <Check size={10}/> : <Copy size={10}/>} CPF
                   </button>
               </div>

               <div className="flex gap-1">
                   {data.phone && onWhatsApp && (
                       <button 
                            onClick={(e) => handleAction(e, () => onWhatsApp(data))}
                            className="p-1 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                            title="WhatsApp"
                       >
                           <MessageCircle size={12}/>
                       </button>
                   )}
                   {suggestedAction && !isRecursoAguardando && (
                       <button 
                           onClick={(e) => handleAction(e, () => { /* Logic handled by suggested actions flow */ })}
                           className="flex items-center gap-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors"
                           title={suggestedAction.label}
                       >
                           <suggestedAction.icon size={10} />
                       </button>
                   )}
               </div>
          </div>
      </div>
    </div>
  );
});