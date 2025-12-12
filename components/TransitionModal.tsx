
import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Calendar, Award, ArrowRight, AlertTriangle, Clock, User, CornerUpLeft, BarChart2 } from 'lucide-react';
import { TransitionType, User as UserType, Case, INSSAgency } from '../types';
import { ProtocolForm } from './transitions/ProtocolForm';
import { ConclusionForm } from './transitions/ConclusionForm';
import { DeadlineForm, PendencyForm } from './transitions/TaskForms';
import { AppealReturnForm } from './transitions/AppealReturnForm';
import { recommendResponsible } from '../utils'; // IMPORT NEW ALGORITHM
import { db } from '../services/database';
import { JUDICIAL_COURTS, DEFAULT_INSS_AGENCIES } from '../constants'; // Import Courts

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
  commonDocs?: string[]; 
  agencies?: INSSAgency[];
}

export const TransitionModal: React.FC<TransitionModalProps> = ({ 
    type, data, caseContext, currentResponsibleId, users, targetColumnId, setData, onConfirm, onCancel, commonDocs, agencies
}) => {
  
  // Suggested user based on load
  const [suggestedUserId, setSuggestedUserId] = useState<string>('');
  const [allCasesForLoad, setAllCasesForLoad] = useState<Case[]>([]);

  useEffect(() => {
    // Fetch cases for load balancing calculation
    db.getCases().then(c => {
        setAllCasesForLoad(c);
        const bestUser = recommendResponsible(users, c);
        setSuggestedUserId(bestUser);
        
        // Initialize default data
        const updates: any = {};
        if(!data.newResponsibleId) updates.newResponsibleId = bestUser || currentResponsibleId; // Smart Default
        if(!data.missingDocs && type === 'PENDENCY') updates.missingDocs = [];
        if (!data.benefitDate && type === 'CONCLUSION_NB') {
            updates.benefitDate = new Date().toISOString().slice(0, 10);
        }
        if (type === 'APPEAL_RETURN') {
            if (data.createSpecialTask === undefined) updates.createSpecialTask = true;
            if (!data.appealOutcome) updates.appealOutcome = 'IMPROVIDO'; 
        }
        if (Object.keys(updates).length > 0) {
            setData({ ...data, ...updates });
        }
    });
  }, []); 

  const handleDataChange = (updates: any) => {
      setData({ ...data, ...updates });
  };

  // Determine correct location list (INSS Agencies vs Judicial Courts)
  const activeLocations = targetColumnId === 'jud_pericia' ? JUDICIAL_COURTS : (agencies || DEFAULT_INSS_AGENCIES);

  // Visual Config
  let title = 'Dados da Transição';
  let Icon = FileText;
  let color = 'text-blue-500';
  let description = '';

  switch(type) {
      case 'PROTOCOL_INSS':
          if (targetColumnId === 'aux_pericia') {
              title = 'Agendamento de Perícia INSS';
              Icon = Clock;
              color = 'text-orange-500';
              description = 'Registre o protocolo e a data do agendamento no INSS.';
          } else if (targetColumnId === 'jud_pericia') {
              title = 'Agendamento de Perícia Judicial';
              Icon = Clock;
              color = 'text-orange-500';
              description = 'Informe data, hora e a Vara Federal.';
          } else {
              title = 'Novo Protocolo';
              Icon = FileText;
              color = 'text-blue-600';
              description = 'O processo foi protocolado. Registre os dados.';
          }
          break;
      case 'PROTOCOL_APPEAL':
          if (targetColumnId === 'rec_camera') {
              title = 'Recurso Especial (Câmara/CAJ)';
              description = 'O processo subiu para a 2ª Instância. Insira o protocolo.';
              color = 'text-purple-600';
          } else if (targetColumnId === 'rec_junta') {
              title = 'Recurso Ordinário (Junta/JR)';
              description = 'Interposição de recurso na 1ª Instância. Insira o protocolo.';
              color = 'text-indigo-600';
          } else {
              title = 'Protocolo de Recurso';
              description = 'Recurso enviado. Quem monitorará?';
              color = 'text-indigo-600';
          }
          Icon = FileText;
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
      case 'APPEAL_RETURN':
          title = 'Retorno de Recurso';
          Icon = CornerUpLeft;
          color = 'text-orange-600';
          description = 'O recurso voltou da Junta. Registre o resultado.';
          break;
  }

  const validateAndConfirm = () => {
    if (type === 'CONCLUSION_NB') {
        if (!data.benefitNumber) { alert("NB é obrigatório."); return; }
        if (!data.benefitDate) { alert("Data da Decisão é obrigatória."); return; }
        if (!data.outcome) { alert("Selecione o resultado (Concedido/Indeferido)."); return; }
    }
    if (type === 'APPEAL_RETURN') {
        if (!data.appealDecisionDate) { alert("Data da decisão é obrigatória."); return; }
        if (!data.appealOutcome) { alert("Selecione o resultado."); return; }
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
                    <ProtocolForm 
                        type={type} 
                        data={data} 
                        onChange={handleDataChange} 
                        targetColumnId={targetColumnId} 
                        agencies={activeLocations} // Pass correct list (INSS vs Courts)
                        allCases={allCasesForLoad} 
                    />
                )}
                
                {type === 'CONCLUSION_NB' && (
                    <ConclusionForm data={data} caseContext={caseContext} onChange={handleDataChange} />
                )}

                {type === 'DEADLINE' && (
                    <DeadlineForm data={data} onChange={handleDataChange} />
                )}

                {type === 'PENDENCY' && (
                    <PendencyForm data={data} onChange={handleDataChange} commonDocs={commonDocs} />
                )}

                {type === 'APPEAL_RETURN' && (
                    <AppealReturnForm data={data} onChange={handleDataChange} />
                )}

                {/* Handover Section with Smart Recommendation */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <User size={12}/> Responsável Próxima Etapa
                        </label>
                        {suggestedUserId && (
                            <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 flex items-center gap-1">
                                <BarChart2 size={10}/> Sugestão: {users.find(u => u.id === suggestedUserId)?.name.split(' ')[0]}
                            </span>
                        )}
                    </div>
                    <select 
                        value={data.newResponsibleId} 
                        onChange={(e) => handleDataChange({ newResponsibleId: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-md text-sm p-2 font-medium focus:ring-2 focus:ring-blue-200 outline-none"
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} {u.id === suggestedUserId ? ' (Recomendado)' : ''}
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
