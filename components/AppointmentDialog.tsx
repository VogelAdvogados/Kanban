
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Video, Phone, User, Check, X, Palmtree, AlertCircle, MessageCircle, Search, Briefcase } from 'lucide-react';
import { Case, User as UserType, Appointment, AppointmentType } from '../types';
import { parseLocalYMD } from '../utils';

interface AppointmentDialogProps {
  caseItem?: Case; // Made optional
  initialDate?: Date; // Optional pre-fill
  allCases?: Case[]; // Required for searching if caseItem is missing
  users: UserType[];
  currentUser: UserType;
  onSave: (appt: Appointment, sendWhatsApp: boolean) => void;
  onClose: () => void;
}

export const AppointmentDialog: React.FC<AppointmentDialogProps> = ({ caseItem, initialDate, allCases = [], users, currentUser, onSave, onClose }) => {
  // Step 1: Select Case/Client (if not provided)
  const [selectedCase, setSelectedCase] = useState<Case | null>(caseItem || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Step 2: Details
  const [date, setDate] = useState(initialDate ? initialDate.toISOString().split('T')[0] : '');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('MEETING');
  const [lawyerId, setLawyerId] = useState(caseItem?.responsibleId || currentUser.id);
  const [notes, setNotes] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  
  // Vacation Validation State
  const [vacationError, setVacationError] = useState<{ message: string, backupId?: string } | null>(null);

  // Search Logic
  const filteredCases = useMemo(() => {
      if (!searchTerm) return [];
      const lower = searchTerm.toLowerCase();
      return allCases.filter(c => 
          c.clientName.toLowerCase().includes(lower) || 
          c.cpf.includes(lower) || 
          c.internalId.toLowerCase().includes(lower)
      ).slice(0, 5);
  }, [searchTerm, allCases]);

  // Update lawyer when case is selected
  useEffect(() => {
      if (selectedCase) {
          setLawyerId(selectedCase.responsibleId);
      }
  }, [selectedCase]);

  // Check Vacation Logic whenever Date or Lawyer changes
  useEffect(() => {
      if (!date || !lawyerId) {
          setVacationError(null);
          return;
      }

      const selectedLawyer = users.find(u => u.id === lawyerId);
      if (selectedLawyer && selectedLawyer.vacation && selectedLawyer.vacation.start && selectedLawyer.vacation.end) {
          const apptDate = parseLocalYMD(date);
          const start = parseLocalYMD(selectedLawyer.vacation.start);
          const end = parseLocalYMD(selectedLawyer.vacation.end);

          if (apptDate && start && end && apptDate >= start && apptDate <= end) {
              const backupUser = users.find(u => u.id === selectedLawyer.vacation?.backupUserId);
              setVacationError({
                  message: `${selectedLawyer.name} estará de férias neste período (${new Date(start).toLocaleDateString()} a ${new Date(end).toLocaleDateString()}).`,
                  backupId: backupUser?.id
              });
          } else {
              setVacationError(null);
          }
      } else {
          setVacationError(null);
      }
  }, [date, lawyerId, users]);

  const handleApplyBackup = () => {
      if (vacationError?.backupId) {
          setLawyerId(vacationError.backupId);
          setVacationError(null); // Clear error after switching
      }
  };

  const handleSave = () => {
      if (!selectedCase) {
          alert("Selecione um cliente.");
          return;
      }
      if (!date || !time) {
          alert('Selecione data e hora.');
          return;
      }
      
      if (vacationError) {
          alert("Não é possível agendar: Profissional em férias.");
          return;
      }

      const appt: Appointment = {
          id: `appt_${Date.now()}`,
          caseId: selectedCase.id,
          clientName: selectedCase.clientName,
          lawyerId,
          date: `${date}T${time}`,
          type,
          notes,
          status: 'SCHEDULED',
          createdAt: new Date().toISOString()
      };

      onSave(appt, sendWhatsApp);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-purple-600"/> {selectedCase ? 'Agendar Atendimento' : 'Novo Agendamento'}
                </h3>
                <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
                
                {/* CASE SELECTION */}
                {!selectedCase ? (
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Buscar Cliente / Processo</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Nome, CPF ou ID do processo..."
                                className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2 mt-2">
                            {filteredCases.map(c => (
                                <button 
                                    key={c.id}
                                    onClick={() => setSelectedCase(c)}
                                    className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                >
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-purple-800">{c.clientName}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-slate-500">#{c.internalId}</span>
                                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400 group-hover:border-purple-200 group-hover:text-purple-600">
                                            {c.view}
                                        </span>
                                    </div>
                                </button>
                            ))}
                            {searchTerm && filteredCases.length === 0 && (
                                <p className="text-center text-xs text-slate-400 py-4">Nenhum cliente encontrado.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <div>
                                <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Cliente Selecionado</label>
                                <p className="text-sm font-bold text-slate-800">{selectedCase.clientName}</p>
                                <p className="text-xs text-slate-500">Proc. #{selectedCase.internalId}</p>
                            </div>
                            <button onClick={() => setSelectedCase(null)} className="text-xs text-purple-600 font-bold hover:underline bg-white px-2 py-1 rounded border border-purple-200">
                                Trocar
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                                <input 
                                    type="date" 
                                    className={`w-full border rounded p-2 text-sm outline-none focus:ring-2 ${vacationError ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-purple-200'}`}
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                                <input 
                                    type="time" 
                                    className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Advogado Responsável</label>
                            <select 
                                className="w-full border border-slate-300 rounded p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-200"
                                value={lawyerId}
                                onChange={e => setLawyerId(e.target.value)}
                            >
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} {u.vacation?.start ? ' (Planeja Férias)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* VACATION WARNING BLOCK */}
                        {vacationError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-2">
                                    <Palmtree size={16} className="text-red-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-red-800">Profissional Ausente</p>
                                        <p className="text-xs text-red-700 leading-tight mt-1">{vacationError.message}</p>
                                        
                                        {vacationError.backupId && (
                                            <button 
                                                onClick={handleApplyBackup}
                                                className="mt-2 text-xs bg-white border border-red-200 text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                Mudar para Backup ({users.find(u => u.id === vacationError.backupId)?.name})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Atendimento</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'MEETING', label: 'Presencial', icon: User },
                                    { id: 'VIDEO_CALL', label: 'Videoconferência', icon: Video },
                                    { id: 'PHONE_CALL', label: 'Telefone', icon: Phone },
                                    { id: 'VISIT', label: 'Visita Externa', icon: MapPin },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setType(opt.id as AppointmentType)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all ${type === opt.id ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <opt.icon size={14}/> {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações (Opcional)</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none h-20"
                                placeholder="Ex: Trazer documentos originais..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-100">
                            <input 
                                type="checkbox" 
                                id="sendWa" 
                                checked={sendWhatsApp} 
                                onChange={(e) => setSendWhatsApp(e.target.checked)}
                                className="rounded text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor="sendWa" className="text-xs font-bold text-green-800 flex items-center gap-1 cursor-pointer select-none">
                                <MessageCircle size={14}/> Enviar confirmação por WhatsApp
                            </label>
                        </div>
                    </>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-white">
                <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-100 rounded">Cancelar</button>
                <button 
                    onClick={handleSave} 
                    disabled={!!vacationError || (!selectedCase && searchTerm === '')}
                    className={`px-6 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-md transition-all ${vacationError ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700 active:scale-95'}`}
                >
                    <Check size={14}/> Confirmar Agendamento
                </button>
            </div>
        </div>
    </div>
  );
};
