
import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Save, Sparkles, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import { SystemTag, AutoTagRule } from '../../types';
import { BENEFIT_OPTIONS } from '../../constants';

interface TagManagerProps {
  tags: SystemTag[];
  setTags: (tags: SystemTag[]) => void;
  showToast?: (message: string, type: 'success' | 'error') => void;
}

const COLOR_PRESETS = [
    { bg: 'bg-slate-100', text: 'text-slate-700' },
    { bg: 'bg-red-100', text: 'text-red-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
    { bg: 'bg-amber-100', text: 'text-amber-800' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-green-100', text: 'text-green-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
    { bg: 'bg-pink-100', text: 'text-pink-700' },
];

export const TagManager: React.FC<TagManagerProps> = ({ tags, setTags, showToast }) => {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SystemTag | null>(null);

  // Sync selection with form logic
  useEffect(() => {
      if (selectedTagId) {
          const found = tags.find(t => t.id === selectedTagId);
          if (found) {
              setEditForm({ ...found, rules: found.rules ? [...found.rules] : [] });
          }
      }
  }, [selectedTagId, tags]);

  const handleSelect = (tag: SystemTag) => {
      setSelectedTagId(tag.id);
      setEditForm({ ...tag, rules: tag.rules ? [...tag.rules] : [] });
  };

  const handleNew = () => {
      const newId = `tag_${Date.now()}`;
      const newTag: SystemTag = {
          id: newId,
          label: 'Nova Etiqueta',
          colorBg: 'bg-slate-100',
          colorText: 'text-slate-700',
          rules: []
      };
      setEditForm(newTag);
      setSelectedTagId(null); // Deselect existing to indicate new mode
  };

  const handleSave = () => {
      if (!editForm || !editForm.label) return;
      
      const exists = tags.find(t => t.id === editForm.id);
      
      let newTags;
      if (exists) {
          newTags = tags.map(t => t.id === editForm.id ? editForm : t);
      } else {
          newTags = [...tags, editForm];
      }
      
      setTags(newTags);
      setSelectedTagId(editForm.id); // Ensure selection is set after save
      
      if (showToast) showToast('Etiqueta salva com sucesso!', 'success');
  };

  const handleDelete = () => {
      // Use editForm.id as the source of truth for what is being viewed
      if (!editForm || !editForm.id) return;
      
      const tagLabel = editForm.label;
      const tagId = editForm.id;

      if (confirm(`Tem certeza que deseja EXCLUIR DEFINITIVAMENTE a etiqueta "${tagLabel}"?`)) {
          // Robust filter
          const updatedTags = tags.filter(t => t.id !== tagId);
          
          setTags(updatedTags);
          
          // Reset UI
          setSelectedTagId(null);
          setEditForm(null);
          
          if (showToast) showToast('Etiqueta removida.', 'success');
      }
  };

  // Helper: Verify if current form exists in saved list
  const isSavedItem = editForm && tags.some(t => t.id === editForm.id);

  const addRule = () => {
      if (!editForm) return;
      const newRule: AutoTagRule = { type: 'BENEFIT_TYPE', value: '' };
      setEditForm({ ...editForm, rules: [...(editForm.rules || []), newRule] });
  };

  const removeRule = (index: number) => {
      if (!editForm || !editForm.rules) return;
      const newRules = [...editForm.rules];
      newRules.splice(index, 1);
      setEditForm({ ...editForm, rules: newRules });
  };

  const updateRule = (index: number, field: keyof AutoTagRule, value: any) => {
      if (!editForm || !editForm.rules) return;
      const newRules = [...editForm.rules];
      newRules[index] = { ...newRules[index], [field]: value };
      setEditForm({ ...editForm, rules: newRules });
  };

  return (
    <div className="flex h-full gap-6">
        {/* LIST */}
        <div className="w-64 flex flex-col border-r border-slate-100 pr-4">
            <button 
                onClick={handleNew}
                className="mb-4 w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm"
            >
                <Plus size={14}/> Criar Etiqueta
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
                {tags.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between group transition-colors ${editForm?.id === t.id ? 'bg-slate-100 border border-slate-200' : 'hover:bg-slate-50 border border-transparent'}`}
                    >
                        <span className={`px-2 py-0.5 rounded ${t.colorBg} ${t.colorText}`}>{t.label}</span>
                        {editForm?.id === t.id && <ChevronRight size={14} className="text-slate-400"/>}
                    </button>
                ))}
            </div>
        </div>

        {/* EDITOR */}
        <div className="flex-1 flex flex-col overflow-y-auto">
            {editForm ? (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
                            <Tag size={16} /> Identificação
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome da Etiqueta</label>
                                <input 
                                    className="w-full border border-slate-300 rounded p-2 text-sm"
                                    value={editForm.label}
                                    onChange={e => setEditForm({...editForm, label: e.target.value})}
                                    placeholder="Ex: Prioridade"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Cor de Destaque</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_PRESETS.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setEditForm({...editForm, colorBg: color.bg, colorText: color.text})}
                                            className={`w-8 h-8 rounded-full border-2 ${editForm.colorBg === color.bg ? 'border-slate-600 scale-110' : 'border-transparent hover:border-slate-300'} ${color.bg}`}
                                        />
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${editForm.colorBg} ${editForm.colorText}`}>
                                        Pré-visualização
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Automation Rules */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-blue-800 mb-0 text-sm flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-600" /> Automação Inteligente
                            </h4>
                            <button onClick={addRule} className="text-[10px] bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-50 flex items-center gap-1">
                                <Plus size={12}/> Adicionar Regra
                            </button>
                        </div>
                        
                        {editForm.rules && editForm.rules.length > 0 ? (
                            <div className="space-y-2">
                                {editForm.rules.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-blue-100">
                                        <span className="text-xs font-bold text-slate-500">SE</span>
                                        <select 
                                            className="text-xs border border-slate-200 rounded p-1.5 outline-none bg-slate-50"
                                            value={rule.type}
                                            onChange={e => updateRule(idx, 'type', e.target.value)}
                                        >
                                            <option value="BENEFIT_TYPE">Benefício for...</option>
                                            <option value="AGE_GREATER">Idade maior que...</option>
                                            <option value="COLUMN_CONTAINS">Coluna contém...</option>
                                        </select>
                                        
                                        {rule.type === 'BENEFIT_TYPE' ? (
                                            <select 
                                                className="flex-1 text-xs border border-slate-200 rounded p-1.5 outline-none"
                                                value={rule.value}
                                                onChange={e => updateRule(idx, 'value', e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {BENEFIT_OPTIONS.map(b => (
                                                    <option key={b.code} value={b.code}>{b.label}</option>
                                                ))}
                                            </select>
                                        ) : rule.type === 'AGE_GREATER' ? (
                                            <div className="flex items-center gap-1 flex-1">
                                                <input 
                                                    type="number"
                                                    className="w-16 text-xs border border-slate-200 rounded p-1.5 outline-none"
                                                    value={rule.value}
                                                    onChange={e => updateRule(idx, 'value', e.target.value)}
                                                />
                                                <span className="text-xs text-slate-500">anos</span>
                                            </div>
                                        ) : (
                                            <input 
                                                type="text"
                                                className="flex-1 text-xs border border-slate-200 rounded p-1.5 outline-none"
                                                placeholder="Texto da coluna (ex: docs, protocolo)"
                                                value={rule.value}
                                                onChange={e => updateRule(idx, 'value', e.target.value)}
                                            />
                                        )}

                                        <button onClick={() => removeRule(idx)} className="text-slate-400 hover:text-red-500 p-1">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-xs text-blue-400 border border-dashed border-blue-200 rounded-lg bg-white/50">
                                Nenhuma regra automática. A etiqueta será manual.
                            </div>
                        )}
                        <p className="text-[10px] text-blue-400 mt-2 flex items-center gap-1">
                            <HelpCircle size={10}/> As regras são aplicadas automaticamente ao salvar/atualizar um caso.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        {/* Only show delete if the item exists in the saved list */}
                        {isSavedItem && (
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-2"
                            >
                                <Trash2 size={14}/> Excluir
                            </button>
                        )}
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
                        >
                            <Save size={14}/> Salvar Alterações
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <Tag size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium">Selecione uma etiqueta para editar</p>
                    <p className="text-sm">ou crie uma nova.</p>
                </div>
            )}
        </div>
    </div>
  );
};
