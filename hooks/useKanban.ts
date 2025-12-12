
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Case, ViewType, TransitionType, Task, Notification, DocumentTemplate, SystemLog, User, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule, Appointment } from '../types';
import { COLUMNS_BY_VIEW, TRANSITION_RULES, COMMON_DOCUMENTS, DEFAULT_INSS_AGENCIES, WHATSAPP_TEMPLATES as DEFAULT_WA_TEMPLATES } from '../constants';
import { getAutomaticUpdatesForColumn, getAge, analyzeCaseHealth, getDaysDiff, buildSearchIndex, searchCasesByIndex } from '../utils';
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
        const [loadedCases, loadedNotifs, loadedTemplates, loadedLogs, loadedTags, loadedDocs, loadedAgencies, loadedWaTemplates, loadedWorkflow, loadedAppointments, loadedSettings] = await Promise.all([
          db.getCases(),
          db.getNotifications(),
          db.getTemplates(),
          db.getLogs(),
          db.getTags(),
          db.getCommonDocs(),
          db.getAgencies(),
          db.getWhatsAppTemplates(),
          db.getWorkflowRules(),
          db.getAppointments(),
          db.getSystemSettings()
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

        // --- DAILY AUTOMATION RUNNER (ROBÔ DE ROTINA) ---
        // Runs once on startup to check deadlines and health
        runDailyRoutine(loadedCases, loadedSettings, loadedNotifs);

      } catch (err) {
        console.error("Failed to initialize system", err);
        setError("Falha ao carregar dados do sistema.");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // --- AUTOMATION RUNNER LOGIC ---
  const runDailyRoutine = (currentCases: Case[], settings: any, currentNotifs: Notification[]) => {
      const today = new Date().toISOString().slice(0,10);
      const lastRun = localStorage.getItem('rambo_daily_run');
      
      // Prevent running multiple times per day (simple check)
      if (lastRun === today) return; 

      let newAlerts: Notification[] = [];
      let criticalCount = 0;
      let deadlineCount = 0;
      let periciaCount = 0; // NEW: Track expertise
      let ppCount = 0;

      currentCases.forEach(c => {
          // 1. Check Deadlines (7 days)
          const daysToDeadline = getDaysDiff(c.deadlineEnd);
          if (daysToDeadline !== null && daysToDeadline >= 0 && daysToDeadline <= 7) {
              deadlineCount++;
              if (daysToDeadline <= 3) {
                  newAlerts.push({
                      id: `alert_dl_${c.id}_${Date.now()}`,
                      title: 'Prazo Fatal Iminente',
                      description: `O processo ${c.clientName} vence em ${daysToDeadline === 0 ? 'HOJE' : daysToDeadline + ' dias'}!`,
                      type: 'ALERT',
                      timestamp: new Date().toISOString(),
                      isRead: false,
                      caseId: c.id,
                      recipientId: c.responsibleId
                  });
              }
          }

          // 2. Check UPCOMING PERICIA (NEW)
          if (c.periciaDate) {
              const pDate = new Date(c.periciaDate);
              const now = new Date();
              // Normalize times
              pDate.setHours(0,0,0,0);
              const checkNow = new Date();
              checkNow.setHours(0,0,0,0);
              
              const diffTime = pDate.getTime() - checkNow.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays >= 0 && diffDays <= 2) {
                  periciaCount++;
                  newAlerts.push({
                      id: `alert_pericia_${c.id}_${Date.now()}`,
                      title: '🔔 Lembrar Perícia',
                      description: `${diffDays === 0 ? 'HOJE' : diffDays === 1 ? 'AMANHÃ' : 'Em 2 dias'}: ${c.clientName}. Avise o cliente!`,
                      type: 'WARNING',
                      timestamp: new Date().toISOString(),
                      isRead: false,
                      caseId: c.id,
                      recipientId: c.responsibleId
                  });
              }
          }

          // 3. Check DCB / Extension (NEW LOGIC)
          if ((c.columnId === 'aux_ativo' || c.columnId === 'adm_pagamento') && c.dcbDate && !c.isExtension) {
              const dcbDiff = getDaysDiff(c.dcbDate);
              // Alert range: between 15 and 0 days
              const alertRange = settings.pp_alert_days || 15;
              
              if (dcbDiff !== null && dcbDiff <= alertRange && dcbDiff >= 0) {
                  ppCount++;
                  // Only alert if we haven't already created a specific task for this
                  const hasPPTask = c.tasks?.some(t => t.text.includes('Prorrogação') || t.text.includes('PP'));
                  
                  if (!hasPPTask) {
                      newAlerts.push({
                          id: `alert_pp_${c.id}_${Date.now()}`,
                          title: '⏳ DCB Próxima: Prorrogação?',
                          description: `Benefício de ${c.clientName} cessa em ${dcbDiff} dias. Verifique se precisa de PP.`,
                          type: 'WARNING',
                          timestamp: new Date().toISOString(),
                          isRead: false,
                          caseId: c.id,
                          recipientId: c.responsibleId
                      });
                      
                      // Auto-Create Task Logic is safer to do inside the Case update loop or here if we had write access
                      // Since we can't easily write to DB here without causing re-renders loop if not careful,
                      // we just rely on notification. Ideally, the backend does this.
                  }
              }
          }

          // 4. Check Health (Stagnation)
          const health = analyzeCaseHealth(c, settings);
          if (health.status === 'CRITICAL' || health.status === 'COBWEB') {
              criticalCount++;
          }
      });

      // 5. Create Daily Summary Notification
      if (criticalCount > 0 || deadlineCount > 0 || periciaCount > 0 || ppCount > 0) {
          newAlerts.push({
              id: `daily_summary_${Date.now()}`,
              title: 'Resumo Diário do Robô',
              description: `Bom dia! Hoje temos ${deadlineCount} prazos, ${periciaCount} perícias, ${ppCount} alertas de DCB e ${criticalCount} casos críticos.`,
              type: 'INFO',
              timestamp: new Date().toISOString(),
              isRead: false
          });
      }

      if (newAlerts.length > 0) {
          const updatedNotifs = [...newAlerts, ...currentNotifs].slice(0, 50);
          setNotifications(updatedNotifs);
          db.saveNotifications(updatedNotifs);
      }

      localStorage.setItem('rambo_daily_run', today);
      console.log("Daily Routine executed.");
  };

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
  const checkCondition = (c: Case, condition: any): boolean => {
      switch (condition.type) {
          case 'TAG_CONTAINS': return (c.tags || []).includes(condition.value);
          case 'BENEFIT_TYPE': return c.benefitType === condition.value;
          case 'FIELD_EMPTY': return !c[condition.value as keyof Case] || c[condition.value as keyof Case] === '';
          case 'FIELD_NOT_EMPTY': return !!c[condition.value as keyof Case];
          case 'URGENCY_IS': return c.urgency === condition.value;
          default: return false;
      }
  };

  const validateWorkflow = (c: Case, targetColId: string): string | null => {
      const relevantRules = workflowRules.filter(r => r.isActive && r.trigger === 'COLUMN_ENTER' && r.targetColumnId === targetColId);
      for (const rule of relevantRules) {
          const conditionsMet = rule.conditions.length === 0 || rule.conditions.every(cond => checkCondition(c, cond));
          if (conditionsMet) {
              const blocker = rule.actions.find(a => a.type === 'BLOCK_MOVE');
              if (blocker) return blocker.payload || 'Movimentação bloqueada por regra de automação.';
          }
      }
      return null;
  };

  const applyWorkflowActions = (c: Case, targetColId: string, updates: Partial<Case>, log: string): { updates: Partial<Case>, log: string } => {
      const relevantRules = workflowRules.filter(r => r.isActive && r.trigger === 'COLUMN_ENTER' && r.targetColumnId === targetColId);
      let newUpdates = { ...updates };
      let newLog = log;

      for (const rule of relevantRules) {
          const conditionsMet = rule.conditions.length === 0 || rule.conditions.every(cond => checkCondition(c, cond));
          if (conditionsMet) {
              rule.actions.forEach(action => {
                  if (action.type === 'ADD_TASK') {
                      const taskText = action.payload;
                      const currentTasks = c.tasks || [];
                      if (!currentTasks.some(t => t.text === taskText) && !newUpdates.tasks?.some(t => t.text === taskText)) {
                          const newTask: Task = { id: `t_wf_${Date.now()}_${Math.random().toString(36).substr(2,5)}`, text: taskText, completed: false };
                          const baseTasks = newUpdates.tasks || c.tasks || [];
                          newUpdates.tasks = [...baseTasks, newTask];
                          newLog += ` | Tarefa criada: ${taskText}`;
                      }
                  } else if (action.type === 'SET_RESPONSIBLE') { newUpdates.responsibleId = action.payload; newLog += ` | Responsável alterado (Automático).`; }
                  else if (action.type === 'SET_URGENCY') { newUpdates.urgency = action.payload; newLog += ` | Urgência definida para ${action.payload}.`; }
                  else if (action.type === 'ADD_TAG') {
                      const tagToAdd = action.payload;
                      const currentTags = newUpdates.tags || c.tags || [];
                      if (!currentTags.includes(tagToAdd)) { newUpdates.tags = [...currentTags, tagToAdd]; newLog += ` | Etiqueta adicionada: ${tagToAdd}`; }
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
      if (exists) { updatedList = appointments.map(a => a.id === appt.id ? appt : a); }
      else {
          updatedList = [...appointments, appt];
          addNotification('Novo Agendamento', `Cliente ${appt.clientName} agendado para ${new Date(appt.date).toLocaleDateString()} às ${new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`, 'INFO', appt.caseId, appt.lawyerId);
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

  // --- INTEGRATION: SYNC CASE PERICIA TO APPOINTMENT ---
  const syncPericiaToCalendar = async (c: Case) => {
      if (!c.periciaDate) return;

      const periciaTime = new Date(c.periciaDate);
      const existingAppt = appointments.find(a => a.caseId === c.id && (a.type === 'PERICIA' || a.notes?.includes('Perícia')));
      
      const appt: Appointment = {
          id: existingAppt ? existingAppt.id : `appt_auto_${Date.now()}`,
          caseId: c.id,
          clientName: c.clientName,
          lawyerId: c.responsibleId,
          date: c.periciaDate,
          type: 'VISIT', // Use Visit icon for Pericia
          notes: `PERÍCIA ${c.columnId === 'jud_pericia' ? 'JUDICIAL' : 'ADMINISTRATIVA'}: ${c.periciaLocation || 'Local não informado'}`,
          status: 'SCHEDULED',
          createdAt: new Date().toISOString()
      };

      // Add task reminder if doesn't exist
      let taskUpdates: Partial<Case> = {};
      const reminderText = "Lembrar cliente da Perícia (WhatsApp)";
      if (!c.tasks?.some(t => t.text === reminderText)) {
          const newTask: Task = { id: `t_reminder_${Date.now()}`, text: reminderText, completed: false };
          taskUpdates.tasks = [...(c.tasks || []), newTask];
      }

      await addAppointment(appt);
      if (taskUpdates.tasks) {
          await updateCase({ ...c, ...taskUpdates }, "Integração: Perícia sincronizada na Agenda + Tarefa criada.", "Sistema", "Automação");
      }
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
      } catch (e) { setError("Erro ao salvar novo caso."); } finally { setIsSaving(false); }
  };

  const updateCase = async (updatedCase: Case, logMessage?: string, userName?: string, actionType: string = 'Edição') => {
      let newLogItem: any = null;
      if (logMessage && userName) {
          newLogItem = { id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, date: new Date().toISOString(), user: userName, action: actionType, details: logMessage };
      }

      const autoTags = applyAutoTags(updatedCase);
      const partialCase = { ...updatedCase, tags: autoTags, lastUpdate: new Date().toISOString() };

      setCases(prev => prev.map(current => {
          if (current.id === partialCase.id) {
              // History Merging Logic
              const serverHistory = current.history || [];
              const serverHistoryIds = new Set(serverHistory.map(h => h.id));
              const incomingHistory = partialCase.history || [];
              const newLocalHistory = incomingHistory.filter(h => !serverHistoryIds.has(h.id));
              let finalHistory = [...serverHistory, ...newLocalHistory];
              if (newLogItem) finalHistory.push(newLogItem);
              finalHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

              const finalCase = { ...partialCase, history: finalHistory };
              
              // TRIGGER SIDE EFFECTS
              if (current.periciaDate !== finalCase.periciaDate && finalCase.periciaDate) {
                  // If date changed, sync calendar (background)
                  syncPericiaToCalendar(finalCase);
              }

              db.saveCase(finalCase).catch(err => { console.error("Save failed", err); setError("Erro ao salvar alterações. Verifique sua conexão."); });
              return finalCase;
          }
          return current;
      }));
  };

  const handleDrop = (targetColId: string, currentUser: User | null) => {
      if (!draggedCaseId || !currentUser) return;
      const c = cases.find(x => x.id === draggedCaseId);
      if (!c || c.columnId === targetColId) return;

      const blockReason = validateWorkflow(c, targetColId);
      if (blockReason) { alert(`🚫 BLOQUEIO DE AUTOMAÇÃO\n\n${blockReason}`); setDraggedCaseId(null); return; }

      const rule = TRANSITION_RULES.find(r => (r.from === c.columnId || r.from === '*') && r.to === targetColId);
      if (rule) { setPendingMove({ caseId: c.id, targetColId }); setTransitionType(rule.type); return; }

      if (targetColId === 'zone_ms') {
          const msCopy: Case = { ...c, id: `c_ms_${Date.now()}`, internalId: generateInternalId(), view: 'JUDICIAL', columnId: 'jud_triagem', tags: [...(c.tags || []), 'MANDADO DE SEGURANÇA'], createdAt: new Date().toISOString(), lastUpdate: new Date().toISOString(), history: [{ id: `h_ms_start_${Date.now()}`, date: new Date().toISOString(), user: currentUser.name, action: 'Criação de MS', details: `Processo MS criado a partir do caso #${c.internalId}.` }] };
          addCase(msCopy, currentUser.name);
          updateCase({ ...c }, 'MS Impetrado: Cópia gerada para o Judicial (Triagem).', currentUser.name, 'Ação Incidental');
          addNotification('MS Iniciado', `Cópia do processo ${c.clientName} criada no Judicial para MS.`, 'SUCCESS');
          setDraggedCaseId(null);
          return;
      }

      if (targetColId.includes('arquivo') || targetColId.includes('indeferido')) {
          setZoneConfirmation({ title: targetColId.includes('arquivo') ? 'Arquivar Processo?' : 'Registrar Indeferimento?', description: 'Esta ação moverá o processo para uma área de baixa atividade. Deseja continuar?', isDangerous: true, targetColId });
          return;
      }

      if (targetColId === 'zone_judicial') { finalizeMove(c, 'jud_triagem', { view: 'JUDICIAL' }, 'Movido para fase Judicial', currentUser.name); return; }
      if (targetColId === 'zone_recurso') { finalizeMove(c, 'rec_triagem', { view: 'RECURSO_ADM' }, 'Movido para fase de Recurso', currentUser.name); return; }
      if (targetColId === 'zone_mesa_decisao') { finalizeMove(c, 'mesa_aguardando', { view: 'MESA_DECISAO' }, 'Enviado para Mesa de Decisão', currentUser.name); return; }
      if (targetColId === 'zone_admin') { finalizeMove(c, 'adm_triagem', { view: 'ADMIN' }, 'Retornado ao fluxo Administrativo', currentUser.name); return; }
      if (targetColId === 'zone_arquivo') { finalizeMove(c, 'arq_geral', { view: 'ARCHIVED' }, 'Processo Arquivado', currentUser.name); return; }

      finalizeMove(c, targetColId, {}, `Movido de ${c.columnId} para ${targetColId}`, currentUser.name);
  };

  const executeZoneMove = (currentUser: User | null) => {
      if (!zoneConfirmation || !draggedCaseId || !currentUser) return;
      const c = cases.find(x => x.id === draggedCaseId);
      if (c) {
          if (zoneConfirmation.targetColId === 'zone_arquivo') { finalizeMove(c, 'arq_geral', { view: 'ARCHIVED' }, `Arquivamento confirmado`, currentUser.name); } 
          else { finalizeMove(c, zoneConfirmation.targetColId, {}, `Movimentação confirmada para ${zoneConfirmation.targetColId}`, currentUser.name); }
      }
      setZoneConfirmation(null); setDraggedCaseId(null);
  };

  const finalizeMove = (caseItem: Case, targetColId: string, updates: Partial<Case> = {}, logDetail: string, userName: string) => {
      let finalUpdates = { ...updates, columnId: targetColId, lastUpdate: new Date().toISOString() };
      const autoUpdates = getAutomaticUpdatesForColumn(targetColId);
      finalUpdates = { ...finalUpdates, ...autoUpdates };

      if (targetColId === 'adm_exigencia') {
          if (!finalUpdates.deadlineStart) finalUpdates.deadlineStart = new Date().toISOString().slice(0, 10);
          if (updates['exigencyDetails']) { finalUpdates.exigencyDetails = updates['exigencyDetails']; logDetail += ` | Detalhe: "${updates['exigencyDetails']}"`; }
      }

      if (targetColId === 'adm_pagamento') {
          finalUpdates.urgency = 'HIGH';
          if (!(caseItem.tags || []).includes('A RECEBER')) { finalUpdates.tags = [...(caseItem.tags || []), 'A RECEBER']; }
          logDetail += " | Marcado para recebimento.";
      }

      const { updates: workflowUpdates, log: workflowLog } = applyWorkflowActions(caseItem, targetColId, finalUpdates, logDetail);
      updateCase({ ...caseItem, ...workflowUpdates }, workflowLog, userName, 'Movimentação');
      setDraggedCaseId(null);
  };

  const columns = useMemo(() => COLUMNS_BY_VIEW[currentView], [currentView]);
  const searchIndex = useMemo(() => buildSearchIndex(cases), [cases]);
  const filteredCases = useMemo(() => {
      let matches = searchTerm ? searchCasesByIndex(searchTerm, searchIndex, cases) : cases;
      return matches.filter(c => {
          if (c.view !== currentView) return false;
          if (responsibleFilter && c.responsibleId !== responsibleFilter) return false;
          if (urgencyFilter && c.urgency !== urgencyFilter) return false;
          if (tagFilter && (!c.tags || !c.tags.includes(tagFilter))) return false;
          return true;
      });
  }, [cases, searchIndex, currentView, searchTerm, responsibleFilter, urgencyFilter, tagFilter]);

  const casesByColumn = useMemo(() => {
      const map: Record<string, Case[]> = {};
      columns.forEach(col => map[col.id] = []);
      filteredCases.forEach(c => { if (map[c.columnId]) map[c.columnId].push(c); });
      return map;
  }, [filteredCases, columns]);

  const recurrencyMap = useMemo(() => {
      const map = new Map<string, number>();
      cases.forEach(c => { const key = c.cpf.replace(/\D/g, ''); map.set(key, (map.get(key) || 0) + 1); });
      return map;
  }, [cases]);

  return {
      cases, setCases, filteredCases, casesByColumn, recurrencyMap,
      currentView, setCurrentView, columns, searchTerm, setSearchTerm, 
      responsibleFilter, setResponsibleFilter, urgencyFilter, setUrgencyFilter, tagFilter, setTagFilter,
      draggedCaseId, setDraggedCaseId, pendingMove, setPendingMove, transitionType, setTransitionType,
      generateInternalId, addCase, updateCase, handleDrop, finalizeMove, zoneConfirmation, setZoneConfirmation, executeZoneMove,
      notifications, addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      documentTemplates, setDocumentTemplates: updateTemplates,
      systemLogs, addSystemLog, systemTags, setSystemTags: updateTags,
      commonDocs, setCommonDocs: updateCommonDocs, agencies, setAgencies: updateAgencies,
      whatsAppTemplates, setWhatsAppTemplates: updateWhatsAppTemplates, workflowRules, setWorkflowRules: updateWorkflowRules,
      appointments, addAppointment, cancelAppointment, isLoading, isSaving, error
  };
};
