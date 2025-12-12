
import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowRight, GitBranch, ShieldAlert, CheckSquare, UserCircle, Tag, Bell, Gauge, Bot, Zap, PlayCircle, Settings, X, Power, LayoutTemplate } from 'lucide-react';
import { WorkflowRule, WorkflowCondition, WorkflowAction, User, SystemTag } from '../../types';
import { ADMIN_COLUMNS, AUX_DOENCA_COLUMNS, JUDICIAL_COLUMNS, RECURSO_ADM_COLUMNS, BENEFIT_OPTIONS, AUTOMATION_TEMPLATES } from '../../constants';

interface WorkflowSettingsProps {
  rules: WorkflowRule[];
  setRules: (r: WorkflowRule[]) => void;
  users: User[];
  tags: SystemTag[];
  showToast: (msg: string, type: 'success' | 'error') => void;
}

// All Columns for Dropdown
const ALL_COLUMNS = [
    ...ADMIN_COLUMNS.map(c => ({...c, group: 'Administrativo'})),
    ...AUX_DOENCA_COLUMNS.map(c => ({...c, group: 'Auxílio Doença'})),
    ...RECURSO_ADM_COLUMNS.map(c => ({...c, group: 'Recurso'})),
    ...JUDICIAL_COLUMNS.map(c => ({...c, group: 'Judicial'})),
];

