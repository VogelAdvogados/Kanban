import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Case } from '../types';
import { parseLocalYMD } from '../utils';

interface CalendarModalProps {
  cases: Case[];
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ cases, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  // Map events to dates using parseLocalYMD
  const eventsByDate = useMemo(() => {
    const map: Record<number, any[]> = {};
    
    cases.forEach(c => {
        // 1. Deadlines (Prazos Fatais)
        if (c.deadlineEnd) {
            const d = parseLocalYMD(c.deadlineEnd);
            if (d && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push({ type: 'DEADLINE', label: `Prazo: ${c.clientName}`, color: 'bg-red-500' });
            }
        }
        // 2. Pericias (Compromissos)
        if (c.periciaDate) {
             const d = new Date(c.periciaDate); // Pericia uses datetime-local, standard new Date works fine usually
            if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push({ 
                    type: 'PERICIA', 
                    label: `Perícia: ${c.clientName} (${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')})`, 
                    color: 'bg-orange-500' 
                });
            }
        }
        // 3. DCB (Cessação)
        if (c.dcbDate) {
            const d = parseLocalYMD(c.dcbDate);
            if (d && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push({ type: 'DCB', label: `Cessação: ${c.clientName}`, color: 'bg-yellow-500' });
            }
        }
    });
    return map;
  }, [cases, currentDate]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    setSelectedDay(null);
  };

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row h-[600px]">
        
        {/* CALENDAR GRID */}
        <div className="flex-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft/></button>
                    <h2 className="text-xl font-bold text-slate-800 capitalize">{monthName}</h2>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight/></button>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 md:hidden">
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                    <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr overflow-y-auto">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasEvents = eventsByDate[day];
                    const isSelected = selectedDay === day;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === new Date().getMonth() && new Date().getFullYear() === new Date().getFullYear();

                    return (
                        <button 
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`rounded-lg border p-1 flex flex-col items-center justify-start transition-all min-h-[60px] ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50'} ${isToday ? 'bg-yellow-50 font-bold text-slate-900' : 'text-slate-600'}`}
                        >
                            <span className="text-xs mb-1">{day}</span>
                            <div className="flex gap-1 flex-wrap justify-center w-full px-1">
                                {hasEvents?.slice(0, 4).map((ev: any, idx: number) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full ${ev.color}`} title={ev.label}></div>
                                ))}
                                {hasEvents && hasEvents.length > 4 && <span className="text-[8px] text-slate-400">+</span>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* SIDEBAR DETAILS */}
        <div className="w-full md:w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="text-blue-600"/> 
                    {selectedDay ? `${selectedDay} de ${monthName}` : 'Eventos do Mês'}
                </h3>
                <button onClick={onClose} className="hidden md:block p-1 hover:bg-slate-200 rounded-full text-slate-400">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {selectedDay ? (
                    eventsByDate[selectedDay] ? (
                        eventsByDate[selectedDay].map((ev: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-right-2 duration-300" style={{animationDelay: `${idx * 50}ms`}}>
                                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${ev.color}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{ev.label}</p>
                                    <p className="text-xs text-slate-500 capitalize">
                                        {ev.type === 'DEADLINE' ? 'Prazo Fatal' : ev.type === 'PERICIA' ? 'Compromisso Presencial' : 'Cessação (DCB)'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 text-sm mt-10">Nada agendado para este dia.</p>
                    )
                ) : (
                    // Show overview if no day selected
                    <div className="text-center text-slate-400 text-xs italic mt-10">
                        <p>Selecione um dia no calendário para ver os detalhes.</p>
                    </div>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Prazo
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> Perícia
                </div>
                 <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div> DCB
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};