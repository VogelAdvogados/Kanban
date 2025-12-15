
import React, { useState, useMemo } from 'react';
import { X, Users, Database, Building, Sliders, Tag, CheckCircle, AlertTriangle, MapPin, MessageCircle, Workflow, UserCircle, Lock, Settings, Save, LogOut, FileText } from 'lucide-react';
import { Case, User, SystemLog, OfficeData, SystemSettings, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule, DocumentTemplate } from '../../types';
import { TagManager } from './TagManager';
import { OfficeSettings } from './OfficeSettings';
import { TeamSettings } from './TeamSettings';
import { AutomationSettings } from './AutomationSettings';
import { BackupSettings } from './BackupSettings';
import { AgencySettings } from './AgencySettings';
import { WhatsAppSettings } from './WhatsAppSettings';
import { WorkflowSettings } from './WorkflowSettings';
import { UserProfileSettings } from './UserProfileSettings';
import { TemplateManager } from './TemplateManager';
import { ConfirmationModal } from '../ConfirmationModal';
import { hasPermission, safeStringify } from '../../utils';
import { db } from '../../services/database';

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
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'OFFICE' | 'TEAM' | 'BACKUP' | 'AUTOMATION' | 'TAGS' | 'AGENCIES' | 'WHATSAPP' | 'WORKFLOW' | 'TEMPLATES'>('PROFILE');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Forms State
  const [officeForm, setOfficeForm] = useState<OfficeData>(() => ({...officeData}));
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(() => ({...systemSettings}));
  const [profileForm, setProfileForm] = useState<User | null>(() => currentUser ? {...currentUser} : null);

  const isDirty = useMemo(() => {
      // Use safeStringify to avoid potential circular reference crashes
      if (activeTab === 'OFFICE') return safeStringify(officeForm) !== safeStringify(officeData);
      if (activeTab === 'AUTOMATION') return safeStringify(settingsForm) !== safeStringify(systemSettings);
      if (activeTab === 'PROFILE' && profileForm && currentUser) {
          const relevantProfile = { name: profileForm.name, email: profileForm.email, themePref: profileForm.themePref, color: profileForm.color, avatarIcon: profileForm.avatarIcon, vacation: profileForm.vacation };
          const relevantCurrent = { name: currentUser.name, email: currentUser.email, themePref: currentUser.themePref, color: currentUser.color, avatarIcon: currentUser.avatarIcon, vacation: currentUser.vacation };
          const passwordChanged = !!profileForm.password && profileForm.password !== currentUser.password;
          return passwordChanged || safeStringify(relevantProfile) !== safeStringify(relevantCurrent);
      }
      return false;
  }, [activeTab, officeForm, officeData, settingsForm, systemSettings, profileForm, currentUser]);

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabChange = (newTab: typeof activeTab) => {
      if (activeTab === newTab) return;
      if (isDirty) {
          if (window.confirm('Você tem alterações não salvas. Se trocar de aba, elas serão perdidas. Continuar?')) {
              setOfficeForm({...officeData});
              setSettingsForm({...systemSettings});
              setProfileForm(currentUser ? {...currentUser} : null);
              setActiveTab(newTab);
          }
      } else {
          setActiveTab(newTab);
      }
  };

  const handleCloseAttempt = () => {
      if (isDirty) setShowExitConfirm(true);
      else onClose();
  };

  const handleSaveOfficeData = async () => {
    if (!officeForm.name.trim()) { showToastMsg('Nome do escritório obrigatório.', 'error'); return; }
    setOfficeData(officeForm);
    await db.saveOfficeData(officeForm);
    if (addSystemLog && currentUser) addSystemLog('Configuração', 'Dados do escritório atualizados.', currentUser.name, 'SYSTEM');
    showToastMsg('Dados salvos!', 'success');
  };

  const handleSaveSettings = async () => {
      setSystemSettings(settingsForm);
      await db.saveSystemSettings(settingsForm);
      if (addSystemLog && currentUser) addSystemLog('Configuração', 'SLA e Automação atualizados.', currentUser.name, 'SYSTEM');
      showToastMsg('Configurações salvas!', 'success');
  };

  const handleSaveProfile = async () => {
      if (!profileForm || !currentUser) return;
      if (!profileForm.name.trim()) { showToastMsg('Nome obrigatório', 'error'); return; }
      
      const names = profileForm.name.trim().split(' ');
      let initials = names[0][0].toUpperCase();
      if (names.length > 1) initials += names[names.length - 1][0].toUpperCase();
      
      const updatedUser = { ...profileForm, avatarInitials: initials };
      if (!updatedUser.password) updatedUser.password = currentUser.password; 

      const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsersList);
      await db.saveUsers(updatedUsersList);
      showToastMsg('Perfil atualizado!', 'success');
  };

  const isAdmin = hasPermission(currentUser, 'MANAGE_SETTINGS');
  const isFormTab = ['PROFILE', 'OFFICE', 'AUTOMATION'].includes(activeTab);

  const NavItem = ({ id, label, icon: Icon, description }: { id: typeof activeTab, label: string, icon: any, description?: string }) => (
      <button 
          onClick={() => handleTabChange(id)}
          className={`
              w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden flex items-center gap-3
              ${activeTab === id 
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60 font-bold' 
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium'
              }
          `}
      >
          <div className={`flex-shrink-0 transition-colors ${activeTab === id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
              <Icon size={18} />
          </div>
          <div>
              <span className="block leading-none">{label}</span>
              {description && <span className={`text-[10px] mt-1 block leading-tight ${activeTab === id ? 'text-blue-600/70' : 'text-slate-400'}`}>{description}</span>}
          </div>
          {activeTab === id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-xl"></div>}
      </button>
  );

  const SectionLabel = ({ label }: { label: string }) => (
      <div className="px-4 mt-6 mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
          <div className="h-px bg-slate-200 flex-1"></div>
      </div>
  );

  const TAB_INFO: Record<string, { title: string, desc: string }> = {
      PROFILE: { title: 'Meu Perfil', desc: 'Gerencie suas informações pessoais e preferências.' },
      OFFICE: { title: 'Dados do Escritório', desc: 'Informações institucionais para documentos.' },
      TEAM: { title: 'Gestão de Equipe', desc: 'Adicione colaboradores e defina permissões.' },
      AGENCIES: { title: 'Locais & Agências', desc: 'Cadastre endereços de agências do INSS e Varas.' },
      WORKFLOW: { title: 'Robôs (Automação)', desc: 'Crie regras automáticas para mover cartões.' },
      AUTOMATION: { title: 'Prazos & SLA', desc: 'Defina os prazos limites para alertas.' },
      TAGS: { title: 'Etiquetas', desc: 'Organize seus processos com etiquetas coloridas.' },
      WHATSAPP: { title: 'Modelos de Mensagem', desc: 'Templates para WhatsApp.' },
      TEMPLATES: { title: 'Modelos de Documentos', desc: 'Procurações, Contratos e Declarações.' },
      BACKUP: { title: 'Segurança & Dados', desc: 'Exporte seus dados ou restaure backups.' }
  };

  const content = (
    <div className={`bg-white w-full h-full flex overflow-hidden relative shadow-2xl pointer-events-auto ${!isEmbedded ? 'max-w-[1200px] h-[90vh] rounded-2xl ring-1 ring-slate-900/10' : ''}`}>
        
        {toast && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border backdrop-blur-md ${toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-700' : 'bg-emerald-50/95 border-emerald-200 text-emerald-700'}`}>
                {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                <span className="font-bold text-sm">{toast.message}</span>
            </div>
        )}

        <div className="w-72 bg-slate-50/80 flex flex-col border-r border-slate-200/60 hidden md:flex flex-shrink-0 backdrop-blur-xl">
            <div className="p-6">
                <div className="flex items-center gap-2 text-slate-800 mb-1">
                    <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
                        <Settings size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-none">Ajustes</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sistema</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
                <SectionLabel label="Geral" />
                <NavItem id="PROFILE" label="Meu Perfil" icon={UserCircle} />

                {isAdmin && (
                    <>
                        <SectionLabel label="Administração" />
                        <NavItem id="OFFICE" label="Escritório" icon={Building} />
                        <NavItem id="TEAM" label="Equipe" icon={Users} />
                        <NavItem id="AGENCIES" label="Locais" icon={MapPin} />

                        <SectionLabel label="Inteligência" />
                        <NavItem id="TEMPLATES" label="Modelos & Docs" icon={FileText} />
                        <NavItem id="WORKFLOW" label="Robôs" icon={Workflow} description="Automação" />
                        <NavItem id="AUTOMATION" label="Prazos & SLA" icon={Sliders} />
                        <NavItem id="TAGS" label="Etiquetas" icon={Tag} />
                        <NavItem id="WHATSAPP" label="WhatsApp" icon={MessageCircle} />

                        <SectionLabel label="Sistema" />
                        <NavItem id="BACKUP" label="Dados & Backup" icon={Database} />
                    </>
                )}
            </div>
            
            {!isEmbedded && (
                <div className="p-4 border-t border-slate-200/60">
                    <button onClick={handleCloseAttempt} className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-xs font-bold transition-colors w-full px-2 py-2 rounded hover:bg-red-50">
                        <LogOut size={14}/> Sair dos Ajustes
                    </button>
                </div>
            )}
        </div>

        <div className="flex-1 flex flex-col bg-white relative min-w-0">
            <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{TAB_INFO[activeTab]?.title}</h1>
                    <p className="text-sm text-slate-500">{TAB_INFO[activeTab]?.desc}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {isFormTab && (
                        <button 
                            onClick={activeTab === 'PROFILE' ? handleSaveProfile : activeTab === 'OFFICE' ? handleSaveOfficeData : handleSaveSettings}
                            disabled={!isDirty}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Save size={18} /> Salvar
                        </button>
                    )}
                    {!isEmbedded && (
                        <>
                            <div className="h-8 w-px bg-slate-200 mx-1"></div>
                            <button 
                                onClick={handleCloseAttempt} 
                                className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
                                title="Fechar (Esc)"
                            >
                                <X size={24} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:px-12 custom-scrollbar bg-slate-50/30">
                <div className="max-w-4xl mx-auto pb-20">
                    {!isAdmin && activeTab !== 'PROFILE' ? (
                        <div className="flex flex-col items-center justify-center h-[50vh]">
                            <Lock size={48} className="text-slate-300 mb-4"/>
                            <h3 className="text-xl font-bold text-slate-800">Acesso Restrito</h3>
                            <p className="text-slate-500">Apenas administradores podem ver esta seção.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === 'PROFILE' && <UserProfileSettings currentUser={profileForm || currentUser!} setProfileForm={setProfileForm} />}
                            {isAdmin && (
                                <>
                                    {activeTab === 'OFFICE' && <OfficeSettings officeData={officeForm} setOfficeData={setOfficeForm} showToast={showToastMsg} />}
                                    {activeTab === 'AUTOMATION' && <AutomationSettings settings={settingsForm} setSettings={setSettingsForm} />}
                                    
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-300">
      {content}
      {showExitConfirm && (
          <ConfirmationModal 
              title="Alterações pendentes"
              description="Se sair agora, suas alterações nesta aba serão perdidas."
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
