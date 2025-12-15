
import React, { useState } from 'react';
import { Case, User } from '../types';
import { Briefcase, Layers, AlertTriangle, Clock, Calendar, MessageCircle, X, TrendingUp, Activity, AlertOctagon, ArrowRight, ChevronLeft } from 'lucide-react';
import { getDaysSince, getDaysDiff, formatDate } from '../utils';
import { VIEW_CONFIG, WHATSAPP_TEMPLATES } from '../constants';
import { DashboardKPIs } from './dashboard/DashboardKPIs';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DashboardProps {
  cases: Case[];
  users: User[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
}

type DrillDownType = {
    title: string;
    cases: Case[];
    colorTheme: string;
};

export const Dashboard: React.FC<DashboardProps> = ({ cases, users, onClose, onSelectCase }) => {
  const [drillDown, setDrillDown] = useState<DrillDownType | null>(null);
  
  // Logic extracted to hook
  const stats = useDashboardStats(cases, users);

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

  const handleDrillDown = (title: string, list: Case[], colorTheme: string) => {
      setDrillDown({ title, cases: list, colorTheme });
  };

  if (drillDown) {
      return (
        <div className="flex flex-col h-full bg-slate-100/50">
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setDrillDown(null)} 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        title="Voltar ao Painel"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className={`text-xl font-bold ${drillDown.colorTheme}`}>{drillDown.title}</h2>
                        <p className="text-xs text-slate-500">{drillDown.cases.length} processos encontrados</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 kanban-scroll">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente / ID</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fase Atual</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Responsável</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Última Atualização</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {drillDown.cases.map(c => (
                                <tr 
                                    key={c.id} 
                                    onClick={() => onSelectCase(c)}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{c.clientName}</p>
                                            <p className="text-xs text-slate-400 font-mono">#{c.internalId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                            {VIEW_CONFIG[c.view]?.label} &gt; {c.columnId.split('_').pop()?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        {users.find(u => u.id === c.responsibleId)?.name || c.responsibleName}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {getDaysSince(c.lastUpdate)} dias atrás
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {drillDown.cases.length === 0 && (
                        <div className="p-8 text-center text-slate-400">Nenhum processo nesta lista.</div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100/50">
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> Painel de Gestão 360º
                </h2>
                <p className="text-slate-500 text-sm">Panorama estratégico. Clique nos indicadores para ver detalhes.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 kanban-scroll">
            
            <DashboardKPIs 
                stats={stats} 
                allCases={cases} 
                onDrillDown={(type) => {
                    if (type === 'TOTAL') handleDrillDown('Todos os Processos Ativos', cases, 'text-blue-600');
                    if (type === 'SUCCESS') handleDrillDown('Processos Concedidos', stats.concededCases!, 'text-green-600');
                    if (type === 'STAGNATED') handleDrillDown('Processos Estagnados (+90 dias)', stats.stagnatedCases, 'text-orange-600');
                    if (type === 'DEADLINES') handleDrillDown('Prazos Próximos (7 dias)', stats.upcomingDeadlines, 'text-red-600');
                }}
            />

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                    onClick={() => handleDrillDown('Saúde Crítica (Parados)', stats.criticalHealthCases, 'text-red-600')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-red-300 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="text-red-500" size={18}/>
                            <h3 className="font-bold text-slate-700 text-sm group-hover:text-red-600 transition-colors">Saúde Crítica</h3>
                        </div>
                        <p className="text-xs text-slate-500">Processos parados além do limite</p>
                    </div>
                    <div className="mt-3 flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-bold text-red-600">{stats.healthCritical}</span>
                            <span className="text-xs text-slate-400 ml-1">casos</span>
                        </div>
                        <ArrowRight size={16} className="text-red-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
                
                <div 
                    onClick={() => handleDrillDown('Atenção Necessária', stats.warningHealthCases, 'text-orange-600')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-orange-300 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertOctagon className="text-orange-500" size={18}/>
                            <h3 className="font-bold text-slate-700 text-sm group-hover:text-orange-600 transition-colors">Atenção Necessária</h3>
                        </div>
                        <p className="text-xs text-slate-500">Aproximando do limite de estagnação</p>
                    </div>
                    <div className="mt-3 flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-bold text-orange-600">{stats.healthWarning}</span>
                            <span className="text-xs text-slate-400 ml-1">casos</span>
                        </div>
                        <ArrowRight size={16} className="text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div 
                    onClick={() => handleDrillDown('Risco de Relacionamento (Sem Contato)', stats.criticalContactCases, 'text-blue-600')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-300 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="text-blue-500" size={18}/>
                            <h3 className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">Risco de Relacionamento</h3>
                        </div>
                        <p className="text-xs text-slate-500">Sem contato fora do SLA definido</p>
                    </div>
                    <div className="mt-3 flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-bold text-blue-600">{stats.contactCritical}</span>
                            <span className="text-xs text-slate-400 ml-1">clientes</span>
                        </div>
                        <ArrowRight size={16} className="text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="space-y-6">
                    {/* Workload */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Briefcase size={16} className="text-indigo-500"/> Carga de Trabalho
                        </h3>
                        <div className="space-y-3">
                            {stats.workload.map(([name, data]: [string, { count: number, cases: Case[] }]) => (
                                <div 
                                    key={name} 
                                    onClick={() => handleDrillDown(`Carga: ${name}`, data.cases, 'text-indigo-600')}
                                    className="cursor-pointer group hover:bg-slate-50 p-2 rounded transition-colors border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1 group-hover:text-indigo-600">
                                        <span>{name}</span>
                                        <span>{data.count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full bg-indigo-500" 
                                            style={{ width: `${(data.count / stats.total) * 100}%` }}
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
                             {Object.entries(stats.viewMap).map(([view, data]: [string, { count: number, cases: Case[] }]) => {
                                 const config = VIEW_CONFIG[view as any];
                                 return (
                                     <div 
                                        key={view} 
                                        onClick={() => handleDrillDown(`Módulo: ${config?.label || view}`, data.cases, 'text-blue-600')}
                                        className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                                     >
                                         <div className="flex items-center gap-2">
                                             <div className="bg-white p-1 rounded shadow-sm group-hover:text-blue-500">
                                                 {config?.icon && <config.icon size={14} className="text-slate-500 group-hover:text-blue-500 transition-colors"/>}
                                             </div>
                                             <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">{config?.label || view}</span>
                                         </div>
                                         <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 group-hover:text-blue-600 group-hover:border-blue-200">{data.count}</span>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Upcoming Deadlines Radar */}
                    {stats.upcomingDeadlines.length > 0 && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide relative z-10">
                                <AlertTriangle size={16}/> Radar de Prazos (7 dias)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                                {stats.upcomingDeadlines.slice(0, 6).map(c => {
                                    const days = getDaysDiff(c.deadlineEnd);
                                    return (
                                        <div 
                                            key={c.id} 
                                            onClick={() => onSelectCase(c)}
                                            className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-center group cursor-pointer hover:bg-red-100 hover:shadow-md transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-1">
                                                    <p className="font-bold text-slate-800 text-sm truncate">{c.clientName}</p>
                                                    <ArrowRight size={12} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                                </div>
                                                <p className="text-[10px] text-slate-500 uppercase truncate">{c.columnId.split('_').pop()}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-bold text-red-600">{formatDate(c.deadlineEnd)}</p>
                                                <p className="text-[10px] font-bold text-red-400">
                                                    {days === 0 ? 'HOJE!' : days === 1 ? 'Amanhã' : `${days} dias`}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {stats.upcomingDeadlines.length > 6 && (
                                    <button 
                                        onClick={() => handleDrillDown('Prazos Próximos (Todos)', stats.upcomingDeadlines, 'text-red-600')}
                                        className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 hover:bg-red-100 md:col-span-2"
                                    >
                                        Ver mais {stats.upcomingDeadlines.length - 6} prazos...
                                    </button>
                                )}
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
                                    stats.stagnatedCases.slice(0, 15).map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => onSelectCase(c)}
                                            className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors cursor-pointer group active:scale-[0.99]"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600">{c.clientName}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{VIEW_CONFIG[c.view]?.label}</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded whitespace-nowrap">
                                                {getDaysSince(c.lastUpdate)} dias
                                            </span>
                                        </div>
                                    ))
                                )}
                                {stats.stagnatedCases.length > 15 && (
                                    <button 
                                        onClick={() => handleDrillDown('Processos Estagnados', stats.stagnatedCases, 'text-orange-600')}
                                        className="w-full text-center text-xs text-blue-500 font-bold py-2 hover:underline"
                                    >
                                        Ver lista completa...
                                    </button>
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
