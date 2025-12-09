

import React, { useState, useEffect, useMemo } from 'react';
import { Hash, CheckCircle, XCircle, HelpCircle, FileText, Briefcase, Calculator } from 'lucide-react';
import { Case } from '../../types';
import { parseLocalYMD, formatBenefitNumber } from '../../utils';

interface ConclusionFormProps {
  data: any;
  caseContext?: Case;
  onChange: (data: any) => void;
}

export const ConclusionForm: React.FC<ConclusionFormProps> = ({ data, caseContext, onChange }) => {
  const [showDcbOverride, setShowDcbOverride] = useState(false);

  // Auto-calculate deadline if DENIED is selected
  useEffect(() => {
    if (data.outcome === 'DENIED' && data.benefitDate) {
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
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onChange({ outcome: 'GRANTED' })}
            className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${data.outcome === 'GRANTED' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
          >
            <CheckCircle size={20} className={data.outcome === 'GRANTED' ? 'text-emerald-600' : 'text-slate-300'} />
            <span className="text-xs font-bold uppercase">Concedido</span>
          </button>
          <button
            onClick={() => onChange({ outcome: 'DENIED' })}
            className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${data.outcome === 'DENIED' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-200' : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50/50'}`}
          >
            <XCircle size={20} className={data.outcome === 'DENIED' ? 'text-red-600' : 'text-slate-300'} />
            <span className="text-xs font-bold uppercase">Indeferido</span>
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
          
          <div className="pt-2 border-t border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-800 uppercase mb-2">Próximos Passos Sugeridos:</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-emerald-200 p-2 rounded text-center text-xs text-emerald-700">
                Conferir Cálculos
              </div>
              <div className="flex-1 bg-white border border-emerald-200 p-2 rounded text-center text-xs text-emerald-700">
                Arquivar / Financeiro
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Lógica Condicional: Indeferido */}
      {data.outcome === 'DENIED' && (
        <div className="animate-in slide-in-from-top-2 space-y-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
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
          
          <div className="pt-2 border-t border-red-200">
            <p className="text-[10px] font-bold text-red-800 uppercase mb-2">Próximos Passos:</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-indigo-200 p-2 rounded text-center text-xs text-indigo-700 font-bold flex items-center justify-center gap-1">
                <FileText size={12}/> Recurso Adm.
              </div>
              <div className="flex-1 bg-white border border-purple-200 p-2 rounded text-center text-xs text-purple-700 font-bold flex items-center justify-center gap-1">
                <Briefcase size={12}/> Judicial
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};