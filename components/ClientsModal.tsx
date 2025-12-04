
import React, { useState, useMemo } from 'react';
import { X, Search, User, Phone, FileText, ExternalLink, Download, Users } from 'lucide-react';
import { Case } from '../types';
import { exportToCSV } from '../utils';

interface ClientsModalProps {
  cases: Case[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
}

export const ClientsModal: React.FC<ClientsModalProps> = ({ cases, onClose, onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Group cases by Client (CPF as unique key)
  const clients = useMemo(() => {
    const clientMap = new Map<string, { 
        name: string, 
        cpf: string, 
        phone: string, 
        totalCases: number, 
        latestCase: Case 
    }>();

    cases.forEach(c => {
        // Normalize Key: CPF numbers or Name if CPF is missing
        const key = c.cpf ? c.cpf.replace(/\D/g, '') : c.clientName.toLowerCase();
        
        if (!clientMap.has(key)) {
            clientMap.set(key, {
                name: c.clientName,
                cpf: c.cpf,
                phone: c.phone,
                totalCases: 1,
                latestCase: c
            });
        } else {
            const entry = clientMap.get(key)!;
            entry.totalCases += 1;
            // Keep the most recently updated case as the reference
            if (new Date(c.lastUpdate).getTime() > new Date(entry.latestCase.lastUpdate).getTime()) {
                entry.latestCase = c;
            }
        }
    });

    return Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cases]);

  // 2. Filter
  const filteredClients = useMemo(() => {
      const term = searchTerm.toLowerCase();
      return clients.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.cpf.includes(term) ||
          (c.phone && c.phone.includes(term))
      );
  }, [clients, searchTerm]);

  // 3. Export specific for Clients
  const handleExportClients = () => {
      const headers = ["Nome", "CPF", "Telefone", "Total Processos", "Ultimo Processo"];
      const rows = filteredClients.map(c => [
          `"${c.name}"`,
          `"${c.cpf}"`,
          `"${c.phone}"`,
          c.totalCases,
          c.latestCase.internalId
      ].join(","));
      
      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `rambo_prev_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-blue-600" /> Base de Clientes (CRM)
                </h2>
                <p className="text-sm text-slate-500">Gestão centralizada de pessoas atendidas pelo escritório.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* TOOLBAR */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search size={18} className="text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar cliente por nome, CPF ou telefone..." 
                    className="bg-transparent text-sm w-full outline-none text-slate-700 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400">
                    {filteredClients.length} clientes encontrados
                </span>
                <button 
                    onClick={handleExportClients}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                    <Download size={14} /> Exportar Lista
                </button>
            </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-3">Nome do Cliente</th>
                        <th className="px-6 py-3">CPF</th>
                        <th className="px-6 py-3">Contato</th>
                        <th className="px-6 py-3 text-center">Processos</th>
                        <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredClients.map((client) => (
                        <tr key={client.cpf} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                        {client.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                        {client.name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-600 font-mono text-xs bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                                    <FileText size={12} className="text-slate-400"/>
                                    {client.cpf}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {client.phone ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={14} className="text-green-500"/>
                                        {client.phone}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-300 italic">Sem telefone</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${client.totalCases > 1 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {client.totalCases} {client.totalCases === 1 ? 'caso' : 'casos'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => { onClose(); onSelectCase(client.latestCase); }}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                                >
                                    Ver Ficha <ExternalLink size={12} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    
                    {filteredClients.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                Nenhum cliente encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};
