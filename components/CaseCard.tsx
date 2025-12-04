import React, { useState } from 'react';
import { Clock, AlertCircle, Copy, Key, MessageCircle, Check, FileText, Anchor, Files, Briefcase, User, Hourglass, AlertTriangle, Tag } from 'lucide-react';
import { Case, User as UserType } from '../types';
import { getAge, getDaysDiff, getDaysSince, formatDate } from '../utils';
import { BENEFIT_OPTIONS } from '../constants';

interface CaseCardProps {
  data: Case;
  recurrentCount?: number;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onWhatsApp?: (c: Case) => void;
  users: UserType[]; // Receive users list
}

export const CaseCard: React.FC<CaseCardProps> = React.memo(({ data, recurrentCount = 0, onClick, onDragStart, onWhatsApp, users }) => {
  const [copied, setCopied] = useState<string | null>(null);
  
  // Logic to determine visual state
  const isCritical = data.urgency === 'CRITICAL';
  const isHigh = data.urgency === 'HIGH';
  
  // Find Responsible User & Color & Live Name
  const responsibleUser = users.find(u => u.id === data.responsibleId);
  const userColor = responsibleUser?.color || '#94a3b8'; // Default slate if not found
  const displayResponsibleName = responsibleUser?.name || data.responsibleName;
  
  // Alerts Calculations
  const daysUntilDeadline = getDaysDiff(data.deadlineEnd);
  const isDeadlineCritical = daysUntilDeadline !== null && daysUntilDeadline <= 2;
  const daysStagnated = getDaysSince(data.lastUpdate);
  const isStagnated = daysStagnated !== null && daysStagnated > 90;
  const daysInPhase = getDaysSince(data.lastUpdate) || 0;
  const age = getAge(data.birthDate);
  const daysToPericia = getDaysDiff(data.periciaDate);
  const isNearPericia = daysToPericia !== null && daysToPericia >= 0 && daysToPericia <= 3;
  
  // Task Progress
  const pendingTaskCount = data.tasks?.filter(t => !t.completed).length || 0;
  const totalTaskCount = data.tasks?.length || 0;
  const taskProgress = totalTaskCount > 0 ? ((totalTaskCount - pendingTaskCount) / totalTaskCount) * 100 : 0;

  // Resolve Benefit Name Safely
  const benefitOption = BENEFIT_OPTIONS.find(b => b.code === data.benefitType);
  const benefitLabel = benefitOption ? (benefitOption.label.includes(' - ') ? benefitOption.label.split(' - ')[1] : benefitOption.label) : null;

  // Action Handlers
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleWhatsAppClick = () => {
      if (onWhatsApp) {
          onWhatsApp(data);
      } else {
          if (!data.phone) return;
          const cleanPhone = data.phone.replace(/\D/g, '');
          const finalNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
          window.open(`https://wa.me/${finalNumber}`, '_blank');
      }
  };

  // Header Colors based on Urgency
  let headerBg = 'bg-slate-50 border-b border-slate-100';
  let headerText = 'text-slate-500';
  let urgencyIcon = null;

  if (isCritical) {
      headerBg = 'bg-red-50 border-b border-red-100';
      headerText = 'text-red-600';
      urgencyIcon = <AlertCircle size={14} className="text-red-500 animate-pulse" />;
  } else if (isHigh) {
      headerBg = 'bg-orange-50 border-b border-orange-100';
      headerText = 'text-orange-600';
      urgencyIcon = <AlertCircle size={14} className="text-orange-500" />;
  }

  // Left Border Status Stripe
  let statusStripeClass = 'bg-slate-300';
  if (isCritical) statusStripeClass = 'bg-red-500';
  else if (isHigh) statusStripeClass = 'bg-orange-500';
  else if (data.benefitNumber) statusStripeClass = 'bg-emerald-500';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, data.id)}
      onClick={onClick}
      className={`gpu-accelerated group relative bg-white rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 w-full border border-transparent hover:border-blue-200`}
    >
      {/* STATUS STRIPE */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStripeClass}`}></div>

      {/* 1. HEADER ROW (Colored by Urgency) */}
      <div className={`pl-6 pr-5 py-3 flex justify-between items-center ${headerBg}`}>
           <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${headerText} flex items-center gap-1`}>
                    {urgencyIcon} #{data.internalId}
                </span>
                {recurrentCount > 1 && (
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold" title="Cliente Recorrente">
                        <Files size={12} /> +{recurrentCount - 1}
                    </div>
                )}
           </div>
           <div className="flex items-center gap-3">
               <span className="text-xs font-medium text-slate-400 flex items-center gap-1" title="Dias nesta fase">
                   <Hourglass size={12} /> {daysInPhase}d
               </span>
               {/* COLORED AVATAR */}
               <div 
                   className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white" 
                   title={displayResponsibleName}
                   style={{ backgroundColor: userColor }}
               >
                    {displayResponsibleName.substring(0,2).toUpperCase()}
               </div>
           </div>
      </div>

      <div className="pl-6 pr-5 py-5">
          
          {/* 2. CLIENT INFO */}
          <div className="mb-5">
              <h4 className="font-bold text-slate-900 text-lg leading-snug mb-1 group-hover:text-blue-700 transition-colors">
                {data.clientName}
              </h4>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                  {benefitLabel && (
                      <span className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs border border-slate-100 font-semibold">
                          <Briefcase size={14} className="text-slate-400"/> {benefitLabel}
                      </span>
                  )}
                  {age !== null && (
                      <span className="flex items-center gap-1 text-xs">
                        <User size={14} className="text-slate-400"/> {age} anos
                      </span>
                  )}
              </div>
          </div>

          {/* 3. MISSING DOCS ALERT (High Priority) */}
          {data.missingDocs && data.missingDocs.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 mb-1">
                      <AlertTriangle size={12}/> Pendências
                  </p>
                  <div className="flex flex-wrap gap-1">
                      {data.missingDocs.slice(0, 3).map(doc => (
                          <span key={doc} className="text-[10px] bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded font-medium">
                              {doc}
                          </span>
                      ))}
                      {data.missingDocs.length > 3 && (
                          <span className="text-[10px] text-red-500 font-bold px-1">+{data.missingDocs.length - 3}</span>
                      )}
                  </div>
              </div>
          )}

          {/* 4. TAGS (NEW) */}
          {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                  {data.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          #{tag}
                      </span>
                  ))}
              </div>
          )}

          {/* 5. RICH BADGES */}
          <div className="flex flex-wrap gap-2 mb-5">
              {/* NB - High Priority Display */}
              {data.benefitNumber && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-emerald-100 shadow-sm w-full">
                      <Check size={14} className="bg-emerald-200 rounded-full p-0.5 text-emerald-700"/> NB: {data.benefitNumber}
                  </span>
              )}

              {/* Protocol */}
              {!data.benefitNumber && data.protocolNumber && (
                   <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border border-blue-100 w-full">
                      <FileText size={14} className="text-blue-400"/> Prot: {data.protocolNumber}
                  </span>
              )}

              {/* Alerts */}
              {isStagnated && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-gray-200" title="Processo parado há mais de 90 dias">
                      <Anchor size={12} /> +90 dias
                  </span>
              )}

              {data.periciaDate && (
                  <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border ${isNearPericia ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <Clock size={12} className={isNearPericia ? 'text-orange-500' : 'text-slate-400'} /> 
                    {isNearPericia ? 'Perícia Próxima!' : formatDate(data.periciaDate)}
                  </span>
              )}

              {data.deadlineEnd && (
                  <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 border ${isDeadlineCritical ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                      <AlertCircle size={12} /> {isDeadlineCritical ? 'PRAZO FATAL!' : formatDate(data.deadlineEnd)}
                  </span>
              )}
          </div>
          
          {/* 6. TASK PROGRESS (If checklist exists) */}
          {totalTaskCount > 0 && (
             <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                    <span>Checklist</span>
                    <span>{pendingTaskCount > 0 ? `${pendingTaskCount} pendentes` : 'Concluído'}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${taskProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${taskProgress}%` }}
                    ></div>
                </div>
             </div>
          )}

          {/* 7. FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
               <div className="text-sm font-mono text-slate-400 font-medium">
                   {data.cpf}
               </div>

               <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => handleAction(e, () => copyToClipboard(data.cpf, 'cpf'))}
                        className={`p-1.5 rounded-md transition-colors ${copied === 'cpf' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Copiar CPF"
                    >
                        {copied === 'cpf' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    {data.govPassword && (
                        <button 
                            onClick={(e) => handleAction(e, () => copyToClipboard(data.govPassword, 'pass'))}
                            className={`p-1.5 rounded-md transition-colors ${copied === 'pass' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title="Copiar Senha"
                        >
                            {copied === 'pass' ? <Check size={16} /> : <Key size={16} />}
                        </button>
                    )}
                    {data.phone && (
                        <button 
                            onClick={(e) => handleAction(e, handleWhatsAppClick)}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                            title="WhatsApp"
                        >
                            <MessageCircle size={16} />
                        </button>
                    )}
               </div>
          </div>
      </div>
    </div>
  );
});