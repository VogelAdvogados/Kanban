
import React, { useState, useEffect } from 'react';
import { X, Users, Database, Building, FileText, Sliders, Tag, CheckCircle, AlertTriangle, Shield, MapPin, MessageCircle, Workflow, UserCircle } from 'lucide-react';
import { Case, User, DocumentTemplate, SystemLog, OfficeData, SystemSettings, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule } from '../types';
import { TemplateManager } from './settings/TemplateManager';
import { TagManager } from './settings/TagManager';
import { OfficeSettings } from './settings/OfficeSettings';
import { TeamSettings } from './settings/TeamSettings';
import { AutomationSettings } from './settings/AutomationSettings';
import { BackupSettings } from './settings/BackupSettings';
import { AgencySettings } from './settings/AgencySettings';
import { WhatsAppSettings } from './settings/WhatsAppSettings';
import { WorkflowSettings } from './settings/WorkflowSettings';
import { UserProfileSettings } from './settings/UserProfileSettings';

interface SettingsModalProps {
  onClose: () => void;
  allCases: Case[];
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: User; // Logged user for audit
  onImportData: (data: Case[]) => void;
  officeData: OfficeData;
  setOfficeData: (data: OfficeData) => void;
  // Templates Props
  documentTemplates?: DocumentTemplate[];
  setDocumentTemplates?: (t: DocumentTemplate[]) => void;
  // Logging
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
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

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, allCases, users, setUsers, currentUser, onImportData, officeData, setOfficeData,
    documentTemplates = [], setDocumentTemplates = (_: DocumentTemplate[]) => {},
    addSystemLog, systemSettings, setSystemSettings,
    systemTags = [], setSystemTags = (_: SystemTag[]) => {},
    commonDocs = [], setCommonDocs = (_: string[]) => {},
    agencies = [], setAgencies = (_: INSSAgency[]) => {},
    whatsAppTemplates = [], setWhatsAppTemplates = (_: WhatsAppTemplate[]) => {},
    workflowRules = [], setWorkflowRules = (_: WorkflowRule[]) => {}
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'OFFICE' | 'TEAM' | 'BACKUP' | 'DOCUMENTS' | 'AUTOMATION' | 'TAGS' | 'AGENCIES' | 'WHATSAPP' | 'WORKFLOW'>('PROFILE');
  
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Office Data Form State
  const [officeForm, setOfficeForm] = useState<OfficeData>(officeData);
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(systemSettings);

