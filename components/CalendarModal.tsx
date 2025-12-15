
import React from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, ArrowRight } from 'lucide-react';
import { Case } from '../types';
import { useCalendarLogic, CalendarEvent } from '../hooks/useCalendarLogic';

interface CalendarModalProps {
  cases: Case[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
  onNewAppointment?: (date: Date) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ cases, onClose, onSelectCase, onNewAppointment }) => {
  const {
      selectedDate, monthLabel, calendarCells, selectedEvents,
      handlePrevMonth, handleNextMonth, handleJumpToday, isToday, isSelected
  } = useCalendarLogic(cases);

  const getEventColorClass = (type: string) => {
      switch(type) {
          case 'APPOINTMENT': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'DEADLINE': return 'bg-red-50 text-red-700 border-red-200';
          case 'PERICIA': return 'bg-orange-50 text-orange-700 border-orange-200';
          case 'DCB': return 'bg-amber-50 text-amber-700 border-amber-200';
          default: return 'bg-slate-50 text-slate-700 border-slate-200';
      }
  };

  const handleEventClick = (ev: CalendarEvent) => {
      if (ev.caseObj) {
          onSelectCase(ev.caseObj);
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1200px] h-[90vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/20">
        
        {/* LEFT: CALENDAR GRID */}
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all"><ChevronLeft size={18}/></button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all"><ChevronRight size={18}/></button>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{monthLabel}</h2>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleJumpToday}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                    >
                        Hoje
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors md:hidden">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-slate-100">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => (
                    <div key={d} className={`py-3 text-[10px] font-bold text-center uppercase tracking-widest ${i === 0 || i === 6 ? 'text-slate-400 bg-slate-50/50' : 'text-slate-500'}`}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-50/30 overflow-y-auto">
                {calendarCells.map((cell, idx) => {
                    if (!cell) return <div key={`empty-${idx}`} className="border-b border-r border-slate-100 bg-slate-50/30 min-h-[100px]" />;
                    
                    const selected = isSelected(cell.date);
                    const today = isToday(cell.date);

                    return (
                        <div 
                            key={cell.key}
                            onClick={() => selected ? null : (cell.date && onNewAppointment && onNewAppointment(cell.date))} // Placeholder interaction
                            className={`
                                relative p-2 border-b border-r border-slate-100 min-h-[100px] cursor-pointer transition-all group
                                ${selected ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-400 z-10' : 'hover:bg-white hover:shadow-inner'}
                                ${today ? 'bg-blue-50/10' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`
                                    text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors
                                    ${today ? 'bg-blue-600 text-white shadow-md' : selected ? 'text-blue-700' : 'text-slate-700 group-hover:bg-slate-100'}
                                `}>
                                    {cell.day}
                                </span>
                                {today && <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mt-1 mr-1">Hoje</span>}
                            </div>

                            {/* Event Indicators (Pills) */}
                            <div className="mt-2 space-y-1">
                                {cell.events.slice(0, 3).map(ev => (
                                    <div key={ev.id} className={`h-1.5 rounded-full w-full ${ev.color} opacity-80`} title={ev.title}></div>
                                ))}
                                {cell.events.length > 3 && (
                                    <div className="text-[9px] text-slate-400 font-bold pl-1">+ {cell.events.length - 3}</div>
                                )}
                            </div>
                            
                            {/* Hover Add Button */}
                            {onNewAppointment && (
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onNewAppointment(cell.date); }}
                                        className="p-1.5 bg-white text-blue-600 rounded-full shadow-sm border border-blue-100 hover:bg-blue-50"
                                    >
                                        <Plus size={14}/>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* RIGHT: AGENDA SIDEBAR */}
        <div className="w-full md:w-96 bg-slate-50 border-l border-slate-200 flex flex-col h-full shadow-2xl z-20">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-start">
                <div>
                    <h3 className="text-4xl font-light text-slate-800">{selectedDate.getDate()}</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    {onNewAppointment && (
                        <button 
                            onClick={() => onNewAppointment(selectedDate)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center"
                            title="Adicionar Evento"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                    <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Events List (Timeline) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                        <CalendarIcon size={48} className="mb-4 text-slate-300"/>
                        <p className="text-sm font-medium">Nenhum compromisso.</p>
                        <p className="text-xs">Aproveite o dia livre!</p>
                    </div>
                ) : (
                    selectedEvents.map((ev, idx) => (
                        <div key={idx} className="flex gap-4 group">
                            {/* Time Column */}
                            <div className="flex flex-col items-end w-14 flex-shrink-0 pt-1">
                                <span className="text-sm font-bold text-slate-700">{ev.time || '--:--'}</span>
                                {idx !== selectedEvents.length - 1 && (
                                    <div className="w-px h-full bg-slate-200 my-2 mr-2 group-last:hidden"></div>
                                )}
                            </div>

                            {/* Card */}
                            <div 
                                onClick={() => handleEventClick(ev)}
                                className={`flex-1 p-3 rounded-xl border border-l-4 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer ${getEventColorClass(ev.type).replace('text-', 'border-l-')} hover:scale-[1.02]`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 w-fit ${getEventColorClass(ev.type)}`}>
                                        <ev.icon size={10} /> {ev.type === 'APPOINTMENT' ? 'Agenda' : ev.type === 'DEADLINE' ? 'Prazo' : ev.type === 'PERICIA' ? 'Perícia' : 'DCB'}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">{ev.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{ev.subtitle}</p>
                                {ev.caseId && (
                                    <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                                        <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:underline">
                                            Ver Processo <ArrowRight size={10}/>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary Footer */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Prazos Fatais
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Perícias
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Atendimentos
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Cessação (DCB)
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
