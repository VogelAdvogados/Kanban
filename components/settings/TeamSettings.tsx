
import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { User } from '../../types';
import { USER_COLORS } from '../../constants';

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
  const [userForm, setUserForm] = useState<{ name: string, role: User['role'], color: string }>({ 
      name: '', role: 'LAWYER', color: USER_COLORS[0] 
  });

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

  return (
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
  );
};
