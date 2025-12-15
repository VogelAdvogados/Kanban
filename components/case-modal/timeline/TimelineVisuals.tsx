
import React, { useMemo } from 'react';
import { CheckCircle, LayoutList, Clock, Activity, Siren } from 'lucide-react';
import { Case, SystemSettings } from '../../../types';
import { ADMIN_COLUMNS, AUX_DOENCA_COLUMNS, JUDICIAL_COLUMNS, RECURSO_ADM_COLUMNS } from '../../../constants';
import { getDaysSince } from '../../../utils';

interface TimelineVisualsProps {
    data: Case;
    systemSettings?: SystemSettings;
    dynamicSLA: number | null;
    onImpetrarMS?: () => void;
}

export const TimelineVisuals: React.FC<TimelineVisualsProps> = ({ data, systemSettings, dynamicSLA, onImpetrarMS }) => {
    
    // --- STEPPER LOGIC ---
    const steps = useMemo(() => {
        let columns = ADMIN_COLUMNS;
        if (data.view === 'AUX_DOENCA') columns = AUX_DOENCA_COLUMNS;
        if (data.view === 'JUDICIAL') columns = JUDICIAL_COLUMNS;
        if (data.view === 'RECURSO_ADM') columns = RECURSO_ADM_COLUMNS;
        return columns.filter(c => !c.id.startsWith('zone_'));
    }, [data.view]);

    const currentStepIndex = steps.findIndex(s => s.id === data.columnId);
    const isInZone = currentStepIndex === -1 && data.columnId.startsWith('zone_');

    // --- PROCESS CLOCK LOGIC ---
    const processClock = useMemo(() => {
        let startDate = data.protocolDate;
        let label = 'Protocolo INSS';
        
        let msLimit = systemSettings?.sla_mandado_seguranca || 120;
        let limit = dynamicSLA || 90; 

        if (data.view === 'RECURSO_ADM') {
            if (data.columnId.includes('camera') || data.columnId.includes('especial')) {
                startDate = data.appealEspecialDate;
                label = 'Recurso Especial (2ª Inst.)';
            } else {
                startDate = data.appealOrdinarioDate || data.appealProtocolDate;
                label = 'Recurso Ordinário (1ª Inst.)';
            }
        }

        if (!startDate) return null;

        const days = getDaysSince(startDate) || 0;
        const progress = Math.min((days / msLimit) * 100, 100);
        
        let status = 'NORMAL';
        let color = 'bg-blue-500';
        let message = dynamicSLA 
          ? `Média histórica do escritório: ${dynamicSLA} dias.` 
          : 'Dentro do prazo esperado.';

        if (days > msLimit) {
            status = 'CRITICAL';
            color = 'bg-red-500';
            message = `Prazo de MS (${msLimit} dias) atingido!`;
        } else if (days > limit) {
            status = 'WARNING';
            color = 'bg-orange-500';
            message = dynamicSLA 
              ? `Acima da média do escritório (${dynamicSLA} dias).` 
              : 'Atenção: Prazo administrativo extrapolado.';
        } else {
            color = 'bg-emerald-500';
        }

        return { days, label, progress, status, color, message, msLimit, limit };
    }, [data, dynamicSLA, systemSettings]);

    return (
        <div className="space-y-6">
            {/* 1. VISUAL STEPPER */}
            {isInZone ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200">
                        <Activity size={24} className="text-slate-400 animate-pulse"/>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                            Status Especial: {data.columnId.replace('zone_', '').replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Este processo está em uma zona de ação fora do fluxo linear padrão. Mova-o de volta para a esteira quando houver andamento.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <LayoutList size={14}/> Progresso do Processo
                    </h3>
                    <div className="flex items-center justify-between min-w-[600px] relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                        {steps.map((step, idx) => {
                            let status = 'PENDING';
                            if (idx < currentStepIndex) status = 'COMPLETED';
                            if (idx === currentStepIndex) status = 'CURRENT';
                            if (status === 'CURRENT' && (step.id.includes('concluido') || step.id.includes('indeferido') || step.id.includes('resultado'))) {
                                status = 'FINISHED';
                            }

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 relative group">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all z-10
                                        ${status === 'COMPLETED' ? 'bg-blue-600 border-blue-100 text-white' : ''}
                                        ${status === 'CURRENT' ? 'bg-white border-blue-500 text-blue-600 shadow-md scale-110' : ''}
                                        ${status === 'PENDING' ? 'bg-slate-100 border-white text-slate-400' : ''}
                                        ${status === 'FINISHED' ? 'bg-emerald-500 border-emerald-100 text-white' : ''}
                                    `}>
                                        {status === 'COMPLETED' || status === 'FINISHED' ? <CheckCircle size={14}/> : idx + 1}
                                    </div>
                                    <span className={`
                                        text-[10px] font-bold max-w-[80px] text-center uppercase tracking-tight
                                        ${status === 'CURRENT' || status === 'FINISHED' ? 'text-slate-800' : 'text-slate-400'}
                                    `}>
                                        {step.title.replace(/^\d+\.\s*/, '')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. PROCESS CLOCK */}
            {processClock && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden">
                    <div className="flex justify-between items-end mb-2 relative z-10">
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Clock size={16} className="text-blue-600"/> Monitoramento: {processClock.label}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">{processClock.message}</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-bold ${processClock.status === 'CRITICAL' ? 'text-red-600' : processClock.status === 'WARNING' ? 'text-orange-600' : 'text-emerald-600'}`}>
                                {processClock.days} dias
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Decorridos</p>
                        </div>
                    </div>
                    
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative z-10">
                        <div 
                            className={`h-full transition-all duration-1000 ${processClock.color}`} 
                            style={{ width: `${processClock.progress}%` }}
                        ></div>
                        {dynamicSLA && (
                            <div 
                                className="absolute top-0 bottom-0 w-1 bg-black/20 z-20"
                                style={{ left: `${Math.min((dynamicSLA / processClock.msLimit) * 100, 100)}%` }}
                                title={`Média do Escritório: ${dynamicSLA} dias`}
                            ></div>
                        )}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 relative z-10 font-bold">
                        <span>Protocolo (Dia 0)</span>
                        <span className={dynamicSLA ? "text-blue-600" : ""}>
                            {dynamicSLA ? `Média Histórica (~${dynamicSLA}d)` : `SLA Estimado (${processClock.limit}d)`}
                        </span>
                        <span>Prazo MS ({processClock.msLimit} dias)</span>
                    </div>

                    {processClock.status === 'CRITICAL' && onImpetrarMS && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded p-2 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-2 text-red-700 text-xs font-bold">
                                <Siren size={14}/>
                                <span>Prazo de Mandado de Segurança atingido!</span>
                            </div>
                            <button 
                                onClick={onImpetrarMS}
                                className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold hover:bg-red-700 transition-colors"
                            >
                                Impetrar Agora
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
