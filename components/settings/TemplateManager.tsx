
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, ChevronRight, Undo, Redo, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Sparkles, Table, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { DocumentTemplate, User, SystemLog, OfficeData } from '../../types';
import { DOCUMENT_VARIABLES } from '../../constants';

interface TemplateManagerProps {
  templates: DocumentTemplate[];
  setTemplates: (t: DocumentTemplate[]) => void;
  currentUser?: User;
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
  officeData?: OfficeData;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, setTemplates, currentUser, addSystemLog, showToast, officeData }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DocumentTemplate>>({});
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editForm.content !== undefined) {
        if (editorRef.current.innerHTML !== editForm.content) {
             editorRef.current.innerHTML = editForm.content;
        }
    }
  }, [selectedId]); 

  const handleSelect = (t: DocumentTemplate) => {
      setSelectedId(t.id);
      setEditForm({ ...t });
  };

  const handleNew = () => {
      const newId = `tpl_custom_${Date.now()}`;
      const newTemplate: DocumentTemplate = {
          id: newId,
          title: 'Novo Modelo',
          category: 'OUTROS',
          content: '<p>Digite o conteúdo do documento aqui...</p><p><br></p><p>Use as variáveis ao lado para preencher automaticamente.</p>',
          lastModified: new Date().toISOString()
      };
      setEditForm(newTemplate);
      setSelectedId(newId);
  };

  const handleSave = () => {
      if (!editForm.title || !editorRef.current) return;
      
      const content = editorRef.current.innerHTML;
      const newTpl = { ...editForm, content, lastModified: new Date().toISOString() } as DocumentTemplate;
      
      const exists = templates.find(t => t.id === newTpl.id);
      
      // Audit Log Logic
      if (addSystemLog && currentUser) {
          if (exists) {
              addSystemLog('Edição de Modelo', `Modelo "${newTpl.title}" atualizado.`, currentUser.name, 'TEMPLATE');
          } else {
              addSystemLog('Criação de Modelo', `Novo modelo "${newTpl.title}" criado.`, currentUser.name, 'TEMPLATE');
          }
      }

      if (exists) {
          setTemplates(templates.map(t => t.id === newTpl.id ? newTpl : t));
      } else {
          setTemplates([...templates, newTpl]);
      }
      
      if (showToast) {
          showToast('Modelo salvo com sucesso!', 'success');
      } else {
          alert('Modelo salvo com sucesso!');
      }
  };

  const handleDelete = () => {
      if (!selectedId) return;
      if (confirm('Tem certeza que deseja excluir este modelo?')) {
          const tpl = templates.find(t => t.id === selectedId);
          
          if (addSystemLog && currentUser && tpl) {
              addSystemLog('Exclusão de Modelo', `Modelo "${tpl.title}" excluído permanentemente.`, currentUser.name, 'TEMPLATE');
          }

          setTemplates(templates.filter(t => t.id !== selectedId));
          setSelectedId(null);
          setEditForm({});

          if (showToast) {
              showToast('Modelo removido.', 'success');
          }
      }
  };

  const insertVariable = (variable: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (!editorRef.current.contains(range.commonAncestorContainer)) return;
          range.deleteContents();
          const textNode = document.createTextNode(variable);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel.removeAllRanges();
          sel.addRange(range);
      }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

   // --- TABLE MANIPULATION ---
   const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; border: 1px solid black; margin-bottom: 1em;" border="1">
        <tbody>
          <tr>
            <td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td>
            <td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td>
            <td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    execCmd('insertHTML', tableHTML);
    setShowTableMenu(false);
  };

  const modifyTable = (action: 'addRow' | 'addCol' | 'delRow' | 'delCol') => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      let node = range.startContainer as HTMLElement | null;
      while (node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
          if (node.nodeName === 'DIV' && node.id === 'editor') return;
          node = node.parentElement;
      }
      if (!node) { alert("Clique dentro de uma tabela para editar."); return; }
      
      const td = node as HTMLTableCellElement;
      const tr = td.parentElement as HTMLTableRowElement;
      const table = tr.parentElement?.parentElement as HTMLTableElement;
      
      const cellIndex = td.cellIndex;
      const rowIndex = tr.rowIndex;

      if (action === 'addRow') {
          const newRow = table.insertRow(rowIndex + 1);
          for (let i = 0; i < tr.cells.length; i++) {
              const newCell = newRow.insertCell(i);
              newCell.style.border = '1px solid #ccc';
              newCell.style.padding = '5px';
              newCell.innerHTML = '&nbsp;';
          }
      } else if (action === 'addCol') {
          for (let i = 0; i < table.rows.length; i++) {
              const newCell = table.rows[i].insertCell(cellIndex + 1);
              newCell.style.border = '1px solid #ccc';
              newCell.style.padding = '5px';
              newCell.innerHTML = '&nbsp;';
          }
      } else if (action === 'delRow') {
          table.deleteRow(rowIndex);
      } else if (action === 'delCol') {
          for (let i = 0; i < table.rows.length; i++) {
              if (table.rows[i].cells.length > cellIndex) {
                  table.rows[i].deleteCell(cellIndex);
              }
          }
      }
      setShowTableMenu(false);
  };

  // --- IMAGE & LOGO MANIPULATION ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              execCmd('insertImage', ev.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
      setShowImageMenu(false);
  };

  const insertLogo = () => {
      if (officeData?.logo) {
          const html = `<img src="${officeData.logo}" style="max-width: 200px; height: auto;" />`;
          execCmd('insertHTML', html);
      } else {
          alert('Nenhuma logo configurada nas opções do escritório.');
      }
  };

  const insertImageUrl = () => {
      const url = prompt("Cole a URL da imagem:");
      if (url) execCmd('insertImage', url);
      setShowImageMenu(false);
  };

  return (
    <div className="flex h-full gap-6">
        {/* LIST */}
        <div className="w-64 flex flex-col border-r border-slate-100 pr-4">
            <button 
                onClick={handleNew}
                className="mb-4 w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm"
            >
                <Plus size={14}/> Criar Novo Modelo
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
                {templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between group ${selectedId === t.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                    >
                        <span className="truncate">{t.title}</span>
                        {selectedId === t.id && <ChevronRight size={12}/>}
                    </button>
                ))}
            </div>
        </div>

        {/* EDITOR */}
        <div className="flex-1 flex flex-col">
            {selectedId ? (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título do Documento</label>
                            <input 
                                className="w-full border border-slate-200 rounded p-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                                value={editForm.title || ''}
                                onChange={e => setEditForm({...editForm, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</label>
                            <select 
                                className="w-full border border-slate-200 rounded p-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                                value={editForm.category || 'OUTROS'}
                                onChange={e => setEditForm({...editForm, category: e.target.value as any})}
                            >
                                <option value="PROCURACAO">Procuração</option>
                                <option value="CONTRATO">Contrato</option>
                                <option value="DECLARACAO">Declaração</option>
                                <option value="REQUERIMENTO">Requerimento</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                        </div>
                    </div>

                    {/* TOOLBAR */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 mb-2 flex-wrap">
                        <button onClick={() => execCmd('undo')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Desfazer"><Undo size={14}/></button>
                        <button onClick={() => execCmd('redo')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Refazer"><Redo size={14}/></button>
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        
                        <select onChange={(e) => execCmd('fontName', e.target.value)} className="text-[10px] p-1 rounded border border-slate-300 bg-white w-28 outline-none cursor-pointer">
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Arial">Arial</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Tahoma">Tahoma</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                        </select>
                        <select onChange={(e) => execCmd('fontSize', e.target.value)} className="text-[10px] p-1 rounded border border-slate-300 bg-white w-16 outline-none cursor-pointer">
                            <option value="1">Pequeno</option>
                            <option value="3" selected>Normal</option>
                            <option value="5">Grande</option>
                            <option value="7">Enorme</option>
                        </select>

                        <div className="w-px h-4 bg-slate-300 mx-1"></div>

                        <button onClick={() => execCmd('bold')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 font-bold"><Bold size={14}/></button>
                        <button onClick={() => execCmd('italic')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 italic"><Italic size={14}/></button>
                        <button onClick={() => execCmd('underline')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 underline"><Underline size={14}/></button>
                        
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>

                        <button onClick={() => execCmd('justifyLeft')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignLeft size={14}/></button>
                        <button onClick={() => execCmd('justifyCenter')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignCenter size={14}/></button>
                        <button onClick={() => execCmd('justifyRight')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignRight size={14}/></button>
                        <button onClick={() => execCmd('justifyFull')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignJustify size={14}/></button>

                        <div className="w-px h-4 bg-slate-300 mx-1"></div>

                        <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><List size={14}/></button>
                        <button onClick={() => execCmd('insertOrderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><ListOrdered size={14}/></button>
                        
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        
                        {/* TABLE MENU */}
                        <div className="relative">
                            <button onClick={() => setShowTableMenu(!showTableMenu)} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 flex items-center gap-1" title="Tabela">
                                <Table size={14}/> <ChevronDown size={10}/>
                            </button>
                            {showTableMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1 z-50 w-40 flex flex-col gap-1">
                                    <button onClick={insertTable} className="text-xs text-left px-2 py-1.5 hover:bg-slate-100 rounded">Inserir Tabela</button>
                                    <div className="h-px bg-slate-100 my-0.5"></div>
                                    <button onClick={() => modifyTable('addRow')} className="text-xs text-left px-2 py-1.5 hover:bg-slate-100 rounded">+ Linha</button>
                                    <button onClick={() => modifyTable('addCol')} className="text-xs text-left px-2 py-1.5 hover:bg-slate-100 rounded">+ Coluna</button>
                                    <div className="h-px bg-slate-100 my-0.5"></div>
                                    <button onClick={() => modifyTable('delRow')} className="text-xs text-left px-2 py-1.5 hover:bg-red-50 text-red-600 rounded">Remover Linha</button>
                                    <button onClick={() => modifyTable('delCol')} className="text-xs text-left px-2 py-1.5 hover:bg-red-50 text-red-600 rounded">Remover Coluna</button>
                                </div>
                            )}
                        </div>

                         {/* IMAGE MENU */}
                         <div className="relative">
                            <button onClick={() => setShowImageMenu(!showImageMenu)} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 flex items-center gap-1" title="Imagem">
                                <ImageIcon size={14}/> <ChevronDown size={10}/>
                            </button>
                            {showImageMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1 z-50 w-40 flex flex-col gap-1">
                                    <label className="text-xs text-left px-2 py-1.5 hover:bg-slate-100 rounded cursor-pointer">
                                        Upload Imagem...
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                                    </label>
                                    <button onClick={insertImageUrl} className="text-xs text-left px-2 py-1.5 hover:bg-slate-100 rounded">Imagem via URL</button>
                                    {officeData?.logo && (
                                        <>
                                            <div className="h-px bg-slate-100 my-0.5"></div>
                                            <button onClick={insertLogo} className="text-xs text-left px-2 py-1.5 hover:bg-blue-50 text-blue-600 rounded font-bold">Inserir Logo</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="flex-1 flex gap-4 min-h-0">
                        <div className="flex-1 flex flex-col bg-slate-200 p-4 rounded-lg overflow-y-auto">
                            <div 
                                id="editor"
                                ref={editorRef}
                                contentEditable
                                className="w-full min-h-full bg-white shadow-sm p-8 rounded-sm outline-none text-slate-900 leading-relaxed text-justify whitespace-pre-wrap"
                                style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt' }}
                            />
                        </div>

                        {/* VARIABLES SIDEBAR */}
                        <div className="w-48 bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Sparkles size={10} className="text-orange-500"/> Variáveis Inteligentes
                            </h4>
                            <p className="text-[9px] text-slate-400 mb-2">Clique para inserir onde está o cursor.</p>
                            <div className="flex-1 overflow-y-auto space-y-1 kanban-scroll">
                                {DOCUMENT_VARIABLES.map(v => (
                                    <button
                                        key={v.key}
                                        onClick={() => insertVariable(v.key)}
                                        className="w-full text-left px-2 py-1.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors truncate"
                                        title={v.label}
                                    >
                                        {v.key}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleDelete}
                            className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded flex items-center gap-2"
                        >
                            <Trash2 size={14}/> Excluir
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
                        >
                            <Save size={14}/> Salvar Alterações
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <FileText size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium">Selecione um modelo para editar</p>
                    <p className="text-sm">ou crie um novo modelo personalizado.</p>
                </div>
            )}
        </div>
        
        {/* Click overlay to close dropdowns */}
        {(showTableMenu || showImageMenu) && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setShowTableMenu(false); setShowImageMenu(false); }}></div>
        )}
    </div>
  );
};
