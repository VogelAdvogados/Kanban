
// ... (imports remain unchanged)
import { ColumnDefinition, Case, User, ViewType, TransitionRule, Task, SmartAction, WhatsAppTemplate, ThemeConfig, DocumentTemplate, WorkflowRule, SystemTag, INSSAgency, AppTheme } from './types';
import { LayoutDashboard, Stethoscope, Scale, FileText, Gavel, Archive, ArrowRight, RefreshCw, AlertTriangle, BadgeDollarSign, Siren, Search, FileCheck, Send, Calculator, Calendar, CheckCircle, XCircle, Plus, BookOpen, Coins, FileSearch, TrendingUp } from 'lucide-react';

// --- APP THEMES (PERSONALIZATION) ---
export const APP_THEMES: AppTheme[] = [
    { id: 'default', label: 'Padrão (Dinâmico)', bgClass: '', previewColor: '#e2e8f0', headerTop: 'bg-[#f0f2f5]', headerBottom: 'bg-[#1e3a8a]' },
    
    // Clean / Professional
    { id: 'slate', label: 'Executivo (Slate)', bgClass: 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300', previewColor: '#64748b', headerTop: 'bg-slate-100', headerBottom: 'bg-slate-800' },
    { id: 'gray', label: 'Minimalista (Gray)', bgClass: 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200', previewColor: '#9ca3af', headerTop: 'bg-gray-100', headerBottom: 'bg-gray-700' },
    { id: 'white', label: 'Papel (White)', bgClass: 'bg-slate-50', previewColor: '#ffffff', headerTop: 'bg-white', headerBottom: 'bg-slate-900' },
    
    // Blues / Cool
    { id: 'ocean', label: 'Oceano (Ocean)', bgClass: 'bg-gradient-to-br from-cyan-50 via-cyan-100 to-blue-200', previewColor: '#22d3ee', headerTop: 'bg-cyan-50', headerBottom: 'bg-cyan-700' },
    { id: 'sky', label: 'Céu (Sky)', bgClass: 'bg-gradient-to-br from-sky-50 via-sky-100 to-indigo-100', previewColor: '#38bdf8', headerTop: 'bg-sky-50', headerBottom: 'bg-sky-700' },
    { id: 'royal', label: 'Royal Blue', bgClass: 'bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-300', previewColor: '#4f46e5', headerTop: 'bg-indigo-50', headerBottom: 'bg-indigo-800' },
    
    // Nature / Green
    { id: 'mint', label: 'Menta (Mint)', bgClass: 'bg-gradient-to-br from-emerald-50 via-teal-100 to-emerald-200', previewColor: '#34d399', headerTop: 'bg-emerald-50', headerBottom: 'bg-teal-700' },
    { id: 'forest', label: 'Floresta (Green)', bgClass: 'bg-gradient-to-br from-green-50 via-green-100 to-green-200', previewColor: '#4ade80', headerTop: 'bg-green-50', headerBottom: 'bg-green-800' },
    
    // Warm
    { id: 'sunset', label: 'Pôr do Sol (Sunset)', bgClass: 'bg-gradient-to-br from-orange-50 via-amber-100 to-orange-200', previewColor: '#fb923c', headerTop: 'bg-orange-50', headerBottom: 'bg-orange-800' },
    { id: 'peach', label: 'Pêssego (Peach)', bgClass: 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-100', previewColor: '#fda4af', headerTop: 'bg-rose-50', headerBottom: 'bg-rose-800' },
    
    // Creative / Purple
    { id: 'lavender', label: 'Lavanda (Purple)', bgClass: 'bg-gradient-to-br from-violet-50 via-purple-100 to-fuchsia-100', previewColor: '#c084fc', headerTop: 'bg-violet-50', headerBottom: 'bg-purple-800' },
    { id: 'berry', label: 'Berry (Pink)', bgClass: 'bg-gradient-to-br from-pink-50 via-pink-100 to-rose-200', previewColor: '#ec4899', headerTop: 'bg-pink-50', headerBottom: 'bg-pink-800' },
    { id: 'midnight', label: 'Meia Noite (Dark)', bgClass: 'bg-gradient-to-br from-slate-200 via-blue-200 to-indigo-300', previewColor: '#1e3a8a', headerTop: 'bg-slate-200', headerBottom: 'bg-slate-950' }, 
    { id: 'gold', label: 'Luxo (Gold)', bgClass: 'bg-gradient-to-br from-yellow-50 via-amber-100 to-yellow-200', previewColor: '#facc15', headerTop: 'bg-amber-50', headerBottom: 'bg-amber-800' },
];

// --- THEME CONFIGURATION (Colors per View) ---
export const VIEW_THEMES: Record<ViewType, ThemeConfig> = {
  ADMIN: {
    bgGradient: 'from-slate-50 via-white to-blue-50/30',
    primary: 'text-slate-800',
    secondary: 'text-slate-500',
    accent: 'border-blue-200',
    button: 'bg-slate-800 text-white shadow-slate-900/20',
    iconColor: 'text-blue-500'
  },
  AUX_DOENCA: {
    bgGradient: 'from-orange-50/50 via-white to-amber-50/30',
    primary: 'text-orange-900',
    secondary: 'text-orange-600',
    accent: 'border-orange-200',
    button: 'bg-orange-600 text-white shadow-orange-900/20',
    iconColor: 'text-orange-500'
  },
  MESA_DECISAO: {
    bgGradient: 'from-fuchsia-50/50 via-white to-pink-50/30',
    primary: 'text-fuchsia-900',
    secondary: 'text-fuchsia-600',
    accent: 'border-fuchsia-200',
    button: 'bg-fuchsia-700 text-white shadow-fuchsia-900/20',
    iconColor: 'text-fuchsia-500'
  },
  RECURSO_ADM: {
    bgGradient: 'from-indigo-50/50 via-white to-violet-50/30',
    primary: 'text-indigo-900',
    secondary: 'text-indigo-600',
    accent: 'border-indigo-200',
    button: 'bg-indigo-600 text-white shadow-indigo-900/20',
    iconColor: 'text-indigo-500'
  },
  JUDICIAL: {
    bgGradient: 'from-violet-50/50 via-white to-purple-50/30',
    primary: 'text-violet-900',
    secondary: 'text-violet-600',
    accent: 'border-violet-200',
    button: 'bg-violet-700 text-white shadow-violet-900/20',
    iconColor: 'text-violet-500'
  },
  ARCHIVED: {
    bgGradient: 'from-slate-100 via-slate-50 to-slate-200/50',
    primary: 'text-slate-800',
    secondary: 'text-slate-600',
    accent: 'border-slate-300',
    button: 'bg-slate-700 text-white',
    iconColor: 'text-slate-600'
  }
};

// --- VIEW CONFIGURATION (Icons & Labels) ---
export const VIEW_CONFIG: Record<ViewType, { label: string, icon: any }> = {
  ADMIN: { label: 'Administrativo', icon: LayoutDashboard },
  AUX_DOENCA: { label: 'Auxílio-Doença', icon: Stethoscope },
  MESA_DECISAO: { label: 'Mesa de Decisão', icon: Gavel },
  RECURSO_ADM: { label: 'Recurso Adm.', icon: FileText },
  JUDICIAL: { label: 'Judicial', icon: Scale },
  ARCHIVED: { label: 'Arquivados', icon: Archive },
};

// --- AUTOMATED TASKS ---
export const JUDICIAL_START_TASKS: Task[] = [
  { id: 't1', text: 'Coletar Procuração Judicial', completed: false },
  { id: 't2', text: 'Coletar Contrato de Honorários', completed: false },
  { id: 't3', text: 'Comprovante de Residência Atualizado', completed: false },
  { id: 't4', text: 'Baixar Processo Administrativo (Cópia Integral)', completed: false },
];

// --- WORKFLOW TEMPLATES (ROBÔS) ---
export const AUTOMATION_TEMPLATES = [
    {
        name: 'Robô de Triagem Inicial',
        description: 'Cria lista de documentos básicos (RG, CPF, CNIS) ao iniciar um caso.',
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'adm_triagem',
        conditions: [],
        actions: [
            { type: 'ADD_TASK', payload: 'Coletar RG, CPF e Comp. Residência' },
            { type: 'ADD_TASK', payload: 'Verificar Extrato CNIS e Qualidade de Segurado' },
            { type: 'ADD_TASK', payload: 'Gerar Procuração e Contrato' }
        ]
    },
    {
        name: 'Robô de Recurso (Indeferido)',
        description: 'Define tarefas de redação e estratégia quando um processo chega na fase de Recurso.',
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'rec_triagem',
        conditions: [],
        actions: [
            { type: 'ADD_TASK', payload: 'Baixar Cópia Integral do PA' },
            { type: 'ADD_TASK', payload: 'Analisar motivo do indeferimento' },
            { type: 'ADD_TASK', payload: 'Redigir minuta do Recurso Ordinário' }
        ]
    },
    {
        name: 'Trava de Senha Gov',
        description: 'Impede que o processo avance para "Protocolo" se não tiver a Senha Gov cadastrada.',
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'adm_protocolo',
        conditions: [
            { type: 'FIELD_EMPTY', value: 'govPassword' }
        ],
        actions: [
            { type: 'BLOCK_MOVE', payload: 'A senha do Gov.br é obrigatória para protocolar o pedido.' }
        ]
    },
    {
        name: 'Alerta Prioridade Idoso',
        description: 'Marca automaticamente com tag "Prioridade" se o cliente tiver +60 anos.',
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'adm_montagem',
        conditions: [
            { type: 'AGE_GREATER', value: 60 }
        ],
        actions: [
            { type: 'ADD_TAG', payload: 'Prioridade Idoso' },
            { type: 'SET_URGENCY', payload: 'HIGH' }
        ]
    },
    {
        name: 'Robô Judicial (Petição)',
        description: 'Cria tarefas para ajuizamento da ação ao entrar na fase judicial.',
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'jud_triagem',
        conditions: [],
        actions: [
            { type: 'ADD_TASK', payload: 'Coletar Procuração Judicial' },
            { type: 'ADD_TASK', payload: 'Elaborar Petição Inicial' },
            { type: 'ADD_TASK', payload: 'Calcular Valor da Causa' }
        ]
    }
];

// --- WORKFLOW RULES (DEFAULT SET) ---
export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
    // Instanciação dos Templates como regras ativas padrão
    { ...AUTOMATION_TEMPLATES[0], id: 'wr_def_1', isActive: true, conditions: [], actions: AUTOMATION_TEMPLATES[0].actions.map(a => ({...a, id: 'wa_1'})) } as any
];

// --- SUGGESTED ACTIONS (The "Brain" of the Facilitator) ---
export const SUGGESTED_ACTIONS: Record<string, { label: string, icon: any, actionType: 'MOVE' | 'LINK' | 'TASK' | 'WHATSAPP', target?: string, urgency?: string, url?: string }> = {
    // Administrativo
    'adm_viabilidade': { label: 'Viável? -> Triagem', icon: CheckCircle, actionType: 'MOVE', target: 'adm_triagem' },
    'adm_triagem': { label: 'Docs OK -> Montagem', icon: FileText, actionType: 'MOVE', target: 'adm_montagem' },
    'adm_docs': { label: 'Cobrar Cliente', icon: Send, actionType: 'WHATSAPP' },
    'adm_montagem': { label: 'Protocolar', icon: Send, actionType: 'MOVE', target: 'adm_protocolo' },
    'adm_protocolo': { label: 'Checar Status', icon: RefreshCw, actionType: 'LINK', url: 'https://meu.inss.gov.br/' }, 
    'adm_exigencia': { label: 'Cumprir Exigência', icon: FileCheck, actionType: 'MOVE', target: 'adm_protocolo' },
    'adm_concluido': { label: 'Definir Estratégia', icon: Search, actionType: 'MOVE', target: 'zone_mesa_decisao' },
    'adm_pagamento': { label: 'Arquivar Processo', icon: Archive, actionType: 'MOVE', target: 'zone_arquivo' },
    
    // Auxílio Doença
    'aux_chegada': { label: 'Agendar Perícia', icon: Calendar, actionType: 'MOVE', target: 'aux_protocolo' },
    'aux_pericia': { label: 'Consultar Laudo', icon: FileText, actionType: 'MOVE', target: 'aux_aguarda_resultado' },
    'aux_aguarda_resultado': { label: 'Ver Resultado', icon: Search, actionType: 'MOVE', target: 'aux_ativo' },
    'aux_ativo': { label: 'Checar DCB / PP', icon: RefreshCw, actionType: 'TASK' }, // UPDATE
    'aux_prorrogacao': { label: 'Checar Prorrogação', icon: RefreshCw, actionType: 'LINK', url: 'https://meu.inss.gov.br/' },
    'aux_indeferido': { label: 'Recorrer / Judicial', icon: Scale, actionType: 'MOVE', target: 'zone_mesa_decisao' },

    // Recurso
    'rec_triagem': { label: 'Redigir Recurso', icon: FileText, actionType: 'MOVE', target: 'rec_producao' },
    'rec_producao': { label: 'Protocolar (JR)', icon: Send, actionType: 'MOVE', target: 'rec_junta' },
    'rec_junta': { label: 'Monitorar JR', icon: Search, actionType: 'LINK', url: 'https://consultaprocessos.inss.gov.br/' },
    'rec_camera': { label: 'Monitorar CAJ', icon: Search, actionType: 'LINK', url: 'https://consultaprocessos.inss.gov.br/' },
    'rec_resultado': { label: 'Analisar Acórdão', icon: Gavel, actionType: 'MOVE', target: 'zone_judicial' },

    // Judicial
    'jud_triagem': { label: 'Ajuizar Ação', icon: Scale, actionType: 'MOVE', target: 'jud_ajuizada' },
    'jud_coleta': { label: 'Cobrar Docs', icon: Send, actionType: 'WHATSAPP' },
    'jud_montagem': { label: 'Ajuizar Ação', icon: Scale, actionType: 'MOVE', target: 'jud_ajuizada' },
    'jud_ajuizada': { label: 'Agendar Perícia Jud.', icon: Calendar, actionType: 'MOVE', target: 'jud_pericia' }, // Updated
    'jud_pericia': { label: 'Ver Laudo', icon: Search, actionType: 'LINK', url: 'https://eproc.trf4.jus.br/' }, // New
};


// --- SMART ACTIONS CONFIGURATION (Enhanced for ALL Screens) ---
export const SMART_ACTIONS_CONFIG: Record<string, { title: string, description: string, actions: SmartAction[] }> = {
  // ... (Conteúdo mantido, sem alterações aqui)
  // === ADMINISTRATIVO ===
  'ADMIN_adm_viabilidade': {
      title: 'Análise de Viabilidade',
      description: 'O cliente tem direito? Simule o tempo de contribuição.',
      actions: [
          { label: 'Viável -> Triagem', targetView: 'ADMIN', targetColumnId: 'adm_triagem', icon: CheckCircle, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'NORMAL' },
          { label: 'Inviável -> Arquivar', targetView: 'ARCHIVED', targetColumnId: 'arq_geral', icon: Archive, colorClass: 'bg-slate-600 text-white hover:bg-slate-700', urgency: 'NORMAL' }
      ]
  },
  'ADMIN_adm_triagem': {
      title: 'Triagem Inicial',
      description: 'Verifique se a documentação básica está completa.',
      actions: [
          { label: 'Solicitar Docs (WhatsApp)', targetView: 'ADMIN', targetColumnId: 'adm_docs', icon: Send, colorClass: 'bg-green-600 text-white hover:bg-green-700', urgency: 'HIGH' },
          { label: 'Tudo Certo -> Montagem', targetView: 'ADMIN', targetColumnId: 'adm_montagem', icon: FileText, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'NORMAL' }
      ]
  },
  'ADMIN_adm_docs': {
    title: 'Pendência Documental',
    description: 'Documentos pendentes impedem o andamento.',
    actions: [
        { label: 'Cobrar via WhatsApp', targetView: 'ADMIN', targetColumnId: 'adm_docs', icon: Send, colorClass: 'bg-green-600 text-white hover:bg-green-700', urgency: 'HIGH' },
        { label: 'Docs Recebidos -> Montagem', targetView: 'ADMIN', targetColumnId: 'adm_montagem', icon: FileCheck, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'NORMAL' }
    ]
  },
  'ADMIN_adm_montagem': {
      title: 'Montagem do Processo',
      description: 'Prepare a petição e anexe os documentos.',
      actions: [
          { label: 'Protocolar no INSS', targetView: 'ADMIN', targetColumnId: 'adm_protocolo', icon: Send, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'NORMAL' },
          { label: 'Gerar Procuração', targetView: 'ADMIN', targetColumnId: 'adm_montagem', icon: FileText, colorClass: 'bg-slate-600 text-white hover:bg-slate-700', urgency: 'NORMAL' } // Just context
      ]
  },
  'ADMIN_adm_protocolo': {
    title: 'Processo em Análise',
    description: 'Aguardando decisão do INSS.',
    actions: [
        { label: 'Conclusão (Decisão)', targetView: 'ADMIN', targetColumnId: 'adm_concluido', icon: FileText, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'NORMAL' },
        { label: 'Consultar Meu INSS', targetView: 'ADMIN', targetColumnId: 'adm_protocolo', icon: Search, colorClass: 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50', urgency: 'NORMAL', url: 'https://meu.inss.gov.br/' },
        { label: 'Caiu em Exigência', targetView: 'ADMIN', targetColumnId: 'adm_exigencia', icon: AlertTriangle, colorClass: 'bg-yellow-500 text-white hover:bg-yellow-600', urgency: 'HIGH' }
    ]
  },
  'ADMIN_adm_exigencia': {
    title: 'Exigência Aberta',
    description: 'O INSS solicitou documentos complementares.',
    actions: [
        { label: 'Exigência Cumprida', targetView: 'ADMIN', targetColumnId: 'adm_protocolo', icon: CheckCircle, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'HIGH' },
        { label: 'Solicitar ao Cliente', targetView: 'ADMIN', targetColumnId: 'adm_exigencia', icon: Send, colorClass: 'bg-green-600 text-white hover:bg-green-700', urgency: 'HIGH' }
    ]
  },
  'ADMIN_adm_concluido': {
    title: 'Análise Concluída',
    description: 'Defina a estratégia ou inicie um novo ciclo.',
    actions: [
      { label: 'Liberar para Pagamento', targetView: 'ADMIN', targetColumnId: 'adm_pagamento', icon: BadgeDollarSign, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'HIGH' },
      { label: 'Mesa de Decisão', targetView: 'MESA_DECISAO', targetColumnId: 'mesa_aguardando', icon: Gavel, colorClass: 'bg-slate-800 text-white hover:bg-slate-700', urgency: 'NORMAL' }
    ]
  },
  'ADMIN_adm_pagamento': {
      title: 'Fase de Pagamento',
      description: 'O benefício foi implantado. Garanta o recebimento.',
      actions: [
          { label: 'Arquivar (Concluído)', targetView: 'ARCHIVED', targetColumnId: 'arq_financeiro', icon: Archive, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'NORMAL' }
      ]
  },

  // === AUXÍLIO DOENÇA ===
  'AUX_DOENCA_aux_chegada': {
      title: 'Triagem Auxílio Doença',
      description: 'Verifique qualidade de segurado e carência.',
      actions: [
          { label: 'Agendar Perícia', targetView: 'AUX_DOENCA', targetColumnId: 'aux_protocolo', icon: Calendar, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'NORMAL' }
      ]
  },
  'AUX_DOENCA_aux_protocolo': {
      title: 'Aguardando Perícia',
      description: 'Protocolo feito. Aguardando a data da perícia.',
      actions: [
          { label: 'Confirmar Data Perícia', targetView: 'AUX_DOENCA', targetColumnId: 'aux_pericia', icon: Calendar, colorClass: 'bg-orange-600 text-white hover:bg-orange-700', urgency: 'HIGH' },
          { label: 'Avisar Cliente (WhatsApp)', targetView: 'AUX_DOENCA', targetColumnId: 'aux_protocolo', icon: Send, colorClass: 'bg-green-600 text-white hover:bg-green-700', urgency: 'NORMAL' }
      ]
  },
  'AUX_DOENCA_aux_ativo': {
    title: 'Benefício Ativo',
    description: 'Monitore a DCB. Se necessário, solicite prorrogação.',
    actions: [
      { label: 'Solicitar Prorrogação (PP)', targetView: 'AUX_DOENCA', targetColumnId: 'aux_prorrogacao', icon: RefreshCw, colorClass: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50', urgency: 'HIGH' }
    ]
  },
  'AUX_DOENCA_aux_indeferido': {
    title: 'Benefício Indeferido',
    description: 'O benefício foi negado. Defina o próximo passo.',
    actions: [
        { label: 'Judicializar Agora', targetView: 'JUDICIAL', targetColumnId: 'jud_triagem', icon: Scale, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'HIGH' },
        { label: 'Novo Pedido AD (Reentrada)', targetView: 'AUX_DOENCA', targetColumnId: 'aux_protocolo', icon: RefreshCw, colorClass: 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50', urgency: 'NORMAL' }
    ]
  },

  // === JUDICIAL ===
  'JUDICIAL_jud_triagem': {
      title: 'Triagem Judicial',
      description: 'Prepare a petição inicial.',
      actions: [
          { label: 'Iniciar Montagem', targetView: 'JUDICIAL', targetColumnId: 'jud_montagem', icon: FileText, colorClass: 'bg-purple-600 text-white hover:bg-purple-700', urgency: 'NORMAL' },
          { label: 'Coletar Documentos', targetView: 'JUDICIAL', targetColumnId: 'jud_coleta', icon: AlertTriangle, colorClass: 'bg-red-600 text-white hover:bg-red-700', urgency: 'HIGH' }
      ]
  },
  'JUDICIAL_jud_montagem': {
      title: 'Montagem da Ação',
      description: 'Redação da inicial e organização dos anexos.',
      actions: [
          { label: 'Ajuizar Ação (Protocolo)', targetView: 'JUDICIAL', targetColumnId: 'jud_ajuizada', icon: Scale, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'HIGH' }
      ]
  },
  'JUDICIAL_jud_ajuizada': {
      title: 'Ação em Andamento',
      description: 'Processo judicial ativo.',
      actions: [
          { label: 'Consultar E-Proc/PJE', targetView: 'JUDICIAL', targetColumnId: 'jud_ajuizada', icon: Search, colorClass: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50', urgency: 'NORMAL', url: 'https://eproc.trf4.jus.br/' },
          { label: 'Agendar Perícia Judicial', targetView: 'JUDICIAL', targetColumnId: 'jud_pericia', icon: Calendar, colorClass: 'bg-orange-500 text-white hover:bg-orange-600', urgency: 'HIGH' } // New Action
      ]
  },
  'JUDICIAL_jud_pericia': {
      title: 'Perícia Judicial',
      description: 'Aguardando data ou realização da perícia.',
      actions: [
          { label: 'Confirmar Data/Hora', targetView: 'JUDICIAL', targetColumnId: 'jud_pericia', icon: Calendar, colorClass: 'bg-orange-600 text-white hover:bg-orange-700', urgency: 'HIGH' },
          { label: 'Avisar Cliente (Kit Perícia)', targetView: 'JUDICIAL', targetColumnId: 'jud_pericia', icon: Send, colorClass: 'bg-green-600 text-white hover:bg-green-700', urgency: 'NORMAL' }
      ]
  },

  // === RECURSO ADM ===
  'RECURSO_ADM_rec_triagem': {
      title: 'Análise de Recurso',
      description: 'Estude o motivo do indeferimento.',
      actions: [
          { label: 'Iniciar Redação', targetView: 'RECURSO_ADM', targetColumnId: 'rec_producao', icon: FileText, colorClass: 'bg-indigo-600 text-white hover:bg-indigo-700', urgency: 'NORMAL' }
      ]
  },
  'RECURSO_ADM_rec_producao': {
      title: 'Redação do Recurso',
      description: 'Elabore a peça recursal.',
      actions: [
          { label: 'Protocolar na Junta (1ª Inst)', targetView: 'RECURSO_ADM', targetColumnId: 'rec_junta', icon: Send, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'NORMAL' }
      ]
  },
  'RECURSO_ADM_rec_junta': {
    title: 'Julgamento 1ª Instância (JR)',
    description: 'Aguardando decisão da Junta de Recursos.',
    actions: [
      { label: 'Provido (Ganhou)', targetView: 'RECURSO_ADM', targetColumnId: 'rec_resultado', icon: CheckCircle, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'NORMAL' },
      { label: 'Improvido (Perdeu) -> Rec. Especial', targetView: 'RECURSO_ADM', targetColumnId: 'rec_producao', icon: FileText, colorClass: 'bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50', urgency: 'HIGH' }
    ]
  },
  'RECURSO_ADM_rec_resultado': {
    title: 'Processo Recursal Finalizado',
    description: 'Resultado final do recurso administrativo.',
    actions: [
      { label: 'Arquivar/Financeiro', targetView: 'ARCHIVED', targetColumnId: 'arq_financeiro', icon: Archive, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'NORMAL' },
      { label: 'Judicializar', targetView: 'JUDICIAL', targetColumnId: 'jud_triagem', icon: Scale, colorClass: 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50', urgency: 'HIGH' }
    ]
  },

  // === MESA DE DECISÃO ===
  'MESA_DECISAO_mesa_aguardando': {
    title: 'Mesa de Decisão: Estratégia',
    description: 'Defina o destino deste processo.',
    actions: [
      { label: 'Judicializar', targetView: 'JUDICIAL', targetColumnId: 'jud_triagem', icon: Scale, colorClass: 'bg-white border border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50', urgency: 'HIGH' },
      { label: 'Recurso Adm.', targetView: 'RECURSO_ADM', targetColumnId: 'rec_triagem', icon: FileText, colorClass: 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50', urgency: 'NORMAL' },
      { label: 'Arquivar', targetView: 'ARCHIVED', targetColumnId: 'arq_geral', icon: Archive, colorClass: 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50', urgency: 'NORMAL' }
    ]
  },

  // === ARQUIVADOS (REATIVAÇÃO) ===
  'ARCHIVED_arq_geral': {
      title: 'Processo Arquivado',
      description: 'Este processo está inativo.',
      actions: [
          { label: 'Reativar para Admin', targetView: 'ADMIN', targetColumnId: 'adm_triagem', icon: RefreshCw, colorClass: 'bg-blue-600 text-white hover:bg-blue-700', urgency: 'NORMAL' },
          { label: 'Reativar para Judicial', targetView: 'JUDICIAL', targetColumnId: 'jud_triagem', icon: Scale, colorClass: 'bg-purple-600 text-white hover:bg-purple-700', urgency: 'NORMAL' }
      ]
  },
  'ARCHIVED_arq_financeiro': {
      title: 'Arquivo Financeiro',
      description: 'Processo aguardando pagamento ou concluído.',
      actions: [
          { label: 'Pagamento Recebido (Baixar)', targetView: 'ARCHIVED', targetColumnId: 'arq_morto', icon: CheckCircle, colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700', urgency: 'NORMAL' }
      ]
  }
};

// --- Column Definitions ---

// 1. General Administrative
export const ADMIN_COLUMNS: ColumnDefinition[] = [
  { id: 'adm_viabilidade', title: '1. Viabilidade / Cálculo', color: 'border-slate-300' }, // NEW: Added as requested
  { id: 'adm_triagem', title: '2. Chegada / Triagem', color: 'border-slate-400' },
  { id: 'adm_docs', title: '3. Pendência Documental', color: 'border-red-400' }, // Highlighted
  { id: 'adm_montagem', title: '4. Em Montagem', color: 'border-blue-300' },
  { id: 'adm_protocolo', title: '5. Protocolo (Em Análise)', color: 'border-blue-500' },
  { id: 'adm_exigencia', title: '6. Cumprimento de Exigência', color: 'border-yellow-500' },
  { id: 'adm_concluido', title: '7. Conclusão da Análise', color: 'border-emerald-600' }, 
  { id: 'adm_pagamento', title: '8. Pagamento / RPV', color: 'border-emerald-400' }, // NEW
  { id: 'zone_ms', title: 'Impetrar Mandado de Segurança', color: 'border-red-500' }, // NEW MS ZONE
  { id: 'zone_mesa_decisao', title: 'Enviar p/ Mesa de Decisão', color: 'border-fuchsia-500' },
  { id: 'zone_arquivo', title: 'Arquivar / Financeiro', color: 'border-slate-400' }, // ADDED: Direct Archive Zone
];

// 2. Mesa de Decisão
export const MESA_DECISAO_COLUMNS: ColumnDefinition[] = [
  { id: 'mesa_aguardando', title: 'Aguardando Definição Estratégica', color: 'border-fuchsia-600' },
  { id: 'zone_recurso', title: 'Recurso Administrativo', color: 'border-indigo-400' },
  { id: 'zone_judicial', title: 'Judicializar', color: 'border-blue-600' },
  { id: 'zone_arquivo', title: 'Arquivar / Financeiro', color: 'border-emerald-400' },
];

// 3. Auxílio-Doença
export const AUX_DOENCA_COLUMNS: ColumnDefinition[] = [
  { id: 'aux_chegada', title: '1. Triagem / Atestado', color: 'border-slate-400' },
  { id: 'aux_protocolo', title: '2. Protocolado (INSS)', color: 'border-blue-400' },
  { id: 'aux_pericia', title: '3. Perícia Agendada', color: 'border-orange-500' },
  { id: 'aux_aguarda_resultado', title: '4. Aguardando Resultado', color: 'border-yellow-500' },
  { id: 'aux_ativo', title: '5. Benefício Ativo (DCB)', color: 'border-green-500' },
  { id: 'aux_prorrogacao', title: '6. Prorrogação Solicitada', color: 'border-blue-600' },
  { id: 'aux_indeferido', title: '7. Indeferido / Cessado', color: 'border-red-500' },
  // Zones
  { id: 'zone_ms', title: 'Impetrar Mandado de Segurança', color: 'border-red-500' }, // NEW MS ZONE
  { id: 'zone_judicial', title: 'Judicializar', color: 'border-blue-600' },
  { id: 'zone_mesa_decisao', title: 'Mesa de Decisão', color: 'border-fuchsia-500' },
  { id: 'zone_arquivo', title: 'Arquivar', color: 'border-slate-400' },
];

// 4. Recurso Administrativo (ATUALIZADO - Fluxo Real)
export const RECURSO_ADM_COLUMNS: ColumnDefinition[] = [
  { id: 'rec_triagem', title: '1. Triagem / Estratégia', color: 'border-slate-400' },
  { id: 'rec_producao', title: '2. Produção (Redação)', color: 'border-indigo-300' },
  { id: 'rec_junta', title: '3. 1ª Instância (Junta/JR)', color: 'border-indigo-500' }, // New: replaces generic protocolado
  { id: 'rec_camera', title: '4. 2ª Instância (Câmara/CAJ)', color: 'border-purple-500' }, // New: Second instance
  { id: 'rec_resultado', title: '5. Resultado Final', color: 'border-emerald-500' },
  { id: 'zone_judicial', title: 'Judicializar', color: 'border-blue-600' },
  { id: 'zone_ms', title: 'Mandado de Segurança', color: 'border-red-500' },
  { id: 'zone_arquivo', title: 'Arquivar / Baixar', color: 'border-slate-400' }, // ADDED: Direct Archive Zone
];

// 5. Judicial
export const JUDICIAL_COLUMNS: ColumnDefinition[] = [
  { id: 'jud_triagem', title: 'Triagem', color: 'border-purple-400' },
  { id: 'jud_coleta', title: 'Coleta Docs', color: 'border-red-400' }, // Highlighted
  { id: 'jud_montagem', title: 'Montagem', color: 'border-purple-600' },
  { id: 'jud_ajuizada', title: 'Ação Ajuizada', color: 'border-blue-600' },
  { id: 'jud_pericia', title: 'Perícia Judicial', color: 'border-orange-500' }, // NEW: Judicial Expertise
  // Zones
  { id: 'zone_mesa_decisao', title: 'Mesa de Decisão', color: 'border-fuchsia-500' },
  { id: 'zone_admin', title: 'Enviar p/ Admin', color: 'border-slate-500' },
  { id: 'zone_arquivo', title: 'Arquivar', color: 'border-slate-400' },
];

// 6. Arquivados (NOVA VISÃO)
export const ARCHIVED_COLUMNS: ColumnDefinition[] = [
    { id: 'arq_geral', title: 'Arquivo Geral', color: 'border-slate-300' },
    { id: 'arq_financeiro', title: 'Financeiro (A Receber)', color: 'border-emerald-400' },
    { id: 'arq_morto', title: 'Baixados / Cancelados', color: 'border-slate-500' }
];

export const COLUMNS_BY_VIEW: Record<ViewType, ColumnDefinition[]> = {
  ADMIN: ADMIN_COLUMNS,
  MESA_DECISAO: MESA_DECISAO_COLUMNS,
  AUX_DOENCA: AUX_DOENCA_COLUMNS,
  RECURSO_ADM: RECURSO_ADM_COLUMNS,
  JUDICIAL: JUDICIAL_COLUMNS,
  ARCHIVED: ARCHIVED_COLUMNS,
};

// --- TRANSITION RULES ---
export const TRANSITION_RULES: TransitionRule[] = [
  // Pendências e Coleta Docs (Qualquer Origem)
  { from: '*', to: 'adm_docs', type: 'PENDENCY' },
  { from: '*', to: 'jud_coleta', type: 'PENDENCY' },

  // INSS Protocol (Qualquer Origem para Protocolo) -> Garante Popup
  { from: '*', to: 'adm_protocolo', type: 'PROTOCOL_INSS' },
  { from: '*', to: 'aux_protocolo', type: 'PROTOCOL_INSS' },
  
  // Prorrogação (Pede Protocolo)
  { from: '*', to: 'aux_prorrogacao', type: 'PROTOCOL_INSS' },

  // Perícia Agendada (Pede Protocolo/Data) - Now includes Judicial
  { from: '*', to: 'aux_pericia', type: 'PROTOCOL_INSS' },
  { from: '*', to: 'jud_pericia', type: 'PROTOCOL_INSS' }, // NEW

  // Exigência (Qualquer Origem) -> Garante Popup
  { from: '*', to: 'adm_exigencia', type: 'DEADLINE' },
  
  // Conclusão (Qualquer Origem) -> Garante Popup
  { from: '*', to: 'adm_concluido', type: 'CONCLUSION_NB' },
  
  // Recurso 1ª Instância (Junta)
  { from: '*', to: 'rec_junta', type: 'PROTOCOL_APPEAL' },
  // Recurso 2ª Instância (Câmara) - Usa mesmo form de protocolo
  { from: '*', to: 'rec_camera', type: 'PROTOCOL_APPEAL' },
  // Manter compatibilidade antiga (rec_protocolado não existe mais no novo fluxo, mas regra fica por segurança)
  { from: '*', to: 'rec_protocolado', type: 'PROTOCOL_APPEAL' },

  // NEW: Recurso Ordinário Improvido (Volta da Junta para Produção)
  { from: 'rec_junta', to: 'rec_producao', type: 'APPEAL_RETURN' },
];

export const BENEFIT_OPTIONS = [
  { code: '31', label: '31 - Auxílio por Incapacidade Temporária' },
  { code: '32', label: '32 - Aposentadoria por Incapacidade Permanente' },
  { code: '91', label: '91 - Auxílio Acidentário' },
  { code: '92', label: '92 - Aposentadoria Acidentária' },
  { code: '41', label: '41 - Aposentadoria por Idade' },
  { code: '42', label: '42 - Aposentadoria por Tempo de Contribuição' },
  { code: '46', label: '46 - Aposentadoria Especial' },
  { code: '21', label: '21 - Pensão por Morte' },
  { code: '87', label: '87 - BPC/LOAS (Deficiente)' },
  { code: '88', label: '88 - BPC/LOAS (Idoso)' },
  { code: '80', label: '80 - Salário Maternidade' },
  { code: '25', label: '25 - Auxílio-Reclusão' },
  { code: '07', label: '07 - Aposentadoria Idade Rural' },
  { code: '08', label: '08 - Aposentadoria Idade Rural (Empregador)' },
  { code: '48', label: '48 - Aposentadoria Idade Híbrida' },
  { code: '96', label: '96 - Pensão Especial Hanseníase' },
];

export const USER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'
];

export const USERS: User[] = [
  { id: 'u1', name: 'Dr. Maurícius Vogel', role: 'LAWYER', avatarInitials: 'MV', color: '#1e3a8a', themePref: 'default' },
  { id: 'u2', name: 'Dra. Ana Paula', role: 'LAWYER', avatarInitials: 'AP', color: '#db2777', themePref: 'default' },
  { id: 'u3', name: 'Secretaria', role: 'SECRETARY', avatarInitials: 'SC', color: '#059669', themePref: 'default' },
  { id: 'u4', name: 'Financeiro', role: 'FINANCIAL', avatarInitials: 'FN', color: '#d97706', themePref: 'default' }
];

export const DEFAULT_SYSTEM_TAGS: SystemTag[] = [
  { id: 'tag_1', label: 'Prioridade', colorBg: 'bg-red-100', colorText: 'text-red-700' },
  { id: 'tag_2', label: 'Rural', colorBg: 'bg-green-100', colorText: 'text-green-700' },
  { id: 'tag_3', label: 'Liminar', colorBg: 'bg-purple-100', colorText: 'text-purple-700' },
  { id: 'tag_4', label: 'Acordo', colorBg: 'bg-blue-100', colorText: 'text-blue-700' },
  { id: 'tag_5', label: 'Complexo', colorBg: 'bg-orange-100', colorText: 'text-orange-700' },
  { id: 'tag_6', label: 'Falta Docs', colorBg: 'bg-yellow-100', colorText: 'text-yellow-800' },
  { id: 'tag_7', label: 'CONCEDIDO', colorBg: 'bg-emerald-100', colorText: 'text-emerald-700' },
  { id: 'tag_8', label: 'INDEFERIDO', colorBg: 'bg-red-100', colorText: 'text-red-700' },
  { id: 'tag_9', label: 'A RECEBER', colorBg: 'bg-emerald-100', colorText: 'text-emerald-700' },
];
export const SYSTEM_TAGS = DEFAULT_SYSTEM_TAGS;

export const COMMON_DOCUMENTS = [
  'RG / CNH', 'CPF', 'Comprovante de Residência', 'CTPS (Carteira de Trabalho)', 'Extrato CNIS', 
  'Laudos Médicos', 'Receitas Médicas', 'Exames', 'PPP (Perfil Profissiográfico)', 'LTCAT', 
  'Carnês de Contribuição', 'Certidão de Casamento/Nascimento', 'Declaração Sindicato Rural', 
  'Notas Fiscais Produtor', 'Procuração Assinada', 'Contrato Honorários Assinado', 'Declaração de Hipossuficiência'
];

export const DEFAULT_INSS_AGENCIES: INSSAgency[] = [
  { id: 'aps_1', name: 'Agência INSS - CRUZ ALTA', address: 'Rua Voluntários da Pátria, 555, Centro' },
  { id: 'aps_2', name: 'Agência INSS - IBIRUBÁ', address: 'Rua do Comércio, 123, Centro' },
  { id: 'aps_3', name: 'Agência INSS - SANTA BÁRBARA', address: 'Av. Principal, 100' },
  { id: 'aps_4', name: 'Agência INSS - PANAMBI', address: 'Rua Sete de Setembro, 200' },
  { id: 'aps_5', name: 'Agência INSS - IJUÍ', address: 'Rua 15 de Novembro, 300' }
];

export const JUDICIAL_COURTS: INSSAgency[] = [
    { id: 'vara_1', name: '1ª Vara Federal de Cruz Alta', address: 'Rua General Câmara, 435' },
    { id: 'vara_2', name: '2ª Vara Federal de Cruz Alta', address: 'Rua General Câmara, 435' },
    { id: 'vara_3', name: 'Vara Federal de Carazinho', address: 'Av. Pátria, 789' },
    { id: 'vara_4', name: 'Vara Federal de Ijuí', address: 'Rua do Comércio, 500' }
];

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  { 
    id: 't_aviso_pericia', 
    label: 'Aviso de Perícia', 
    category: 'PERICIA', 
    text: 'Olá {NOME}, sua perícia foi agendada para o dia {DATA_PERICIA} no local: {LOCAL_PERICIA}. Chegue com 30min de antecedência e leve seus documentos pessoais e laudos médicos.' 
  },
  { 
    id: 't_aviso_pericia_imediato', 
    label: 'Aviso Perícia (Urgente)', 
    category: 'PERICIA', 
    text: 'URGENTE: {NOME}, confirmamos sua perícia para {DATA_PERICIA} às {HORA_PERICIA}. Local: {LOCAL_PERICIA}. Não falte!' 
  },
  { 
    id: 't_cobranca_docs', 
    label: 'Cobrar Documentos', 
    category: 'DOCUMENTOS', 
    text: 'Olá {NOME}, precisamos dos seguintes documentos para dar andamento no seu processo: {LISTA_DOCS}. Pode nos enviar foto legível por aqui?' 
  },
  { 
    id: 't_resultado_concedido', 
    label: 'Resultado: Aprovado', 
    category: 'RESULTADO', 
    text: 'Ótima notícia {NOME}! Seu benefício foi APROVADO. Entre em contato para agendarmos a liberação do pagamento.' 
  },
  { 
    id: 't_aniversario', 
    label: 'Feliz Aniversário', 
    category: 'GERAL', 
    text: 'Parabéns {NOME}! O escritório deseja muitas felicidades e saúde neste dia especial. 🎉' 
  },
  { 
    id: 't_check_prorrogacao', 
    label: 'Checar Prorrogação', 
    category: 'GERAL', 
    text: 'Olá {NOME}, seu benefício está previsto para encerrar em {DATA_DCB}. Você ainda está sem condições de voltar ao trabalho? Precisamos saber para pedir a prorrogação.' 
  },
  { 
    id: 't_pericia_judicial', 
    label: 'Perícia Judicial', 
    category: 'PERICIA', 
    text: 'Olá {NOME}, a perícia com o médico do Juiz foi marcada para {DATA_PERICIA} às {HORA_PERICIA} na {LOCAL_PERICIA}. É muito importante levar exames atuais.' 
  },
  { 
    id: 't_pericia_inss', 
    label: 'Perícia INSS', 
    category: 'PERICIA', 
    text: 'Olá {NOME}, agendamos sua perícia no INSS para {DATA_PERICIA} às {HORA_PERICIA}. Local: {LOCAL_PERICIA}. Leve identidade e carteira de trabalho.' 
  }
];

export const DOCUMENT_VARIABLES = [
    { key: '{NOME_CLIENTE}', label: 'Nome do Cliente' },
    { key: '{CPF}', label: 'CPF' },
    { key: '{RG}', label: 'RG' },
    { key: '{ENDERECO_COMPLETO}', label: 'Endereço Completo' },
    { key: '{NB}', label: 'Número Benefício' },
    { key: '{DATA_ATUAL}', label: 'Data de Hoje (Extenso)' },
    { key: '{CIDADE}', label: 'Cidade do Cliente' },
    { key: '{ADVOGADO_RESPONSAVEL}', label: 'Advogado Responsável' },
    { key: '{PIS}', label: 'PIS' },
    { key: '{TELEFONE}', label: 'Telefone' },
    { key: '{ESTADO_CIVIL}', label: 'Estado Civil' },
    { key: '{DATA_NASCIMENTO}', label: 'Data de Nascimento' },
    { key: '{NOME_MAE}', label: 'Nome da Mãe' },
    { key: '{NPU}', label: 'NPU (Processo Judicial)' }
];

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    {
        id: 'tpl_proc_1',
        title: 'Procuração Administrativa',
        category: 'PROCURACAO',
        content: '<p align="center"><strong>PROCURAÇÃO AD JUDICIA ET EXTRA</strong></p><p><br></p><p><strong>OUTORGANTE:</strong> {NOME_CLIENTE}, brasileiro(a), {ESTADO_CIVIL}, portador(a) do RG nº {RG} e CPF nº {CPF}, residente e domiciliado(a) na {ENDERECO_COMPLETO}.</p><p><strong>OUTORGADOS:</strong> {ADVOGADO_RESPONSAVEL}, inscrito na OAB...</p><p><strong>PODERES:</strong> Amplos poderes para o foro em geral...</p><p><br></p><p align="center">{CIDADE}, {DATA_ATUAL}</p><p align="center"><br></p><p align="center">___________________________________</p><p align="center">{NOME_CLIENTE}</p>',
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_contrato_1',
        title: 'Contrato de Honorários',
        category: 'CONTRATO',
        content: '<p align="center"><strong>CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</strong></p><p><br></p><p>Pelo presente instrumento, <strong>{NOME_CLIENTE}</strong>, CPF {CPF}, contrata os serviços profissionais...</p>',
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_dec_hipo',
        title: 'Declaração de Hipossuficiência',
        category: 'DECLARACAO',
        content: '<p align="center"><strong>DECLARAÇÃO DE HIPOSSUFICIÊNCIA</strong></p><p><br></p><p>Eu, <strong>{NOME_CLIENTE}</strong>, CPF {CPF}, declaro para os devidos fins que não possuo condições de arcar com as custas processuais...</p>',
        lastModified: new Date().toISOString()
    }
];

export const INITIAL_CASES: Case[] = [
  {
    id: 'c1',
    internalId: '2024.001',
    clientName: 'João da Silva',
    cpf: '123.456.789-00',
    birthDate: '1980-05-20',
    benefitType: '31',
    govPassword: 'senha_segura_123',
    phone: '(11) 99999-9999',
    view: 'AUX_DOENCA',
    columnId: 'aux_pericia',
    responsibleId: 'u3',
    responsibleName: 'Secretaria',
    createdAt: '2023-10-01',
    lastUpdate: '2023-10-25',
    protocolNumber: '1123456789',
    protocolDate: '2023-10-02',
    periciaDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    urgency: 'NORMAL',
    tasks: [],
    files: [],
    history: [
      { id: 'h1', date: '2023-10-01', user: 'Secretaria', action: 'Cadastro', details: 'Ficha interna 2024.001 gerada.' },
    ]
  },
  {
    id: 'c2',
    internalId: '2024.002',
    clientName: 'Maria Oliveira',
    cpf: '222.333.444-55',
    birthDate: '1965-02-15',
    benefitType: '31',
    govPassword: 'inss_maria_2023',
    phone: '(11) 98888-8888',
    view: 'AUX_DOENCA',
    columnId: 'aux_ativo',
    responsibleId: 'u3',
    responsibleName: 'Secretaria',
    createdAt: '2023-08-15',
    lastUpdate: '2023-10-02',
    protocolNumber: '9988776655',
    benefitNumber: '654.321.987-0', // TEM NB
    benefitDate: '2023-09-01',
    dcbDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    urgency: 'HIGH',
    tasks: [],
    files: [],
    tags: ['CONCEDIDO'],
    history: []
  },
  {
    id: 'c3',
    internalId: '2024.003',
    clientName: 'Dona Benta',
    cpf: '999.888.777-66',
    birthDate: '1950-12-01',
    benefitType: '88',
    phone: '(55) 91234-5678',
    view: 'ADMIN',
    columnId: 'adm_montagem',
    responsibleId: 'u2',
    responsibleName: 'Dra. Ana',
    createdAt: '2023-09-10',
    lastUpdate: '2023-09-12',
    urgency: 'NORMAL',
    tasks: [],
    files: [],
    tags: ['Prioridade Idoso'],
    history: []
  },
  {
    id: 'c4',
    internalId: '2023.099',
    clientName: 'Pedro Recursal',
    cpf: '111.222.333-44',
    birthDate: '1975-06-30',
    benefitType: '41',
    phone: '(55) 5555-5555',
    view: 'RECURSO_ADM',
    columnId: 'rec_junta', // UPDATED to new ID
    responsibleId: 'u1',
    responsibleName: 'Dr. Maurícius',
    createdAt: '2023-05-10',
    lastUpdate: '2023-10-20',
    protocolNumber: '888777666', // Original Protocol
    appealProtocolNumber: 'REC-2023-00555', // Appeal Protocol
    urgency: 'HIGH',
    tasks: [],
    files: [],
    tags: [],
    history: []
  },
  {
    id: 'c5',
    internalId: '2024.004',
    clientName: 'Caso na Mesa',
    cpf: '555.666.777-88',
    birthDate: '1990-01-01',
    benefitType: '42',
    phone: '(11) 90000-0000',
    view: 'MESA_DECISAO',
    columnId: 'mesa_aguardando',
    responsibleId: 'u1',
    responsibleName: 'Dr. Maurícius',
    createdAt: '2023-09-01',
    lastUpdate: '2023-10-26',
    protocolNumber: '123123123',
    benefitNumber: '111.222.333-9',
    urgency: 'HIGH',
    tasks: [],
    files: [],
    tags: ['Rural'],
    history: []
  }
];