export const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({ rules, setRules, users, tags, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<WorkflowRule | null>(null);

  // --- ACTIONS ---

  const handleToggle = (rule: WorkflowRule) => {
      const updated = rules.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r);
      setRules(updated);
      showToast(rule.isActive ? 'Robô pausado.' : 'Robô ativado!', rule.isActive ? 'error' : 'success');
  };

  const handleDelete = (id: string) => {
      if(confirm('Remover este robô permanentemente?')) {
          setRules(rules.filter(r => r.id !== id));
          showToast('Robô removido.', 'success');
      }
  };

  const handleInstallTemplate = (template: any) => {
      const newRule: WorkflowRule = {
          id: `wr_tpl_${Date.now()}`,
          name: template.name,
          isActive: true,
          trigger: template.trigger,
          targetColumnId: template.targetColumnId,
          conditions: template.conditions || [],
          actions: template.actions || []
      };
      setRules([...rules, newRule]);
      showToast(`Robô "${template.name}" instalado e rodando!`, 'success');
  };

  const handleEdit = (rule: WorkflowRule) => {
      setEditForm(JSON.parse(JSON.stringify(rule)));
      setIsEditing(true);
  };

  const handleCreateNew = () => {
      const newRule: WorkflowRule = {
          id: `wr_${Date.now()}`,
          name: 'Nova Automação Personalizada',
          isActive: true,
          trigger: 'COLUMN_ENTER',
          targetColumnId: ADMIN_COLUMNS[0].id,
          conditions: [],
          actions: []
      };
      setEditForm(newRule);
      setIsEditing(true);
  };

  const handleSaveEdit = () => {
      if (!editForm || !editForm.name) return;
      
      const exists = rules.find(r => r.id === editForm.id);
      let newRules;
      
      if (exists) {
          newRules = rules.map(r => r.id === editForm.id ? editForm : r);
      } else {
          newRules = [...rules, editForm];
      }
      
      setRules(newRules);
      setIsEditing(false);
      setEditForm(null);
      showToast('Configurações do robô salvas!', 'success');
  };

  // --- SUB-HANDLERS FOR EDITOR ---
  const updateCondition = (idx: number, field: keyof WorkflowCondition, val: any) => {
      if(!editForm) return;
      const newC = [...editForm.conditions];
      newC[idx] = { ...newC[idx], [field]: val };
      setEditForm({...editForm, conditions: newC});
  };
  const addAction = () => { if(editForm) setEditForm({...editForm, actions: [...editForm.actions, { id: `wa_${Date.now()}`, type: 'ADD_TASK', payload: '' }]}) };
  const removeAction = (idx: number) => { if(editForm) { const n = [...editForm.actions]; n.splice(idx,1); setEditForm({...editForm, actions: n}); }};
  const updateAction = (idx: number, field: keyof WorkflowAction, val: any) => { if(editForm) { const n = [...editForm.actions]; n[idx] = { ...n[idx], [field]: val }; setEditForm({...editForm, actions: n}); }};

  // --- RENDER HELPERS ---
  const getActionLabel = (act: WorkflowAction) => {
      switch(act.type) {
          case 'ADD_TASK': return `Tarefa: "${act.payload}"`;
          case 'ADD_TAG': return `Etiqueta: "${act.payload}"`;
          case 'SET_URGENCY': return `Urgência: ${act.payload}`;
          case 'BLOCK_MOVE': return `Bloqueio: "${act.payload.substring(0,20)}..."`;
          case 'SEND_NOTIFICATION': return `Aviso: "${act.payload}"`;
          default: return act.type;
      }
  };

  const getColumnName = (colId: string) => {
      const col = ALL_COLUMNS.find(c => c.id === colId);
      return col ? `${col.group} > ${col.title}` : colId;
  };

  // --- MAIN VIEW ---
  if (!isEditing) {
      return (
          <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
              
              {/* HEADER AREA */}
              <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
                  <div>
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Bot className="text-indigo-600" /> Central de Robôs
                      </h2>
                      <p className="text-xs text-slate-500">Gerencie automações e instale novos fluxos de trabalho com um clique.</p>
                  </div>
                  <button 
                      onClick={handleCreateNew}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 flex items-center gap-2 transition-all shadow-md"
                  >
                      <Plus size={14}/> Criar do Zero
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 kanban-scroll">
                  
                  {/* SECTION 1: ACTIVE ROBOTS */}
                  <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Zap size={14} className="text-emerald-500"/> Meus Robôs ({rules.length})
                      </h3>
                      
                      {rules.length === 0 ? (
                          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                              <Bot size={48} className="mx-auto text-slate-200 mb-2"/>
                              <p className="text-slate-400 font-medium text-sm">Nenhum robô instalado.</p>
                              <p className="text-xs text-slate-400">Escolha um modelo abaixo para começar.</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {rules.map(rule => (
                                  <div key={rule.id} className={`bg-white rounded-xl border shadow-sm transition-all relative overflow-hidden group ${rule.isActive ? 'border-indigo-200 shadow-indigo-100' : 'border-slate-200 opacity-70 grayscale'}`}>
                                      {/* Header */}
                                      <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                                          <div className="flex-1 pr-2">
                                              <h4 className="font-bold text-slate-800 text-sm mb-1">{rule.name}</h4>
                                              <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit">
                                                  <ArrowRight size={10}/> Quando entrar em: 
                                              </div>
                                              <p className="text-[10px] font-bold text-indigo-600 mt-0.5 truncate" title={getColumnName(rule.targetColumnId)}>
                                                  {getColumnName(rule.targetColumnId)}
                                              </p>
                                          </div>
                                          <button 
                                              onClick={() => handleToggle(rule)}
                                              className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                              title={rule.isActive ? "Desligar Robô" : "Ligar Robô"}
                                          >
                                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${rule.isActive ? 'translate-x-3' : 'translate-x-0'}`}></div>
                                          </button>
                                      </div>

                                      {/* Body: Actions Preview */}
                                      <div className="p-4 bg-slate-50/50 h-24 overflow-hidden">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Ações Realizadas:</p>
                                          <ul className="space-y-1">
                                              {rule.actions.slice(0, 3).map((act, i) => (
                                                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2 truncate">
                                                      {act.type === 'ADD_TASK' ? <CheckSquare size={12} className="text-blue-400"/> : 
                                                       act.type === 'BLOCK_MOVE' ? <ShieldAlert size={12} className="text-red-400"/> :
                                                       <Zap size={12} className="text-yellow-500"/>}
                                                      <span className="truncate">{getActionLabel(act)}</span>
                                                  </li>
                                              ))}
                                              {rule.actions.length > 3 && (
                                                  <li className="text-[10px] text-slate-400 pl-5">
                                                      + {rule.actions.length - 3} outras ações...
                                                  </li>
                                              )}
                                          </ul>
                                      </div>

                                      {/* Footer */}
                                      <div className="p-2 border-t border-slate-100 flex justify-end gap-2 bg-white">
                                          <button onClick={() => handleEdit(rule)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Configurar">
                                              <Settings size={14}/>
                                          </button>
                                          <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                                              <Trash2 size={14}/>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* SECTION 2: TEMPLATE STORE */}
                  <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <LayoutTemplate size={14} className="text-blue-500"/> Modelos Prontos (Instalar em 1 Clique)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {AUTOMATION_TEMPLATES.map((tpl, idx) => (
                              <div key={idx} className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
                                  <div>
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                              <Bot size={20}/>
                                          </div>
                                      </div>
                                      <h4 className="font-bold text-slate-800 text-sm">{tpl.name}</h4>
                                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{tpl.description}</p>
                                      
                                      <div className="bg-white p-2 rounded border border-slate-100 mb-4">
                                          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Faz automaticamente:</div>
                                          {tpl.actions.slice(0, 2).map((act: any, i: number) => (
                                              <div key={i} className="text-[10px] text-slate-600 flex items-center gap-1 truncate">
                                                  <CheckSquare size={10} className="text-emerald-500"/> {act.payload}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  <button 
                                      onClick={() => handleInstallTemplate(tpl)}
                                      className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors shadow-sm"
                                  >
                                      <PlayCircle size={14}/> Instalar Agora
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
          </div>
      );
  }

  // --- EDITOR VIEW (MODAL-LIKE) ---
  return (
      <div className="flex flex-col h-full bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <Settings size={20}/>
                  </div>
                  <div>
                      <h2 className="text-sm font-bold text-slate-800">Configurar Robô</h2>
                      <p className="text-xs text-slate-500">Defina os gatilhos e ações.</p>
                  </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20}/>
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
              {editForm && (
                  <>
                      {/* Name & Status */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex gap-4">
                              <div className="flex-1">
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Robô</label>
                                  <input 
                                      className="w-full text-sm font-bold p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-100 outline-none"
                                      value={editForm.name}
                                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                  <button 
                                      onClick={() => setEditForm({...editForm, isActive: !editForm.isActive})}
                                      className={`px-4 py-2 rounded border text-xs font-bold flex items-center gap-2 ${editForm.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                  >
                                      <Power size={14}/> {editForm.isActive ? 'ATIVADO' : 'PAUSADO'}
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Trigger */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                          <h4 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
                              QUANDO (Gatilho)
                          </h4>
                          <div className="flex gap-4 items-center">
                              <span className="text-sm text-slate-600">Um processo entrar na fase:</span>
                              <select 
                                  className="flex-1 p-2 border border-slate-300 rounded text-sm bg-slate-50 font-medium outline-none"
                                  value={editForm.targetColumnId}
                                  onChange={e => setEditForm({...editForm, targetColumnId: e.target.value})}
                              >
                                  {ALL_COLUMNS.map(c => (
                                      <option key={c.id} value={c.id}>{c.group} - {c.title}</option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      {/* Conditions */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">2</div>
                                  E SE (Opcional)
                              </h4>
                              <button onClick={() => setEditForm({...editForm, conditions: [...editForm.conditions, { id: Date.now().toString(), type: 'TAG_CONTAINS', value: '' }]})} className="text-xs text-blue-600 font-bold hover:underline">+ Condição</button>
                          </div>
                          
                          {editForm.conditions.length === 0 && (
                              <p className="text-xs text-slate-400 italic pl-8">Sem restrições (aplica para todos).</p>
                          )}

                          <div className="space-y-2 pl-8">
                              {editForm.conditions.map((cond, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">SE</span>
                                      <select 
                                          className="p-1.5 border border-slate-300 rounded text-xs w-40"
                                          value={cond.type}
                                          onChange={e => updateCondition(idx, 'type', e.target.value)}
                                      >
                                          <option value="TAG_CONTAINS">Tem Etiqueta</option>
                                          <option value="BENEFIT_TYPE">Tipo Benefício</option>
                                          <option value="URGENCY_IS">Urgência é</option>
                                      </select>
                                      <input 
                                          className="flex-1 p-1.5 border border-slate-300 rounded text-xs"
                                          value={cond.value}
                                          onChange={e => updateCondition(idx, 'value', e.target.value)}
                                          placeholder="Valor..."
                                      />
                                      <button onClick={() => { const n = [...editForm.conditions]; n.splice(idx,1); setEditForm({...editForm, conditions: n}); }} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">3</div>
                                  ENTÃO (Ações)
                              </h4>
                              <button onClick={addAction} className="text-xs text-blue-600 font-bold hover:underline">+ Ação</button>
                          </div>

                          <div className="space-y-2 pl-8">
                              {editForm.actions.map((act, idx) => (
                                  <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                                      <span className="text-xs font-bold text-emerald-600">FAZER</span>
                                      <select 
                                          className="p-1.5 border border-slate-300 rounded text-xs w-40 font-bold text-slate-700"
                                          value={act.type}
                                          onChange={e => updateAction(idx, 'type', e.target.value)}
                                      >
                                          <option value="ADD_TASK">Criar Tarefa</option>
                                          <option value="ADD_TAG">Adicionar Etiqueta</option>
                                          <option value="SET_URGENCY">Mudar Urgência</option>
                                          <option value="BLOCK_MOVE">Bloquear Movimento</option>
                                      </select>
                                      <input 
                                          className="flex-1 p-1.5 border border-slate-300 rounded text-xs"
                                          value={act.payload}
                                          onChange={e => updateAction(idx, 'payload', e.target.value)}
                                          placeholder="Detalhes (ex: nome da tarefa, tag...)"
                                      />
                                      <button onClick={() => removeAction(idx)} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                                  </div>
                              ))}
                              {editForm.actions.length === 0 && (
                                  <p className="text-xs text-red-400 italic">Adicione pelo menos uma ação.</p>
                              )}
                          </div>
                      </div>
                  </>
              )}
          </div>

          <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-lg z-20">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded hover:bg-indigo-700 shadow-md">Salvar Robô</button>
          </div>
      </div>
  );
};
