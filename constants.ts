import { ColumnDefinition, Case, User, ViewType, TransitionRule, Task, SmartAction, WhatsAppTemplate, ThemeConfig } from './types';
import { LayoutDashboard, Stethoscope, Scale, FileText, Gavel, Archive, ArrowRight, RefreshCw, AlertTriangle, BadgeDollarSign, Siren } from 'lucide-react';

// --- USER IDENTITY COLORS ---
export const USER_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#64748b', // Slate
  '#14b8a6', // Teal
  '#d946ef', // Fuchsia
];

// --- Users ---
export const USERS: User[] = [
  { id: 'u1', name: 'Dr. Maurícius', avatarInitials: 'MR', role: 'LAWYER', color: '#8b5cf6' }, // Violet
  { id: 'u2', name: 'Dra. Ana', avatarInitials: 'AN', role: 'LAWYER', color: '#ec4899' }, // Pink
  { id: 'u3', name: 'Secretaria', avatarInitials: 'SEC', role: 'SECRETARY', color: '#64748b' }, // Slate
  { id: 'u4', name: 'Financeiro', avatarInitials: 'FIN', role: 'FINANCIAL', color: '#10b981' }, // Emerald
];

// --- Benefit Types (Codes) ---
export const BENEFIT_OPTIONS = [
  { code: '31', label: '31 - Auxílio-Doença (Incapacidade Temp.)' },
  { code: '41', label: '41 - Aposentadoria por Idade' },
  { code: '42', label: '42 - Apos. Tempo de Contribuição' },
  { code: '46', label: '46 - Apos. Especial' },
  { code: '57', label: '57 - Apos. Professor' },
  { code: '21', label: '21 - Pensão por Morte' },
  { code: '25', label: '25 - Auxílio-Reclusão' },
  { code: '87', label: '87 - LOAS (Deficiente)' },
  { code: '88', label: '88 - LOAS (Idoso)' },
];

// --- DOCUMENTOS COMUNS (Checklist) ---
export const COMMON_DOCUMENTS = [
    "RG / CNH (Identidade)",
    "CPF",
    "Comprovante de Residência Atual",
    "Carteira de Trabalho (CTPS)",
    "Extrato CNIS",
    "Senha do Gov.br",
    "Laudos Médicos Atuais",
    "Receituários / Exames",
    "PPP (Perfil Profissiográfico)",
    "Certidão de Casamento/Nascimento",
    "Contrato de Honorários Assinado",
    "Procuração Assinada"
];

// --- WHATSAPP TEMPLATES ---
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 't_docs_pendencia',
        label: 'Cobrança de Pendências',
        category: 'DOCUMENTOS',
        text: 'Olá {NOME}, analisamos seu processo e identificamos que faltam os seguintes documentos para prosseguir: {LISTA_DOCS}. Poderia nos enviar foto legível assim que possível?'
    },
    {
        id: 't_geral',
        label: 'Boas Vindas',
        category: 'GERAL',
        text: 'Olá {NOME}, seja bem-vindo ao Rambo Prev! Já iniciamos o cadastro do seu processo sob o número {ID_INTERNO}. Qualquer dúvida, pode nos chamar por aqui.'
    },
    {
        id: 't_pericia',
        label: 'Aviso de Perícia',
        category: 'PERICIA',
        text: 'Olá {NOME}, sua perícia médica no INSS foi agendada para o dia {DATA_PERICIA}. É muito importante chegar com 30 minutos de antecedência e levar seus documentos e exames atuais.'
    },
    {
        id: 't_resultado_aprovado',
        label: 'Resultado: Aprovado',
        category: 'RESULTADO',
        text: 'Ótima notícia {NOME}! Seu benefício foi CONCEDIDO pelo INSS. O número do benefício é {NB}. Entre em contato conosco para agendarmos o recebimento.'
    },
    {
        id: 't_resultado_negado',
        label: 'Resultado: Indeferido',
        category: 'RESULTADO',
        text: 'Olá {NOME}. Infelizmente o INSS negou o pedido administrativo. Mas não se preocupe, nossa equipe jurídica já está analisando para entrarmos com o recurso ou ação judicial. Te avisaremos em breve.'
    },
    {
        id: 't_prorrogacao',
        label: 'Aviso de Prorrogação',
        category: 'PERICIA',
        text: 'Olá {NOME}, seu benefício está próximo de cessar em {DATA_DCB}. Se você ainda não está apto a voltar ao trabalho, precisamos pedir a prorrogação urgente. Por favor, nos confirme.'
    },
    {
        id: 't_aniversario',
        label: 'Feliz Aniversário',
        category: 'GERAL',
        text: 'Parabéns {NOME}! 🎉 O escritório Rambo Prev deseja a você um Feliz Aniversário! Muita saúde, paz e realizações neste novo ciclo. Conte sempre conosco!'
    }
];

