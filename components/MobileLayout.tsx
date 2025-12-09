
import React, { useState } from 'react';
import { ViewType, Case, User, ColumnDefinition } from '../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../constants';
import { CaseCard } from './CaseCard';
import { Search, Menu, Plus, Calendar, CheckSquare, BarChart2, Bell, Filter } from 'lucide-react';

interface MobileLayoutProps {
  officeName: string;
  currentUser: User;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  cases: Case[];
  filteredCases: Case[];
  columns: ColumnDefinition[];
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  onSelectCase: (c: Case) => void;
  onNewCase: () => void;
  onOpenDashboard: () => void;
  onOpenCalendar: () => void;
  onOpenTasks: () => void;
  onLogout: () => void;
  users: User[];
  notificationsCount: number;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  officeName, currentUser, currentView, setCurrentView,
  cases, filteredCases, columns, searchTerm, setSearchTerm,
  onSelectCase, onNewCase,
  onOpenDashboard, onOpenCalendar, onOpenTasks, onLogout,
  users, notificationsCount
}) => {
  const activeTheme = VIEW_THEMES[currentView];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Group cases by column for the vertical list view
  const casesByColumn = React.useMemo(() => {
    const map: Record<string, Case[]> = {};
    columns.forEach(col => map[col.id] = []);
    filteredCases.forEach(c => {
        if (map[c.columnId]) map[c.columnId].push(c);
    });
    return map;
  }, [filteredCases, columns]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      
      {/* 1. MOBILE HEADER */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeTheme.bgGradient} flex items-center justify-center`}>
                    <span className="font-bold text-xs text-slate-700">{officeName.charAt(0)}</span>
                </div>
                <h1 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{officeName}</h1>
            </div>
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                    <Bell size={20} />
                    {notificationsCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                <div 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border border-slate-100"
                    style={{ backgroundColor: currentUser.color || '#64748b' }}
                >
                    {currentUser.avatarInitials}
                </div>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
                type="text" 
                placeholder="Buscar cliente, CPF..." 
                className="w-full bg-slate-100 border-none rounded-lg pl-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* 2. VIEW SELECTOR (Horizontal Scroll) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar sticky top-[105px] z-20 shadow-sm">
        {(Object.keys(VIEW_CONFIG) as ViewType[]).map((view) => {
            const config = VIEW_CONFIG[view];
            const isActive = currentView === view;
            const theme = VIEW_THEMES[view];
            return (
                <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all border ${
                        isActive 
                        ? `bg-slate-800 text-white border-slate-800 shadow-md` 
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                >
                    <config.icon size={12} />
                    {config.label}
                </button>
            );
        })}
      </div>

      {/* 3. CONTENT AREA (Vertical List) */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {columns.map(col => {
            const colCases = casesByColumn[col.id];
            if (colCases.length === 0) return null; // Hide empty columns on mobile to save space
            
            return (
                <div key={col.id} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-slate-50/95 backdrop-blur py-2 z-10">
                        <div className={`w-2 h-2 rounded-full ${col.color.replace('border-', 'bg-')}`}></div>
                        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                            {col.title} ({colCases.length})
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {colCases.map(c => (
                            <CaseCard 
                                key={c.id}
                                data={c}
                                onClick={() => onSelectCase(c)}
                                onDragStart={() => {}} // No drag on mobile
                                users={users}
                                recurrentCount={0}
                                isDragging={false}
                            />
                        ))}
                    </div>
                </div>
            );
        })}
        {filteredCases.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                <p>Nenhum processo encontrado nesta visão.</p>
            </div>
        )}
      </div>

      {/* 4. FLOATING ACTION BUTTON */}
      <button 
        onClick={onNewCase}
        className="fixed bottom-20 right-4 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* 5. BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 pb-safe">
        <button onClick={onOpenDashboard} className="flex flex-col items-center p-2 text-slate-400 hover:text-blue-600 gap-1">
            <BarChart2 size={20} />
            <span className="text-[10px] font-medium">Dash</span>
        </button>
        <button onClick={onOpenCalendar} className="flex flex-col items-center p-2 text-slate-400 hover:text-blue-600 gap-1">
            <Calendar size={20} />
            <span className="text-[10px] font-medium">Agenda</span>
        </button>
        <div className="w-8"></div> {/* Spacer for FAB */}
        <button onClick={onOpenTasks} className="flex flex-col items-center p-2 text-slate-400 hover:text-blue-600 gap-1">
            <CheckSquare size={20} />
            <span className="text-[10px] font-medium">Tarefas</span>
        </button>
        <button onClick={onLogout} className="flex flex-col items-center p-2 text-slate-400 hover:text-red-500 gap-1">
            <Filter size={20} /> {/* Placeholder for Menu/Logout */}
            <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
      
      {/* Simple Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: currentUser.color || '#64748b' }}
                    >
                        {currentUser.avatarInitials}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{currentUser.name}</h3>
                        <p className="text-xs text-slate-500">{currentUser.role}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl mb-2">
                    Sair da Conta
                </button>
                <button onClick={() => setIsMenuOpen(false)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">
                    Cancelar
                </button>
            </div>
        </div>
      )}

    </div>
  );
};
