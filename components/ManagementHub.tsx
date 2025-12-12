
import React, { useState, Suspense, useEffect } from 'react';
import { X, BarChart2, Calendar, CheckSquare, Users, FileText, Settings, LayoutGrid } from 'lucide-react';
import { Case, User, DocumentTemplate, SystemLog, OfficeData, SystemSettings, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule } from '../types';

// Using React.lazy for sub-components to keep the bundle light
const Dashboard = React.lazy(() => import('./Dashboard').then(module => ({ default: module.Dashboard })));
const CalendarModal = React.lazy(() => import('./CalendarModal').then(module => ({ default: module.CalendarModal })));
const TaskCenterModal = React.lazy(() => import('./TaskCenterModal').then(module => ({ default: module.TaskCenterModal })));
const ClientsModal = React.lazy(() => import('./ClientsModal').then(module => ({ default: module.ClientsModal })));
const GlobalLogsModal = React.lazy(() => import('./GlobalLogsModal').then(module => ({ default: module.GlobalLogsModal })));
const SettingsModal = React.lazy(() => import('./SettingsModal').then(module => ({ default: module.SettingsModal })));

type HubTab = 'DASHBOARD' | 'CALENDAR' | 'TASKS' | 'CLIENTS' | 'LOGS' | 'SETTINGS';

interface ManagementHubProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HubTab;
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
  // Template Props
  documentTemplates?: DocumentTemplate[];
  setDocumentTemplates?: (t: DocumentTemplate[]) => void;
  // Logging
  systemLogs: SystemLog[];
  addSystemLog: (action: string, details: string, user: string, category: SystemLog['category']) => void;
  // Settings
  systemSettings: SystemSettings;
  setSystemSettings: (s: SystemSettings) => void;
  // Tags
  systemTags?: SystemTag[];
  setSystemTags?: (t: SystemTag[]) => void;
  // Common Docs
  commonDocs?: string[];
  setCommonDocs?: (docs: string[]) => void;
  // Agencies
  agencies?: INSSAgency[];
  setAgencies?: (list: INSSAgency[]) => void;
  // WhatsApp
  whatsAppTemplates?: WhatsAppTemplate[];
  setWhatsAppTemplates?: (list: WhatsAppTemplate[]) => void;
  // Workflow
  workflowRules?: WorkflowRule[];
  setWorkflowRules?: (r: WorkflowRule[]) => void;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({
  isOpen, onClose, initialTab = 'DASHBOARD',
  cases, users, currentUser, setUsers,
  officeData, setOfficeData, onImportData,
  onSelectCase, onToggleTask, onNewCase, onUpdateClient,
  documentTemplates, setDocumentTemplates,
  systemLogs, addSystemLog, systemSettings, setSystemSettings,
  systemTags, setSystemTags,
  commonDocs, setCommonDocs,
  agencies, setAgencies,
  whatsAppTemplates, setWhatsAppTemplates,
  workflowRules, setWorkflowRules
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);

  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const MENU_ITEMS: { id: HubTab; label: string; icon: any }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: BarChart2 },
    { id: 'CALENDAR', label: 'Calendário', icon: Calendar },
    { id: 'TASKS', label: 'Tarefas', icon: CheckSquare },
    { id: 'CLIENTS', label: 'Clientes', icon: Users },
    { id: 'LOGS', label: 'Auditoria', icon: FileText },
    { id: 'SETTINGS', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <Dashboard cases={cases} users={users} onClose={onClose} />;
      case 'CALENDAR':
        return <CalendarModal cases={cases} onClose={onClose} />;
      case 'TASKS':
        return <TaskCenterModal cases={cases} users={users} currentUser={currentUser} onClose={onClose} onSelectCase={onSelectCase} onToggleTask={onToggleTask} />;
      case 'CLIENTS':
        return <ClientsModal cases={cases} onClose={onClose} onSelectCase={onSelectCase} onNewCase={onNewCase} onUpdateClient={onUpdateClient} />;
      case 'LOGS':
        return <GlobalLogsModal cases={cases} users={users} systemLogs={systemLogs} onClose={onClose} onSelectCase={onSelectCase} />;
      case 'SETTINGS':
        return <SettingsModal 
            onClose={onClose} 
            allCases={cases} 
            users={users} 
            setUsers={setUsers} 
            currentUser={currentUser}
            onImportData={onImportData} 
            officeData={officeData}
            setOfficeData={setOfficeData}
            documentTemplates={documentTemplates}
            setDocumentTemplates={setDocumentTemplates}
            addSystemLog={addSystemLog}
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
            systemTags={systemTags}
            setSystemTags={setSystemTags}
            commonDocs={commonDocs}
            setCommonDocs={setCommonDocs}
            agencies={agencies}
            setAgencies={setAgencies}
            whatsAppTemplates={whatsAppTemplates}
            setWhatsAppTemplates={setWhatsAppTemplates}
            workflowRules={workflowRules}
            setWorkflowRules={setWorkflowRules}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex overflow-hidden ring-1 ring-slate-900/10">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 hidden md:flex">
            <div className="p-6 border-b border-slate-200/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <LayoutGrid className="text-blue-600" />
                    Gestão
                </h2>
                <p className="text-xs text-slate-400 mt-1">Ferramentas Administrativas</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === item.id 
                            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    >
                        <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button 
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                    <X size={18} /> Fechar Central
                </button>
            </div>
        </div>

        {/* MOBILE NAVIGATION TAB BAR */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20">
             {MENU_ITEMS.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center p-2 rounded-lg ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <item.icon size={20} />
                    <span className="text-[10px] font-bold mt-1">{item.label.substring(0,3)}</span>
                </button>
             ))}
             <button onClick={onClose} className="flex flex-col items-center p-2 text-slate-400"><X size={20}/><span className="text-[10px] mt-1">Sair</span></button>
        </div>

        {/* CONTENT AREA */}
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
