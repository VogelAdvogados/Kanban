
import { ThemeConfig, ViewType, ColumnDefinition, TransitionRule, ActionZoneConfig } from '../types';
import { LayoutDashboard, Stethoscope, Scale, FileText, Gavel, Archive, Siren, CornerUpLeft, ArrowRight } from 'lucide-react';

export const VIEW_THEMES: Record<string, ThemeConfig> = {
    'ADMIN': { bgGradient: 'from-slate-100 to-slate-200', primary: 'slate', secondary: 'slate', accent: 'blue', button: 'blue', iconColor: 'text-slate-500' },
    'AUX_DOENCA': { bgGradient: 'from-blue-50 to-blue-100', primary: 'blue', secondary: 'blue', accent: 'orange', button: 'blue', iconColor: 'text-blue-500' },
    'RECURSO_ADM': { bgGradient: 'from-indigo-50 to-indigo-100', primary: 'indigo', secondary: 'indigo', accent: 'violet', button: 'indigo', iconColor: 'text-indigo-500' },
    'JUDICIAL': { bgGradient: 'from-purple-50 to-purple-100', primary: 'purple', secondary: 'purple', accent: 'fuchsia', button: 'purple', iconColor: 'text-purple-500' },
    'MESA_DECISAO': { bgGradient: 'from-fuchsia-50 to-fuchsia-100', primary: 'fuchsia', secondary: 'fuchsia', accent: 'pink', button: 'fuchsia', iconColor: 'text-fuchsia-500' },
    'ARCHIVED': { bgGradient: 'from-gray-100 to-gray-200', primary: 'gray', secondary: 'gray', accent: 'slate', button: 'gray', iconColor: 'text-gray-500' }
};

export const VIEW_CONFIG: Record<ViewType, { label: string, icon: any, color: string }> = {
    'ADMIN': { label: 'Administrativo', icon: LayoutDashboard, color: 'text-slate-600' },
    'AUX_DOENCA': { label: 'Auxílio Doença', icon: Stethoscope, color: 'text-blue-600' },
    'RECURSO_ADM': { label: 'Recurso Adm.', icon: FileText, color: 'text-indigo-600' },
    'JUDICIAL': { label: 'Judicial', icon: Scale, color: 'text-purple-600' },
    'MESA_DECISAO': { label: 'Mesa de Decisão', icon: Gavel, color: 'text-fuchsia-600' },
    'ARCHIVED': { label: 'Arquivo', icon: Archive, color: 'text-gray-600' }
};

// --- ACTION ZONES (Centralized Definition) ---
export const ACTION_ZONES: ActionZoneConfig[] = [
    {
        id: 'zone_judicial',
        label: 'Judicializar',
        subLabel: 'Mover para o Judicial',
        icon: Scale,
        targetView: 'JUDICIAL',
        targetColumnId: 'jud_triagem',
        colorClass: 'bg-blue-50 border-blue-200 text-blue-700',
        hoverClass: 'bg-blue-100 border-blue-400 ring-4 ring-blue-100',
        activeInViews: ['ADMIN', 'RECURSO_ADM', 'AUX_DOENCA', 'MESA_DECISAO']
    },
    {
        id: 'zone_recurso',
        label: 'Recurso Adm.',
        subLabel: 'Iniciar Fase Recursal',
        icon: FileText,
        targetView: 'RECURSO_ADM',
        targetColumnId: 'rec_triagem',
        colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        hoverClass: 'bg-indigo-100 border-indigo-400 ring-4 ring-indigo-100',
        activeInViews: ['ADMIN', 'AUX_DOENCA']
    },
    {
        id: 'zone_ms',
        label: 'Mandado de Segurança',
        subLabel: 'Impetrar MS',
        icon: Siren,
        targetView: 'JUDICIAL',
        targetColumnId: 'jud_triagem', // Special handling in logic for MS cloning
        colorClass: 'bg-red-50 border-red-200 text-red-700',
        hoverClass: 'bg-red-100 border-red-400 ring-4 ring-red-100',
        activeInViews: ['ADMIN', 'RECURSO_ADM']
    },
    {
        id: 'zone_mesa_decisao',
        label: 'Mesa de Decisão',
        subLabel: 'Definição Estratégica',
        icon: Gavel,
        targetView: 'MESA_DECISAO',
        targetColumnId: 'mesa_aguardando',
        colorClass: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
        hoverClass: 'bg-fuchsia-100 border-fuchsia-400 ring-4 ring-fuchsia-100',
        activeInViews: ['ADMIN', 'RECURSO_ADM', 'AUX_DOENCA', 'JUDICIAL']
    },
    {
        id: 'zone_arquivo',
        label: 'Arquivar',
        subLabel: 'Encerrar ou Financeiro',
        icon: Archive,
        targetView: 'ARCHIVED',
        targetColumnId: 'arq_geral',
        colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        hoverClass: 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-100',
        activeInViews: 'ALL'
    },
    {
        id: 'zone_admin',
        label: 'Retornar p/ Admin',
        subLabel: 'Voltar ao Fluxo Inicial',
        icon: CornerUpLeft,
        targetView: 'ADMIN',
        targetColumnId: 'adm_triagem',
        colorClass: 'bg-slate-100 border-slate-300 text-slate-700',
        hoverClass: 'bg-slate-200 border-slate-400 ring-4 ring-slate-100',
        activeInViews: ['JUDICIAL', 'RECURSO_ADM', 'MESA_DECISAO', 'ARCHIVED']
    }
];

