
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, FileText, Printer, ChevronLeft, PenTool,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo, RefreshCcw, Eye, AlertTriangle, FileSignature, Scale, ArrowRight, Table, Image as ImageIcon, ChevronDown, Plus, Trash2
} from 'lucide-react';
import { Case, DocumentTemplate, OfficeData } from '../types';
import { formatDate } from '../utils';

interface DocumentGeneratorModalProps {
  data: Case;
  templates: DocumentTemplate[];
  onClose: () => void;
  officeData?: OfficeData;
}

// Map icons to categories
const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
        case 'PROCURACAO': return <Scale size={24} className="text-blue-500"/>;
        case 'CONTRATO': return <FileSignature size={24} className="text-emerald-500"/>;
        case 'DECLARACAO': return <FileText size={24} className="text-orange-500"/>;
        default: return <FileText size={24} className="text-slate-500"/>;
    }
};

export const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({ data, templates, onClose, officeData }) => {
  const [step, setStep] = useState<'SELECT' | 'PREVIEW'>('SELECT');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Get data safely or return null
  const safeGet = (val: string | undefined | null) => val ? val.trim() : null;

  // Helper: Create HTML tag for missing data or simple text
  const wrapData = (val: string | null, label: string) => {
      if (val) return val;
      if (showPlaceholders) {
          return `<span class="bg-yellow-100 text-yellow-800 px-1 font-bold border border-yellow-300 rounded mx-1" title="Dado ausente: ${label}" contenteditable="false">[FALTA: ${label}]</span>`;
      }
      return '_______________';
  };

  // Fill variables Logic - INTELLIGENT MODE
  const fillTemplate = (content: string, c: Case) => {
      const today = new Date();
      
      const day = String(today.getDate()).padStart(2, '0');
      const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
      const month = monthNames[today.getMonth()];
      const year = String(today.getFullYear());
      const longDate = `${day} de ${month} de ${year}`;

      // Smart Address Construction
      let addressSmart = "";
      const street = safeGet(c.addressStreet);
      const num = safeGet(c.addressNumber) || "S/N";
      const neigh = safeGet(c.addressNeighborhood);
      const city = safeGet(c.addressCity);
      const state = safeGet(c.addressState);
      const zip = safeGet(c.addressZip);

      // Build logic: "Rua X, nº 123, Bairro Y, CEP 00000, Cidade/UF"
      const parts = [];
      if (street) parts.push(`${street}`);
      if (street) parts.push(`nº ${num}`);
      if (neigh) parts.push(`Bairro ${neigh}`);
      if (zip) parts.push(`CEP ${zip}`);
      if (city && state) parts.push(`${city}/${state}`);
      else if (city) parts.push(city);
      
      addressSmart = parts.length > 0 ? parts.join(', ') : wrapData(null, 'ENDEREÇO');

      // Common vars map
      const replacements: Record<string, string> = {
          '{NOME_CLIENTE}': wrapData(safeGet(c.clientName), 'NOME'),
          '{CPF}': wrapData(safeGet(c.cpf), 'CPF'),
          '{RG}': wrapData(safeGet(c.rg), 'RG'),
          '{PIS}': wrapData(safeGet(c.pis), 'PIS'),
          '{TELEFONE}': wrapData(safeGet(c.phone), 'TELEFONE'),
          '{ESTADO_CIVIL}': wrapData(safeGet(c.maritalStatus), 'EST. CIVIL'),
          '{DATA_NASCIMENTO}': c.birthDate ? formatDate(c.birthDate) : wrapData(null, 'NASCIMENTO'),
          '{NOME_MAE}': wrapData(safeGet(c.motherName), 'MÃE'),
          '{NB}': wrapData(safeGet(c.benefitNumber), 'NB'),
          '{NPU}': wrapData(safeGet(c.mandadosSeguranca?.[0]?.npu), 'NPU'), // Pega o primeiro NPU se houver
          '{ADVOGADO_RESPONSAVEL}': wrapData(safeGet(c.responsibleName), 'ADVOGADO'),
          
          // Datas
          '{DATA_ATUAL}': longDate,
          '{DIA}': day,
          '{MES}': month,
          '{ANO}': year,

          // Endereço Granular
          '{ENDERECO_COMPLETO}': addressSmart,
          '{RUA}': wrapData(street, 'RUA'),
          '{NUMERO}': wrapData(num, 'NÚMERO'),
          '{BAIRRO}': wrapData(neigh, 'BAIRRO'),
          '{CIDADE}': wrapData(city, 'CIDADE'),
          '{UF}': wrapData(state, 'UF'),
          '{CEP}': wrapData(zip, 'CEP'),
      };

      let processed = content;
      Object.entries(replacements).forEach(([key, value]) => {
          // Global replace with regex to catch all instances
          processed = processed.split(key).join(value);
      });

      return processed;
  };

  const loadContent = () => {
    if (selectedTemplate && editorRef.current) {
        editorRef.current.innerHTML = fillTemplate(selectedTemplate.content, data);
    }
  };

  useEffect(() => {
      if (step === 'PREVIEW') {
          // Pequeno delay para garantir que o ref existe
          setTimeout(loadContent, 50);
      }
  }, [step, selectedTemplate, showPlaceholders]);

  // --- EDITOR COMMANDS ---
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
          // Wrap in a div to allow resizing/centering behavior more easily
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

  const handlePrint = () => {
      const content = editorRef.current?.innerHTML || '';
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
            <html>
                <head>
                    <title>${data.clientName} - ${selectedTemplate?.title}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; }
                        p { margin-bottom: 15px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; }
                        td, th { border: 1px solid #000; padding: 5px; }
                        img { max-width: 100%; }
                        @media print {
                          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                          .bg-yellow-100 { background-color: transparent !important; border: none !important; color: black !important; padding: 0 !important; }
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
              printWindow.print();
          }, 500);
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* MODIFIED: Width and Height increased for accessibility */}
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-[1400px] h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {step === 'PREVIEW' && (
                    <button onClick={() => setStep('SELECT')} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                        <ChevronLeft size={24}/>
                    </button>
                )}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {step === 'SELECT' ? 'Gerador de Documentos' : selectedTemplate?.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                        Cliente: <strong>{data.clientName}</strong>
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400">
                <X size={24}/>
            </button>
        </div>

        {/* STEP 1: SELECT DOCUMENT */}
        {step === 'SELECT' && (
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(tpl => (
                        <button 
                            key={tpl.id}
                            onClick={() => { setSelectedTemplate(tpl); setStep('PREVIEW'); }}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    <CategoryIcon category={tpl.category} />
                                </div>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                            </div>
                            <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{tpl.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{tpl.category}</p>
                        </button>
                    ))}
                </div>
                {templates.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>Nenhum modelo cadastrado.</p>
                        <p className="text-sm">Vá em Configurações > Documentos para criar.</p>
                    </div>
                )}
            </div>
        )}

        {/* STEP 2: PREVIEW & PRINT */}
        {step === 'PREVIEW' && (
            <div className="flex-1 flex flex-col bg-slate-200">
                {/* TOOLBAR */}
                <div className="bg-white border-b border-slate-200 p-2 flex flex-wrap gap-2 items-center justify-between shadow-sm z-10">
                    
                    {/* Left: Quick Actions */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowPlaceholders(!showPlaceholders)}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-colors ${showPlaceholders ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'}`}
                            title="Alternar alertas de dados faltantes"
                        >
                            {showPlaceholders ? <AlertTriangle size={14}/> : <Eye size={14}/>} 
                            {showPlaceholders ? 'Alertas Visíveis' : 'Alertas Ocultos'}
                        </button>
                        <button onClick={loadContent} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-2 text-xs font-bold border border-transparent hover:border-slate-200" title="Recarregar dados originais">
                            <RefreshCcw size={14}/> Resetar
                        </button>
                    </div>

                    {/* Center: Formatting (Collapsed for cleaner UI) */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                        <button onClick={() => execCmd('undo')} className="p-1 hover:bg-slate-200 rounded text-slate-600"><Undo size={14}/></button>
                        <button onClick={() => execCmd('redo')} className="p-1 hover:bg-slate-200 rounded text-slate-600"><Redo size={14}/></button>
                        
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>

                        {/* FONT FAMILY SELECTOR - Expanded */}
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

                        <button onClick={() => execCmd('bold')} className="p-1 hover:bg-slate-200 rounded text-slate-700 font-bold"><Bold size={14}/></button>
                        <button onClick={() => execCmd('italic')} className="p-1 hover:bg-slate-200 rounded text-slate-700 italic"><Italic size={14}/></button>
                        <button onClick={() => execCmd('underline')} className="p-1 hover:bg-slate-200 rounded text-slate-700 underline"><Underline size={14}/></button>
                        
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>

                        <button onClick={() => execCmd('justifyLeft')} className="p-1 hover:bg-slate-200 rounded text-slate-600"><AlignLeft size={14}/></button>
                        <button onClick={() => execCmd('justifyCenter')} className="p-1 hover:bg-slate-200 rounded text-slate-600"><AlignCenter size={14}/></button>
                        <button onClick={() => execCmd('justifyRight')} className="p-1 hover:bg-slate-200 rounded text-slate-600"><AlignRight size={14}/></button>
                        <button onClick={() => execCmd('justifyFull')} className="p-1 hover:bg-slate-200 rounded text-slate-600"><AlignJustify size={14}/></button>

                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        
                        {/* TABLE MENU */}
                        <div className="relative">
                            <button onClick={() => setShowTableMenu(!showTableMenu)} className="p-1 hover:bg-slate-200 rounded text-slate-600 flex items-center gap-1" title="Tabela">
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
                            <button onClick={() => setShowImageMenu(!showImageMenu)} className="p-1 hover:bg-slate-200 rounded text-slate-600 flex items-center gap-1" title="Imagem">
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

                    {/* Right: Print Action */}
                    <div>
                        <button 
                            onClick={handlePrint} 
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-md transition-transform active:scale-95"
                        >
                            <Printer size={16}/> IMPRIMIR DOCUMENTO
                        </button>
                    </div>
                </div>

                {/* PAPER PREVIEW */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200/50">
                    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl p-[20mm] md:p-[25mm] rounded-sm transition-all duration-300">
                        <div 
                            id="editor"
                            ref={editorRef}
                            contentEditable
                            className="w-full h-full outline-none text-slate-900 font-serif leading-relaxed text-justify whitespace-pre-wrap"
                            style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt' }}
                        />
                    </div>
                </div>
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
