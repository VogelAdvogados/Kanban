import React, { useMemo } from 'react';
import { Case } from '../types';
import { PieChart, BarChart, Calendar, AlertTriangle, TrendingUp, Users, Clock, Briefcase, CheckCircle, AlertOctagon, Layers, ArrowRight, MessageCircle } from 'lucide-react';
import { getDaysSince, getDaysDiff, formatDate, parseLocalYMD } from '../utils';
import { VIEW_CONFIG, WHATSAPP_TEMPLATES } from '../constants';

interface DashboardProps {
  cases: Case[];
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ cases, onClose }) => {
  
  // 1. Statistics Calculation
  const stats = useMemo(() => {
    const total = cases.length;
    
    // Concessions vs Denials
    const conceded = cases.filter(c => 
        ['adm_concluido', 'aux_ativo', 'jud_transito', 'jud_cumprimento', 'jud_rpv'].includes(c.columnId)
    ).length;
    
    const denied = cases.filter(c => 
        ['aux_indeferido', 'rec_resultado'].includes(c.columnId)
    ).length;

    const rate = (conceded + denied) > 0 ? Math.round((conceded / (conceded + denied)) * 100) : 0;

    // Workload by Responsible
    const workloadMap: Record<string, number> = {};
    cases.forEach(c => {
        const name = c.responsibleName.split(' ')[0] + ' ' + (c.responsibleName.split(' ')[1]?.[0] || '') + '.'; // Short name
        workloadMap[name] = (workloadMap[name] || 0) + 1;
    });
    const workload = Object.entries(workloadMap).sort((a, b) => b[1] - a[1]);

    // Distribution by View
    const viewMap: Record<string, number> = {};
    cases.forEach(c => {
        viewMap[c.view] = (viewMap[c.view] || 0) + 1;
    });

    // Stagnated Cases (> 90 days)
    const stagnatedCases = cases.filter(c => {
        const days = getDaysSince(c.lastUpdate);
        return days !== null && days > 90;
    }).sort((a, b) => getDaysSince(b.lastUpdate)! - getDaysSince(a.lastUpdate)!);

    // Upcoming Deadlines (Next 7 days)
    const upcomingDeadlines = cases.filter(c => {
        const diff = getDaysDiff(c.deadlineEnd);
        return diff !== null && diff >= 0 && diff <= 7;
    }).sort((a, b) => getDaysDiff(a.deadlineEnd)! - getDaysDiff(b.deadlineEnd)!);

    // Bottlenecks
    const bottleneckMap: Record<string, number> = {};
    cases.forEach(c => {
        if (!bottleneckMap[c.columnId]) bottleneckMap[c.columnId] = 0;
        bottleneckMap[c.columnId]++;
    });
    const bottlenecks = Object.entries(bottleneckMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); 

    // Birthdays TODAY
    const today = new Date();
    const birthdaysToday = cases.filter(c => {
        if(!c.birthDate) return false;
        const bdate = parseLocalYMD(c.birthDate);
        if(!bdate) return false;
        return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
    });

    return { total, conceded, denied, rate, bottlenecks, birthdaysToday, workload, viewMap, stagnatedCases, upcomingDeadlines };
  }, [cases]);

  const handleSendBirthday = (c: Case) => {
    if(!c.phone) {
        alert("Cliente sem telefone.");
        return;
    }
    const template = WHATSAPP_TEMPLATES.find(t => t.id === 't_aniversario');
    if(!template) return;

    const message = template.text.replace('{NOME}', c.clientName.split(' ')[0]);
    const cleanPhone = c.phone.replace(/\D/g, '');
    const finalNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    
    window.open(`https://wa.me/${finalNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> Painel de Gestão Estratégica
                </h2>
                <p className="text-slate-500 text-sm">Panorama completo do escritório</p>
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors text-sm">
                Fechar Painel
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50">
            
            {/* 1. TOP CARDS (KPIs) */}
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
                        <p className={`text-3xl font-bold ${stats.stagnatedCases.length > 0 ? 'text-orange-600' : 'text-slate-800'}`}>{stats.stagnatedCases.length}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stats.stagnatedCases.length > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Clock size={24} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prazos na Semana</p>
                        <p className={`text-3xl font-bold ${stats.upcomingDeadlines.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.upcomingDeadlines.length}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stats.upcomingDeadlines.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                        <AlertOctagon size={24} />
                    </div>
                </div>
            </div>

            {/* 2. MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COL 1: Workload & View Distribution */}
                <div className="space-y-6">
                    {/* Workload */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Briefcase size={16} className="text-indigo-500"/> Carga de Trabalho
                        </h3>
                        <div className="space-y-3">
                            {stats.workload.map(([name, count]) => (
                                <div key={name}>
                                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                                        <span>{name}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full bg-indigo-500" 
                                            style={{ width: `${(count / stats.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* View Distribution */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Layers size={16} className="text-blue-500"/> Carteira de Processos
                        </h3>
                        <div className="space-y-3">
                             {Object.entries(stats.viewMap).map(([view, count]) => {
                                 const config = VIEW_CONFIG[view as any];
                                 return (
                                     <div key={view} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                                         <div className="flex items-center gap-2">
                                             <div className="bg-white p-1 rounded shadow-sm">
                                                 {config?.icon && <config.icon size={14} className="text-slate-500"/>}
                                             </div>
                                             <span className="text-xs font-bold text-slate-700">{config?.label || view}</span>
                                         </div>
                                         <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{count}</span>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                </div>

                {/* COL 2: Bottlenecks & Deadlines */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Upcoming Deadlines Radar */}
                    {stats.upcomingDeadlines.length > 0 && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide relative z-10">
                                <AlertTriangle size={16}/> Radar de Prazos (7 dias)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                                {stats.upcomingDeadlines.map(c => {
                                    const days = getDaysDiff(c.deadlineEnd);
                                    return (
                                        <div key={c.id} className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-center group cursor-pointer hover:bg-red-100 transition-colors">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm truncate w-40 md:w-48">{c.clientName}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{c.columnId.split('_').pop()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-red-600">{formatDate(c.deadlineEnd)}</p>
                                                <p className="text-[10px] font-bold text-red-400">
                                                    {days === 0 ? 'HOJE!' : days === 1 ? 'Amanhã' : `${days} dias`}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stagnated List */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide sticky top-0 bg-white pb-2 border-b border-slate-50">
                                <Clock size={16} className="text-orange-500"/> Fila de Espera (+90 dias)
                            </h3>
                            <div className="space-y-2">
                                {stats.stagnatedCases.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-xs">
                                        Nenhum processo estagnado. Ótimo trabalho!
                                    </div>
                                ) : (
                                    stats.stagnatedCases.map(c => (
                                        <div key={c.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate">{c.clientName}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{VIEW_CONFIG[c.view]?.label} - {c.columnId}</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded whitespace-nowrap">
                                                {getDaysSince(c.lastUpdate)} dias
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                         {/* Birthdays TODAY */}
                         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide sticky top-0 bg-white pb-2 border-b border-slate-50">
                                <Calendar size={16} className="text-pink-500"/> Aniversariantes do Dia
                            </h3>
                            <div className="space-y-2">
                                {stats.birthdaysToday.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-xs">
                                        Nenhum aniversariante hoje.
                                    </div>
                                ) : (
                                    stats.birthdaysToday.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-lg border border-pink-100">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                                                    🎉
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{c.clientName}</p>
                                                    <p className="text-[10px] text-slate-500">Parabéns!</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleSendBirthday(c)}
                                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors shadow-sm"
                                                title="Enviar Felicitações"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
};