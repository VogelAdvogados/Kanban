import React, { useState } from 'react';
import { User } from '../types';
import { Shield, ArrowRight, Lock } from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
  officeName: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin, officeName }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulation of network delay
    setTimeout(() => {
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            onLogin(user);
        } else {
            setError('Usuário não encontrado.');
            setIsLoading(false);
        }
    }, 800);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
        
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
                <span className="text-3xl font-bold text-white">{officeName.charAt(0)}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{officeName}</h1>
            <p className="text-blue-200 text-sm mt-1">Gestão Jurídica 4.2</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Selecione seu Usuário</label>
                <div className="relative">
                    <select 
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 text-white text-sm rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer transition-all hover:bg-slate-800"
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id} className="bg-slate-800">
                                {u.name} — {u.role === 'LAWYER' ? 'Advogado' : u.role === 'SECRETARY' ? 'Secretaria' : 'Outro'}
                            </option>
                        ))}
                    </select>
                    {/* Visual Avatar Helper */}
                    {selectedUser && (
                        <div 
                            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm pointer-events-none"
                            style={{ backgroundColor: selectedUser.color || '#64748b' }}
                        >
                            {selectedUser.avatarInitials}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Senha de Acesso</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/50 border border-slate-600 text-white text-sm rounded-xl pl-12 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-right italic">
                   (Senha simulada: qualquer valor entra)
                </p>
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        Acessar Sistema <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Shield size={12} /> Ambiente Seguro • Rambo Prev System
            </p>
        </div>
      </div>
    </div>
  );
};