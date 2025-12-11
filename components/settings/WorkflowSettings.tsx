
import React, { useState } from 'react';
import { Workflow, Plus, Trash2, Save, ArrowRight, GitBranch, ShieldAlert, CheckSquare, UserCircle, Tag, Bell, Gauge } from 'lucide-react';
import { WorkflowRule, WorkflowCondition, WorkflowAction, User, SystemTag } from '../../types';
import { ADMIN_COLUMNS, AUX_DOENCA_COLUMNS, JUDICIAL_COLUMNS, RECURSO_ADM_COLUMNS, BENEFIT_OPTIONS } from '../../constants';

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
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<WorkflowRule | null>(null);

  const handleSelect = (rule: WorkflowRule) => {
      setSelectedRuleId(rule.id);
      setEditForm(JSON.parse(JSON.stringify(rule))); // Deep copy
  };

  const handleNew = () => {
      const newRule: WorkflowRule = {
          id: `wr_${Date.now()}`,
          name: 'Nova Automação',
          isActive: true,
          trigger: 'COLUMN_ENTER',
          targetColumnId: ADMIN_COLUMNS[0].id,
          conditions: [],
          actions: []
      };
      setEditForm(newRule);
      setSelectedRuleId(null);
  };

  const handleSave = () => {
      if (!editForm || !editForm.name) return;
      
      const exists = rules.find(r => r.id === editForm.id);
      let newRules;
      
      if (exists) {
          newRules = rules.map(r => r.id === editForm.id ? editForm : r);
      } else {
          newRules = [...rules, editForm];
      }
      
      setRules(newRules);
      setSelectedRuleId(editForm.id);
      showToast('Regra de automação salva!', 'success');
  };

  const handleDelete = () => {
      if (!editForm) return;
      if (confirm(`Excluir regra "${editForm.name}"?`)) {
          setRules(rules.filter(r => r.id !== editForm.id));
          setEditForm(null);
          setSelectedRuleId(null);
          showToast('Regra removida.', 'success');
      }
  };

  // --- Sub-components Handlers ---
  const addCondition = () => {
      if(!editForm) return;
      setEditForm({
          ...editForm,
          conditions: [...editForm.conditions, { id: `wc_${Date.now()}`, type: 'TAG_CONTAINS', value: '' }]
      });
  };

  const removeCondition = (idx: number) => {
      if(!editForm) return;
      const newC = [...editForm.conditions];
      newC.splice(idx, 1);
      setEditForm({...editForm, conditions: newC});
  };

  const updateCondition = (idx: number, field: keyof WorkflowCondition, val: any) => {
      if(!editForm) return;
      const newC = [...editForm.conditions];
      newC[idx] = { ...newC[idx], [field]: val };
      setEditForm({...editForm, conditions: newC});
  };

  const addAction = () => {
      if(!editForm) return;
      setEditForm({
          ...editForm,
          actions: [...editForm.actions, { id: `wa_${Date.now()}`, type: 'ADD_TASK', payload: '' }]
      });
  };

  const removeAction = (idx: number) => {
      if(!editForm) return;
      const newA = [...editForm.actions];
      newA.splice(idx, 1);
      setEditForm({...editForm, actions: newA});
  };

  const updateAction = (idx: number, field: keyof WorkflowAction, val: any) => {
      if(!editForm) return;
      const newA = [...editForm.actions];
      newA[idx] = { ...newA[idx], [field]: val };
      setEditForm({...editForm, actions: newA});
  };

  const getActionIcon = (type: string) => {
      switch(type) {
          case 'ADD_TASK': return <CheckSquare size={14}/>;
          case 'SET_RESPONSIBLE': return <UserCircle size={14}/>;
          case 'BLOCK_MOVE': return <ShieldAlert size={14}/>;
          case 'SET_URGENCY': return <Gauge size={14}/>;
          case 'ADD_TAG': return <Tag size={14}/>;
          case 'SEND_NOTIFICATION': return <Bell size={14}/>;
          default: return <ArrowRight size={14}/>;
      }
  };

  return (
    <div className="flex h-full gap-6 animate-in fade-in">
        {/* LIST */}
        <div className="w-64 flex flex-col border-r border-slate-100 pr-4">
            <button 
                onClick={handleNew}
                className="mb-4 w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-sm"
            >
                <Plus size={14}/> Nova Regra
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
                {rules.map(r => (
                    <button
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between group transition-colors ${editForm?.id === r.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                    >
                        <div className="truncate">
                            <span className="block font-bold">{r.name}</span>
                            <span className="text-[9px] text-slate-400 font-normal uppercase">{r.trigger === 'COLUMN_ENTER' ? 'Ao Entrar' : 'Gatilho'}</span>
                        </div>
                        {editForm?.id === r.id && <ArrowRight size={14} className="text-indigo-500"/>}
                    </button>
                ))}
            </div>
        </div>

        {/* EDITOR */}
        <div className="flex-1 flex flex-col overflow-y-auto">
            {editForm ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Workflow size={20}/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Editor de Fluxo</h4>
                                    <p className="text-xs text-slate-500">Defina o gatilho, condições e ações.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-slate-500 mr-2">Ativo?</label>
                                <input 
                                    type="checkbox" 
                                    className="toggle"
                                    checked={editForm.isActive}
                                    onChange={e => setEditForm({...editForm, isActive: e.target.checked})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome da Regra</label>
                            <input 
                                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                                value={editForm.name}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                placeholder="Ex: Checklist Triagem LOAS"
                            />
                        </div>
                    </div>

                    {/* Trigger */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4 relative">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 p-1 rounded-full text-slate-400">
                            <ArrowRight size={14}/>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">QUANDO (Gatilho)</label>
                            <div className="flex gap-2">
                                <select 
                                    className="p-2 rounded border border-slate-300 text-xs bg-white font-bold text-indigo-700"
                                    disabled
                                    value={editForm.trigger}
                                >
                                    <option value="COLUMN_ENTER">Entrar na Coluna</option>
                                </select>
                                <select 
                                    className="flex-1 p-2 rounded border border-slate-300 text-xs bg-white"
                                    value={editForm.targetColumnId}
                                    onChange={e => setEditForm({...editForm, targetColumnId: e.target.value})}
                                >
                                    {ALL_COLUMNS.map(col => (
                                        <option key={col.id} value={col.id}>
                                            {col.group}: {col.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                        <div className="absolute -left-3 top-8 bg-white border border-slate-200 p-1 rounded-full text-slate-400">
                            <GitBranch size={14}/>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">E SE (Condições Opcionais)</label>
                            <button onClick={addCondition} className="text-[10px] text-blue-600 font-bold hover:underline">+ Adicionar Condição</button>
                        </div>
                        
                        {editForm.conditions.length === 0 && (
                            <p className="text-xs text-slate-400 italic">Sempre executar (sem restrições).</p>
                        )}

                        <div className="space-y-2">
                            {editForm.conditions.map((cond, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <select 
                                        className="p-2 rounded border border-slate-300 text-xs w-40"
                                        value={cond.type}
                                        onChange={e => updateCondition(idx, 'type', e.target.value)}
                                    >
                                        <option value="TAG_CONTAINS">Tem a Etiqueta...</option>
                                        <option value="BENEFIT_TYPE">Tipo de Benefício é...</option>
                                        <option value="FIELD_EMPTY">Campo Vazio...</option>
                                        <option value="FIELD_NOT_EMPTY">Campo Preenchido...</option>
                                        <option value="URGENCY_IS">Urgência é...</option>
                                    </select>

                                    {cond.type === 'TAG_CONTAINS' ? (
                                        <select 
                                            className="flex-1 p-2 rounded border border-slate-300 text-xs"
                                            value={cond.value}
                                            onChange={e => updateCondition(idx, 'value', e.target.value)}
                                        >
                                            <option value="">Selecione...</option>
                                            {tags.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                                        </select>
                                    ) : cond.type === 'BENEFIT_TYPE' ? (
                                        <select 
                                            className="flex-1 p-2 rounded border border-slate-300 text-xs"
                                            value={cond.value}
                                            onChange={e => updateCondition(idx, 'value', e.target.value)}
                                        >
                                            <option value="">Selecione...</option>
                                            {BENEFIT_OPTIONS.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
                                        </select>
                                    ) : cond.type === 'URGENCY_IS' ? (
                                        <select 
                                            className="flex-1 p-2 rounded border border-slate-300 text-xs"
                                            value={cond.value}
                                            onChange={e => updateCondition(idx, 'value', e.target.value)}
                                        >
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">Alta</option>
                                            <option value="CRITICAL">Crítica</option>
                                        </select>
                                    ) : (
                                        <select 
                                            className="flex-1 p-2 rounded border border-slate-300 text-xs"
                                            value={cond.value}
                                            onChange={e => updateCondition(idx, 'value', e.target.value)}
                                        >
                                            <option value="">Selecione o campo...</option>
                                            <option value="govPassword">Senha Gov.br</option>
                                            <option value="phone">Telefone</option>
                                            <option value="cpf">CPF</option>
                                            <option value="protocolNumber">Protocolo</option>
                                        </select>
                                    )}

                                    <button onClick={() => removeCondition(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 relative">
                        <div className="absolute -left-3 top-8 bg-white border border-slate-200 p-1 rounded-full text-indigo-500">
                            <ArrowRight size={14}/>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-bold text-indigo-700 uppercase">ENTÃO (Ações)</label>
                            <button onClick={addAction} className="text-[10px] text-indigo-600 font-bold hover:underline">+ Adicionar Ação</button>
                        </div>

                        {editForm.actions.length === 0 && (
                            <p className="text-xs text-indigo-400 italic">Nenhuma ação definida.</p>
                        )}

                        <div className="space-y-2">
                            {editForm.actions.map((act, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-indigo-100">
                                    <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
                                        {getActionIcon(act.type)}
                                    </div>
                                    <select 
                                        className="p-1.5 rounded border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                                        value={act.type}
                                        onChange={e => updateAction(idx, 'type', e.target.value)}
                                    >
                                        <option value="ADD_TASK">Criar Tarefa</option>
                                        <option value="SET_RESPONSIBLE">Mudar Responsável</option>
                                        <option value="BLOCK_MOVE">Bloquear Movimento</option>
                                        <option value="SET_URGENCY">Definir Urgência</option>
                                        <option value="ADD_TAG">Adicionar Etiqueta</option>
                                        <option value="SEND_NOTIFICATION">Notificação Interna</option>
                                    </select>

                                    {act.type === 'ADD_TASK' ? (
                                        <input 
                                            className="flex-1 p-1.5 rounded border border-slate-200 text-xs"
                                            placeholder="Descrição da tarefa..."
                                            value={act.payload}
                                            onChange={e => updateAction(idx, 'payload', e.target.value)}
                                        />
                                    ) : act.type === 'SET_RESPONSIBLE' ? (
                                        <select 
                                            className="flex-1 p-1.5 rounded border border-slate-200 text-xs"
                                            value={act.payload}
                                            onChange={e => updateAction(idx, 'payload', e.target.value)}
                                        >
                                            <option value="">Selecione o usuário...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                        </select>
                                    ) : act.type === 'SET_URGENCY' ? (
                                        <select 
                                            className="flex-1 p-1.5 rounded border border-slate-200 text-xs"
                                            value={act.payload}
                                            onChange={e => updateAction(idx, 'payload', e.target.value)}
                                        >
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">Alta</option>
                                            <option value="CRITICAL">Crítica</option>
                                        </select>
                                    ) : act.type === 'ADD_TAG' ? (
                                        <input 
                                            className="flex-1 p-1.5 rounded border border-slate-200 text-xs"
                                            placeholder="Nome da Etiqueta"
                                            value={act.payload}
                                            onChange={e => updateAction(idx, 'payload', e.target.value)}
                                        />
                                    ) : act.type === 'SEND_NOTIFICATION' ? (
                                        <input 
                                            className="flex-1 p-1.5 rounded border border-slate-200 text-xs"
                                            placeholder="Mensagem da notificação..."
                                            value={act.payload}
                                            onChange={e => updateAction(idx, 'payload', e.target.value)}
                                        />
                                    ) : (
                                        <input 
                                            className="flex-1 p-1.5 rounded border border-red-200 text-xs text-red-700 placeholder-red-300"
                                            placeholder="Mensagem de erro para o usuário..."
                                            value={act.payload}
                                            onChange={e => updateAction(idx, 'payload', e.target.value)}
                                        />
                                    )}

                                    <button onClick={() => removeAction(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        {selectedRuleId && (
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-2"
                            >
                                <Trash2 size={14}/> Excluir
                            </button>
                        )}
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md flex items-center gap-2"
                        >
                            <Save size={14}/> Salvar Regra
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <Workflow size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium">Selecione uma regra para editar</p>
                    <p className="text-sm">ou crie uma nova automação.</p>
                </div>
            )}
        </div>
    </div>
  );
};
