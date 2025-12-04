import React, { useState } from 'react';
import { FileText, Calendar, Hash, Award, User, ArrowRight, AlertTriangle, CheckSquare, Clock } from 'lucide-react';
import { TransitionType, User as UserType } from '../types';
import { COMMON_DOCUMENTS } from '../constants';

interface TransitionModalProps {
  type: TransitionType;
  data: {
    protocolNumber: string;
    protocolDate: string;
    appealProtocolNumber?: string;
    benefitNumber?: string;
    benefitDate?: string;
    deadlineStart: string;
    deadlineEnd: string;
    newResponsibleId?: string; // New field for handover
    missingDocs?: string[]; // For Pendency
    periciaDate?: string; // For scheduling
  };
  currentResponsibleId: string;
  users: UserType[];
  targetColumnId?: string; // Know where we are going
  setData: (data: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TransitionModal: React.FC<TransitionModalProps> = ({ type, data, currentResponsibleId, users, targetColumnId, setData, onConfirm, onCancel }) => {
  
  let title = 'Dados da Transição';
  let Icon = FileText;
  let color = 'text-blue-500';
  let description = '';

  if (type === 'PROTOCOL_INSS') { 
      title = 'Novo Protocolo INSS'; 
      Icon = FileText; 
      color='text-blue-600'; 
      description = 'O processo foi protocolado. Registre os dados e defina quem acompanhará.';
      
      // Customize for Pericia
      if (targetColumnId === 'aux_pericia') {
          title = 'Agendamento de Perícia';
          Icon = Clock;
          color = 'text-orange-500';
          description = 'Registre o protocolo e a data do agendamento da perícia médica.';
      }
  }
  if (type === 'PROTOCOL_APPEAL') { 
      title = 'Protocolo de Recurso'; 
      Icon = FileText; 
      color='text-indigo-600';
      description = 'Recurso enviado à Junta/CRPS. Quem monitorará o julgamento?';
  }
  if (type === 'CONCLUSION_NB') { 
      title = 'Conclusão da Análise'; 
      Icon = Award; 
      color='text-emerald-600';
      description = 'A análise administrativa terminou. Informe o resultado e envie para a Mesa de Decisão.';
  }
  if (type === 'DEADLINE') { 
      title = 'Controle de Prazos'; 
      Icon = Calendar; 
      color='text-yellow-500';
      description = 'Uma exigência foi aberta. Defina os prazos e o responsável pelo cumprimento.';
  }
  if (type === 'PENDENCY') {
      title = 'Registrar Pendências';
      Icon = AlertTriangle;
      color = 'text-red-500';
      description = 'Identifique quais documentos faltam para o cliente ser notificado automaticamente.';
  }

  // Set default responsible if not set
  React.useEffect(() => {
      if(!data.newResponsibleId) {
          setData({...data, newResponsibleId: currentResponsibleId});
      }
      if(!data.missingDocs && type === 'PENDENCY') {
          setData({...data, missingDocs: []});
      }
  }, []);

  const toggleDoc = (doc: string) => {
      const current = data.missingDocs || [];
      if(current.includes(doc)) {
          setData({...data, missingDocs: current.filter((d: string) => d !== doc)});
      } else {
          setData({...data, missingDocs: [...current, doc]});
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${type === 'PENDENCY' ? 'max-w-md' : 'max-w-sm'} p-6 animate-in zoom-in duration-200`}>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Icon size={24} className={color}/>
                {title}
            </h3>
            <p className="text-xs text-slate-500 mb-5 mt-1 leading-relaxed">
                {description}
            </p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
                
                {/* PROTOCOLO INSS (Expanded for Pericia) */}
                {type === 'PROTOCOL_INSS' && (
                    <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Prot.</label>
                            <input 
                                type="date" 
                                className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={data.protocolDate}
                                onChange={e => setData({...data, protocolDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Protocolo</label>
                            <input 
                                type="text" 
                                placeholder="Ex: 123456789"
                                className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={data.protocolNumber}
                                onChange={e => setData({...data, protocolNumber: e.target.value})}
                            />
                        </div>
                    </div>
                    {/* Extra Field for Pericia */}
                    {targetColumnId === 'aux_pericia' && (
                        <div className="pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">Data da Perícia Agendada</label>
                            <input 
                                type="datetime-local" 
                                className="w-full border-orange-300 rounded text-sm focus:ring-orange-500 focus:border-orange-500"
                                value={data.periciaDate || ''}
                                onChange={e => setData({...data, periciaDate: e.target.value})}
                            />
                        </div>
                    )}
                    </>
                )}

                {/* PROTOCOLO RECURSO */}
                {type === 'PROTOCOL_APPEAL' && (
                    <>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Protocolo Recurso</label>
                        <input 
                            type="text" 
                            className="w-full border-indigo-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                            value={data.appealProtocolNumber || ''}
                            onChange={e => setData({...data, appealProtocolNumber: e.target.value})}
                        />
                    </div>
                    </>
                )}

                {/* CONCLUSÃO (NB) */}
                {type === 'CONCLUSION_NB' && (
                    <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Decisão</label>
                            <input 
                                type="date" 
                                className="w-full border-emerald-300 rounded text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                value={data.benefitDate || ''}
                                onChange={e => setData({...data, benefitDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">NB (Se concedido)</label>
                            <input 
                                type="text" 
                                placeholder="Opcional"
                                className="w-full border-emerald-300 rounded text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                value={data.benefitNumber || ''}
                                onChange={e => setData({...data, benefitNumber: e.target.value})}
                            />
                        </div>
                    </div>
                    </>
                )}

                {/* PRAZOS */}
                {type === 'DEADLINE' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Início</label>
                            <input 
                                type="date" 
                                className="w-full border-yellow-300 rounded text-sm focus:ring-yellow-500 focus:border-yellow-500"
                                value={data.deadlineStart}
                                onChange={e => setData({...data, deadlineStart: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prazo Final</label>
                            <input 
                                type="date" 
                                className="w-full border-yellow-300 rounded text-sm focus:ring-yellow-500 focus:border-yellow-500"
                                value={data.deadlineEnd}
                                onChange={e => setData({...data, deadlineEnd: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {/* PENDÊNCIAS (Missing Docs) */}
                {type === 'PENDENCY' && (
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-red-500 uppercase">Selecione o que falta:</label>
                        <div className="grid grid-cols-2 gap-2">
                            {COMMON_DOCUMENTS.map((doc) => {
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
                )}

                {/* --- RESPONSIBILITY HANDOVER (CRITICAL) --- */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <User size={12}/> Com quem fica o processo agora?
                    </label>
                    <select 
                        value={data.newResponsibleId} 
                        onChange={(e) => setData({...data, newResponsibleId: e.target.value})}
                        className="w-full bg-white border border-slate-300 rounded-md text-sm p-2 font-medium focus:ring-2 focus:ring-blue-200 outline-none"
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.role === 'LAWYER' ? 'Advogado' : u.role === 'SECRETARY' ? 'Secretaria' : 'Outro'})
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button 
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded uppercase tracking-wider"
                >
                    Cancelar
                </button>
                <button 
                onClick={onConfirm}
                className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all active:scale-95 bg-slate-900 hover:bg-slate-800 flex items-center gap-2`}
                >
                    Confirmar e Mover <ArrowRight size={14}/>
                </button>
            </div>
        </div>
    </div>
  );
};