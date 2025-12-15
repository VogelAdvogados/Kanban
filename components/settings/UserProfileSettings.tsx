
import React, { useState } from 'react';
import { User, Lock, Palette, Eye, EyeOff, Smile, Gavel, Scale, Briefcase, Shield, Palmtree, UserCheck, Check, Clock } from 'lucide-react';
import { User as UserType } from '../../types';
import { APP_THEMES, USER_COLORS } from '../../constants';

interface UserProfileSettingsProps {
  currentUser: UserType;
  setProfileForm: (u: UserType) => void;
}

const AVATAR_ICONS = [
    { id: 'User', icon: User },
    { id: 'Briefcase', icon: Briefcase },
    { id: 'Gavel', icon: Gavel },
    { id: 'Scale', icon: Scale },
    { id: 'Shield', icon: Shield },
    { id: 'Clock', icon: Clock },
];

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ currentUser, setProfileForm }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClearVacation = () => {
      setProfileForm({ ...currentUser, vacation: undefined });
  };

  const updateField = (field: keyof UserType, value: any) => {
      setProfileForm({ ...currentUser, [field]: value });
  };

  const updateVacation = (field: string, value: any) => {
      setProfileForm({ 
          ...currentUser, 
          vacation: { 
              ...currentUser.vacation, 
              [field]: value 
          } as any 
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: PERSONAL DATA & IDENTITY */}
        <div className="space-y-6">
            
            {/* 1. DADOS DE ACESSO */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Lock size={16} className="text-blue-500"/> Dados de Acesso
                </h4>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            value={currentUser.name}
                            onChange={e => updateField('name', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Usuário</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            value={currentUser.email || ''}
                            onChange={e => updateField('email', e.target.value)}
                            placeholder="seu.email@adv.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none pr-10"
                                value={currentUser.password || ''}
                                onChange={e => updateField('password', e.target.value)}
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

            {/* 2. AVATAR & IDENTIDADE */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Smile size={16} className="text-orange-500"/> Identidade Visual (Avatar)
                </h4>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor do Avatar</label>
                        <div className="flex gap-2 flex-wrap">
                            {USER_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => updateField('color', color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentUser.color === color ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ícone do Avatar</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => updateField('avatarIcon', undefined)}
                                className={`h-10 px-4 rounded-lg border transition-all text-xs font-bold ${!currentUser.avatarIcon ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                                Letras
                            </button>
                            {AVATAR_ICONS.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => updateField('avatarIcon', item.id)}
                                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${currentUser.avatarIcon === item.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                    title={item.id}
                                >
                                    <item.icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="flex items-center gap-3 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Pré-visualização:</span>
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
                            style={{ backgroundColor: currentUser.color || '#64748b' }}
                        >
                            {currentUser.avatarIcon ? (
                                (() => {
                                    const Icon = AVATAR_ICONS.find(i => i.id === currentUser.avatarIcon)?.icon || User;
                                    return <Icon size={20}/>;
                                })()
                            ) : (
                                <span>{currentUser.avatarInitials || currentUser.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: VACATION & THEME */}
        <div className="space-y-6">
            
            {/* 3. VACATION & ABSENCE */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Palmtree size={80} className="text-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2 relative z-10">
                    <Palmtree size={16} className="text-emerald-600"/> Modo Férias & Ausência
                </h4>
                <p className="text-xs text-slate-500 mb-4 relative z-10">
                    Configure seu período de ausência. O sistema irá bloquear agendamentos.
                </p>

                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Início</label>
                            <input 
                                type="date"
                                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                                value={currentUser.vacation?.start || ''}
                                onChange={e => updateVacation('start', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fim</label>
                            <input 
                                type="date"
                                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                                value={currentUser.vacation?.end || ''}
                                onChange={e => updateVacation('end', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <UserCheck size={12}/> Backup (Delegar Função)
                        </label>
                        <select 
                            className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
                            value={currentUser.vacation?.backupUserId || ''}
                            onChange={e => updateVacation('backupUserId', e.target.value)}
                        >
                            <option value="">Sem backup definido</option>
                            {/* Note: Users list should ideally be passed if we need to show others, but for simplicity we rely on ID here or pass props if needed */}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Quem responderá por você durante a ausência?</p>
                    </div>

                    {currentUser.vacation?.start && (
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                <Check size={14}/> Ausência Programada
                            </span>
                            <button 
                                onClick={handleClearVacation}
                                className="text-xs text-red-500 hover:text-red-700 font-bold underline"
                            >
                                Cancelar Férias
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. THEME */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Palette size={16} className="text-purple-500" /> Tema do Sistema
                </h4>
                <p className="text-xs text-slate-500 mb-4">Escolha a cor do cabeçalho e ambiente.</p>

                <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {APP_THEMES.map(theme => {
                        const isSelected = currentUser.themePref === theme.id;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => updateField('themePref', theme.id)}
                                className={`
                                    relative p-2 rounded-xl border-2 flex flex-col items-center gap-2 transition-all group
                                    ${isSelected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200 scale-105' : 'border-slate-100 hover:border-slate-300'}
                                `}
                            >
                                <div 
                                    className={`w-full h-12 rounded-lg shadow-sm bg-gradient-to-br ${theme.bgClass || 'bg-slate-200'} border border-black/5 overflow-hidden relative`}
                                    style={!theme.bgClass ? { background: theme.previewColor } : {}}
                                >
                                    <div className={`h-3 w-full ${theme.headerTop}`}></div>
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <div className="bg-white rounded-full p-0.5 shadow-sm">
                                                <Check size={12} className="text-blue-600" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[9px] font-bold text-center leading-tight truncate w-full ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                                    {theme.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};
