
import React, { useState, useEffect } from 'react';
import { ViewType, User, Notification, Case } from '../types';
import { VIEW_CONFIG, VIEW_THEMES, SYSTEM_TAGS, APP_THEMES } from '../constants';
import { Search, LogOut, ExternalLink, Bell, LayoutGrid, CheckSquare, Users, Calendar, BarChart2, Settings, Plus, ChevronDown, Menu, Tag, Command, Scale, UserCircle } from 'lucide-react';
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
  tagFilter?: string; // New Tag Filter
  setTagFilter?: (val: string) => void;
  onNewCase: () => void;
  onOpenCmdK: () => void; // This will now open Global Search
  
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
  responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter, tagFilter, setTagFilter,
  onNewCase, onOpenCmdK,
  onOpenDashboard, onOpenCalendar, onOpenTasks, onOpenClients, onOpenLogs, onOpenSettings,
  allCases, users, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onSelectCase
}) => {
  
  const [linksOpen, setLinksOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // --- THEME LOGIC ---
  const activeThemeId = currentUser.themePref || 'default';
  const themeConfig = APP_THEMES.find(t => t.id === activeThemeId);
  
  // Use theme colors or fall back to original defaults
  const topBarClass = themeConfig?.headerTop || 'bg-[#f0f2f5]';
  const bottomBarClass = themeConfig?.headerBottom || 'bg-[#1e3a8a]';

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

  // Helper for Bottom Bar Navigation Items (Refactored for Theming)
  const NavItem = ({ label, icon: Icon, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap
            ${active 
                ? 'text-white bg-black/20 rounded-md shadow-sm border border-white/10' 
                : 'text-white/70 hover:text-white hover:bg-white/10 rounded-md'
            }
        `}
    >
        {Icon && <Icon size={16} className={active ? 'opacity-100' : 'opacity-70'} />}
        {label}
    </button>
  );

  return (
    <header className="flex flex-col z-40 relative shadow-md">
        
        {/* --- 1. TOP BAR (User Identity & Tools) --- */}
        <div className={`${topBarClass} h-16 px-6 flex items-center justify-between border-b border-slate-300 transition-colors duration-500`}>
            
            {/* LEFT: System Identity */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center shadow-sm text-white font-bold text-lg border border-blue-900/20">
                    <Scale size={22} strokeWidth={2.5} />
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

                {/* User Profile (Dropdown) */}
                <div className="relative">
                    <div 
                        className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-200 p-1.5 rounded-lg transition-colors group select-none" 
                        onClick={() => setProfileOpen(!profileOpen)} 
                        title="Opções do Usuário"
                    >
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
                        <ChevronDown size={14} className="text-slate-400 hidden md:block"/>
                    </div>

                    {/* Profile Menu */}
                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-[88]" onClick={() => setProfileOpen(false)}></div>
                            <div className="absolute top-14 right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-[90] p-1.5 animate-in fade-in slide-in-from-top-2">
                                <div className="md:hidden px-3 py-2 border-b border-slate-100 mb-1">
                                    <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
                                    <p className="text-[10px] text-slate-500">{currentUser.role}</p>
                                </div>
                                <button 
                                    onClick={() => { onOpenSettings(); setProfileOpen(false); }} 
                                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-xs font-bold"
                                >
                                    <UserCircle size={16} /> Meu Perfil
                                </button>
                                <button 
                                    onClick={() => { onOpenSettings(); setProfileOpen(false); }} 
                                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-xs font-bold"
                                >
                                    <Settings size={16} /> Configurações
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button 
                                    onClick={onLogout} 
                                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-xs font-bold"
                                >
                                    <LogOut size={16} /> Sair
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* --- 2. BOTTOM BAR (Main Navigation) --- */}
        <div className={`${bottomBarClass} h-14 px-4 flex items-center justify-between shadow-inner transition-colors duration-500`}>
            
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

                {/* SMART SEARCH TRIGGER */}
                <button 
                    onClick={onOpenCmdK}
                    className="hidden xl:flex items-center gap-3 bg-black/20 border border-white/10 hover:bg-black/30 text-white/90 rounded-full pl-3 pr-4 py-1.5 w-64 transition-all group"
                >
                     <Search size={14} className="text-white/60 group-hover:text-white" />
                     <span className="text-xs flex-1 text-left opacity-80">Buscar contatos, tarefas...</span>
                </button>
                
                <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
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
                <div className="h-6 w-px bg-white/20 hidden md:block mx-1"></div>
                <div className="flex items-center gap-1">
                    <NavItem label="Dashboard" icon={BarChart2} onClick={onOpenDashboard} />
                    <NavItem label="Clientes" icon={Users} onClick={onOpenClients} />
                    <NavItem label="Agenda" icon={Calendar} onClick={onOpenCalendar} />
                    <NavItem label="Tarefas" icon={CheckSquare} onClick={onOpenTasks} />
                </div>
            </div>
        </div>

        {/* --- 3. FILTER STRIP (Sub-header) --- */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-4 text-xs shadow-sm z-30 overflow-x-auto">
             <div className="flex items-center gap-2 text-slate-500 flex-shrink-0">
                <Search size={14} />
                <span className="font-bold uppercase text-[10px]">Filtros Rápidos:</span>
             </div>
             
             {/* Responsible Filter */}
             <div className="relative group flex-shrink-0">
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
             <div className="relative group flex-shrink-0">
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

             {/* TAGS FILTER (New) */}
             {setTagFilter && (
                 <div className="relative group flex-shrink-0">
                     <select 
                        value={tagFilter || ''}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-full px-3 py-1 pr-8 text-slate-600 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all pl-7"
                     >
                         <option value="">Todas as Etiquetas</option>
                         {SYSTEM_TAGS.map(t => (
                             <option key={t.id} value={t.label}>{t.label}</option>
                         ))}
                     </select>
                     <Tag size={12} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none"/>
                     <ChevronDown size={12} className="absolute right-2.5 top-2 text-slate-400 pointer-events-none"/>
                 </div>
             )}

             <div className="flex-1"></div>

             {(searchTerm || responsibleFilter || urgencyFilter || tagFilter) && (
                 <button 
                    onClick={() => { setSearchTerm(''); setResponsibleFilter(''); setUrgencyFilter(''); if(setTagFilter) setTagFilter(''); }}
                    className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-medium transition-colors flex-shrink-0"
                 >
                     <LogOut size={12} className="rotate-180"/> Limpar Filtros
                 </button>
             )}
        </div>
    </header>
  );
};
