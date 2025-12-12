
import React from 'react';
import { Users, CheckCircle, Clock, AlertOctagon } from 'lucide-react';
import { Case } from '../../types';

interface DashboardStats {
  total: number;
  rate: number;
  stagnatedCount: number;
  upcomingDeadlinesCount: number;
}

export const DashboardKPIs: React.FC<{ stats: DashboardStats, allCases?: Case[] }> = React.memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ativos</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={24} />
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Êxito</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-slate-800">{stats.rate}%</p>
                    <span className="text-xs text-green-600 font-bold">de concessão</span>
                </div>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle size={24} />
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estagnados (+90d)</p>
                <p className={`text-3xl font-bold ${stats.stagnatedCount > 0 ? 'text-orange-600' : 'text-slate-800'}`}>{stats.stagnatedCount}</p>
            </div>
            <div className={`p-3 rounded-lg ${stats.stagnatedCount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                <Clock size={24} />
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prazos na Semana</p>
                <p className={`text-3xl font-bold ${stats.upcomingDeadlinesCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.upcomingDeadlinesCount}</p>
            </div>
            <div className={`p-3 rounded-lg ${stats.upcomingDeadlinesCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                <AlertOctagon size={24} />
            </div>
        </div>
    </div>
  );
});
