
import React, { useState, useEffect, useMemo } from 'react';
import { Hash, CheckCircle, XCircle, HelpCircle, FileText, Briefcase, Calculator, PieChart, Split, ArrowRight } from 'lucide-react';
import { Case } from '../../types';
import { parseLocalYMD, formatBenefitNumber } from '../../utils';

interface ConclusionFormProps {
  data: any;
  caseContext?: Case;
  onChange: (data: any) => void;
}

export const ConclusionForm: React.FC<ConclusionFormProps> = ({ data, caseContext, onChange }) => {
  const [showDcbOverride, setShowDcbOverride] = useState(false);

  // Auto-calculate deadline if DENIED or PARTIAL is selected
  useEffect(() => {
    if ((data.outcome === 'DENIED' || data.outcome === 'PARTIAL') && data.benefitDate) {
      const decisionDate = parseLocalYMD(data.benefitDate);
      if (decisionDate) {
        const deadline = new Date(decisionDate);
        deadline.setDate(deadline.getDate() + 30); // 30 days for Appeal
        onChange({ 
          deadlineStart: data.benefitDate,
          deadlineEnd: deadline.toISOString().slice(0, 10)
        });
      }
    }
  }, [data.outcome, data.benefitDate]);

  const shouldShowDCB = useMemo(() => {
    if (showDcbOverride) return true;
    if (!caseContext?.benefitType) return false;
    // 21 = Pensão, 25 = Aux Reclusão, 31 = Aux Doença
    return ['21', '25', '31'].includes(caseContext.benefitType);
  }, [caseContext, showDcbOverride]);

  return (
    <div className="space-y-4">
      {/* 1. Campos Obrigatórios Globais (NB e Data) */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número do Benefício (NB)</label>
          <div className="relative">
            <Hash size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
            <input 
              type="text" 
              placeholder="000.000.000-0"
              className="w-full border-slate-300 bg-white rounded text-sm pl-8 p-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800 placeholder:font-normal"
              value={data.benefitNumber || ''}
              onChange={e => onChange({ benefitNumber: formatBenefitNumber(e.target.value) })}
              autoFocus
              maxLength={13}
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-1">*Obrigatório para qualquer conclusão</p>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data da Decisão / Conclusão</label>
          <input 
            type="date" 
            className="w-full border-slate-300 bg-white rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            value={data.benefitDate || ''}
            onChange={e => onChange({ benefitDate: e.target.value })}
          />
        </div>
      </div>

      {/* 2. Seletor de Resultado */}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Resultado da Análise</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onChange({ outcome: 'GRANTED' })}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${data.outcome === 'GRANTED' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
          >
            <CheckCircle size={18} className={data.outcome === 'GRANTED' ? 'text-emerald-600' : 'text-slate-300'} />
            <span className="text-[10px] font-bold uppercase">Concedido</span>
          </button>
          
          <button
            onClick={() => onChange({ outcome: 'PARTIAL' })}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${data.outcome === 'PARTIAL' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50/50'}`}
          >
            <Split size={18} className={data.outcome === 'PARTIAL' ? 'text-blue-600' : 'text-slate-300'} />
            <span className="text-[10px] font-bold uppercase">Parcial</span>
          </button>

          <button
            onClick={() => onChange({ outcome: 'DENIED' })}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${data.outcome === 'DENIED' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-200' : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50/50'}`}
          >
            <XCircle size={18} className={data.outcome === 'DENIED' ? 'text-red-600' : 'text-slate-300'} />
            <span className="text-[10px] font-bold uppercase">Indeferido</span>
          </button>
        </div>
      </div>

      {/* 3. Lógica Condicional: Concedido */}
      {data.outcome === 'GRANTED' && (
        <div className="animate-in slide-in-from-top-2 space-y-3 p-3 bg-emerald-50/30 rounded border border-emerald-100">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">DIB (Data de Início)</label>
              <input 
                type="date" 
                className="w-full border-emerald-300 bg-white rounded text-sm focus:ring-emerald-500 focus:border-emerald-500"
                value={data.benefitDate || ''} 
                onChange={e => onChange({ benefitDate: e.target.value })}
              />
            </div>

            {shouldShowDCB ? (
              <div className="animate-in fade-in">
                <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">DCB (Data Cessação)</label>
                <input 
                  type="date" 
                  className="w-full border-emerald-300 bg-white rounded text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  value={data.dcbDate || ''}
                  onChange={e => onChange({ dcbDate: e.target.value })}
                />
                <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-600 cursor-pointer" onClick={() => setShowDcbOverride(false)}>
                  <XCircle size={10}/> Remover data de cessação
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => setShowDcbOverride(true)}
                  className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 underline decoration-dotted"
                >
                  <HelpCircle size={10}/> O benefício possui data de cessação (DCB)?
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Lógica de CISÃO DO CASO (Parcial) - MÓDULO 3 */}
      {data.outcome === 'PARTIAL' && (
          <div className="animate-in slide-in-from-top-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-3">
                  <Split className="text-blue-600 mt-1" size={20} />
                  <div>
                      <h4 className="text-sm font-bold text-blue-800">Cisão do Processo (Split)</h4>
                      <p className="text-xs text-blue-700">
                          O sistema irá dividir este caso em dois caminhos simultâneos:
                      </p>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-emerald-200">
                      <span className="font-bold text-emerald-700 block mb-1">Processo A (Financeiro)</span>
                      <p className="text-slate-600">Segue para <strong>Pagamento</strong> com o benefício concedido.</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-200">
                      <span className="font-bold text-indigo-700 block mb-1">Processo B (Recursal)</span>
                      <p className="text-slate-600">Cria um novo card em <strong>Recurso Adm.</strong> para a parte negada.</p>
                  </div>
              </div>

              <div className="mt-3 pt-2 border-t border-blue-200">
                  <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Prazo Recursal (Novo Processo)</label>
                  <input 
                    type="date" 
                    className="w-full border-blue-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={data.deadlineEnd || ''}
                    onChange={e => onChange({ deadlineEnd: e.target.value })}
                  />
              </div>
          </div>
      )}

      {/* 5. Lógica Indeferido */}
      {data.outcome === 'DENIED' && (
        <div className="animate-in slide-in-from-top-2 space-y-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
          <h4 className="text-xs font-bold text-red-800 flex items-center gap-1">
             <Briefcase size={12}/> Benefício Negado
          </h4>
          {data.deadlineEnd && (
            <div className="flex items-start gap-2 bg-white p-2 rounded border border-red-200">
              <Calculator size={16} className="text-red-500 mt-0.5"/>
              <div>
                <p className="text-xs font-bold text-red-700">Prazo Recursal (30 Dias)</p>
                <p className="text-[10px] text-red-500">
                  Prazo fatal calculado: <b>{new Date(data.deadlineEnd).toLocaleDateString('pt-BR')}</b>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
