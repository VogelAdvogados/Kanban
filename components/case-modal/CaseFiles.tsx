
import React, { useState } from 'react'; 
import { Tag, Paperclip, UploadCloud, Image, FileText, Download, Trash2, X, AlertTriangle, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { Case, CaseFile, SystemTag } from '../../types';
import { DEFAULT_SYSTEM_TAGS, COMMON_DOCUMENTS } from '../../constants';
import { compressImage } from '../../utils';

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

// Helper to convert File to Base64 (Standard)
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const CaseFiles: React.FC<CaseFilesProps> = ({ data, onChange, commonDocs }) => {
  const [newTag, setNewTag] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const handleResolveDoc = (doc: string) => {
      if(window.confirm(`Marcar "${doc}" como resolvido/entregue?`)) {
          onChange({ missingDocs: data.missingDocs?.filter(d => d !== doc) || [] });
      }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingFile(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingFile(false); };
  
  const processFiles = async (files: File[]) => {
      if(files.length === 0) return;
      setIsProcessing(true);

      const MAX_SIZE_MB = 2.0; // Slightly increased limit due to compression
      const processedFiles: CaseFile[] = [];
      let errorMsg = '';

      for (const f of files) {
          // Skip enormous files even before processing
          if (f.size > 5 * 1024 * 1024) { 
              errorMsg += `- ${f.name} (muito grande, >5MB)\n`;
              continue;
          }

          try {
              let finalBase64 = '';
              let finalSize = f.size;

              if (f.type.startsWith('image/')) {
                  // COMPRESS IMAGE
                  finalBase64 = await compressImage(f, 0.6, 1024); // 60% quality, max width 1024
                  // Approximate size of base64
                  finalSize = Math.round((finalBase64.length * 3) / 4);
              } else {
                  // Regular files (PDF etc) - Check size limit strict
                  if (f.size > MAX_SIZE_MB * 1024 * 1024) {
                      errorMsg += `- ${f.name} (PDF > ${MAX_SIZE_MB}MB)\n`;
                      continue;
                  }
                  finalBase64 = await fileToBase64(f);
              }

              processedFiles.push({
                  id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
                  name: f.name, 
                  type: f.type, 
                  size: finalSize, 
                  uploadDate: new Date().toISOString(),
                  url: finalBase64 
              });
          } catch (err) {
              console.error("Erro ao processar arquivo", f.name, err);
              errorMsg += `- ${f.name} (erro de leitura)\n`;
          }
      }

      if (errorMsg) {
          alert(`Alguns arquivos não foram salvos:\n${errorMsg}\nDica: Para PDFs grandes, use ferramentas de compressão antes de anexar.`);
      }

      if (processedFiles.length > 0) {
          onChange({ files: [...(data.files || []), ...processedFiles] });
      }
      setIsProcessing(false);
      setIsDraggingFile(false);
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
      if(window.confirm('Remover este anexo permanentemente?')) {
          onChange({ files: data.files?.filter(f => f.id !== id) || [] }); 
      }
  };

  const handleDownload = (file: CaseFile) => {
      if (file.url) {
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          alert("Arquivo corrompido ou URL inválida.");
      }
  };

  const formatBytes = (bytes: number, decimals = 0) => {
      if (!+bytes) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  return (
    <div className="space-y-6">
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
                    <ul className="space-y-1">
                        {data.missingDocs.map((d, i) => (
                            <li 
                                key={i} 
                                onClick={() => handleResolveDoc(d)}
                                className="text-xs text-red-600 flex items-center gap-2 cursor-pointer hover:bg-red-100 p-1 rounded transition-colors group"
                                title="Clique para marcar como entregue"
                            >
                                <div className="w-4 h-4 rounded-full border border-red-300 flex items-center justify-center bg-white group-hover:bg-red-200">
                                    <CheckCircle2 size={10} className="text-red-500 opacity-0 group-hover:opacity-100"/>
                                </div>
                                <span className="group-hover:line-through decoration-red-400">{d}</span>
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
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Paperclip size={14}/> Documentos ({data.files?.length || 0})
                </h3>
                {isProcessing ? (
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin"/> Otimizando e Salvando...
                    </span>
                ) : (
                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <UploadCloud size={12}/> Adicionar
                        <input type="file" multiple className="hidden" onChange={handleFileInput}/>
                    </label>
                )}
            </div>

            {(!data.files || data.files.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Arraste arquivos aqui ou clique em Adicionar. (Imagens são comprimidas automaticamente).
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
                                    <button onClick={() => handleDownload(file)} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" title="Baixar">
                                        <Download size={14}/>
                                    </button>
                                    <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Excluir">
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
