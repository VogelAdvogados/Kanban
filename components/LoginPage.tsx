
import React, { useState } from 'react';
import { User } from '../types';
import { Shield, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
  officeName: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin, officeName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for effect
    setTimeout(() => {
        // Encontrar usuário por e-mail ou nome (case insensitive)
        const normalizedInput = email.toLowerCase().trim();
        const user = users.find(u => 
            (u.email && u.email.toLowerCase().trim() === normalizedInput) ||
            (u.name.toLowerCase().trim() === normalizedInput)
        );
        
        if (user) {
            // Check password. Default is '123456' if undefined (legacy users)
            const validPassword = user.password || '123456';
            
            if (password === validPassword) {
                onLogin(user);
            } else {
                setError('Senha incorreta.');
                setIsLoading(false);
            }
        } else {
            setError('Credenciais inválidas.');
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        
        <div className="text-center mb-10">
            {/* LOGO: INTERLACED REEF KNOT (Reference Geometry) */}
            <div className="w-24 h-24 mx-auto mb-6 relative hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky 500 */}
                            <stop offset="100%" stopColor="#1e3a8a" /> {/* Blue 900 */}
                        </linearGradient>
                        <linearGradient id="greenGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" /> {/* Emerald 500 */}
                            <stop offset="100%" stopColor="#15803d" /> {/* Green 700 */}
                        </linearGradient>
                    </defs>
                    
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(45 50 50)" stroke="url(#blueGrad)" strokeWidth="14" strokeLinecap="round" />
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(-45 50 50)" stroke="url(#greenGrad)" strokeWidth="14" strokeLinecap="round" />
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(45 50 50)" stroke="url(#blueGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="30 100" strokeDashoffset="-78" pathLength="100" />
                    
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(45 50 50)" stroke="white" strokeWidth="1" strokeOpacity="0.2" fill="none" pointerEvents="none"/>
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(-45 50 50)" stroke="white" strokeWidth="1" strokeOpacity="0.2" fill="none" pointerEvents="none"/>
                </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans">Acesse sua conta</h1>
            <p className="text-slate-400 text-sm mt-2">Bem-vindo ao sistema {officeName}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">E-mail Corporativo</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="nome@vogel.adv.br"
                        className={`w-full bg-slate-900/50 border text-white text-sm rounded-xl pl-12 p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600 ${error ? 'border-red-500' : 'border-slate-700'}`}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Senha</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        className={`w-full bg-slate-900/50 border text-white text-sm rounded-xl pl-12 p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600 ${error ? 'border-red-500' : 'border-slate-700'}`}
                    />
                </div>
                {error && (
                    <div className="mt-3 text-red-400 text-xs font-bold animate-pulse flex items-center gap-1 bg-red-900/20 p-2 rounded-lg border border-red-900/50">
                        <Shield size={12}/> {error}
                    </div>
                )}
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 group"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        Entrar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
            <p className="text-[10px] text-slate-500 font-medium">
                Esqueceu a senha? Contate o administrador do escritório.
            </p>
            <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1.5 font-medium opacity-60">
                <Shield size={10} /> Sistema protegido por Rambo Prev
            </p>
        </div>
      </div>
    </div>
  );
};
