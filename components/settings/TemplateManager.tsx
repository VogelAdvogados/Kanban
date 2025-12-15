
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    Plus, Trash2, Save, FileText, RotateCcw, ArrowLeft, 
    PenTool, CheckSquare, Sparkles, AlertTriangle, Download, X, AlertOctagon
} from 'lucide-react';
import { DocumentTemplate, User, SystemLog, OfficeData } from '../../types';
import { DOCUMENT_VARIABLES, DEFAULT_DOCUMENT_TEMPLATES } from '../../constants';
import { RichTextEditor, RichTextEditorRef } from '../shared/RichTextEditor';
import { db } from '../../services/database';

interface TemplateManagerProps {
  templates: DocumentTemplate[];
  setTemplates: (t: DocumentTemplate[]) => void;
  currentUser?: User;
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
  officeData?: OfficeData;
  commonDocs?: string[];
  setCommonDocs?: (docs: string[]) => void;
}

type ManagerTab = 'DOCUMENTS' | 'CHECKLIST';

export const TemplateManager: React.FC<TemplateManagerProps> = ({ 
    templates: initialTemplatesProp, 
    setTemplates: syncParent, 
    currentUser, addSystemLog, showToast, officeData,
    commonDocs = [], setCommonDocs = (_: string[]) => {}
}) => {
  
  // State principal sincronizado com props
  const [renderList, setRenderList] = useState<DocumentTemplate[]>(initialTemplatesProp || []);
  const [activeTab, setActiveTab] = useState<ManagerTab>('DOCUMENTS');

  // Sincroniza estado local se as props mudarem externamente
  useEffect(() => {
      if (initialTemplatesProp) {
          setRenderList(initialTemplatesProp);
      }
  }, [initialTemplatesProp]);

  // Editor State
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorCategory, setEditorCategory] = useState('OUTROS');
  const editorRef = useRef<RichTextEditorRef>(null);

  // Checklist State
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // --- ACTIONS ---

  const handleCreateNew = () => {
      const newTemplate: DocumentTemplate = {
          id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title: 'Novo Modelo',
          category: 'OUTROS',
          content: '<p>Digite o conteúdo do documento...</p>',
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
      e.preventDefault();
      e.stopPropagation();
      
      if (window.confirm(`ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o modelo "${title}"?`)) {
          try {
              const newList = renderList.filter(t => t.id !== id);
              
              // Atualiza UI Local
              setRenderList(newList);
              
              // Atualiza Pai e Banco
              syncParent(newList);
              await db.saveTemplates(newList);

              if (showToast) showToast('Modelo excluído com sucesso.', 'success');
              if (addSystemLog && currentUser) addSystemLog('Gerenciador', `Modelo "${title}" excluído.`, currentUser.name, 'TEMPLATE');
          } catch (error) {
              console.error("Erro ao excluir:", error);
              if (showToast) showToast('Erro ao excluir modelo.', 'error');
          }
      }
  };

  const handleClearAll = async () => {
      if (window.confirm("PERIGO: Isso apagará TODOS os modelos de documentos do sistema. Tem certeza absoluta?")) {
          if (window.confirm("Confirmação final: Todos os modelos serão perdidos.")) {
              try {
                  setRenderList([]);
                  syncParent([]);
                  await db.saveTemplates([]);
                  
                  if (showToast) showToast('Todos os modelos foram apagados.', 'success');
                  if (addSystemLog && currentUser) addSystemLog('Gerenciador', 'Reset total de modelos.', currentUser.name, 'TEMPLATE');
              } catch (e) {
                  console.error(e);
                  if (showToast) showToast('Erro ao limpar dados.', 'error');
              }
          }
      }
  };

  const handleSaveEditor = async () => {
      if (!selectedTemplate || !editorRef.current) return;
      if (!editorTitle.trim()) {
          if (showToast) showToast('Título é obrigatório.', 'error');
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
          let newList = [...renderList];
          const existsIndex = newList.findIndex(t => t.id === updatedTemplate.id);
          
          if (existsIndex >= 0) {
              newList[existsIndex] = updatedTemplate;
          } else {
              newList.push(updatedTemplate);
          }

          setRenderList(newList);
          syncParent(newList);
          await db.saveTemplates(newList);

          if (showToast) showToast('Modelo salvo com sucesso!', 'success');
          closeEditor();
      } catch (error) {
          console.error("Erro ao salvar:", error);
          if (showToast) showToast('Erro ao salvar alteração.', 'error');
      }
  };

  const handleRestoreDefaults = async () => {
      if (window.confirm("Isso irá APAGAR a lista atual e restaurar apenas os modelos originais de fábrica. Dados duplicados serão removidos. Continuar?")) {
          try {
              const cleanList = [...DEFAULT_DOCUMENT_TEMPLATES];
              
              setRenderList(cleanList);
              syncParent(cleanList);
              await db.saveTemplates(cleanList);
              
              if (showToast) showToast('Padrões restaurados (Reset).', 'success');
          } catch (error) {
              console.error("Erro ao restaurar:", error);
              if (showToast) showToast('Erro ao restaurar padrões.', 'error');
          }
      }
  };

  // --- CHECKLIST ---
  const handleAddChecklist = () => {
      if (!newChecklistItem.trim()) return;
      const newList = [...commonDocs, newChecklistItem.trim()];
      setCommonDocs(newList);
      db.saveCommonDocs(newList);
      setNewChecklistItem('');
  };

  const handleDeleteChecklist = (item: string) => {
      if (window.confirm(`Remover "${item}" da lista?`)) {
          const newList = commonDocs.filter(doc => doc !== item);
          setCommonDocs(newList);
          db.saveCommonDocs(newList);
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
          alert("Configure a logo na aba 'Escritório'.");
      }
  };

  // --- RENDER PORTAL ---
  const EditorPortal = isEditing ? (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-900 animate-in fade-in duration-200">
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
                    <p className="text-[10px] text-slate-500 mt-1">Clique para inserir no texto.</p>
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

  // --- RENDER MAIN ---

  return (
    <div className="flex flex-col h-full bg-white relative">
        {/* HEADER TABS */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('DOCUMENTS')} 
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'DOCUMENTS' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Modelos Rich Text
                </button>
                <button 
                    onClick={() => setActiveTab('CHECKLIST')} 
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'CHECKLIST' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Checklist Pendências
                </button>
            </div>
            
            {activeTab === 'DOCUMENTS' && (
                <div className="flex gap-2">
                    <button onClick={handleClearAll} className="py-2 px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-red-100 transition-colors">
                        <Trash2 size={14}/> Limpar Tudo
                    </button>
                    <button onClick={handleRestoreDefaults} className="py-2 px-3 bg-white text-slate-500 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <RotateCcw size={14}/> Restaurar Padrões
                    </button>
                    <button onClick={handleCreateNew} className="py-2 px-4 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md transition-colors">
                        <Plus size={14}/> Criar Novo
                    </button>
                </div>
            )}
        </div>

        {/* CHECKLIST VIEW */}
        {activeTab === 'CHECKLIST' && (
            <div className="max-w-2xl mx-auto w-full p-4 animate-in fade-in">
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex gap-3">
                    <AlertTriangle className="text-orange-600 flex-shrink-0" size={20}/>
                    <div>
                        <h4 className="text-sm font-bold text-orange-800">Gerenciador de Pendências</h4>
                        <p className="text-xs text-orange-700">Itens padrão para solicitar aos clientes.</p>
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        placeholder="Novo Documento (ex: RG, CTPS)..." 
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

        {/* DOCUMENTS GRID VIEW */}
        {activeTab === 'DOCUMENTS' && (
            <div className="h-full flex flex-col">
                {renderList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <FileText size={48} className="mb-4 opacity-20"/>
                        <p className="text-sm font-medium">Nenhum modelo disponível.</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleRestoreDefaults} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-md">
                                <Download size={14}/> Instalar Pacote Inicial
                            </button>
                            <button onClick={handleCreateNew} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md">
                                <Plus size={14}/> Criar Manualmente
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 overflow-y-auto pr-2 custom-scrollbar">
                        {renderList.map(tpl => (
                            <div 
                                key={tpl.id} 
                                className="bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group relative flex flex-col h-40 overflow-hidden"
                            >
                                {/* CLICKABLE AREA FOR EDIT */}
                                <div className="absolute inset-0 cursor-pointer z-0" onClick={() => openEditor(tpl)}></div>

                                {/* CARD CONTENT */}
                                <div className="p-4 flex flex-col h-full pointer-events-none">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide">
                                            {tpl.category}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                                        {tpl.title}
                                    </h4>
                                    <div className="text-[10px] text-slate-400 mt-auto pt-2 border-t border-slate-50 flex items-center gap-1">
                                        <PenTool size={10}/> Clique para editar
                                    </div>
                                </div>

                                {/* ACTION BUTTONS (Z-INDEX 20 PARA FICAR ACIMA DA ÁREA DE CLIQUE) */}
                                <div className="absolute top-2 right-2 z-20 flex gap-1">
                                    <button 
                                        onClick={(e) => handleDelete(e, tpl.id, tpl.title)} 
                                        className="p-1.5 bg-white text-slate-300 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-full shadow-sm transition-all hover:scale-110 cursor-pointer"
                                        title="Excluir Modelo"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>

                                {/* Background Decoration */}
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                                    <FileText size={80}/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {isEditing && createPortal(EditorPortal, document.body)}
    </div>
  );
};
