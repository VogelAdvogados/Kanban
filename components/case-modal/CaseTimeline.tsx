
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, Briefcase, Calculator, Hash, TrendingUp, Gavel } from 'lucide-react';
import { Case, INSSAgency, WhatsAppTemplate, SystemSettings } from '../../types';
import { BENEFIT_OPTIONS, DEFAULT_INSS_AGENCIES, JUDICIAL_COURTS } from '../../constants';
import { formatBenefitNumber, calculateDynamicSLA, getBenefitGroup } from '../../utils';
import { db } from '../../services/database';

// New Modular Imports
import { TimelineVisuals } from './timeline/TimelineVisuals';
import { MandadoSegurancaList } from './timeline/MandadoSegurancaList';
import { PericiaPanel, MaintenancePanel, SpecificBenefitFields } from './timeline/TimelineBlocks';

interface CaseTimelineProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
  whatsAppTemplates?: WhatsAppTemplate[];
  agencies?: INSSAgency[]; 
  systemSettings?: SystemSettings;
}

// Helper safely parses ISO date string to YYYY-MM-DD for input[type="date"]
const toInputDate = (isoStr: string | undefined): string => {
    if (!isoStr) return '';
    if (isoStr.length === 10) return isoStr;
    return isoStr.split('T')[0];
};

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ data, onChange, whatsAppTemplates, agencies, systemSettings }) => {
  const msSectionRef = useRef<HTMLDivElement>(null);
  const [showMsForm, setShowMsForm] = useState(false);
  
  const agenciesList = useMemo(() => {
      if (agencies && agencies.length > 0) return agencies;
      return [...DEFAULT_INSS_AGENCIES, ...JUDICIAL_COURTS];
  }, [agencies]);
  
  const [dynamicSLA, setDynamicSLA] = useState<number | null>(null);

  useEffect(() => {
      db.getCases().then(allCases => {
          const sla = calculateDynamicSLA(allCases, data.columnId);
          setDynamicSLA(sla);
      });
  }, [data.columnId]);

  const benefitGroup = getBenefitGroup(data.benefitType);
  const showPericiaPanel = data.columnId === 'aux_pericia' || data.columnId === 'jud_pericia' || !!data.periciaDate;
  const showMaintenancePanel = (data.columnId === 'aux_ativo' || data.columnId === 'adm_pagamento') && !!data.dcbDate;

  const handleImpetrarClick = () => {
      setShowMsForm(true);
      setTimeout(() => {
          msSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const getConfidenceColor = (val: number) => {
      if(val <= 1) return 'text-red-500 bg-red-50 border-red-200';
      if(val === 2) return 'text-orange-500 bg-orange-50 border-orange-200';
      if(val === 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      if(val >= 4) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      return 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="space-y-6">
        
        {/* 1. VISUAL TIMELINE & SLA CLOCK */}
        <TimelineVisuals 
            data={data} 
            systemSettings={systemSettings} 
            dynamicSLA={dynamicSLA} 
            onImpetrarMS={handleImpetrarClick}
        />

        {/* 2. DADOS DO PROCESSO (CONTEXTUAL) */}
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

                    {/* DYNAMIC PANELS */}
                    {showPericiaPanel && (
                        <PericiaPanel 
                            data={data} 
                            onChange={onChange} 
                            agenciesList={agenciesList} 
                            whatsAppTemplates={whatsAppTemplates}
                        />
                    )}
                    
                    {showMaintenancePanel && (
                        <MaintenancePanel 
                            data={data} 
                            onChange={onChange} 
                            whatsAppTemplates={whatsAppTemplates}
                        />
                    )}

                    <SpecificBenefitFields 
                        data={data} 
                        onChange={onChange} 
                        group={benefitGroup} 
                        benefitType={data.benefitType || ''}
                    />

                    {/* Protocolo */}
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
                                value={toInputDate(data.protocolDate)} 
                                onChange={(e) => onChange({ protocolDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:border-blue-300 outline-none"
                            />
                        </div>
                    </div>

                    {/* Viabilidade e Feeling */}
                    <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                                <Calculator size={10}/> Análise de Viabilidade
                            </h4>
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
                                value={toInputDate(data.benefitDate)} 
                                onChange={(e) => onChange({ benefitDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 outline-none focus:border-blue-300"
                            />
                        </div>
                    </div>

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
                                    value={toInputDate(data.appealOrdinarioDate || data.appealProtocolDate)}
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
                                    value={toInputDate(data.appealEspecialDate)}
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
        <div ref={msSectionRef}>
            <MandadoSegurancaList 
                data={data} 
                onChange={onChange} 
                showForm={showMsForm} 
                setShowForm={setShowMsForm}
            />
        </div>
    </div>
  );
};
