
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MessageCircle, Check, Key, HeartPulse, UserCheck, TrendingUp, AlertOctagon, Siren, Plus, FileText, Search, ExternalLink, RefreshCw, AlertTriangle, Eye, Activity, CalendarPlus, CreditCard } from 'lucide-react';
import { Case, User as UserType, SmartAction, SystemSettings, SystemTag, StickyNote } from '../types';
import { getAge, getDaysDiff, formatDate, analyzeCaseHealth, getSuccessProbability, getDaysSince, parseLocalYMD } from '../utils';
import { BENEFIT_OPTIONS, SUGGESTED_ACTIONS, SMART_ACTIONS_CONFIG } from '../constants';

interface CaseCardProps {
  data: Case;
  recurrentCount?: number;
  onClick: () => void;
  onDragStart: (id: string) => void;
  onDragEnd?: () => void;
  onWhatsApp?: (c: Case) => void;
  onQuickCheck?: (c: Case) => void;
  onSmartAction?: (c: Case, action: SmartAction) => void;
  onStickyNote?: (c: Case, note?: StickyNote) => void; 
  onSchedule?: (c: Case) => void; // NEW
  users: UserType[];
  currentUser?: UserType; 
  isDragging?: boolean;
  systemSettings: SystemSettings;
  systemTags?: SystemTag[];
}

