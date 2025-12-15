
import React, { useState, useMemo } from 'react';
import { X, Users, Database, Building, Sliders, Tag, CheckCircle, AlertTriangle, MapPin, MessageCircle, Workflow, UserCircle, Lock, Settings, FileText, Save, LogOut } from 'lucide-react';
import { Case, User, SystemLog, OfficeData, SystemSettings, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule, DocumentTemplate } from '../types';
import { TagManager } from './settings/TagManager';
import { OfficeSettings } from './settings/OfficeSettings';
import { TeamSettings } from './settings/TeamSettings';
import { AutomationSettings } from './settings/AutomationSettings';
import { BackupSettings } from './settings/BackupSettings';
import { AgencySettings } from './settings/AgencySettings';
import { WhatsAppSettings } from './settings/WhatsAppSettings';
import { WorkflowSettings } from './settings/WorkflowSettings';
import { UserProfileSettings } from './settings/UserProfileSettings';
import { TemplateManager } from './settings/TemplateManager';
import { ConfirmationModal } from './ConfirmationModal';
import { hasPermission } from '../utils';
import { db } from '../services/database';

interface SettingsModalProps {
  onClose: () => void;
  allCases: Case[];
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: User;
  onImportData: (data: Case[]) => void;
  officeData: OfficeData;
  setOfficeData: (data: OfficeData) => void;
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
  systemSettings: SystemSettings;
  setSystemSettings: (s: SystemSettings) => void;
  systemTags?: SystemTag[];
  setSystemTags?: (t: SystemTag[]) => void;
  commonDocs?: string[];
  setCommonDocs?: (docs: string[]) => void;
  agencies?: INSSAgency[];
  setAgencies?: (list: INSSAgency[]) => void;
  whatsAppTemplates?: WhatsAppTemplate[];
  setWhatsAppTemplates?: (list: WhatsAppTemplate[]) => void;
  workflowRules?: WorkflowRule[];
  setWorkflowRules?: (r: WorkflowRule[]) => void;
  documentTemplates?: DocumentTemplate[];
  setDocumentTemplates?: (t: DocumentTemplate[]) => void;
  isEmbedded?: boolean; 
}

// NavItem extracted to prevent re-creation on render
const NavItem = ({ id, label, icon: Icon, isActive, onClick }: { id: string, label: string, icon: any, isActive: boolean, onClick: () => void }) => (
    <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
        type="button"
        className={`
            w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 mb-1 cursor-pointer select-none relative
            ${isActive 
                ? 'bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-200 z-10' 
                : 'text-slate-600 hover:bg-slate-100 font-medium hover:z-10'
            }
        `}
    >
        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
        <span>{label}</span>
        {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"></div>}
    </button>
);

const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 mt-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none flex items-center gap-2">
        {label}
        <div className="h-px bg-slate-100 flex-1"></div>
    </div>
);

type SettingsTab = 'PROFILE' | 'OFFICE' | 'TEAM' | 'BACKUP' | 'AUTOMATION' | 'TAGS' | 'AGENCIES' | 'WHATSAPP' | 'WORKFLOW' | 'TEMPLATES';

