
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[60px] opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            {/* NEW LOGO: REEF KNOT (Weave) */}
            <div className="w-24 h-24 mb-6 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="loadBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#1e3a8a" />
                        </linearGradient>
                        <linearGradient id="loadGreen" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#15803d" />
                        </linearGradient>
                    </defs>
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(45 50 50)" stroke="url(#loadBlue)" strokeWidth="14" strokeLinecap="round" />
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(-45 50 50)" stroke="url(#loadGreen)" strokeWidth="14" strokeLinecap="round" />
                    <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(45 50 50)" stroke="url(#loadBlue)" strokeWidth="14" strokeLinecap="round" strokeDasharray="30 100" strokeDashoffset="-78" pathLength="100" />
                </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Rambo Prev</h1>
            <div className="flex items-center gap-2 mb-8">
                <p className="text-sm text-slate-400 font-medium">Carregando escritório...</p>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">v4.4 Stable</span>
            </div>

            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-progress"></div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs text-emerald-500 font-semibold opacity-80">
                <ShieldCheck size={14} />
                Ambiente Seguro & Criptografado
            </div>
        </div>
    </div>
  );
};
