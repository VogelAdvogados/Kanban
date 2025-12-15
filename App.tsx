
import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Case, User, OfficeData, SmartAction, SystemSettings, StickyNote, ContextMenuState, MandadoSeguranca, Appointment, DocumentTemplate } from './types';
import { VIEW_THEMES, APP_THEMES, USERS as DEFAULT_USERS, VIEW_CONFIG, DEFAULT_DOCUMENT_TEMPLATES } from './constants';
import { LoginPage } from './components/LoginPage';
import { useKanban } from './hooks/useKanban';
import { useIsMobile } from './hooks/useIsMobile';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { LoadingScreen } from './components/LoadingScreen';
import { getLocalDateISOString, hasPermission } from './utils';
import { db } from './services/database';
import { AppProvider } from './contexts/AppContext'; 
import { ContextMenu } from './components/ui/ContextMenu'; 
import { ShortcutsHelp } from './components/ShortcutsHelp'; 
import { GlobalModalLayer } from './components/GlobalModalLayer';
import { MobileLayout } from './components/MobileLayout';
import { useCaseTransition } from './hooks/useCaseTransition';

type ToolType = 'DASHBOARD' | 'CALENDAR' | 'TASKS' | 'CLIENTS' | 'LOGS' | 'SETTINGS' | 'TEMPLATES' | null;

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const kanban = useKanban();
  const {
    cases, setCases, filteredCases, casesByColumn, recurrencyMap, currentView, setCurrentView, columns,
    searchTerm, setSearchTerm, responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter, tagFilter, setTagFilter,
    draggedCaseId, setDraggedCaseId, pendingMove, setPendingMove, transitionType, setTransitionType,
    generateInternalId, addCase, updateCase, handleDrop, finalizeMove,
    notifications, markNotificationAsRead, markAllNotificationsAsRead,
    systemLogs, addSystemLog, systemTags, setSystemTags,
    commonDocs, setCommonDocs, agencies, setAgencies, whatsAppTemplates, setWhatsAppTemplates,
    workflowRules, setWorkflowRules, appointments, addAppointment, isLoading, error,
    documentTemplates, setDocumentTemplates
  } = kanban;

  const [users, setUsers] = useState<User[]>([]);
  const [officeData, setOfficeData] = useState<OfficeData>({ name: 'Carregando...' });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ sla_internal_analysis: 7, sla_client_contact: 30, sla_stagnation: 45, sla_spider_web: 45, sla_mandado_seguranca: 120, pp_alert_days: 15, show_probabilities: true });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [deepLinkProcessed, setDeepLinkProcessed] = useState(false);

  // Transition Logic Hook
  const { executeTransition } = useCaseTransition(cases, users, addCase, updateCase, finalizeMove, setCurrentView);

  useEffect(() => {
      const loadConfigs = async () => {
          const [u, o, s] = await Promise.all([db.getUsers(), db.getOfficeData(), db.getSystemSettings()]);
          setUsers(u.length ? u : DEFAULT_USERS); setOfficeData(o); setSystemSettings(prev => ({ ...prev, ...s })); setConfigLoaded(true);
      };
      loadConfigs();
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [whatsAppCase, setWhatsAppCase] = useState<Case | null>(null);
  const [appointmentData, setAppointmentData] = useState<{caseItem?: Case, date?: Date} | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>(null); 
  const [stickyNoteState, setStickyNoteState] = useState<{ case: Case, note?: StickyNote } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [documentGenCase, setDocumentGenCase] = useState<Case | null>(null);

  const [transitionData, setTransitionData] = useState({ 
      protocolNumber: '', protocolDate: getLocalDateISOString(), benefitNumber: '', benefitDate: getLocalDateISOString(), 
      deadlineStart: getLocalDateISOString(), deadlineEnd: '', newResponsibleId: '', missingDocs: [], periciaDate: '', periciaLocation: '', exigencyDetails: '',
      outcome: null, dcbDate: '', appealOrdinarioProtocol: '', appealOrdinarioDate: '', appealEspecialProtocol: '', appealEspecialDate: '', appealDecisionDate: '', appealOutcome: '', returnMode: null
  });

  useEffect(() => { if (currentUser) { const updatedUser = users.find(u => u.id === currentUser.id); if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) setCurrentUser(updatedUser); } }, [users]);

  const handleThemeChange = async (themeId: string) => {
      if (!currentUser) return;
      const updatedUser = { ...currentUser, themePref: themeId };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsers); setCurrentUser(updatedUser); await db.saveUsers(updatedUsers);
  };

  const activeViewTheme = VIEW_THEMES[currentView];
  const appBackgroundClass = currentUser?.themePref && currentUser.themePref !== 'default' ? APP_THEMES.find(t => t.id === currentUser.themePref)?.bgClass || activeViewTheme.bgGradient : activeViewTheme.bgGradient;

  const handleOpenCase = useCallback((c: Case) => {
      setSelectedCase(c); setIsModalOpen(true);
      try { const url = new URL(window.location.href); url.searchParams.set('cid', c.id); window.history.pushState({}, '', url.toString()); } catch (e) {}
      updateCase({ ...c, lastCheckedAt: new Date().toISOString() }, undefined, undefined);
  }, [updateCase]);

  const handleCloseCase = useCallback(() => {
      setIsModalOpen(false);
      try { const url = new URL(window.location.href); url.searchParams.delete('cid'); window.history.pushState({}, '', url.toString()); } catch (e) {}
  }, []);

  const handleBoardDrop = useCallback((colId: string) => handleDrop(colId, currentUser), [handleDrop, currentUser]);
  const handleDragEnd = useCallback(() => setDraggedCaseId(null), [setDraggedCaseId]);

  const handleUpdateClient = useCallback(async (oldCpf: string, updates: Partial<Case>) => {
      const cleanOld = oldCpf.replace(/\D/g, '');
      const targets = cases.filter(c => c.cpf.replace(/\D/g, '') === cleanOld);
      await Promise.all(targets.map(c => updateCase({ ...c, ...updates }, 'Atualização de Cadastro (Lote)', currentUser?.name)));
  }, [cases, updateCase, currentUser]);

  useEffect(() => {
      if (!isLoading && cases.length > 0 && !deepLinkProcessed && currentUser) {
          try { const params = new URLSearchParams(window.location.search); const cid = params.get('cid'); if (cid) { const found = cases.find(c => c.id === cid || c.internalId === cid); if (found) setTimeout(() => handleOpenCase(found), 500); } } catch (e) {}
          setDeepLinkProcessed(true);
      }
  }, [isLoading, cases, deepLinkProcessed, currentUser, handleOpenCase]);

  useEffect(() => {
      if (!currentUser) return;
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
              if (e.key === 'Escape') { if (contextMenu) setContextMenu(null); if (isSearchOpen) setIsSearchOpen(false); return; } return;
          }
          if (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) { e.preventDefault(); setIsSearchOpen(true); }
          else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setIsNewCaseDialogOpen(true); }
          else if (e.key === '?') { setShowShortcutsHelp(true); }
          else if (e.key >= '1' && e.key <= '6') { const viewKeys = Object.keys(VIEW_CONFIG); const idx = parseInt(e.key) - 1; if (viewKeys[idx]) setCurrentView(viewKeys[idx] as any); }
      };
      window.addEventListener('keydown', handleGlobalKeyDown); return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentUser, contextMenu, isSearchOpen]);

  const handleSmartAction = useCallback((c: Case, action: SmartAction) => {
      if (!hasPermission(currentUser, 'EDIT_CASE')) { alert("Permissão negada."); return; }
      if (action.requireConfirmation) { if (!window.confirm(`Executar: "${action.label}"?`)) return; }
      let updates: Partial<Case> = {}; let log = `Ação Rápida: ${action.label}`;
      if (action.tasksToAdd) updates.tasks = [...(c.tasks || []), ...action.tasksToAdd.map(t => ({ ...t, id: `t_${Date.now()}` }))];
      if (action.urgency) updates.urgency = action.urgency;
      if (action.targetColumnId) finalizeMove(c, action.targetColumnId, updates, log, currentUser?.name || 'Sistema');
      else updateCase({ ...c, ...updates }, log, currentUser?.name || 'Sistema');
  }, [currentUser, finalizeMove, updateCase]);

  const handleQuickCheck = useCallback((c: Case) => updateCase({ ...c, lastCheckedAt: new Date().toISOString() }, 'Monitoramento: Consulta realizada.', currentUser?.name || 'Sistema'), [currentUser, updateCase]);

  const handleContextMenu = useCallback((e: React.MouseEvent, c: Case) => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, caseId: c.id }); }, []);

  const handleContextAction = (action: string, c: Case) => {
      setContextMenu(null);
      if (action === 'OPEN') handleOpenCase(c); if (action === 'WHATSAPP') setWhatsAppCase(c); if (action === 'NOTE') setStickyNoteState({ case: c });
      if (action === 'PRIORITY') updateCase({ ...c, urgency: 'HIGH' }, 'Urgência alterada para Alta via Menu Rápido', currentUser?.name);
      if (action === 'CHECK') handleQuickCheck(c); if (action === 'COPY_ID') navigator.clipboard.writeText(c.internalId); if (action === 'DOC_GEN') setDocumentGenCase(c);
  };

  const contextValue = useMemo(() => ({
      currentUser, users, openSchedule: (c: Case) => setAppointmentData({ caseItem: c }), openWhatsApp: (c: Case) => setWhatsAppCase(c), openSmartAction: handleSmartAction,
      openStickyNote: (c: Case, note?: StickyNote) => setStickyNoteState({ case: c, note }), openQuickCheck: handleQuickCheck, openDocumentGenerator: (c: Case) => setDocumentGenCase(c)
  }), [currentUser, users, handleSmartAction, handleQuickCheck]);

  const handleTransitionConfirm = async () => {
      if(!pendingMove || !transitionType) return;
      await executeTransition(transitionType, transitionData, pendingMove, currentUser);
      setTransitionType(null); setPendingMove(null);
  };

  const handleSaveDocToHistory = (docTitle: string, content: string) => {
      if (documentGenCase) { const log = `Documento gerado: ${docTitle}`; const newHistoryItem = { id: `h_doc_${Date.now()}`, date: new Date().toISOString(), user: currentUser?.name || 'Sistema', action: 'Criação Documento', details: log.substring(0, 100) }; updateCase({ ...documentGenCase, history: [...(documentGenCase.history || []), newHistoryItem] }, log, currentUser?.name); }
  };

  // Force Reload of Templates after Manager Closes
  const handleRefreshTemplates = async () => {
      const tpls = await db.getTemplates();
      setDocumentTemplates(tpls);
  };

  if (isLoading || !configLoaded) return <LoadingScreen />;
  if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
  if (!currentUser) return <LoginPage users={users} officeName={officeData.name} onLogin={setCurrentUser} />;

  return (
    <AppProvider value={contextValue}>
    <div className={`flex flex-col h-screen bg-gradient-to-br ${appBackgroundClass} font-sans text-slate-900 transition-colors duration-500`}>
      {isMobile ? (
        <MobileLayout officeName={officeData.name} currentUser={currentUser} currentView={currentView} setCurrentView={setCurrentView} cases={cases} filteredCases={filteredCases} columns={columns} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSelectCase={handleOpenCase} onNewCase={() => setIsNewCaseDialogOpen(true)} onOpenDashboard={() => setActiveTool('DASHBOARD')} onOpenCalendar={() => setActiveTool('CALENDAR')} onOpenTasks={() => setActiveTool('TASKS')} onLogout={() => setCurrentUser(null)} users={users} notificationsCount={notifications.filter(n => !n.isRead).length} systemSettings={systemSettings} systemTags={systemTags} />
      ) : (
        <>
          <Header officeName={officeData.name} currentUser={currentUser} onLogout={() => setCurrentUser(null)} currentView={currentView} setCurrentView={setCurrentView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} responsibleFilter={responsibleFilter} setResponsibleFilter={setResponsibleFilter} urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter} tagFilter={tagFilter} setTagFilter={setTagFilter} onNewCase={() => setIsNewCaseDialogOpen(true)} onOpenCmdK={() => setIsSearchOpen(true)} onOpenDashboard={() => setActiveTool('DASHBOARD')} onOpenCalendar={() => setActiveTool('CALENDAR')} onOpenTasks={() => setActiveTool('TASKS')} onOpenClients={() => setActiveTool('CLIENTS')} onOpenLogs={() => setActiveTool('LOGS')} onOpenSettings={() => setActiveTool('SETTINGS')} onOpenTemplates={() => setActiveTool('TEMPLATES')} allCases={cases} users={users} notifications={notifications} onMarkNotificationAsRead={markNotificationAsRead} onMarkAllNotificationsAsRead={markAllNotificationsAsRead} onSelectCase={handleOpenCase} onThemeChange={handleThemeChange} />
          <KanbanBoard cases={cases} currentView={currentView} columns={columns} casesByColumn={casesByColumn} recurrencyMap={recurrencyMap} draggedCaseId={draggedCaseId} onDrop={handleBoardDrop} onDragStart={setDraggedCaseId} onDragEnd={handleDragEnd} onCardClick={handleOpenCase} onContextMenu={handleContextMenu} users={users} currentUser={currentUser} systemSettings={systemSettings} systemTags={systemTags} />
        </>
      )}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} caseItem={cases.find(c => c.id === contextMenu.caseId)!} onClose={() => setContextMenu(null)} onAction={handleContextAction} />}
      {showShortcutsHelp && <ShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />}
      
      <GlobalModalLayer 
          appState={{ currentUser, activeTool, isModalOpen, selectedCase, isNewCaseDialogOpen, isSearchOpen, whatsAppCase, appointmentData, stickyNoteState, documentGenCase, transitionData }}
          appActions={{ setActiveTool, handleCloseCase, handleOpenCase, handleUpdateClient, setIsNewCaseDialogOpen, setIsSearchOpen, setCurrentView, setWhatsAppCase, setAppointmentData, setStickyNoteState, setDocumentGenCase, handleTransitionConfirm, setTransitionType, setPendingMove, setTransitionData, handleSaveDocToHistory }}
          data={{ cases, users, officeData, systemLogs, systemSettings, systemTags, commonDocs, agencies, whatsAppTemplates, workflowRules, documentTemplates, pendingMove, transitionType }}
          setters={{ setUsers, setOfficeData, setCases, setSystemSettings, setSystemTags, setCommonDocs, setAgencies, setWhatsAppTemplates, setWorkflowRules, setDocumentTemplates }}
          ops={{ updateCase, addCase, addSystemLog, addAppointment, generateInternalId, currentView, columns }}
          onRefreshTemplates={handleRefreshTemplates}
      />
    </div>
    </AppProvider>
  );
};

export default App;
