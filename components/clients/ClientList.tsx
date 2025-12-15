
import React from 'react';
import { Search, Users, Plus, X } from 'lucide-react';
import { Case } from '../../types';
import { getClientAvatarColor } from '../../utils';

export interface ClientGroup {
    key: string; 
    name: string;
    cpf: string;
    phone: string;
    birthDate?: string;
    addressCity?: string;
    addressState?: string;
    totalCases: number;
    activeCasesCount: number;
    latestCase: Case;
    cases: Case[];
    lastContactDate: string;
    tags: string[];
}

interface ClientListProps {
    clients: ClientGroup[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedClientKey: string | null;
    onSelectClient: (key: string) => void;
    onNewCase: () => void;
    onClose: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({ 
    clients, searchTerm, onSearchChange, selectedClientKey, onSelectClient, onNewCase, onClose
}) => {
    
    // Consistent initial generator
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className={`
            flex-col bg-white h-full border-r border-slate-200 z-10 
            ${selectedClientKey ? 'hidden md:flex' : 'flex'} 
            w-full md:w-80 flex-shrink-0
        `}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" size={20} /> Clientes
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou CPF..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Client List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/30">
                {clients.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                        Nenhum cliente encontrado.
                    </div>
                ) : (
                    clients.map(client => {
                        const isSelected = selectedClientKey === client.key;
                        const avatarColorClass = isSelected 
                            ? 'bg-blue-500 text-white border-blue-500' // Selected state overrides color
                            : `${getClientAvatarColor(client.latestCase.sex).replace('shadow-', '')} text-white border-transparent`; // Use gender color when not selected (simplified)

                        // Simplified color logic for list items
                        let listAvatarClass = 'bg-slate-100 text-slate-500 border-slate-200';
                        if (isSelected) {
                            listAvatarClass = 'bg-blue-500 text-white border-blue-500';
                        } else if (client.latestCase.sex === 'FEMALE') {
                            listAvatarClass = 'bg-pink-100 text-pink-600 border-pink-200';
                        } else if (client.latestCase.sex === 'MALE') {
                            listAvatarClass = 'bg-blue-100 text-blue-600 border-blue-200';
                        }

                        return (
                            <div 
                                key={client.key}
                                onClick={() => onSelectClient(client.key)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border group relative overflow-hidden ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
                            >
                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors flex-shrink-0 ${listAvatarClass}`}>
                                        {getInitials(client.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{client.name}</h4>
                                        <p className="text-xs text-slate-400 truncate">{client.phone || 'Sem contato'}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${client.activeCasesCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                            {client.totalCases}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white">
                <button 
                    onClick={() => { onClose(); onNewCase(); }} 
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-transform active:scale-95"
                >
                    <Plus size={18}/> Novo Cadastro
                </button>
            </div>
        </div>
    );
};
