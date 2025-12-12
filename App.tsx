
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Case, User, OfficeData, SmartAction, SystemSettings, StickyNote } from './types';
import { VIEW_THEMES, APP_THEMES } from './constants';
import { LoginPage } from './components/LoginPage';
import { useKanban } from './hooks/useKanban';
import { useIsMobile } from './hooks/useIsMobile';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { LoadingScreen } from './components/LoadingScreen';
import { getLocalDateISOString } from './utils';
import { db } from './services/database';
import { AppProvider } from './contexts/AppContext'; // Import Context

// Lazy Loaded Components
const TransitionModal = React.lazy(() => import('./components/TransitionModal').then(m => ({ default: m.TransitionModal })));
const NewCaseDialog = React.lazy(() => import('./components/NewCaseDialog').then(m => ({ default: m.NewCaseDialog })));
const WhatsAppModal = React.lazy(() => import('./components/WhatsAppModal').then(m => ({ default: m.WhatsAppModal })));
const DocumentGeneratorModal = React.lazy(() => import('./components/DocumentGeneratorModal').then(m => ({ default: m.DocumentGeneratorModal })));
const CaseModal = React.lazy(() => import('./components/CaseModal').then(m => ({ default: m.CaseModal })));
const ManagementHub = React.lazy(() => import('./components/ManagementHub').then(m => ({ default: m.ManagementHub })));
const MobileLayout = React.lazy(() => import('./components/MobileLayout').then(m => ({ default: m.MobileLayout })));
const GlobalSearch = React.lazy(() => import('./components/search/GlobalSearch').then(m => ({ default: m.GlobalSearch })));
const ConfirmationModal = React.lazy(() => import('./components/ConfirmationModal').then(m => ({ default: m.ConfirmationModal })));
const StickyNoteDialog = React.lazy(() => import('./components/StickyNoteDialog').then(m => ({ default: m.StickyNoteDialog })));
const AppointmentDialog = React.lazy(() => import('./components/AppointmentDialog').then(m => ({ default: m.AppointmentDialog })));

type ActiveTool = 'DASHBOARD' | 'CALENDAR' | 'TASKS' | 'CLIENTS' | 'LOGS' | 'SETTINGS' | null;

