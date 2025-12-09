
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Case, User, OfficeData } from './types';
import { USERS as INITIAL_USERS, VIEW_THEMES } from './constants';
// Static imports for core components needed for LCP
import { LoginPage } from './components/LoginPage';
import { useKanban } from './hooks/useKanban';
import { useIsMobile } from './hooks/useIsMobile';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { getLocalDateISOString } from './utils';

// Lazy Loaded Components for Performance Optimization
const TransitionModal = React.lazy(() => import('./components/TransitionModal').then(m => ({ default: m.TransitionModal })));
const NewCaseDialog = React.lazy(() => import('./components/NewCaseDialog').then(m => ({ default: m.NewCaseDialog })));
const WhatsAppModal = React.lazy(() => import('./components/WhatsAppModal').then(m => ({ default: m.WhatsAppModal })));
const DocumentGeneratorModal = React.lazy(() => import('./components/DocumentGeneratorModal').then(m => ({ default: m.DocumentGeneratorModal })));
const CaseModal = React.lazy(() => import('./components/CaseModal').then(m => ({ default: m.CaseModal })));
const ManagementHub = React.lazy(() => import('./components/ManagementHub').then(m => ({ default: m.ManagementHub })));
const MobileLayout = React.lazy(() => import('./components/MobileLayout').then(m => ({ default: m.MobileLayout })));
const CmdKModal = React.lazy(() => import('./components/CmdKModal').then(m => ({ default: m.CmdKModal })));
const ConfirmationModal = React.lazy(() => import('./components/ConfirmationModal').then(m => ({ default: m.ConfirmationModal })));

type ActiveTool = 'DASHBOARD' | 'CALENDAR' | 'TASKS' | 'CLIENTS' | 'LOGS' | 'SETTINGS' | null;

