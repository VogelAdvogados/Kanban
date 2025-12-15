
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Plus, Trash2, Save, FileText, RotateCcw, ArrowLeft, 
    PenTool, CheckSquare, Sparkles, AlertTriangle, LayoutTemplate, Loader2, AlertOctagon
} from 'lucide-react';
import { DocumentTemplate, User, SystemLog, OfficeData } from '../types';
import { DOCUMENT_VARIABLES, DEFAULT_DOCUMENT_TEMPLATES } from '../constants';
import { RichTextEditor, RichTextEditorRef } from './shared/RichTextEditor';
import { db } from '../services/database';

interface TemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onRefreshGlobal?: () => void;
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
  officeData?: OfficeData;
}

type ManagerTab = 'DOCUMENTS' | 'CHECKLIST';

export const TemplatesDialog: React.FC<TemplatesDialogProps> = ({ 
    isOpen, onClose, currentUser, onRefreshGlobal, addSystemLog, officeData 
}) => {
  const [activeTab, setActiveTab] = useState<ManagerTab>('DOCUMENTS');
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [commonDocs, setCommonDocs] = useState<string[]>([]);
  
  // Editor State
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorCategory, setEditorCategory] = useState('OUTROS');
  const editorRef = React.useRef<RichTextEditorRef>(null);

  // Checklist State
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // --- DATA LOADING ---
  useEffect(() => {
      if (isOpen) {
          loadData();
      }
  }, [isOpen]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          const [tpls, docs] = await Promise.all([
              db.getTemplates(),
              db.getCommonDocs()
          ]);
          // Se não tiver nada, carrega os padrões limpos
          setTemplates(tpls && tpls.length > 0 ? tpls : DEFAULT_DOCUMENT_TEMPLATES);
          setCommonDocs(docs);
      } catch (error) {
          console.error("Erro ao carregar dados:", error);
      } finally {
          setIsLoading(false);
      }
  };

  const handleClose = () => {
      if (onRefreshGlobal) onRefreshGlobal();
      onClose();
  };

  // --- ACTIONS ---

  const handleCreateNew = () => {
      const newTemplate: DocumentTemplate = {
          id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title: 'Novo Modelo em Branco',
          category: 'OUTROS',
          content: '<p>Digite aqui o conteúdo do seu documento...</p>',
          lastModified: new Date().toISOString()
      };
      openEditor(newTemplate);
  };

  const openEditor = (tpl: DocumentTemplate) => {
      setSelectedTemplate(tpl);
      setEditorTitle(tpl.title);
      setEditorCategory(tpl.category);
      setIsEditing(true);
  };

  const closeEditor = () => {
      setIsEditing(false);
      setSelectedTemplate(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
      e.stopPropagation();
      e.preventDefault();

      if (window.confirm(`ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o modelo "${title}"?`)) {
          try {
              const newList = templates.filter(t => t.id !== id);
              setTemplates(newList); // Atualiza UI instantaneamente
              await db.saveTemplates(newList); // Salva no banco
              
              if (addSystemLog && currentUser) {
                  addSystemLog('Modelos', `Modelo "${title}" excluído.`, currentUser.name, 'TEMPLATE');
              }
          } catch (error) {
              console.error("Erro ao excluir:", error);
              loadData(); // Reverte em caso de erro
          }
      }
  };

  // --- FUNÇÃO FORCE DELETE ALL (LIMPAR TUDO) ---
  const handleClearAll = async () => {
      if (window.confirm("PERIGO: Isso apagará TODOS os modelos de documentos do sistema. Tem certeza absoluta?")) {
          if (window.confirm("Confirmação final: Todos os modelos serão perdidos.")) {
              try {
                  setTemplates([]);
                  await db.saveTemplates([]);
                  if (addSystemLog && currentUser) {
                      addSystemLog('Modelos', 'Todos os modelos foram apagados (Reset).', currentUser.name, 'TEMPLATE');
                  }
              } catch (e) {
                  console.error(e);
                  alert("Erro ao limpar dados.");
              }
          }
      }
  };

  const handleSaveEditor = async () => {
      if (!selectedTemplate || !editorRef.current) return;
      if (!editorTitle.trim()) {
          alert('O título é obrigatório.');
          return;
      }

      const content = editorRef.current.getRawContent();
      
      const updatedTemplate: DocumentTemplate = {
          ...selectedTemplate,
          title: editorTitle,
          category: editorCategory as any,
          content: content,
          lastModified: new Date().toISOString()
      };

      try {
          let newList: DocumentTemplate[] = [];
          setTemplates(prev => {
              const exists = prev.some(t => t.id === updatedTemplate.id);
              if (exists) {
                  newList = prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
              } else {
                  newList = [...prev, updatedTemplate];
              }
              return newList;
          });

          await db.saveTemplates(newList);
          
          if (addSystemLog && currentUser) {
              addSystemLog('Modelos', `Modelo "${editorTitle}" salvo.`, currentUser.name, 'TEMPLATE');
          }
          
          closeEditor();
      } catch (error) {
          console.error("Erro ao salvar:", error);
          alert("Erro ao salvar no banco de dados.");
      }
  };

  const handleRestoreDefaults = async () => {
      if (window.confirm("Isso irá APAGAR a lista atual e restaurar apenas os modelos originais de fábrica. Dados duplicados serão removidos. Continuar?")) {
          try {
              // SOBRESCREVE tudo com os padrões (Hard Reset para corrigir duplicações)
              const cleanList = [...DEFAULT_DOCUMENT_TEMPLATES];
              
              setTemplates(cleanList);
              await db.saveTemplates(cleanList);
              
              if (addSystemLog && currentUser) {
                  addSystemLog('Modelos', 'Padrões de fábrica restaurados (Hard Reset).', currentUser.name, 'TEMPLATE');
              }
          } catch (error) {
              console.error("Erro ao restaurar:", error);
              alert("Erro ao processar restauração.");
          }
      }
  };

  // --- CHECKLIST ACTIONS ---
  const handleAddChecklist = async () => {
      if (!newChecklistItem.trim()) return;
      const newList = [...commonDocs, newChecklistItem.trim()];
      setCommonDocs(newList);
      await db.saveCommonDocs(newList);
      setNewChecklistItem('');
  };

  const handleDeleteChecklist = async (item: string) => {
      if (window.confirm(`Remover "${item}" da lista?`)) {
          const newList = commonDocs.filter(doc => doc !== item);
          setCommonDocs(newList);
          await db.saveCommonDocs(newList);
      }
  };

  // --- EDITOR HELPERS ---
  const insertVariable = (v: string) => editorRef.current?.insertHtml(v);
  const preventFocus = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(); };
  
  const insertLogo = () => {
      if (officeData?.logo) {
          const html = `<div style="text-align:center; margin-bottom:10px;"><img src="${officeData.logo}" style="max-width: 150px; height: auto;" /></div><p><br></p>`;
          editorRef.current?.insertHtml(html);
      } else {
          alert("Configure a logo na aba 'Escritório' (Ajustes).");
      }
  };

  if (!isOpen) return null;

  // --- EDITOR UI PORTAL ---
  const EditorPortal = isEditing ? (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-slate-900 animate-in fade-in duration-200">
        <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 flex-shrink-0 shadow-md">
            <div className="flex items-center gap-4 flex-1">
                <button onClick={closeEditor} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={24}/>
                </button>
                <div className="flex flex-col flex-1 max-w-2xl">
                    <input 
                        type="text" 
                        className="bg-transparent border-none text-lg font-bold text-white focus:ring-0 p-0 placeholder-slate-500"
                        placeholder="Título do Modelo"
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                    />
                    <div className="flex items-center gap-2 mt-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria:</label>
                        <select 
                            className="bg-transparent text-xs font-bold text-blue-400 outline-none cursor-pointer border-none p-0 focus:ring-0 uppercase"
                            value={editorCategory}
                            onChange={(e) => setEditorCategory(e.target.value)}
                        >
                            <option value="PROCURACAO">Procuração</option>
                            <option value="CONTRATO">Contrato</option>
                            <option value="DECLARACAO">Declaração</option>
                            <option value="REQUERIMENTO">Requerimento</option>
                            <option value="OUTROS">Outros</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleSaveEditor} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md flex items-center gap-2">
                    <Save size={16}/> Salvar
                </button>
            </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative flex">
                <RichTextEditor 
                    ref={editorRef}
                    initialContent={selectedTemplate?.content || ''}
                    theme="dark"
                    showOfficeLogoOption={!!officeData?.logo}
                    onInsertLogo={insertLogo}
                />
            </div>
            <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col z-40 shadow-xl">
                <div className="p-4 border-b border-slate-700 bg-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-500"/> Variáveis
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">Clique para inserir.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {DOCUMENT_VARIABLES.map(v => (
                        <button
                            key={v.key}
                            onMouseDown={preventFocus(() => insertVariable(v.key))}
                            className="w-full text-left px-3 py-2.5 bg-slate-700/50 hover:bg-blue-600/20 border border-slate-600 hover:border-blue-500/50 rounded-lg group transition-all"
                        >
                            <span className="block text-[11px] font-mono text-blue-300 font-bold group-hover:text-blue-200">{v.key}</span>
                            <span className="block text-[10px] text-slate-400 group-hover:text-slate-300">{v.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/10 relative">
            
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <LayoutTemplate className="text-blue-600"/> Gestor de Modelos & Documentos
                    </h2>
                    <p className="text-sm text-slate-500">Crie e edite as minutas utilizadas no gerador de documentos.</p>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={24}/>
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center flex-shrink-0">
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('DOCUMENTS')} 
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'DOCUMENTS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        Modelos Rich Text
                    </button>
                    <button 
                        onClick={() => setActiveTab('CHECKLIST')} 
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'CHECKLIST' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        Checklist Pendências
                    </button>
                </div>
                
                {activeTab === 'DOCUMENTS' && (
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={handleClearAll}
                            className="py-2 px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Apagar todos os modelos (Reset)"
                        >
                            <Trash2 size={14}/> Limpar Tudo
                        </button>
                        <button 
                            type="button"
                            onClick={handleRestoreDefaults} 
                            className="py-2 px-3 bg-white text-slate-500 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <RotateCcw size={14}/> Restaurar Padrões
                        </button>
                        <button 
                            type="button"
                            onClick={handleCreateNew} 
                            className="py-2 px-4 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md transition-colors cursor-pointer"
                        >
                            <Plus size={14}/> Criar Novo
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 kanban-scroll">
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Loader2 size={40} className="animate-spin mb-2"/>
                        <p>Carregando modelos...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'DOCUMENTS' && (
                            <>
                                {templates.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                        <AlertOctagon size={48} className="mb-2 opacity-20"/>
                                        <p className="font-bold">Nenhum modelo encontrado.</p>
                                        <p className="text-xs">Use "Restaurar Padrões" para carregar os modelos originais.</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {templates.map(tpl => (
                                        <div 
                                            key={tpl.id} 
                                            onClick={() => openEditor(tpl)}
                                            className="bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group relative flex flex-col h-48 cursor-pointer overflow-hidden"
                                        >
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                                                        {tpl.category}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-3 group-hover:text-blue-700 transition-colors">
                                                    {tpl.title}
                                                </h4>
                                                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400">
                                                    <PenTool size={12}/> Clique para editar
                                                </div>
                                            </div>

                                            {/* Action Buttons (Absolute to avoid layout shift) */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                                <button 
                                                    onClick={(e) => handleDelete(e, tpl.id, tpl.title)} 
                                                    className="p-1.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg shadow-sm transition-colors cursor-pointer"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                            
                                            {/* BG Decor */}
                                            <FileText size={100} className="absolute -right-6 -bottom-6 text-slate-50 pointer-events-none group-hover:text-blue-50/50 transition-colors opacity-10"/>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'CHECKLIST' && (
                            <div className="max-w-2xl mx-auto w-full">
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex gap-3">
                                    <AlertTriangle className="text-orange-600 flex-shrink-0" size={20}/>
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-800">Gerenciador de Pendências</h4>
                                        <p className="text-xs text-orange-700">Estes itens aparecerão na lista rápida ao solicitar documentos.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Novo Documento (ex: CNIS Completo)..." 
                                        className="flex-1 border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                        value={newChecklistItem}
                                        onChange={(e) => setNewChecklistItem(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                                    />
                                    <button onClick={handleAddChecklist} className="bg-slate-800 text-white px-6 rounded-lg font-bold hover:bg-slate-700">Adicionar</button>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    {commonDocs.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400">Nenhum item na lista.</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {commonDocs.map((doc, idx) => (
                                                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 group">
                                                    <div className="flex items-center gap-3">
                                                        <CheckSquare size={16} className="text-slate-400"/>
                                                        <span className="text-sm font-medium text-slate-700">{doc}</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteChecklist(doc)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

        {isEditing && createPortal(EditorPortal, document.body)}
    </div>
  );
};
