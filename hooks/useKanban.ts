
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Case, ViewType, TransitionType, Task, Notification, DocumentTemplate, SystemLog, User, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule, Appointment } from '../types';
import { COLUMNS_BY_VIEW, TRANSITION_RULES, COMMON_DOCUMENTS, DEFAULT_INSS_AGENCIES, WHATSAPP_TEMPLATES as DEFAULT_WA_TEMPLATES } from '../constants';
import { getAutomaticUpdatesForColumn, getAge } from '../utils';
import { db } from '../services/database';

export const useKanban = () => {
  // 1. Data State
  const [cases, setCases] = useState<Case[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [systemTags, setSystemTags] = useState<SystemTag[]>([]);
  const [commonDocs, setCommonDocs] = useState<string[]>(COMMON_DOCUMENTS); // Default fallback
  const [agencies, setAgencies] = useState<INSSAgency[]>(DEFAULT_INSS_AGENCIES);
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<WhatsAppTemplate[]>(DEFAULT_WA_TEMPLATES);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]); // NEW STATE
  const [appointments, setAppointments] = useState<Appointment[]>([]); // NEW STATE
  
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

  // 4. Drag & Drop State
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ caseId: string, targetColId: string } | null>(null);
  const [transitionType, setTransitionType] = useState<TransitionType | null>(null);
  const [zoneConfirmation, setZoneConfirmation] = useState<{ title: string, description: string, isDangerous: boolean, targetColId: string } | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [loadedCases, loadedNotifs, loadedTemplates, loadedLogs, loadedTags, loadedDocs, loadedAgencies, loadedWaTemplates, loadedWorkflow, loadedAppointments] = await Promise.all([
          db.getCases(),
          db.getNotifications(),
          db.getTemplates(),
          db.getLogs(),
          db.getTags(),
          db.getCommonDocs(),
          db.getAgencies(),
          db.getWhatsAppTemplates(),
          db.getWorkflowRules(),
          db.getAppointments()
        ]);
        
        setCases(loadedCases);
        setNotifications(loadedNotifs);
        setDocumentTemplates(loadedTemplates);
        setSystemLogs(loadedLogs);
        setSystemTags(loadedTags);
        setCommonDocs(loadedDocs);
        setAgencies(loadedAgencies);
        setWhatsAppTemplates(loadedWaTemplates);
        setWorkflowRules(loadedWorkflow);
        setAppointments(loadedAppointments);
      } catch (err) {
        console.error("Failed to initialize system", err);
        setError("Falha ao carregar dados do sistema.");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // --- PERSISTENCE WRAPPERS ---
  const updateTemplates = async (newTemplates: DocumentTemplate[]) => {
      setDocumentTemplates(newTemplates);
      await db.saveTemplates(newTemplates);
  };

  const updateTags = async (newTags: SystemTag[]) => {
      setSystemTags(newTags);
      await db.saveTags(newTags);
  };

  const updateCommonDocs = async (newDocs: string[]) => {
      setCommonDocs(newDocs);
      await db.saveCommonDocs(newDocs);
  };

  const updateAgencies = async (newAgencies: INSSAgency[]) => {
      setAgencies(newAgencies);
      await db.saveAgencies(newAgencies);
  };

  const updateWhatsAppTemplates = async (newTemplates: WhatsAppTemplate[]) => {
      setWhatsAppTemplates(newTemplates);
      await db.saveWhatsAppTemplates(newTemplates);
  };

  const updateWorkflowRules = async (newRules: WorkflowRule[]) => {
      setWorkflowRules(newRules);
      await db.saveWorkflowRules(newRules);
  };

  // --- HELPERS ---
  const generateInternalId = () => {
      const year = new Date().getFullYear();
      const count = cases.filter(c => c.createdAt.startsWith(String(year))).length + 1;
      return `${year}.${String(count).padStart(3, '0')}`;
  };

  const addNotification = (title: string, description: string, type: Notification['type'] = 'INFO', caseId?: string, recipientId?: string) => {
      const newNotif: Notification = {
          id: `n_${Date.now()}`,
          title, description, type, timestamp: new Date().toISOString(),
          isRead: false, caseId, recipientId
      };
      
      const updated = [newNotif, ...notifications].slice(0, 50);
      setNotifications(updated);
      db.saveNotifications(updated); 
  };

  const markNotificationAsRead = (id: string) => {
      const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      setNotifications(updated);
      db.saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      setNotifications(updated);
      db.saveNotifications(updated);
  };

  const addSystemLog = (action: string, details: string, user: string, category: SystemLog['category']) => {
      const log: SystemLog = {
          id: `sl_${Date.now()}`,
          date: new Date().toISOString(),
          user, action, details, category
      };
      const updatedLogs = [log, ...systemLogs].slice(0, 200);
      setSystemLogs(updatedLogs);
      db.addLog(log);
  };

  // --- AUTOMATION ENGINE (LEGACY) ---
  const applyAutoTags = (c: Case): string[] => {
      const currentTags = new Set(c.tags || []);
      let hasChanges = false;

      systemTags.forEach(tag => {
          if (!tag.rules || tag.rules.length === 0) return;
          const shouldApply = tag.rules.some(rule => {
              if (rule.type === 'BENEFIT_TYPE') return c.benefitType === rule.value;
              if (rule.type === 'AGE_GREATER') {
                  const age = getAge(c.birthDate);
                  return age !== null && age >= Number(rule.value);
              }
              if (rule.type === 'COLUMN_CONTAINS') return c.columnId.includes(String(rule.value));
              return false;
          });

          if (shouldApply && !currentTags.has(tag.label)) {
              currentTags.add(tag.label);
              hasChanges = true;
          }
      });
      return Array.from(currentTags);
  };

  // --- NEW: WORKFLOW ENGINE (Conditions & Actions) ---
  
  // Evaluates a single condition against a case
  const checkCondition = (c: Case, condition: any): boolean => {
      switch (condition.type) {
          case 'TAG_CONTAINS':
              return (c.tags || []).includes(condition.value);
          case 'BENEFIT_TYPE':
              return c.benefitType === condition.value;
          case 'FIELD_EMPTY':
              return !c[condition.value as keyof Case] || c[condition.value as keyof Case] === '';
          case 'FIELD_NOT_EMPTY':
              return !!c[condition.value as keyof Case];
          case 'URGENCY_IS':
              return c.urgency === condition.value;
          default:
              return false;
      }
  };

  // 1. Validation Engine (Blocks movement)
  const validateWorkflow = (c: Case, targetColId: string): string | null => {
      // Find rules for this trigger
      const relevantRules = workflowRules.filter(r => 
          r.isActive && 
          r.trigger === 'COLUMN_ENTER' && 
          r.targetColumnId === targetColId
      );

      for (const rule of relevantRules) {
          // Check conditions (ALL conditions must be met for the rule to apply)
          const conditionsMet = rule.conditions.length === 0 || rule.conditions.every(cond => checkCondition(c, cond));
          
          if (conditionsMet) {
              // Check for BLOCK_MOVE actions
              const blocker = rule.actions.find(a => a.type === 'BLOCK_MOVE');
              if (blocker) {
                  return blocker.payload || 'Movimentação bloqueada por regra de automação.';
              }
          }
      }
      return null; // No blocks
  };

  // 2. Execution Engine (Applies side effects)
  const applyWorkflowActions = (c: Case, targetColId: string, updates: Partial<Case>, log: string): { updates: Partial<Case>, log: string } => {
      const relevantRules = workflowRules.filter(r => 
          r.isActive && 
          r.trigger === 'COLUMN_ENTER' && 
          r.targetColumnId === targetColId
      );

      let newUpdates = { ...updates };
      let newLog = log;

      for (const rule of relevantRules) {
          const conditionsMet = rule.conditions.length === 0 || rule.conditions.every(cond => checkCondition(c, cond));
          
          if (conditionsMet) {
              rule.actions.forEach(action => {
                  if (action.type === 'ADD_TASK') {
                      const taskText = action.payload;
                      const currentTasks = c.tasks || [];
                      // Prevent duplicate tasks
                      if (!currentTasks.some(t => t.text === taskText) && !newUpdates.tasks?.some(t => t.text === taskText)) {
                          const newTask: Task = {
                              id: `t_wf_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                              text: taskText,
                              completed: false
                          };
                          // Merge with existing updates or existing case tasks
                          const baseTasks = newUpdates.tasks || c.tasks || [];
                          newUpdates.tasks = [...baseTasks, newTask];
                          newLog += ` | Tarefa criada: ${taskText}`;
                      }
                  } else if (action.type === 'SET_RESPONSIBLE') {
                      newUpdates.responsibleId = action.payload;
                      newLog += ` | Responsável alterado (Automático).`;
                  } else if (action.type === 'SET_URGENCY') {
                      newUpdates.urgency = action.payload;
                      newLog += ` | Urgência definida para ${action.payload}.`;
                  } else if (action.type === 'ADD_TAG') {
                      const tagToAdd = action.payload;
                      const currentTags = newUpdates.tags || c.tags || [];
                      if (!currentTags.includes(tagToAdd)) {
                          newUpdates.tags = [...currentTags, tagToAdd];
                          newLog += ` | Etiqueta adicionada: ${tagToAdd}`;
                      }
                  } else if (action.type === 'SEND_NOTIFICATION') {
                      const msg = action.payload;
                      addNotification('Alerta de Automação', `${msg} (Caso: ${c.clientName})`, 'WARNING', c.id, c.responsibleId);
                      newLog += ` | Notificação enviada: "${msg}"`;
                  }
              });
          }
      }
      return { updates: newUpdates, log: newLog };
  };

  // --- APPOINTMENTS (NEW) ---
  const addAppointment = async (appt: Appointment) => {
      const exists = appointments.find(a => a.id === appt.id);
      let updatedList;
      if (exists) {
          updatedList = appointments.map(a => a.id === appt.id ? appt : a);
      } else {
          updatedList = [...appointments, appt];
          // Also add notification for lawyer
          addNotification(
              'Novo Agendamento', 
              `Cliente ${appt.clientName} agendado para ${new Date(appt.date).toLocaleDateString()} às ${new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`,
              'INFO',
              appt.caseId,
              appt.lawyerId
          );
      }
      setAppointments(updatedList);
      await db.saveAppointment(appt);
  };

  const cancelAppointment = async (id: string) => {
      const updated = appointments.map(a => a.id === id ? { ...a, status: 'CANCELLED' as const } : a);
      setAppointments(updated);
      const target = appointments.find(a => a.id === id);
      if (target) await db.saveAppointment({ ...target, status: 'CANCELLED' });
  };

  // --- CRUD ACTIONS (ASYNC) ---
  const addCase = async (newCase: Case, userName: string) => {
      setIsSaving(true);
      try {
          const autoTags = applyAutoTags(newCase);
          const caseWithTags = { ...newCase, tags: autoTags };
          
          setCases(prev => [caseWithTags, ...prev]);
          
          await db.saveCase(caseWithTags);
          addSystemLog('Criação de Caso', `Novo caso criado: ${newCase.clientName} (#${newCase.internalId})`, userName, 'SYSTEM');
      } catch (e) {
          setError("Erro ao salvar novo caso.");
      } finally {
          setIsSaving(false);
      }
  };

  const updateCase = async (updatedCase: Case, logMessage?: string, userName?: string, actionType: string = 'Edição') => {
      // Generate new log item if provided
      let newLogItem: any = null;
      if (logMessage && userName) {
          newLogItem = {
              id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              date: new Date().toISOString(),
              user: userName,
              action: actionType,
              details: logMessage
          };
      }

      const autoTags = applyAutoTags(updatedCase);
      const partialCase = { ...updatedCase, tags: autoTags, lastUpdate: new Date().toISOString() };

      // SMART MERGE STATE
      setCases(prev => prev.map(current => {
          if (current.id === partialCase.id) {
              
              // 1. Identify History from Server (Current State)
              const serverHistory = current.history || [];
              const serverHistoryIds = new Set(serverHistory.map(h => h.id));

              // 2. Identify New History added LOCALLY in the partialCase (e.g. from Modal)
              const incomingHistory = partialCase.history || [];
              const newLocalHistory = incomingHistory.filter(h => !serverHistoryIds.has(h.id));

              // 3. Merge: Server History + New Local Items + The Log generated right now
              let finalHistory = [...serverHistory, ...newLocalHistory];
              if (newLogItem) {
                  finalHistory.push(newLogItem);
              }

              // 4. Sort to ensure time order
              finalHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              const finalCase = { ...partialCase, history: finalHistory };
              
              // Fire persistence
              db.saveCase(finalCase).catch(err => {
                  console.error("Save failed", err);
                  setError("Erro ao salvar alterações. Verifique sua conexão.");
              });

              return finalCase;
          }
          return current;
      }));
  };

  // --- DRAG AND DROP LOGIC ---
  const handleDrop = (targetColId: string, currentUser: User | null) => {
      if (!draggedCaseId || !currentUser) return;
      const c = cases.find(x => x.id === draggedCaseId);
      if (!c || c.columnId === targetColId) return;

      // --- WORKFLOW VALIDATION (BLOCKER) ---
      const blockReason = validateWorkflow(c, targetColId);
      if (blockReason) {
          alert(`🚫 BLOQUEIO DE AUTOMAÇÃO\n\n${blockReason}`);
          setDraggedCaseId(null);
          return;
      }

      const rule = TRANSITION_RULES.find(r => (r.from === c.columnId || r.from === '*') && r.to === targetColId);
      if (rule) {
          setPendingMove({ caseId: c.id, targetColId });
          setTransitionType(rule.type);
          return;
      }

      // MANDADO DE SEGURANÇA (CLONE LOGIC)
      if (targetColId === 'zone_ms') {
          const msCopy: Case = {
              ...c,
              id: `c_ms_${Date.now()}`,
              internalId: generateInternalId(), // New ID for MS
              view: 'JUDICIAL',
              columnId: 'jud_triagem',
              tags: [...(c.tags || []), 'MANDADO DE SEGURANÇA'],
              createdAt: new Date().toISOString(),
              lastUpdate: new Date().toISOString(),
              history: [{
                  id: `h_ms_start_${Date.now()}`,
                  date: new Date().toISOString(),
                  user: currentUser.name,
                  action: 'Criação de MS',
                  details: `Processo MS criado a partir do caso #${c.internalId}.`
              }]
          };
          
          addCase(msCopy, currentUser.name);
          
          // Log on original case
          updateCase({ ...c }, 'MS Impetrado: Cópia gerada para o Judicial (Triagem).', currentUser.name, 'Ação Incidental');
          
          addNotification('MS Iniciado', `Cópia do processo ${c.clientName} criada no Judicial para MS.`, 'SUCCESS');
          setDraggedCaseId(null);
          return;
      }

      if (targetColId.includes('arquivo') || targetColId.includes('indeferido')) {
          setZoneConfirmation({
              title: targetColId.includes('arquivo') ? 'Arquivar Processo?' : 'Registrar Indeferimento?',
              description: 'Esta ação moverá o processo para uma área de baixa atividade. Deseja continuar?',
              isDangerous: true,
              targetColId
          });
          return;
      }

      // Zone Routing
      if (targetColId === 'zone_judicial') { finalizeMove(c, 'jud_triagem', { view: 'JUDICIAL' }, 'Movido para fase Judicial', currentUser.name); return; }
      if (targetColId === 'zone_recurso') { finalizeMove(c, 'rec_triagem', { view: 'RECURSO_ADM' }, 'Movido para fase de Recurso', currentUser.name); return; }
      if (targetColId === 'zone_mesa_decisao') { finalizeMove(c, 'mesa_aguardando', { view: 'MESA_DECISAO' }, 'Enviado para Mesa de Decisão', currentUser.name); return; }
      if (targetColId === 'zone_admin') { finalizeMove(c, 'adm_triagem', { view: 'ADMIN' }, 'Retornado ao fluxo Administrativo', currentUser.name); return; }
      if (targetColId === 'zone_arquivo') { finalizeMove(c, 'arq_geral', { view: 'ARCHIVED' }, 'Processo Arquivado', currentUser.name); return; }

      // Direct Move
      finalizeMove(c, targetColId, {}, `Movido de ${c.columnId} para ${targetColId}`, currentUser.name);
  };

  const executeZoneMove = (currentUser: User | null) => {
      if (!zoneConfirmation || !draggedCaseId || !currentUser) return;
      const c = cases.find(x => x.id === draggedCaseId);
      if (c) {
          if (zoneConfirmation.targetColId === 'zone_arquivo') {
              finalizeMove(c, 'arq_geral', { view: 'ARCHIVED' }, `Arquivamento confirmado`, currentUser.name);
          } else {
              finalizeMove(c, zoneConfirmation.targetColId, {}, `Movimentação confirmada para ${zoneConfirmation.targetColId}`, currentUser.name);
          }
      }
      setZoneConfirmation(null);
      setDraggedCaseId(null);
  };

  const finalizeMove = (caseItem: Case, targetColId: string, updates: Partial<Case> = {}, logDetail: string, userName: string) => {
      let finalUpdates = { ...updates, columnId: targetColId, lastUpdate: new Date().toISOString() };
      
      const autoUpdates = getAutomaticUpdatesForColumn(targetColId);
      finalUpdates = { ...finalUpdates, ...autoUpdates };

      if (targetColId === 'adm_exigencia') {
          // Keep deadlineStart if provided by modal, otherwise today
          if (!finalUpdates.deadlineStart) finalUpdates.deadlineStart = new Date().toISOString().slice(0, 10);
          
          if (updates['exigencyDetails']) {
              finalUpdates.exigencyDetails = updates['exigencyDetails'];
              logDetail += ` | Detalhe: "${updates['exigencyDetails']}"`;
          }
      }

      if (targetColId === 'adm_pagamento') {
          finalUpdates.urgency = 'HIGH';
          if (!(caseItem.tags || []).includes('A RECEBER')) {
              finalUpdates.tags = [...(caseItem.tags || []), 'A RECEBER'];
          }
          logDetail += " | Marcado para recebimento.";
      }

      // --- WORKFLOW ACTION EXECUTION ---
      const { updates: workflowUpdates, log: workflowLog } = applyWorkflowActions(caseItem, targetColId, finalUpdates, logDetail);
      
      updateCase({ ...caseItem, ...workflowUpdates }, workflowLog, userName, 'Movimentação');
      setDraggedCaseId(null);
  };

  // --- VIEWS ---
  const columns = useMemo(() => COLUMNS_BY_VIEW[currentView], [currentView]);

  const filteredCases = useMemo(() => {
      return cases.filter(c => {
          if (c.view !== currentView) return false;
          if (searchTerm) {
              const term = searchTerm.toLowerCase();
              const matches = c.clientName.toLowerCase().includes(term) || c.cpf.includes(term) || c.internalId.includes(term) || (c.benefitNumber && c.benefitNumber.includes(term));
              if (!matches) return false;
          }
          if (responsibleFilter && c.responsibleId !== responsibleFilter) return false;
          if (urgencyFilter && c.urgency !== urgencyFilter) return false;
          if (tagFilter && (!c.tags || !c.tags.includes(tagFilter))) return false;
          return true;
      });
  }, [cases, currentView, searchTerm, responsibleFilter, urgencyFilter, tagFilter]);

  const casesByColumn = useMemo(() => {
      const map: Record<string, Case[]> = {};
      columns.forEach(col => map[col.id] = []);
      filteredCases.forEach(c => {
          if (map[c.columnId]) map[c.columnId].push(c);
      });
      return map;
  }, [filteredCases, columns]);

  const recurrencyMap = useMemo(() => {
      const map = new Map<string, number>();
      cases.forEach(c => {
          const key = c.cpf.replace(/\D/g, '');
          map.set(key, (map.get(key) || 0) + 1);
      });
      return map;
  }, [cases]);

  return {
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
      documentTemplates, setDocumentTemplates: updateTemplates,
      systemLogs, addSystemLog,
      systemTags, setSystemTags: updateTags,
      commonDocs, setCommonDocs: updateCommonDocs, 
      agencies, setAgencies: updateAgencies,
      whatsAppTemplates, setWhatsAppTemplates: updateWhatsAppTemplates,
      workflowRules, setWorkflowRules: updateWorkflowRules,
      appointments, addAppointment, cancelAppointment, // EXPORT NEW
      isLoading, isSaving, error
  };
};
