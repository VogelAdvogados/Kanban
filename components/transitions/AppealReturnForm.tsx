
import React from 'react';
import { AlertCircle, Calendar, CheckSquare, FileText, Scale, Gavel } from 'lucide-react';

interface AppealReturnFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const AppealReturnForm: React.FC<AppealReturnFormProps> = ({ data, onChange }) => {
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ createSpecialTask: e.target.checked });
  };

  const handleOutcomeChange = (outcome: string) => {
      onChange({ appealOutcome: outcome });
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4">
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
            <div>
                <h4 className="text-sm font-bold text-orange-800 mb-1">Retorno da Junta (1ª Instância)</h4>
                <p className="text-xs text-orange-700 leading-relaxed">
                    O processo voltou para produção. Qual foi o resultado do julgamento do Recurso Ordinário?
                </p>
            </div>
        </div>

        <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Gavel size={12}/> Resultado do Julgamento
            </label>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleOutcomeChange('IMPROVIDO')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${data.appealOutcome === 'IMPROVIDO' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="font-bold text-xs">Improvido (Negado)</span>
                </button>
                <button
                    onClick={() => handleOutcomeChange('PARCIAL')}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${data.appealOutcome === 'PARCIAL' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="font-bold text-xs">Parcialmente Provido</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <Calendar size={12}/> Data da Ciência da Decisão
                </label>
                <input 
                    type="date" 
                    className="w-full border-slate-300 rounded text-sm focus:ring-orange-500 focus:border-orange-500 outline-none p-2"
                    value={data.appealDecisionDate || ''}
                    onChange={e => onChange({ appealDecisionDate: e.target.value })}
                    autoFocus
                />
                <p className="text-[9px] text-slate-400 mt-1">Essa data será usada para calcular o prazo recursal (30 dias).</p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${data.createSpecialTask ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {data.createSpecialTask && <CheckSquare size={14} className="text-white"/>}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden"
                        checked={data.createSpecialTask !== false} // Default true
                        onChange={handleCheckboxChange}
                    />
                    <div className="flex-1">
                        <span className="block text-sm font-bold text-slate-700">Criar Tarefa: "Redigir Recurso Especial"</span>
                        <span className="block text-[10px] text-slate-500">Para recorrer da parte não concedida.</span>
                    </div>
                </label>
            </div>
        </div>
    </div>
  );
};
