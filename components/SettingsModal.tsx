
import React, { useState, useRef } from 'react';
import { X, Download, Upload, Moon, Sun, Shield, Users, Database, PaintBucket, Plus, Trash2, Save, Check, AlertTriangle, FileText, Pencil, RefreshCcw } from 'lucide-react';
import { exportToCSV } from '../utils';
import { Case, User } from '../types';
import { USER_COLORS, USERS as INITIAL_USERS, INITIAL_CASES } from '../constants';

interface SettingsModalProps {
  onClose: () => void;
  allCases: Case[];
  users: User[];
  setUsers: (users: User[]) => void;
  onImportData: (data: Case[]) => void;
  officeName: string;
  setOfficeName: (name: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, allCases, users, setUsers, onImportData, officeName, setOfficeName 
}) => {
  const [activeTab, setActiveTab] = useState<'TEAM' | 'BACKUP' | 'APPEARANCE'>('TEAM');
  const [darkMode, setDarkMode] = useState(false);
  
  // Team Management State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [userForm, setUserForm] = useState<{ name: string, role: User['role'], color: string }>({ 
      name: '', role: 'LAWYER', color: USER_COLORS[0] 
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleOpenEdit = (user?: User) => {
      if (user) {
          setEditingUserId(user.id);
          setUserForm({ name: user.name, role: user.role, color: user.color || USER_COLORS[0] });
      } else {
          setEditingUserId(null); // Adding new
          setUserForm({ name: '', role: 'LAWYER', color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)] });
      }
      setIsEditingUser(true);
  };

  const handleSaveUser = () => {
      if (!userForm.name.trim()) return;
      
      const names = userForm.name.trim().split(' ');
      let initials = names[0][0].toUpperCase();
      if (names.length > 1) {
          initials += names[names.length - 1][0].toUpperCase();
      }
      
      if (editingUserId) {
          // Update existing
          setUsers(users.map(u => u.id === editingUserId ? { ...u, ...userForm, avatarInitials: initials } : u));
      } else {
          // Add new
          const newUser: User = {
              id: `u_${Date.now()}`,
              name: userForm.name,
              role: userForm.role,
              avatarInitials: initials,
              color: userForm.color
          };
          setUsers([...users, newUser]);
      }
      setIsEditingUser(false);
  };

  const handleDeleteUser = (id: string) => {
      if (confirm('Tem certeza que deseja remover este usuário?')) {
          setUsers(users.filter(u => u.id !== id));
      }
  };

  const handleExportJSON = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCases, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `rambo_prev_full_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files && event.target.files[0];
      if (!fileObj) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              if (Array.isArray(json)) {
                  onImportData(json);
                  alert('Dados restaurados com sucesso!');
                  onClose();
              } else {
                  alert('Arquivo inválido. O formato deve ser um array de casos.');
              }
          } catch (error) {
              alert('Erro ao ler arquivo JSON.');
          }
      };
      reader.readAsText(fileObj);
  };

  const handleFactoryReset = () => {
      if (confirm('ATENÇÃO: Isso apagará TODOS os dados locais e restaurará o estado inicial de fábrica. Deseja continuar?')) {
          if (confirm('Tem certeza absoluta? Essa ação não pode ser desfeita.')) {
              localStorage.clear();
              // Reset states handled by props if needed, or simply reload
              window.location.reload();
          }
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[600px]">
        
        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-slate-500" /> Configurações do Sistema
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-56 bg-slate-50 border-r border-slate-200 p-3 space-y-1">
                <button 
                    onClick={() => setActiveTab('TEAM')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'TEAM' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Users size={18}/> Gestão de Equipe
                </button>
                <button 
                    onClick={() => setActiveTab('BACKUP')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'BACKUP' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Database size={18}/> Dados & Backup
                </button>
                <button 
                    onClick={() => setActiveTab('APPEARANCE')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'APPEARANCE' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <PaintBucket size={18}/> Personalização
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto bg-white">
                
                {/* TAB: TEAM */}
                {activeTab === 'TEAM' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                             <div>
                                 <h3 className="font-bold text-slate-800 text-lg">Usuários do Sistema</h3>
                                 <p className="text-xs text-slate-500">Gerencie quem tem acesso e pode ser responsável por tarefas.</p>
                             </div>
                             <button 
                                onClick={() => handleOpenEdit()}
                                className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2"
                             >
                                 <Plus size={16}/> Novo Usuário
                             </button>
                        </div>
                        
                        {isEditingUser && (
                            <div className="bg-slate-50 p-5 rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-top-2">
                                <h4 className="font-bold text-slate-800 text-sm mb-4">{editingUserId ? 'Editar Membro' : 'Adicionar Membro'}</h4>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                                            <input 
                                                type="text" 
                                                placeholder="Nome Completo" 
                                                className="w-full p-2 rounded border border-slate-300 text-sm"
                                                value={userForm.name}
                                                onChange={e => setUserForm({...userForm, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label>
                                            <select 
                                                className="w-full p-2 rounded border border-slate-300 text-sm bg-white"
                                                value={userForm.role}
                                                onChange={e => setUserForm({...userForm, role: e.target.value as any})}
                                            >
                                                <option value="LAWYER">Advogado</option>
                                                <option value="SECRETARY">Secretaria</option>
                                                <option value="FINANCIAL">Financeiro</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor de Identificação</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {USER_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setUserForm({...userForm, color})}
                                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${userForm.color === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2">
                                        <button onClick={() => setIsEditingUser(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded">Cancelar</button>
                                        <button onClick={handleSaveUser} className="px-6 py-2 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Salvar Usuário</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 group transition-colors">
                                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleOpenEdit(user)}>
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                                            style={{ backgroundColor: user.color || '#64748b' }}
                                        >
                                            {user.avatarInitials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{user.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 rounded-full font-bold uppercase">{user.role === 'LAWYER' ? 'Advogado' : user.role === 'SECRETARY' ? 'Secretaria' : user.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEdit(user)} className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50">
                                            <Pencil size={16} />
                                        </button>
                                        {users.length > 1 && (
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: BACKUP */}
                {activeTab === 'BACKUP' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">Cópia de Segurança</h3>
                            <p className="text-sm text-slate-500 mb-6">Exporte seus dados regularmente para evitar perdas.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                                        <Download size={20}/>
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1">Backup Completo (.JSON)</h4>
                                    <p className="text-xs text-slate-500 mb-4 h-10">Ideal para restauração do sistema. Contém histórico, tarefas e configurações.</p>
                                    <button 
                                        onClick={handleExportJSON}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                                    >
                                        Baixar JSON
                                    </button>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
                                    <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
                                        <FileText className="lucide" size={20}/> 
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1">Relatório Simples (.CSV)</h4>
                                    <p className="text-xs text-slate-500 mb-4 h-10">Ideal para Excel. Contém apenas dados tabulares básicos.</p>
                                    <button 
                                        onClick={() => exportToCSV(allCases)}
                                        className="w-full py-2 bg-white border border-slate-300 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50"
                                    >
                                        Baixar Excel
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2">
                                <Upload size={20} className="text-orange-500"/> Restaurar Dados
                            </h3>
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="text-orange-600 flex-shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm text-orange-800 font-bold mb-1">Atenção: Ação Irreversível</p>
                                        <p className="text-xs text-orange-700 mb-4">
                                            Ao importar um backup, todos os dados atuais serão substituídos pelos dados do arquivo. Certifique-se de que está carregando o arquivo correto.
                                        </p>
                                        <input 
                                            type="file" 
                                            accept=".json" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={handleFileChange}
                                        />
                                        <button 
                                            onClick={handleImportClick}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm"
                                        >
                                            Selecionar Arquivo de Backup (.JSON)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FACTORY RESET - DANGER ZONE */}
                        <div className="border-t border-red-100 pt-6 mt-6">
                            <h3 className="font-bold text-red-800 text-lg mb-1 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-red-600"/> Zona de Perigo
                            </h3>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-900 font-bold">Reset de Fábrica</p>
                                    <p className="text-xs text-red-700">Apaga todo o banco de dados local e restaura o estado inicial.</p>
                                </div>
                                <button 
                                    onClick={handleFactoryReset}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm flex items-center gap-2"
                                >
                                    <RefreshCcw size={14} /> Resetar Sistema
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: APPEARANCE */}
                {activeTab === 'APPEARANCE' && (
                    <div className="space-y-6">
                        <div>
                             <h3 className="font-bold text-slate-800 text-lg mb-4">Identidade Visual</h3>
                             
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Escritório</label>
                                     <div className="flex gap-2">
                                         <input 
                                            type="text" 
                                            value={officeName} 
                                            onChange={(e) => setOfficeName(e.target.value)}
                                            className="flex-1 border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-700" 
                                         />
                                     </div>
                                     <p className="text-xs text-slate-400 mt-1">Este nome aparecerá no cabeçalho do sistema.</p>
                                 </div>
                             </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${darkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {darkMode ? <Moon size={20}/> : <Sun size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Modo Escuro (Beta)</p>
                                        <p className="text-xs text-slate-500">Altere o tema visual do sistema para reduzir cansaço visual.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center pt-10">
                             <p className="text-xs text-slate-400 font-mono">Versão 4.2.0 (Build 2024)</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};