// --- THEME CONFIGURATION (Colors per View) ---
export const VIEW_THEMES: Record<ViewType, ThemeConfig> = {
  ADMIN: {
    bgGradient: 'from-slate-100 to-blue-50',
    primary: 'text-slate-800',
    secondary: 'text-slate-500',
    accent: 'border-blue-200',
    button: 'bg-slate-800 text-white shadow-slate-900/20',
    iconColor: 'text-blue-500'
  },
  AUX_DOENCA: {
    bgGradient: 'from-orange-50 to-amber-50',
    primary: 'text-orange-900',
    secondary: 'text-orange-600',
    accent: 'border-orange-200',
    button: 'bg-orange-600 text-white shadow-orange-900/20',
    iconColor: 'text-orange-500'
  },
  MESA_DECISAO: {
    bgGradient: 'from-fuchsia-50 to-pink-50',
    primary: 'text-fuchsia-900',
    secondary: 'text-fuchsia-600',
    accent: 'border-fuchsia-200',
    button: 'bg-fuchsia-700 text-white shadow-fuchsia-900/20',
    iconColor: 'text-fuchsia-500'
  },
  RECURSO_ADM: {
    bgGradient: 'from-indigo-50 to-violet-50',
    primary: 'text-indigo-900',
    secondary: 'text-indigo-600',
    accent: 'border-indigo-200',
    button: 'bg-indigo-600 text-white shadow-indigo-900/20',
    iconColor: 'text-indigo-500'
  },
  JUDICIAL: {
    bgGradient: 'from-violet-50 to-purple-50',
    primary: 'text-violet-900',
    secondary: 'text-violet-600',
    accent: 'border-violet-200',
    button: 'bg-violet-700 text-white shadow-violet-900/20',
    iconColor: 'text-violet-500'
  }
};

// --- VIEW CONFIGURATION (Icons & Labels) ---
export const VIEW_CONFIG: Record<ViewType, { label: string, icon: any }> = {
  ADMIN: { label: 'Administrativo', icon: LayoutDashboard },
  AUX_DOENCA: { label: 'Auxílio-Doença', icon: Stethoscope },
  MESA_DECISAO: { label: 'Mesa de Decisão', icon: Gavel },
  RECURSO_ADM: { label: 'Recurso Adm.', icon: FileText },
  JUDICIAL: { label: 'Judicial', icon: Scale },
};

// --- AUTOMATED TASKS ---
export const JUDICIAL_START_TASKS: Task[] = [
  { id: 't1', text: 'Coletar Procuração Judicial', completed: false },
  { id: 't2', text: 'Coletar Contrato de Honorários', completed: false },
  { id: 't3', text: 'Comprovante de Residência Atualizado', completed: false },
  { id: 't4', text: 'Baixar Processo Administrativo (Cópia Integral)', completed: false },
];

