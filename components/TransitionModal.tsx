import React, { useEffect } from 'react';
import { FileText, Calendar, Award, ArrowRight, AlertTriangle, Clock, User } from 'lucide-react';
import { TransitionType, User as UserType, Case } from '../types';
import { ProtocolForm } from './transitions/ProtocolForm';
import { ConclusionForm } from './transitions/ConclusionForm';
import { DeadlineForm, PendencyForm } from './transitions/TaskForms';

interface TransitionModalProps {
  type: TransitionType;
  data: any;
  caseContext?: Case;
  currentResponsibleId: string;
  users: UserType[];
  targetColumnId?: string;
  setData: (data: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TransitionModal: React.FC<TransitionModalProps> = ({ 
    type, data, caseContext, currentResponsibleId, users, targetColumnId, setData, onConfirm, onCancel 
}) => {
  
  // Initialize default data
  useEffect(() => {
    const updates: any = {};
    if(!data.newResponsibleId) updates.newResponsibleId = currentResponsibleId;
    if(!data.missingDocs && type === 'PENDENCY') updates.missingDocs = [];
    if (!data.benefitDate && type === 'CONCLUSION_NB') {
        updates.benefitDate = new Date().toISOString().slice(0, 10);
    }
    if (Object.keys(updates).length > 0) {
        setData({ ...data, ...updates });
    }
  }, []); // Run once on mount

  const handleDataChange = (updates: any) => {
      setData({ ...data, ...updates });
  };

  // Configuração Visual Baseada no Tipo
  let title = 'Dados da Transição';
  let Icon = FileText;
  let color = 'text-blue-500';
  let description = '';

  switch(type) {
      case 'PROTOCOL_INSS':
          title = targetColumnId === 'aux_pericia' ? 'Agendamento de Perícia' : 'Novo Protocolo INSS';
          Icon = targetColumnId === 'aux_pericia' ? Clock : FileText;
          color = targetColumnId === 'aux_pericia' ? 'text-orange-500' : 'text-blue-600';
          description = targetColumnId === 'aux_pericia' ? 'Registre o protocolo e a data do agendamento.' : 'O processo foi protocolado. Registre os dados.';
          break;
      case 'PROTOCOL_APPEAL':
          title = 'Protocolo de Recurso';
          Icon = FileText;
          color = 'text-indigo-600';
          description = 'Recurso enviado à Junta/CRPS. Quem monitorará?';
          break;
      case 'CONCLUSION_NB':
          title = 'Conclusão da Análise';
          Icon = Award;
          color = 'text-emerald-600';
          description = 'O INSS emitiu uma decisão. Registre o NB.';
          break;
      case 'DEADLINE':
          title = 'Controle de Prazos';
          Icon = Calendar;
          color = 'text-yellow-500';
          description = 'Uma exigência foi aberta. Defina os prazos.';
          break;
      case 'PENDENCY':
          title = 'Registrar Pendências';
          Icon = AlertTriangle;
          color = 'text-red-500';
          description = 'Identifique documentos faltantes.';
          break;
  }

  const validateAndConfirm = () => {
    if (type === 'CONCLUSION_NB') {
        if (!data.benefitNumber) { alert("NB é obrigatório."); return; }
        if (!data.benefitDate) { alert("Data da Decisão é obrigatória."); return; }
        if (!data.outcome) { alert("Selecione o resultado (Concedido/Indeferido)."); return; }
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${type === 'PENDENCY' || type === 'CONCLUSION_NB' ? 'max-w-md' : 'max-w-sm'} p-6 animate-in zoom-in duration-200 border border-slate-200`}>
            
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100`}>
                    <Icon size={24} className={color}/>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-none">{title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                </div>
            </div>
            
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1 kanban-scroll">
                {(type === 'PROTOCOL_INSS' || type === 'PROTOCOL_APPEAL') && (
                    <ProtocolForm type={type} data={data} onChange={handleDataChange} targetColumnId={targetColumnId} />
                )}
                
                {type === 'CONCLUSION_NB' && (
                    <ConclusionForm data={data} caseContext={caseContext} onChange={handleDataChange} />
                )}

                {type === 'DEADLINE' && (
                    <DeadlineForm data={data} onChange={handleDataChange} />
                )}

                {type === 'PENDENCY' && (
                    <PendencyForm data={data} onChange={handleDataChange} />
                )}

                {/* Handover Section */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <User size={12}/> Com quem fica o processo agora?
                    </label>
                    <select 
                        value={data.newResponsibleId} 
                        onChange={(e) => handleDataChange({ newResponsibleId: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md text-sm p-2 font-medium focus:ring-2 focus:ring-blue-200 outline-none"
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.role === 'LAWYER' ? 'Adv.' : u.role === 'SECRETARY' ? 'Sec.' : 'Outro'})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded uppercase">
                    Cancelar
                </button>
                <button 
                    onClick={validateAndConfirm}
                    className="px-5 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all active:scale-95 bg-slate-900 hover:bg-slate-800 flex items-center gap-2"
                >
                    Confirmar <ArrowRight size={14}/>
                </button>
            </div>
        </div>
    </div>
  );
};