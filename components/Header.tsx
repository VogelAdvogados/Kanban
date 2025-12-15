
import React, { useState } from 'react';
import { ViewType, User, Notification, Case } from '../types';
import { VIEW_CONFIG, APP_THEMES, SYSTEM_TAGS } from '../constants';
import { Search, LogOut, Bell, CheckSquare, Users, Calendar, BarChart2, Settings, Plus, ChevronDown, Tag, UserCircle, Briefcase, Gavel, Scale, Shield, User as UserIcon, FileCheck, Archive, FileText } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
import { hasPermission } from '../utils';

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
  tagFilter?: string;
  setTagFilter?: (val: string) => void;
  onNewCase: () => void;
  onOpenCmdK: () => void;
  onOpenDashboard: () => void;
  onOpenCalendar: () => void;
  onOpenTasks: () => void;
  onOpenClients: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
  onOpenTemplates?: () => void;
  allCases: Case[];
  users: User[];
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onSelectCase: (c: Case) => void;
  onThemeChange?: (themeId: string) => void; 
}

const DynamicIcon = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => {
    const icons: Record<string, any> = { User: UserIcon, Briefcase, Gavel, Scale, Shield, UserCircle };
    const IconComponent = icons[name] || UserIcon;
    return <IconComponent size={size} className={className} />;
};

