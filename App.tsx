
import React, { useState, useEffect, Suspense } from 'react';
import { Case, User } from './types';
import { USERS as INITIAL_USERS, VIEW_THEMES } from './constants';
import { CaseModal } from './components/CaseModal';
import { TransitionModal } from './components/TransitionModal';
import { NewCaseDialog } from './components/NewCaseDialog';
import { WhatsAppModal } from './components/WhatsAppModal';
import { LoginPage } from './components/LoginPage';
import { useKanban } from './hooks/useKanban';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CmdKModal } from './components/CmdKModal';
import { ConfirmationModal } from './components/ConfirmationModal';

// --- LAZY LOADING MODULES (Performance Optimization) ---
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const SettingsModal = React.lazy(() => import('./components/SettingsModal').then(module => ({ default: module.SettingsModal })));
const CalendarModal = React.lazy(() => import('./components/CalendarModal').then(module => ({ default: module.CalendarModal })));
const GlobalLogsModal = React.lazy(() => import('./components/GlobalLogsModal').then(module => ({ default: module.GlobalLogsModal })));
const TaskCenterModal = React.lazy(() => import('./components/TaskCenterModal').then(module => ({ default: module.TaskCenterModal }))); 
const ClientsModal = React.lazy(() => import('./components/ClientsModal').then(module => ({ default: module.ClientsModal }))); 