// --- SMART ACTIONS CONFIGURATION (Dynamic Buttons) ---
export const SMART_ACTIONS_CONFIG: Record<string, { title: string, description: string, actions: SmartAction[] }> = {
  // 1. Final do Administrativo -> Mesa de Decisão
  'ADMIN_adm_concluido': {
    title: 'Análise Administrativa Concluída',
    description: 'O processo técnico foi finalizado. Envie para o advogado sênior definir a estratégia.',
    actions: [
      {
        label: 'Enviar p/ Mesa de Decisão',
        targetView: 'MESA_DECISAO',
        targetColumnId: 'mesa_aguardando',
        icon: Gavel,
        colorClass: 'bg-slate-800 text-white hover:bg-slate-700',
        urgency: 'NORMAL'
      }
    ]
  },
  // 2. Mesa de Decisão -> Destinos
  'MESA_DECISAO_mesa_aguardando': {
    title: 'Mesa de Decisão: Estratégia',
    description: 'Defina o destino deste processo no escritório.',
    actions: [
      {
        label: 'Judicializar (Ação/Revisão)',
        targetView: 'JUDICIAL',
        targetColumnId: 'jud_triagem',
        icon: Scale,
        colorClass: 'bg-white border border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50',
        urgency: 'HIGH',
        tasksToAdd: JUDICIAL_START_TASKS
      },
      {
        label: 'Recurso Adm.',
        targetView: 'RECURSO_ADM',
        targetColumnId: 'rec_triagem', // Changed to Triagem
        icon: FileText,
        colorClass: 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50',
        urgency: 'NORMAL'
      },
      {
        label: 'Financeiro / Arquivar',
        targetView: 'ADMIN',
        targetColumnId: 'adm_arquivado',
        icon: BadgeDollarSign,
        colorClass: 'bg-white border border-emerald-300 text-emerald-600 hover:bg-emerald-50',
        urgency: 'NORMAL'
      }
    ]
  },
  // 3. Recurso Negado -> Judicial
  'RECURSO_ADM_rec_resultado': {
    title: 'Resultado do Recurso',
    description: 'O recurso foi concluído. Se negado, encaminhe para o judicial.',
    actions: [
      {
        label: 'Recurso Negado? Ajuizar Ação',
        targetView: 'JUDICIAL',
        targetColumnId: 'jud_triagem',
        icon: Scale,
        colorClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
        urgency: 'HIGH',
        tasksToAdd: JUDICIAL_START_TASKS
      }
    ]
  },
  // 4. Auxílio Doença -> Prorrogação
  'AUX_DOENCA_aux_ativo': {
    title: 'Benefício Ativo',
    description: 'Monitore a DCB. Se necessário, solicite prorrogação.',
    actions: [
      {
        label: 'Solicitar Prorrogação (PP)',
        targetView: 'AUX_DOENCA',
        targetColumnId: 'aux_prorrogacao',
        icon: RefreshCw,
        colorClass: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50',
        urgency: 'HIGH'
      }
    ]
  }
};

// --- Column Definitions ---

// 1. General Administrative
export const ADMIN_COLUMNS: ColumnDefinition[] = [
  { id: 'adm_triagem', title: '1. Chegada / Triagem', color: 'border-slate-400' },
  { id: 'adm_docs', title: '2. Pendência Documental', color: 'border-red-400' }, // Highlighted
  { id: 'adm_montagem', title: '3. Em Montagem', color: 'border-blue-300' },
  { id: 'adm_protocolo', title: '4. Protocolo (Em Análise)', color: 'border-blue-500' },
  { id: 'adm_exigencia', title: '5. Cumprimento de Exigência', color: 'border-yellow-500' },
  { id: 'adm_concluido', title: '6. Conclusão da Análise', color: 'border-emerald-600' }, 
  { id: 'zone_mesa_decisao', title: 'Enviar p/ Mesa de Decisão', color: 'border-fuchsia-500' },
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
  { id: 'zone_judicial', title: 'Judicializar', color: 'border-blue-600' },
  { id: 'zone_mesa_decisao', title: 'Mesa de Decisão', color: 'border-fuchsia-500' },
  { id: 'zone_arquivo', title: 'Arquivar', color: 'border-slate-400' },
];