export const Header: React.FC<HeaderProps> = ({
  officeName, currentUser, onLogout, currentView, setCurrentView, searchTerm, setSearchTerm,
  responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter, tagFilter, setTagFilter,
  onNewCase, onOpenCmdK,
  onOpenDashboard, onOpenCalendar, onOpenTasks, onOpenClients, onOpenLogs, onOpenSettings, onOpenTemplates,
  allCases, users, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onSelectCase,
  onThemeChange
}) => {
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // THEME LOGIC
  const activeThemeId = currentUser.themePref || 'default';
  const themeConfig = APP_THEMES.find(t => t.id === activeThemeId) || APP_THEMES[0];
  
  const topBarClass = themeConfig.headerTop || 'bg-[#f0f2f5]';
  const bottomBarClass = themeConfig.headerBottom || 'bg-white';
  const textClass = themeConfig.headerText || 'text-slate-800'; // Solves contrast issue
  const searchBgClass = themeConfig.searchBg || 'bg-white border-slate-300'; // Solves search bar visibility

  const NavItem = ({ label, icon: Icon, active, onClick, iconOnly = false }: any) => {
      
      const isBottomDark = ['default', 'dark', 'midnight', 'royal'].includes(themeConfig.id);
      
      let containerClass = '';
      let activeClass = '';
      let inactiveClass = '';
      let iconColor = '';

      if (iconOnly) {
          if (isBottomDark) {
              containerClass = 'text-white/70 hover:bg-white/10 hover:text-white';
              activeClass = 'bg-white/20 text-white ring-1 ring-white/30';
          } else {
              containerClass = 'text-slate-500 hover:bg-slate-100 hover:text-blue-700';
              activeClass = 'bg-blue-50 text-blue-700 border-blue-100';
          }
      } else {
          if (isBottomDark) {
              inactiveClass = 'text-white/70 border-transparent hover:text-white hover:bg-white/5 font-medium';
              activeClass = 'text-white border-white bg-white/10 font-bold';
              iconColor = active ? 'text-white' : 'text-white/70';
          } else {
              inactiveClass = 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50 font-medium';
              activeClass = 'text-blue-700 border-blue-600 bg-blue-50/50 font-bold';
              iconColor = active ? 'text-blue-600' : 'text-slate-400';
          }
      }

      return (
        <button 
            onClick={onClick} 
            title={label}
            className={`
                relative flex items-center justify-center gap-2 transition-all duration-200 group
                ${iconOnly 
                    ? `p-2 rounded-lg ${active ? activeClass : containerClass}` 
                    : `px-4 py-2 text-sm rounded-t-lg border-b-4 ${active ? activeClass : inactiveClass}`
                }
            `}
        >
            {Icon && <Icon size={iconOnly ? 20 : 16} className={!iconOnly ? iconColor : ''} />}
            {!iconOnly && <span>{label}</span>}
            {iconOnly && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg font-bold">
                    {label}
                </span>
            )}
        </button>
      );
  };

  const isBottomDark = ['default', 'dark', 'midnight', 'royal'].includes(themeConfig.id);
  const canViewLogs = hasPermission(currentUser, 'VIEW_LOGS');
  const canManageSettings = hasPermission(currentUser, 'MANAGE_SETTINGS') || hasPermission(currentUser, 'MANAGE_USERS');

  return (
    <header className="flex flex-col z-40 relative shadow-md">
        
        {/* TOP BAR */}
        <div className={`${topBarClass} h-16 px-4 lg:px-6 flex items-center justify-between border-b border-white/10 transition-colors duration-500 gap-4`}>
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <div className="w-9 h-9 relative hover:scale-105 transition-transform">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
                        <defs>
                            <linearGradient id="headerBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="#1e3a8a" />
                            </linearGradient>
                            <linearGradient id="headerGreen" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#15803d" />
                            </linearGradient>
                        </defs>
                        <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(45 50 50)" stroke="url(#headerBlue)" strokeWidth="14" strokeLinecap="round" />
                        <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(-45 50 50)" stroke="url(#headerGreen)" strokeWidth="14" strokeLinecap="round" />
                    </svg>
                </div>
                <h1 className={`font-bold text-xl tracking-tight font-sans hidden md:block ${textClass}`}>
                    {officeName || 'Rambo Prev'}
                </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-auto">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className={`h-4 w-4 transition-colors ${textClass} opacity-60`} />
                    </div>
                    <input
                        type="text"
                        className={`
                            block w-full pl-10 pr-10 py-2 border rounded-full leading-5 focus:outline-none focus:ring-2 sm:text-sm transition-all shadow-sm cursor-text
                            ${searchBgClass} ${textClass} focus:ring-opacity-50
                        `}
                        placeholder="Buscar processos, clientes ou comandos (Cmd+K)..."
                        onClick={onOpenCmdK}
                        readOnly
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className={`text-[10px] font-mono border rounded px-1.5 opacity-60 ${textClass} border-current`}>/</span>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 w-64 justify-end">
                <div className="relative">
                    <button 
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2 rounded-full transition-colors relative ${themeConfig.menuHover} ${textClass}`}
                        title="Notificações"
                    >
                        <Bell size={20} className="opacity-90"/>
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>
                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-[88]" onClick={() => setNotifOpen(false)}></div>
                            <NotificationsPanel notifications={notifications} onMarkAsRead={onMarkNotificationAsRead} onMarkAllAsRead={onMarkAllNotificationsAsRead} onSelectCase={(id) => { const c = allCases.find(ac => ac.id === id); if(c) onSelectCase(c); }} onClose={() => setNotifOpen(false)} />
                        </>
                    )}
                </div>

                <div className={`h-6 w-px mx-1 opacity-20 bg-current ${textClass}`}></div>

                <div className="relative">
                    <button 
                        onClick={() => setProfileOpen(!profileOpen)}
                        className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all border border-transparent group ${themeConfig.menuHover}`}
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white/20" style={{ backgroundColor: currentUser.color || '#1e293b' }}>
                            {currentUser.avatarIcon ? <DynamicIcon name={currentUser.avatarIcon} size={16} /> : currentUser.avatarInitials}
                        </div>
                        <ChevronDown size={14} className={`${textClass} opacity-70 group-hover:opacity-100`}/>
                    </button>

                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-[88]" onClick={() => setProfileOpen(false)}></div>
                            <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-[90] p-1.5 animate-in fade-in slide-in-from-top-2 text-slate-800">
                                <div className="px-4 py-3 border-b border-slate-100 mb-1 bg-gradient-to-r from-slate-50 to-white rounded-t-lg">
                                    <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{currentUser.role === 'LAWYER' ? 'Advogado' : currentUser.role}</p>
                                </div>
                                
                                <button onClick={() => { onOpenSettings(); setProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-xs font-bold">
                                    <UserCircle size={16} /> Meu Perfil
                                </button>
                                
                                {canManageSettings && (
                                    <>
                                        <button onClick={() => { if(onOpenTemplates) onOpenTemplates(); setProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-xs font-bold">
                                            <FileText size={16} /> Gerenciar Modelos
                                        </button>
                                        <button onClick={() => { onOpenSettings(); setProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors text-xs font-bold">
                                            <Settings size={16} /> Configurações
                                        </button>
                                    </>
                                )}

                                <div className="h-px bg-slate-100 my-1"></div>
                                <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-xs font-bold">
                                    <LogOut size={16} /> Sair do Sistema
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* BOTTOM BAR */}
        <div className={`${bottomBarClass} h-12 border-b border-slate-200/50 flex items-center justify-between px-4 lg:px-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-30 transition-colors duration-500`}>
            <div className="w-48 flex-shrink-0">
                <button 
                    onClick={onNewCase} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all active:scale-95 ${isBottomDark ? 'bg-white text-blue-900 hover:bg-blue-50' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                >
                    <Plus size={14} strokeWidth={3} />
                    <span>Novo Caso</span>
                </button>
            </div>

            <div className="flex-1 flex justify-center h-full">
                <div className="flex items-end gap-1 h-full overflow-x-auto no-scrollbar">
                    {(Object.keys(VIEW_CONFIG) as ViewType[])
                        .filter(v => v !== 'ARCHIVED')
                        .map((view) => {
                            const config = VIEW_CONFIG[view];
                            return <NavItem key={view} label={config.label} active={currentView === view} onClick={() => setCurrentView(view)} />;
                        })
                    }
                </div>
            </div>

            <div className="w-48 flex justify-end items-center gap-1 flex-shrink-0">
                <NavItem iconOnly label="Arquivo" icon={Archive} active={currentView === 'ARCHIVED'} onClick={() => setCurrentView('ARCHIVED')} />
                <div className={`h-4 w-px mx-1 bg-current opacity-20 ${isBottomDark ? 'text-white' : 'text-slate-400'}`}></div>
                <NavItem iconOnly label="Dashboard" icon={BarChart2} onClick={onOpenDashboard} />
                <NavItem iconOnly label="Clientes" icon={Users} onClick={onOpenClients} />
                <NavItem iconOnly label="Agenda" icon={Calendar} onClick={onOpenCalendar} />
                <NavItem iconOnly label="Tarefas" icon={CheckSquare} onClick={onOpenTasks} />
                {canViewLogs && <NavItem iconOnly label="Logs" icon={FileCheck} onClick={onOpenLogs} />}
            </div>
        </div>

        {/* FILTERS */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 lg:px-6 py-2 flex items-center gap-4 text-xs z-20 overflow-x-auto no-scrollbar shadow-inner">
             <div className="flex items-center gap-2 text-slate-400 flex-shrink-0 font-bold uppercase tracking-wide text-[9px]">
                 <Search size={12} /> Filtros Rápidos:
             </div>
             
             <div className="flex gap-2">
                 <div className="relative group">
                     <select value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)} className="appearance-none bg-white border border-slate-200 hover:border-blue-300 rounded-md px-3 py-1 pr-6 text-slate-600 text-[11px] font-medium outline-none cursor-pointer focus:ring-1 focus:ring-blue-200 transition-all shadow-sm">
                         <option value="">Responsável (Todos)</option>
                         {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                     </select>
                     <ChevronDown size={10} className="absolute right-2 top-2 text-slate-400 pointer-events-none"/>
                 </div>

                 <div className="relative group">
                     <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="appearance-none bg-white border border-slate-200 hover:border-blue-300 rounded-md px-3 py-1 pr-6 text-slate-600 text-[11px] font-medium outline-none cursor-pointer focus:ring-1 focus:ring-blue-200 transition-all shadow-sm">
                         <option value="">Prioridade (Todas)</option>
                         <option value="NORMAL">Normal</option>
                         <option value="HIGH">Alta</option>
                         <option value="CRITICAL">Crítica</option>
                     </select>
                     <ChevronDown size={10} className="absolute right-2 top-2 text-slate-400 pointer-events-none"/>
                 </div>

                 {setTagFilter && (
                     <div className="relative group">
                         <select value={tagFilter || ''} onChange={(e) => setTagFilter(e.target.value)} className="appearance-none bg-white border border-slate-200 hover:border-blue-300 rounded-md px-3 py-1 pr-6 pl-7 text-slate-600 text-[11px] font-medium outline-none cursor-pointer focus:ring-1 focus:ring-blue-200 transition-all shadow-sm">
                             <option value="">Etiquetas (Todas)</option>
                             {SYSTEM_TAGS.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                         </select>
                         <Tag size={10} className="absolute left-2 top-2 text-slate-400 pointer-events-none"/>
                         <ChevronDown size={10} className="absolute right-2 top-2 text-slate-400 pointer-events-none"/>
                     </div>
                 )}
             </div>

             <div className="flex-1"></div>
             
             {(searchTerm || responsibleFilter || urgencyFilter || tagFilter) && (
                 <button onClick={() => { setSearchTerm(''); setResponsibleFilter(''); setUrgencyFilter(''); if(setTagFilter) setTagFilter(''); }} className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold transition-colors flex-shrink-0 text-[9px] uppercase tracking-wide px-2 py-1 rounded hover:bg-red-50">
                     <LogOut size={10} className="rotate-180"/> Limpar
                 </button>
             )}
        </div>
    </header>
  );
};
