
import React from 'react';
import { CheckSquare, AlertCircle } from 'lucide-react';
import { COMMON_DOCUMENTS } from '../../constants';

interface DeadlineFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const DeadlineForm: React.FC<DeadlineFormProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
        {/* Detalhes da Exigência - Novo Campo */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <label className="block text-[10px] font-bold text-yellow-800 uppercase mb-1 flex items-center gap-1">
                <AlertCircle size={12}/> O que o INSS pediu?
            </label>
            <textarea
                className="w-full text-xs p-2 rounded border border-yellow-300 outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                rows={3}
                placeholder="Ex: Atualizar PPP da empresa X, apresentar LTCAT original, retificar CNIS..."
                value={data.exigencyDetails || ''}
                onChange={e => onChange({ exigencyDetails: e.target.value })}
                autoFocus
            />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data da Ciência</label>
                <input 
                type="date" 
                className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                value={data.deadlineStart}
                onChange={e => onChange({ deadlineStart: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prazo Final (Cumprimento)</label>
                <input 
                type="date" 
                className="w-full border-red-300 rounded text-sm focus:ring-red-500 focus:border-red-500"
                value={data.deadlineEnd}
                onChange={e => onChange({ deadlineEnd: e.target.value })}
                />
            </div>
        </div>
    </div>
  );
};

interface PendencyFormProps {
  data: any;
  onChange: (data: any) => void;
  commonDocs?: string[]; // Optional prop for custom list
}

export const PendencyForm: React.FC<PendencyFormProps> = ({ data, onChange, commonDocs }) => {
  
  const availableDocs = commonDocs && commonDocs.length > 0 ? commonDocs : COMMON_DOCUMENTS;

  const toggleDoc = (doc: string) => {
    const current = data.missingDocs || [];
    if(current.includes(doc)) {
      onChange({ missingDocs: current.filter((d: string) => d !== doc) });
    } else {
      onChange({ missingDocs: [...current, doc] });
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
      </div>
      <div className="pt-2">
        <input 
          type="text" 
          placeholder="Outros (digite e pressione Enter)..."
          className="w-full text-xs p-2 border border-slate-300 rounded"
          onKeyDown={(e) => {
            if(e.key === 'Enter') {
              const val = e.currentTarget.value.trim();
              if(val) {
                toggleDoc(val);
                e.currentTarget.value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );
};