const App: React.FC = () => {
  const isMobile = useIsMobile();

  // Use the robust hook
  const {
    cases, setCases, filteredCases, casesByColumn, recurrencyMap,
    currentView, setCurrentView, columns,
    searchTerm, setSearchTerm, 
    responsibleFilter, setResponsibleFilter,
    urgencyFilter, setUrgencyFilter, 
    tagFilter, setTagFilter,
    draggedCaseId, setDraggedCaseId,
    pendingMove, setPendingMove, transitionType, setTransitionType,
    generateInternalId, addCase, updateCase, handleDrop, finalizeMove,
    zoneConfirmation, setZoneConfirmation, executeZoneMove,
    notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
    documentTemplates, setDocumentTemplates,
    systemLogs, addSystemLog,
    systemTags, setSystemTags,
    commonDocs, setCommonDocs, 
    agencies, setAgencies, 
    whatsAppTemplates, setWhatsAppTemplates,
    workflowRules, setWorkflowRules,
    appointments, addAppointment, cancelAppointment,
    isLoading, error
  } = useKanban();

  // Initialize Users, Office, Settings via Async DB
  const [users, setUsers] = useState<User[]>([]);
  const [officeData, setOfficeData] = useState<OfficeData>({ name: 'Carregando...' });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
      sla_internal_analysis: 7, sla_client_contact: 30, sla_stagnation: 45, sla_spider_web: 45, pp_alert_days: 15, show_probabilities: true
  });
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
      const loadConfigs = async () => {
          const [u, o, s] = await Promise.all([
              db.getUsers(),
              db.getOfficeData(),
              db.getSystemSettings()
          ]);
          setUsers(u);
          setOfficeData(o);
          setSystemSettings(s);
          setConfigLoaded(true);
      };
      loadConfigs();
  }, []);

  // Sync back to DB when these change
  const handleUpdateUsers = (newUsers: User[]) => { 
      setUsers(newUsers); 
      db.saveUsers(newUsers); 
      // Update currentUser reference if self was updated
      if(currentUser) {
          const self = newUsers.find(u => u.id === currentUser.id);
          if(self) setCurrentUser(self);
      }
  };
  const handleUpdateOffice = (newOffice: OfficeData) => { setOfficeData(newOffice); db.saveOfficeData(newOffice); };
  const handleUpdateSettings = (newSettings: SystemSettings) => { setSystemSettings(newSettings); db.saveSystemSettings(newSettings); };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [whatsAppCase, setWhatsAppCase] = useState<Case | null>(null);
  const [documentGenCase, setDocumentGenCase] = useState<Case | null>(null);
  const [appointmentCase, setAppointmentCase] = useState<Case | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [stickyNoteState, setStickyNoteState] = useState<{ case: Case, note?: StickyNote } | null>(null);

  const userNotifications = useMemo(() => {
      if (!currentUser) return [];
      return notifications.filter(n => !n.recipientId || n.recipientId === currentUser.id);
  }, [notifications, currentUser]);

  const DEFAULT_TRANSITION_DATA = {
    protocolNumber: '', protocolDate: getLocalDateISOString(),
    appealProtocolNumber: '', appealOrdinarioProtocol: '', appealOrdinarioDate: getLocalDateISOString(),
    appealEspecialProtocol: '', appealEspecialDate: getLocalDateISOString(),
    benefitNumber: '', benefitDate: getLocalDateISOString(),
    deadlineStart: getLocalDateISOString(), deadlineEnd: '', 
    newResponsibleId: '', missingDocs: [], periciaDate: '', periciaLocation: '', exigencyDetails: '',
    outcome: null, dcbDate: '', appealDecisionDate: '', appealOutcome: 'IMPROVIDO', createSpecialTask: true,
    confidenceRating: 3 // Default 'Provável'
  };

  const [transitionData, setTransitionData] = useState(DEFAULT_TRANSITION_DATA);
  
  // --- THEME LOGIC ---
  const activeViewTheme = VIEW_THEMES[currentView];
  
  // Determine actual background class: User Preference > View Default
  const appBackgroundClass = useMemo(() => {
      if (currentUser?.themePref && currentUser.themePref !== 'default') {
          const theme = APP_THEMES.find(t => t.id === currentUser.themePref);
          return theme ? theme.bgClass : activeViewTheme.bgGradient;
      }
      return activeViewTheme.bgGradient;
  }, [currentUser?.themePref, currentView]);

  useEffect(() => { if(!pendingMove) setTransitionData(DEFAULT_TRANSITION_DATA); }, [pendingMove]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              setIsModalOpen(false); setIsNewCaseDialogOpen(false); setActiveTool(null);
              setIsSearchOpen(false); setWhatsAppCase(null); setDocumentGenCase(null); setStickyNoteState(null);
              setAppointmentCase(null);
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
              e.preventDefault();
              setIsSearchOpen(prev => !prev);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- ACTIONS (Hoisted for Context) ---
  const handleSmartAction = (c: Case, action: SmartAction) => {
      if (action.requireConfirmation) { if (!window.confirm(`Executar: "${action.label}"?`)) return; }
      let updates: Partial<Case> = {};
      let log = `Ação Rápida: ${action.label}`;

      if (action.tasksToAdd && action.tasksToAdd.length > 0) {
          const newTasks = action.tasksToAdd.map(t => ({ ...t, id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, completed: false }));
          updates.tasks = [...(c.tasks || []), ...newTasks];
          log += ` | ${newTasks.length} tarefas.`;
      }
      if (action.urgency) updates.urgency = action.urgency;

      if (action.targetColumnId && action.targetColumnId !== c.columnId) {
          if (action.targetView && action.targetView !== c.view) { updates.view = action.targetView; log += ` | Movido para: ${action.targetView}`; }
          finalizeMove(c, action.targetColumnId, updates, log, currentUser?.name || 'Sistema');
      } else {
          updateCase({ ...c, ...updates }, log, currentUser?.name || 'Sistema');
      }
  };

  const handleQuickCheck = (c: Case) => {
      updateCase({ ...c, lastCheckedAt: new Date().toISOString() }, 'Monitoramento: Consulta realizada.', currentUser?.name || 'Sistema');
  };

  // MEMOIZED CONTEXT VALUE TO PREVENT RE-RENDERS
  const contextValue = useMemo(() => ({
      currentUser,
      users,
      openSchedule: (c: Case) => setAppointmentCase(c),
      openWhatsApp: (c: Case) => setWhatsAppCase(c),
      openSmartAction: handleSmartAction,
      openStickyNote: (c: Case, note?: StickyNote) => setStickyNoteState({ case: c, note }),
      openQuickCheck: handleQuickCheck
  }), [currentUser, users]); // Dependency array is key here

  // --- RENDER STATES ---

  // 1. Loading Screen (System Init)
  if (isLoading || !configLoaded) {
      return <LoadingScreen />;
  }

  // 2. Error Screen
  if (error) {
      return (
          <div className="flex h-screen items-center justify-center bg-red-50 p-10 text-center">
              <div>
                  <h1 className="text-2xl font-bold text-red-700 mb-2">Erro de Inicialização</h1>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg">Recarregar Sistema</button>
              </div>
          </div>
      );
  }

  // 3. Login Screen
  if (!currentUser) return <LoginPage users={users} officeName={officeData.name} onLogin={(user) => setCurrentUser(user)} />;

  // 4. Main App
  const handleCreateCase = (cpf: string, preFilledData?: Partial<Case>) => {
    const newCase: Case = {
      id: `c${Date.now()}`, internalId: generateInternalId(), clientName: preFilledData?.clientName || 'Novo Cliente',
      cpf: cpf, phone: preFilledData?.phone || '', view: currentView, columnId: columns[0].id,
      responsibleId: currentUser.id, responsibleName: currentUser.name, createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(), urgency: 'NORMAL', govPassword: preFilledData?.govPassword,
      birthDate: preFilledData?.birthDate, history: []
    };
    addCase(newCase, currentUser.name);
    setIsNewCaseDialogOpen(false);
    setSelectedCase(newCase);
    setIsModalOpen(true);
  };

  const handleUpdateClient = (targetCpf: string, updates: Partial<Case>) => {
    const casesToUpdate = cases.filter(c => c.cpf.replace(/\D/g, '') === targetCpf.replace(/\D/g, ''));
    casesToUpdate.forEach(c => {
         const newHistoryItem = {
            id: `h_upd_${Date.now()}`, date: new Date().toISOString(),
            user: currentUser.name, action: 'Atualização Cadastral', details: 'Ficha atualizada via Módulo de Clientes.'
        };
        updateCase({ ...c, ...updates, history: [...c.history, newHistoryItem] }, '', currentUser.name, 'Atualização');
    });
    addNotification('Dados do Cliente Atualizados', `Ficha cadastral atualizada para ${updates.clientName || targetCpf}.`, 'SUCCESS');
  };

  const handleTransitionConfirm = () => {
    if(!pendingMove || !transitionType) return;
    const c = cases.find(x => x.id === pendingMove.caseId);
    if(c) {
        let updates: Partial<Case> = {};
        let log = 'Dados inseridos.';
        
        if (transitionData.newResponsibleId && transitionData.newResponsibleId !== c.responsibleId) {
            const newUser = users.find(u => u.id === transitionData.newResponsibleId);
            if (newUser) { 
                updates.responsibleId = newUser.id; updates.responsibleName = newUser.name; 
                log += ` | Responsável alterado para ${newUser.name}.`; 
                addNotification('Novo Caso Atribuído', `Você agora é responsável pelo caso ${c.clientName}.`, 'INFO', c.id, newUser.id);
            }
        }

        if(transitionType === 'PROTOCOL_INSS') {
            updates = { 
                ...updates, protocolNumber: transitionData.protocolNumber, protocolDate: transitionData.protocolDate,
                benefitNumber: undefined, benefitDate: undefined, dcbDate: undefined,
                tags: (c.tags || []).filter(t => t !== 'CONCEDIDO' && t !== 'INDEFERIDO'),
                confidenceRating: transitionData.confidenceRating // Save Feeling
            };
            log = `Protocolado INSS: ${transitionData.protocolNumber}`;
            if (c.columnId.includes('indeferido') || c.columnId.includes('concluido')) {
                log = `NOVO PEDIDO (Reentrada): Protocolo ${transitionData.protocolNumber}.`;
            }
            if (pendingMove.targetColId === 'aux_prorrogacao') { updates.isExtension = true; log += ' | Pedido de Prorrogação registrado.'; }
            if (pendingMove.targetColId === 'aux_pericia' && transitionData.periciaDate) { 
                updates.periciaDate = transitionData.periciaDate; 
                
                // Lookup address if possible for location
                const agency = agencies.find(a => a.name === transitionData.periciaLocation);
                const fullLocation = agency ? `${agency.name} (${agency.address})` : transitionData.periciaLocation;
                
                updates.periciaLocation = fullLocation; // Save Location
                log += ` | Perícia agendada para ${fullLocation}.`; 
                
                // --- TRIGGER WHATSAPP MODAL AUTOMATICALLY ---
                const tempCase = { ...c, ...updates };
                setTimeout(() => setWhatsAppCase(tempCase), 500); 
            }
        }
        
        if(transitionType === 'PROTOCOL_APPEAL') {
            updates = { ...updates, confidenceRating: transitionData.confidenceRating };
            if (pendingMove.targetColId === 'rec_camera') {
                updates = { ...updates, appealEspecialProtocol: transitionData.appealEspecialProtocol, appealEspecialDate: transitionData.appealEspecialDate, appealEspecialStatus: 'AGUARDANDO' };
                log = `Recurso Especial (Câmara) protocolado: ${transitionData.appealEspecialProtocol}`;
            } else {
                updates = { ...updates, appealOrdinarioProtocol: transitionData.appealOrdinarioProtocol, appealOrdinarioDate: transitionData.appealOrdinarioDate, appealOrdinarioStatus: 'AGUARDANDO', appealProtocolNumber: transitionData.appealOrdinarioProtocol };
                log = `Recurso Ordinário (Junta) protocolado: ${transitionData.appealOrdinarioProtocol}`;
            }
        }

        if (transitionType === 'APPEAL_RETURN') {
            updates.appealOrdinarioStatus = transitionData.appealOutcome as any;
            if (transitionData.appealDecisionDate) {
                const decisionDate = new Date(transitionData.appealDecisionDate);
                const deadline = new Date(decisionDate);
                deadline.setDate(deadline.getDate() + 30);
                updates.deadlineStart = transitionData.appealDecisionDate;
                updates.deadlineEnd = deadline.toISOString().slice(0, 10);
            }
            if (transitionData.createSpecialTask) {
                const newTask = { id: `t_${Date.now()}`, text: 'Redigir Recurso Especial (2ª Instância)', completed: false };
                updates.tasks = [...(c.tasks || []), newTask];
            }
            log = `Recurso Ordinário: ${transitionData.appealOutcome}. Retorno para produção.`;
        }

        if(transitionType === 'CONCLUSION_NB') { 
            updates = { ...updates, benefitNumber: transitionData.benefitNumber, benefitDate: transitionData.benefitDate };
            
            if (transitionData.outcome === 'GRANTED') {
                updates = { ...updates, dcbDate: transitionData.dcbDate, tags: [...(c.tags || []).filter(t => t !== 'INDEFERIDO'), 'CONCEDIDO'] };
                log = `Decisão INSS: CONCEDIDO. NB: ${transitionData.benefitNumber}.`;
                
            } else if (transitionData.outcome === 'DENIED') {
                 updates = { ...updates, deadlineStart: transitionData.deadlineStart, deadlineEnd: transitionData.deadlineEnd, tags: [...(c.tags || []).filter(t => t !== 'CONCEDIDO'), 'INDEFERIDO'] };
                log = `Decisão INSS: INDEFERIDO. Prazo recursal iniciado.`;
                
            } else if (transitionData.outcome === 'PARTIAL') {
                pendingMove.targetColId = 'adm_pagamento';
                
                updates = {
                    ...updates,
                    dcbDate: transitionData.dcbDate,
                    tags: [...(c.tags || []).filter(t => t !== 'CONCEDIDO' && t !== 'INDEFERIDO'), 'PARCIALMENTE PROVIDO', 'A RECEBER'],
                    urgency: 'HIGH'
                };
                log = `Decisão INSS: PARCIALMENTE PROVIDO. Processo enviado para Pagamento. NB: ${transitionData.benefitNumber}.`;

                const childCaseId = `c_split_${Date.now()}`;
                const childCase: Case = {
                    ...c,
                    id: childCaseId,
                    internalId: c.internalId + 'R',
                    view: 'RECURSO_ADM',
                    columnId: 'rec_triagem',
                    createdAt: new Date().toISOString(),
                    lastUpdate: new Date().toISOString(),
                    deadlineStart: transitionData.deadlineStart,
                    deadlineEnd: transitionData.deadlineEnd,
                    tags: ['RECURSO PARCIAL', 'INDEFERIDO'],
                    benefitNumber: undefined, 
                    protocolNumber: c.protocolNumber, 
                    history: [{
                        id: `h_split_start_${Date.now()}`,
                        date: new Date().toISOString(),
                        user: currentUser.name,
                        action: 'Cisão de Processo',
                        details: `Processo recursal criado a partir da concessão parcial do caso #${c.internalId}.`
                    }],
                    tasks: [{ id: `t_split_${Date.now()}`, text: 'Analisar parte indeferida para Recurso', completed: false }]
                };

                addCase(childCase, currentUser.name);
                addNotification('Processo Bifurcado', `Novo processo recursal #${childCase.internalId} criado para a parte indeferida.`, 'WARNING');
            }
        }

        if(transitionType === 'DEADLINE') { 
            updates = { ...updates, deadlineStart: transitionData.deadlineStart, deadlineEnd: transitionData.deadlineEnd }; 
            if (transitionData.exigencyDetails) {
                updates.exigencyDetails = transitionData.exigencyDetails;
                log = `Exigência detalhada: ${transitionData.exigencyDetails}`;
            } else {
                log = 'Prazos definidos.'; 
            }
        }
        if(transitionType === 'PENDENCY') { updates = { ...updates, missingDocs: transitionData.missingDocs || [] }; log = `Pendências registradas.`; }

        finalizeMove(c, pendingMove.targetColId, updates, log, currentUser.name);
    }
    setTransitionType(null); setPendingMove(null);
  };

  const handleToggleTask = (caseId: string, taskId: string) => {
      const c = cases.find(item => item.id === caseId);
      if (c && c.tasks) {
          const updatedTasks = c.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
          updateCase({ ...c, tasks: updatedTasks }, '', currentUser.name);
      }
  };

  const handleSaveStickyNotes = (updatedNotes: StickyNote[], logMessage: string) => {
      if (!stickyNoteState || !currentUser) return;
      const { case: c } = stickyNoteState;
      updateCase({ ...c, stickyNotes: updatedNotes }, logMessage, currentUser.name, 'Nota Adesiva');
      setStickyNoteState({ case: { ...c, stickyNotes: updatedNotes }, note: undefined }); 
  };

  const pendingCaseContext = pendingMove ? cases.find(c => c.id === pendingMove.caseId) : undefined;

  return (
    <AppProvider value={contextValue}>
    <div className={`flex flex-col h-screen bg-gradient-to-br ${appBackgroundClass} font-sans text-slate-900 selection:bg-blue-200 transition-colors duration-500`}>
      {isMobile ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-400">Carregando...</div>}>
            <MobileLayout 
            officeName={officeData.name} currentUser={currentUser} currentView={currentView} setCurrentView={setCurrentView}
            cases={cases} filteredCases={filteredCases} columns={columns} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
            onNewCase={() => setIsNewCaseDialogOpen(true)}
            onOpenDashboard={() => setActiveTool('DASHBOARD')}
            onOpenCalendar={() => setActiveTool('CALENDAR')}
            onOpenTasks={() => setActiveTool('TASKS')}
            onLogout={() => setCurrentUser(null)}
            users={users} notificationsCount={userNotifications.filter(n => !n.isRead).length}
            systemSettings={systemSettings} systemTags={systemTags}
            onStickyNote={(c, note) => setStickyNoteState({ case: c, note })}
            />
        </Suspense>
      ) : (
        <>
          <Header 
            officeName={officeData.name} currentUser={currentUser} onLogout={() => setCurrentUser(null)}
            currentView={currentView} setCurrentView={setCurrentView}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            responsibleFilter={responsibleFilter} setResponsibleFilter={setResponsibleFilter}
            urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter}
            tagFilter={tagFilter} setTagFilter={setTagFilter}
            onNewCase={() => setIsNewCaseDialogOpen(true)}
            onOpenCmdK={() => setIsSearchOpen(true)}
            onOpenDashboard={() => setActiveTool('DASHBOARD')}
            onOpenCalendar={() => setActiveTool('CALENDAR')}
            onOpenTasks={() => setActiveTool('TASKS')}
            onOpenClients={() => setActiveTool('CLIENTS')}
            onOpenLogs={() => setActiveTool('LOGS')}
            onOpenSettings={() => setActiveTool('SETTINGS')}
            allCases={cases} users={users} notifications={userNotifications} 
            onMarkNotificationAsRead={markNotificationAsRead} onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
            onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
          />
          <KanbanBoard 
            cases={cases} currentView={currentView} columns={columns} casesByColumn={casesByColumn} recurrencyMap={recurrencyMap}
            draggedCaseId={draggedCaseId} onDrop={(colId) => handleDrop(colId, currentUser)}
            onDragStart={(id) => setDraggedCaseId(id)} onDragEnd={() => setDraggedCaseId(null)}
            onCardClick={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
            onWhatsApp={(c) => setWhatsAppCase(c)} 
            onQuickCheck={handleQuickCheck} 
            onSmartAction={handleSmartAction}
            onStickyNote={(c, note) => setStickyNoteState({ case: c, note })}
            onSchedule={(c) => setAppointmentCase(c)}
            users={users} currentUser={currentUser} systemSettings={systemSettings} systemTags={systemTags}
          />
        </>
      )}

      <Suspense fallback={null}>
        {activeTool && (
            <ManagementHub
                isOpen={!!activeTool} onClose={() => setActiveTool(null)} initialTab={activeTool}
                cases={cases} users={users} currentUser={currentUser} setUsers={handleUpdateUsers}
                officeData={officeData} setOfficeData={handleUpdateOffice}
                onImportData={(d) => { setCases(d); db.updateCasesBulk(d); setActiveTool(null); }}
                onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); setActiveTool(null); }}
                onToggleTask={handleToggleTask} onNewCase={() => { setActiveTool(null); setIsNewCaseDialogOpen(true); }}
                onUpdateClient={handleUpdateClient}
                documentTemplates={documentTemplates} setDocumentTemplates={setDocumentTemplates}
                systemLogs={systemLogs} addSystemLog={addSystemLog}
                systemSettings={systemSettings} setSystemSettings={handleUpdateSettings}
                systemTags={systemTags} setSystemTags={setSystemTags}
                commonDocs={commonDocs} setCommonDocs={setCommonDocs} 
                agencies={agencies} setAgencies={setAgencies}
                whatsAppTemplates={whatsAppTemplates} setWhatsAppTemplates={setWhatsAppTemplates}
                workflowRules={workflowRules} setWorkflowRules={setWorkflowRules}
            />
        )}
        {isModalOpen && selectedCase && (
            <CaseModal 
            data={selectedCase} allCases={cases} users={users} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
            onSave={(updated, log) => {
                if (log.includes('[CONTATO CLIENTE]')) updated.lastContactDate = new Date().toISOString();
                updateCase(updated, log, currentUser.name);
            }}
            onSelectCase={(c) => setSelectedCase(c)} onOpenWhatsApp={(c) => setWhatsAppCase(c)}
            onOpenDocumentGenerator={(c) => setDocumentGenCase(c)}
            commonDocs={commonDocs}
            whatsAppTemplates={whatsAppTemplates} // Pass templates to modal
            />
        )}
        {transitionType && pendingMove && (
          <TransitionModal 
            type={transitionType} data={transitionData} caseContext={pendingCaseContext}
            setData={setTransitionData} currentResponsibleId={currentUser.id} users={users} targetColumnId={pendingMove.targetColId}
            onConfirm={handleTransitionConfirm} onCancel={() => { setTransitionType(null); setPendingMove(null); }}
            commonDocs={commonDocs}
            agencies={agencies} // Pass to modal for form
          />
        )}
        {isNewCaseDialogOpen && (
          <NewCaseDialog cases={cases} onClose={() => setIsNewCaseDialogOpen(false)} onProceed={handleCreateCase} />
        )}
        {whatsAppCase && (
            <WhatsAppModal 
              data={whatsAppCase} onClose={() => setWhatsAppCase(null)} 
              agencies={agencies} 
              templates={whatsAppTemplates}
              onLog={(msg) => {
                  const updatedCase = { ...whatsAppCase, lastContactDate: new Date().toISOString() };
                  updateCase(updatedCase, msg, currentUser.name, 'Contato WhatsApp');
              }}
            />
        )}
        {documentGenCase && (
            <DocumentGeneratorModal 
                data={documentGenCase} templates={documentTemplates} onClose={() => setDocumentGenCase(null)} officeData={officeData}
                onSaveToHistory={(title, content) => updateCase(documentGenCase, `Documento gerado: ${title}.`, currentUser.name, 'Documentos')}
            />
        )}
        {appointmentCase && (
            <AppointmentDialog 
                caseItem={appointmentCase} users={users} currentUser={currentUser} 
                onSave={(appt) => { addAppointment(appt); updateCase(appointmentCase, `Agendamento criado: ${new Date(appt.date).toLocaleString()}`, currentUser.name, 'Agendamento'); }} 
                onClose={() => setAppointmentCase(null)} 
            />
        )}
        {stickyNoteState && (
            <StickyNoteDialog 
                notes={stickyNoteState.case.stickyNotes || []} users={users} currentUser={currentUser}
                onSaveNotes={handleSaveStickyNotes} onClose={() => setStickyNoteState(null)}
            />
        )}
        {zoneConfirmation && (
            <ConfirmationModal
                title={zoneConfirmation.title} description={zoneConfirmation.description} isDangerous={zoneConfirmation.isDangerous}
                onConfirm={() => executeZoneMove(currentUser)} onCancel={() => setZoneConfirmation(null)}
            />
        )}
        {isSearchOpen && (
            <GlobalSearch 
                isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} cases={cases}
                onSelectCase={(c) => { 
                    setCurrentView(c.view); // Correct view switch
                    setSelectedCase(c); 
                    setIsModalOpen(true); 
                }}
                onNavigate={(view) => setCurrentView(view)}
                onAction={(action) => { if (['DASHBOARD', 'CALENDAR', 'TASKS', 'LOGS', 'SETTINGS', 'CLIENTS'].includes(action)) setActiveTool(action as ActiveTool); }}
            />
        )}
      </Suspense>
    </div>
    </AppProvider>
  );
};

export default App;
