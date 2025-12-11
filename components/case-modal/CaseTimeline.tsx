
import React, { useState, useMemo, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, HelpCircle, Briefcase, Calculator, Hash, Clock, Siren, Plus, Trash2, Calendar, Gavel, ShieldAlert, ArrowRight, LayoutList, FileInput, ChevronRight, Activity, TrendingUp, Stethoscope, MapPin, ClipboardList, Heart, Users, Wheat, Timer, Construction, Copy, Check } from 'lucide-react';
import { Case, MandadoSeguranca, INSSAgency } from '../../types';
import { BENEFIT_OPTIONS, ADMIN_COLUMNS, AUX_DOENCA_COLUMNS, JUDICIAL_COLUMNS, RECURSO_ADM_COLUMNS, DEFAULT_INSS_AGENCIES } from '../../constants';
import { formatBenefitNumber, getDaysSince, getBenefitGroup } from '../../utils';
import { db } from '../../services/database';

interface CaseTimelineProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ data, onChange }) => {
  const [newMS, setNewMS] = useState<Partial<MandadoSeguranca>>({ status: 'AGUARDANDO', reason: 'DEMORA_ANALISE' });
  const [showMsForm, setShowMsForm] = useState(false);
  const [copiedKit, setCopiedKit] = useState(false);
  const [agenciesList, setAgenciesList] = useState<INSSAgency[]>(DEFAULT_INSS_AGENCIES);

  // Load Agencies Async
  useEffect(() => {
      db.getAgencies().then(setAgenciesList);
  }, []);

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
  
  // --- PROCESS CLOCK LOGIC (Relógio do MS) ---
  const processClock = useMemo(() => {
      let startDate = data.protocolDate;
      let label = 'Protocolo INSS';
      let limit = 90; // Dias normais
      let msLimit = 120; // Dias para MS

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
      let message = 'Dentro do prazo esperado.';

      if (days > msLimit) {
          status = 'CRITICAL';
          color = 'bg-red-500';
          message = 'Prazo de MS atingido! Demora excessiva.';
      } else if (days > limit) {
          status = 'WARNING';
          color = 'bg-orange-500';
          message = 'Atenção: Prazo administrativo extrapolado.';
      } else {
          color = 'bg-emerald-500';
      }

      return { days, label, progress, status, color, message, msLimit };
  }, [data]);

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

  const handleGenerateKitPericia = async () => {
      // Find exact address
      const agency = agenciesList.find(a => a.name === data.periciaLocation);
      const fullLocation = agency ? `${agency.name} (${agency.address})` : (data.periciaLocation || 'Agência do INSS');

      const periciaText = `
*KIT PERÍCIA - RAMBO PREV*
--------------------------
*Cliente:* ${data.clientName}
*Data:* ${data.periciaDate ? new Date(data.periciaDate).toLocaleDateString() : 'A DEFINIR'}
*Hora:* ${data.periciaTime || 'A DEFINIR'}
*Local:* ${fullLocation}

*O QUE LEVAR (ORIGINAIS):*
[ ] RG e CPF
[ ] Carteira de Trabalho (Todas)
[ ] Laudos Médicos (Atuais e Antigos)
[ ] Receitas de Medicamentos
[ ] Exames de Imagem (Raio-X, Ressonância)

*DICA DE OURO:*
Foque no que você *NÃO CONSEGUE* fazer no trabalho ou em casa. Não fale apenas da dor, fale da limitação.
      `.trim();
      
      try {
          await navigator.clipboard.writeText(periciaText);
          setCopiedKit(true);
          setTimeout(() => setCopiedKit(false), 2000);
      } catch (err) {
          alert("Erro ao copiar. Tente selecionar o texto manualmente.");
      }
  };

  const getConfidenceColor = (val: number) => {
      if(val <= 1) return 'text-red-500 bg-red-50 border-red-200';
      if(val === 2) return 'text-orange-500 bg-orange-50 border-orange-200';
      if(val === 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if(val >= 4) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      return 'text-slate-500 bg-slate-50';
  };

  // --- BENEFIT SPECIFIC PANELS ---

  // 1. INCAPACIDADE (AUX DOENÇA / LOAS DEFICIENTE)
  const renderIncapacityPanel = () => (
      <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg">
          <label className="block text-[10px] font-bold text-orange-700 uppercase mb-2 flex items-center gap-1">
              <Stethoscope size={12}/> Estratégia: Incapacidade
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
              <button 
                  onClick={() => onChange({ strategyType: 'ATESTMED' })}
                  className={`text-xs p-2 rounded border transition-colors font-bold ${data.strategyType === 'ATESTMED' ? 'bg-orange-200 border-orange-300 text-orange-900' : 'bg-white border-orange-100 text-slate-500 hover:bg-orange-50'}`}
              >
                  ATESTMED (Doc)
              </button>
              <button 
                  onClick={() => onChange({ strategyType: 'PRESENCIAL' })}
                  className={`text-xs p-2 rounded border transition-colors font-bold ${data.strategyType === 'PRESENCIAL' ? 'bg-blue-200 border-blue-300 text-blue-900' : 'bg-white border-blue-100 text-slate-500 hover:bg-blue-50'}`}
              >
                  PRESENCIAL
              </button>
          </div>
          
          <div className="border-t border-orange-200 pt-2">
              <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-orange-800 uppercase">Agendamento Perícia</label>
                  <button 
                      onClick={handleGenerateKitPericia}
                      className={`text-[9px] px-2 py-0.5 rounded border font-bold flex items-center gap-1 transition-all ${copiedKit ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-orange-700 border-orange-200 hover:bg-orange-100'}`}
                  >
                      {copiedKit ? <Check size={10}/> : <Copy size={10}/>} {copiedKit ? 'Copiado!' : 'Copiar Kit'}
                  </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="date" className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-orange-300" value={data.periciaDate || ''} onChange={e => onChange({ periciaDate: e.target.value })} />
                  <input type="time" className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-orange-300" value={data.periciaTime || ''} onChange={e => onChange({ periciaTime: e.target.value })} />
              </div>
              <div className="relative">
                  <MapPin size={12} className="absolute left-2 top-2 text-slate-400"/>
                  <input 
                    type="text" 
                    placeholder="Local da Agência" 
                    className="w-full bg-white border border-slate-200 rounded p-1.5 pl-6 text-xs outline-none focus:border-orange-300" 
                    value={data.periciaLocation || ''} 
                    onChange={e => onChange({ periciaLocation: e.target.value })} 
                    list="agencies-list"
                  />
                  <datalist id="agencies-list">
                      {agenciesList.map(agency => (
                          <option key={agency.id} value={agency.name} />
                      ))}
                  </datalist>
              </div>
          </div>
      </div>
  );

  // 2. PENSÃO POR MORTE
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

  // 3. APOSENTADORIA (Tempo / Idade / Especial)
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

  // 4. RURAL / HIBRIDA
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

        {/* 2. RELÓGIO PROCESSUAL (CONSULTIVO) */}
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
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 relative z-10 font-bold">
                    <span>Protocolo (Dia 0)</span>
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

                    {/* CONTEXTUAL PANELS */}
                    {isIncapacity && renderIncapacityPanel()}
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
