
import { useState, useMemo, useEffect, useCallback, useDeferredValue } from 'react';
import { Case, ViewType, TransitionType, Task, Notification, DocumentTemplate, SystemLog, User, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule, Appointment } from '../types';
import { COLUMNS_BY_VIEW, TRANSITION_RULES, COMMON_DOCUMENTS, DEFAULT_INSS_AGENCIES, WHATSAPP_TEMPLATES as DEFAULT_WA_TEMPLATES, DEFAULT_DOCUMENT_TEMPLATES, ACTION_ZONES } from '../constants';
import { evaluateWorkflowRules, buildSearchIndex, searchCasesByIndex, getLocalDateISOString } from '../utils';
import { db } from '../services/database';

export const useKanban = () => {
  // 1. Data State
  const [cases, setCases] = useState<Case[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [systemTags, setSystemTags] = useState<SystemTag[]>([]);
  const [commonDocs, setCommonDocs] = useState<string[]>(COMMON_DOCUMENTS);
  const [agencies, setAgencies] = useState<INSSAgency[]>(DEFAULT_INSS_AGENCIES);
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<WhatsAppTemplate[]>(DEFAULT_WA_TEMPLATES);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>(DEFAULT_DOCUMENT_TEMPLATES);
  
  // 2. Control State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. UI State
  const [currentView, setCurrentView] = useState<ViewType>('ADMIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // 4. Drag & Drop State
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ caseId: string, targetColId: string } | null>(null);
  const [transitionType, setTransitionType] = useState<TransitionType | null>(null);
  const [zoneConfirmation, setZoneConfirmation] = useState<{ title: string, description: string, isDangerous: boolean, targetColId: string } | null>(null);
  
  // --- REAL-TIME & INITIALIZATION ---
  useEffect(() => {
    // 1. Load Configs ONCE
    const initConfigs = async () => {
      try {
        const [loadedNotifs, loadedLogs, loadedTags, loadedDocs, loadedAgencies, loadedWaTemplates, loadedWorkflow, loadedAppointments, loadedDocTemplates] = await Promise.all([
          db.getNotifications(),
          db.getLogs(),
          db.getTags(),
          db.getCommonDocs(),
          db.getAgencies(),
          db.getWhatsAppTemplates(),
          db.getWorkflowRules(),
          db.getAppointments(),
          db.getTemplates()
        ]);
        
        setNotifications(loadedNotifs);
        setSystemLogs(loadedLogs);
        setSystemTags(loadedTags);
        setCommonDocs(loadedDocs);
        setAgencies(loadedAgencies);
        setWhatsAppTemplates(loadedWaTemplates);
        setWorkflowRules(loadedWorkflow);
        setAppointments(loadedAppointments);
        setDocumentTemplates(loadedDocTemplates);
      } catch (e) {
        console.error("Config load error", e);
      }
    };
    initConfigs();

    // 2. Subscribe to Cases (REAL-TIME)
    setIsLoading(true);
    const unsubscribe = db.subscribeToCases((realTimeCases) => {
        setCases(realTimeCases);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---

  const addCase = useCallback(async (newCase: Case, userName: string) => {
      setIsSaving(true);
      try {
          await db.saveCase(newCase);
          // Auto-Evaluate Rules on Creation (e.g. Apply Tags based on Benefit Type)
          const workflowResult = evaluateWorkflowRules(newCase, workflowRules, newCase.columnId);
          if (Object.keys(workflowResult.updates).length > 0) {
              const updated = { ...newCase, ...workflowResult.updates };
              await db.saveCase(updated);
              // Log Automation
              if(workflowResult.logs.length > 0) {
                  workflowResult.logs.forEach(l => 
                      addSystemLog('Automação', l, 'Robô', 'WORKFLOW')
                  );
              }
          }
      } catch (e: any) { 
          setError("Erro ao salvar novo caso."); 
      } finally { 
          setIsSaving(false); 
      }
  }, [workflowRules]);

  const updateCase = useCallback(async (updatedCase: Case, logMessage?: string, userName?: string): Promise<boolean> => {
      const partialCase = { ...updatedCase, lastUpdate: new Date().toISOString() };
      
      let newLogItem: any = null;
      if (logMessage && userName) {
          newLogItem = { id: `h_${Date.now()}`, date: new Date().toISOString(), user: userName, action: 'Edição', details: logMessage };
      }

      try {
          const finalHistory = newLogItem ? [...(updatedCase.history || []), newLogItem] : updatedCase.history;
          
          await db.saveCase({ ...partialCase, history: finalHistory });
          return true;
      } catch (err: any) {
          console.error("Save failed", err);
          return false;
      }
  }, []);

  const handleDrop = useCallback(async (targetColId: string, currentUser: User | null) => {
      if (!draggedCaseId || !currentUser) return;
      const c = cases.find(x => x.id === draggedCaseId);
      if (!c) return;

      // 1. Resolve Zone using centralized configuration
      // Check if target matches an Action Zone ID
      const actionZone = ACTION_ZONES.find(z => z.id === targetColId);
      
      let actualTargetColId = targetColId;
      let targetView = c.view;

      if (actionZone) {
          // MS Special Logic (Incidental Clone)
          if (actionZone.id === 'zone_ms') {
              const msCase: Case = {
                  ...c,
                  id: `case_ms_${Date.now()}`,
                  internalId: `${c.internalId}-MS`,
                  parentCaseId: c.id,
                  view: 'JUDICIAL',
                  columnId: 'jud_triagem',
                  tags: ['MANDADO DE SEGURANÇA', 'URGENTE'],
                  tasks: [{ id: `t_ms_${Date.now()}`, text: 'Redigir Inicial do MS', completed: false }],
                  history: [{ id: `h_ms_${Date.now()}`, date: new Date().toISOString(), user: currentUser.name, action: 'Criação Incidental', details: 'MS Derivado' }],
                  benefitNumber: undefined, protocolNumber: undefined, files: [], mandadosSeguranca: []
              };
              const updatedSource = { ...c, tags: [...(c.tags || []).filter(t => t !== 'MS SOLICITADO'), 'MS SOLICITADO'] };
              setDraggedCaseId(null);
              await addCase(msCase, 'Sistema (Auto MS)');
              await updateCase(updatedSource, 'Processo incidental de MS criado.', currentUser.name);
              return;
          }

          actualTargetColId = actionZone.targetColumnId;
          targetView = actionZone.targetView;
      }

      if (c.columnId === actualTargetColId && c.view === targetView) return;

      // 2. Check Transitions (Modal)
      const rule = TRANSITION_RULES.find(r => (r.from === c.columnId || r.from === '*') && r.to === actualTargetColId);
      if (rule) { 
          setPendingMove({ caseId: c.id, targetColId: actualTargetColId }); 
          setTransitionType(rule.type); 
          return; 
      }

      // 3. Direct Move
      finalizeMove(c, actualTargetColId, { view: targetView }, `Movido para ${actualTargetColId}`, currentUser.name);
      setDraggedCaseId(null);
  }, [cases, draggedCaseId, updateCase, addCase]);

  // --- WORKFLOW EXECUTION ---
  const finalizeMove = useCallback(async (caseItem: Case, targetColId: string, updates?: Partial<Case>, log?: string, user?: string) => {
      // 1. Apply User Updates
      let finalCaseState = { ...caseItem, ...updates, columnId: targetColId };
      let logsToAdd = log ? [log] : [];

      // 2. WORKFLOW ENGINE (AUTOMATION)
      // Check if entering a new column
      if (caseItem.columnId !== targetColId) {
          const result = evaluateWorkflowRules(finalCaseState, workflowRules, targetColId);
          
          if (result.blocked) {
              alert(`🚫 Bloqueio de Automação:\n${result.blockReason}`);
              setPendingMove(null);
              setTransitionType(null);
              return; // Cancel Move
          }

          // Apply Automation Updates
          finalCaseState = { ...finalCaseState, ...result.updates };
          if (result.logs.length > 0) {
              logsToAdd = [...logsToAdd, ...result.logs];
          }
          if (result.notifications.length > 0) {
              result.notifications.forEach(msg => {
                  const notif: Notification = {
                      id: `n_auto_${Date.now()}`,
                      type: 'INFO',
                      title: 'Robô Automático',
                      description: msg,
                      timestamp: new Date().toISOString(),
                      isRead: false,
                      caseId: caseItem.id
                  };
                  addNotification(notif);
              });
          }
      }

      // 3. Save to DB
      const historyUpdate = logsToAdd.map(l => ({
          id: `h_${Date.now()}_${Math.random()}`,
          date: new Date().toISOString(),
          user: user || 'Sistema',
          action: 'Movimentação',
          details: l
      }));

      await updateCase({ ...finalCaseState, history: [...(finalCaseState.history || []), ...historyUpdate] });
      
      setPendingMove(null);
      setTransitionType(null);
  }, [workflowRules, updateCase]);

  // Actions
  const addNotification = useCallback((n: Notification) => { setNotifications(prev => [n, ...prev]); db.saveNotifications([n, ...notifications]); }, [notifications]);
  const markNotificationAsRead = useCallback((id: string) => { const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n); setNotifications(updated); db.saveNotifications(updated); }, [notifications]);
  const markAllNotificationsAsRead = useCallback(() => { const updated = notifications.map(n => ({ ...n, isRead: true })); setNotifications(updated); db.saveNotifications(updated); }, [notifications]);
  const handleSetSystemTags = useCallback((t: SystemTag[]) => { setSystemTags(t); db.saveTags(t); }, []);
  const handleSetCommonDocs = useCallback((d: string[]) => { setCommonDocs(d); db.saveCommonDocs(d); }, []);
  const handleSetAgencies = useCallback((a: INSSAgency[]) => { setAgencies(a); db.saveAgencies(a); }, []);
  const handleSetWhatsAppTemplates = useCallback((t: WhatsAppTemplate[]) => { setWhatsAppTemplates(t); db.saveWhatsAppTemplates(t); }, []);
  const handleSetWorkflowRules = useCallback((r: WorkflowRule[]) => { setWorkflowRules(r); db.saveWorkflowRules(r); }, []);
  const handleSetDocumentTemplates = useCallback((t: DocumentTemplate[]) => { setDocumentTemplates(t); db.saveTemplates(t); }, []);
  const addSystemLog = useCallback((action: string, details: string, user: string, category: SystemLog['category']) => { const log: SystemLog = { id: `log_${Date.now()}`, date: new Date().toISOString(), user, action, details, category }; setSystemLogs(prev => [log, ...prev]); db.addLog(log); }, []);
  const addAppointment = useCallback((appt: Appointment) => { setAppointments(prev => [...prev, appt]); db.saveAppointment(appt); }, []);
  const cancelAppointment = useCallback((id: string) => { setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a)); const appt = appointments.find(a => a.id === id); if(appt) db.saveAppointment({ ...appt, status: 'CANCELLED' }); }, [appointments]);

  // Derived: Generate Columns + Action Zones for Current View
  const columns = useMemo(() => {
      const standard = COLUMNS_BY_VIEW[currentView] || [];
      
      // Inject Action Zones relevant to this view
      const zones = ACTION_ZONES.filter(z => z.activeInViews === 'ALL' || z.activeInViews.includes(currentView)).map(z => ({
          id: z.id,
          title: z.label,
          color: z.colorClass,
          zoneConfig: z // Pass full config to be used by renderer
      }));

      return [...standard, ...zones];
  }, [currentView]);

  const searchIndex = useMemo(() => buildSearchIndex(cases), [cases]);
  const filteredCases = useMemo(() => {
      const term = deferredSearchTerm;
      const matches = term ? searchCasesByIndex(term, searchIndex, cases) : cases;
      return matches.filter(c => c.view === currentView); 
  }, [cases, searchIndex, currentView, deferredSearchTerm]);

  const casesByColumn = useMemo(() => {
      const map: Record<string, Case[]> = {};
      columns.forEach(col => map[col.id] = []);
      filteredCases.forEach(c => { if (map[c.columnId]) map[c.columnId].push(c); });
      return map;
  }, [filteredCases, columns]);

  return {
      cases, setCases, filteredCases, casesByColumn, recurrencyMap: new Map(),
      currentView, setCurrentView, columns, searchTerm, setSearchTerm,
      responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter, tagFilter, setTagFilter,
      draggedCaseId, setDraggedCaseId, pendingMove, setPendingMove, transitionType, setTransitionType,
      generateInternalId: () => `2024.${Date.now()}`,
      addCase, updateCase, handleDrop, finalizeMove,
      zoneConfirmation, setZoneConfirmation, executeZoneMove: () => {},
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      systemLogs, addSystemLog, systemTags, setSystemTags: handleSetSystemTags,
      commonDocs, setCommonDocs: handleSetCommonDocs, agencies, setAgencies: handleSetAgencies,
      whatsAppTemplates, setWhatsAppTemplates: handleSetWhatsAppTemplates, workflowRules, setWorkflowRules: handleSetWorkflowRules,
      documentTemplates, setDocumentTemplates: handleSetDocumentTemplates,
      appointments, addAppointment, cancelAppointment,
      isLoading, isSaving, error
  };
};
