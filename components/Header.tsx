
import React, { useState } from 'react';
import { ViewType, User, Notification, Case } from '../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../constants';
import { BarChart2, Download, Plus, Filter, Search, X, Settings, Calendar, LogOut, FileText, Globe, ExternalLink, CheckSquare, Users, Bell } from 'lucide-react';
import { exportToCSV } from '../utils';
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
  onOpenDashboard: () => void;
  onNewCase: () => void;
  onOpenSettings: () => void;
  onOpenCalendar: () => void;
  onOpenLogs: () => void; 
  onOpenTasks: () => void;
  onOpenCmdK: () => void;
  onOpenClients: () => void;
  allCases: Case[];
  users: User[];
  
  // Notification Props
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onSelectCase: (c: Case) => void;
}

export const Header: React.FC<HeaderProps> = ({
  officeName, currentUser, onLogout, currentView, setCurrentView, searchTerm, setSearchTerm,
  responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter,
  onOpenDashboard, onNewCase, onOpenSettings, onOpenCalendar, onOpenLogs, onOpenTasks, onOpenCmdK, onOpenClients, allCases, users,
  notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onSelectCase
}) => {
  
  const [linksOpen, setLinksOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const activeTheme = VIEW_THEMES[currentView];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const EXTERNAL_LINKS = [
    { label: 'Meu INSS', url: 'https://meu.inss.gov.br/central/#/', color: 'bg-blue-500' },
    { label: 'INSS Digital (SAG)', url: 'https://novorequerimento.inss.gov.br/', color: 'bg-slate-700' },
    { label: 'Consulta Recursos', url: 'https://consultaprocessos.inss.gov.br/', color: 'bg-orange-500' },
    { label: 'E-Proc JFRS', url: 'https://eproc.jfrs.jus.br//eprocV2/', color: 'bg-red-600' }
  ];

  const handleSelectNotification = (caseId: string) => {
      const c = allCases.find(item => item.id === caseId);
      if (c) onSelectCase(c);
      setNotifOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm flex-shrink-0 z-20 flex flex-col border-b border-slate-200/50">
        {/* Top Row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg text-white transition-colors duration-500 ${activeTheme.button}`}>{officeName.charAt(0)}</div>
             <div className="hidden md:block">
                <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">{officeName}</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">Gestão Jurídica 4.2</p>
             </div>
             <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
             
             {/* Navigation Pills */}
             <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[40vw] xl:max-w-none">
                 {(Object.keys(VIEW_CONFIG) as ViewType[]).map((view) => {
                    const config = VIEW_CONFIG[view];
                    const theme = VIEW_THEMES[view];
                    const Icon = config.icon;
                    const isActive = currentView === view;
                    return (
                      <button 
                        key={view} 
                        onClick={() => setCurrentView(view)}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${isActive ? `${theme.button} shadow-md` : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                      >
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span className="hidden lg:inline">{config.label}</span>
                      </button>
                    );
                 })}
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 relative">
                
                {/* External Links Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setLinksOpen(!linksOpen)}
                        className={`text-slate-500 hover:text-blue-600 p-2 hover:bg-white rounded-full transition-all shadow-sm ${linksOpen ? 'bg-white text-blue-600 shadow-md ring-2 ring-blue-100' : ''}`} 
                        title="Links Externos (INSS/JFRS)"
                    >
                        <Globe size={20} />
                    </button>
                    
                    {linksOpen && (
                        <>
                            <div className="fixed inset-0 z-[55]" onClick={() => setLinksOpen(false)}></div>
                            <div className="absolute top-12 left-0 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-[60] animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 border-b border-slate-50 mb-1">Acesso Rápido</h4>
                                {EXTERNAL_LINKS.map(link => (
                                    <a 
                                        key={link.label}
                                        href={link.url}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-lg group transition-colors"
                                        onClick={() => setLinksOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${link.color}`}></div>
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{link.label}</span>
                                        </div>
                                        <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-500" />
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="w-[1px] h-5 bg-slate-300 mx-1"></div>

                <button onClick={onOpenCmdK} className="text-slate-500 hover:text-purple-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Busca Global (Ctrl+K)"><Search size={20} /></button>
                <button onClick={onOpenTasks} className="text-slate-500 hover:text-emerald-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Central de Tarefas"><CheckSquare size={20} /></button>
                <button onClick={onOpenClients} className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Base de Clientes (CRM)"><Users size={20} /></button>
                
                {/* NOTIFICATIONS BELL */}
                <div className="relative">
                    <button 
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`text-slate-500 hover:text-orange-600 p-2 hover:bg-white rounded-full transition-all shadow-sm ${notifOpen ? 'bg-white text-orange-600 shadow-md ring-2 ring-orange-100' : ''}`} 
                        title="Notificações"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-[55]" onClick={() => setNotifOpen(false)}></div>
                            <NotificationsPanel 
                                notifications={notifications}
                                onMarkAsRead={onMarkNotificationAsRead}
                                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                                onSelectCase={handleSelectNotification}
                                onClose={() => setNotifOpen(false)}
                            />
                        </>
                    )}
                </div>

                <button onClick={onOpenLogs} className="text-slate-500 hover:text-blue-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Auditoria & Logs"><FileText size={20} /></button>
                <button onClick={onOpenCalendar} className="text-slate-500 hover:text-blue-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Calendário"><Calendar size={20} /></button>
                <button onClick={onOpenDashboard} className="text-slate-500 hover:text-blue-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Dashboard"><BarChart2 size={20} /></button>
                <button onClick={onOpenSettings} className="text-slate-500 hover:text-blue-600 p-2 hover:bg-white rounded-full transition-all shadow-sm" title="Configurações"><Settings size={20} /></button>
             </div>
             
             <button onClick={() => exportToCSV(allCases)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block" title="Exportar Backup"><Download size={20} /></button>
             
             <button onClick={onNewCase} className={`ml-2 h-10 px-5 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 font-bold text-sm text-white ${activeTheme.button}`}>
                <Plus size={18} /> <span className="hidden md:inline">Novo Caso</span>
             </button>

             {/* USER PROFILE */}
             <div className="ml-4 pl-4 border-l border-slate-200 flex items-center gap-3">
                <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border-2 border-white"
                    style={{ backgroundColor: currentUser.color || '#64748b' }}
                >
                    {currentUser.avatarInitials}
                </div>
                <div className="hidden lg:block">
                    <p className="text-xs font-bold text-slate-700 leading-none">{currentUser.name}</p>
                    <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-1 mt-1">
                        SAIR <LogOut size={10} />
                    </button>
                </div>
             </div>
          </div>
        </div>
        
        {/* Bottom Row: Filters (Integrated) */}
        <div className="px-6 py-3 bg-white/50 border-t border-slate-100 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <Filter size={12} /> Filtros Ativos
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                <Search className="text-slate-400" size={16} />
                <input type="text" placeholder="Buscar cliente ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent text-sm text-slate-700 w-40 focus:w-64 transition-all outline-none placeholder-slate-400 border-none p-0 focus:ring-0"/>
            </div>

            <select value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)} className="bg-white text-sm py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 focus:border-blue-500 outline-none hover:bg-slate-50 cursor-pointer shadow-sm">
                <option value="">Responsável (Todos)</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="bg-white text-sm py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 focus:border-blue-500 outline-none hover:bg-slate-50 cursor-pointer shadow-sm">
                <option value="">Prioridade (Todas)</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
            </select>

            {(searchTerm || responsibleFilter || urgencyFilter) && (
                <button onClick={() => {setSearchTerm(''); setResponsibleFilter(''); setUrgencyFilter('')}} className="ml-auto text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors font-bold">
                    <X size={12}/> Limpar
                </button>
            )}
        </div>
      </header>
  );
}
