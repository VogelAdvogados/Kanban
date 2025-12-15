import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table, Image as ImageIcon, RotateCcw, Eye } from 'lucide-react';

export interface RichTextEditorRef {
    insertHtml: (html: string) => void;
    execCommand: (command: string, value?: string) => void;
    focus: () => void;
    getRawContent: () => string;
}

interface RichTextEditorProps {
    initialContent?: string;
    onChange?: (content: string) => void;
    theme?: 'light' | 'dark';
    placeholder?: string;
    showOfficeLogoOption?: boolean;
    onInsertLogo?: () => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({ 
    initialContent = '', 
    onChange, 
    theme = 'light',
    placeholder,
    showOfficeLogoOption,
    onInsertLogo
}, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showPlaceholders, setShowPlaceholders] = useState(true);

    // Sync initial content
    useEffect(() => {
        if (editorRef.current && initialContent && editorRef.current.innerHTML !== initialContent) {
            editorRef.current.innerHTML = initialContent;
        }
    }, [initialContent]);

    const handleInput = () => {
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    useImperativeHandle(ref, () => ({
        insertHtml: (html: string) => {
            if (!editorRef.current) return;
            editorRef.current.focus();
            // Modern insert or fallback
            if (!document.execCommand('insertHTML', false, html)) {
                // Fallback for some browsers if needed, but execCommand still widely supported for contentEditable
                const range = window.getSelection()?.getRangeAt(0);
                if (range) {
                    range.deleteContents();
                    const el = document.createElement('div');
                    el.innerHTML = html;
                    const frag = document.createDocumentFragment();
                    let node; 
                    let lastNode;
                    while ( (node = el.firstChild) ) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);
                    if (lastNode) {
                        range.setStartAfter(lastNode);
                        range.setEndAfter(lastNode); 
                    }
                }
            }
            handleInput();
        },
        execCommand: execCmd,
        focus: () => editorRef.current?.focus(),
        getRawContent: () => editorRef.current?.innerHTML || ''
    }));

    const preventFocus = (fn: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(e); };

    // --- TABLE LOGIC ---
    const insertTable = () => {
        const html = `
          <table style="border-collapse: collapse; width: 100%; border: 1px solid black; margin-bottom: 1em;" border="1">
            <tbody>
              <tr><td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td><td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td></tr>
              <tr><td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td><td style="padding: 5px; border: 1px solid #ccc;">&nbsp;</td></tr>
            </tbody>
          </table><p><br></p>`;
        execCmd('insertHTML', html);
        setShowTableMenu(false);
    };

    const modifyTable = (action: 'addRow' | 'addCol' | 'delRow' | 'delCol') => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        let node = selection.getRangeAt(0).startContainer as HTMLElement | null;
        while (node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
            if (node === editorRef.current) return;
            node = node.parentElement;
        }
        if (!node) { alert("Clique dentro de uma tabela."); return; }
        
        const td = node as HTMLTableCellElement;
        const tr = td.parentElement as HTMLTableRowElement;
        const table = tr.closest('table') as HTMLTableElement;
        if (!table) return;

        const cellIndex = td.cellIndex;
        const rowIndex = tr.rowIndex;

