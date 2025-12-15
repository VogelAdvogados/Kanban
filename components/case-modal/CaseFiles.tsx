
import React, { useState, useRef } from 'react'; 
import { Tag, Paperclip, UploadCloud, Image, FileText, Download, Trash2, X, AlertTriangle, CheckCircle2, ChevronDown, Loader2, Check } from 'lucide-react';
import { Case, CaseFile, SystemTag } from '../../types';
import { DEFAULT_SYSTEM_TAGS, COMMON_DOCUMENTS } from '../../constants';
import { formatBytes } from '../../utils';
import { db } from '../../services/database';

interface CaseFilesProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
  commonDocs?: string[]; 
}

// Helper to get tags
const getSystemTags = (): SystemTag[] => {
    try {
        const saved = localStorage.getItem('rambo_prev_tags_v1');
        return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_TAGS;
    } catch {
        return DEFAULT_SYSTEM_TAGS;
    }
}

export const CaseFiles: React.FC<CaseFilesProps> = ({ data, onChange, commonDocs }) => {
  const [newTag, setNewTag] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // State for resolving pendencies via upload
  const [resolvingDoc, setResolvingDoc] = useState<string | null>(null);
  const resolveInputRef = useRef<HTMLInputElement>(null);
  
  const systemTags = getSystemTags();
  const availableDocs = commonDocs && commonDocs.length > 0 ? commonDocs : COMMON_DOCUMENTS;

  const handleAddTag = (tagToAdd: string) => { 
      const val = tagToAdd.trim();
      if (val && !data.tags?.includes(val)) { 
          onChange({ tags: [...(data.tags || []), val] }); 
          setNewTag(''); 
      }
  };

  const handleRemoveTag = (t: string) => { 
      onChange({ tags: data.tags?.filter(tag => tag !== t) || [] }); 
  };

  const handleManualResolve = (doc: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if(window.confirm(`Marcar "${doc}" como resolvido/entregue (sem anexar arquivo digital)?`)) {
          onChange({ missingDocs: data.missingDocs?.filter(d => d !== doc) || [] });
      }
  };

  const handleUploadClick = (doc: string) => {
      setResolvingDoc(doc);
      resolveInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingFile(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingFile(false); };
  
  const processFiles = async (files: File[], forcedCategory?: string) => {
      if(files.length === 0) return;
      setIsProcessing(true);
      setUploadProgress(0);

      const processedFiles: CaseFile[] = [];
      let errorMsg = '';
      
      const totalFiles = files.length;
      let completed = 0;

      for (const f of files) {
          try {
              // Upload to Firebase Storage
              const downloadUrl = await db.uploadCaseFile(f, data.id);

              processedFiles.push({
                  id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
                  name: f.name, 
                  type: f.type, 
                  size: f.size, 
                  uploadDate: new Date().toISOString(),
                  url: downloadUrl, // Store Link, not Base64
                  category: forcedCategory 
              });
              
              completed++;
              setUploadProgress(Math.round((completed / totalFiles) * 100));

          } catch (err: any) {
              console.error("Erro ao processar arquivo", f.name, err);
              errorMsg += `- ${f.name}: ${err.message || 'Erro de rede'}\n`;
          }
      }

      if (errorMsg) {
          alert(`⚠️ ERRO NO UPLOAD:\n${errorMsg}\nVerifique sua conexão.`);
      }

      if (processedFiles.length > 0) {
          const updates: Partial<Case> = { 
              files: [...(data.files || []), ...processedFiles] 
          };

          // If resolving a pendency, remove it from missingDocs
          if (forcedCategory && data.missingDocs?.includes(forcedCategory)) {
              updates.missingDocs = data.missingDocs.filter(d => d !== forcedCategory);
          }

          onChange(updates);
      }
      setIsProcessing(false);
      setIsDraggingFile(false);
      setUploadProgress(0);
  };

  const handleDropFile = (e: React.DragEvent) => { 
      e.preventDefault(); 
      const files = Array.from(e.dataTransfer.files) as File[];
      processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) as File[] : [];
      processFiles(files);
      e.target.value = ''; // Reset input
  };

  const handleResolveFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) as File[] : [];
      if(files.length > 0 && resolvingDoc) {
          processFiles(files, resolvingDoc);
      }
      if(resolveInputRef.current) resolveInputRef.current.value = '';
      setResolvingDoc(null);
  };

  const handleFileCategoryChange = (fileId: string, category: string) => {
      const updatedFiles = (data.files || []).map(f => 
          f.id === fileId ? { ...f, category } : f
      );

      let updatedMissingDocs = data.missingDocs || [];
      if (category && updatedMissingDocs.includes(category)) {
          updatedMissingDocs = updatedMissingDocs.filter(d => d !== category);
      }

      onChange({ 
          files: updatedFiles,
          missingDocs: updatedMissingDocs
      });
  };

  const handleDeleteFile = (id: string) => { 
      if(window.confirm('Remover este anexo do processo? (O arquivo permanecerá no servidor por segurança)')) {
          onChange({ files: data.files?.filter(f => f.id !== id) || [] }); 
      }
  };

  const handleDownload = (file: CaseFile) => {
      if (file.url) {
          window.open(file.url, '_blank');
      } else {
          alert("URL inválida.");
      }
  };

  return (
    <div className="space-y-6">
        {/* Hidden Input for Pendency Resolution */}
        <input 
            type="file" 
            ref={resolveInputRef} 
            onChange={handleResolveFileChange} 
            className="hidden" 
            accept="image/*,.pdf"
        />

        {/* Tags */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Tag size={14}/> Etiquetas & Pendências
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
                {data.tags?.map(tag => {
                    const sysTag = systemTags.find(st => st.label === tag);
                    const colorClass = sysTag 
                        ? `${sysTag.colorBg} ${sysTag.colorText} border-transparent` 
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                        <span key={tag} className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${colorClass}`}>
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70"><X size={12}/></button>
                        </span>
                    );
                })}
                <input 
                    type="text" 
                    placeholder="+ Tag (Enter)" 
                    className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs w-24 focus:w-32 transition-all outline-none"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTag)}
                />
            </div>

            {/* Quick Suggestions */}
            <div className="border-t border-slate-100 pt-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Sugestões Rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                    {systemTags.filter(st => !data.tags?.includes(st.label)).map(st => (
                        <button 
                            key={st.id} 
                            onClick={() => handleAddTag(st.label)}
                            className={`text-[9px] px-2 py-0.5 rounded border hover:opacity-80 transition-opacity ${st.colorBg} ${st.colorText} border-transparent`}
                        >
                            + {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {data.missingDocs && data.missingDocs.length > 0 ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-4 animate-in slide-in-from-top-1">
                    <h4 className="text-[10px] font-bold text-red-700 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={10}/> Pendências (Clique para resolver)</h4>
                    <ul className="space-y-2">
                        {data.missingDocs.map((d, i) => (
                            <li 
                                key={i} 
                                className="flex items-center justify-between p-2 bg-white rounded border border-red-100 shadow-sm group transition-all hover:border-red-300"
                            >
                                <div 
                                    className="flex items-center gap-2 cursor-pointer flex-1"
                                    onClick={() => handleUploadClick(d)}
                                    title="Clique para enviar arquivo e resolver pendência"
                                >
                                    <div className="p-1 bg-red-100 text-red-500 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <UploadCloud size={12} />
                                    </div>
                                    <span className="text-xs text-red-700 font-medium group-hover:text-red-900 group-hover:underline decoration-red-300 underline-offset-2">{d}</span>
                                </div>
                                <button 
                                    onClick={(e) => handleManualResolve(d, e)}
                                    className="text-red-300 hover:text-green-600 p-1.5 hover:bg-green-50 rounded-full transition-colors"
                                    title="Marcar como entregue (sem arquivo)"
                                >
                                    <Check size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 size={16} />
                    <strong>Tudo certo!</strong> Nenhuma pendência documental.
                </div>
            )}
        </div>

        {/* Files Dropzone */}
        <div 
            className={`bg-white rounded-xl border-2 border-dashed p-6 transition-colors ${isDraggingFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropFile}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Paperclip size={14}/> Documentos ({data.files?.length || 0})
                </h3>
                {isProcessing ? (
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin"/> Enviando para Nuvem ({uploadProgress}%)...
                    </span>
                ) : (
                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <UploadCloud size={12}/> Adicionar
                        <input type="file" multiple className="hidden" onChange={handleFileInput}/>
                    </label>
                )}
            </div>
            
            <p className="text-[10px] text-slate-400 mb-4 text-center">
                Arquivos seguros na nuvem. Sem limite de tamanho restrito.
            </p>

            {(!data.files || data.files.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Arraste arquivos aqui ou clique em Adicionar.
                </div>
            ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 kanban-scroll">
                    {data.files.map((file) => (
                        <div key={file.id} className="flex flex-col p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-sm group">
                            
                            {/* File Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${file.category ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {file.category ? <CheckCircle2 size={16}/> : (file.type.includes('image') ? <Image size={14}/> : <FileText size={14}/>)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate" title={file.name}>{file.name}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            <span>{formatBytes(file.size)}</span>
                                            <span>•</span>
                                            <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                    <button onClick={() => handleDownload(file)} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" title="Visualizar/Baixar">
                                        <Download size={14}/>
                                    </button>
                                    <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Remover do Card">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            </div>

                            {/* Categorization Dropdown */}
                            <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tipo:</span>
                                <div className="relative flex-1 group/select">
                                    <select 
                                        className={`
                                            w-full appearance-none text-xs font-medium py-1 pl-2 pr-6 rounded border outline-none cursor-pointer transition-colors
                                            ${file.category 
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                            }
                                        `}
                                        value={file.category || ''}
                                        onChange={(e) => handleFileCategoryChange(file.id, e.target.value)}
                                    >
                                        <option value="">Selecione o tipo...</option>
                                        {availableDocs.map(doc => (
                                            <option key={doc} value={doc}>{doc}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className={`absolute right-2 top-1.5 pointer-events-none ${file.category ? 'text-emerald-500' : 'text-slate-400'}`}/>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