const App: React.FC = () => {
  const isMobile = useIsMobile();

  const {
    cases, setCases, filteredCases, casesByColumn, recurrencyMap,
    currentView, setCurrentView, columns,
    searchTerm, setSearchTerm, responsibleFilter, setResponsibleFilter,
    urgencyFilter, setUrgencyFilter, draggedCaseId, setDraggedCaseId,
    pendingMove, setPendingMove, transitionType, setTransitionType,
    generateInternalId, addCase, updateCase, handleDrop, finalizeMove,
    zoneConfirmation, setZoneConfirmation, executeZoneMove,
    notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
    documentTemplates, setDocumentTemplates,
    systemLogs, addSystemLog
  } = useKanban();

  const [users, setUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('rambo_prev_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Replaced simple officeName string with OfficeData object
  const [officeData, setOfficeData] = useState<OfficeData>(() => {
      const saved = localStorage.getItem('rambo_prev_office_data');
      return saved ? JSON.parse(saved) : { name: 'Vogel Advogados' };
  });

  useEffect(() => { localStorage.setItem('rambo_prev_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('rambo_prev_office_data', JSON.stringify(officeData)); }, [officeData]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // States
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [whatsAppCase, setWhatsAppCase] = useState<Case | null>(null);
  const [documentGenCase, setDocumentGenCase] = useState<Case | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  // Filter notifications for the current user (Global or Specific to ID)
  const userNotifications = useMemo(() => {
      if (!currentUser) return [];
      return notifications.filter(n => !n.recipientId || n.recipientId === currentUser.id);
  }, [notifications, currentUser]);

  // BUG FIX: Use local date instead of UTC to prevent "yesterday" bug on initialization
  const DEFAULT_TRANSITION_DATA = {
    protocolNumber: '', 
    protocolDate: getLocalDateISOString(),
    appealProtocolNumber: '', 
    benefitNumber: '', 
    benefitDate: getLocalDateISOString(),
    deadlineStart: getLocalDateISOString(), 
    deadlineEnd: '', 
    newResponsibleId: '',
    missingDocs: [], 
    periciaDate: '',
    outcome: null, 
    dcbDate: '' 
  };

  const [transitionData, setTransitionData] = useState(DEFAULT_TRANSITION_DATA);
  const activeTheme = VIEW_THEMES[currentView];

  useEffect(() => { if(!pendingMove) setTransitionData(DEFAULT_TRANSITION_DATA); }, [pendingMove]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              setIsModalOpen(false);
              setIsNewCaseDialogOpen(false);
              setActiveTool(null);
              setIsCmdKOpen(false);
              setWhatsAppCase(null);
              setDocumentGenCase(null);
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
              e.preventDefault();
              setIsCmdKOpen(prev => !prev);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) return <LoginPage users={users} officeName={officeData.name} onLogin={(user) => setCurrentUser(user)} />;

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
    setCases(prev => prev.map(c => {
        const cKey = c.cpf ? c.cpf.replace(/\D/g, '') : '';
        const tKey = targetCpf.replace(/\D/g, '');
        
        if (cKey === tKey && cKey.length > 0) {
            const newHistoryItem = {
                id: `h_upd_${Date.now()}`,
                date: new Date().toISOString(),
                user: currentUser.name,
                action: 'Atualização Cadastral',
                details: 'Ficha atualizada via Módulo de Clientes.'
            };
            return { 
                ...c, 
                ...updates, 
                lastUpdate: new Date().toISOString(),
                history: [...c.history, newHistoryItem]
            };
        }
        return c;
    }));
    // Global notification for data update
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
                updates.responsibleId = newUser.id; 
                updates.responsibleName = newUser.name; 
                log += ` | Responsável alterado para ${newUser.name}.`; 
                // Notify the new responsible user
                addNotification('Novo Caso Atribuído', `Você agora é responsável pelo caso ${c.clientName}.`, 'INFO', c.id, newUser.id);
            }
        }

        if(transitionType === 'PROTOCOL_INSS') {
            updates = { 
                ...updates, 
                protocolNumber: transitionData.protocolNumber, 
                protocolDate: transitionData.protocolDate,
                // Lógica de Reentrada/Novo Pedido: Limpa dados da decisão anterior para evitar confusão
                benefitNumber: undefined, 
                benefitDate: undefined,
                dcbDate: undefined,
                // Remove tags de conclusão para limpar o estado visual
                tags: (c.tags || []).filter(t => t !== 'CONCEDIDO' && t !== 'INDEFERIDO')
            };
            log = `Protocolado INSS: ${transitionData.protocolNumber}`;
            
            // Se for novo pedido, menciona no log
            if (c.columnId.includes('indeferido') || c.columnId.includes('concluido')) {
                log = `NOVO PEDIDO (Reentrada): Protocolo ${transitionData.protocolNumber}. Dados anteriores arquivados no histórico.`;
            }

            if (pendingMove.targetColId === 'aux_prorrogacao') { updates.isExtension = true; log += ' | Pedido de Prorrogação registrado.'; }
            if (pendingMove.targetColId === 'aux_pericia' && transitionData.periciaDate) { updates.periciaDate = transitionData.periciaDate; log += ` | Perícia agendada.`; }
        }
        
        if(transitionType === 'PROTOCOL_APPEAL') { 
            updates = { ...updates, appealProtocolNumber: transitionData.appealProtocolNumber }; 
            log = `Protocolado Recurso: ${transitionData.appealProtocolNumber}`; 
        }

        if(transitionType === 'CONCLUSION_NB') { 
            updates = { 
                ...updates,
                benefitNumber: transitionData.benefitNumber, 
                benefitDate: transitionData.benefitDate 
            };

            if (transitionData.outcome === 'GRANTED') {
                updates = { 
                    ...updates, 
                    dcbDate: transitionData.dcbDate,
                    tags: [...(c.tags || []).filter(t => t !== 'INDEFERIDO'), 'CONCEDIDO']
                };
                log = `Decisão INSS: CONCEDIDO. NB: ${transitionData.benefitNumber}. DIB: ${transitionData.benefitDate}`;
            } else if (transitionData.outcome === 'DENIED') {
                 updates = { 
                    ...updates, 
                    deadlineStart: transitionData.deadlineStart, 
                    deadlineEnd: transitionData.deadlineEnd, 
                    tags: [...(c.tags || []).filter(t => t !== 'CONCEDIDO'), 'INDEFERIDO']
                };
                log = `Decisão INSS: INDEFERIDO. NB: ${transitionData.benefitNumber}. Prazo recursal iniciado.`;
            }
        }

        if(transitionType === 'DEADLINE') { 
            updates = { ...updates, deadlineStart: transitionData.deadlineStart, deadlineEnd: transitionData.deadlineEnd }; 
            log = 'Prazos definidos.'; 
        }

        if(transitionType === 'PENDENCY') { 
            updates = { ...updates, missingDocs: transitionData.missingDocs || [] }; 
            log = `Pendências registradas.`; 
        }

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

  const handleQuickCheck = (c: Case) => {
      const now = new Date().toISOString();
      const updatedCase = { ...c, lastCheckedAt: now };
      updateCase(updatedCase, 'Monitoramento: Consulta de andamento realizada. Nenhuma alteração de fase detectada.', currentUser.name);
  };

  const handleCmdAction = (action: string) => {
      if (['DASHBOARD', 'CALENDAR', 'TASKS', 'LOGS', 'SETTINGS', 'CLIENTS'].includes(action)) {
          setActiveTool(action as ActiveTool);
      }
  };

  const pendingCaseContext = pendingMove ? cases.find(c => c.id === pendingMove.caseId) : undefined;

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${activeTheme.bgGradient} font-sans text-slate-900 selection:bg-blue-200 transition-colors duration-500`}>
      
      {/* MOBILE VS DESKTOP SPLIT */}
      {isMobile ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-400">Carregando Rambo Prev...</div>}>
            <MobileLayout 
            officeName={officeData.name}
            currentUser={currentUser}
            currentView={currentView}
            setCurrentView={setCurrentView}
            cases={cases}
            filteredCases={filteredCases}
            columns={columns}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
            onNewCase={() => setIsNewCaseDialogOpen(true)}
            onOpenDashboard={() => setActiveTool('DASHBOARD')}
            onOpenCalendar={() => setActiveTool('CALENDAR')}
            onOpenTasks={() => setActiveTool('TASKS')}
            onLogout={() => setCurrentUser(null)}
            users={users}
            notificationsCount={userNotifications.filter(n => !n.isRead).length}
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
            onNewCase={() => setIsNewCaseDialogOpen(true)}
            onOpenCmdK={() => setIsCmdKOpen(true)}
            
            onOpenDashboard={() => setActiveTool('DASHBOARD')}
            onOpenCalendar={() => setActiveTool('CALENDAR')}
            onOpenTasks={() => setActiveTool('TASKS')}
            onOpenClients={() => setActiveTool('CLIENTS')}
            onOpenLogs={() => setActiveTool('LOGS')}
            onOpenSettings={() => setActiveTool('SETTINGS')}

            allCases={cases} users={users}
            notifications={userNotifications} 
            onMarkNotificationAsRead={markNotificationAsRead} 
            onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
            onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
          />

          <KanbanBoard 
            cases={cases}
            currentView={currentView} columns={columns} casesByColumn={casesByColumn} recurrencyMap={recurrencyMap}
            draggedCaseId={draggedCaseId} onDrop={(colId) => handleDrop(colId, currentUser)}
            onDragStart={(id) => setDraggedCaseId(id)}
            onDragEnd={() => setDraggedCaseId(null)}
            onCardClick={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
            onWhatsApp={(c) => setWhatsAppCase(c)}
            onQuickCheck={handleQuickCheck}
            users={users}
          />
        </>
      )}

      {/* --- LAZY LOADED DIALOGS & TOOLS --- */}
      <Suspense fallback={null}>
        {/* Management Hub (Tools) */}
        {activeTool && (
            <ManagementHub
                isOpen={!!activeTool}
                onClose={() => setActiveTool(null)}
                initialTab={activeTool}
                cases={cases}
                users={users}
                currentUser={currentUser}
                setUsers={setUsers}
                officeData={officeData}
                setOfficeData={setOfficeData}
                onImportData={(d) => { setCases(d); setActiveTool(null); }}
                onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); setActiveTool(null); }}
                onToggleTask={handleToggleTask}
                onNewCase={() => { setActiveTool(null); setIsNewCaseDialogOpen(true); }}
                onUpdateClient={handleUpdateClient}
                documentTemplates={documentTemplates}
                setDocumentTemplates={setDocumentTemplates}
                systemLogs={systemLogs}
                addSystemLog={addSystemLog}
            />
        )}

        {/* Case Modal */}
        {isModalOpen && selectedCase && (
            <CaseModal 
            data={selectedCase} 
            allCases={cases}
            users={users}
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={(updated, log) => updateCase(updated, log, currentUser.name)}
            onSelectCase={(c) => setSelectedCase(c)}
            onOpenWhatsApp={(c) => setWhatsAppCase(c)}
            onOpenDocumentGenerator={(c) => setDocumentGenCase(c)}
            />
        )}

        {/* Transition Logic (Drag & Drop) */}
        {transitionType && pendingMove && (
          <TransitionModal 
            type={transitionType}
            data={transitionData}
            caseContext={pendingCaseContext}
            setData={setTransitionData}
            currentResponsibleId={currentUser.id}
            users={users}
            targetColumnId={pendingMove.targetColId}
            onConfirm={handleTransitionConfirm}
            onCancel={() => { setTransitionType(null); setPendingMove(null); }}
          />
        )}

        {/* Other Dialogs */}
        {isNewCaseDialogOpen && (
          <NewCaseDialog 
              cases={cases}
              onClose={() => setIsNewCaseDialogOpen(false)}
              onProceed={handleCreateCase}
          />
        )}

        {whatsAppCase && (
            <WhatsAppModal 
              data={whatsAppCase} 
              onClose={() => setWhatsAppCase(null)} 
            />
        )}

        {documentGenCase && (
            <DocumentGeneratorModal 
                data={documentGenCase}
                templates={documentTemplates}
                onClose={() => setDocumentGenCase(null)}
                officeData={officeData}
            />
        )}

        {/* Zone Confirmation */}
        {zoneConfirmation && (
            <ConfirmationModal
                title={zoneConfirmation.title}
                description={zoneConfirmation.description}
                isDangerous={zoneConfirmation.isDangerous}
                onConfirm={() => executeZoneMove(currentUser)}
                onCancel={() => setZoneConfirmation(null)}
            />
        )}

        {/* Command Center */}
        {isCmdKOpen && (
            <CmdKModal 
                isOpen={isCmdKOpen}
                onClose={() => setIsCmdKOpen(false)}
                cases={cases}
                onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
                onNavigate={(view) => setCurrentView(view)}
                onAction={handleCmdAction}
            />
        )}
      </Suspense>

    </div>
  );
};

export default App;
