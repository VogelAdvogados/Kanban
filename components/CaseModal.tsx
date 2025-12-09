

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Case, User as UserType } from '../types';
import { VIEW_CONFIG } from '../constants';
import { getPredictiveInsights, validateCPF, generateDiffLog } from '../utils';

// Sub-components
import { ClientInfo } from './case-modal/ClientInfo';
import { CaseTimeline } from './case-modal/CaseTimeline';
import { CaseFiles } from './case-modal/CaseFiles';
import { CaseHistory } from './case-modal/CaseHistory';

interface CaseModalProps {
  data: Case;
  allCases: Case[]; 
  users: UserType[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCase: Case, logMessage: string) => void;
  onSelectCase: (c: Case) => void; 
  onOpenWhatsApp?: (c: Case) => void; 
  onOpenDocumentGenerator?: (c: Case) => void;
}

export const CaseModal: React.FC<CaseModalProps> = ({ data, allCases, users, isOpen, onClose, onSave, onOpenWhatsApp, onOpenDocumentGenerator }) => {
  const [formData, setFormData] = useState<Case>({ ...data, tags: data.tags || [] });
  const [pendingNote, setPendingNote] = useState('');
  
  // Feedback System State
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  // Track original data for Diff generation
  const originalDataRef = useRef<Case>(data);

  // --- PREDICTIVE INTELLIGENCE ---
  const prediction = useMemo(() => {
      return getPredictiveInsights(allCases, data);
  }, [allCases, data]);

  // Reset form when data prop changes deeply or modal opens
  useEffect(() => {
    if (isOpen) {
        // Deep copy to break references
        const deepCopiedTasks = data.tasks ? JSON.parse(JSON.stringify(data.tasks)) : [];
        const deepCopiedFiles = data.files ? JSON.parse(JSON.stringify(data.files)) : [];
        const deepCopiedTags = data.tags ? [...data.tags] : [];
        const deepCopiedHistory = data.history ? [...data.history] : [];
        const deepCopiedDocs = data.missingDocs ? [...data.missingDocs] : [];
        
        const cleanData = { 
            ...data, 
            tasks: deepCopiedTasks, 
            files: deepCopiedFiles, 
            tags: deepCopiedTags,
            missingDocs: deepCopiedDocs,
            history: deepCopiedHistory
        };
        
        setFormData(cleanData);
        originalDataRef.current = JSON.parse(JSON.stringify(cleanData)); // Set baseline for diff with deep copy
        setPendingNote('');
        setFeedback(null);
    }
  }, [data.id, isOpen]); 

  // Auto-clear feedback after 4 seconds
  useEffect(() => {
      if (feedback) {
          const timer = setTimeout(() => setFeedback(null), 4000);
          return () => clearTimeout(timer);
      }
  }, [feedback]);

  if (!isOpen) return null;

  // Optimized Dirty Check
  const hasUnsavedChanges = () => {
      // Compare against the LATEST SAVED VERSION (originalDataRef), not the stale 'data' prop.
      const original = originalDataRef.current;
      
      if (formData.clientName !== original.clientName) return true;
      if (formData.cpf !== original.cpf) return true;
      if (formData.phone !== original.phone) return true;
      if (pendingNote.trim().length > 0) return true;
      
      // We rely on the save button for granular file/task changes
      return false; 
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      const confirmExit = window.confirm("Existem alterações não salvas. Deseja sair sem salvar?");
      if (!confirmExit) return;
    }
    onClose();
  };

  const showFeedback = (message: string, type: 'error' | 'success' = 'error') => {
      setFeedback({ message, type });
  };

  const handleSave = () => {
    // 1. Validation Logic
    if (!formData.clientName || formData.clientName.trim() === '') { 
        showFeedback("O nome do cliente é obrigatório.", 'error');
        return; 
    }
    
    if (formData.cpf && !validateCPF(formData.cpf)) {
        showFeedback("O CPF informado é inválido. Verifique os dígitos.", 'error');
        return;
    }

    // 2. Generate Intelligent Log (Diff)
    let logMessage = generateDiffLog(originalDataRef.current, formData);
    
    // Check if nothing changed but a note was added
    if (logMessage === "Edição de detalhes." && pendingNote.trim()) {
        logMessage = "Nota adicionada.";
    } else if (pendingNote.trim()) {
        logMessage += " | Nota: " + pendingNote;
    }

    // 3. Prepare Update
    // ... history handled by App.tsx via onSave

    // 4. Execute Save
    try {
        const finalData = { ...formData };
        onSave(finalData, logMessage);
        
        // CRITICAL: Update the baseline reference to the new saved state
        // This ensures subsequent saves don't re-log the same changes
        originalDataRef.current = JSON.parse(JSON.stringify(finalData));
        
        // Show success
        showFeedback("Alterações salvas com sucesso!", 'success');
        setPendingNote('');
        
        // Close modal automatically on save for smoother flow
        setTimeout(() => {
            onClose();
        }, 500);

    } catch (e) {
        console.error(e);
        showFeedback("Erro interno ao salvar. Tente novamente.", 'error');
    }
  };

  const updateFormData = (updates: Partial<Case>) => {
      setFormData(prev => ({ ...prev, ...updates }));
  };

  // Immediate note addition (bypassing the main save button if needed, strictly for history chat)
  const handleAddNoteToState = (note: string) => {
      // Create a temporary history item for display
      const newHistoryItem = { 
          id: `h-note-${Date.now()}`, 
          date: new Date().toISOString(), 
          user: 'Eu', 
          action: 'Nota Rápida', 
          details: note 
      };
      
      const newHistory = [...formData.history, newHistoryItem];
      
      // We update form data locally
      setFormData(prev => ({ 
          ...prev, 
          history: newHistory 
      }));
      
      // AND we trigger an immediate save to persist this note without needing to click "Save Changes"
      // This is a UX choice: Chat/Notes usually save immediately.
      onSave({ ...formData, history: newHistory }, ''); // Empty log message because the history item IS the log
      originalDataRef.current = { ...originalDataRef.current, history: newHistory };
  };

  const viewConfig = VIEW_CONFIG[formData.view];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-0 md:p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-100 w-full md:max-w-6xl h-[100dvh] md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 relative">
        
        {/* FEEDBACK POPUP (TOAST) */}
        {feedback && (
            <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border ${feedback.type === 'error' ? 'bg-red-600 border-red-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
                {feedback.type === 'error' ? <AlertTriangle size={24} className="flex-shrink-0" /> : <CheckCircle size={24} className="flex-shrink-0" />}
                <div>
                    <p className="font-bold text-sm">{feedback.type === 'error' ? 'Atenção' : 'Sucesso'}</p>
                    <p className="text-xs opacity-90">{feedback.message}</p>
                </div>
                <button onClick={() => setFeedback(null)} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={16}/></button>
            </div>
        )}

        {/* HEADER */}
        <div className="bg-white px-4 md:px-6 py-4 border-b border-slate-200 flex justify-between items-start flex-shrink-0">
            <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${formData.view === 'JUDICIAL' ? 'bg-purple-100 text-purple-700' : formData.view === 'RECURSO_ADM' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                       {viewConfig.icon && <viewConfig.icon size={12}/>} {viewConfig?.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-bold">#{formData.internalId}</span>
                    {prediction && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold border border-indigo-100 flex items-center gap-1 hidden sm:flex" title={`Estimativa baseada em ${prediction.sampleSize} casos`}>
                            <Clock size={10} /> Previsão: {prediction.predictedDate}
                        </span>
                    )}
                 </div>
                 <div className="flex items-center gap-2">
                     <input 
                        type="text" 
                        value={formData.clientName} 
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                        className="text-2xl font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full placeholder-slate-300 focus:underline decoration-slate-200 focus:decoration-blue-300 underline-offset-4"
                        placeholder="Nome do Cliente"
                     />
                 </div>
            </div>
            <div className="flex gap-2 items-center">
                {onOpenDocumentGenerator && (
                    <button 
                        onClick={() => onOpenDocumentGenerator(formData)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                        title="Gerar Documento (Procuração, Contrato...)"
                    >
                        <FileText size={16}/> Gerar Doc
                    </button>
                )}
                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors" title="Fechar (Esc)">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* MAIN CONTENT - SINGLE SCROLL VIEW */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 kanban-scroll bg-slate-50/50 pb-20 md:pb-6">
            
            {/* 1. DADOS DE ACESSO RÁPIDO E FICHA COMPLETA */}
            <ClientInfo 
                data={formData} 
                onChange={updateFormData} 
                onOpenWhatsApp={onOpenWhatsApp} 
            />

            {/* 2. DADOS DO PROCESSO (TIMELINE) */}
            <CaseTimeline 
                data={formData} 
                onChange={updateFormData} 
            />

            {/* 3. SPLIT VIEW: FILES & NOTES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                
                {/* LEFT: FILES & TAGS */}
                <CaseFiles 
                    data={formData} 
                    onChange={updateFormData} 
                />

                {/* RIGHT: CHAT & HISTORY */}
                <CaseHistory 
                    data={formData} 
                    onAddNote={handleAddNoteToState} 
                />

            </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white px-4 md:px-6 py-4 border-t border-slate-200 flex justify-between items-center md:rounded-b-2xl flex-shrink-0 z-10 sticky bottom-0 md:relative">
            <div className="text-xs text-slate-400 hidden sm:block">
                Última atualização: {new Date(formData.lastUpdate).toLocaleString()}
            </div>
            <div className="flex gap-3 ml-auto w-full md:w-auto">
                <div className="flex items-center bg-slate-100 rounded-lg px-2 flex-1 md:flex-none">
                    <input 
                        type="text" 
                        placeholder="Nota rápida..." 
                        value={pendingNote}
                        onChange={(e) => setPendingNote(e.target.value)}
                        className="bg-transparent border-none text-sm focus:ring-0 w-full md:w-64"
                    />
                </div>
                <button onClick={handleSave} className="px-4 md:px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 text-sm flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap">
                    <Save size={18}/> Salvar
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