        if (action === 'addRow') {
            const newRow = table.insertRow(rowIndex + 1);
            for (let i = 0; i < tr.cells.length; i++) newRow.insertCell(i).innerHTML = '&nbsp;';
        } else if (action === 'addCol') {
            for (let i = 0; i < table.rows.length; i++) table.rows[i].insertCell(cellIndex + 1).innerHTML = '&nbsp;';
        } else if (action === 'delRow') table.deleteRow(rowIndex);
        else if (action === 'delCol') {
            for (let i = 0; i < table.rows.length; i++) if (table.rows[i].cells.length > cellIndex) table.rows[i].deleteCell(cellIndex);
        }
        setShowTableMenu(false);
    };

    // --- IMAGE LOGIC ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => execCmd('insertImage', ev.target?.result as string);
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = '';
        setShowImageMenu(false);
    };

    // --- STYLES ---
    const bgClass = theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50';
    const buttonClass = theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200';
    const activeClass = 'bg-blue-100 text-blue-600';
    const paperClass = theme === 'dark' ? 'bg-white text-black shadow-2xl' : 'bg-white text-black border border-slate-200 shadow-sm';

    return (
        <div className="flex h-full gap-4" onClick={() => { setShowTableMenu(false); setShowImageMenu(false); }}>
            
            {/* TOOLBAR (LEFT VERTICAL) */}
            <div className={`w-14 flex flex-col items-center py-4 gap-4 z-40 rounded-xl ${bgClass} border border-slate-200/10`}>
                <div className="flex flex-col gap-1 w-full px-2">
                    <button onMouseDown={preventFocus(() => execCmd('bold'))} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Negrito"><Bold size={18}/></button>
                    <button onMouseDown={preventFocus(() => execCmd('italic'))} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Itálico"><Italic size={18}/></button>
                    <button onMouseDown={preventFocus(() => execCmd('underline'))} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Sublinhado"><Underline size={18}/></button>
                </div>
                
                <div className="w-8 h-px bg-slate-300/20"></div>

                <div className="flex flex-col gap-1 w-full px-2">
                    <button onMouseDown={preventFocus(() => execCmd('justifyLeft'))} className={`p-2 rounded-lg transition-colors ${buttonClass}`}><AlignLeft size={18}/></button>
                    <button onMouseDown={preventFocus(() => execCmd('justifyCenter'))} className={`p-2 rounded-lg transition-colors ${buttonClass}`}><AlignCenter size={18}/></button>
                    <button onMouseDown={preventFocus(() => execCmd('justifyFull'))} className={`p-2 rounded-lg transition-colors ${buttonClass}`}><AlignJustify size={18}/></button>
                </div>

                <div className="w-8 h-px bg-slate-300/20"></div>

                <div className="flex flex-col gap-1 w-full px-2 relative">
                    <button onMouseDown={preventFocus((e) => { e.stopPropagation(); setShowTableMenu(!showTableMenu); })} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Tabelas"><Table size={18}/></button>
                    <button onMouseDown={preventFocus((e) => { e.stopPropagation(); setShowImageMenu(!showImageMenu); })} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Imagens"><ImageIcon size={18}/></button>
                    
                    {/* TABLE MENU */}
                    {showTableMenu && (
                        <div className="absolute left-full top-0 ml-2 bg-white border border-slate-200 shadow-xl rounded-lg p-2 w-40 z-50 flex flex-col gap-1 text-slate-800 animate-in fade-in zoom-in-95">
                            <button onMouseDown={preventFocus(insertTable)} className="text-xs text-left px-2 py-2 hover:bg-slate-100 rounded">Inserir Tabela</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onMouseDown={preventFocus(() => modifyTable('addRow'))} className="text-xs text-left px-2 py-2 hover:bg-slate-100 rounded">+ Linha</button>
                            <button onMouseDown={preventFocus(() => modifyTable('addCol'))} className="text-xs text-left px-2 py-2 hover:bg-slate-100 rounded">+ Coluna</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onMouseDown={preventFocus(() => modifyTable('delRow'))} className="text-xs text-left px-2 py-2 hover:bg-red-50 text-red-600 rounded">Remover Linha</button>
                            <button onMouseDown={preventFocus(() => modifyTable('delCol'))} className="text-xs text-left px-2 py-2 hover:bg-red-50 text-red-600 rounded">Remover Coluna</button>
                        </div>
                    )}

                    {/* IMAGE MENU */}
                    {showImageMenu && (
                        <div className="absolute left-full top-10 ml-2 bg-white border border-slate-200 shadow-xl rounded-lg p-2 w-48 z-50 flex flex-col gap-1 text-slate-800 animate-in fade-in zoom-in-95">
                            <label className="text-xs text-left px-2 py-2 hover:bg-slate-100 rounded cursor-pointer block">
                                Upload Imagem
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} ref={fileInputRef}/>
                            </label>
                            {showOfficeLogoOption && onInsertLogo && (
                                <button onMouseDown={preventFocus(() => { onInsertLogo(); setShowImageMenu(false); })} className="text-xs text-left px-2 py-2 hover:bg-blue-50 rounded text-blue-600 font-bold w-full">Inserir Logo</button>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-2 w-full px-2">
                    <button onMouseDown={preventFocus(() => setShowPlaceholders(!showPlaceholders))} className={`p-2 rounded-lg transition-colors ${showPlaceholders ? 'bg-yellow-100 text-yellow-600' : buttonClass}`} title="Mostrar Alertas"><Eye size={18}/></button>
                    <button onMouseDown={preventFocus(() => { if(editorRef.current) { editorRef.current.innerHTML = initialContent || ''; handleInput(); } })} className={`p-2 rounded-lg transition-colors ${buttonClass}`} title="Resetar"><RotateCcw size={18}/></button>
                </div>
            </div>

            {/* EDITOR AREA */}
            <div className={`flex-1 overflow-y-auto flex justify-center p-8 custom-scrollbar ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} rounded-xl border border-slate-200/50`}>
                <div 
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className={`outline-none transition-all ${paperClass} ${showPlaceholders ? '' : 'hide-placeholders'}`}
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: '12pt',
                        lineHeight: '1.5',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                />
                <style>{`
                    .hide-placeholders .bg-yellow-200 { background: none !important; border: none !important; padding: 0 !important; color: inherit !important; }
                `}</style>
            </div>
        </div>
    );
});