
import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Printer, ChevronLeft, 
  Scale, FileSignature, History, AlertTriangle
} from 'lucide-react';
import { Case, DocumentTemplate, OfficeData } from '../types';
import { fillTemplate } from '../utils/documentProcessing';

interface DocumentGeneratorModalProps {
  data: Case;
  templates: DocumentTemplate[];
  onClose: () => void;
  officeData?: OfficeData;
  onSaveToHistory?: (docTitle: string, content: string) => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
        case 'PROCURACAO': return <Scale size={24} className="text-blue-500"/>;
        case 'CONTRATO': return <FileSignature size={24} className="text-emerald-500"/>;
        case 'DECLARACAO': return <FileText size={24} className="text-orange-500"/>;
        default: return <FileText size={24} className="text-slate-500"/>;
    }
};

export const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({ data, templates, onClose, officeData, onSaveToHistory }) => {
  const [step, setStep] = useState<'SELECT' | 'PREVIEW'>('SELECT');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [processedContent, setProcessedContent] = useState('');
  
  // Logic to process content when template is selected
  useEffect(() => {
      if (step === 'PREVIEW' && selectedTemplate) {
          let content = selectedTemplate.content;
          
          // Prepend Logo if available
          if (officeData?.logo) {
              content = `<div style="text-align:center; margin-bottom: 20px;"><img src="${officeData.logo}" style="max-width: 150px; height: auto;" /></div>` + content;
          }

          setProcessedContent(fillTemplate(content, data));
      }
  }, [step, selectedTemplate, data, officeData]);

  const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
            <html>
                <head>
                    <title>${data.clientName} - ${selectedTemplate?.title}</title>
                    <style>
                        @page { margin: 2cm; size: A4; }
                        body { 
                            font-family: 'Times New Roman', serif; 
                            padding: 40px; 
                            line-height: 1.5; 
                            color: #000; 
                            font-size: 12pt;
                        }
                        p { margin-bottom: 12px; text-align: justify; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        td, th { border: 1px solid #000; padding: 5px; }
                        img { max-width: 100%; }
                        
                        /* Lógica para Campos Faltantes na IMPRESSÃO */
                        .var-missing::before {
                            content: '________________________________';
                            display: inline-block;
                            white-space: nowrap;
                            color: #000;
                        }
                    </style>
                </head>
                <body>${processedContent}</body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
              printWindow.focus();
              printWindow.print();
          }, 500);
      }
  };

  const handleSaveHistory = () => {
      if(onSaveToHistory && selectedTemplate) {
          // Remove HTML tags for simple logging
          const plainText = processedContent.replace(/<[^>]+>/g, ' '); 
          onSaveToHistory(selectedTemplate.title, `Documento gerado e impresso: ${selectedTemplate.title}`);
          alert('Registro salvo no histórico do caso.');
      }
  };

  // Styles for the On-Screen Preview
  const previewStyles = `
    .document-preview {
        font-family: 'Times New Roman', serif;
        line-height: 1.5;
        color: #000;
        font-size: 12pt;
    }
    .document-preview p { margin-bottom: 12px; }
    
    /* Lógica para Campos Faltantes na TELA */
    .document-preview .var-missing::before {
        content: '[FALTA: ' attr(data-label) ']';
        background-color: #fef08a; /* Yellow-200 */
        color: #854d0e; /* Yellow-900 */
        border: 1px dashed #ca8a04;
        padding: 2px 4px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.9em;
        font-family: sans-serif;
    }
  `;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-300">
      <style>{previewStyles}</style>
      
      {/* 1. TOP HEADER */}
      <div className="flex-shrink-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-md z-50">
          <div className="flex items-center gap-4">
              {step === 'PREVIEW' && (
                  <button onClick={() => setStep('SELECT')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                      <ChevronLeft size={24}/>
                  </button>
              )}
              <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="text-blue-500" /> 
                      {step === 'SELECT' ? 'Gerar Documento' : selectedTemplate?.title}
                  </h2>
                  {step === 'PREVIEW' && (
                      <p className="text-xs text-slate-400">Cliente: <span className="text-white font-bold">{data.clientName}</span></p>
                  )}
              </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-500 transition-colors">
              <X size={24}/>
          </button>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative flex bg-slate-100">
          
          {/* VIEW: TEMPLATE SELECTION */}
          {step === 'SELECT' && (
              <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                  <div className="w-full max-w-5xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {templates.map(tpl => (
                              <button 
                                  key={tpl.id}
                                  onClick={() => { setSelectedTemplate(tpl); setStep('PREVIEW'); }}
                                  className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg p-6 rounded-xl text-left transition-all group relative overflow-hidden h-40 flex flex-col justify-between"
                              >
                                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                      <FileText size={80} className="text-slate-900"/>
                                  </div>
                                  <div className="relative z-10">
                                      <div className="mb-3 p-2 bg-slate-50 w-fit rounded-lg shadow-sm group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 transition-colors">
                                          <CategoryIcon category={tpl.category} />
                                      </div>
                                      <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-blue-700">{tpl.title}</h3>
                                  </div>
                                  <div className="relative z-10 pt-2 border-t border-slate-50 mt-2">
                                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{tpl.category}</p>
                                  </div>
                              </button>
                          ))}
                      </div>
                      {templates.length === 0 && (
                          <div className="text-center text-slate-500 py-20">
                              <p className="text-lg font-bold">Nenhum modelo disponível.</p>
                              <p className="text-sm">Configure modelos no menu Ajustes.</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* VIEW: PREVIEW */}
          {step === 'PREVIEW' && (
              <>
                  {/* PREVIEW CONTAINER */}
                  <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200/50">
                      <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] document-preview">
                          <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                      </div>
                  </div>

                  {/* RIGHT: ACTIONS */}
                  <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-40 shadow-xl">
                      
                      <div className="p-6 border-b border-slate-100">
                          <h3 className="font-bold text-slate-800 text-lg mb-1">Ações</h3>
                          <p className="text-xs text-slate-500">Revise o documento antes de imprimir.</p>
                      </div>

                      <div className="p-6 space-y-4 flex-1">
                          
                          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                              <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                                  <AlertTriangle size={14}/> Instruções
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                  Os campos destacados em <span className="bg-yellow-200 text-yellow-900 px-1 rounded font-bold text-[10px]">AMARELO</span> indicam dados que não foram encontrados no cadastro do cliente.
                                  <br/><br/>
                                  Na impressão, eles serão substituídos por uma linha (_________) para preenchimento manual.
                              </p>
                          </div>

                          <button 
                              onClick={handlePrint}
                              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                          >
                              <Printer size={20}/> IMPRIMIR DOCUMENTO
                          </button>
                          
                          {onSaveToHistory && (
                              <button 
                                  onClick={handleSaveHistory}
                                  className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                              >
                                  <History size={16}/> Registrar no Histórico
                              </button>
                          )}
                      </div>
                      
                      <div className="p-4 bg-slate-50 text-center text-[10px] text-slate-400 border-t border-slate-100">
                          Para editar este modelo, acesse Ajustes > Modelos.
                      </div>
                  </div>
              </>
          )}
      </div>
    </div>
  );
};
