
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, FileText, AlertTriangle, MessageSquare, Briefcase, Copy, CheckCircle, Calendar, RefreshCw, ArrowRight, Gavel, Phone, Lock, History, Shield, AlertOctagon, Search, Check, Clock, CheckSquare, Scale, Hash, Award, FolderOpen, ExternalLink, Files, Plus, Send, UploadCloud, Image, Trash2, Paperclip, MessageCircle, Tag, Eye, MousePointerClick, RefreshCcw } from 'lucide-react';
import { Case, ViewType, UrgencyLevel, CaseHistory, Task, SmartAction, User as UserType, CaseFile } from '../types';
import { COLUMNS_BY_VIEW, BENEFIT_OPTIONS, SMART_ACTIONS_CONFIG, VIEW_CONFIG } from '../constants';
import { getDaysSince, formatDate } from '../utils';

interface CaseModalProps {
  data: Case;
  allCases: Case[]; 
  users: UserType[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCase: Case, logMessage: string) => void;
  onSelectCase: (c: Case) => void; 
  onOpenWhatsApp?: (c: Case) => void; 
}

export const CaseModal: React.FC<CaseModalProps> = ({ data, allCases, users, isOpen, onClose, onSave, onSelectCase, onOpenWhatsApp }) => {
  const [formData, setFormData] = useState<Case>({ ...data, tags: data.tags || [] });
  const [currentNote, setCurrentNote] = useState('');
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Use ref to track if it's the initial load to prevent overwriting user input on background syncs
  const initialLoadRef = useRef(data.id);

  // Find ALL cases with same CPF 
  const allClientCases = allCases.filter(c => 
     c.cpf.replace(/\D/g, '') === data.cpf.replace(/\D/g, '')
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    // Only reset form data if the Modal was just opened OR if we switched to a DIFFERENT case ID
    if (isOpen && (initialLoadRef.current !== data.id || !formData.id)) {
        const deepCopiedTasks = data.tasks ? JSON.parse(JSON.stringify(data.tasks)) : [];
        const deepCopiedFiles = data.files ? JSON.parse(JSON.stringify(data.files)) : [];
        const deepCopiedTags = data.tags ? [...data.tags] : [];
        
        setFormData({ ...data, tasks: deepCopiedTasks, files: deepCopiedFiles, tags: deepCopiedTags });
        setCurrentNote('');
        setNewTag('');
        setActiveTab('DETAILS');
        initialLoadRef.current = data.id;
    }
  }, [data.id, isOpen]); 

  if (!isOpen) return null;

  const hasUnsavedChanges = () => {
    const original = JSON.stringify({ ...data, history: [], tags: data.tags || [] });
    const current = JSON.stringify({ ...formData, history: [], tags: formData.tags || [] });
    return original !== current || currentNote.length > 0;
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      const confirm = window.confirm("Existem alterações não salvas. Deseja realmente sair e descartar?");
      if (!confirm) return;
    }
    onClose();
  };

  const handleSave = () => {
    if (!formData.clientName) {
        alert("O Nome do cliente é obrigatório.");
        return;
    }
    let updatedHistory = [...formData.history];
    
    if (formData.govPassword !== data.govPassword) {
        const passwordLog: CaseHistory = {
            id: `h-pass-${Date.now()}`,
            date: new Date().toISOString(),
            user: 'Sistema',
            action: 'Segurança',
            details: `Senha Gov.br alterada.`
        };
        updatedHistory.push(passwordLog);
    }

    if (currentNote.trim()) {
         updatedHistory.push({
            id: `h-note-${Date.now()}`,
            date: new Date().toISOString(),
            user: 'Eu', 
            action: 'Nota Rápida',
            details: currentNote
        });
    }

    const finalCaseData = { ...formData, history: updatedHistory };
    onSave(finalCaseData, ""); 
    onClose();
  };

  const handleAddNote = () => {
      if (!currentNote.trim()) return;
      const newHistoryItem: CaseHistory = {
          id: `h-note-${Date.now()}`,
          date: new Date().toISOString(),
          user: 'Eu',
          action: 'Nota Rápida',
          details: currentNote
      };
      setFormData(prev => ({
          ...prev,
          history: [...prev.history, newHistoryItem]
      }));
      setCurrentNote('');
  };

  // --- FUNÇÃO DE MONITORAMENTO DE RECURSO ---
  const handleQuickCheck = () => {
    // Atualiza apenas o lastCheckedAt, mantendo lastUpdate original (para saber a espera total)
    const checkLog = "Monitoramento: Consulta ao CRPS realizada. Nenhuma nova movimentação detectada.";
    const now = new Date().toISOString();

    const newHistoryItem: CaseHistory = {
        id: `h-check-${Date.now()}`,
        date: now,
        user: 'Eu',
        action: 'Monitoramento',
        details: checkLog
    };
    
    const updatedCase = { 
        ...formData, 
        lastCheckedAt: now, // Atualiza a data da checagem
        history: [...formData.history, newHistoryItem] 
    };
    
    onSave(updatedCase, ""); // Salva sem fechar necessariamente, mas vamos fechar para UX
    onClose(); 
  };

  const copyToClipboard = (text: string | undefined, fieldName: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
      if (onOpenWhatsApp) {
          onOpenWhatsApp(formData);
      } else {
          if (!formData.phone) return;
          const cleanPhone = formData.phone.replace(/\D/g, '');
          if (!cleanPhone) return;
          const finalNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
          window.open(`https://wa.me/${finalNumber}`, '_blank');
      }
  };

  const toggleTask = (taskId: string) => {
     const updatedTasks = formData.tasks?.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
     ) || [];
     setFormData({ ...formData, tasks: updatedTasks });
  };

  const handleAddTag = () => {
      if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
          setFormData(prev => ({
              ...prev,
              tags: [...(prev.tags || []), newTag.trim()]
          }));
          setNewTag('');
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setFormData(prev => ({
          ...prev,
          tags: prev.tags?.filter(t => t !== tagToRemove) || []
      }));
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
      
      const files = Array.from(e.dataTransfer.files);
      if(files.length === 0) return;

      const newCaseFiles: CaseFile[] = files.map((f: File) => ({
          id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: f.name,
          type: f.type,
          size: f.size,
          uploadDate: new Date().toISOString()
      }));

      setFormData(prev => ({
          ...prev,
          files: [...(prev.files || []), ...newCaseFiles]
      }));
  };

  const handleDeleteFile = (fileId: string) => {
      if(window.confirm('Remover este anexo?')) {
          setFormData(prev => ({
              ...prev,
              files: prev.files?.filter(f => f.id !== fileId) || []
          }));
      }
  };

  const executeSmartAction = (action: SmartAction) => {
    if(action.requireConfirmation && !window.confirm(`Confirmar ação: ${action.label}?`)) return;
    
    let newTasks = formData.tasks || [];
    let logDetail = `Fluxo alterado automaticamente: ${action.label}`;

    if (action.tasksToAdd) {
       const uniqueTasks = action.tasksToAdd.map(t => ({
           ...t,
           id: t.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
       }));
       newTasks = [...newTasks, ...uniqueTasks];
       logDetail += ` | Checklist injetado (${uniqueTasks.length} itens).`;
    }

    setFormData({
      ...formData,
      view: action.targetView,
      columnId: action.targetColumnId,
      urgency: action.urgency || formData.urgency,
      tasks: newTasks,
      lastUpdate: new Date().toISOString()
    });
    
    setFormData(prev => ({
        ...prev,
        history: [...prev.history, {
            id: `h-action-${Date.now()}`,
            date: new Date().toISOString(),
            user: 'Sistema',
            action: 'Fluxo',
            details: logDetail
        }]
    }));
  };

  // --- RENDERIZADORES AUXILIARES ---

  const renderSmartActions = () => {
    const { view, columnId } = formData;
    const configKey = `${view}_${columnId}`;
    const smartConfig = SMART_ACTIONS_CONFIG[configKey];

    if (!smartConfig) return null;

    const IconTitle = smartConfig.actions[0]?.icon || AlertTriangle;
    
    const containerClass = view === 'MESA_DECISAO' ? 'bg-fuchsia-50 border-fuchsia-200' : 
                           view === 'ADMIN' ? 'bg-slate-50 border-slate-200' :
                           'bg-blue-50 border-blue-100';

    const textClass = view === 'MESA_DECISAO' ? 'text-fuchsia-900' : 
                      view === 'ADMIN' ? 'text-slate-800' :
                      'text-blue-900';

    return (
        <div className={`${containerClass} p-5 rounded-xl border mt-4 flex flex-col gap-3 shadow-sm`}>
            <h4 className={`text-sm font-bold ${textClass} uppercase flex items-center gap-2`}>
                <IconTitle size={18}/> {smartConfig.title}
            </h4>
            <p className="text-xs text-slate-500 mb-2">
                {smartConfig.description}
            </p>
            
            <div className={`flex ${smartConfig.actions.length > 1 ? 'flex-col gap-2' : 'flex-row'}`}>
                {smartConfig.actions.map((action, idx) => {
                   const ActionIcon = action.icon || ArrowRight;
                   return (
                     <button key={idx} onClick={() => executeSmartAction(action)} className={`w-full py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${action.colorClass}`}>
                        <ActionIcon size={16} /> {action.label}
                     </button>
                   );
                })}
            </div>
        </div>
    );
  };

  // PAINEL DE MONITORAMENTO DE RECURSO
  const renderAppealMonitoring = () => {
      // Regra: Aparece se for Recurso Adm e estiver na coluna 4 (Aguardando Julgamento)
      if (formData.view !== 'RECURSO_ADM' || formData.columnId !== 'rec_aguardando') return null;

      // Cálculo 1: Tempo Total na Fase (Desde que entrou em Aguardando)
      const daysWaitingTotal = getDaysSince(formData.lastUpdate) || 0;

      // Cálculo 2: Tempo desde Última Olhada (Check)
      // Se lastCheckedAt não existe, usa lastUpdate como base inicial
      const daysSinceLastCheck = getDaysSince(formData.lastCheckedAt || formData.lastUpdate) || 0;
      
      const isUrgentCheck = daysSinceLastCheck > 15;
      const borderColor = isUrgentCheck ? 'border-orange-200 bg-orange-50' : 'border-indigo-200 bg-indigo-50';
      const textColor = isUrgentCheck ? 'text-orange-900' : 'text-indigo-900';

      return (
          <div className={`${borderColor} border-2 rounded-xl p-5 mb-4 shadow-sm animate-in fade-in bg-white relative overflow-hidden`}>
              {isUrgentCheck && <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>}
              
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-sm font-bold ${textColor} flex items-center gap-2`}>
                          <Eye size={18} /> Monitoramento do Recurso
                      </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/60 p-2 rounded border border-slate-200/50">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Total Aguardando</p>
                          <p className="text-xl font-bold text-slate-700">{daysWaitingTotal} dias</p>
                      </div>
                      <div className={`p-2 rounded border ${isUrgentCheck ? 'bg-orange-100 border-orange-200' : 'bg-white/60 border-slate-200/50'}`}>
                          <p className={`text-[10px] uppercase font-bold ${isUrgentCheck ? 'text-orange-600' : 'text-slate-400'}`}>Última Espiada</p>
                          <p className={`text-xl font-bold ${isUrgentCheck ? 'text-orange-700' : 'text-slate-700'}`}>
                              {daysSinceLastCheck === 0 ? 'Hoje' : `${daysSinceLastCheck} dias atrás`}
                          </p>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <a 
                          href="https://consultaprocessos.inss.gov.br/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-white border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                          <ExternalLink size={14}/> 1. Abrir Site CRPS
                      </a>
                      <button 
                          onClick={handleQuickCheck}
                          className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                          <RefreshCcw size={14}/> 2. Nada Mudou (Resetar Espiada)
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const isAuxDoenca = formData.view === 'AUX_DOENCA' || formData.benefitType === '31';
  const viewConfig = VIEW_CONFIG[formData.view];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200">
            <div className="px-6 py-4 flex justify-between items-start">
                <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${formData.view === 'JUDICIAL' ? 'bg-purple-100 text-purple-700' : formData.view === 'AUX_DOENCA' ? 'bg-orange-100 text-orange-700' : formData.view === 'RECURSO_ADM' ? 'bg-indigo-100 text-indigo-700' : formData.view === 'MESA_DECISAO' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-blue-100 text-blue-700'}`}>
                            Fluxo: {viewConfig?.label || formData.view}
                        </span>
                        {formData.isExtension && <span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">Prorrogação</span>}
                        {formData.benefitNumber && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase flex items-center gap-1"><Check size={10}/> NB Ativo</span>}
                     </div>
                     <div className="flex items-baseline gap-2">
                         <span className="text-slate-300 font-bold text-2xl">#{formData.internalId}</span>
                         <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                            {formData.clientName}
                         </h2>
                     </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                </button>
            </div>
            
            <div className="flex px-6 gap-6">
                <button onClick={() => setActiveTab('DETAILS')} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'DETAILS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Ficha do Processo</button>
                <button onClick={() => setActiveTab('HISTORY')} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'HISTORY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Histórico Completo ({formData.history.length})</button>
            </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-6">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* LEFT COLUMN (Main Data) */}
              <div className="lg:col-span-2 space-y-4">

                {/* 1. DADOS PESSOAIS & ACESSO GOV */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                      <User size={14} /> Dados Pessoais & Acesso
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo do Cliente</label>
                          <input 
                              type="text" 
                              value={formData.clientName} 
                              onChange={(e) => setFormData({...formData, clientName: e.target.value})} 
                              className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none" 
                              placeholder="Nome completo..."
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF</label>
                          <div className="flex gap-2">
                             <input type="text" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="w-full font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 text-base" placeholder="000.000.000-00"/>
                             <button onClick={() => copyToClipboard(formData.cpf, 'cpf')} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Copiar CPF">{copiedField === 'cpf' ? <CheckCircle size={18}/> : <Copy size={18}/>}</button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / WhatsApp</label>
                          <div className="flex gap-2">
                            <div className="relative w-full">
                                <Phone size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                                <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 text-base" placeholder="(00) 00000-0000"/>
                            </div>
                            <button 
                                onClick={handleOpenWhatsApp}
                                className="flex-shrink-0 w-12 h-[50px] bg-green-50 rounded-lg border border-green-200 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors flex items-center justify-center"
                                title="Iniciar conversa no WhatsApp"
                            >
                                <MessageCircle size={22} />
                            </button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Nascimento</label>
                          <input type="date" value={formData.birthDate || ''} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base text-slate-700"/>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-blue-600 uppercase mb-1 flex justify-between">
                              <span>Senha Gov.br</span>
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Visível</span>
                          </label>
                          <div className="flex gap-2">
                            <div className="relative w-full">
                                    <Lock size={16} className="absolute left-3 top-3.5 text-blue-400"/>
                                    <input type="text" value={formData.govPassword || ''} onChange={(e) => setFormData({...formData, govPassword: e.target.value})} className="w-full pl-10 bg-blue-50/50 border border-blue-200 rounded-lg p-3 text-base font-mono text-slate-700 focus:border-blue-500 transition-colors" placeholder="Senha..."/>
                            </div>
                            <button onClick={() => copyToClipboard(formData.govPassword, 'pass')} className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:text-blue-600 text-blue-400 hover:bg-blue-100 transition-colors" title="Copiar Senha">{copiedField === 'pass' ? <CheckCircle size={18}/> : <Copy size={18}/>}</button>
                          </div>
                      </div>
                   </div>
                </div>

                {/* 2. DADOS DO PROCESSO */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                         <Hash size={14} /> Identificadores do Processo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº Interno</label>
                            <input type="text" disabled value={formData.internalId} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base text-slate-500 font-mono"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº Protocolo INSS</label>
                            <input type="text" value={formData.protocolNumber || ''} onChange={(e) => setFormData({...formData, protocolNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-base focus:border-blue-500"/>
                        </div>
                        
                        {(formData.benefitNumber || formData.view === 'MESA_DECISAO' || formData.view === 'AUX_DOENCA') && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Número do Benefício (NB)</label>
                                <div className="relative">
                                    <Award size={16} className="absolute left-3 top-3.5 text-emerald-500"/>
                                    <input type="text" value={formData.benefitNumber || ''} onChange={(e) => setFormData({...formData, benefitNumber: e.target.value})} className="w-full pl-10 bg-white border border-emerald-200 rounded-lg p-3 text-base font-bold text-emerald-800 focus:border-emerald-500 placeholder-emerald-200" placeholder="Inserir NB se concedido"/>
                                </div>
                            </div>
                        )}

                         {(formData.appealProtocolNumber || formData.view === 'RECURSO_ADM') && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Protocolo de Recurso (Junta)</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-3 top-3.5 text-indigo-500"/>
                                    <input type="text" value={formData.appealProtocolNumber || ''} onChange={(e) => setFormData({...formData, appealProtocolNumber: e.target.value})} className="w-full pl-10 bg-white border border-indigo-200 rounded-lg p-3 text-base font-bold text-indigo-800 focus:border-indigo-500 placeholder-indigo-200" placeholder="Protocolo do Recurso"/>
                                </div>
                            </div>
                        )}

                        {/* DATAS ESPECÍFICAS (PERICIA / DCB) - Exibição e Edição */}
                        {(isAuxDoenca || formData.periciaDate || formData.dcbDate) && (
                            <>
                                <div className="md:col-span-2 border-t border-slate-100 my-2 pt-2"></div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Data da Perícia</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-3.5 text-orange-500"/>
                                        <input 
                                            type="datetime-local" 
                                            value={formData.periciaDate || ''} 
                                            onChange={(e) => setFormData({...formData, periciaDate: e.target.value})} 
                                            className="w-full pl-10 bg-orange-50 border border-orange-200 rounded-lg p-3 text-base font-bold text-orange-800 focus:border-orange-500 outline-none" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-red-600 uppercase mb-1">DCB (Cessação)</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-3.5 text-red-500"/>
                                        <input 
                                            type="date" 
                                            value={formData.dcbDate || ''} 
                                            onChange={(e) => setFormData({...formData, dcbDate: e.target.value})} 
                                            className="w-full pl-10 bg-red-50 border border-red-200 rounded-lg p-3 text-base font-bold text-red-800 focus:border-red-500 outline-none" 
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* --- HISTÓRICO DE PROCESSOS --- */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                   <Files className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 w-32 h-32 transform -rotate-12 pointer-events-none" />
                   
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-50 pb-2 relative z-10">
                      <FolderOpen size={14} /> Histórico de Processos ({allClientCases.length})
                   </h3>

                   <div className="space-y-3 relative z-10">
                       {allClientCases.length === 0 ? (
                            <div className="text-xs text-slate-400">Nenhum processo cadastrado.</div>
                       ) : (
                            allClientCases.map(c => {
                                const isCurrent = c.id === data.id;
                                const viewInfo = VIEW_CONFIG[c.view];
                                const colInfo = COLUMNS_BY_VIEW[c.view].find(col => col.id === c.columnId);

                                return (
                                    <div key={c.id} className={`p-3 rounded-lg border flex items-center justify-between ${isCurrent ? 'bg-blue-50/50 border-blue-200 shadow-inner' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md transition-all'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isCurrent ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {viewInfo?.icon && <viewInfo.icon size={16} />}
                                            </div>
                                            <div>
                                                 <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-800">#{c.internalId}</span>
                                                    {isCurrent && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Atual</span>}
                                                    {c.benefitType && <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 rounded">Cod. {c.benefitType}</span>}
                                                 </div>
                                                 <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                     {viewInfo?.label} • <span className="text-slate-700">{colInfo?.title || c.columnId}</span>
                                                 </div>
                                            </div>
                                        </div>
                                        
                                        {!isCurrent && (
                                            <button 
                                                onClick={() => onSelectCase(c)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Abrir este processo"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })
                       )}
                   </div>
                </div>

                {/* 3. TIMELINE & NOTES */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col h-[300px]">
                   <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                     <span className="flex items-center gap-2"><History size={16} className="text-slate-500" /> Linha do Tempo / Notas</span>
                     <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">Mini Histórico</span>
                   </label>
                   
                   <div className="flex gap-2 mb-3">
                        <textarea 
                            className="flex-1 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-300 placeholder-slate-400 resize-none h-14" 
                            placeholder="Adicionar nota rápida..." 
                            value={currentNote} 
                            onChange={(e) => setCurrentNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddNote();
                                }
                            }}
                        ></textarea>
                        <button 
                            onClick={handleAddNote}
                            disabled={!currentNote.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
                        >
                            <Send size={20} />
                        </button>
                   </div>

                   <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scroll">
                        {formData.history.slice().reverse().map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xs">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-700">{item.user}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(item.date).toLocaleString()}</span>
                                </div>
                                <div className="text-slate-600 leading-relaxed">
                                    <span className="font-bold text-slate-500 uppercase text-[9px] mr-1 border border-slate-100 bg-slate-50 px-1 rounded">{item.action}</span>
                                    {item.details}
                                </div>
                            </div>
                        ))}
                   </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Management & Dates) */}
              <div className="space-y-6">
                  
                  {/* --- DOCUMENTOS DIGITAIS --- */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                          <Paperclip size={14} /> Documentos Digitais
                      </h3>
                      
                      <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDropFile}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${isDraggingFile ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'}`}
                      >
                          <div className="flex flex-col items-center gap-1 text-slate-500 pointer-events-none">
                              <UploadCloud size={24} className={isDraggingFile ? 'text-blue-600' : 'text-slate-400'}/>
                              <p className="text-xs font-medium">Arraste arquivos aqui</p>
                          </div>
                      </div>

                      {formData.files && formData.files.length > 0 && (
                          <div className="mt-4 space-y-2">
                              {formData.files.map(file => (
                                  <div key={file.id} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg hover:shadow-sm transition-shadow group">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                                              {file.type.includes('image') ? <Image size={14}/> : <FileText size={14}/>}
                                          </div>
                                          <div className="min-w-0">
                                              <p className="text-xs font-bold text-slate-700 truncate w-32" title={file.name}>{file.name}</p>
                                          </div>
                                      </div>
                                      <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* MONITORAMENTO RECURSO PANEL (Reimplementado e Movido para cima) */}
                  {renderAppealMonitoring()}

                  {/* SMART ACTIONS */}
                  {renderSmartActions()}

                  {/* CHECKLIST / TASKS */}
                  {formData.tasks && formData.tasks.length > 0 && (
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <CheckSquare size={14} /> Checklist Pendências
                          </h3>
                          <div className="space-y-2">
                              {formData.tasks.map(task => (
                                  <div key={task.id} onClick={() => toggleTask(task.id)} className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${task.completed ? 'bg-slate-50' : 'bg-white border border-slate-100 hover:bg-slate-50'}`}>
                                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                          {task.completed && <Check size={12} className="text-white" />}
                                      </div>
                                      <span className={`text-xs ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>{task.text}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* MANAGEMENT */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Briefcase size={14} /> Gestão
                     </h3>
                     
                     <div className="space-y-4">
                        {/* TAGS */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Etiquetas / Tags</label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <Tag size={14} className="absolute left-3 top-3 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Add tag..." 
                                        className="w-full pl-9 p-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:border-blue-400 outline-none"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    />
                                </div>
                                <button onClick={handleAddTag} className="bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg px-3">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(formData.tags || []).map(tag => (
                                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full flex items-center gap-1 group">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900"><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridade</label>
                            <select value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value as UrgencyLevel})} className={`w-full rounded-md text-base p-3 font-bold border ${formData.urgency === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : formData.urgency === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-700 border-slate-300'}`}>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">Alta</option>
                                <option value="CRITICAL">Urgente</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Responsável</label>
                            <select value={formData.responsibleId} onChange={(e) => { const user = users.find(u => u.id === e.target.value); setFormData({...formData, responsibleId: e.target.value, responsibleName: user?.name || ''}); }} className="w-full border-slate-300 rounded-md text-base p-3 bg-slate-50">
                                {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Espécie de Benefício</label>
                            <select value={formData.benefitType || ''} onChange={(e) => setFormData({...formData, benefitType: e.target.value})} className="w-full border-slate-300 rounded-md text-base p-3 bg-slate-50">
                                <option value="">-- Selecione --</option>
                                {BENEFIT_OPTIONS.map(opt => (<option key={opt.code} value={opt.code}>{opt.label}</option>))}
                            </select>
                         </div>
                     </div>
                  </div>
              </div>
            </div>
          )}
          
          {activeTab === 'HISTORY' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {formData.history.slice().reverse().map((h, idx) => (
                <div key={idx} className="flex gap-4 group">
                   <div className="w-24 pt-1 text-right flex-shrink-0">
                      <div className="text-xs font-bold text-slate-700">{new Date(h.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                   </div>
                   <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative">
                      <div className="absolute top-5 -left-2 w-4 h-4 bg-slate-200 rounded-full border-4 border-slate-100 group-hover:bg-blue-400 transition-colors"></div>
                      <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">{h.action}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><User size={10}/> {h.user}</span>
                      </div>
                      <p className="text-sm text-slate-600">{h.details}</p>
                   </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
            <button onClick={handleClose} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-sm">Fechar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md text-sm flex items-center gap-2"><Save size={18}/> Salvar</button>
        </div>
      </div>
    </div>
  );
};