const TAB_INFO: Record<string, { title: string, desc: string, icon: any }> = {
    PROFILE: { title: 'Meu Perfil', desc: 'Gerencie seus dados de acesso e preferências.', icon: UserCircle },
    OFFICE: { title: 'Dados do Escritório', desc: 'Informações institucionais para documentos.', icon: Building },
    TEAM: { title: 'Equipe e Acessos', desc: 'Gerencie usuários e permissões do sistema.', icon: Users },
    AGENCIES: { title: 'Locais de Atendimento', desc: 'Agências INSS, Varas e Clínicas.', icon: MapPin },
    WORKFLOW: { title: 'Robôs e Automação', desc: 'Configure regras de movimento automático.', icon: Workflow },
    AUTOMATION: { title: 'Prazos e SLA', desc: 'Defina limites de tempo para alertas.', icon: Sliders },
    TAGS: { title: 'Etiquetas', desc: 'Categorização visual e filtros.', icon: Tag },
    WHATSAPP: { title: 'Modelos de Mensagem', desc: 'Templates para WhatsApp.', icon: MessageCircle },
    TEMPLATES: { title: 'Modelos de Documentos', desc: 'Procurações, Contratos e Declarações.', icon: FileText },
    BACKUP: { title: 'Segurança e Dados', desc: 'Exportação e restauração de backup.', icon: Database }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, allCases, users, setUsers, currentUser, onImportData, officeData, setOfficeData,
    addSystemLog, systemSettings, setSystemSettings,
    systemTags = [], setSystemTags = (_: SystemTag[]) => {},
    commonDocs = [], setCommonDocs = (_: string[]) => {},
    agencies = [], setAgencies = (_: INSSAgency[]) => {},
    whatsAppTemplates = [], setWhatsAppTemplates = (_: WhatsAppTemplate[]) => {},
    workflowRules = [], setWorkflowRules = (_: WorkflowRule[]) => {},
    documentTemplates = [], setDocumentTemplates = (_: DocumentTemplate[]) => {},
    isEmbedded = false
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Forms State - Initialized ONCE from props to prevent reset loops
  const [officeForm, setOfficeForm] = useState<OfficeData>(officeData);
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(systemSettings);
  const [profileForm, setProfileForm] = useState<User | null>(currentUser || null);

  // Dirty Check Logic
  const isDirty = useMemo(() => {
      if (activeTab === 'OFFICE') return JSON.stringify(officeForm) !== JSON.stringify(officeData);
      if (activeTab === 'AUTOMATION') return JSON.stringify(settingsForm) !== JSON.stringify(systemSettings);
      if (activeTab === 'PROFILE' && profileForm && currentUser) {
          const relevantProfile = { name: profileForm.name, email: profileForm.email, themePref: profileForm.themePref, color: profileForm.color, avatarIcon: profileForm.avatarIcon, vacation: profileForm.vacation };
          const relevantCurrent = { name: currentUser.name, email: currentUser.email, themePref: currentUser.themePref, color: currentUser.color, avatarIcon: currentUser.avatarIcon, vacation: currentUser.vacation };
          const passwordChanged = !!profileForm.password && profileForm.password !== currentUser.password;
          return passwordChanged || JSON.stringify(relevantProfile) !== JSON.stringify(relevantCurrent);
      }
      return false;
  }, [activeTab, officeForm, officeData, settingsForm, systemSettings, profileForm, currentUser]);

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabChange = (newTab: SettingsTab) => {
      setActiveTab(newTab);
  };

  const handleSave = async () => {
      if (!isDirty) return;
      setIsSaving(true);
      try {
          if (activeTab === 'OFFICE') {
              if (!officeForm.name.trim()) throw new Error('Nome do escritório obrigatório');
              setOfficeData(officeForm);
              await db.saveOfficeData(officeForm);
              if (addSystemLog && currentUser) addSystemLog('Configuração', 'Dados do escritório atualizados.', currentUser.name, 'SYSTEM');
          } 
          else if (activeTab === 'AUTOMATION') {
              setSystemSettings(settingsForm);
              await db.saveSystemSettings(settingsForm);
              if (addSystemLog && currentUser) addSystemLog('Configuração', 'SLA e Automação atualizados.', currentUser.name, 'SYSTEM');
          }
          else if (activeTab === 'PROFILE' && profileForm && currentUser) {
              if (!profileForm.name.trim()) throw new Error('Nome obrigatório');
              
              const names = profileForm.name.trim().split(' ');
              let initials = names[0][0].toUpperCase();
              if (names.length > 1) initials += names[names.length - 1][0].toUpperCase();
              
              const updatedUser = { ...profileForm, avatarInitials: initials };
              if (!updatedUser.password) updatedUser.password = currentUser.password;
              
              const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
              setUsers(updatedUsersList);
              await db.saveUsers(updatedUsersList);
          }
          showToastMsg('Alterações salvas com sucesso!', 'success');
      } catch (err: any) {
          showToastMsg(err.message || 'Erro ao salvar.', 'error');
      } finally {
          setIsSaving(false);
      }
  };

  const isAdmin = hasPermission(currentUser, 'MANAGE_SETTINGS');
  const isFormTab = ['PROFILE', 'OFFICE', 'AUTOMATION'].includes(activeTab);

  const content = (
    <div className={`bg-white w-full h-full flex overflow-hidden relative shadow-2xl pointer-events-auto ${!isEmbedded ? 'max-w-[1200px] h-[90vh] rounded-2xl ring-1 ring-slate-900/10' : ''}`}>
        
        {/* TOAST */}
        {toast && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                <span className="font-bold text-sm">{toast.message}</span>
            </div>
        )}

        {/* SIDEBAR - HIGH Z-INDEX TO ENSURE CLICKS */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 z-30 relative">
            <div className="p-6">
                <div className="flex items-center gap-2 text-slate-800 mb-1">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                        <Settings size={20} className="text-slate-700" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold leading-none">Ajustes</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Sistema</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-6 custom-scrollbar">
                <SectionLabel label="Conta" />
                <NavItem id="PROFILE" label="Meu Perfil" icon={UserCircle} isActive={activeTab === 'PROFILE'} onClick={() => handleTabChange('PROFILE')} />

                {isAdmin && (
                    <>
                        <SectionLabel label="Gestão" />
                        <NavItem id="OFFICE" label="Escritório" icon={Building} isActive={activeTab === 'OFFICE'} onClick={() => handleTabChange('OFFICE')} />
                        <NavItem id="TEAM" label="Equipe" icon={Users} isActive={activeTab === 'TEAM'} onClick={() => handleTabChange('TEAM')} />
                        <NavItem id="AGENCIES" label="Locais" icon={MapPin} isActive={activeTab === 'AGENCIES'} onClick={() => handleTabChange('AGENCIES')} />

                        <SectionLabel label="Inteligência" />
                        <NavItem id="TEMPLATES" label="Modelos & Docs" icon={FileText} isActive={activeTab === 'TEMPLATES'} onClick={() => handleTabChange('TEMPLATES')} />
                        <NavItem id="WORKFLOW" label="Robôs" icon={Workflow} isActive={activeTab === 'WORKFLOW'} onClick={() => handleTabChange('WORKFLOW')} />
                        <NavItem id="AUTOMATION" label="Prazos & SLA" icon={Sliders} isActive={activeTab === 'AUTOMATION'} onClick={() => handleTabChange('AUTOMATION')} />
                        <NavItem id="TAGS" label="Etiquetas" icon={Tag} isActive={activeTab === 'TAGS'} onClick={() => handleTabChange('TAGS')} />
                        <NavItem id="WHATSAPP" label="WhatsApp" icon={MessageCircle} isActive={activeTab === 'WHATSAPP'} onClick={() => handleTabChange('WHATSAPP')} />

                        <SectionLabel label="Sistema" />
                        <NavItem id="BACKUP" label="Dados" icon={Database} isActive={activeTab === 'BACKUP'} onClick={() => handleTabChange('BACKUP')} />
                    </>
                )}
            </div>
            
            {!isEmbedded && (
                <div className="p-4 border-t border-slate-200 mt-auto">
                    <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-xs font-bold transition-colors w-full px-2 py-2 rounded hover:bg-red-50 cursor-pointer">
                        <LogOut size={14}/> Sair das Configurações
                    </button>
                </div>
            )}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col bg-white relative min-w-0 z-10">
            
            {/* HEADER */}
            <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {React.createElement(TAB_INFO[activeTab].icon, { size: 22, className: "text-slate-400" })}
                        {TAB_INFO[activeTab].title}
                    </h1>
                    <p className="text-sm text-slate-500">{TAB_INFO[activeTab].desc}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {isFormTab && (
                        <button 
                            onClick={handleSave} 
                            disabled={!isDirty || isSaving}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all cursor-pointer
                                ${isDirty 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }
                            `}
                        >
                            <Save size={18} />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    )}

                    {!isEmbedded && (
                        <>
                            <div className="h-8 w-px bg-slate-200 mx-1"></div>
                            <button 
                                onClick={onClose} 
                                className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                                title="Fechar (Esc)"
                            >
                                <X size={24} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                <div className="max-w-4xl mx-auto pb-20">
                    
                    {!isAdmin && activeTab !== 'PROFILE' ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-200">
                                <Lock size={48} className="text-slate-300"/>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Acesso Restrito</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Apenas administradores podem alterar estas configurações.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === 'PROFILE' && currentUser && (
                                <UserProfileSettings 
                                    currentUser={profileForm || currentUser} 
                                    setProfileForm={setProfileForm}
                                />
                            )}
                            
                            {isAdmin && (
                                <>
                                    {activeTab === 'OFFICE' && (
                                        <OfficeSettings officeData={officeForm} setOfficeData={setOfficeForm} showToast={showToastMsg} />
                                    )}
                                    
                                    {activeTab === 'AUTOMATION' && (
                                        <AutomationSettings settings={settingsForm} setSettings={setSettingsForm} />
                                    )}

                                    {/* Componentes Autônomos */}
                                    {activeTab === 'TEAM' && <TeamSettings users={users} setUsers={setUsers} currentUser={currentUser} addSystemLog={addSystemLog} showToast={showToastMsg} />}
                                    
                                    {activeTab === 'AGENCIES' && <AgencySettings agencies={agencies} setAgencies={setAgencies} showToast={showToastMsg} />}
                                    
                                    {activeTab === 'WORKFLOW' && <WorkflowSettings rules={workflowRules} setRules={setWorkflowRules} users={users} tags={systemTags} showToast={showToastMsg} />}
                                    
                                    {activeTab === 'TAGS' && <TagManager tags={systemTags} setTags={setSystemTags} showToast={showToastMsg} />}
                                    
                                    {activeTab === 'WHATSAPP' && <WhatsAppSettings templates={whatsAppTemplates} setTemplates={setWhatsAppTemplates} currentUser={currentUser} addSystemLog={addSystemLog} showToast={showToastMsg} />}
                                    
                                    {activeTab === 'TEMPLATES' && (
                                        <TemplateManager 
                                            templates={documentTemplates} 
                                            setTemplates={setDocumentTemplates} 
                                            currentUser={currentUser} 
                                            addSystemLog={addSystemLog} 
                                            showToast={showToastMsg}
                                            officeData={officeData}
                                            commonDocs={commonDocs}
                                            setCommonDocs={setCommonDocs}
                                        />
                                    )}

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
                                            showToast={showToastMsg}
                                            onClose={onClose}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );

  if (isEmbedded) return content;

  return (
    // MAX Z-INDEX FORCED TO ENSURE CLICKABILITY
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {content}
      {showExitConfirm && (
          <ConfirmationModal 
              title="Alterações não salvas"
              description="Você tem modificações pendentes neste formulário. Se sair agora, elas serão perdidas."
              confirmLabel="Sair sem Salvar"
              cancelLabel="Continuar Editando"
              onConfirm={onClose}
              onCancel={() => setShowExitConfirm(false)}
              isDangerous={true}
          />
      )}
    </div>
  );
};
