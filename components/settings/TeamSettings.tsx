
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Clock, CheckCircle, XCircle, Palmtree, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { User } from '../../types';
import { USER_COLORS } from '../../constants';
import { hasPermission, parseLocalYMD } from '../../utils';
import { db } from '../../services/database'; // Import DB directly for atomic ops

interface TeamSettingsProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser?: User;
  addSystemLog?: (action: string, details: string, user: string, category: any) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({ users, setUsers, currentUser, addSystemLog, showToast }) => {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [userForm, setUserForm] = useState<{ name: string, email: string, password: string, role: User['role'], color: string }>({ 
      name: '', email: '', password: '', role: 'LAWYER', color: USER_COLORS[0] 
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const canManage = hasPermission(currentUser, 'MANAGE_USERS');

  const handleOpenEdit = (user?: User) => {
      if (!canManage) return; 
      setShowPassword(false); // Reset visual state
      
      if (user) {
          setEditingUserId(user.id);
          setUserForm({ 
              name: user.name, 
              email: user.email || '', 
              password: user.password || '', 
              role: user.role, 
              color: user.color || USER_COLORS[0] 
          });
      } else {
          setEditingUserId(null); // Adding new
          setUserForm({ 
              name: '', 
              email: '', 
              password: '123456', 
              role: 'LAWYER', 
              color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)] 
          });
      }
      setIsEditingUser(true);
  };

  const handleSaveUser = async () => {
      // Validações
      if (!userForm.name.trim()) { showToast('O nome do usuário é obrigatório.', 'error'); return; }
      if (!userForm.email.trim()) { showToast('O e-mail (login) é obrigatório.', 'error'); return; }
      if (!userForm.password.trim()) { showToast('A senha de acesso é obrigatória.', 'error'); return; }
      
      const emailExists = users.some(u => u.email === userForm.email && u.id !== editingUserId);
      if (emailExists) { showToast('Este e-mail já está em uso.', 'error'); return; }

      const names = userForm.name.trim().split(' ');
      let initials = names[0][0].toUpperCase();
      if (names.length > 1) initials += names[names.length - 1][0].toUpperCase();
      
      if (editingUserId) {
          // Edit: Update local + Full Save (Atomic update of single user not implemented for array edits yet, assumes low conflict on edit)
          const updatedUsers = users.map(u => u.id === editingUserId ? { ...u, ...userForm, avatarInitials: initials } : u);
          setUsers(updatedUsers);
          await db.saveUsers(updatedUsers); // Still uses saveUsers for edits
          
          if (addSystemLog && currentUser) {
              addSystemLog('Edição de Usuário', `Usuário "${userForm.name}" atualizado.`, currentUser.name, 'USER_MANAGEMENT');
          }
          showToast('Usuário atualizado com sucesso!', 'success');
      } else {
          // Create: Use Atomic Add
          const newUser: User = {
              id: `u_${Date.now()}`,
              name: userForm.name,
              email: userForm.email,
              password: userForm.password,
              role: userForm.role,
              avatarInitials: initials,
              color: userForm.color,
              lastLogin: undefined 
          };
          
          setUsers([...users, newUser]); // Optimistic UI
          await db.addUser(newUser); // Atomic DB Write
          
          if (addSystemLog && currentUser) {
              addSystemLog('Novo Usuário', `Usuário "${newUser.name}" criado.`, currentUser.name, 'USER_MANAGEMENT');
          }
          showToast('Usuário criado com sucesso!', 'success');
      }
      setIsEditingUser(false);
  };

  const handleDeleteUser = async (id: string) => {
      const userToDelete = users.find(u => u.id === id);
      if (confirm(`Tem certeza que deseja remover o usuário "${userToDelete?.name}"?`)) {
          const newUsers = users.filter(u => u.id !== id);
          setUsers(newUsers);
          await db.saveUsers(newUsers); // Hybrid approach for removal
          
          if (addSystemLog && currentUser && userToDelete) {
              addSystemLog('Exclusão de Usuário', `Usuário "${userToDelete.name}" removido.`, currentUser.name, 'USER_MANAGEMENT');
          }
          showToast('Usuário removido.', 'success');
      }
  };

  const getLastLoginLabel = (dateStr?: string) => {
      if (!dateStr) return <span className="text-slate-400 italic">Nunca</span>;
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) return <span className="text-green-600 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>;
      if (diffHours < 24) return <span className="text-slate-600">Hoje às {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>;
      if (diffDays < 7) return <span className="text-slate-500">{diffDays}d atrás</span>;
      return <span className="text-slate-400">{date.toLocaleDateString()}</span>;
  };

  const getVacationStatus = (user: User) => {
      if (!user.vacation || !user.vacation.start || !user.vacation.end) return null;
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = parseLocalYMD(user.vacation.start);
      const end = parseLocalYMD(user.vacation.end);

      if (start && end) {
          if (today >= start && today <= end) {
              return <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"><Palmtree size={10}/> Em Férias</span>;
          }
          if (today < start && (start.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000) {
              return <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"><Clock size={10}/> Férias em breve</span>;
          }
      }
      return null;
  };

  if (!canManage) {
      return (
          <div className="p-10 text-center text-slate-400">
              <XCircle size={48} className="mx-auto mb-4 opacity-20"/>
              <p>Você não tem permissão para gerenciar usuários.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
             <div>
                 <h3 className="font-bold text-slate-800 text-lg">Usuários do Sistema</h3>
                 <p className="text-xs text-slate-500">Gerencie quem tem acesso e monitore a atividade recente.</p>
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
                <h4 className="font-bold text-slate-800 text-sm mb-4">{editingUserId ? 'Editar Membro & Acesso' : 'Adicionar Membro & Acesso'}</h4>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                placeholder="Nome do Colaborador" 
                                className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={userForm.name}
                                onChange={e => setUserForm({...userForm, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo / Permissão</label>
                            <select 
                                className="w-full p-2 rounded border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                value={userForm.role}
                                onChange={e => setUserForm({...userForm, role: e.target.value as any})}
                            >
                                <option value="LAWYER">Advogado (Acesso Padrão)</option>
                                <option value="SECRETARY">Secretaria (Operacional)</option>
                                <option value="FINANCIAL">Financeiro (Visualização Restrita)</option>
                                <option value="ADMIN">Administrador (Total)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Mail size={12}/> E-mail (Login)
                            </label>
                            <input 
                                type="email" 
                                placeholder="usuario@adv.com" 
                                className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={userForm.email}
                                onChange={e => setUserForm({...userForm, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Lock size={12}/> Senha de Acesso
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha provisória" 
                                    className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none pr-8"
                                    value={userForm.password}
                                    onChange={e => setUserForm({...userForm, password: e.target.value})}
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                    type="button"
                                >
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
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

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 mt-2">
                        <button onClick={() => setIsEditingUser(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded">Cancelar</button>
                        <button onClick={handleSaveUser} className="px-6 py-2 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Salvar Usuário</button>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <div className="col-span-5">Usuário</div>
                <div className="col-span-3">Função</div>
                <div className="col-span-3">Último Acesso</div>
                <div className="col-span-1 text-right">Ações</div>
            </div>

            {users.map(user => (
                <div key={user.id} className="grid grid-cols-12 gap-4 items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 group transition-colors">
                    <div className="col-span-5 flex items-center gap-3">
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: user.color || '#94a3b8' }}
                        >
                            {user.avatarInitials}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{user.name} {user.id === currentUser?.id ? '(Eu)' : ''}</p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                            {getVacationStatus(user)}
                        </div>
                    </div>
                    
                    <div className="col-span-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'}`}>
                            {user.role}
                        </span>
                    </div>

                    <div className="col-span-3 text-xs flex items-center gap-2">
                        <Clock size={12} className="text-slate-400"/>
                        {getLastLoginLabel(user.lastLogin)}
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(user)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors" title="Editar">
                            <Pencil size={14} />
                        </button>
                        {users.length > 1 && user.id !== currentUser?.id && (
                            <button onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors" title="Excluir">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
