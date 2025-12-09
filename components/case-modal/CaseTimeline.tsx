

import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, HelpCircle, Briefcase, Calculator, Hash, Clock, Siren, Plus, Trash2, Calendar, Gavel, ShieldAlert, ArrowRight, LayoutList, FileInput } from 'lucide-react';
import { Case, MandadoSeguranca } from '../../types';
import { BENEFIT_OPTIONS, ADMIN_COLUMNS, AUX_DOENCA_COLUMNS, JUDICIAL_COLUMNS, RECURSO_ADM_COLUMNS } from '../../constants';
import { formatBenefitNumber } from '../../utils';

interface CaseTimelineProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
}

const PERICIA_REQUIRED_CODES = ['31', '32', '91'];

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ data, onChange }) => {
  const [newMS, setNewMS] = useState<Partial<MandadoSeguranca>>({ status: 'AGUARDANDO', reason: 'DEMORA_ANALISE' });
  const [showMsForm, setShowMsForm] = useState(false);

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

  const requiresPericia = data.benefitType && PERICIA_REQUIRED_CODES.includes(data.benefitType);

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

        {/* 2. DADOS DO PROCESSO (LOGICAL FLOW) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BOX 1: REQUERIMENTO INICIAL */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase size={14}/> 1. Requerimento Inicial
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

                    <div className="grid grid-cols-2 gap-3">
                         {/* Protocolo */}
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

                        {/* DER */}
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

                    {requiresPericia && (
                         <div className={`p-3 rounded-lg border flex items-center justify-between ${data.periciaDate ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                            <div>
                                <span className={`text-[10px] font-bold uppercase block mb-1 ${data.periciaDate ? 'text-blue-600' : 'text-orange-600'}`}>
                                    Data da Perícia Médica
                                </span>
                                <input 
                                    type="datetime-local" 
                                    className="bg-transparent text-sm font-bold w-full outline-none text-slate-700"
                                    value={data.periciaDate || ''}
                                    onChange={(e) => onChange({ periciaDate: e.target.value })}
                                />
                            </div>
                            <Clock size={18} className={data.periciaDate ? 'text-blue-400' : 'text-orange-400'}/>
                        </div>
                    )}
                </div>
            </div>

            {/* BOX 2: CONCLUSÃO E RECURSO */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14}/> 2. Conclusão & Recurso
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

                    {/* Resultado Administrativo Switch */}
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

                    {/* Separator for Appeal */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-2 text-[10px] text-slate-400 uppercase font-bold">Fase Recursal</span>
                        </div>
                    </div>

                    {/* Recurso Adm */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1">Protocolo Recurso</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={data.appealProtocolNumber || ''} 
                                    onChange={(e) => onChange({ appealProtocolNumber: e.target.value })}
                                    className="w-full bg-indigo-50 border border-indigo-200 rounded p-2 text-sm text-indigo-700 font-mono focus:border-indigo-300 outline-none pl-7"
                                    placeholder="REC-0000"
                                />
                                <FileInput size={12} className="absolute left-2.5 top-3 text-indigo-400"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1">Data do Recurso</label>
                            <input 
                                type="date" 
                                value={data.appealProtocolDate || ''} 
                                onChange={(e) => onChange({ appealProtocolDate: e.target.value })}
                                className="w-full bg-indigo-50 border border-indigo-200 rounded p-2 text-sm text-indigo-700 focus:border-indigo-300 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. MANDADOS DE SEGURANÇA */}
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
