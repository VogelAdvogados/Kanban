
import React, { useState } from 'react';
import { Siren, Plus, Trash2, Gavel } from 'lucide-react';
import { Case, MandadoSeguranca } from '../../../types';

interface MandadoSegurancaListProps {
    data: Case;
    onChange: (updates: Partial<Case>) => void;
    showForm?: boolean;
    setShowForm: (show: boolean) => void;
}

export const MandadoSegurancaList: React.FC<MandadoSegurancaListProps> = ({ data, onChange, showForm, setShowForm }) => {
    const [newMS, setNewMS] = useState<Partial<MandadoSeguranca>>({ status: 'AGUARDANDO', reason: 'DEMORA_ANALISE' });

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
        setShowForm(false);
    };

    const handleDeleteMS = (id: string) => {
        onChange({ mandadosSeguranca: data.mandadosSeguranca?.filter(m => m.id !== id) });
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Siren size={14} className="text-red-500"/> Mandados de Segurança
                </h3>
                <button 
                    onClick={() => setShowForm(true)}
                    className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 font-bold hover:bg-red-100 flex items-center gap-1"
                >
                    <Plus size={12}/> Adicionar MS
                </button>
             </div>

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

             {showForm && (
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
                         <button onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-500 hover:bg-white px-3 py-1 rounded">Cancelar</button>
                         <button onClick={handleAddMS} className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 shadow-sm">Salvar MS</button>
                     </div>
                 </div>
             )}
        </div>
    );
};
