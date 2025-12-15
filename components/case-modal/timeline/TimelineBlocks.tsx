
import React from 'react';
import { Calendar, MessageCircle, MapPin, ShieldAlert, Activity, RefreshCw, CheckCircle, Heart, Timer, Construction, Wheat, Stethoscope } from 'lucide-react';
import { Case, INSSAgency, WhatsAppTemplate, Task } from '../../../types';
import { getDaysDiff, getLocationAddress } from '../../../utils';
import { WHATSAPP_TEMPLATES } from '../../../constants';

// Helper safely parses ISO date string to YYYY-MM-DD for input[type="date"]
const toInputDate = (isoStr: string | undefined): string => {
    if (!isoStr) return '';
    if (isoStr.length === 10) return isoStr;
    return isoStr.split('T')[0];
};

interface PericiaPanelProps {
    data: Case;
    onChange: (updates: Partial<Case>) => void;
    agenciesList: INSSAgency[];
    whatsAppTemplates?: WhatsAppTemplate[];
}

export const PericiaPanel: React.FC<PericiaPanelProps> = ({ data, onChange, agenciesList, whatsAppTemplates }) => {
    const isJudicialPericia = data.columnId === 'jud_pericia';

    const handleNotifyNow = () => {
        if (!data.periciaDate) {
            alert('Defina a data da perícia antes de avisar o cliente.');
            return;
        }
        
        const fullLocation = getLocationAddress(data.periciaLocation);
        
        const templates = whatsAppTemplates && whatsAppTemplates.length > 0 ? whatsAppTemplates : WHATSAPP_TEMPLATES;
        let template = templates.find(t => t.id === 't_aviso_pericia_imediato') || templates.find(t => t.category === 'PERICIA');
        
        let msg = '';
        if (template) {
            msg = template.text
              .replace('{NOME}', data.clientName.split(' ')[0])
              .replace('{TIPO_PERICIA}', isJudicialPericia ? 'Justiça Federal' : 'INSS')
              .replace('{DATA_PERICIA}', new Date(data.periciaDate).toLocaleDateString())
              .replace('{HORA_PERICIA}', data.periciaTime || 'A Confirmar')
              .replace('{LOCAL_PERICIA}', fullLocation)
              .replace('{PROTOCOLO}', data.protocolNumber || 'N/A')
              .replace('{ID_INTERNO}', data.internalId);
        } else {
            msg = `Olá ${data.clientName.split(' ')[0]}, sua perícia foi agendada para ${new Date(data.periciaDate).toLocaleDateString()} às ${data.periciaTime || ''} no local: ${fullLocation}. Chegue com antecedência!`;
        }
        
        const phone = data.phone?.replace(/\D/g, '') || '';
        const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
        if(finalPhone.length > 4) window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        else alert('Telefone inválido');
    };

    return (
        <div className={`p-4 rounded-xl border flex flex-col gap-3 relative overflow-hidden transition-all shadow-sm ${isJudicialPericia ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex justify-between items-center border-b border-black/5 pb-2 mb-1">
                <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${isJudicialPericia ? 'text-purple-800' : 'text-orange-800'}`}>
                    <Calendar size={14}/> Agendamento de Perícia
                </h4>
                <button 
                    onClick={handleNotifyNow}
                    className="text-[10px] bg-green-500 text-white hover:bg-green-600 px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all"
                    title="Enviar mensagem completa (com orientações) via WhatsApp"
                >
                    <MessageCircle size={12}/> Avisar Cliente
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data da Perícia</label>
                    <input 
                        type="date" 
                        className={`w-full bg-white border rounded-lg p-2 text-sm outline-none focus:ring-2 ${isJudicialPericia ? 'border-purple-300 focus:ring-purple-400' : 'border-orange-300 focus:ring-orange-400'} font-bold text-slate-700`}
                        value={toInputDate(data.periciaDate)}
                        onChange={e => onChange({ periciaDate: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hora</label>
                    <input 
                        type="time" 
                        className={`w-full bg-white border rounded-lg p-2 text-sm outline-none focus:ring-2 ${isJudicialPericia ? 'border-purple-300 focus:ring-purple-400' : 'border-orange-300 focus:ring-orange-400'} font-bold text-slate-700`}
                        value={data.periciaTime || ''} 
                        onChange={e => onChange({ periciaTime: e.target.value })} 
                    />
                </div>
            </div>
            
            <div className="relative">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <MapPin size={10}/> Localização (Agência ou Vara)
                </label>
                <input 
                    type="text" 
                    placeholder={isJudicialPericia ? "Selecione a Vara Federal..." : "Selecione a Agência..."}
                    className={`w-full bg-white border rounded-lg p-2 text-sm outline-none focus:ring-2 pl-3 ${isJudicialPericia ? 'border-purple-300 focus:ring-purple-400' : 'border-orange-300 focus:ring-orange-400'}`} 
                    value={data.periciaLocation || ''} 
                    onChange={e => onChange({ periciaLocation: e.target.value })} 
                    list="agencies-timeline-list"
                />
                <datalist id="agencies-timeline-list">
                    {agenciesList.map(agency => (
                        <option key={agency.id} value={agency.name} />
                    ))}
                </datalist>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-500">
                <ShieldAlert size={12} className="text-slate-400"/>
                <span>Ao salvar, a Agenda será atualizada automaticamente.</span>
            </div>
        </div>
    );
};

interface MaintenancePanelProps {
    data: Case;
    onChange: (updates: Partial<Case>) => void;
    whatsAppTemplates?: WhatsAppTemplate[];
}

export const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ data, onChange, whatsAppTemplates }) => {
    const daysLeft = getDaysDiff(data.dcbDate);
    const isWarning = daysLeft !== null && daysLeft <= 15;
    const isCritical = daysLeft !== null && daysLeft <= 5;

    const handleCheckHealth = () => {
        if(!data.dcbDate) return;
        const templates = whatsAppTemplates && whatsAppTemplates.length > 0 ? whatsAppTemplates : WHATSAPP_TEMPLATES;
        let template = templates.find(t => t.id === 't_check_prorrogacao') || templates.find(t => t.category === 'GERAL');

        let msg = '';
        if (template) {
            msg = template.text
              .replace('{NOME}', data.clientName.split(' ')[0])
              .replace('{DATA_DCB}', new Date(data.dcbDate).toLocaleDateString());
        } else {
            msg = `Olá ${data.clientName.split(' ')[0]}, seu benefício termina dia ${new Date(data.dcbDate).toLocaleDateString()}. Como você está se sentindo?`;
        }

        const phone = data.phone?.replace(/\D/g, '') || '';
        const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
        if(finalPhone.length > 4) window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');

        const newTask: Task = { id: `t_pp_follow_${Date.now()}`, text: 'Aguardando resposta sobre PP (Prorrogação)', completed: false };
        onChange({ 
            lastContactDate: new Date().toISOString(),
            tasks: [...(data.tasks || []), newTask]
        });
    };

    return (
        <div className={`p-4 rounded-xl border flex flex-col gap-3 relative overflow-hidden transition-all shadow-sm ${isCritical ? 'bg-red-50 border-red-200' : isWarning ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex justify-between items-center border-b border-black/5 pb-2 mb-1">
                <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${isCritical ? 'text-red-800' : isWarning ? 'text-orange-800' : 'text-green-800'}`}>
                    <Activity size={14}/> Gestão de Manutenção
                </h4>
                {daysLeft !== null && daysLeft > 0 && (
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-black/10">
                        Cessa em {daysLeft} dias
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Data de Cessação (DCB)</label>
                    <input 
                        type="date" 
                        className="bg-white border rounded p-1 text-xs outline-none focus:ring-1 focus:ring-blue-300 font-bold w-32"
                        value={toInputDate(data.dcbDate)}
                        onChange={e => onChange({ dcbDate: e.target.value })}
                    />
                </div>

                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-black/10 relative">
                    <div 
                        className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.max(0, Math.min(100, (daysLeft || 0) / 120 * 100))}%` }}
                    ></div>
                </div>

                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={handleCheckHealth}
                        className="flex-1 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-lg py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        title="Envia mensagem perguntando saúde e cria tarefa de follow-up"
                    >
                        <MessageCircle size={14}/> Checar Saúde (PP?)
                    </button>
                    <button 
                        onClick={() => onChange({ isExtension: true, columnId: 'aux_prorrogacao' })}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                        <RefreshCw size={14}/> Pedir Prorrogação
                    </button>
                </div>
                
                {data.isExtension && (
                    <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 justify-center">
                        <CheckCircle size={10}/> Pedido de Prorrogação (PP) já sinalizado
                    </div>
                )}
            </div>
        </div>
    );
};

export const SpecificBenefitFields: React.FC<{ data: Case, onChange: (u: Partial<Case>) => void, group: string, benefitType: string }> = ({ data, onChange, group, benefitType }) => {
    
    if (group === 'INCAPACITY') {
        return (
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-center justify-between">
                <label className="block text-[10px] font-bold text-orange-700 uppercase flex items-center gap-1">
                    <Stethoscope size={12}/> Tipo:
                </label>
                <div className="flex gap-2">
                    <button onClick={() => onChange({ strategyType: 'ATESTMED' })} className={`text-[10px] px-2 py-1 rounded border font-bold ${data.strategyType === 'ATESTMED' ? 'bg-orange-200 border-orange-300 text-orange-900' : 'bg-white border-orange-100'}`}>ATESTMED</button>
                    <button onClick={() => onChange({ strategyType: 'PRESENCIAL' })} className={`text-[10px] px-2 py-1 rounded border font-bold ${data.strategyType === 'PRESENCIAL' ? 'bg-blue-200 border-blue-300 text-blue-900' : 'bg-white border-blue-100'}`}>PRESENCIAL</button>
                </div>
            </div>
        );
    }

    if (group === 'PENSION') {
        return (
            <div className="bg-pink-50 border border-pink-100 p-3 rounded-lg">
                <label className="block text-[10px] font-bold text-pink-700 uppercase mb-2 flex items-center gap-1">
                    <Heart size={12}/> Detalhes do Instituidor (Falecido)
                </label>
                <div className="space-y-2">
                    <div>
                        <label className="text-[10px] text-pink-600 font-bold block mb-1">Nome do Instituidor</label>
                        <input 
                            type="text" 
                            className="w-full bg-white border border-pink-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-pink-300"
                            value={data.deceasedName || ''}
                            onChange={e => onChange({ deceasedName: e.target.value })}
                            placeholder="Nome completo do falecido"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-pink-600 font-bold block mb-1">Data do Óbito</label>
                        <input 
                            type="date" 
                            className="w-full bg-white border border-pink-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-pink-300"
                            value={toInputDate(data.deceasedDate)}
                            onChange={e => onChange({ deceasedDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (['RETIREMENT_AGE', 'RETIREMENT_TIME', 'SPECIAL'].includes(group)) {
        return (
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1">
                    <Timer size={12}/> Cálculo de Tempo
                </label>
                <div className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                        <label className="text-[10px] text-indigo-600 font-bold block mb-1">Anos</label>
                        <input 
                            type="number" 
                            className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-300 text-center font-bold"
                            value={data.contributionTimeYears || ''}
                            onChange={e => onChange({ contributionTimeYears: parseInt(e.target.value) })}
                            placeholder="0"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-indigo-600 font-bold block mb-1">Meses</label>
                        <input 
                            type="number" 
                            className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-300 text-center font-bold"
                            value={data.contributionTimeMonths || ''}
                            onChange={e => onChange({ contributionTimeMonths: parseInt(e.target.value) })}
                            placeholder="0"
                        />
                    </div>
                </div>
                {group === 'SPECIAL' && (
                    <div className="mt-2 pt-2 border-t border-indigo-200">
                        <label className="flex items-center gap-2 text-xs text-indigo-800">
                            <Construction size={12} />
                            <span className="font-bold">Perfil Profissiográfico (PPP)</span>
                        </label>
                        <p className="text-[9px] text-indigo-500 mt-1">Verificar se há exposição a agentes nocivos e se o LTCAT está atualizado.</p>
                    </div>
                )}
            </div>
        );
    }

    if (benefitType === '48' || benefitType === '08') {
        return (
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                <label className="block text-[10px] font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
                    <Wheat size={12}/> Prova Rural
                </label>
                <div>
                    <label className="text-[10px] text-amber-600 font-bold block mb-1">Início de Prova Material</label>
                    <input 
                        type="date" 
                        className="w-full bg-white border border-amber-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-300"
                        value={toInputDate(data.ruralProofStart)}
                        onChange={e => onChange({ ruralProofStart: e.target.value })}
                    />
                    <p className="text-[9px] text-amber-500 mt-0.5">Data do documento mais antigo (ex: Certidão Casamento).</p>
                </div>
            </div>
        );
    }

    return null;
};
