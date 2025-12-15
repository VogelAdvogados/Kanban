
import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { X, BarChart2, Calendar, CheckSquare, Users, FileText, Bug, LayoutGrid } from 'lucide-react';
import { Case, User, SystemLog, OfficeData } from '../types';
import { hasPermission } from '../utils'; 

// Components
const Dashboard = React.lazy(() => import('./Dashboard').then(module => ({ default: module.Dashboard })));
const CalendarModal = React.lazy(() => import('./CalendarModal').then(module => ({ default: module.CalendarModal })));
const TaskCenterModal = React.lazy(() => import('./TaskCenterModal').then(module => ({ default: module.TaskCenterModal })));
const ClientsModal = React.lazy(() => import('./ClientsModal').then(module => ({ default: module.ClientsModal })));
const GlobalLogsModal = React.lazy(() => import('./GlobalLogsModal').then(module => ({ default: module.GlobalLogsModal })));
const ErrorCenter = React.lazy(() => import('./ErrorCenter').then(module => ({ default: module.ErrorCenter })));

type HubTab = 'DASHBOARD' | 'CALENDAR' | 'TASKS' | 'CLIENTS' | 'LOGS' | 'ERRORS';

interface ManagementHubProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  cases: Case[];
  users: User[];
  currentUser: User;
  setUsers: (u: User[]) => void;
  officeData: OfficeData;
  setOfficeData: (data: OfficeData) => void;
  onImportData: (d: Case[]) => void;
  onSelectCase: (c: Case) => void;
  onToggleTask: (cid: string, tid: string) => void;
  onNewCase: () => void;
  onUpdateClient: (cpf: string, data: Partial<Case>) => void;
  systemLogs: SystemLog[];
  updateCase?: (updatedCase: Case, logMessage?: string, userName?: string) => Promise<boolean>;
  onNewAppointment: (date: Date) => void;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({
  isOpen, onClose, initialTab = 'DASHBOARD',
  cases, users, currentUser,
  onSelectCase, onToggleTask, onNewCase, onUpdateClient,
  systemLogs,
  updateCase,
  onNewAppointment
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('DASHBOARD');

  useEffect(() => {
      const validTabs: string[] = ['DASHBOARD', 'CALENDAR', 'TASKS', 'CLIENTS', 'LOGS', 'ERRORS'];
      if (initialTab && validTabs.includes(initialTab)) {
          setActiveTab(initialTab as HubTab);
      } else {
          setActiveTab('DASHBOARD');
      }
  }, [initialTab]);

  if (!isOpen) return null;

  const menuItems = useMemo(() => {
      const items: { id: HubTab; label: string; icon: any; className?: string }[] = [
        { id: 'DASHBOARD', label: 'Dashboard', icon: BarChart2 },
        { id: 'CALENDAR', label: 'Calendário', icon: Calendar },
        { id: 'TASKS', label: 'Tarefas', icon: CheckSquare },
        { id: 'CLIENTS', label: 'Clientes', icon: Users },
      ];

      if (hasPermission(currentUser, 'VIEW_LOGS')) {
          items.push({ id: 'LOGS', label: 'Auditoria', icon: FileText });
      }

      if (currentUser.role === 'ADMIN') {
          items.push({ id: 'ERRORS', label: 'Central de Erros', icon: Bug, className: 'text-red-500' });
      }

      return items;
  }, [currentUser]);

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <Dashboard cases={cases} users={users} onClose={onClose} onSelectCase={onSelectCase} />;
      case 'CALENDAR':
        return <CalendarModal cases={cases} onClose={onClose} onSelectCase={onSelectCase} onNewAppointment={onNewAppointment} />;
      case 'TASKS':
        return <TaskCenterModal cases={cases} users={users} currentUser={currentUser} onClose={onClose} onSelectCase={onSelectCase} onToggleTask={onToggleTask} />;
      case 'CLIENTS':
        return <ClientsModal cases={cases} onClose={onClose} onSelectCase={onSelectCase} onNewCase={onNewCase} onUpdateClient={onUpdateClient} currentUser={currentUser} updateCase={updateCase} />;
      case 'LOGS':
        return hasPermission(currentUser, 'VIEW_LOGS') ? <GlobalLogsModal cases={cases} users={users} systemLogs={systemLogs} onClose={onClose} onSelectCase={onSelectCase} /> : null;
      case 'ERRORS':
        return currentUser.role === 'ADMIN' ? <ErrorCenter onClose={onClose} users={users} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex overflow-hidden ring-1 ring-slate-900/10 relative pointer-events-auto">
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 hidden md:flex">
            <div className="p-6 border-b border-slate-200/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <LayoutGrid className="text-blue-600" />
                    Gestão
                </h2>
                <p className="text-xs text-slate-400 mt-1">Ferramentas Administrativas</p>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'} ${item.className || ''}`}
                    >
                        <item.icon size={18} className={activeTab === item.id ? (item.className?.includes('text-red') ? 'text-red-500' : 'text-blue-600') : 'text-slate-400'} />
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200">
                <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                    <X size={18} /> Fechar Central
                </button>
            </div>
        </div>
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 overflow-x-auto">
             {menuItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} ${item.className || ''}`}>
                    <item.icon size={20} />
                    <span className="text-[10px] font-bold mt-1 truncate w-full text-center">{item.label.split(' ')[0]}</span>
                </button>
             ))}
             <button onClick={onClose} className="flex flex-col items-center p-2 text-slate-400 min-w-[60px]"><X size={20}/><span className="text-[10px] mt-1">Sair</span></button>
        </div>
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col mb-16 md:mb-0">
             <Suspense fallback={<div className="p-10 text-center text-slate-400">Carregando ferramenta...</div>}>
                <div className="w-full h-full relative flex flex-col">
                    {renderContent()}
                </div>
             </Suspense>
        </div>
      </div>
    </div>
  );
};
