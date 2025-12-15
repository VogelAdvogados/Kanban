
import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Building, Landmark, AlertCircle } from 'lucide-react';
import { INSSAgency } from '../../types';

interface AgencySettingsProps {
  agencies: INSSAgency[];
  setAgencies: (list: INSSAgency[]) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const AgencySettings: React.FC<AgencySettingsProps> = ({ agencies, setAgencies, showToast }) => {
  const [newAgency, setNewAgency] = useState<Partial<INSSAgency>>({});

  const handleAdd = () => {
      if (!newAgency.name || !newAgency.address) {
          showToast('Preencha nome e endereço do local.', 'error');
          return;
      }
      
      const agency: INSSAgency = {
          id: `loc_${Date.now()}`,
          name: newAgency.name,
          address: newAgency.address
      };

      setAgencies([...agencies, agency]);
      setNewAgency({});
      showToast('Local adicionado com sucesso!', 'success');
  };

  const handleRemove = (id: string) => {
      if (confirm('Tem certeza que deseja remover este local da lista?')) {
          setAgencies(agencies.filter(a => a.id !== id));
      }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <div className="pb-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <MapPin className="text-orange-500" size={20}/> Locais de Atendimento (INSS & Judiciário)
             </h3>
             <p className="text-xs text-slate-500">
                 Cadastre Agências do INSS, Varas Federais (Ijuí, Santa Maria, etc.) e Clínicas de Perícia. 
                 Estes locais aparecerão nas opções de agendamento em todos os módulos.
             </p>
        </div>

        {/* ADD FORM */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
                <Plus size={16} className="text-blue-500"/> Adicionar Novo Local
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Local</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Vara Federal de Ijuí ou APS Cruz Alta"
                        className="w-full p-2 rounded border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-orange-100"
                        value={newAgency.name || ''}
                        onChange={e => setNewAgency({...newAgency, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Rua do Comércio, 500, Centro"
                        className="w-full p-2 rounded border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-orange-100"
                        value={newAgency.address || ''}
                        onChange={e => setNewAgency({...newAgency, address: e.target.value})}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={handleAdd}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 flex items-center gap-2 shadow-sm"
                >
                    <Plus size={14}/> Cadastrar Local
                </button>
            </div>
        </div>

        {/* LIST */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto kanban-scroll pr-2">
            {agencies.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="opacity-20"/>
                    Nenhum local cadastrado.
                </div>
            ) : (
                agencies.map(agency => {
                    // Smart Icon Logic
                    const nameLower = agency.name.toLowerCase();
                    const isCourt = nameLower.includes('vara') || nameLower.includes('federal') || nameLower.includes('judici') || nameLower.includes('fórum') || nameLower.includes('trf');
                    
                    return (
                        <div key={agency.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-orange-300 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${isCourt ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {isCourt ? <Landmark size={18} /> : <Building size={18} />}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold flex items-center gap-2 ${isCourt ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {agency.name}
                                        {isCourt && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 rounded border border-indigo-200">Judicial</span>}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                        <MapPin size={10}/> {agency.address}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemove(agency.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover Local"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};
