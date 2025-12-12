
import React, { useState, useMemo, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, HelpCircle, Briefcase, Calculator, Hash, Clock, Siren, Plus, Trash2, Calendar, Gavel, ShieldAlert, ArrowRight, LayoutList, FileInput, ChevronRight, Activity, TrendingUp, Stethoscope, MapPin, ClipboardList, Heart, Users, Wheat, Timer, Construction, Copy, Check, Edit3, MessageCircle, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { Case, MandadoSeguranca, INSSAgency, WhatsAppTemplate, Task } from '../../types';
import { BENEFIT_OPTIONS, ADMIN_COLUMNS, AUX_DOENCA_COLUMNS, JUDICIAL_COLUMNS, RECURSO_ADM_COLUMNS, DEFAULT_INSS_AGENCIES, JUDICIAL_COURTS, WHATSAPP_TEMPLATES } from '../../constants';
import { formatBenefitNumber, getDaysSince, getBenefitGroup, calculateDynamicSLA, getLocationAddress, getDaysDiff, parseLocalYMD } from '../../utils';
import { db } from '../../services/database';

interface CaseTimelineProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
  whatsAppTemplates?: WhatsAppTemplate[];
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ data, onChange, whatsAppTemplates }) => {
  const [newMS, setNewMS] = useState<Partial<MandadoSeguranca>>({ status: 'AGUARDANDO', reason: 'DEMORA_ANALISE' });
  const [showMsForm, setShowMsForm] = useState(false);
  const [copiedKit, setCopiedKit] = useState(false);
  const [agenciesList, setAgenciesList] = useState<INSSAgency[]>(DEFAULT_INSS_AGENCIES);
  
  // Predictor State
  const [dynamicSLA, setDynamicSLA] = useState<number | null>(null);

  // Load Agencies & SLA Logic Async
  useEffect(() => {
      db.getAgencies().then(list => {
          // Merge Agencies + Courts for the dropdown
          setAgenciesList([...list, ...JUDICIAL_COURTS]);
      });
      
      // Calculate Dynamic SLA for current column based on all cases
      db.getCases().then(allCases => {
          const sla = calculateDynamicSLA(allCases, data.columnId);
          setDynamicSLA(sla);
      });
  }, [data.columnId]);

  // --- LOGIC FOR VISUAL STEPPER ---
  const getSteps = () => {
      let columns = ADMIN_COLUMNS;
      if (data.view === 'AUX_DOENCA') columns = AUX_DOENCA_COLUMNS;
      if (data.view === 'JUDICIAL') columns = JUDICIAL_COLUMNS;
      if (data.view === 'RECURSO_ADM') columns = RECURSO_ADM_COLUMNS;

      // Filter out zones to show only the linear process
      return columns.filter(c => !c.id.startsWith('zone_'));
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(s => s.id === data.columnId);

  // --- BENEFIT CONTEXT ---
  const benefitGroup = getBenefitGroup(data.benefitType);
  const isIncapacity = benefitGroup === 'INCAPACITY';
  const isPension = benefitGroup === 'PENSION';
  const isRetirementAge = benefitGroup === 'RETIREMENT_AGE';
  const isRetirementTime = benefitGroup === 'RETIREMENT_TIME';
  const isSpecial = benefitGroup === 'SPECIAL';
  
  // LOGIC FLAGS
  const showPericiaPanel = data.columnId === 'aux_pericia' || data.columnId === 'jud_pericia' || !!data.periciaDate;
  const showMaintenancePanel = (data.columnId === 'aux_ativo' || data.columnId === 'adm_pagamento') && !!data.dcbDate;
  const isJudicialPericia = data.columnId === 'jud_pericia';

  // --- PROCESS CLOCK LOGIC (Relógio do MS) ---
  const processClock = useMemo(() => {
      let startDate = data.protocolDate;
      let label = 'Protocolo INSS';
      
      // Use Dynamic SLA if available, otherwise fallback to static standard
      let limit = dynamicSLA || 90; // Dynamic Average or 90
      let msLimit = 120; // Hard limit for MS doesn't change based on history usually

      // Lógica para Recurso
      if (data.view === 'RECURSO_ADM') {
          if (data.columnId.includes('camera') || data.columnId.includes('especial')) {
              startDate = data.appealEspecialDate;
              label = 'Recurso Especial (2ª Inst.)';
          } else {
              startDate = data.appealOrdinarioDate || data.appealProtocolDate;
              label = 'Recurso Ordinário (1ª Inst.)';
          }
      }

      if (!startDate) return null;

      const days = getDaysSince(startDate) || 0;
      const progress = Math.min((days / msLimit) * 100, 100);
      
      let status = 'NORMAL';
      let color = 'bg-blue-500';
      let message = dynamicSLA 
        ? `Média histórica do escritório: ${dynamicSLA} dias.` 
        : 'Dentro do prazo esperado.';

      if (days > msLimit) {
          status = 'CRITICAL';
          color = 'bg-red-500';
          message = 'Prazo de MS atingido! Demora excessiva.';
      } else if (days > limit) {
          status = 'WARNING';
          color = 'bg-orange-500';
          message = dynamicSLA 
            ? `Acima da média do escritório (${dynamicSLA} dias).` 
            : 'Atenção: Prazo administrativo extrapolado.';
      } else {
          color = 'bg-emerald-500';
      }

      return { days, label, progress, status, color, message, msLimit, limit };
  }, [data, dynamicSLA]);

  // --- MANDADO DE SEGURANÇA HANDLERS ---
  const handleAddMS = () => {
      if (!newMS.npu || !newMS.filingDate) return;
      const ms: MandadoSeguranca = {
          id: `ms_${Date.now()}`,
          npu: newMS.npu,
          filingDate: newMS.filingDate,
          reason: newMS.reason as any,
          status: newMS.status as any,
          notes: newMS.notes
      };
      onChange({ mandadosSeguranca: [...(data.mandadosSeguranca || []), ms] });
      setNewMS({ status: 'AGUARDANDO', reason: 'DEMORA_ANALISE', npu: '', filingDate: '' });
      setShowMsForm(false);
  };

  const handleDeleteMS = (id: string) => {
      onChange({ mandadosSeguranca: data.mandadosSeguranca?.filter(m => m.id !== id) });
  };

  const handleNotifyNow = () => {
      if (!data.periciaDate) {
          alert('Defina a data da perícia antes de avisar o cliente.');
          return;
      }
      
      const fullLocation = getLocationAddress(data.periciaLocation);
      const isJudicial = data.columnId === 'jud_pericia';
      
      const templates = whatsAppTemplates && whatsAppTemplates.length > 0 ? whatsAppTemplates : WHATSAPP_TEMPLATES;
      
      let template = templates.find(t => t.id === 't_aviso_pericia_imediato') || templates.find(t => t.category === 'PERICIA');
      
      let msg = '';
      if (template) {
          msg = template.text
            .replace('{NOME}', data.clientName.split(' ')[0])
            .replace('{TIPO_PERICIA}', isJudicial ? 'Justiça Federal' : 'INSS')
            .replace('{DATA_PERICIA}', new Date(data.periciaDate).toLocaleDateString())
            .replace('{HORA_PERICIA}', data.periciaTime || 'A Confirmar')
            .replace('{LOCAL_PERICIA}', fullLocation)
            .replace('{PROTOCOLO}', data.protocolNumber || 'N/A')
            .replace('{ID_INTERNO}', data.internalId);
      } else {
          msg = `Olá ${data.clientName.split(' ')[0]}, sua perícia foi agendada para ${new Date(data.periciaDate).toLocaleDateString()} às ${data.periciaTime || ''} no local: ${fullLocation}. Chegue com antecedência!`;
      }
      
      const phone = data.phone.replace(/\D/g, '');
      const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCheckHealth = () => {
      if(!data.dcbDate) return;
      const templates = whatsAppTemplates && whatsAppTemplates.length > 0 ? whatsAppTemplates : WHATSAPP_TEMPLATES;
      let template = templates.find(t => t.id === 't_check_prorrogacao') || templates.find(t => t.category === 'GERAL');

      let msg = '';
      if (template) {
          msg = template.text
            .replace('{NOME}', data.clientName.split(' ')[0])
            .replace('{DATA_DCB}', new Date(data.dcbDate).toLocaleDateString());
      } else {
          msg = `Olá ${data.clientName.split(' ')[0]}, seu benefício termina dia ${new Date(data.dcbDate).toLocaleDateString()}. Como você está se sentindo?`;
      }

      const phone = data.phone.replace(/\D/g, '');
      const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');

      // Update Contact Date and create Follow Up Task
      const newTask: Task = { id: `t_pp_follow_${Date.now()}`, text: 'Aguardando resposta sobre PP (Prorrogação)', completed: false };
      onChange({ 
          lastContactDate: new Date().toISOString(),
          tasks: [...(data.tasks || []), newTask]
      });
  };

  const getConfidenceColor = (val: number) => {
      if(val <= 1) return 'text-red-500 bg-red-50 border-red-200';
      if(val === 2) return 'text-orange-500 bg-orange-50 border-orange-200';
      if(val === 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if(val >= 4) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      return 'text-slate-500 bg-slate-50';
  };

  // --- RENDER BLOCK: PERICIA MANAGEMENT ---
  const renderPericiaBlock = () => (
      <div className={`p-4 rounded-xl border flex flex-col gap-3 relative overflow-hidden transition-all shadow-sm ${isJudicialPericia ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex justify-between items-center border-b border-black/5 pb-2 mb-1">
              <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${isJudicialPericia ? 'text-purple-800' : 'text-orange-800'}`}>
                  <Calendar size={14}/> Agendamento de Perícia
              </h4>
              <div className="flex gap-2">
                  <button 
                      onClick={handleNotifyNow}
                      className="text-[10px] bg-green-500 text-white hover:bg-green-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all"
                      title="Enviar mensagem completa (com orientações) via WhatsApp"
                  >
                      <MessageCircle size={12}/> Avisar Cliente
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data da Perícia</label>
                  <div className="relative">
                      <input 
                        type="date" 
                        className={`w-full bg-white border rounded-lg p-2 text-sm outline-none focus:ring-2 ${isJudicialPericia ? 'border-purple-300 focus:ring-purple-400' : 'border-orange-300 focus:ring-orange-400'} font-bold text-slate-700`}
                        value={data.periciaDate ? new Date(data.periciaDate).toISOString().slice(0,10) : ''}
                        onChange={e => onChange({ periciaDate: e.target.value })}
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hora</label>
                  <input 
                    type="time" 
                    className={`w-full bg-white border rounded-lg p-2 text-sm outline-none focus:ring-2 ${isJudicialPericia ? 'border-purple-300 focus:ring-purple-400' : 'border-orange-300 focus:ring-orange-400'} font-bold text-slate-700`}
                    value={data.periciaTime || ''} 
                    onChange={e => onChange({ periciaTime: e.target.value })} 
                  />
              </div>
          </div>
          
          <div className="relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <MapPin size={10}/> Localização
              </label>
              <input 
                type="text" 
                placeholder={isJudicialPericia ? "Selecione a Vara Federal..." : "Selecione a Agência..."}
                className={`w-full bg-white border rounded-lg p-2 text-sm outline-none focus:ring-2 pl-3 ${isJudicialPericia ? 'border-purple-300 focus:ring-purple-400' : 'border-orange-300 focus:ring-orange-400'}`} 
                value={data.periciaLocation || ''} 
                onChange={e => onChange({ periciaLocation: e.target.value })} 
                list="agencies-timeline-list"
              />
              <datalist id="agencies-timeline-list">
                  {agenciesList.map(agency => (
                      <option key={agency.id} value={agency.name} />
                  ))}
              </datalist>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-500">
              <ShieldAlert size={12} className="text-slate-400"/>
              <span>Ao salvar, a Agenda será atualizada e uma tarefa de lembrete será criada automaticamente.</span>
          </div>
      </div>
  );

  // --- RENDER BLOCK: MAINTENANCE (DCB) ---
  const renderMaintenancePanel = () => {
      const daysLeft = getDaysDiff(data.dcbDate);
      const isWarning = daysLeft !== null && daysLeft <= 15;
      const isCritical = daysLeft !== null && daysLeft <= 5;

      return (
        <div className={`p-4 rounded-xl border flex flex-col gap-3 relative overflow-hidden transition-all shadow-sm ${isCritical ? 'bg-red-50 border-red-200' : isWarning ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex justify-between items-center border-b border-black/5 pb-2 mb-1">
                <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${isCritical ? 'text-red-800' : isWarning ? 'text-orange-800' : 'text-green-800'}`}>
                    <Activity size={14}/> Gestão de Manutenção
                </h4>
                {daysLeft !== null && daysLeft > 0 && (
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-black/10">
                        Cessa em {daysLeft} dias
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Data de Cessação (DCB)</label>
                    <input 
                        type="date" 
                        className="bg-white border rounded p-1 text-xs outline-none focus:ring-1 focus:ring-blue-300 font-bold w-32"
                        value={data.dcbDate || ''}
                        onChange={e => onChange({ dcbDate: e.target.value })}
                    />
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-black/10 relative">
                    <div 
                        className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.max(0, Math.min(100, (daysLeft || 0) / 120 * 100))}%` }}
                    ></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={handleCheckHealth}
                        className="flex-1 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-lg py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        title="Envia mensagem perguntando saúde e cria tarefa de follow-up"
                    >
                        <MessageCircle size={14}/> Checar Saúde (PP?)
                    </button>
                    <button 
                        onClick={() => onChange({ isExtension: true, columnId: 'aux_prorrogacao' })}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                        <RefreshCw size={14}/> Pedir Prorrogação
                    </button>
                </div>
                
                {data.isExtension && (
                    <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 justify-center">
                        <CheckCircle size={10}/> Pedido de Prorrogação (PP) já sinalizado
                    </div>
                )}
            </div>
        </div>
      );
  };

  // --- BENEFIT SPECIFIC PANELS ---

  // 1. PENSÃO POR MORTE
  const renderPensionPanel = () => (
      <div className="bg-pink-50 border border-pink-100 p-3 rounded-lg">
          <label className="block text-[10px] font-bold text-pink-700 uppercase mb-2 flex items-center gap-1">
              <Heart size={12}/> Detalhes do Instituidor (Falecido)
          </label>
          <div className="space-y-2">
              <div>
                  <label className="text-[10px] text-pink-600 font-bold block mb-1">Nome do Instituidor</label>
                  <input 
                      type="text" 
                      className="w-full bg-white border border-pink-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-pink-300"
                      value={data.deceasedName || ''}
                      onChange={e => onChange({ deceasedName: e.target.value })}
                      placeholder="Nome completo do falecido"
                  />
              </div>
              <div>
                  <label className="text-[10px] text-pink-600 font-bold block mb-1">Data do Óbito</label>
                  <input 
                      type="date" 
                      className="w-full bg-white border border-pink-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-pink-300"
                      value={data.deceasedDate || ''}
                      onChange={e => onChange({ deceasedDate: e.target.value })}
                  />
                  <p className="text-[9px] text-pink-500 mt-0.5">*Define a legislação aplicável (Tempus Regit Actum).</p>
              </div>
          </div>
      </div>
  );

  // 2. APOSENTADORIA (Tempo / Idade / Especial)
  const renderRetirementPanel = () => (
      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
          <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1">
              <Timer size={12}/> Cálculo de Tempo
          </label>
          <div className="flex gap-2 items-end mb-2">
              <div className="flex-1">
                  <label className="text-[10px] text-indigo-600 font-bold block mb-1">Anos</label>
                  <input 
                      type="number" 
                      className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-300 text-center font-bold"
                      value={data.contributionTimeYears || ''}
                      onChange={e => onChange({ contributionTimeYears: parseInt(e.target.value) })}
                      placeholder="0"
                  />
              </div>
              <div className="flex-1">
                  <label className="text-[10px] text-indigo-600 font-bold block mb-1">Meses</label>
                  <input 
                      type="number" 
                      className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-300 text-center font-bold"
                      value={data.contributionTimeMonths || ''}
                      onChange={e => onChange({ contributionTimeMonths: parseInt(e.target.value) })}
                      placeholder="0"
                  />
              </div>
          </div>
          {isSpecial && (
              <div className="mt-2 pt-2 border-t border-indigo-200">
                  <label className="flex items-center gap-2 text-xs text-indigo-800">
                      <Construction size={12} />
                      <span className="font-bold">Perfil Profissiográfico (PPP)</span>
                  </label>
                  <p className="text-[9px] text-indigo-500 mt-1">Verificar se há exposição a agentes nocivos e se o LTCAT está atualizado.</p>
              </div>
          )}
      </div>
  );

  // 3. RURAL / HIBRIDA
  const renderRuralPanel = () => (
      <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
          <label className="block text-[10px] font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
              <Wheat size={12}/> Prova Rural
          </label>
          <div>
              <label className="text-[10px] text-amber-600 font-bold block mb-1">Início de Prova Material</label>
              <input 
                  type="date" 
                  className="w-full bg-white border border-amber-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-300"
                  value={data.ruralProofStart || ''}
                  onChange={e => onChange({ ruralProofStart: e.target.value })}
              />
              <p className="text-[9px] text-amber-500 mt-0.5">Data do documento mais antigo (ex: Certidão Casamento).</p>
          </div>
      </div>
  );

  return (
    <div className="space-y-6">
        
        {/* 1. VISUAL STEPPER (METRÔ LINE) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <LayoutList size={14}/> Progresso do Processo
            </h3>
            <div className="flex items-center justify-between min-w-[600px] relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                
                {steps.map((step, idx) => {
                    let status = 'PENDING';
                    if (idx < currentStepIndex) status = 'COMPLETED';
                    if (idx === currentStepIndex) status = 'CURRENT';
                    
                    // Special case: Conclusion/Denied
                    if (status === 'CURRENT' && (step.id.includes('concluido') || step.id.includes('indeferido') || step.id.includes('resultado'))) {
                         status = 'FINISHED';
                    }

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative group">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all z-10
                                ${status === 'COMPLETED' ? 'bg-blue-600 border-blue-100 text-white' : ''}
                                ${status === 'CURRENT' ? 'bg-white border-blue-500 text-blue-600 shadow-md scale-110' : ''}
                                ${status === 'PENDING' ? 'bg-slate-100 border-white text-slate-400' : ''}
                                ${status === 'FINISHED' ? 'bg-emerald-500 border-emerald-100 text-white' : ''}
                            `}>
                                {status === 'COMPLETED' || status === 'FINISHED' ? <CheckCircle size={14}/> : idx + 1}
                            </div>
                            <span className={`
                                text-[10px] font-bold max-w-[80px] text-center uppercase tracking-tight
                                ${status === 'CURRENT' || status === 'FINISHED' ? 'text-slate-800' : 'text-slate-400'}
                            `}>
                                {step.title.replace(/^\d+\.\s*/, '')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 2. RELÓGIO PROCESSUAL (CONSULTIVO & PREDITIVO) */}
        {processClock && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden">
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Clock size={16} className="text-blue-600"/> Monitoramento: {processClock.label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">{processClock.message}</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${processClock.status === 'CRITICAL' ? 'text-red-600' : processClock.status === 'WARNING' ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {processClock.days} dias
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Decorridos</p>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative z-10">
                    <div 
                        className={`h-full transition-all duration-1000 ${processClock.color}`} 
                        style={{ width: `${processClock.progress}%` }}
                    ></div>
                    {/* Dynamic SLA Marker */}
                    {dynamicSLA && (
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-black/20 z-20"
                            style={{ left: `${Math.min((dynamicSLA / processClock.msLimit) * 100, 100)}%` }}
                            title={`Média do Escritório: ${dynamicSLA} dias`}
                        ></div>
                    )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 relative z-10 font-bold">
                    <span>Protocolo (Dia 0)</span>
                    <span className={dynamicSLA ? "text-blue-600" : ""}>
                        {dynamicSLA ? `Média Histórica (~${dynamicSLA}d)` : `SLA Estimado (${processClock.limit}d)`}
                    </span>
                    <span>Prazo MS ({processClock.msLimit} dias)</span>
                </div>

                {/* MS Suggestion Overlay */}
                {processClock.status === 'CRITICAL' && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded p-2 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2 text-red-700 text-xs font-bold">
                            <Siren size={14}/>
                            <span>Prazo de Mandado de Segurança atingido!</span>
                        </div>
                        <button 
                            onClick={() => setShowMsForm(true)}
                            className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold hover:bg-red-700"
                        >
                            Impetrar Agora
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* 3. DADOS DO PROCESSO (CONTEXTUAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BOX 1: REQUERIMENTO & VIABILIDADE */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase size={14}/> 1. Dados Iniciais
                </h3>
                <div className="space-y-4 flex-1">
                    {/* Espécie */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Espécie do Benefício</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 outline-none focus:border-blue-300 font-medium"
                            value={data.benefitType || ''}
                            onChange={(e) => onChange({ benefitType: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {BENEFIT_OPTIONS.map(opt => (
                                <option key={opt.code} value={opt.code}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* SHOW PERICIA MANAGEMENT BLOCK IF APPLICABLE */}
                    {showPericiaPanel && renderPericiaBlock()}

                    {/* SHOW MAINTENANCE PANEL (DCB) */}
                    {showMaintenancePanel && renderMaintenancePanel()}

                    {/* CONTEXTUAL PANELS */}
                    {/* Incapacity logic: only show simplified strategy if pericia block is not already showing details */}
                    {isIncapacity && !showPericiaPanel && !showMaintenancePanel && (
                        <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-center justify-between">
                            <label className="block text-[10px] font-bold text-orange-700 uppercase flex items-center gap-1">
                                <Stethoscope size={12}/> Tipo:
                            </label>
                            <div className="flex gap-2">
                                <button onClick={() => onChange({ strategyType: 'ATESTMED' })} className={`text-[10px] px-2 py-1 rounded border font-bold ${data.strategyType === 'ATESTMED' ? 'bg-orange-200 border-orange-300 text-orange-900' : 'bg-white border-orange-100'}`}>ATESTMED</button>
                                <button onClick={() => onChange({ strategyType: 'PRESENCIAL' })} className={`text-[10px] px-2 py-1 rounded border font-bold ${data.strategyType === 'PRESENCIAL' ? 'bg-blue-200 border-blue-300 text-blue-900' : 'bg-white border-blue-100'}`}>PRESENCIAL</button>
                            </div>
                        </div>
                    )}
                    
                    {isPension && renderPensionPanel()}
                    {(isRetirementAge || isRetirementTime || isSpecial) && renderRetirementPanel()}
                    {(data.benefitType === '48' || data.benefitType === '08') && renderRuralPanel()} {/* Híbrida/Rural explícito */}

                    {/* Protocolo - Sempre visível */}
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Protocolo INSS</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={data.protocolNumber || ''} 
                                    onChange={(e) => onChange({ protocolNumber: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 font-mono focus:border-blue-300 outline-none pl-7"
                                    placeholder="000000000"
                                />
                                <Hash size={12} className="absolute left-2.5 top-3 text-slate-400"/>
                            </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">DER (Data Entrada)</label>
                             <input 
                                type="date" 
                                value={data.protocolDate || ''} 
                                onChange={(e) => onChange({ protocolDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:border-blue-300 outline-none"
                            />
                        </div>
                    </div>

                    {/* Viabilidade e Feeling (Universal) */}
                    <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                                <Calculator size={10}/> Análise de Viabilidade
                            </h4>
                            {/* MINI CONFIDENCE SLIDER */}
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${getConfidenceColor(data.confidenceRating !== undefined ? data.confidenceRating : 3)}`}>
                                <TrendingUp size={10} />
                                <span className="text-[9px] font-bold">Confiança: {data.confidenceRating ?? 3}/5</span>
                                <input 
                                    type="range" 
                                    min="0" max="5" step="1" 
                                    className="w-12 h-1 ml-1 accent-current cursor-pointer"
                                    value={data.confidenceRating !== undefined ? data.confidenceRating : 3}
                                    onChange={(e) => onChange({ confidenceRating: parseInt(e.target.value) })}
                                    title="Ajustar Feeling (0-5)"
                                />
                            </div>
                        </div>
                        <textarea 
                            className="w-full text-xs p-2 rounded border border-blue-200 bg-white outline-none resize-none h-16"
                            placeholder="Notas técnicas sobre o caso (Simulação, RMI esperada, Pendências de CNIS...)"
                            value={data.referral || ''} 
                            onChange={(e) => onChange({ referral: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* BOX 2: CONCLUSÃO ADMINISTRATIVA */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14}/> 2. Conclusão da Análise
                </h3>
                
                <div className="space-y-4">
                    {/* NB e DDB */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NB (Número Benefício)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={data.benefitNumber || ''} 
                                    onChange={(e) => onChange({ benefitNumber: formatBenefitNumber(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 font-bold outline-none focus:border-blue-300 pl-7"
                                    placeholder="000.000.000-0"
                                    maxLength={14}
                                />
                                <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold text-xs">#</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">DDB (Data Despacho)</label>
                            <input 
                                type="date" 
                                value={data.benefitDate || ''} 
                                onChange={(e) => onChange({ benefitDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 outline-none focus:border-blue-300"
                            />
                        </div>
                    </div>

                    {/* Resultado Switch */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resultado da Análise</label>
                        <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
                             {['EM ANÁLISE', 'CONCEDIDO', 'INDEFERIDO'].map(status => {
                                 const isSelected = 
                                    (status === 'EM ANÁLISE' && (!data.tags?.includes('CONCEDIDO') && !data.tags?.includes('INDEFERIDO'))) ||
                                    (data.tags?.includes(status));
                                 
                                 let activeClass = 'bg-white text-slate-700 shadow-sm font-bold';
                                 
                                 if (status === 'CONCEDIDO' && isSelected) activeClass = 'bg-emerald-500 text-white shadow-md font-bold';
                                 if (status === 'INDEFERIDO' && isSelected) activeClass = 'bg-red-500 text-white shadow-md font-bold';
                                 if (status === 'EM ANÁLISE' && isSelected) activeClass = 'bg-blue-500 text-white shadow-md font-bold';

                                 return (
                                     <button
                                        key={status}
                                        onClick={() => {
                                            const newTags = (data.tags || []).filter(t => t !== 'CONCEDIDO' && t !== 'INDEFERIDO');
                                            if (status !== 'EM ANÁLISE') newTags.push(status);
                                            onChange({ tags: newTags });
                                        }}
                                        className={`flex-1 py-1.5 rounded-md text-[10px] uppercase transition-all ${isSelected ? activeClass : 'text-slate-400 hover:text-slate-600'}`}
                                     >
                                         {status}
                                     </button>
                                 )
                             })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. FASE RECURSAL (DIVIDIDA) */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Gavel size={14}/> Fase Recursal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1ª INSTÂNCIA */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
                    <div className="absolute -top-3 left-3 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200">
                        1ª Instância (Junta/JR)
                    </div>
                    
                    <div className="mt-2 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Protocolo Ordinário</label>
                                <input 
                                    type="text" 
                                    value={data.appealOrdinarioProtocol || data.appealProtocolNumber || ''} 
                                    onChange={(e) => onChange({ appealOrdinarioProtocol: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:border-indigo-300 outline-none"
                                    placeholder="Protocolo JR"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Recurso</label>
                                <input 
                                    type="date" 
                                    value={data.appealOrdinarioDate || data.appealProtocolDate || ''} 
                                    onChange={(e) => onChange({ appealOrdinarioDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:border-indigo-300 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status na Junta</label>
                            <select 
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs outline-none"
                                value={data.appealOrdinarioStatus || ''}
                                onChange={(e) => onChange({ appealOrdinarioStatus: e.target.value as any })}
                            >
                                <option value="">Selecione...</option>
                                <option value="AGUARDANDO">Aguardando Julgamento</option>
                                <option value="PROVIDO">Provido (Ganhou)</option>
                                <option value="IMPROVIDO">Improvido (Perdeu)</option>
                                <option value="EXIGENCIA">Em Exigência</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2ª INSTÂNCIA */}
                <div className={`bg-white p-4 rounded-lg border shadow-sm relative transition-opacity ${data.appealOrdinarioStatus === 'IMPROVIDO' ? 'opacity-100 border-slate-200' : 'opacity-70 border-dashed border-slate-300'}`}>
                    <div className="absolute -top-3 left-3 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                        2ª Instância (Câmara/CAJ)
                    </div>
                    
                    <div className="mt-2 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Protocolo Especial</label>
                                <input 
                                    type="text" 
                                    value={data.appealEspecialProtocol || ''} 
                                    onChange={(e) => onChange({ appealEspecialProtocol: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:border-purple-300 outline-none"
                                    placeholder="Protocolo CAJ"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Recurso</label>
                                <input 
                                    type="date" 
                                    value={data.appealEspecialDate || ''} 
                                    onChange={(e) => onChange({ appealEspecialDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:border-purple-300 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status na Câmara</label>
                            <select 
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs outline-none"
                                value={data.appealEspecialStatus || ''}
                                onChange={(e) => onChange({ appealEspecialStatus: e.target.value as any })}
                            >
                                <option value="">Selecione...</option>
                                <option value="AGUARDANDO">Aguardando Julgamento</option>
                                <option value="PROVIDO">Provido (Ganhou)</option>
                                <option value="IMPROVIDO">Improvido (Perdeu)</option>
                                <option value="BAIXADO">Baixado à Origem</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* 4. MANDADOS DE SEGURANÇA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Siren size={14} className="text-red-500"/> Mandados de Segurança
                </h3>
                <button 
                    onClick={() => setShowMsForm(true)}
                    className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 font-bold hover:bg-red-100 flex items-center gap-1"
                >
                    <Plus size={12}/> Adicionar MS
                </button>
             </div>

             {/* List of MS */}
             <div className="space-y-2">
                 {data.mandadosSeguranca?.map(ms => (
                     <div key={ms.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-full ${ms.status === 'SENTENCA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                 <Gavel size={16}/>
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-700">NPU: {ms.npu}</p>
                                 <p className="text-[10px] text-slate-500">Impetrado em: {new Date(ms.filingDate).toLocaleDateString()} • Motivo: {ms.reason}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-slate-200 uppercase">{ms.status}</span>
                             <button onClick={() => handleDeleteMS(ms.id)} className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 size={14}/>
                             </button>
                         </div>
                     </div>
                 ))}
                 {(!data.mandadosSeguranca || data.mandadosSeguranca.length === 0) && (
                     <div className="text-center py-4 text-slate-300 text-xs border border-dashed border-slate-200 rounded-lg">
                         Nenhum MS impetrado.
                     </div>
                 )}
             </div>

             {/* Add MS Form */}
             {showMsForm && (
                 <div className="mt-4 p-4 bg-red-50/50 rounded-lg border border-red-100 animate-in slide-in-from-top-2">
                     <h4 className="text-xs font-bold text-red-800 mb-2">Novo Mandado de Segurança</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                         <input 
                            type="text" 
                            placeholder="NPU (Processo Judicial)" 
                            className="text-xs p-2 rounded border border-red-200 outline-none"
                            value={newMS.npu}
                            onChange={e => setNewMS({...newMS, npu: e.target.value})}
                         />
                         <input 
                            type="date" 
                            className="text-xs p-2 rounded border border-red-200 outline-none"
                            value={newMS.filingDate}
                            onChange={e => setNewMS({...newMS, filingDate: e.target.value})}
                         />
                         <select 
                            className="text-xs p-2 rounded border border-red-200 outline-none bg-white"
                            value={newMS.reason}
                            onChange={e => setNewMS({...newMS, reason: e.target.value as any})}
                         >
                             <option value="DEMORA_ANALISE">Demora na Análise (45+ dias)</option>
                             <option value="DEMORA_RECURSO">Demora no Recurso</option>
                             <option value="OUTROS">Outros</option>
                         </select>
                         <select 
                            className="text-xs p-2 rounded border border-red-200 outline-none bg-white"
                            value={newMS.status}
                            onChange={e => setNewMS({...newMS, status: e.target.value as any})}
                         >
                             <option value="AGUARDANDO">Aguardando Liminar</option>
                             <option value="LIMINAR_DEFERIDA">Liminar Deferida</option>
                             <option value="LIMINAR_INDEFERIDA">Liminar Indeferida</option>
                             <option value="SENTENCA">Sentença</option>
                         </select>
                     </div>
                     <div className="flex justify-end gap-2">
                         <button onClick={() => setShowMsForm(false)} className="text-xs font-bold text-slate-500 hover:bg-white px-3 py-1 rounded">Cancelar</button>
                         <button onClick={handleAddMS} className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 shadow-sm">Salvar MS</button>
                     </div>
                 </div>
             )}
        </div>
    </div>
  );
};
