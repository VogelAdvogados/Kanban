
import React from 'react';
import { Users, CheckCircle, Clock, AlertOctagon, TrendingUp, BarChart } from 'lucide-react';
import { Case } from '../../types';

interface DashboardStats {
  total: number;
  rate: number;
  stagnatedCount: number;
  upcomingDeadlinesCount: number;
  concededCases?: Case[];
  deniedCases?: Case[];
}

interface DashboardKPIsProps {
    stats: DashboardStats;
    allCases?: Case[];
    onDrillDown?: (type: 'TOTAL' | 'SUCCESS' | 'STAGNATED' | 'DEADLINES') => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = React.memo(({ stats, onDrillDown }) => {
  const handleClick = (type: 'TOTAL' | 'SUCCESS' | 'STAGNATED' | 'DEADLINES') => {
      if (onDrillDown) onDrillDown(type);
  };

  // SVG Calculations for Donut Chart
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const successOffset = circumference - (stats.rate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* CARD 1: TOTAL ATIVOS */}
        <div 
            onClick={() => handleClick('TOTAL')}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-95 group relative overflow-hidden"
        >
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-50 to-transparent opacity-50"></div>
            <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors mb-1">Total Ativos</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                    <TrendingUp size={10} className="text-blue-500"/> Carteira Total
                </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors z-10">
                <Users size={24} />
            </div>
        </div>

        {/* CARD 2: TAXA DE ÊXITO (DONUT CHART) */}
        <div 
            onClick={() => handleClick('SUCCESS')}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between cursor-pointer hover:border-green-300 hover:shadow-md transition-all active:scale-95 group"
        >
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-green-500 transition-colors mb-1">Taxa de Êxito</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-slate-800">{stats.rate}%</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-bold">
                    <CheckCircle size={10}/> Concessões
                </div>
            </div>
            {/* SVG DONUT CHART */}
            <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <circle 
                        cx="28" cy="28" r={radius} 
                        stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={successOffset} 
                        strokeLinecap="round"
                        className="text-green-500 transition-all duration-1000 ease-out" 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart size={16} className="text-green-600 opacity-50"/>
                </div>
            </div>
        </div>

        {/* CARD 3: ESTAGNADOS (PROGRESS BAR) */}
        <div 
            onClick={() => handleClick('STAGNATED')}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all active:scale-95 group flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">Estagnados (+90d)</p>
                    <p className={`text-3xl font-bold ${stats.stagnatedCount > 0 ? 'text-orange-600' : 'text-slate-800'}`}>{stats.stagnatedCount}</p>
                </div>
                <div className={`p-2 rounded-lg transition-colors ${stats.stagnatedCount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Clock size={20} />
                </div>
            </div>
            {/* Custom Mini Bar Chart Visual */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div className="h-full bg-orange-300" style={{ width: '20%' }}></div>
                <div className="h-full bg-orange-400" style={{ width: '30%' }}></div>
                <div className="h-full bg-orange-500" style={{ width: '50%' }}></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1 text-right">Fila de espera</p>
        </div>

        {/* CARD 4: PRAZOS (RADAR) */}
        <div 
            onClick={() => handleClick('DEADLINES')}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-red-300 hover:shadow-md transition-all active:scale-95 group flex flex-col justify-between relative overflow-hidden"
        >   
            {/* Background Pulse Effect if Critical */}
            {stats.upcomingDeadlinesCount > 0 && (
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full animate-pulse opacity-50"></div>
            )}

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-red-500 transition-colors">Prazos na Semana</p>
                    <p className={`text-3xl font-bold ${stats.upcomingDeadlinesCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.upcomingDeadlinesCount}</p>
                </div>
                <div className={`p-2 rounded-lg transition-colors ${stats.upcomingDeadlinesCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                    <AlertOctagon size={20} />
                </div>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] text-slate-400 relative z-10">
                {stats.upcomingDeadlinesCount === 0 ? (
                    <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Em dia</span>
                ) : (
                    <span className="text-red-500 font-bold">Ação Necessária</span>
                )}
            </div>
        </div>
    </div>
  );
});
