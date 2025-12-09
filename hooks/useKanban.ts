
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Case, ViewType, TransitionType, CaseHistory, Task, Notification, DocumentTemplate, SystemLog } from '../types';
import { INITIAL_CASES, COLUMNS_BY_VIEW, TRANSITION_RULES, DEFAULT_DOCUMENT_TEMPLATES } from '../constants';
import { getAutomaticUpdatesForColumn, getDaysDiff, getDaysSince } from '../utils';

const STORAGE_KEY = 'rambo_prev_cases_v1';
const NOTIFICATIONS_KEY = 'rambo_prev_notifications_v1';
const TEMPLATES_KEY = 'rambo_prev_templates_v1';
const SYSTEM_LOGS_KEY = 'rambo_prev_system_logs_v1';

export const useKanban = () => {
  // 1. Lazy Initialization from LocalStorage
  const [cases, setCases] = useState<Case[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY);
          return saved ? JSON.parse(saved) : INITIAL_CASES;
      } catch (e) {
          console.error("Falha ao carregar dados locais", e);
          return INITIAL_CASES;
      }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>(() => {
      try {
          const saved = localStorage.getItem(NOTIFICATIONS_KEY);
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  // Document Templates State
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>(() => {
      try {
          const saved = localStorage.getItem(TEMPLATES_KEY);
          return saved ? JSON.parse(saved) : DEFAULT_DOCUMENT_TEMPLATES;
      } catch (e) {
          return DEFAULT_DOCUMENT_TEMPLATES;
      }
  });

  // System Logs State (Global Audit)
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => {
      try {
          const saved = localStorage.getItem(SYSTEM_LOGS_KEY);
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  const [currentView, setCurrentView] = useState<ViewType>('ADMIN');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [responsibleFilter, setResponsibleFilter] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');

  // Drag & Drop State
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{caseId: string, targetColId: string} | null>(null);
  const [transitionType, setTransitionType] = useState<TransitionType | null>(null);
  
  // Zone Confirmation State
  const [zoneConfirmation, setZoneConfirmation] = useState<{
      caseId: string;
      targetColId: string;
      title: string;
      description: string;
      isDangerous: boolean;
  } | null>(null);

  // Persistence Debounce Ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2. Debounced Persistence Effect
  useEffect(() => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
              localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
              localStorage.setItem(TEMPLATES_KEY, JSON.stringify(documentTemplates));
              localStorage.setItem(SYSTEM_LOGS_KEY, JSON.stringify(systemLogs));
          } catch (e) {
              console.error("Erro ao salvar dados", e);
          }
      }, 1000); 

      return () => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      };
  }, [cases, notifications, documentTemplates, systemLogs]);

  // --- NOTIFICATION LOGIC ---
  const addNotification = useCallback((title: string, description: string, type: Notification['type'], caseId?: string, recipientId?: string) => {
      const newNotif: Notification = {
          id: `n_${Date.now()}`,
          title,
          description,
          type,
          timestamp: new Date().toISOString(),
          isRead: false,
          caseId,
          recipientId
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // --- SYSTEM LOG LOGIC ---
  const addSystemLog = useCallback((action: string, details: string, user: string, category: SystemLog['category']) => {
      const newLog: SystemLog = {
          id: `sl_${Date.now()}`,
          date: new Date().toISOString(),
          user,
          action,
          details,
          category
      };
      setSystemLogs(prev => [newLog, ...prev]);
  }, []);

  // Check for Deadlines once on mount
  useEffect(() => {
      const checkedKey = `deadline_check_${new Date().toDateString()}`;
      if (sessionStorage.getItem(checkedKey)) return;

      let alertCount = 0;
      cases.forEach(c => {
          if (c.deadlineEnd) {
              const diff = getDaysDiff(c.deadlineEnd);
              if (diff !== null && diff <= 1 && diff >= 0) {
                  // Notifica apenas o responsável pelo caso
                  addNotification('Prazo Vencendo!', `O caso ${c.clientName} tem um prazo fatal ${diff === 0 ? 'HOJE' : 'amanhã'}.`, 'WARNING', c.id, c.responsibleId);
                  alertCount++;
              }
          }
      });
      if(alertCount > 0) sessionStorage.setItem(checkedKey, 'true');
  }, [cases, addNotification]);

  // --- OPTIMIZED DATA DERIVATION ---

  const activeViewCases = useMemo(() => {
      return cases.filter(c => c.view === currentView);
  }, [cases, currentView]);

  const filteredCases = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term && !responsibleFilter && !urgencyFilter) {
        return activeViewCases;
    }

    return activeViewCases.filter(c => {
        if (responsibleFilter && c.responsibleId !== responsibleFilter) return false;
        if (urgencyFilter && c.urgency !== urgencyFilter) return false;
        if (term) {
            const matchesName = c.clientName.toLowerCase().includes(term);
            const matchesCpf = c.cpf.includes(term);
            const matchesInternalId = c.internalId.includes(term);
            const matchesTags = c.tags?.some(t => t.toLowerCase().includes(term));
            
            if (!(matchesName || matchesCpf || matchesInternalId || matchesTags)) return false;
        }
        return true;
    });
  }, [activeViewCases, searchTerm, responsibleFilter, urgencyFilter]);

  const columns = useMemo(() => COLUMNS_BY_VIEW[currentView], [currentView]);

  const casesByColumn = useMemo(() => {
    const map: Record<string, Case[]> = {};
    columns.forEach(col => map[col.id] = []);
    
    filteredCases.forEach(c => {
        if (map[c.columnId]) {
            map[c.columnId].push(c);
        }
    });
    return map;
  }, [filteredCases, columns]);

  const recurrencyMap = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach(c => {
        const key = c.cpf ? c.cpf.replace(/\D/g, '') : '';
        if(key) map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [cases.length]); 

  // --- ACTIONS ---

  const generateInternalId = useCallback(() => {
    const year = new Date().getFullYear();
    const count = cases.length + 1;
    return `${year}.${String(count).padStart(3, '0')}`;
  }, [cases.length]);

  const addCase = useCallback((newCaseData: Case, creatorName: string) => {
    const finalCase = {
        ...newCaseData,
        history: [{ 
            id: `h${Date.now()}`, 
            date: new Date().toISOString(), 
            user: creatorName, 
            action: 'Criação', 
            details: `Ficha interna criada no setor ${newCaseData.view}.`
        }]
    };
    setCases(prev => [finalCase, ...prev]);
    // Notification global (sem recipientId)
    addNotification('Novo Atendimento', `Caso ${finalCase.internalId} iniciado para ${finalCase.clientName} por ${creatorName}.`, 'INFO', finalCase.id);
  }, [addNotification]);

  const updateCase = useCallback((updatedCase: Case, logMessage: string, userName: string) => {
    setCases(prev => prev.map(c => {
        if (c.id === updatedCase.id) {
            // Add history only if there's a message, or handle standard updates
            let newHistory = [...c.history];
            if (logMessage) {
                newHistory.push({
                    id: `h_upd_${Date.now()}`,
                    date: new Date().toISOString(),
                    user: userName,
                    action: 'Atualização',
                    details: logMessage
                });
            }
            return { ...updatedCase, history: newHistory, lastUpdate: new Date().toISOString() };
        }
        return c;
    }));
  }, []);

  const finalizeMove = useCallback((c: Case, targetColId: string, specificUpdates: Partial<Case>, logDetails: string, userName: string) => {
      const now = new Date().toISOString();
      
      // TRACEABILITY: Calculate Duration in Previous Stage
      const daysInPrev = getDaysSince(c.lastUpdate);
      const durationLog = daysInPrev !== null && daysInPrev > 0 ? ` (Duração anterior: ${daysInPrev} dias)` : '';

      const historyItem: CaseHistory = {
          id: `h_move_${Date.now()}`,
          date: now,
          user: userName,
          action: 'Movimentação',
          details: `${logDetails}${durationLog}`
      };

      const autoUpdates = getAutomaticUpdatesForColumn(targetColId);

      setCases(prev => prev.map(curr => {
          if (curr.id === c.id) {
              return {
                  ...curr,
                  ...specificUpdates,
                  ...autoUpdates,
                  columnId: targetColId,
                  lastUpdate: now,
                  history: [...curr.history, historyItem]
              };
          }
          return curr;
      }));
  }, []);

  const executeZoneMove = useCallback((currentUser: any) => {
      if (!zoneConfirmation) return;
      const { caseId, targetColId } = zoneConfirmation;
      const c = cases.find(x => x.id === caseId);
      if (!c) return;

      let log = '';
      let updates: Partial<Case> = {};

      if (targetColId === 'zone_judicial') {
          updates = { view: 'JUDICIAL', columnId: 'jud_triagem' };
          log = 'Processo movido para o setor Judicial.';
      } else if (targetColId === 'zone_recurso') {
          updates = { view: 'RECURSO_ADM', columnId: 'rec_triagem' };
          log = 'Processo movido para o setor de Recurso Administrativo.';
      } else if (targetColId === 'zone_mesa_decisao') {
          updates = { view: 'MESA_DECISAO', columnId: 'mesa_aguardando' };
          log = 'Processo enviado para Mesa de Decisão.';
      } else if (targetColId === 'zone_arquivo') {
          updates = { tags: [...(c.tags || []), 'ARQUIVADO'] };
          log = 'Processo arquivado.';
      } else if (targetColId === 'zone_admin') {
          updates = { view: 'ADMIN', columnId: 'adm_triagem' };
          log = 'Processo retornado para o Administrativo.';
      }

      finalizeMove(c, updates.columnId || c.columnId, updates, log, currentUser?.name || 'Sistema');
      setZoneConfirmation(null);
      setDraggedCaseId(null);
  }, [zoneConfirmation, cases, finalizeMove]);

  const handleDrop = useCallback((targetColId: string, currentUser: any) => {
    if (!draggedCaseId) return;
    const c = cases.find(x => x.id === draggedCaseId);
    if (!c) return;

    // 1. Handle Zones
    if (targetColId.startsWith('zone_')) {
        let title = 'Mover Processo';
        let description = 'Tem certeza que deseja mover este processo?';
        let isDangerous = false;

        if (targetColId === 'zone_judicial') {
            title = 'Judicializar Processo';
            description = 'O processo será transferido para o fluxo Judicial. Confirma?';
        } else if (targetColId === 'zone_arquivo') {
            title = 'Arquivar Processo';
            description = 'O processo será removido do fluxo ativo. Confirma?';
            isDangerous = true;
        }

        setZoneConfirmation({ caseId: c.id, targetColId, title, description, isDangerous });
        return;
    }

    // 2. Handle Normal Columns
    const rule = TRANSITION_RULES.find(r => (r.from === c.columnId || r.from === '*') && r.to === targetColId);

    if (rule) {
        setPendingMove({ caseId: c.id, targetColId });
        setTransitionType(rule.type);
    } else {
        // Direct Move
        const targetColTitle = COLUMNS_BY_VIEW[currentView].find(col => col.id === targetColId)?.title || targetColId;
        finalizeMove(c, targetColId, {}, `Movido para ${targetColTitle}`, currentUser?.name || 'Sistema');
    }
    setDraggedCaseId(null);
  }, [draggedCaseId, cases, currentView, finalizeMove]);

  return {
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
  };
};
