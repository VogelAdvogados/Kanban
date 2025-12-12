
import React, { useMemo } from 'react';
import { Case, User } from '../types';
import { Briefcase, Layers, AlertTriangle, Clock, Calendar, MessageCircle, X, TrendingUp, Activity, AlertOctagon, CheckCircle } from 'lucide-react';
import { getDaysSince, getDaysDiff, formatDate, parseLocalYMD, analyzeCaseHealth } from '../utils';
import { VIEW_CONFIG, WHATSAPP_TEMPLATES } from '../constants';
import { DashboardKPIs } from './dashboard/DashboardKPIs';

interface DashboardProps {
  cases: Case[];
  users: User[];
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ cases, users, onClose }) => {
  
  const stats = useMemo(() => {
    const total = cases.length;
    
    // Outcome Stats
    const conceded = cases.filter(c => 
        ['adm_concluido', 'aux_ativo', 'jud_transito', 'jud_cumprimento', 'jud_rpv'].includes(c.columnId)
    ).length;
    const denied = cases.filter(c => 
        ['aux_indeferido', 'rec_resultado'].includes(c.columnId)
    ).length;
    const rate = (conceded + denied) > 0 ? Math.round((conceded / (conceded + denied)) * 100) : 0;

    // Health Analysis (Using default settings for dashboard general view)
    let healthCritical = 0;
    let healthWarning = 0;
    let contactCritical = 0;

    // Simplified default settings for generic overview if context unavailable
    const defaultSettings = {
        sla_internal_analysis: 7,
        sla_client_contact: 30,
        sla_stagnation: 45,
        sla_spider_web: 45,
        pp_alert_days: 15,
        show_probabilities: true
    };

    cases.forEach(c => {
        const analysis = analyzeCaseHealth(c, defaultSettings);
        if (analysis.status === 'CRITICAL') healthCritical++;
        if (analysis.status === 'WARNING') healthWarning++;
        if (analysis.contactStatus === 'CRITICAL') contactCritical++;
    });

    // Workload
    const workloadMap: Record<string, number> = {};
    cases.forEach(c => {
        const user = users.find(u => u.id === c.responsibleId);
        const rawName = user ? user.name : c.responsibleName;
        const displayName = rawName.split(' ')[0] + ' ' + (rawName.split(' ')[1]?.[0] || '') + '.'; 
        workloadMap[displayName] = (workloadMap[displayName] || 0) + 1;
    });
    const workload = Object.entries(workloadMap).sort((a, b) => b[1] - a[1]);

    const viewMap: Record<string, number> = {};
    cases.forEach(c => {
        viewMap[c.view] = (viewMap[c.view] || 0) + 1;
    });

    const stagnatedCases = cases.filter(c => {
        const days = getDaysSince(c.lastUpdate);
        return days !== null && days > 90;
    }).sort((a, b) => getDaysSince(b.lastUpdate)! - getDaysSince(a.lastUpdate)!);

    const upcomingDeadlines = cases.filter(c => {
        const diff = getDaysDiff(c.deadlineEnd);
        return diff !== null && diff >= 0 && diff <= 7;
    }).sort((a, b) => getDaysDiff(a.deadlineEnd)! - getDaysDiff(b.deadlineEnd)!);

    const today = new Date();
    const uniqueClients = new Map();
    cases.forEach(c => {
        if(c.birthDate && !uniqueClients.has(c.cpf)) {
            uniqueClients.set(c.cpf, c);
        }
    });
    
    const birthdaysToday = Array.from(uniqueClients.values()).filter(c => {
        const bdate = parseLocalYMD(c.birthDate);
        if(!bdate) return false;
        return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
    });

    return { 
        total, rate, birthdaysToday, workload, viewMap, stagnatedCases, upcomingDeadlines, 
        stagnatedCount: stagnatedCases.length, 
        upcomingDeadlinesCount: upcomingDeadlines.length,
        healthCritical, healthWarning, contactCritical
    };
  }, [cases, users]);

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
    <div className="flex flex-col h-full bg-slate-100/50">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> Painel de Gestão 360º
                </h2>
                <p className="text-slate-500 text-sm">Panorama de saúde dos processos e relacionamento</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 kanban-scroll">
            
            <DashboardKPIs stats={stats} allCases={cases} />

            {/* Health Monitor Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="text-red-500" size={18}/>
                            <h3 className="font-bold text-slate-700 text-sm">Saúde Crítica</h3>
                        </div>
                        <p className="text-xs text-slate-500">Processos parados além do limite</p>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-red-600">{stats.healthCritical}</span>
                        <span className="text-xs text-slate-400 ml-1">casos</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertOctagon className="text-orange-500" size={18}/>
                            <h3 className="font-bold text-slate-700 text-sm">Atenção Necessária</h3>
                        </div>
                        <p className="text-xs text-slate-500">Aproximando do limite de estagnação</p>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-orange-600">{stats.healthWarning}</span>
                        <span className="text-xs text-slate-400 ml-1">casos</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="text-blue-500" size={18}/>
                            <h3 className="font-bold text-slate-700 text-sm">Risco de Relacionamento</h3>
                        </div>
                        <p className="text-xs text-slate-500">Sem contato fora do SLA definido</p>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-blue-600">{stats.contactCritical}</span>
                        <span className="text-xs text-slate-400 ml-1">clientes</span>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
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
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto kanban-scroll">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide sticky top-0 bg-white pb-2 border-b border-slate-50">
                                <Clock size={16} className="text-orange-500"/> Fila de Espera (+90 dias)
                            </h3>
                            <div className="space-y-2">
                                {stats.stagnatedCases.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-xs">
                                        Nenhum processo estagnado.
                                    </div>
                                ) : (
                                    stats.stagnatedCases.map(c => (
                                        <div key={c.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate">{c.clientName}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{VIEW_CONFIG[c.view]?.label}</p>
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
                         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto kanban-scroll">
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
  );
};