const App: React.FC = () => {
  // Use Custom Hook for Logic
  const {
    cases, setCases, filteredCases, currentView, setCurrentView, columns,
    searchTerm, setSearchTerm, responsibleFilter, setResponsibleFilter,
    urgencyFilter, setUrgencyFilter, draggedCaseId, setDraggedCaseId,
    pendingMove, setPendingMove, transitionType, setTransitionType,
    generateInternalId, addCase, updateCase, handleDrop, finalizeMove,
    zoneConfirmation, setZoneConfirmation, executeZoneMove,
    notifications, markNotificationAsRead, markAllNotificationsAsRead // Notifications
  } = useKanban();

  // Settings State (Persisted)
  const [users, setUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('rambo_prev_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [officeName, setOfficeName] = useState(() => {
      return localStorage.getItem('rambo_prev_office_name') || 'Rambo Prev';
  });

  useEffect(() => {
      localStorage.setItem('rambo_prev_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
      localStorage.setItem('rambo_prev_office_name', officeName);
  }, [officeName]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Local UI State
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false); 
  const [isTaskCenterOpen, setIsTaskCenterOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  
  const [whatsAppCase, setWhatsAppCase] = useState<Case | null>(null);

  const DEFAULT_TRANSITION_DATA = {
    protocolNumber: '',
    protocolDate: new Date().toISOString().slice(0, 10),
    appealProtocolNumber: '',
    benefitNumber: '',
    benefitDate: new Date().toISOString().slice(0, 10),
    deadlineStart: new Date().toISOString().slice(0, 10),
    deadlineEnd: '',
    newResponsibleId: '',
    missingDocs: [],
    periciaDate: '' 
  };

  const [transitionData, setTransitionData] = useState(DEFAULT_TRANSITION_DATA);
  const activeTheme = VIEW_THEMES[currentView];

  useEffect(() => {
    if(!pendingMove) {
        setTransitionData(DEFAULT_TRANSITION_DATA);
    }
  }, [pendingMove]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              setIsModalOpen(false);
              setIsDashboardOpen(false);
              setIsNewCaseDialogOpen(false);
              setIsSettingsOpen(false);
              setIsCalendarOpen(false);
              setIsLogsOpen(false);
              setIsTaskCenterOpen(false);
              setIsClientsOpen(false);
              setIsCmdKOpen(false);
              setWhatsAppCase(null);
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
              e.preventDefault();
              setIsCmdKOpen(prev => !prev);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) {
      return (
          <LoginPage 
            users={users} 
            officeName={officeName} 
            onLogin={(user) => setCurrentUser(user)} 
          />
      );
  }

  const handleCreateCase = (cpf: string, preFilledData?: Partial<Case>) => {
    const newCase: Case = {
      id: `c${Date.now()}`,
      internalId: generateInternalId(),
      clientName: preFilledData?.clientName || 'Novo Cliente',
      cpf: cpf,
      phone: preFilledData?.phone || '',
      view: currentView,
      columnId: columns[0].id,
      responsibleId: currentUser.id,
      responsibleName: currentUser.name,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      urgency: 'NORMAL',
      govPassword: preFilledData?.govPassword,
      birthDate: preFilledData?.birthDate,
      history: []
    };
    addCase(newCase, currentUser.name);
    setIsNewCaseDialogOpen(false);
    setSelectedCase(newCase);
    setIsModalOpen(true);
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
            }
        }
        
        if(transitionType === 'PROTOCOL_INSS') {
            updates = { ...updates, protocolNumber: transitionData.protocolNumber, protocolDate: transitionData.protocolDate };
            log = `Protocolado INSS: ${transitionData.protocolNumber}`;
            
            if (pendingMove.targetColId === 'aux_prorrogacao') {
                updates.isExtension = true;
                log += ' | Pedido de Prorrogação registrado.';
            }

            if (pendingMove.targetColId === 'aux_pericia' && transitionData.periciaDate) {
                updates.periciaDate = transitionData.periciaDate;
                log += ` | Perícia agendada para: ${new Date(transitionData.periciaDate).toLocaleString()}.`;
            }
        }
        if(transitionType === 'PROTOCOL_APPEAL') {
            updates = { ...updates, appealProtocolNumber: transitionData.appealProtocolNumber };
            log = `Protocolado Recurso: ${transitionData.appealProtocolNumber}`;
        }
        if(transitionType === 'CONCLUSION_NB') {
            updates = { ...updates, benefitNumber: transitionData.benefitNumber, benefitDate: transitionData.benefitDate };
            log = transitionData.benefitNumber ? `Concluído com NB: ${transitionData.benefitNumber}` : 'Concluído (Sem concessão).';
        }
        if(transitionType === 'DEADLINE') {
            updates = { ...updates, deadlineStart: transitionData.deadlineStart, deadlineEnd: transitionData.deadlineEnd };
            log = 'Prazos definidos.';
        }
        if(transitionType === 'PENDENCY') {
            const docs = transitionData.missingDocs || [];
            updates = { ...updates, missingDocs: docs };
            log = `Pendências registradas: ${docs.join(', ')}.`;
        }

        finalizeMove(c, pendingMove.targetColId, updates, log, currentUser.name);
    }
    setTransitionType(null); 
    setPendingMove(null);
  };

  const handleToggleTask = (caseId: string, taskId: string) => {
      const c = cases.find(item => item.id === caseId);
      if (c && c.tasks) {
          const updatedTasks = c.tasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          updateCase({ ...c, tasks: updatedTasks }, '', currentUser.name);
      }
  };

  const getRecurrentCount = (cpf: string) => {
     return cases.filter(c => c.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')).length;
  };

  const handleCmdAction = (action: string) => {
      if (action === 'DASHBOARD') setIsDashboardOpen(true);
      if (action === 'CALENDAR') setIsCalendarOpen(true);
      if (action === 'TASKS') setIsTaskCenterOpen(true);
      if (action === 'LOGS') setIsLogsOpen(true);
      if (action === 'SETTINGS') setIsSettingsOpen(true);
      if (action === 'CLIENTS') setIsClientsOpen(true);
  };

  const LoadingSpinner = () => (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-[100]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
  );

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${activeTheme.bgGradient} font-sans text-slate-900 selection:bg-blue-200 transition-colors duration-500`}>
      
      <Header 
        officeName={officeName}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        responsibleFilter={responsibleFilter}
        setResponsibleFilter={setResponsibleFilter}
        urgencyFilter={urgencyFilter}
        setUrgencyFilter={setUrgencyFilter}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onNewCase={() => setIsNewCaseDialogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onOpenTasks={() => setIsTaskCenterOpen(true)} 
        onOpenCmdK={() => setIsCmdKOpen(true)}
        onOpenClients={() => setIsClientsOpen(true)}
        allCases={cases}
        users={users}
        // Notification Props
        notifications={notifications}
        onMarkNotificationAsRead={markNotificationAsRead}
        onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
      />

      <KanbanBoard 
        currentView={currentView}
        columns={columns}
        filteredCases={filteredCases}
        draggedCaseId={draggedCaseId}
        onDrop={(colId) => handleDrop(colId, currentUser)}
        onDragStart={(id) => setDraggedCaseId(id)}
        onCardClick={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
        getRecurrentCount={getRecurrentCount}
        onWhatsApp={(c) => setWhatsAppCase(c)}
        users={users} 
      />

      {transitionType && pendingMove && (
        <TransitionModal 
          type={transitionType} 
          data={transitionData} 
          currentResponsibleId={cases.find(c => c.id === pendingMove.caseId)?.responsibleId || users[0].id}
          users={users}
          targetColumnId={pendingMove.targetColId} 
          setData={setTransitionData} 
          onCancel={() => {setTransitionType(null); setPendingMove(null)}} 
          onConfirm={handleTransitionConfirm}
        />
      )}
      
      {zoneConfirmation && (
          <ConfirmationModal 
              title={zoneConfirmation.title}
              description={zoneConfirmation.description}
              isDangerous={zoneConfirmation.isDangerous}
              onConfirm={() => executeZoneMove(currentUser)}
              onCancel={() => setZoneConfirmation(null)}
          />
      )}

      {whatsAppCase && (
          <WhatsAppModal 
            data={whatsAppCase} 
            onClose={() => setWhatsAppCase(null)} 
          />
      )}

      {isNewCaseDialogOpen && <NewCaseDialog cases={cases} onClose={() => setIsNewCaseDialogOpen(false)} onProceed={handleCreateCase} />}
      
      <CmdKModal 
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        cases={cases}
        onSelectCase={(c) => { setSelectedCase(c); setIsModalOpen(true); }}
        onNavigate={setCurrentView}
        onAction={handleCmdAction}
      />

      <Suspense fallback={<LoadingSpinner />}>
          {isDashboardOpen && <Dashboard cases={cases} onClose={() => setIsDashboardOpen(false)} />}
          
          {isSettingsOpen && (
              <SettingsModal 
                onClose={() => setIsSettingsOpen(false)} 
                allCases={cases}
                users={users}
                setUsers={setUsers}
                onImportData={(importedCases) => setCases(importedCases)} 
                officeName={officeName}
                setOfficeName={setOfficeName}
              />
          )}

          {isCalendarOpen && (
              <CalendarModal 
                cases={cases} 
                onClose={() => setIsCalendarOpen(false)} 
              />
          )}

          {isLogsOpen && (
            <GlobalLogsModal 
              cases={cases}
              users={users}
              onClose={() => setIsLogsOpen(false)}
              onSelectCase={(c) => { setIsLogsOpen(false); setSelectedCase(c); setIsModalOpen(true); }}
            />
          )}

          {isTaskCenterOpen && (
              <TaskCenterModal 
                  cases={cases}
                  users={users}
                  currentUser={currentUser}
                  onClose={() => setIsTaskCenterOpen(false)}
                  onSelectCase={(c) => { setIsTaskCenterOpen(false); setSelectedCase(c); setIsModalOpen(true); }}
                  onToggleTask={handleToggleTask}
              />
          )}

          {isClientsOpen && (
              <ClientsModal 
                  cases={cases}
                  onClose={() => setIsClientsOpen(false)}
                  onSelectCase={(c) => { setIsClientsOpen(false); setSelectedCase(c); setIsModalOpen(true); }}
              />
          )}
      </Suspense>

      {selectedCase && (
        <CaseModal 
            data={selectedCase} 
            allCases={cases}
            users={users}
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={(updated, log) => updateCase(updated, log, currentUser.name)} 
            onSelectCase={(c) => setSelectedCase(c)}
            onOpenWhatsApp={(c) => setWhatsAppCase(c)} 
        />
      )}
    </div>
  );
};

export default App;
