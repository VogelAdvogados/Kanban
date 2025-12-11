
import React, { useState } from 'react';
import { Plus, Trash2, MessageCircle, Save, Sparkles, ChevronRight, HelpCircle, Copy } from 'lucide-react';
import { WhatsAppTemplate, User, SystemLog } from '../../types';

interface WhatsAppSettingsProps {
  templates: WhatsAppTemplate[];
  setTemplates: (t: WhatsAppTemplate[]) => void;
  currentUser?: User;
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

const WA_VARIABLES = [
    { key: '{NOME}', desc: 'Primeiro nome do cliente' },
    { key: '{NB}', desc: 'Número do Benefício' },
    { key: '{PROTOCOLO}', desc: 'Protocolo INSS / Judicial' },
    { key: '{ID_INTERNO}', desc: 'Código do processo no escritório' },
    { key: '{DATA_PERICIA}', desc: 'Data agendada da perícia' },
    { key: '{LOCAL_PERICIA}', desc: 'Endereço completo da agência' },
    { key: '{DATA_DCB}', desc: 'Data de Cessação (DCB)' },
    { key: '{LISTA_DOCS}', desc: 'Lista de documentos pendentes (com quebras de linha)' },
];

export const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ 
    templates, setTemplates, currentUser, addSystemLog, showToast 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [editForm, setEditForm] = useState<Partial<WhatsAppTemplate> | null>(null);

  const handleSelect = (tpl: WhatsAppTemplate) => {
      setSelectedTemplate(tpl);
      setEditForm({ ...tpl });
  };

  const handleNew = () => {
      const newTpl: WhatsAppTemplate = {
          id: `wa_tpl_${Date.now()}`,
          label: 'Novo Modelo',
          category: 'GERAL',
          text: 'Olá {NOME}, ...'
      };
      setEditForm(newTpl);
      setSelectedTemplate(null);
  };

  const handleSave = () => {
      if (!editForm || !editForm.label || !editForm.text) return;
      
      const toSave = editForm as WhatsAppTemplate;
      
      const exists = templates.find(t => t.id === toSave.id);
      
      let newTemplates;
      if (exists) {
          newTemplates = templates.map(t => t.id === toSave.id ? toSave : t);
      } else {
          newTemplates = [...templates, toSave];
      }
      
      setTemplates(newTemplates);
      setSelectedTemplate(toSave);

      if (addSystemLog && currentUser) {
          addSystemLog('Modelo WhatsApp', `Modelo "${toSave.label}" ${exists ? 'atualizado' : 'criado'}.`, currentUser.name, 'SYSTEM');
      }
      
      if (showToast) showToast('Modelo de WhatsApp salvo!', 'success');
  };

  const handleDelete = () => {
      if (!selectedTemplate) return;
      if (confirm(`Excluir o modelo "${selectedTemplate.label}"?`)) {
          const newTemplates = templates.filter(t => t.id !== selectedTemplate.id);
          setTemplates(newTemplates);
          setSelectedTemplate(null);
          setEditForm(null);
          if (showToast) showToast('Modelo removido.', 'success');
      }
  };

  const insertVariable = (variable: string) => {
      if (!editForm) return;
      const textArea = document.getElementById('wa-editor') as HTMLTextAreaElement;
      if (textArea) {
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const text = editForm.text || '';
          const newText = text.substring(0, start) + variable + text.substring(end);
          setEditForm({ ...editForm, text: newText });
          
          // Restore focus after React render cycle
          setTimeout(() => {
              textArea.focus();
              textArea.setSelectionRange(start + variable.length, start + variable.length);
          }, 0);
      }
  };

  return (
    <div className="flex h-full gap-6">
        {/* LIST */}
        <div className="w-64 flex flex-col border-r border-slate-100 pr-4">
            <button 
                onClick={handleNew}
                className="mb-4 w-full py-2 bg-green-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-700 shadow-sm"
            >
                <Plus size={14}/> Criar Modelo
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
                {templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between group transition-colors ${editForm?.id === t.id ? 'bg-green-50 text-green-800 border border-green-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                    >
                        <div>
                            <span className="block truncate">{t.label}</span>
                            <span className="text-[9px] text-slate-400 font-normal uppercase">{t.category}</span>
                        </div>
                        {editForm?.id === t.id && <ChevronRight size={14} className="text-green-500"/>}
                    </button>
                ))}
            </div>
        </div>

        {/* EDITOR */}
        <div className="flex-1 flex flex-col">
            {editForm ? (
                <div className="space-y-4 h-full flex flex-col">
                    {/* Header Inputs */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
                            <MessageCircle size={16} className="text-green-600" /> Detalhes do Modelo
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Modelo</label>
                                <input 
                                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-green-100 outline-none"
                                    value={editForm.label || ''}
                                    onChange={e => setEditForm({...editForm, label: e.target.value})}
                                    placeholder="Ex: Cobrança Amigável"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
                                <select 
                                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-green-100 outline-none"
                                    value={editForm.category || 'GERAL'}
                                    onChange={e => setEditForm({...editForm, category: e.target.value as any})}
                                >
                                    <option value="GERAL">Geral / Avisos</option>
                                    <option value="PERICIA">Perícia / Agenda</option>
                                    <option value="DOCUMENTOS">Documentos / Pendências</option>
                                    <option value="RESULTADO">Resultado / Sentença</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 flex gap-4 min-h-0">
                        <div className="flex-1 flex flex-col">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Mensagem (Suporta formatação do WhatsApp)</label>
                            <div className="flex-1 relative">
                                <textarea 
                                    id="wa-editor"
                                    className="w-full h-full p-4 border border-slate-300 rounded-xl resize-none text-sm leading-relaxed focus:ring-2 focus:ring-green-100 outline-none font-sans"
                                    value={editForm.text || ''}
                                    onChange={e => setEditForm({...editForm, text: e.target.value})}
                                    placeholder="Digite sua mensagem aqui... Use *negrito* para destacar."
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-white/80 px-2 py-1 rounded border border-slate-100">
                                    {(editForm.text || '').length} caracteres
                                </div>
                            </div>
                        </div>

                        {/* Variables Sidebar */}
                        <div className="w-56 bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Sparkles size={10} className="text-orange-500"/> Variáveis Dinâmicas
                            </h4>
                            <p className="text-[9px] text-slate-400 mb-2">Clique para inserir no texto.</p>
                            <div className="flex-1 overflow-y-auto space-y-1 kanban-scroll pr-1">
                                {WA_VARIABLES.map(v => (
                                    <button
                                        key={v.key}
                                        onClick={() => insertVariable(v.key)}
                                        className="w-full text-left px-2 py-1.5 bg-white border border-slate-200 rounded text-[10px] hover:border-green-300 hover:text-green-700 transition-colors group"
                                    >
                                        <span className="font-bold block text-slate-600 group-hover:text-green-700">{v.key}</span>
                                        <span className="text-slate-400 text-[9px]">{v.desc}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-[9px] text-slate-400">
                                    <span className="font-bold text-slate-600">*texto*</span> = Negrito<br/>
                                    <span className="font-bold text-slate-600">_texto_</span> = Itálico
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                        {selectedTemplate && (
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded flex items-center gap-2"
                            >
                                <Trash2 size={14}/> Excluir
                            </button>
                        )}
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-md flex items-center gap-2"
                        >
                            <Save size={14}/> Salvar Alterações
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <MessageCircle size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium">Selecione um modelo para editar</p>
                    <p className="text-sm">ou crie um novo para agilizar o atendimento.</p>
                </div>
            )}
        </div>
    </div>
  );
};
