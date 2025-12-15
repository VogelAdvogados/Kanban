
import React from 'react';
import { Sliders, Users, Bug, Clock, Scale, Zap } from 'lucide-react';
import { SystemSettings } from '../../types';

interface AutomationSettingsProps {
  settings: SystemSettings;
  setSettings: (s: SystemSettings) => void;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SLA Interno */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Sliders size={16} /> SLA Interno (Produção)
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Limite de Dias na Fase Interna</label>
                        <p className="text-[10px] text-slate-400 mb-2">Quantos dias um processo pode ficar em "Triagem" ou "Montagem" antes de alertar atraso?</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                min="1"
                                className="w-20 p-2 rounded border border-slate-300 text-sm font-bold text-center"
                                value={settings.sla_internal_analysis}
                                onChange={e => setSettings({...settings, sla_internal_analysis: parseInt(e.target.value) || 7})}
                            />
                            <span className="text-sm text-slate-600">dias</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SLA Cliente */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Users size={16} /> Relacionamento com Cliente
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequência de Contato Ideal</label>
                        <p className="text-[10px] text-slate-400 mb-2">A cada quantos dias o escritório deve entrar em contato com o cliente?</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                min="1"
                                className="w-20 p-2 rounded border border-slate-300 text-sm font-bold text-center"
                                value={settings.sla_client_contact}
                                onChange={e => setSettings({...settings, sla_client_contact: parseInt(e.target.value) || 30})}
                            />
                            <span className="text-sm text-slate-600">dias</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prazos Legais (NEW) */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Scale size={16} className="text-red-600"/> Prazos Legais (Mandado de Segurança)
                </h4>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Limite para Impetração de MS</label>
                    <p className="text-[10px] text-slate-400 mb-2">
                        Após quantos dias de "silêncio administrativo" o sistema deve sugerir Mandado de Segurança? (Padrão: 90 ou 120)
                    </p>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            min="30"
                            className="w-20 p-2 rounded border border-slate-300 text-sm font-bold text-center text-red-600"
                            value={settings.sla_mandado_seguranca || 120}
                            onChange={e => setSettings({...settings, sla_mandado_seguranca: parseInt(e.target.value) || 120})}
                        />
                        <span className="text-sm text-slate-600">dias corridos</span>
                    </div>
                </div>
            </div>

            {/* Auditoria & Teia de Aranha */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Bug size={16} className="text-orange-500"/> "Teia de Aranha" (Auditoria)
                </h4>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Limite Sem Consulta Manual</label>
                    <p className="text-[10px] text-slate-400 mb-2">
                        Após quantos dias sem um <strong>Log Manual de Consulta</strong> o sistema deve exibir a "Teia de Aranha" no processo?
                    </p>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            min="15"
                            className="w-20 p-2 rounded border border-slate-300 text-sm font-bold text-center text-orange-600"
                            value={settings.sla_spider_web || 45}
                            onChange={e => setSettings({...settings, sla_spider_web: parseInt(e.target.value) || 45})}
                        />
                        <span className="text-sm text-slate-600">dias sem consultar</span>
                    </div>
                </div>
            </div>

            {/* Ciclo de Vida */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Clock size={16} className="text-blue-500"/> Ciclo de Vida (DCB)
                </h4>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alerta de Prorrogação</label>
                    <p className="text-[10px] text-slate-400 mb-2">
                        Quantos dias antes da DCB (Data de Cessação) o sistema deve alertar para pedir prorrogação?
                    </p>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            min="5"
                            max="60"
                            className="w-20 p-2 rounded border border-slate-300 text-sm font-bold text-center text-blue-600"
                            value={settings.pp_alert_days || 15}
                            onChange={e => setSettings({...settings, pp_alert_days: parseInt(e.target.value) || 15})}
                        />
                        <span className="text-sm text-slate-600">dias antes da DCB</span>
                    </div>
                </div>
            </div>

            {/* IA & Analytics */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                    <Zap size={16} /> Inteligência Preditiva
                </h4>
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="showProb"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={settings.show_probabilities}
                        onChange={e => setSettings({...settings, show_probabilities: e.target.checked})}
                    />
                    <label htmlFor="showProb" className="text-sm text-slate-700 cursor-pointer select-none">
                        Exibir Probabilidade de Êxito nos cartões
                    </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-8">Calcula automaticamente a chance de vitória com base no tipo de benefício e idade.</p>
            </div>
        </div>
    </div>
  );
};