export const ADMIN_COLUMNS: ColumnDefinition[] = [
    { id: 'adm_triagem', title: '1. Triagem / Recepção', color: 'border-slate-300' },
    { id: 'adm_docs', title: '2. Pendência Docs', color: 'border-red-400' },
    { id: 'adm_montagem', title: '3. Montagem / Cálculo', color: 'border-blue-400' },
    { id: 'adm_protocolo', title: '4. Protocolado INSS', color: 'border-blue-600' },
    { id: 'adm_exigencia', title: '5. Cumprir Exigência', color: 'border-yellow-500' },
    { id: 'adm_analise', title: '6. Em Análise', color: 'border-indigo-400' },
    { id: 'adm_concluido', title: '7. Concluído / Decisão', color: 'border-emerald-500' },
    { id: 'adm_pagamento', title: '8. Pagamento / PAB', color: 'border-green-600' },
];

export const AUX_DOENCA_COLUMNS: ColumnDefinition[] = [
    { id: 'aux_chegada', title: '1. Recepção / Triagem', color: 'border-slate-300' },
    { id: 'aux_agendamento', title: '2. Agendar Perícia', color: 'border-orange-300' },
    { id: 'aux_pericia', title: '3. Aguardando Perícia', color: 'border-orange-500' },
    { id: 'aux_resultado', title: '4. Aguardando Resultado', color: 'border-blue-400' },
    { id: 'aux_ativo', title: '5. Benefício Ativo', color: 'border-green-500' },
    { id: 'aux_prorrogacao', title: '6. Prorrogação (PP)', color: 'border-yellow-500' },
    { id: 'aux_indeferido', title: '7. Indeferido / Recurso', color: 'border-red-500' },
];

export const RECURSO_ADM_COLUMNS: ColumnDefinition[] = [
    { id: 'rec_triagem', title: '1. Análise de Viabilidade', color: 'border-slate-300' },
    { id: 'rec_redacao', title: '2. Redação do Recurso', color: 'border-indigo-300' },
    { id: 'rec_junta', title: '3. Protocolo JR (1ª Inst.)', color: 'border-indigo-500' },
    { id: 'rec_exigencia', title: '4. Exigência / Diligência', color: 'border-yellow-500' },
    { id: 'rec_camera', title: '5. Protocolo CAJ (2ª Inst.)', color: 'border-purple-500' },
    { id: 'rec_resultado', title: '6. Resultado Final', color: 'border-emerald-500' },
];

export const JUDICIAL_COLUMNS: ColumnDefinition[] = [
    { id: 'jud_triagem', title: '1. Triagem Judicial', color: 'border-slate-300' },
    { id: 'jud_inicial', title: '2. Redação Inicial', color: 'border-purple-300' },
    { id: 'jud_protocolo', title: '3. Aguardando Citação', color: 'border-purple-500' },
    { id: 'jud_pericia', title: '4. Perícia Judicial', color: 'border-orange-500' },
    { id: 'jud_audiencia', title: '5. Audiência', color: 'border-yellow-500' },
    { id: 'jud_sentenca', title: '6. Sentença / Acórdão', color: 'border-blue-500' },
    { id: 'jud_transito', title: '7. Trânsito em Julgado', color: 'border-green-500' },
    { id: 'jud_cumprimento', title: '8. Cumprimento Sentença', color: 'border-emerald-500' },
    { id: 'jud_rpv', title: '9. RPV / Precatório', color: 'border-green-600' },
];

export const MESA_DECISAO_COLUMNS: ColumnDefinition[] = [
    { id: 'mesa_aguardando', title: 'Aguardando Análise', color: 'border-slate-300' },
    { id: 'mesa_analise', title: 'Em Análise', color: 'border-fuchsia-400' },
    { id: 'mesa_definido', title: 'Estratégia Definida', color: 'border-fuchsia-600' },
];

export const ARCHIVED_COLUMNS: ColumnDefinition[] = [
    { id: 'arq_geral', title: 'Arquivo Geral', color: 'border-slate-400' },
];

export const COLUMNS_BY_VIEW: Record<ViewType, ColumnDefinition[]> = {
    'ADMIN': ADMIN_COLUMNS,
    'AUX_DOENCA': AUX_DOENCA_COLUMNS,
    'RECURSO_ADM': RECURSO_ADM_COLUMNS,
    'JUDICIAL': JUDICIAL_COLUMNS,
    'MESA_DECISAO': MESA_DECISAO_COLUMNS,
    'ARCHIVED': ARCHIVED_COLUMNS
};

export const TRANSITION_RULES: TransitionRule[] = [
    { from: '*', to: 'adm_protocolo', type: 'PROTOCOL_INSS' },
    { from: '*', to: 'aux_agendamento', type: 'PROTOCOL_INSS' }, 
    { from: '*', to: 'jud_protocolo', type: 'PROTOCOL_INSS' }, 
    { from: '*', to: 'rec_junta', type: 'PROTOCOL_APPEAL' },
    { from: '*', to: 'rec_camera', type: 'PROTOCOL_APPEAL' },
    { from: '*', to: 'adm_exigencia', type: 'DEADLINE' },
    { from: '*', to: 'rec_exigencia', type: 'DEADLINE' },
    { from: '*', to: 'adm_docs', type: 'PENDENCY' },
    { from: '*', to: 'adm_concluido', type: 'CONCLUSION_NB' },
    { from: '*', to: 'aux_resultado', type: 'CONCLUSION_NB' },
    { from: 'rec_junta', to: 'rec_triagem', type: 'APPEAL_RETURN' }, 
    { from: 'rec_junta', to: 'adm_triagem', type: 'ADMIN_RETURN' }, 
];