// 4. Recurso Administrativo
export const RECURSO_ADM_COLUMNS: ColumnDefinition[] = [
  { id: 'rec_triagem', title: '1. Triagem', color: 'border-slate-400' },
  { id: 'rec_producao', title: '2. Produção do Recurso', color: 'border-indigo-300' },
  { id: 'rec_protocolado', title: '3. Recurso Protocolado', color: 'border-indigo-500' },
  { id: 'rec_aguardando', title: '4. Aguardando Julgamento', color: 'border-yellow-600' },
  { id: 'rec_resultado', title: '5. Resultado do Recurso', color: 'border-purple-500' },
  { id: 'zone_judicial', title: 'Judicializar', color: 'border-blue-600' },
  { id: 'zone_ms', title: 'Mandado de Segurança', color: 'border-red-500' },
];

// 5. Judicial
export const JUDICIAL_COLUMNS: ColumnDefinition[] = [
  { id: 'jud_triagem', title: 'Triagem', color: 'border-purple-400' },
  { id: 'jud_coleta', title: 'Coleta Docs', color: 'border-red-400' }, // Highlighted
  { id: 'jud_montagem', title: 'Montagem', color: 'border-purple-600' },
  { id: 'jud_ajuizada', title: 'Ação Ajuizada', color: 'border-blue-600' },
  // Zones
  { id: 'zone_mesa_decisao', title: 'Mesa de Decisão', color: 'border-fuchsia-500' },
  { id: 'zone_admin', title: 'Enviar p/ Admin', color: 'border-slate-500' },
  { id: 'zone_arquivo', title: 'Arquivar', color: 'border-slate-400' },
];

export const COLUMNS_BY_VIEW: Record<ViewType, ColumnDefinition[]> = {
  ADMIN: ADMIN_COLUMNS,
  MESA_DECISAO: MESA_DECISAO_COLUMNS,
  AUX_DOENCA: AUX_DOENCA_COLUMNS,
  RECURSO_ADM: RECURSO_ADM_COLUMNS,
  JUDICIAL: JUDICIAL_COLUMNS,
};

// --- LOGIC RULES (TRANSITIONS) ---

export const TRANSITION_RULES: TransitionRule[] = [
  // Pendências e Coleta Docs (Qualquer Origem)
  { from: '*', to: 'adm_docs', type: 'PENDENCY' },
  { from: '*', to: 'jud_coleta', type: 'PENDENCY' },

  // INSS Protocol (Qualquer Origem para Protocolo) -> Garante Popup
  { from: '*', to: 'adm_protocolo', type: 'PROTOCOL_INSS' },
  { from: '*', to: 'aux_protocolo', type: 'PROTOCOL_INSS' },
  
  // Prorrogação (Pede Protocolo)
  { from: '*', to: 'aux_prorrogacao', type: 'PROTOCOL_INSS' },

  // Perícia Agendada (Pede Protocolo/Data)
  { from: '*', to: 'aux_pericia', type: 'PROTOCOL_INSS' },

  // Exigência (Qualquer Origem) -> Garante Popup
  { from: '*', to: 'adm_exigencia', type: 'DEADLINE' },
  
  // Conclusão (Qualquer Origem) -> Garante Popup
  { from: '*', to: 'adm_concluido', type: 'CONCLUSION_NB' },
  
  // Recurso (Qualquer Origem) -> Garante Popup
  { from: '*', to: 'rec_protocolado', type: 'PROTOCOL_APPEAL' },
];

// --- Initial Mock Data ---

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
    columnId: 'rec_protocolado',
    responsibleId: 'u1',
    responsibleName: 'Dr. Maurícius',
    createdAt: '2023-05-10',
    lastUpdate: '2023-10-20',
    protocolNumber: '888777666', // Original Protocol
    appealProtocolNumber: 'REC-2023-00555', // Appeal Protocol
    urgency: 'HIGH',
    tasks: [],
    files: [],
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
    history: []
  }
];