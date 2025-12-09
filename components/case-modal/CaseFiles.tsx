import React, { useState } from 'react';
import { Tag, Paperclip, UploadCloud, Image, FileText, Download, Trash2, X, AlertTriangle } from 'lucide-react';
import { Case, CaseFile } from '../../types';

interface CaseFilesProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
}

export const CaseFiles: React.FC<CaseFilesProps> = ({ data, onChange }) => {
  const [newTag, setNewTag] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleAddTag = () => { 
      if (newTag.trim() && !data.tags?.includes(newTag.trim())) { 
          onChange({ tags: [...(data.tags || []), newTag.trim()] }); 
          setNewTag(''); 
      }
  };

  const handleRemoveTag = (t: string) => { 
      onChange({ tags: data.tags?.filter(tag => tag !== t) || [] }); 
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingFile(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingFile(false); };
  
  const handleDropFile = (e: React.DragEvent) => { 
      e.preventDefault(); 
      setIsDraggingFile(false);
      const files = Array.from(e.dataTransfer.files);
      if(files.length === 0) return;
      
      const newCaseFiles: CaseFile[] = files.map((f: File) => ({ 
          id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
          name: f.name, type: f.type, size: f.size, uploadDate: new Date().toISOString() 
      }));
      onChange({ files: [...(data.files || []), ...newCaseFiles] });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if(files.length === 0) return;
      const newCaseFiles: CaseFile[] = files.map((f: File) => ({ 
          id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
          name: f.name, type: f.type, size: f.size, uploadDate: new Date().toISOString() 
      }));
      onChange({ files: [...(data.files || []), ...newCaseFiles] });
  };

  const handleDeleteFile = (id: string) => { 
      if(window.confirm('Remover este anexo?')) {
          onChange({ files: data.files?.filter(f => f.id !== id) || [] }); 
      }
  };

  return (
    <div className="space-y-6">
        {/* Tags */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Tag size={14}/> Etiquetas & Pendências
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
                {data.tags?.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                ))}
                <input 
                    type="text" 
                    placeholder="+ Tag (Enter)" 
                    className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs w-24 focus:w-32 transition-all outline-none"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
            </div>
            {data.missingDocs && data.missingDocs.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <h4 className="text-[10px] font-bold text-red-700 uppercase mb-2 flex items-center gap-1"><AlertTriangle size={10}/> Pendências</h4>
                    <ul className="space-y-1">
                        {data.missingDocs.map((d, i) => (
                            <li key={i} className="text-xs text-red-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>{d}</li>
                        ))}
                    </ul>
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
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1">
                    <UploadCloud size={12}/> Adicionar
                    <input type="file" multiple className="hidden" onChange={handleFileInput}/>
                </label>
            </div>

            {(!data.files || data.files.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Arraste arquivos aqui ou clique em Adicionar.
                </div>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 kanban-scroll">
                    {data.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded flex items-center justify-center flex-shrink-0">
                                    {file.type.includes('image') ? <Image size={14}/> : <FileText size={14}/>}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(file.uploadDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 text-slate-400 hover:text-blue-600"><Download size={14}/></button>
                                <button onClick={() => handleDeleteFile(file.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
