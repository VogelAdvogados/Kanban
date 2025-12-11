
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Phone, User, Check, X } from 'lucide-react';
import { Case, User as UserType, Appointment, AppointmentType } from '../types';

interface AppointmentDialogProps {
  caseItem: Case;
  users: UserType[];
  currentUser: UserType;
  onSave: (appt: Appointment) => void;
  onClose: () => void;
}

export const AppointmentDialog: React.FC<AppointmentDialogProps> = ({ caseItem, users, currentUser, onSave, onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('MEETING');
  const [lawyerId, setLawyerId] = useState(caseItem.responsibleId || currentUser.id);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
      if (!date || !time) {
          alert('Selecione data e hora.');
          return;
      }

      const appt: Appointment = {
          id: `appt_${Date.now()}`,
          caseId: caseItem.id,
          clientName: caseItem.clientName,
          lawyerId,
          date: `${date}T${time}`,
          type,
          notes,
          status: 'SCHEDULED',
          createdAt: new Date().toISOString()
      };

      onSave(appt);
      onClose();
  };

  const getIcon = (t: AppointmentType) => {
      switch(t) {
          case 'VIDEO_CALL': return <Video size={18}/>;
          case 'PHONE_CALL': return <Phone size={18}/>;
          case 'VISIT': return <MapPin size={18}/>;
          default: return <User size={18}/>;
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-purple-600"/> Agendar Atendimento
                </h3>
                <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cliente</label>
                    <p className="text-sm font-bold text-slate-800">{caseItem.clientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                        <input 
                            type="date" 
                            className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
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
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Advogado Responsável</label>
                    <select 
                        className="w-full border border-slate-300 rounded p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-200"
                        value={lawyerId}
                        onChange={e => setLawyerId(e.target.value)}
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
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

                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-100 rounded">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md">
                        <Check size={14}/> Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