export const CaseCard: React.FC<CaseCardProps> = React.memo(({ 
    data, recurrentCount = 0, onClick, onDragStart, onDragEnd, onWhatsApp, onQuickCheck, onSmartAction, onStickyNote, onSchedule, users, currentUser, isDragging = false, systemSettings, systemTags = [] 
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{top: number, left: number} | null>(null);

  // --- ANALYTICS ---
  const health = useMemo(() => analyzeCaseHealth(data, systemSettings), [data, systemSettings]);
  const winProbability = useMemo(() => getSuccessProbability(data), [data]);

  const responsibleUser = users.find(u => u.id === data.responsibleId);
  const userColor = responsibleUser?.color || '#94a3b8';
  const displayResponsibleName = responsibleUser?.name || data.responsibleName;

  const daysUntilDeadline = getDaysDiff(data.deadlineEnd);
  const age = getAge(data.birthDate);
  
  const benefitOption = BENEFIT_OPTIONS.find(b => b.code === data.benefitType);
  const benefitLabel = benefitOption ? (benefitOption.label.includes(' - ') ? benefitOption.label.split(' - ')[1] : benefitOption.label) : null;

  // --- TIME METRICS (INTELLIGENCE) ---
  const daysInPhase = getDaysSince(data.lastUpdate);
  const daysSinceCheck = getDaysSince(data.lastCheckedAt);
  
  // Logic to determine which protocol date to show
  let protocolDateRef = data.protocolDate;
  let protocolLabel = 'Prot.';
  
  if (data.view === 'RECURSO_ADM') {
       if (data.columnId.includes('camera') || data.columnId.includes('especial')) {
           protocolDateRef = data.appealEspecialDate;
           protocolLabel = 'Rec. Esp.';
       } else {
           protocolDateRef = data.appealOrdinarioDate || data.appealProtocolNumber ? (data.appealOrdinarioDate || data.appealProtocolDate) : data.protocolDate;
           protocolLabel = 'Rec. Ord.';
       }
  }
  const daysSinceProtocol = getDaysSince(protocolDateRef);
  
  // MS ALERT LOGIC (120 Days)
  const isMsEligible = daysSinceProtocol !== null && daysSinceProtocol > 120 && (data.columnId.includes('protocolo') || data.columnId.includes('junta') || data.columnId.includes('camera'));

  // DCB MONITOR LOGIC
  const dcbInfo = useMemo(() => {
      if (!data.dcbDate) return null;
      const today = new Date();
      const dcb = parseLocalYMD(data.dcbDate);
      if(!dcb) return null;
      
      const diffTime = dcb.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const alertDays = systemSettings.pp_alert_days || 15;
      const isCritical = diffDays <= alertDays && diffDays >= 0;
      
      return { diffDays, isCritical, alertDays };
  }, [data.dcbDate, systemSettings.pp_alert_days]);


  // --- STICKY NOTE LOGIC ---
  const visibleNotes = useMemo(() => {
      if (!data.stickyNotes || !currentUser) return [];
      // Show newest first
      return data.stickyNotes.filter(note => {
          if (!note.targetId) return true;
          if (note.targetId === 'SELF') return note.authorId === currentUser.id;
          return note.targetId === currentUser.id || note.authorId === currentUser.id;
      }).reverse(); 
  }, [data.stickyNotes, currentUser]);

  const activeHoveredNote = useMemo(() => 
      visibleNotes.find(n => n.id === hoveredNoteId), 
  [visibleNotes, hoveredNoteId]);

  // --- SMART ACTIONS ---
  const smartActions = useMemo(() => {
      const baseKey = `${data.view}_${data.columnId}`;
      let config = SMART_ACTIONS_CONFIG[baseKey] || { title: 'Ações Rápidas', description: '', actions: [] };
      let dynamicActions = [...config.actions];

      if (isMsEligible) { 
          const msAction: SmartAction = {
              label: 'URGENTE: Impetrar MS (Demora)',
              targetView: 'JUDICIAL', targetColumnId: 'jud_triagem', icon: Siren,
              colorClass: 'bg-red-600 text-white hover:bg-red-700 animate-pulse', urgency: 'HIGH',
              tasksToAdd: [{id: '', text: 'Analisar viabilidade de Mandado de Segurança por demora (>120 dias)', completed: false}]
          };
          dynamicActions = [msAction, ...dynamicActions];
      }
      return { ...config, actions: dynamicActions };
  }, [data, isMsEligible]);

  const suggestedAction = SUGGESTED_ACTIONS[data.columnId];

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  const handleMsClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if(onSmartAction) {
          onSmartAction(data, {
              label: 'Impetrar Mandado de Segurança',
              targetView: data.view, 
              targetColumnId: data.columnId,
              icon: Siren,
              colorClass: 'bg-red-600 text-white',
              urgency: 'HIGH',
              tasksToAdd: [{id: 't_ms', text: 'Impetrar Mandado de Segurança por excesso de prazo', completed: false}],
              requireConfirmation: true
          });
      }
  };

  const handlePpClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if(onSmartAction) {
          onSmartAction(data, {
              label: 'Solicitar Prorrogação (PP)',
              targetView: data.view,
              targetColumnId: 'aux_prorrogacao',
              icon: RefreshCw,
              colorClass: 'bg-blue-600 text-white',
              urgency: 'HIGH',
              tasksToAdd: [{id: 't_pp', text: 'Protocolar Pedido de Prorrogação no INSS', completed: false}],
              requireConfirmation: true
          });
      }
  }

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(null), 1500); });
  };

  const handleStickyClick = (e: React.MouseEvent, note?: StickyNote) => {
      e.stopPropagation();
      e.preventDefault();
      if(onStickyNote) onStickyNote(data, note);
  };

  const handleNoteMouseEnter = (e: React.MouseEvent, noteId: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
          top: rect.top,
          left: rect.left + rect.width / 2
      });
      setHoveredNoteId(noteId);
  };

  const handleNoteMouseLeave = () => {
      setHoveredNoteId(null);
      setTooltipPos(null);
  };

  const handleCheckLink = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (suggestedAction?.url) {
          window.open(suggestedAction.url, '_blank');
          if (onQuickCheck) onQuickCheck(data);
      } else if (onQuickCheck) {
          onQuickCheck(data);
      }
  }

  let statusColorClass = 'bg-slate-300';
  if (health.status === 'CRITICAL' || data.urgency === 'CRITICAL') statusColorClass = 'bg-red-500';
  else if (health.status === 'WARNING' || data.urgency === 'HIGH') statusColorClass = 'bg-orange-500';
  else if (data.benefitNumber) statusColorClass = 'bg-emerald-500';
  else if (health.status === 'STAGNATED' || health.status === 'COBWEB') statusColorClass = 'bg-slate-500'; // Cobweb color

  const getStickyColor = (color: string) => {
      switch(color) {
          case 'RED': return 'bg-red-200 border-red-300 text-red-900 shadow-red-100';
          case 'BLUE': return 'bg-blue-200 border-blue-300 text-blue-900 shadow-blue-100';
          case 'GREEN': return 'bg-green-200 border-green-300 text-green-900 shadow-green-100';
          default: return 'bg-yellow-200 border-yellow-300 text-yellow-900 shadow-yellow-100';
      }
  };

  const getTooltipColor = (color: string) => {
      switch(color) {
          case 'RED': return 'bg-red-50 border-red-200 text-red-900 shadow-xl shadow-red-100/50';
          case 'BLUE': return 'bg-blue-50 border-blue-200 text-blue-900 shadow-xl shadow-blue-100/50';
          case 'GREEN': return 'bg-green-50 border-green-200 text-green-900 shadow-xl shadow-green-100/50';
          default: return 'bg-[#fffbeb] border-[#fde68a] text-yellow-900 shadow-xl shadow-yellow-100/50';
      }
  };

  // Determine check button color
  let checkButtonClass = 'text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-600'; // Default Blue
  if (daysSinceCheck !== null) {
      if (daysSinceCheck > 30) checkButtonClass = 'text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-600 animate-pulse'; // Late
      else if (daysSinceCheck > 15) checkButtonClass = 'text-orange-500 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-600'; // Warning
      else if (daysSinceCheck < 5) checkButtonClass = 'text-slate-400 border-slate-100 hover:bg-slate-200 hover:text-slate-600'; // Recent
  }

  // Safe tags access
  const safeTags = data.tags || [];

  return (
    <>
        {/* --- PORTAL FOR STICKY NOTE TOOLTIP (FLOATING) --- */}
        {activeHoveredNote && tooltipPos && createPortal(
            <div 
                className={`
                    fixed z-[9999] w-64 p-4 rounded-xl border animate-in fade-in zoom-in-95 duration-200 pointer-events-none
                    ${getTooltipColor(activeHoveredNote.color)}
                `}
                style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    transform: 'translate(-50%, -100%)', // Center horizontally, place above
                    marginTop: '-12px', // Gap for arrow
                }}
            >
                {/* Tape Effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/40 backdrop-blur-sm rotate-2 shadow-sm border border-white/50"></div>

                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap font-serif text-justify drop-shadow-sm">
                    {activeHoveredNote.text}
                </p>
                <div className="mt-3 pt-2 border-t border-black/5 flex justify-between items-center text-[10px] opacity-70 font-bold uppercase tracking-wider">
                    <span>{new Date(activeHoveredNote.createdAt).toLocaleDateString()}</span>
                    <span>{activeHoveredNote.authorId === currentUser?.id ? 'Eu' : activeHoveredNote.authorName.split(' ')[0]}</span>
                </div>
                
                {/* Triangle Arrow */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 border-b border-r rotate-45 bg-inherit border-inherit`}></div>
            </div>,
            document.body
        )}

        <div
        draggable
        onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', data.id);
            e.dataTransfer.effectAllowed = 'move';
            onDragStart(data.id);
        }}
        onDragEnd={onDragEnd}
        onClick={onClick}
        className={`group relative rounded-xl cursor-pointer transition-all duration-300 select-none overflow-hidden animate-scale-in
            ${isDragging 
                ? 'bg-slate-50 border-2 border-dashed border-slate-300 opacity-50 shadow-none' 
                : 'bg-white border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1'
            }
        `}
        >
        
        {/* SPIDER WEB OVERLAY */}
        {health.status === 'COBWEB' && !isDragging && (
            <div className="absolute top-0 right-0 z-0 opacity-20 pointer-events-none">
                <svg width="80" height="80" viewBox="0 0 100 100" className="text-slate-900 fill-current">
                    <path d="M100,0 L0,0 L0,100 Z" fill="none" />
                    <path d="M100,0 L50,50 M80,0 L40,40 M60,0 L30,30 M100,20 L60,60 M100,40 L70,70" stroke="currentColor" strokeWidth="1" />
                    <path d="M70,10 Q60,20 80,30 Q90,40 95,20" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                    <path d="M50,10 Q40,20 50,30 Q60,40 70,30" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                </svg>
            </div>
        )}

        {!isDragging && <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${statusColorClass}`}></div>}

        <div className={`pl-3 pr-2 py-2.5 flex flex-col gap-1.5 ${isDragging ? 'opacity-30 grayscale' : ''} relative z-10`}>
            
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{data.internalId}</span>
                    {recurrentCount > 1 && (
                        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-bold">+{recurrentCount - 1}</span>
                    )}
                </div>

                <div className="flex gap-1 items-center">
                    <div title={health.reason} className="mr-1">
                        {health.status === 'CRITICAL' ? <HeartPulse size={12} className="text-red-500 animate-pulse" /> : 
                        health.status === 'WARNING' ? <AlertOctagon size={12} className="text-orange-500" /> : 
                        health.status === 'STAGNATED' ? <Clock size={12} className="text-yellow-500" /> : 
                        health.status === 'COBWEB' ? <div className="text-[10px] bg-slate-200 px-1 rounded text-slate-600 font-bold" title="Teia de Aranha: Sem consulta há muito tempo">🕸️</div> : null}
                    </div>
                    {/* MS Alert Badge (Clickable) */}
                    {isMsEligible && (
                        <button 
                            onClick={handleMsClick}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse shadow-sm hover:bg-red-200 hover:scale-105 transition-all" 
                            title="Clique para iniciar Mandado de Segurança"
                        >
                            <Siren size={8}/> CABÍVEL MS
                        </button>
                    )}
                    {systemSettings.show_probabilities && !data.benefitNumber && (
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold border ${winProbability > 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : winProbability > 40 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            <TrendingUp size={8}/> {winProbability}%
                        </div>
                    )}
                    <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-white flex-shrink-0 ml-1"
                        style={{ backgroundColor: userColor }}
                    >
                        {displayResponsibleName.substring(0,2).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* TITLE */}
            <div className="flex items-start justify-between gap-1 relative min-h-[20px] pr-1">
                <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 line-clamp-2">
                    {data.clientName}
                </h4>
            </div>

            {/* BENEFIT & TAGS */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span className="truncate max-w-[140px] bg-slate-50 px-1 rounded">{benefitLabel || 'Sem benefício'}</span>
                {age !== null && <span className="text-slate-300">•</span>}
                {age !== null && <span>{age} anos</span>}
            </div>

            {safeTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {safeTags.slice(0, 3).map(tag => {
                        const sysTag = systemTags.find(st => st.label === tag);
                        return (
                            <span key={tag} className={`text-[9px] font-bold px-1.5 rounded-sm truncate max-w-[100px] ${sysTag ? `${sysTag.colorBg} ${sysTag.colorText}` : 'bg-slate-100 text-slate-500'}`}>
                                {tag}
                            </span>
                        )
                    })}
                    {safeTags.length > 3 && <span className="text-[9px] text-slate-400">+{safeTags.length - 3}</span>}
                </div>
            )}

            {/* DCB MONITOR (Active Benefits) */}
            {dcbInfo && (
                <div className={`mt-1 p-1.5 rounded border ${dcbInfo.isCritical ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] font-bold uppercase ${dcbInfo.isCritical ? 'text-orange-700' : 'text-green-700'}`}>
                            Cessa em {dcbInfo.diffDays} dias
                        </span>
                        {dcbInfo.isCritical && (
                            <button 
                                onClick={handlePpClick}
                                className="text-[8px] bg-white border border-orange-300 text-orange-700 px-1.5 rounded hover:bg-orange-100 font-bold"
                            >
                                Pedir PP
                            </button>
                        )}
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-black/5">
                        <div 
                            className={`h-full ${dcbInfo.isCritical ? 'bg-orange-500' : 'bg-green-500'}`} 
                            style={{ width: `${Math.max(0, Math.min(100, (dcbInfo.diffDays / 120) * 100))}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* EXIGENCY PREVIEW */}
            {data.exigencyDetails && data.columnId.includes('exigencia') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5 mt-1">
                    <p className="text-[9px] font-bold text-yellow-800 uppercase flex items-center gap-1 mb-0.5">
                        <AlertTriangle size={8}/> Exigência:
                    </p>
                    <p className="text-[10px] text-yellow-900 leading-tight line-clamp-3 italic">
                        "{data.exigencyDetails}"
                    </p>
                </div>
            )}

            {/* PERICIA PREVIEW (Updated for Judicial) */}
            {(data.columnId === 'aux_pericia' || data.columnId === 'jud_pericia') && data.periciaDate && (
                <div className="bg-orange-50 border border-orange-200 rounded p-1.5 mt-1 flex items-center gap-2">
                    <div className="bg-white p-1 rounded text-orange-600">
                        <Clock size={12}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-orange-800 uppercase truncate">
                            {data.columnId === 'jud_pericia' ? 'Perícia Judicial' : 'Perícia Agendada'}
                        </p>
                        <p className="text-[10px] text-orange-900 leading-tight truncate">
                            {new Date(data.periciaDate).toLocaleDateString('pt-BR')}
                            {data.periciaTime ? ` • ${data.periciaTime}` : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* --- DETAILED TIMELINE METRICS (INTELLIGENCE) --- */}
            <div className="flex flex-wrap gap-2 mt-1 border-t border-slate-100 pt-1.5">
                {/* 1. Days in Phase */}
                <div className="flex items-center gap-1 text-[9px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title="Tempo na fase atual">
                    <Clock size={9}/> <span className="font-bold">{daysInPhase !== null ? `${daysInPhase}d` : '-'}</span> na fase
                </div>

                {/* 2. Days Since Protocol (Smart MS Logic) */}
                {daysSinceProtocol !== null && (
                    <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${daysSinceProtocol > 120 ? 'bg-red-50 text-red-700 border-red-200 font-bold' : daysSinceProtocol > 45 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`} title="Tempo desde o protocolo/recurso">
                        <FileText size={9}/> <span className="font-bold">{daysSinceProtocol}d</span> {protocolLabel}
                    </div>
                )}

                {/* 3. Days Since Check (Traffic Light) */}
                {daysSinceCheck !== null && (
                    <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${daysSinceCheck > 30 ? 'bg-red-50 text-red-700 border-red-100' : daysSinceCheck > 15 ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`} title="Dias desde a última consulta manual">
                        <Eye size={9}/> <span className="font-bold">{daysSinceCheck}d</span> check
                    </div>
                )}
            </div>

            {/* --- STICKY NOTES ROW --- */}
            {onStickyNote && (
                <div className="flex items-center gap-2 mt-1 min-h-[24px] relative z-20">
                    <button 
                        onClick={(e) => handleStickyClick(e)}
                        className="w-5 h-5 rounded-md border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all"
                        title="Adicionar Nota"
                    >
                        <Plus size={10} strokeWidth={3} />
                    </button>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {visibleNotes.map((note, index) => (
                            <div 
                                key={note.id}
                                onMouseEnter={(e) => handleNoteMouseEnter(e, note.id)}
                                onMouseLeave={handleNoteMouseLeave}
                                onClick={(e) => handleStickyClick(e, note)}
                                className={`w-4 h-4 rounded-[2px] border shadow-sm cursor-pointer transition-transform hover:scale-125 hover:z-30 relative ${getStickyColor(note.color)} ${index % 2 === 0 ? 'rotate-3' : '-rotate-2'}`}
                            >
                                <div className="absolute top-[3px] left-[2px] right-[2px] h-[1px] bg-black/10"></div>
                                <div className="absolute top-[6px] left-[2px] right-[4px] h-[1px] bg-black/10"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FOOTER ACTIONS - ALWAYS VISIBLE */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex gap-1.5">
                    {/* CPF BUTTON (Restored/Added) */}
                    <button 
                        onClick={(e) => handleAction(e, () => copyToClipboard(data.cpf, 'cpf'))}
                        className={`flex items-center gap-1 px-1.5 py-1 rounded border transition-all ${copied === 'cpf' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'}`}
                        title="Copiar CPF"
                    >
                        <CreditCard size={10}/> <span className="text-[9px] font-bold">CPF</span> {copied === 'cpf' && <Check size={8}/>}
                    </button>

                    {/* GOV BUTTON */}
                    {data.govPassword && (
                        <button 
                            onClick={(e) => handleAction(e, () => copyToClipboard(data.govPassword, 'gov'))} 
                            className={`flex items-center gap-1 px-1.5 py-1 rounded border transition-all ${copied === 'gov' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}
                            title="Copiar Senha Gov"
                        >
                            <Key size={10}/> <span className="text-[9px] font-bold">Gov</span> {copied === 'gov' && <Check size={8}/>}
                        </button>
                    )}

                    {/* SCHEDULE BUTTON */}
                    {onSchedule && (
                        <button 
                            onClick={(e) => handleAction(e, () => onSchedule(data))}
                            className="flex items-center gap-1 px-1.5 py-1 rounded border bg-white text-slate-500 border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all"
                            title="Agendar Atendimento"
                        >
                            <CalendarPlus size={10}/> <span className="text-[9px] font-bold">Agendar</span>
                        </button>
                    )}
                </div>
                
                <div className="flex gap-1.5">
                    {data.phone && onWhatsApp && (
                        <button 
                            onClick={(e) => handleAction(e, () => onWhatsApp(data))} 
                            className="p-1 rounded bg-white border border-slate-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-600 transition-colors shadow-sm"
                            title="Chamar no WhatsApp"
                        >
                            <MessageCircle size={12}/>
                        </button>
                    )}
                    
                    {/* CONSULT BUTTON (Link + Check) - Smart Color */}
                    <button 
                        onClick={handleCheckLink}
                        className={`p-1 rounded bg-white border shadow-sm transition-colors ${checkButtonClass}`}
                        title={suggestedAction?.url ? `Consultar e Marcar Visto` : "Marcar como Consultado"}
                    >
                        {suggestedAction?.url ? <ExternalLink size={12}/> : <RefreshCw size={12}/>}
                    </button>
                </div>
            </div>
        </div>
        </div>
    </>
  );
});
