
import React from 'react';
import { LayoutGrid, ShieldCheck } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 relative overflow-hidden">
        {/* Background blobs for aesthetics */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[80px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-100 rounded-full blur-[60px] opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center mb-6">
                <LayoutGrid size={32} className="text-white animate-spin-slow" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Rambo Prev</h1>
            <p className="text-sm text-slate-500 font-medium mb-8">Carregando escritório...</p>

            <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <ShieldCheck size={14} className="text-emerald-500"/>
                Ambiente Seguro & Criptografado
            </div>
        </div>
    </div>
  );
};
