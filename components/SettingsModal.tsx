
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Upload, Shield, Users, Database, PaintBucket, Plus, Trash2, Save, Check, AlertTriangle, FileText, Pencil, RefreshCcw, Info, CheckCircle, Building, Image as ImageIcon } from 'lucide-react';
import { exportToCSV } from '../utils';
import { Case, User, DocumentTemplate, SystemLog, OfficeData } from '../types';
import { USER_COLORS, USERS as INITIAL_USERS } from '../constants';
import { TemplateManager } from './settings/TemplateManager';

interface SettingsModalProps {
  onClose: () => void;
  allCases: Case[];
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: User; // Logged user for audit
  onImportData: (data: Case[]) => void;
  officeData: OfficeData;
  setOfficeData: (data: OfficeData) => void;
  // Templates Props
  documentTemplates?: DocumentTemplate[];
  setDocumentTemplates?: (t: DocumentTemplate[]) => void;
  // Logging
  addSystemLog?: (action: string, details: string, user: string, category: SystemLog['category']) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, allCases, users, setUsers, currentUser, onImportData, officeData, setOfficeData,
    documentTemplates = [], setDocumentTemplates = (_: DocumentTemplate[]) => {},
    addSystemLog
}) => {
  const [activeTab, setActiveTab] = useState<'OFFICE' | 'TEAM' | 'BACKUP' | 'DOCUMENTS'>('OFFICE');
  
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Office Data Form State
  const [officeForm, setOfficeForm] = useState<OfficeData>(officeData);

  // Sync internal form when prop updates
  useEffect(() => {
    setOfficeForm(officeData);
  }, [officeData]);

  // Team Management State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [userForm, setUserForm] = useState<{ name: string, role: User['role'], color: string }>({ 
      name: '', role: 'LAWYER', color: USER_COLORS[0] 
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // --- HANDLERS ---

  const handleSaveOfficeData = () => {
    if (!officeForm.name.trim()) {
        showToast('O nome do escritório é obrigatório.', 'error');
        return;
    }
    setOfficeData(officeForm);
    if (addSystemLog && currentUser) {
        addSystemLog('Configuração do Escritório', 'Dados do escritório atualizados.', currentUser.name, 'SYSTEM');
    }
    showToast('Dados do escritório atualizados!', 'success');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('A imagem é muito grande (Máx 2MB).', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        if (ev.target?.result) {
            setOfficeForm(prev => ({ ...prev, logo: ev.target!.result as string }));
            showToast('Logo carregada com sucesso!', 'success');
        }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
      setOfficeForm(prev => ({ ...prev, logo: undefined }));
  };

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
      if (!userForm.name.trim()) {
          showToast('O nome do usuário é obrigatório.', 'error');
          return;
      }
      
      const names = userForm.name.trim().split(' ');
      let initials = names[0][0].toUpperCase();
      if (names.length > 1) {
          initials += names[names.length - 1][0].toUpperCase();
      }
      
      if (editingUserId) {
          setUsers(users.map(u => u.id === editingUserId ? { ...u, ...userForm, avatarInitials: initials } : u));
          if (addSystemLog && currentUser) {
              addSystemLog('Edição de Usuário', `Usuário "${userForm.name}" atualizado.`, currentUser.name, 'USER_MANAGEMENT');
          }
          showToast('Usuário atualizado com sucesso!', 'success');
      } else {
          const newUser: User = {
              id: `u_${Date.now()}`,
              name: userForm.name,
              role: userForm.role,
              avatarInitials: initials,
              color: userForm.color
          };
          setUsers([...users, newUser]);
          if (addSystemLog && currentUser) {
              addSystemLog('Novo Usuário', `Usuário "${newUser.name}" criado.`, currentUser.name, 'USER_MANAGEMENT');
          }
          showToast('Usuário criado com sucesso!', 'success');
      }
      setIsEditingUser(false);
  };

  const handleDeleteUser = (id: string) => {
      const userToDelete = users.find(u => u.id === id);
      if (confirm('Tem certeza que deseja remover este usuário?')) {
          setUsers(users.filter(u => u.id !== id));
          if (addSystemLog && currentUser && userToDelete) {
              addSystemLog('Exclusão de Usuário', `Usuário "${userToDelete.name}" removido.`, currentUser.name, 'USER_MANAGEMENT');
          }
          showToast('Usuário removido.', 'success');
      }
  };

  // --- NEW FULL EXPORT ---
  const handleExportJSON = () => {
      // Cria um pacote completo do sistema
      const systemBackup = {
          version: '2.0',
          timestamp: new Date().toISOString(),
          officeData: officeData,
          data: {
              cases: allCases,
              users: users,
              templates: documentTemplates
          }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemBackup, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `rambo_prev_FULL_BACKUP_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);

      if (addSystemLog && currentUser) {
          addSystemLog('Backup Completo', 'Download de backup completo do sistema realizado.', currentUser.name, 'SECURITY');
      }
      showToast('Backup gerado com sucesso!', 'success');
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
              
              // Verificação: É um backup novo (Objeto Completo) ou legado (Array de Casos)?
              if (json.version && json.data) {
                  // BACKUP COMPLETO V2
                  if (confirm(`Backup encontrado de: ${new Date(json.timestamp).toLocaleString()}.\nDeseja restaurar TUDO (Casos, Usuários e Modelos)?`)) {
                      onImportData(json.data.cases || []);
                      if (json.data.users) setUsers(json.data.users);
                      if (json.data.templates) setDocumentTemplates(json.data.templates);
                      if (json.officeData) setOfficeData(json.officeData);
                      else if (json.officeName) setOfficeData({ ...officeData, name: json.officeName });
                      
                      if (addSystemLog && currentUser) {
                          addSystemLog('Restauração de Backup', 'Backup completo restaurado.', currentUser.name, 'SECURITY');
                      }
                      
                      showToast('Sistema restaurado completamente!', 'success');
                      setTimeout(onClose, 1500);
                  }
              } else if (Array.isArray(json)) {
                  // BACKUP LEGADO V1 (Apenas Casos)
                  if (confirm('Este arquivo parece ser um backup antigo (apenas casos). Deseja importar?')) {
                      onImportData(json);
                      if (addSystemLog && currentUser) {
                          addSystemLog('Importação Legado', 'Importação de casos via JSON antigo.', currentUser.name, 'SECURITY');
                      }
                      showToast('Casos importados com sucesso!', 'success');
                      setTimeout(onClose, 1500);
                  }
              } else {
                  showToast('Arquivo inválido ou corrompido.', 'error');
              }
          } catch (error) {
              console.error(error);
              showToast('Erro crítico ao ler arquivo JSON.', 'error');
          }
      };
      reader.readAsText(fileObj);
  };

  const handleFactoryReset = () => {
      if (confirm('ATENÇÃO: Isso apagará TODOS os dados locais e restaurará o estado inicial de fábrica. Deseja continuar?')) {
          if (confirm('Tem certeza absoluta? Essa ação não pode ser desfeita.')) {
              localStorage.clear();
              window.location.reload();
          }
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* MODIFIED: Increased max-w-5xl to max-w-[90vw] for more space */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* TOAST NOTIFICATION */}
        {toast && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border ${toast.type === 'error' ? 'bg-red-600 border-red-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
                {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                <span className="font-bold text-sm">{toast.message}</span>
            </div>
        )}

        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-slate-500" /> Configurações do Sistema
            </h2>
            <button onClick={() => onClose()} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-56 bg-slate-50 border-r border-slate-200 p-3 space-y-1 hidden md:block">
                <button 
                    onClick={() => setActiveTab('OFFICE')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'OFFICE' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Building size={18}/> Dados do Escritório
                </button>
                <button 
                    onClick={() => setActiveTab('TEAM')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'TEAM' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Users size={18}/> Gestão de Equipe
                </button>
                <button 
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'DOCUMENTS' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <FileText size={18}/> Documentos & Modelos
                </button>
                <button 
                    onClick={() => setActiveTab('BACKUP')}
                    className={`w-full text-left p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'BACKUP' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Database size={18}/> Dados & Backup
                </button>
            </div>

            {/* MOBILE TAB BAR */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-10">
                 <button onClick={() => setActiveTab('OFFICE')} className={`p-2 ${activeTab === 'OFFICE' ? 'text-blue-600' : 'text-slate-400'}`}><Building size={20}/></button>
                 <button onClick={() => setActiveTab('TEAM')} className={`p-2 ${activeTab === 'TEAM' ? 'text-blue-600' : 'text-slate-400'}`}><Users size={20}/></button>
                 <button onClick={() => setActiveTab('DOCUMENTS')} className={`p-2 ${activeTab === 'DOCUMENTS' ? 'text-blue-600' : 'text-slate-400'}`}><FileText size={20}/></button>
                 <button onClick={() => setActiveTab('BACKUP')} className={`p-2 ${activeTab === 'BACKUP' ? 'text-blue-600' : 'text-slate-400'}`}><Database size={20}/></button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto bg-white mb-10 md:mb-0">
                
                {/* TAB: OFFICE DATA */}
                {activeTab === 'OFFICE' && (
                    <div className="space-y-6">
                        <div className="pb-4 border-b border-slate-100">
                             <h3 className="font-bold text-slate-800 text-lg">Informações do Escritório</h3>
                             <p className="text-xs text-slate-500">
                                 Estes dados aparecerão no cabeçalho e serão usados para preenchimento automático de documentos.
                             </p>
                        </div>
                        
                        {/* Logo Upload Section */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-6">
                            <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative overflow-hidden group">
                                {officeForm.logo ? (
                                    <img src={officeForm.logo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="text-slate-300" size={32} />
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => logoInputRef.current?.click()} className="text-white text-xs font-bold">Alterar</button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-700 mb-1">Logotipo do Escritório</h4>
                                <p className="text-xs text-slate-500 mb-3">Carregue uma imagem (PNG/JPG) para usar nos documentos gerados.</p>
                                <div className="flex gap-2">
                                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg" className="hidden" />
                                    <button 
                                        onClick={() => logoInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        Carregar Imagem
                                    </button>
                                    {officeForm.logo && (
                                        <button 
                                            onClick={handleRemoveLogo}
                                            className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 font-bold"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Escritório (Exibido no Cabeçalho)</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={officeForm.name}
                                        onChange={e => setOfficeForm({...officeForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ</label>
                                    <input 
                                        type="text" 
                                        placeholder="00.000.000/0001-00"
                                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={officeForm.cnpj || ''}
                                        onChange={e => setOfficeForm({...officeForm, cnpj: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OAB / Registro</label>
                                    <input 
                                        type="text" 
                                        placeholder="OAB/UF 00000"
                                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={officeForm.oab || ''}
                                        onChange={e => setOfficeForm({...officeForm, oab: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Rua Exemplo, 123, Bairro, Cidade - UF, CEP"
                                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                        value={officeForm.address || ''}
                                        onChange={e => setOfficeForm({...officeForm, address: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / WhatsApp</label>
                                    <input 
                                        type="text" 
                                        placeholder="(00) 00000-0000"
                                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={officeForm.phone || ''}
                                        onChange={e => setOfficeForm({...officeForm, phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail de Contato</label>
                                    <input 
                                        type="email" 
                                        placeholder="contato@advocacia.com.br"
                                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={officeForm.email || ''}
                                        onChange={e => setOfficeForm({...officeForm, email: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={handleSaveOfficeData}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2"
                            >
                                <Save size={16}/> Salvar Alterações
                            </button>
                        </div>
                    </div>
                )}

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

                {/* TAB: DOCUMENTS (TEMPLATES) */}
                {activeTab === 'DOCUMENTS' && (
                    <TemplateManager 
                        templates={documentTemplates} 
                        setTemplates={setDocumentTemplates} 
                        currentUser={currentUser}
                        addSystemLog={addSystemLog}
                        showToast={showToast}
                        officeData={officeData}
                    />
                )}

                {/* TAB: BACKUP */}
                {activeTab === 'BACKUP' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">Cópia de Segurança</h3>
                            <p className="text-sm text-slate-500 mb-6">Exporte seus dados regularmente para evitar perdas.</p>

                            {/* MANUAL DE EXPORTAÇÃO EMBUTIDO */}
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6">
                                <h4 className="text-xs font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                                    <Info size={14}/> Manual de Exportação: Qual escolher?
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                                        <strong className="block text-blue-900 mb-1">Backup Completo (.JSON)</strong>
                                        <p className="text-slate-600 leading-relaxed">
                                            Exporta <strong>TUDO</strong>: Processos, Clientes, Histórico, Usuários Cadastrados, Cores e Modelos de Documentos personalizados.
                                            <br/><br/>
                                            <em className="text-blue-600">Use este arquivo se precisar trocar de computador ou formatar a máquina. Ele restaura o escritório inteiro.</em>
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                                        <strong className="block text-slate-800 mb-1">Relatório Simples (.CSV)</strong>
                                        <p className="text-slate-600 leading-relaxed">
                                            Exporta apenas uma tabela simples com dados básicos (Nome, CPF, Status) para ser aberta no <strong>Excel</strong>.
                                            <br/><br/>
                                            <em className="text-slate-500">Use este arquivo apenas para criar planilhas ou relatórios gerenciais externos. Não serve para restaurar o sistema.</em>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                                        <Download size={20}/>
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1">Backup Completo (.JSON)</h4>
                                    <p className="text-xs text-slate-500 mb-4 h-10">Exporta Casos, Usuários e Configurações para restauração total.</p>
                                    <button 
                                        onClick={() => handleExportJSON()}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                                    >
                                        Baixar Backup Completo
                                    </button>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
                                    <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
                                        <FileText className="lucide" size={20}/> 
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1">Relatório Excel (.CSV)</h4>
                                    <p className="text-xs text-slate-500 mb-4 h-10">Exporta tabela simples para leitura em planilhas.</p>
                                    <button 
                                        onClick={() => exportToCSV(allCases)}
                                        className="w-full py-2 bg-white border border-slate-300 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50"
                                    >
                                        Baixar Planilha
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
                                            Ao importar um backup JSON, os dados atuais serão <strong>substituídos</strong>. Certifique-se de que está carregando o arquivo correto.
                                        </p>
                                        <input 
                                            type="file" 
                                            accept=".json" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={handleFileChange}
                                        />
                                        <button 
                                            onClick={() => handleImportClick()}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm"
                                        >
                                            Selecionar Backup (.JSON) para Restaurar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                 <div>
                                     <p className="text-xs font-bold text-slate-500">Reset de Fábrica</p>
                                     <p className="text-[10px] text-slate-400">Apaga tudo e volta ao estado inicial.</p>
                                 </div>
                                 <button 
                                     onClick={handleFactoryReset}
                                     className="text-xs text-red-400 hover:text-red-600 underline"
                                 >
                                     Limpar Tudo
                                 </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
