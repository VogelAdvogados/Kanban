
import React, { useState, useEffect } from 'react';
import { FileText, Copy, ArrowLeft, GitBranch, AlertCircle, FilePlus } from 'lucide-react';
import { getLocalDateISOString } from '../../utils';

interface AdminReturnFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const AdminReturnForm: React.FC<AdminReturnFormProps> = ({ data, onChange }) => {
  const [mode, setMode] = useState<'CLONE' | 'MOVE' | null>(null);

  useEffect(() => {
      // Default to null until user selects
      if (!data.returnMode) {
          onChange({ returnMode: null });
      }
  }, []);

  const handleSelectMode = (selectedMode: 'CLONE' | 'MOVE') => {
      setMode(selectedMode);
      onChange({ 
          returnMode: selectedMode,
          // Initialize protocol date if cloning
          protocolDate: selectedMode === 'CLONE' ? getLocalDateISOString() : undefined
      });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        
        {/* HEADER EXPLANATION */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <GitBranch className="text-blue-600" size={18}/> Decisão de Fluxo
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
                Você está movendo um processo do <strong>Judicial/Recurso</strong> de volta para o <strong>Administrativo</strong>. 
                Como deseja tratar este retorno?
            </p>
        </div>

        {/* SELECTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* OPTION A: NEW PROTOCOL (CLONE) */}
            <button 
                onClick={() => handleSelectMode('CLONE')}
                className={`p-4 rounded-xl border-2 text-left transition-all group relative overflow-hidden ${mode === 'CLONE' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300'}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${mode === 'CLONE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <FilePlus size={20}/>
                    </div>
                    <span className={`font-bold text-sm ${mode === 'CLONE' ? 'text-blue-800' : 'text-slate-700'}`}>Novo Requerimento</span>
                </div>
                <p className="text-xs text-slate-500">
                    Cria um <strong>novo cartão</strong> na Triagem Admin (cópia vinculada). O processo Judicial atual continua correndo.
                </p>
                <span className="block mt-2 text-[10px] font-bold text-blue-600 uppercase">Recomendado para novos pedidos (DER)</span>
            </button>

            {/* OPTION B: SIMPLE MOVE */}
            <button 
                onClick={() => handleSelectMode('MOVE')}
                className={`p-4 rounded-xl border-2 text-left transition-all group ${mode === 'MOVE' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200 bg-white hover:border-orange-300'}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${mode === 'MOVE' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <ArrowLeft size={20}/>
                    </div>
                    <span className={`font-bold text-sm ${mode === 'MOVE' ? 'text-orange-800' : 'text-slate-700'}`}>Apenas Mover</span>
                </div>
                <p className="text-xs text-slate-500">
                    Retira o cartão do Judicial e o coloca de volta no Administrativo. Não cria cópia.
                </p>
                <span className="block mt-2 text-[10px] font-bold text-orange-600 uppercase">Para correções de fluxo</span>
            </button>
        </div>

        {/* CONDITIONAL INPUTS FOR CLONE */}
        {mode === 'CLONE' && (
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                <h4 className="text-xs font-bold text-blue-800 mb-3 uppercase flex items-center gap-2">
                    <FileText size={14}/> Dados do Novo Protocolo
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Novo Nº Protocolo</label>
                        <input 
                            type="text" 
                            className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-mono"
                            placeholder="Ex: 123456789"
                            value={data.protocolNumber || ''}
                            onChange={e => onChange({ protocolNumber: e.target.value })}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Entrada (DER)</label>
                        <input 
                            type="date" 
                            className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none"
                            value={data.protocolDate || ''}
                            onChange={e => onChange({ protocolDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* WARNING FOR MOVE */}
        {mode === 'MOVE' && (
            <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100 text-orange-800 text-xs animate-in fade-in">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
                <p>
                    <strong>Atenção:</strong> O histórico judicial deste cartão será mantido, mas ele sairá da visão "Judicial". Use isso apenas se o processo foi enviado por engano ou se encerrou totalmente e voltará para fase administrativa no mesmo objeto.
                </p>
            </div>
        )}

    </div>
  );
};
