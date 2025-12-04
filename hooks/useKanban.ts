
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Case, ViewType, TransitionType, CaseHistory, Task, Notification } from '../types';
import { INITIAL_CASES, COLUMNS_BY_VIEW, TRANSITION_RULES, JUDICIAL_START_TASKS, USERS } from '../constants';
import { getAutomaticUpdatesForColumn, getDaysDiff } from '../utils';

const STORAGE_KEY = 'rambo_prev_cases_v1';
const NOTIFICATIONS_KEY = 'rambo_prev_notifications_v1';

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
          } catch (e) {
              console.error("Erro ao salvar dados", e);
          }
      }, 1000); 

      return () => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      };
  }, [cases, notifications]);

  // --- NOTIFICATION LOGIC ---
  const addNotification = useCallback((title: string, description: string, type: Notification['type'], caseId?: string) => {
      const newNotif: Notification = {
          id: `n_${Date.now()}`,
          title,
          description,
          type,
          timestamp: new Date().toISOString(),
          isRead: false,
          caseId
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
                  addNotification('Prazo Vencendo!', `O caso ${c.clientName} tem um prazo fatal ${diff === 0 ? 'HOJE' : 'amanhã'}.`, 'WARNING', c.id);
                  alertCount++;
              }
          }
      });
      if(alertCount > 0) sessionStorage.setItem(checkedKey, 'true');
  }, [cases, addNotification]);


  // Computed Columns
  const columns = useMemo(() => COLUMNS_BY_VIEW[currentView], [currentView]);

  // Optimized Filtering
  const filteredCases = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return cases.filter(c => {
        if (c.view !== currentView) return false;
        if (responsibleFilter && c.responsibleId !== responsibleFilter) return false;
        if (urgencyFilter && c.urgency !== urgencyFilter) return false;
        if (term && !(c.clientName.toLowerCase().includes(term) || c.cpf.includes(term))) return false;
        return true;
    });
  }, [cases, currentView, searchTerm, responsibleFilter, urgencyFilter]);

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
            details: 'Ficha criada no sistema.' 
        }]
    };
    setCases(prev => [...prev, finalCase]);
    addNotification('Novo Caso Criado', `${finalCase.clientName} foi adicionado por ${creatorName}.`, 'INFO', finalCase.id);
  }, [addNotification]);

  const updateCase = useCallback((updatedCase: Case, logMessage: string, userName: string) => {
    setCases(prev => prev.map(c => {
        if (c.id !== updatedCase.id) return c;
        
        let history = updatedCase.history;
        if (logMessage) {
            const newHistory: CaseHistory = { 
                id: `h${Date.now()}_upd`, 
                date: new Date().toISOString(), 
                user: userName, 
                action: 'Atualização', 
                details: logMessage 
            };
            history = [...history, newHistory];
        }
        
        return { ...updatedCase, lastUpdate: new Date().toISOString(), history };
    }));
  }, []);

  const finalizeMove = useCallback((caseToMove: Case, targetColumnId: string, extraData: Partial<Case> = {}, logDetail: string = '', userName: string = 'Sistema') => {
      const updatedCase: Case = {
        ...caseToMove, 
        ...extraData, 
        columnId: targetColumnId, 
        lastUpdate: new Date().toISOString(),
        history: [...caseToMove.history, { 
            id: `h${Date.now()}_mov`, 
            date: new Date().toISOString(), 
            user: userName, 
            action: 'Movimentação', 
            details: logDetail 
        }]
      };
      setCases(prev => prev.map(c => c.id === caseToMove.id ? updatedCase : c));
      
      // Generate Notification
      const colName = COLUMNS_BY_VIEW[updatedCase.view]?.find(c => c.id === targetColumnId)?.title || targetColumnId;
      addNotification('Movimentação', `${caseToMove.clientName} foi movido para: ${colName} por ${userName}.`, 'INFO', caseToMove.id);

  }, [addNotification]);

  const executeZoneMove = useCallback((currentUser: { name: string, id: string }) => {
      if (!zoneConfirmation) return;
      const { caseId, targetColId } = zoneConfirmation;
      const caseToMove = cases.find(c => c.id === caseId);
      
      if (!caseToMove) {
          setZoneConfirmation(null);
          return;
      }

      const move = (target: string, data: any, log: string) => finalizeMove(caseToMove, target, data, log, currentUser.name);

      if (targetColId === 'zone_recurso') {
        move('rec_producao', { view: 'RECURSO_ADM', responsibleId: USERS[0].id, responsibleName: USERS[0].name }, 'Enviado para Recurso via Mesa de Decisão.');
      }
      else if (targetColId === 'zone_judicial') {
         const newTasks: Task[] = [
             ...(caseToMove.tasks || []),
             ...JUDICIAL_START_TASKS.map(t => ({...t, id: t.id + '_' + Date.now()}))
         ];
         move('jud_triagem', { view: 'JUDICIAL', tasks: newTasks, urgency: 'HIGH', responsibleId: USERS[1].id, responsibleName: USERS[1].name }, 'Judicializado via Zona de Ação.');
      }
      else if (targetColId === 'zone_arquivo') {
         move('adm_arquivado', { view: 'ADMIN' }, 'Arquivado via Mesa de Decisão.');
      }
      else if (targetColId === 'zone_mesa_decisao') {
        move('mesa_aguardando', { view: 'MESA_DECISAO' }, 'Enviado para Mesa de Decisão via Zona de Ação.');
      }
      else if (targetColId === 'zone_admin') {
         move('adm_triagem', { view: 'ADMIN', responsibleId: USERS[2].id, responsibleName: USERS[2].name }, 'Retornado ao Administrativo via Zona de Ação.');
      }
      else if (targetColId === 'zone_ms') {
        const msTasks: Task[] = [
            ...JUDICIAL_START_TASKS.map(t => ({...t, id: t.id + '_ms_' + Date.now()})), 
            { id: `t_ms_${Date.now()}`, text: 'Comprovar Demora (+120 dias)', completed: false }
        ];

        const msCase: Case = {
            ...caseToMove,
            id: `c${Date.now()}_ms`,
            internalId: `${caseToMove.internalId}-MS`,
            clientName: `${caseToMove.clientName} (MS - Segurança)`,
            view: 'JUDICIAL',
            columnId: 'jud_triagem', 
            urgency: 'CRITICAL',
            tasks: msTasks,
            history: [{ id: `h_ms_${Date.now()}`, date: new Date().toISOString(), user: currentUser.name, action: 'Criação Automática', details: 'Processo derivado de Mandado de Segurança.' }]
        };

        const updatedOriginal = {
             ...caseToMove,
             history: [...caseToMove.history, { id: `h_orig_${Date.now()}`, date: new Date().toISOString(), user: currentUser.name, action: 'MS Impetrado', details: 'Gerada cópia paralela para Mandado de Segurança.' }]
        };

        setCases(prev => [...prev.map(c => c.id === caseToMove.id ? updatedOriginal : c), msCase]);
        addNotification('Mandado de Segurança', `Novo processo de MS criado para ${caseToMove.clientName}.`, 'WARNING', msCase.id);
      }

      setZoneConfirmation(null);
  }, [zoneConfirmation, cases, finalizeMove, addNotification]);


  const handleDrop = useCallback((targetColumnId: string, currentUser: { name: string, id: string }) => {
    if (!draggedCaseId) return;
    const caseToMove = cases.find(c => c.id === draggedCaseId);
    if (!caseToMove || caseToMove.columnId === targetColumnId) { 
        setDraggedCaseId(null); 
        return; 
    }

    if (targetColumnId.startsWith('zone_')) {
        let title = "Confirmar Ação";
        let description = "Deseja mover este processo?";
        let isDangerous = false;

        if (targetColumnId === 'zone_judicial') {
            title = "Judicializar Processo";
            description = "Isso moverá o caso para o fluxo Judicial, criará tarefas de coleta e mudará a urgência para Alta. Confirmar?";
        }
        else if (targetColumnId === 'zone_recurso') {
            title = "Enviar para Recurso";
            description = "O processo será movido para o fluxo de Recurso Administrativo.";
        }
        else if (targetColumnId === 'zone_arquivo') {
            title = "Arquivar Processo";
            description = "Isso removerá o processo das visões ativas. Deseja arquivar?";
            isDangerous = true;
        }
        else if (targetColumnId === 'zone_ms') {
            title = "Impetrar Mandado de Segurança";
            description = "Isso criará uma CÓPIA do processo no Judicial para o MS, mantendo o original no Administrativo. Confirmar?";
            isDangerous = true;
        }
        else if (targetColumnId === 'zone_mesa_decisao') {
            title = "Enviar p/ Mesa de Decisão";
            description = "Enviar para análise estratégica do advogado sênior?";
        }
        else if (targetColumnId === 'zone_admin') {
            title = "Retornar ao Administrativo";
            description = "O processo voltará para o início do fluxo administrativo. Confirmar?";
        }

        setZoneConfirmation({
            caseId: caseToMove.id,
            targetColId: targetColumnId,
            title,
            description,
            isDangerous
        });
        setDraggedCaseId(null);
        return;
    }

    const rule = TRANSITION_RULES.find(r => 
        (r.from === caseToMove.columnId || r.from === '*') && 
        r.to === targetColumnId
    );
    
    if (rule) {
        setPendingMove({ caseId: caseToMove.id, targetColId: targetColumnId });
        setTransitionType(rule.type);
        setDraggedCaseId(null);
        return;
    }

    const autoUpdates = getAutomaticUpdatesForColumn(targetColumnId);
    finalizeMove(caseToMove, targetColumnId, autoUpdates, 'Movimentação padrão.', currentUser.name);
    setDraggedCaseId(null);
  }, [draggedCaseId, cases, finalizeMove]);

  return {
    cases,
    setCases,
    notifications, // EXPORT
    markNotificationAsRead, // EXPORT
    markAllNotificationsAsRead, // EXPORT
    filteredCases,
    currentView,
    setCurrentView,
    columns,
    searchTerm,
    setSearchTerm,
    responsibleFilter,
    setResponsibleFilter,
    urgencyFilter,
    setUrgencyFilter,
    draggedCaseId,
    setDraggedCaseId,
    pendingMove,
    setPendingMove,
    transitionType,
    setTransitionType,
    generateInternalId,
    addCase,
    updateCase,
    handleDrop,
    finalizeMove,
    zoneConfirmation,
    setZoneConfirmation,
    executeZoneMove
  };
};
