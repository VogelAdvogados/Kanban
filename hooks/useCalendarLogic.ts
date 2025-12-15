
import { useState, useMemo, useEffect } from 'react';
import { User, AlertCircle, MapPin, Flag } from 'lucide-react';
import { Case, Appointment } from '../types';
import { parseLocalYMD } from '../utils';
import { db } from '../services/database';

export type EventType = 'APPOINTMENT' | 'DEADLINE' | 'PERICIA' | 'DCB';

export interface CalendarEvent {
    id: string;
    type: EventType;
    title: string;
    subtitle?: string;
    time?: string;
    date: Date;
    color: string;
    icon: any;
    caseId?: string;
    caseObj?: Case;
}

export const useCalendarLogic = (cases: Case[]) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
      db.getAppointments().then(setAppointments);
  }, []);

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // --- EVENT MAPPING ---
  const events = useMemo(() => {
    const list: CalendarEvent[] = [];

    // 1. Appointments
    appointments.forEach(appt => {
        if(appt.status === 'CANCELLED') return;
        const d = new Date(appt.date);
        const linkedCase = cases.find(c => c.id === appt.caseId);
        
        list.push({
            id: appt.id,
            type: 'APPOINTMENT',
            title: appt.clientName,
            subtitle: appt.type === 'MEETING' ? 'Reunião Presencial' : appt.type === 'VIDEO_CALL' ? 'Videoconferência' : 'Atendimento',
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: d,
            color: 'bg-purple-500',
            icon: User,
            caseId: appt.caseId,
            caseObj: linkedCase
        });
    });

    // 2. Case Events
    cases.forEach(c => {
        if (c.deadlineEnd) {
            const d = parseLocalYMD(c.deadlineEnd);
            if (d) {
                list.push({
                    id: `dl_${c.id}`,
                    type: 'DEADLINE',
                    title: c.clientName,
                    subtitle: `Prazo Fatal: ${c.columnId.split('_').pop()?.toUpperCase()}`,
                    date: d,
                    color: 'bg-red-500',
                    icon: AlertCircle,
                    caseId: c.id,
                    caseObj: c
                });
            }
        }
        if (c.periciaDate) {
             const d = new Date(c.periciaDate);
             list.push({
                id: `per_${c.id}`,
                type: 'PERICIA',
                title: c.clientName,
                subtitle: `Perícia ${c.columnId === 'jud_pericia' ? 'Judicial' : 'INSS'}`,
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: d,
                color: 'bg-orange-500',
                icon: MapPin,
                caseId: c.id,
                caseObj: c
            });
        }
        if (c.dcbDate) {
            const d = parseLocalYMD(c.dcbDate);
            if (d) {
                list.push({
                    id: `dcb_${c.id}`,
                    type: 'DCB',
                    title: c.clientName,
                    subtitle: 'Cessação de Benefício',
                    date: d,
                    color: 'bg-amber-500',
                    icon: Flag,
                    caseId: c.id,
                    caseObj: c
                });
            }
        }
    });

    return list;
  }, [cases, appointments]);

  const eventsByDay = useMemo(() => {
      const map: Record<string, CalendarEvent[]> = {};
      events.forEach(ev => {
          const key = ev.date.toISOString().split('T')[0];
          if (!map[key]) map[key] = [];
          map[key].push(ev);
      });
      return map;
  }, [events]);

  const calendarCells = useMemo(() => {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      
      const cells = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
          cells.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const key = date.toISOString().split('T')[0];
          cells.push({ day: i, date, key, events: eventsByDay[key] || [] });
      }
      return cells;
  }, [currentDate, eventsByDay]);

  const selectedEvents = useMemo(() => {
      const key = selectedDate.toISOString().split('T')[0];
      return (eventsByDay[key] || []).sort((a, b) => {
          const timeA = a.time || '23:59';
          const timeB = b.time || '23:59';
          return timeA.localeCompare(timeB);
      });
  }, [selectedDate, eventsByDay]);

  return {
      currentDate, setCurrentDate,
      selectedDate, setSelectedDate,
      monthLabel, calendarCells, selectedEvents,
      handlePrevMonth: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)),
      handleNextMonth: () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)),
      handleJumpToday: () => { const now = new Date(); setCurrentDate(now); setSelectedDate(now); },
      isToday: (d: Date) => { const now = new Date(); return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); },
      isSelected: (d: Date) => d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
  };
};
