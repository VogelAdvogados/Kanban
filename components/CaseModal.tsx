
// ... existing imports
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Clock, AlertTriangle, CheckCircle, FileText, Loader2, CalendarPlus, RefreshCw, AlertOctagon, Link as LinkIcon, Check } from 'lucide-react';
import { Case, User as UserType, WhatsAppTemplate, INSSAgency, SystemSettings } from '../types';
import { VIEW_CONFIG } from '../constants';
import { getPredictiveInsights, validateCPF, generateDiffLog, safeDeepCopy, safeStringify } from '../utils';
import { ConfirmationModal } from './ConfirmationModal';
import { db } from '../services/database'; // Import DB for subscription

// Sub-components
import { ClientInfo } from './case-modal/ClientInfo';
import { CaseTimeline } from './case-modal/CaseTimeline';
import { CaseFiles } from './case-modal/CaseFiles';
import { CaseHistory } from './case-modal/CaseHistory';

// ... interface CaseModalProps ...
interface CaseModalProps {
  data: Case;
  allCases: Case[]; 
  users: UserType[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCase: Case, logMessage: string) => Promise<boolean> | void; 
  onSelectCase: (c: Case) => void; 
  onOpenWhatsApp?: (c: Case) => void; 
  onOpenSchedule?: (c: Case) => void; 
  onOpenDocumentGenerator?: (c: Case) => void; // New prop
  commonDocs?: string[]; 
  whatsAppTemplates?: WhatsAppTemplate[]; 
  agencies?: INSSAgency[]; 
  systemSettings?: SystemSettings; // NEW PROP
}

