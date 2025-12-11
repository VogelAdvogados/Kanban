
import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertCircle, Calendar, Calculator, ListChecks } from 'lucide-react';
import { COMMON_DOCUMENTS } from '../../constants';
import { parseLocalYMD } from '../../utils';

interface DeadlineFormProps {
  data: any;
  onChange: (data: any) => void;
}

// Itens comuns em exigências do INSS
const COMMON_EXIGENCIES = [
    "Apresentar PPP Original",
    "Laudo Técnico (LTCAT)",
    "Carteira de Trabalho (CTPS) Original",
    "Declaração de Sindicato Rural",
    "Comprovante de Endereço Atualizado",
    "Autodeclaração Rural",
    "Documentos dos Dependentes"
];

export const DeadlineForm: React.FC<DeadlineFormProps> = ({ data, onChange }) => {
  const [ciencasDate, setCienciaDate] = useState(data.deadlineStart || new Date().toISOString().slice(0, 10));
  const [daysToComply, setDaysToComply] = useState<number>(30); // Padrão 30 dias

  // Calculadora Automática de Prazos
  useEffect(() => {
      if (ciencasDate && daysToComply) {
          const start = parseLocalYMD(ciencasDate);
          if (start) {
              const end = new Date(start);
              end.setDate(end.getDate() + daysToComply);
              
              onChange({ 
                  deadlineStart: ciencasDate,
                  deadlineEnd: end.toISOString().slice(0, 10)
              });
          }
      }
  }, [ciencasDate, daysToComply]);

  const toggleExigencyItem = (item: string) => {
      const currentText = data.exigencyDetails || '';
      let newText = currentText;

      if (currentText.includes(item)) {
          newText = currentText.replace(`- ${item}\n`, '').replace(`- ${item}`, '');
      } else {
          newText = currentText ? `${currentText}\n- ${item}` : `- ${item}`;
      }
      onChange({ exigencyDetails: newText.trim() });
  };

  return (
    <div className="space-y-5 animate-in slide-in-from-right-4">
        
        {/* CALCULADORA DE PRAZOS (Módulo 2) */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-xs font-bold text-yellow-800 uppercase mb-3 flex items-center gap-2">
                <Calculator size={14}/> Calculadora de Prazo Fatal
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-yellow-700 uppercase mb-1">Data da Ciência</label>
                    <input 
                        type="date" 
                        className="w-full border-yellow-300 rounded text-sm focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                        value={ciencasDate}
                        onChange={e => setCienciaDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-yellow-700 uppercase mb-1">Prazo (Dias Úteis/Corridos)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            className="w-full border-yellow-300 rounded text-sm focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                            value={daysToComply}
                            onChange={e => setDaysToComply(parseInt(e.target.value))}
                        />
                        <span className="text-xs text-yellow-600 font-bold">Dias</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-yellow-200 flex justify-between items-center">
                <span className="text-xs text-yellow-700">Vencimento Calculado:</span>
                <span className="text-sm font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-200">
                    {data.deadlineEnd ? new Date(data.deadlineEnd).toLocaleDateString('pt-BR') : '...'}
                </span>
            </div>
        </div>

        {/* DETALHAMENTO DA EXIGÊNCIA (Checklist) */}
        <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                <ListChecks size={12}/> O que o INSS solicitou?
            </label>
            
            {/* Chips de Sugestão */}
            <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_EXIGENCIES.map(item => {
                    const isSelected = (data.exigencyDetails || '').includes(item);
                    return (
                        <button
                            key={item}
                            onClick={() => toggleExigencyItem(item)}
                            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${isSelected ? 'bg-blue-100 text-blue-700 border-blue-300 font-bold' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                        >
                            {isSelected ? '✓ ' : '+ '} {item}
                        </button>
                    )
                })}
            </div>

            <textarea
                className="w-full text-xs p-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-100 bg-white min-h-[80px]"
                placeholder="Descreva os detalhes da exigência ou use os botões acima..."
                value={data.exigencyDetails || ''}
                onChange={e => onChange({ exigencyDetails: e.target.value })}
            />
        </div>
    </div>
  );
};
