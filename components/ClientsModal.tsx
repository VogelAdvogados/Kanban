import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { Case } from '../types';
import { ClientGroup, ClientList } from './clients/ClientList';
import { ClientDetails } from './clients/ClientDetails';

interface ClientsModalProps {
  cases: Case[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
  onNewCase: () => void;
  onUpdateClient: (cpf: string, data: Partial<Case>) => void;
}

export const ClientsModal: React.FC<ClientsModalProps> = ({ cases, onClose, onSelectCase, onNewCase, onUpdateClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null);

  // 1. Group cases by Client
  const clients = useMemo(() => {
    const clientMap = new Map<string, ClientGroup>();

    cases.forEach(c => {
        const key = c.cpf ? c.cpf.replace(/\D/g, '') : c.clientName.toLowerCase().replace(/\s/g, '');
        if (!key) return;

        const isActiveCase = !c.columnId.includes('arquiva') && !c.columnId.includes('concluido') && !c.columnId.includes('indeferido');

        if (!clientMap.has(key)) {
            clientMap.set(key, {
                key,
                name: c.clientName,
                cpf: c.cpf,
                phone: c.phone,
                birthDate: c.birthDate,
                addressCity: c.addressCity,
                addressState: c.addressState,
                totalCases: 1,
                activeCasesCount: isActiveCase ? 1 : 0,
                cases: [c],
                latestCase: c,
                lastContactDate: c.lastUpdate,
                tags: c.tags || []
            });
        } else {
            const entry = clientMap.get(key)!;
            entry.totalCases += 1;
            entry.cases.push(c);
            if (isActiveCase) entry.activeCasesCount += 1;
            
            // Prefer newest data
            if (new Date(c.lastUpdate).getTime() > new Date(entry.latestCase.lastUpdate).getTime()) {
                entry.latestCase = c;
                entry.name = c.clientName;
                if(c.phone) entry.phone = c.phone;
                if(c.birthDate) entry.birthDate = c.birthDate;
                if(c.addressCity) entry.addressCity = c.addressCity;
                if(c.addressState) entry.addressState = c.addressState;
                entry.lastContactDate = c.lastUpdate;
            }
            if(c.tags) entry.tags = [...new Set([...entry.tags, ...c.tags])];
        }
    });

    return Array.from(clientMap.values()).sort((a, b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime());
  }, [cases]);

  // 2. Filter Clients
  const filteredClients = useMemo(() => {
      const term = searchTerm.toLowerCase();
      return clients.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.cpf.includes(term) || 
          (c.phone && c.phone.includes(term))
      );
  }, [clients, searchTerm]);

  // Show only first 100 to avoid render lag, search to find more
  const visibleClients = filteredClients.slice(0, 100);

  // 3. Selection Logic
  const selectedClient = useMemo(() => {
      if (!selectedClientKey) return null;
      return clients.find(c => c.key === selectedClientKey) || null;
  }, [clients, selectedClientKey]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* LEFT COLUMN: CLIENT LIST */}
            <ClientList 
                clients={visibleClients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedClientKey={selectedClientKey}
                onSelectClient={setSelectedClientKey}
                onNewCase={onNewCase}
                onClose={onClose}
            />

            {/* RIGHT COLUMN: UNIFIED DETAIL VIEW */}
            <div className={`
                flex-col bg-slate-50 h-full overflow-hidden flex-1
                ${selectedClient ? 'flex' : 'hidden md:flex'} 
            `}>
                {selectedClient ? (
                    <ClientDetails 
                        client={selectedClient}
                        onClose={() => setSelectedClientKey(null)}
                        onUpdateClient={onUpdateClient}
                        onSelectCase={onSelectCase}
                    />
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50 h-full">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                            <Users size={48} className="text-slate-200" />
                        </div>
                        <p className="text-xl font-bold text-slate-400">Selecione um cliente</p>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">Use a lista à esquerda para visualizar a ficha completa e processos.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};