import React, { useState } from 'react';
import { UserPlus, Search, AlertCircle, Check, XCircle } from 'lucide-react';
import { Case } from '../types';
import { validateCPF, formatCPF } from '../utils';

interface NewCaseDialogProps {
  cases: Case[];
  onClose: () => void;
  onProceed: (cpf: string, existingData?: Partial<Case>) => void;
}

export const NewCaseDialog: React.FC<NewCaseDialogProps> = ({ cases, onClose, onProceed }) => {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [existingCase, setExistingCase] = useState<Case | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCPF(e.target.value);
      setCpf(formatted);
      if (error) setError(''); // Limpa erro ao digitar
      if (existingCase) setExistingCase(null); // Reseta busca ao mudar CPF
  };

  const handleSearch = () => {
    // 1. Validar CPF Matemático
    if (!validateCPF(cpf)) {
        setError('CPF inválido. Verifique os dígitos.');
        return;
    }

    // 2. Buscar Existente
    const found = cases.find(c => c.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''));
    
    if (found) {
      setExistingCase(found);
    } else {
      onProceed(cpf);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-600 p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Novo Atendimento</h2>
            <p className="text-blue-100 text-sm">Identifique o cliente para iniciar</p>
        </div>
        
        <div className="p-6">
            {!existingCase ? (
                <>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CPF do Cliente</label>
                    <div className="relative mb-4">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="000.000.000-00"
                            className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg p-3 pr-12 ${error ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300'}`}
                            value={cpf}
                            onChange={handleCpfChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            maxLength={14}
                        />
                        <button 
                            onClick={handleSearch}
                            className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white px-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 mb-4 animate-in slide-in-from-top-1">
                            <XCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-600 mt-1" size={20} />
                        <div>
                            <h4 className="font-bold text-blue-900">Cliente Recorrente!</h4>
                            <p className="text-sm text-blue-700 mb-2">
                                Encontramos <b>{existingCase.clientName}</b> em outro processo ({existingCase.columnId}).
                            </p>
                            <p className="text-xs text-blue-600 mb-3">Deseja importar os dados pessoais?</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onProceed(existingCase.cpf, {
                                        clientName: existingCase.clientName,
                                        phone: existingCase.phone,
                                        birthDate: existingCase.birthDate,
                                        govPassword: existingCase.govPassword
                                    })}
                                    className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded flex items-center gap-1 hover:bg-blue-700"
                                >
                                    <Check size={14} /> Sim, Importar Dados
                                </button>
                                <button 
                                    onClick={() => onProceed(existingCase.cpf)} // Proceed without data
                                    className="bg-white text-blue-600 border border-blue-200 text-xs font-bold px-3 py-2 rounded hover:bg-blue-50"
                                >
                                    Não, Apenas CPF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
                <button 
                    onClick={onClose}
                    className="text-slate-500 font-bold text-sm hover:text-slate-800 px-4 py-2"
                >
                    Cancelar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};