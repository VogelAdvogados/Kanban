
import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Building } from 'lucide-react';
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
          showToast('Preencha nome e endereço da agência.', 'error');
          return;
      }
      
      const agency: INSSAgency = {
          id: `aps_${Date.now()}`,
          name: newAgency.name,
          address: newAgency.address
      };

      setAgencies([...agencies, agency]);
      setNewAgency({});
      showToast('Agência adicionada com sucesso!', 'success');
  };

  const handleRemove = (id: string) => {
      if (confirm('Tem certeza que deseja remover esta agência da lista?')) {
          setAgencies(agencies.filter(a => a.id !== id));
      }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <div className="pb-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Building className="text-orange-500" size={20}/> Locais de Perícia (Agências)
             </h3>
             <p className="text-xs text-slate-500">Cadastre os endereços das agências do INSS para facilitar o agendamento e aviso aos clientes.</p>
        </div>

        {/* ADD FORM */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3 text-sm">Adicionar Nova Agência</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input 
                    type="text" 
                    placeholder="Nome (Ex: Agência INSS - CRUZ ALTA)"
                    className="p-2 rounded border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-orange-100"
                    value={newAgency.name || ''}
                    onChange={e => setNewAgency({...newAgency, name: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="Endereço Completo (Rua, Nº, Bairro)"
                    className="p-2 rounded border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-orange-100"
                    value={newAgency.address || ''}
                    onChange={e => setNewAgency({...newAgency, address: e.target.value})}
                />
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={handleAdd}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 flex items-center gap-2"
                >
                    <Plus size={14}/> Cadastrar Local
                </button>
            </div>
        </div>

        {/* LIST */}
        <div className="space-y-2">
            {agencies.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">Nenhuma agência cadastrada.</div>
            ) : (
                agencies.map(agency => (
                    <div key={agency.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-orange-300 transition-colors">
                        <div>
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Building size={14} className="text-slate-400"/> {agency.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 pl-6">
                                <MapPin size={12}/> {agency.address}
                            </p>
                        </div>
                        <button 
                            onClick={() => handleRemove(agency.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