  // Sync internal form when prop updates
  useEffect(() => {
    setOfficeForm(officeData);
    setSettingsForm(systemSettings);
  }, [officeData, systemSettings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // --- HANDLERS ---

  const handleSaveOfficeData = () => {
    if (!officeForm.name.trim()) {
        showToast('O nome do escritório é obrigatório.', 'error');
        return;
    }
    setOfficeData(officeForm);
    if (addSystemLog && currentUser) {
        addSystemLog('Configuração do Escritório', 'Dados do escritório atualizados.', currentUser.name, 'SYSTEM');
    }
    showToast('Dados do escritório atualizados!', 'success');
  };

  const handleSaveSettings = () => {
      setSystemSettings(settingsForm);
      if (addSystemLog && currentUser) {
          addSystemLog('Atualização de SLA', 'Parâmetros de automação atualizados.', currentUser.name, 'SYSTEM');
      }
      showToast('Configurações de automação salvas!', 'success');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* TOAST NOTIFICATION */}
        {toast && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border ${toast.type === 'error' ? 'bg-red-600 border-red-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
                {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                <span className="font-bold text-sm">{toast.message}</span>
            </div>
        )}

        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-slate-500" /> Configurações do Sistema
            </h2>
            <button onClick={() => onClose()} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-60 bg-slate-50 border-r border-slate-200 p-3 space-y-1 hidden md:block flex-shrink-0">
                <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'PROFILE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <UserCircle size={18}/> MEU PERFIL
                </button>
                
                <div className="h-px bg-slate-200 my-2 mx-2"></div>
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase mb-1">Geral</p>

                <button 
                    onClick={() => setActiveTab('OFFICE')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'OFFICE' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Building size={18}/> Dados do Escritório
                </button>
                <button 
                    onClick={() => setActiveTab('WORKFLOW')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'WORKFLOW' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Workflow size={18}/> Workflow (Automação)
                </button>
                <button 
                    onClick={() => setActiveTab('AGENCIES')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'AGENCIES' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <MapPin size={18}/> Locais & Agências
                </button>
                <button 
                    onClick={() => setActiveTab('WHATSAPP')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'WHATSAPP' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <MessageCircle size={18}/> Modelos WhatsApp
                </button>
                <button 
                    onClick={() => setActiveTab('AUTOMATION')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'AUTOMATION' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Sliders size={18}/> Prazos & SLA
                </button>
                <button 
                    onClick={() => setActiveTab('TAGS')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'TAGS' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Tag size={18}/> Etiquetas & IA
                </button>
                <button 
                    onClick={() => setActiveTab('TEAM')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'TEAM' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Users size={18}/> Gestão de Equipe
                </button>
                <button 
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'DOCUMENTS' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <FileText size={18}/> Documentos & Modelos
                </button>
                <button 
                    onClick={() => setActiveTab('BACKUP')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'BACKUP' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Database size={18}/> Dados & Backup
                </button>
            </div>

            {/* MOBILE TAB BAR */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-10 overflow-x-auto">
                 <button onClick={() => setActiveTab('PROFILE')} className={`p-2 ${activeTab === 'PROFILE' ? 'text-blue-600' : 'text-slate-400'}`}><UserCircle size={20}/></button>
                 <button onClick={() => setActiveTab('OFFICE')} className={`p-2 ${activeTab === 'OFFICE' ? 'text-blue-600' : 'text-slate-400'}`}><Building size={20}/></button>
                 <button onClick={() => setActiveTab('WORKFLOW')} className={`p-2 ${activeTab === 'WORKFLOW' ? 'text-indigo-600' : 'text-slate-400'}`}><Workflow size={20}/></button>
                 <button onClick={() => setActiveTab('WHATSAPP')} className={`p-2 ${activeTab === 'WHATSAPP' ? 'text-blue-600' : 'text-slate-400'}`}><MessageCircle size={20}/></button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto bg-white mb-10 md:mb-0">
                
                {/* TAB: USER PROFILE */}
                {activeTab === 'PROFILE' && currentUser && (
                    <UserProfileSettings 
                        currentUser={currentUser}
                        users={users}
                        setUsers={setUsers}
                        showToast={showToast}
                    />
                )}

                {/* TAB: OFFICE DATA */}
                {activeTab === 'OFFICE' && (
                    <OfficeSettings 
                        officeData={officeForm} 
                        setOfficeData={setOfficeForm} 
                        onSave={handleSaveOfficeData} 
                        showToast={showToast} 
                    />
                )}

                {/* TAB: WORKFLOW */}
                {activeTab === 'WORKFLOW' && (
                    <WorkflowSettings 
                        rules={workflowRules}
                        setRules={setWorkflowRules}
                        users={users}
                        tags={systemTags}
                        showToast={showToast}
                    />
                )}

                {/* TAB: AGENCIES */}
                {activeTab === 'AGENCIES' && (
                    <AgencySettings 
                        agencies={agencies}
                        setAgencies={setAgencies}
                        showToast={showToast}
                    />
                )}

                {/* TAB: WHATSAPP */}
                {activeTab === 'WHATSAPP' && (
                    <WhatsAppSettings 
                        templates={whatsAppTemplates}
                        setTemplates={setWhatsAppTemplates}
                        currentUser={currentUser}
                        addSystemLog={addSystemLog}
                        showToast={showToast}
                    />
                )}

                {/* TAB: AUTOMATION & SLA */}
                {activeTab === 'AUTOMATION' && (
                    <AutomationSettings 
                        settings={settingsForm} 
                        setSettings={setSettingsForm} 
                        onSave={handleSaveSettings} 
                    />
                )}

                {/* TAB: TAGS & AI */}
                {activeTab === 'TAGS' && (
                    <TagManager tags={systemTags} setTags={setSystemTags} showToast={showToast} />
                )}

                {/* TAB: TEAM */}
                {activeTab === 'TEAM' && (
                    <TeamSettings 
                        users={users} 
                        setUsers={setUsers} 
                        currentUser={currentUser} 
                        addSystemLog={addSystemLog} 
                        showToast={showToast} 
                    />
                )}

                {/* TAB: DOCUMENTS (TEMPLATES) */}
                {activeTab === 'DOCUMENTS' && (
                    <TemplateManager 
                        templates={documentTemplates} 
                        setTemplates={setDocumentTemplates} 
                        currentUser={currentUser}
                        addSystemLog={addSystemLog}
                        showToast={showToast}
                        officeData={officeData}
                        commonDocs={commonDocs}
                        setCommonDocs={setCommonDocs}
                    />
                )}

                {/* TAB: BACKUP */}
                {activeTab === 'BACKUP' && (
                    <BackupSettings 
                        allCases={allCases}
                        users={users}
                        documentTemplates={documentTemplates}
                        systemTags={systemTags}
                        officeData={officeData}
                        systemSettings={systemSettings}
                        onImportData={onImportData}
                        setUsers={setUsers}
                        setDocumentTemplates={setDocumentTemplates}
                        setSystemTags={setSystemTags}
                        setOfficeData={setOfficeData}
                        setSystemSettings={setSystemSettings}
                        currentUser={currentUser}
                        addSystemLog={addSystemLog}
                        showToast={showToast}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