export const CaseModal: React.FC<CaseModalProps> = ({ 
    data, allCases, users, isOpen, onClose, onSave, onOpenWhatsApp, onOpenSchedule, onOpenDocumentGenerator,
    commonDocs, whatsAppTemplates, agencies, systemSettings 
}) => {
  // SAFE INITIALIZATION
  const [formData, setFormData] = useState<Case>({ ...data, tags: data.tags || [], history: data.history || [] });
  const [pendingNote, setPendingNote] = useState('');
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Concurrency Control State
  const [remoteConflict, setRemoteConflict] = useState<Case | null>(null);
  const [latestRemoteData, setLatestRemoteData] = useState<Case | null>(null);
  
  // Feedback System State
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  // Track original data for Diff generation
  const originalDataRef = useRef<Case>(data);

  // --- PREDICTIVE INTELLIGENCE ---
  const prediction = useMemo(() => {
      return getPredictiveInsights(allCases, data);
  }, [allCases, data]);

  // --- REAL-TIME WATCHER (The Anti-Conflict Mechanism) ---
  useEffect(() => {
      if (!isOpen || !data.id) return;

      // Subscribe to live changes
      const unsubscribe = db.subscribeToCase(data.id, (remoteCase) => {
          // Ignore self-updates (simple check: if content excluding timestamp is same as local current state)
          // We use originalDataRef as the "last known good state"
          
          if (remoteCase.lastUpdate > originalDataRef.current.lastUpdate) {
              
              // Smart check: Is the data actually different?
              const cleanRemote = { ...remoteCase, lastUpdate: '', lastCheckedAt: '' };
              const cleanLocal = { ...originalDataRef.current, lastUpdate: '', lastCheckedAt: '' };
              
              // Only trigger if business data changed (safe stringify)
              if (safeStringify(cleanRemote) !== safeStringify(cleanLocal)) {
                  console.log("Real conflict detected");
                  setRemoteConflict(remoteCase);
                  setLatestRemoteData(remoteCase);
              }
          }
      });

      return () => unsubscribe();
  }, [isOpen, data.id]);

  // Reset form ONLY when Modal OPENS or ID CHANGES
  useEffect(() => {
    if (isOpen) {
        // USE SAFE DEEP COPY HERE
        const cleanData = safeDeepCopy(data);
        
        cleanData.tags = cleanData.tags || [];
        cleanData.history = cleanData.history || [];

        setFormData(cleanData);
        originalDataRef.current = safeDeepCopy(cleanData);
        
        setPendingNote('');
        setFeedback(null);
        setShowExitConfirmation(false);
        setIsSaving(false);
        setRemoteConflict(null);
        setLatestRemoteData(null);
        setLinkCopied(false);
    }
  }, [data.id, isOpen]);

  // Auto-clear feedback
  useEffect(() => {
      if (feedback) {
          const timer = setTimeout(() => setFeedback(null), 4000);
          return () => clearTimeout(timer);
      }
  }, [feedback]);

  if (!isOpen) return null;

  const hasUnsavedChanges = () => {
      if (pendingNote.trim().length > 0) return true;
      return safeStringify(formData) !== safeStringify(originalDataRef.current);
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges()) {
      setShowExitConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          handleCloseRequest();
      }
  };

  const confirmExit = () => {
      setShowExitConfirmation(false);
      onClose();
  };

  const showFeedback = (message: string, type: 'error' | 'success' = 'error') => {
      setFeedback({ message, type });
  };

  const handleCopyLink = () => {
      const url = new URL(window.location.origin);
      url.searchParams.set('cid', data.id);
      navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleResolveConflict = () => {
      if (latestRemoteData) {
          if (hasUnsavedChanges()) {
              if(!window.confirm("Você tem alterações não salvas. Atualizar agora sobrescreverá suas mudanças com a versão mais recente. Deseja continuar?")) {
                  return;
              }
          }
          // Update local state to match remote
          const safeRemote = safeDeepCopy(latestRemoteData);
          safeRemote.tags = safeRemote.tags || [];
          safeRemote.history = safeRemote.history || [];
          
          setFormData(safeRemote);
          originalDataRef.current = safeRemote;
          setRemoteConflict(null);
          showFeedback("Dados sincronizados com sucesso.", "success");
      }
  };

  const handleSave = async () => {
    if (remoteConflict) {
        showFeedback("Não é possível salvar: conflito de versão detectado. Atualize os dados primeiro.", "error");
        return;
    }

    if (!formData.clientName || formData.clientName.trim() === '') { 
        showFeedback("O nome do cliente é obrigatório.", 'error');
        return; 
    }
    
    if (formData.cpf && !validateCPF(formData.cpf)) {
        showFeedback("O CPF informado é inválido. Verifique os dígitos.", 'error');
        return;
    }

    let logMessage = generateDiffLog(originalDataRef.current, formData);
    
    if (logMessage === "" && pendingNote.trim()) {
        logMessage = "Nota adicionada.";
    } 
    
    if (pendingNote.trim()) {
        logMessage = logMessage ? `${logMessage} | Nota: ${pendingNote}` : `Nota: ${pendingNote}`;
        const newHistoryItem = { 
            id: `h-note-save-${Date.now()}`, 
            date: new Date().toISOString(), 
            user: 'Eu', 
            action: 'Nota Rápida', 
            details: pendingNote 
        };
        formData.history = [...(formData.history || []), newHistoryItem];
    }

    if (!logMessage && !hasUnsavedChanges()) {
        logMessage = "Salvamento manual.";
    }

    setIsSaving(true);
    try {
        const finalData = { ...formData };
        const success = await onSave(finalData, logMessage);
        
        if (success !== false) { 
            // CRITICAL FIX: Update reference immediately to match what we saved.
            originalDataRef.current = safeDeepCopy(finalData);
            // We spoof the lastUpdate locally to match what server will likely set
            originalDataRef.current.lastUpdate = new Date().toISOString(); 

            showFeedback("Alterações salvas com sucesso!", 'success');
            setPendingNote('');
            
            setTimeout(() => {
                onClose();
            }, 500);
        } else {
            showFeedback("Erro ao salvar! Verifique a conexão.", 'error');
        }

    } catch (e) {
        console.error(e);
        showFeedback("Erro interno ao salvar. Tente novamente.", 'error');
    } finally {
        setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<Case>) => {
      setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAddNoteToState = async (note: string) => {
      if (remoteConflict) {
          showFeedback("Atualize os dados antes de adicionar notas.", "error");
          return;
      }
      if (!formData.clientName || formData.clientName.trim() === '') { 
        showFeedback("Não é possível salvar notas sem Nome do Cliente.", 'error');
        return; 
      }

      const newHistoryItem = { 
          id: `h-note-${Date.now()}`, 
          date: new Date().toISOString(), 
          user: 'Eu', 
          action: 'Nota Rápida', 
          details: note 
      };
      
      const newHistory = [...(formData.history || []), newHistoryItem];
      const diffLog = generateDiffLog(originalDataRef.current, formData);
      const appLogMessage = diffLog !== "" ? `Alterações via Nota: ${diffLog}` : "";
      const stateToSave = { ...formData, history: newHistory };

      setFormData(stateToSave);
      
      const success = await onSave(stateToSave, appLogMessage);
      
      if (success !== false) {
          originalDataRef.current = safeDeepCopy(stateToSave);
          originalDataRef.current.lastUpdate = new Date().toISOString();
      } else {
          showFeedback("Erro ao salvar nota.", 'error');
      }
  };

  const viewConfig = VIEW_CONFIG[formData.view];

  // ... (rest of render method remains the same)
  return (
    <div 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-0 md:p-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={handleBackdropClick} 
    >
      <div className="bg-slate-100 w-full md:max-w-6xl h-[100dvh] md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 relative">
        
        {/* CONFLICT ALERT BANNER */}
        {remoteConflict && (
            <div className="bg-amber-100 border-b border-amber-200 text-amber-900 px-4 py-3 flex items-center justify-between z-[110] animate-in slide-in-from-top-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <AlertOctagon className="text-amber-600 animate-pulse" size={20}/>
                    <div>
                        <p className="text-sm font-bold">Atenção: Dados desatualizados!</p>
                        <p className="text-xs">Outro usuário modificou este processo enquanto você estava com ele aberto.</p>
                    </div>
                </div>
                <button 
                    onClick={handleResolveConflict}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 flex items-center gap-2 shadow-sm transition-all"
                >
                    <RefreshCw size={14}/> Atualizar Visualização
                </button>
            </div>
        )}

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
                <button 
                    onClick={handleCopyLink}
                    className={`p-2 rounded-full transition-colors ${linkCopied ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 text-slate-400'}`}
                    title="Copiar Link Compartilhável"
                >
                    {linkCopied ? <Check size={18}/> : <LinkIcon size={18}/>}
                </button>
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                {onOpenSchedule && (
                    <button 
                        onClick={() => onOpenSchedule(formData)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 rounded-lg text-xs font-bold transition-colors"
                        title="Agendar atendimento ou compromisso"
                    >
                        <CalendarPlus size={16}/> Agendar
                    </button>
                )}
                
                {onOpenDocumentGenerator && (
                    <button 
                        onClick={() => onOpenDocumentGenerator(formData)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-lg text-xs font-bold transition-colors ml-2"
                        title="Gerar Documento"
                    >
                        <FileText size={16}/> Docs
                    </button>
                )}

                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                <button onClick={handleCloseRequest} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors" title="Fechar (Esc)">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 kanban-scroll bg-slate-50/50 pb-20 md:pb-6 ${remoteConflict ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''}`}>
            <ClientInfo 
                data={formData} 
                onChange={updateFormData} 
                onOpenWhatsApp={onOpenWhatsApp} 
            />
            <CaseTimeline 
                data={formData} 
                onChange={updateFormData} 
                whatsAppTemplates={whatsAppTemplates} // Pass templates here
                agencies={agencies} 
                systemSettings={systemSettings} // PASS SETTINGS TO TIMELINE
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <CaseFiles 
                    data={formData} 
                    onChange={updateFormData} 
                    commonDocs={commonDocs} 
                />
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
                        disabled={isSaving || !!remoteConflict}
                    />
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving || !!remoteConflict}
                    className={`px-4 md:px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 text-sm flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap ${isSaving || !!remoteConflict ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>

        {/* EXIT CONFIRMATION MODAL */}
        {showExitConfirmation && (
            <ConfirmationModal 
                title="Descartar alterações?"
                description="Você fez alterações que ainda não foram salvas. Se sair agora, elas serão perdidas permanentemente."
                confirmLabel="Sair sem Salvar"
                cancelLabel="Continuar Editando"
                onConfirm={confirmExit}
                onCancel={() => setShowExitConfirmation(false)}
                isDangerous={true}
            />
        )}

      </div>
    </div>
  );
};
