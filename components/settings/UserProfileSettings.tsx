
import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Palette, Eye, EyeOff, UserCircle } from 'lucide-react';
import { User as UserType } from '../../types';
import { APP_THEMES } from '../../constants';

interface UserProfileSettingsProps {
  currentUser: UserType;
  users: UserType[];
  setUsers: (users: UserType[]) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ currentUser, users, setUsers, showToast }) => {
  const [profileForm, setProfileForm] = useState<UserType>(currentUser);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
      setProfileForm(currentUser);
  }, [currentUser]);

  const handleSave = () => {
      if (!profileForm.name.trim()) {
          showToast('O nome é obrigatório.', 'error');
          return;
      }

      // Generate Avatar Initials if Name changed
      const names = profileForm.name.trim().split(' ');
      let initials = names[0][0].toUpperCase();
      if (names.length > 1) {
          initials += names[names.length - 1][0].toUpperCase();
      }
      const updatedUser = { ...profileForm, avatarInitials: initials };

      const updatedUsersList = users.map(u => u.id === currentUser.id ? updatedUser : u);
      setUsers(updatedUsersList);
      showToast('Perfil atualizado com sucesso! (Recarregue para aplicar o tema se necessário)', 'success');
      
      // Force reload to apply theme immediately in App.tsx logic if context doesn't catch it
      // Ideally App.tsx listens to users/currentUser changes
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4">
        
        {/* Header */}
        <div className="pb-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <UserCircle className="text-blue-500" size={24}/> Meu Perfil
             </h3>
             <p className="text-xs text-slate-500">Gerencie seus dados de acesso e preferências visuais.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: PERSONAL DATA */}
            <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                        <User size={16} /> Dados de Acesso
                    </h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={profileForm.name}
                                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Usuário</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={profileForm.email || ''}
                                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                placeholder="seu.email@adv.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none pr-10"
                                    value={profileForm.password || ''}
                                    onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                                    placeholder="Definir nova senha..."
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: THEME CUSTOMIZATION */}
            <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                        <Palette size={16} className="text-purple-500" /> Personalização Visual
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">Escolha um tema para personalizar a aparência do sistema para você.</p>

                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 kanban-scroll">
                        {APP_THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setProfileForm({...profileForm, themePref: theme.id})}
                                className={`
                                    relative p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all group
                                    ${profileForm.themePref === theme.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}
                                `}
                            >
                                <div 
                                    className={`w-full h-8 rounded-lg shadow-sm ${theme.bgClass || 'bg-slate-200'}`}
                                    style={!theme.bgClass ? { background: theme.previewColor } : {}}
                                ></div>
                                <span className={`text-[10px] font-bold text-center ${profileForm.themePref === theme.id ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {theme.label}
                                </span>
                                {profileForm.themePref === theme.id && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
                onClick={handleSave}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform active:scale-95"
            >
                <Save size={18}/> Salvar Meu Perfil
            </button>
        </div>
    </div>
  );
};
