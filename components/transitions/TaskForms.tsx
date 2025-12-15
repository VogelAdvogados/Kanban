
import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertCircle, Calendar, Calculator, ListChecks, Plus } from 'lucide-react';
import { COMMON_DOCUMENTS } from '../../constants';
import { parseLocalYMD, getLocalDateISOString } from '../../utils';

// --- DEADLINE FORM ---

interface DeadlineFormProps {
  data: any;
  onChange: (data: any) => void;
}

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
  const [cienciaDate, setCienciaDate] = useState(data.deadlineStart || getLocalDateISOString());
  const [daysToComply, setDaysToComply] = useState<number>(30); // Padrão 30 dias

  // Calculadora Automática de Prazos
  useEffect(() => {
      if (cienciaDate && daysToComply) {
          const start = parseLocalYMD(cienciaDate);
          if (start) {
              const end = new Date(start);
              end.setDate(end.getDate() + daysToComply);
              
              onChange({ 
                  deadlineStart: cienciaDate,
                  deadlineEnd: end.toISOString().slice(0, 10)
              });
          }
      }
  }, [cienciaDate, daysToComply]);

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
                        value={cienciaDate}
                        onChange={e => setCienciaDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-yellow-700 uppercase mb-1">Prazo (Dias)</label>
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

// --- PENDENCY FORM ---

interface PendencyFormProps {
  data: any;
  onChange: (data: any) => void;
  commonDocs?: string[]; // Optional prop for custom list
}

export const PendencyForm: React.FC<PendencyFormProps> = ({ data, onChange, commonDocs }) => {
  const [customDoc, setCustomDoc] = useState('');
  const availableDocs = commonDocs && commonDocs.length > 0 ? commonDocs : COMMON_DOCUMENTS;

  const toggleDoc = (doc: string) => {
    const current = data.missingDocs || [];
    if(current.includes(doc)) {
      onChange({ missingDocs: current.filter((d: string) => d !== doc) });
    } else {
      onChange({ missingDocs: [...current, doc] });
    }
  };

  const handleAddCustom = () => {
      const val = customDoc.trim();
      if(val) {
          toggleDoc(val);
          setCustomDoc('');
      }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-bold text-red-500 uppercase">Selecione o que falta:</label>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto kanban-scroll pr-1">
        {availableDocs.map((doc) => {
          const isChecked = (data.missingDocs || []).includes(doc);
          return (
            <button 
              key={doc}
              onClick={() => toggleDoc(doc)}
              className={`text-xs text-left px-3 py-2 rounded-lg border transition-all flex items-center gap-2 ${isChecked ? 'bg-red-50 border-red-300 text-red-800 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
                {isChecked && <CheckSquare size={10} className="text-white"/>}
              </div>
              <span className="truncate">{doc}</span>
            </button>
          );
        })}
        {/* Render existing custom docs that aren't in common list */}
        {(data.missingDocs || []).map((doc: string) => {
            if (!availableDocs.includes(doc)) {
                return (
                    <button 
                      key={doc}
                      onClick={() => toggleDoc(doc)}
                      className={`text-xs text-left px-3 py-2 rounded-lg border transition-all flex items-center gap-2 bg-red-50 border-red-300 text-red-800 font-bold`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 bg-red-500 border-red-500`}>
                        <CheckSquare size={10} className="text-white"/>
                      </div>
                      <span className="truncate">{doc} (Outro)</span>
                    </button>
                );
            }
            return null;
        })}
      </div>
      <div className="pt-2 flex gap-2">
        <input 
          type="text" 
          placeholder="Outros (digite e adicione)..."
          className="flex-1 text-xs p-2 border border-slate-300 rounded outline-none focus:border-red-300"
          value={customDoc}
          onChange={(e) => setCustomDoc(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === 'Enter') handleAddCustom();
          }}
        />
        <button 
            onClick={handleAddCustom}
            disabled={!customDoc.trim()}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
            <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
