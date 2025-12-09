
import React, { useState, useEffect } from 'react';
import { ViewType, User, Notification, Case } from '../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../constants';
import { Search, LogOut, ExternalLink, Bell, LayoutGrid, CheckSquare, Users, Calendar, BarChart2, Settings, Plus, ChevronDown, Menu } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';

interface HeaderProps {
  officeName: string;
  currentUser: User;
  onLogout: () => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  responsibleFilter: string;
  setResponsibleFilter: (id: string) => void;
  urgencyFilter: string;
  setUrgencyFilter: (val: string) => void;
  onNewCase: () => void;
  onOpenCmdK: () => void;
  
  // Direct Actions
  onOpenDashboard: () => void;
  onOpenCalendar: () => void;
  onOpenTasks: () => void;
  onOpenClients: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;

  allCases: Case[];
  users: User[];
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onSelectCase: (c: Case) => void;
}

export const Header: React.FC<HeaderProps> = ({
  officeName, currentUser, onLogout, currentView, setCurrentView, searchTerm, setSearchTerm,
  responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter,
  onNewCase, onOpenCmdK,
  onOpenDashboard, onOpenCalendar, onOpenTasks, onOpenClients, onOpenLogs, onOpenSettings,
  allCases, users, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onSelectCase
}) => {
  
  const [linksOpen, setLinksOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchTerm]);

  const EXTERNAL_LINKS = [
    { label: 'Meu INSS', url: 'https://meu.inss.gov.br/' },
    { label: 'SAG / INSS Digital', url: 'https://requerimento.inss.gov.br/' },
    { label: 'Consulta Processual', url: 'https://eproc.trf4.jus.br/' },
    { label: 'CRPS (Recursos)', url: 'https://consultaprocessos.inss.gov.br/' },
    { label: 'Cálculos (Prev)', url: 'https://previdenciarista.com/' },
  ];

  // Helper for Top Bar Icons
  const TopBarIcon = ({ icon: Icon, onClick, badge, title }: any) => (
    <button 
        onClick={onClick}
        className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-200 rounded transition-colors relative"
        title={title}
    >
        <Icon size={20} strokeWidth={1.5} />
        {badge > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-100"></span>
        )}
    </button>
  );

  // Helper for Bottom Bar Navigation Items
  const NavItem = ({ label, icon: Icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap
            ${active 
                ? 'text-white bg-blue-800 rounded-md shadow-sm' 
                : 'text-blue-100 hover:text-white hover:bg-blue-600 rounded-md'
            }
        `}
    >
        {Icon && <Icon size={16} className={active ? 'opacity-100' : 'opacity-70'} />}
        {label}
    </button>
  );

  return (
    <header className="flex flex-col z-40 relative shadow-md">
        
        {/* --- 1. TOP BAR (Light Gray - Identification) --- */}
        <div className="bg-[#f0f2f5] h-16 px-6 flex items-center justify-between border-b border-slate-300">
            
            {/* LEFT: System Identity */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center shadow-sm text-white font-bold text-lg">
                    <LayoutGrid size={22} />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="font-bold text-xl text-blue-900 leading-none tracking-tight">Rambo Prev</h1>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Sistema Jurídico</span>
                </div>
            </div>

            {/* CENTER: Office Name */}
            <div className="hidden lg:flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                <span className="text-lg font-bold text-slate-800 tracking-tight">{officeName || 'Vogel Advogados'}</span>
            </div>

            {/* RIGHT: Utilities & Profile */}
            <div className="flex items-center gap-1 md:gap-3">
                <div className="hidden md:flex items-center gap-1 border-r border-slate-300 pr-3 mr-1">
                    <div className="relative">
                        <TopBarIcon icon={LayoutGrid} onClick={() => setLinksOpen(!linksOpen)} title="Links Úteis" />
                         {linksOpen && (
                            <>
                            <div className="fixed inset-0 z-[88]" onClick={() => setLinksOpen(false)}></div>
                            <div className="absolute top-10 right-0 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-[90] p-2 animate-in fade-in slide-in-from-top-2">
                                <h4 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acesso Rápido</h4>
                                {EXTERNAL_LINKS.map((link, idx) => (
                                    <a 
                                        key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between px-3 py-2.5 rounded hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium group"
                                    >
                                        {link.label}
                                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                            </>
                        )}
                    </div>
                    <div className="relative">
                        <TopBarIcon icon={Bell} badge={unreadCount} onClick={() => setNotifOpen(!notifOpen)} title="Notificações" />
                        {notifOpen && (
                            <>
                                <div className="fixed inset-0 z-[88]" onClick={() => setNotifOpen(false)}></div>
                                <NotificationsPanel 
                                    notifications={notifications}
                                    onMarkAsRead={onMarkNotificationAsRead}
                                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                                    onSelectCase={(id) => {
                                        const c = allCases.find(ac => ac.id === id);
                                        if(c) onSelectCase(c);
                                    }}
                                    onClose={() => setNotifOpen(false)}
                                />
                            </>
                        )}
                    </div>
                    <TopBarIcon icon={Settings} onClick={onOpenSettings} title="Configurações" />
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-200 p-1.5 rounded-lg transition-colors group" onClick={onLogout} title="Clique para sair">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{currentUser.role === 'LAWYER' ? 'Administrador' : currentUser.role}</p>
                    </div>
                    <div 
                        className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white"
                        style={{ backgroundColor: currentUser.color || '#1e293b' }}
                    >
                        {currentUser.avatarInitials}
                    </div>
                </div>
            </div>
        </div>

        {/* --- 2. BOTTOM BAR (Dark Blue - Navigation) --- */}
        <div className="bg-[#1e3a8a] h-14 px-4 flex items-center justify-between shadow-inner">
            
            {/* LEFT GROUP: New Case + Search */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* NEW CASE BUTTON */}
                <button 
                    onClick={onNewCase}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-md text-sm font-bold shadow-sm transition-all active:scale-95 border border-blue-100"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span className="hidden md:inline">Novo Caso</span>
                </button>

                {/* Search Compact (Moved Here) */}
                <div className="relative hidden xl:block group">
                     <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="bg-blue-900/50 border border-blue-700 text-blue-100 text-xs rounded-full pl-8 pr-3 py-1.5 w-48 focus:w-64 transition-all outline-none focus:bg-blue-900 focus:border-blue-500 placeholder-blue-400"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                     />
                     <Search size={12} className="absolute left-2.5 top-2 text-blue-400" />
                </div>
                
                <div className="h-6 w-px bg-blue-800 hidden md:block mx-1"></div>
            </div>

            {/* MIDDLE GROUP: Views (Tabs) */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 px-4">
                 {(Object.keys(VIEW_CONFIG) as ViewType[]).map((view) => {
                    const config = VIEW_CONFIG[view];
                    return (
                        <NavItem 
                            key={view}
                            label={config.label}
                            active={currentView === view}
                            onClick={() => setCurrentView(view)}
                        />
                    );
                })}
            </div>

            {/* RIGHT GROUP: Tools */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <div className="h-6 w-px bg-blue-800 hidden md:block mx-1"></div>
                <div className="flex items-center gap-1">
                    <NavItem label="Dashboard" icon={BarChart2} onClick={onOpenDashboard} />
                    <NavItem label="Clientes" icon={Users} onClick={onOpenClients} />
                    <NavItem label="Agenda" icon={Calendar} onClick={onOpenCalendar} />
                    <NavItem label="Tarefas" icon={CheckSquare} onClick={onOpenTasks} />
                </div>
            </div>
        </div>

        {/* --- 3. FILTER STRIP (Sub-header) --- */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-4 text-xs shadow-sm z-30">
             <div className="flex items-center gap-2 text-slate-500">
                <Search size={14} />
                <span className="font-bold uppercase text-[10px]">Filtros:</span>
             </div>
             
             {/* Responsible Filter */}
             <div className="relative group">
                 <select 
                    value={responsibleFilter}
                    onChange={(e) => setResponsibleFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-full px-3 py-1 pr-8 text-slate-600 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all"
                 >
                     <option value="">Todos os Responsáveis</option>
                     {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                 </select>
                 <ChevronDown size={12} className="absolute right-2.5 top-2 text-slate-400 pointer-events-none"/>
             </div>

             {/* Urgency Filter */}
             <div className="relative group">
                 <select 
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-full px-3 py-1 pr-8 text-slate-600 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all"
                 >
                     <option value="">Todas as Prioridades</option>
                     <option value="NORMAL">Normal</option>
                     <option value="HIGH">Alta</option>
                     <option value="CRITICAL">Crítica</option>
                 </select>
                 <ChevronDown size={12} className="absolute right-2.5 top-2 text-slate-400 pointer-events-none"/>
             </div>

             <div className="flex-1"></div>

             {(searchTerm || responsibleFilter || urgencyFilter) && (
                 <button 
                    onClick={() => { setSearchTerm(''); setResponsibleFilter(''); setUrgencyFilter(''); setLocalSearch(''); }}
                    className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-medium transition-colors"
                 >
                     <LogOut size={12} className="rotate-180"/> Limpar Filtros
                 </button>
             )}
        </div>
    </header>
  );
};
