
import { ColumnDefinition, Case, User, ViewType, TransitionRule, Task, SmartAction, WhatsAppTemplate, ThemeConfig, DocumentTemplate, WorkflowRule, SystemTag, INSSAgency } from './types';
import { LayoutDashboard, Stethoscope, Scale, FileText, Gavel, Archive, ArrowRight, RefreshCw, AlertTriangle, BadgeDollarSign, Siren, Search, FileCheck, Send, Calculator, Calendar, CheckCircle, XCircle, Plus, BookOpen, Coins, FileSearch, TrendingUp } from 'lucide-react';

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

// --- INSS AGENCIES (DEFAULT LIST) ---
export const DEFAULT_INSS_AGENCIES: INSSAgency[] = [
    { id: 'aps_1', name: 'Agência INSS - CRUZ ALTA', address: 'Rua Voluntários da Pátria, 500, Centro' },
    { id: 'aps_2', name: 'Agência INSS - IJUÍ', address: 'Rua 15 de Novembro, 200' },
    { id: 'aps_3', name: 'Agência INSS - PANAMBI', address: 'Rua da Holanda, 55' },
    { id: 'aps_4', name: 'Agência INSS - IBIRUBÁ', address: 'Rua General Osório, 800' },
    { id: 'aps_5', name: 'Agência INSS - SANTO ÂNGELO', address: 'Rua Marechal Floriano, 1000' },
    { id: 'aps_6', name: 'Agência INSS - CARAZINHO', address: 'Av. Flores da Cunha, 250' },
    { id: 'aps_7', name: 'Agência INSS - PASSO FUNDO', address: 'Rua Paissandú, 100' }
];

// --- SYSTEM TAGS (Initial Defaults) ---
export const DEFAULT_SYSTEM_TAGS: SystemTag[] = [
    { id: 'tag_liminar', label: 'Liminar Deferida', colorBg: 'bg-emerald-100', colorText: 'text-emerald-700' },
    { id: 'tag_aguarda_cli', label: 'Aguardando Cliente', colorBg: 'bg-orange-100', colorText: 'text-orange-700', rules: [{ type: 'COLUMN_CONTAINS', value: 'docs' }] },
    { id: 'tag_prioridade', label: 'Prioridade Idoso', colorBg: 'bg-purple-100', colorText: 'text-purple-700', rules: [{ type: 'AGE_GREATER', value: 60 }] },
    { id: 'tag_rural', label: 'Rural', colorBg: 'bg-amber-100', colorText: 'text-amber-800' },
    { id: 'tag_loas', label: 'LOAS', colorBg: 'bg-blue-100', colorText: 'text-blue-700', rules: [{ type: 'BENEFIT_TYPE', value: '87' }, { type: 'BENEFIT_TYPE', value: '88' }] },
    { id: 'tag_risco', label: 'Risco de Indeferimento', colorBg: 'bg-red-100', colorText: 'text-red-700' },
    { id: 'tag_revisao', label: 'Revisão', colorBg: 'bg-indigo-100', colorText: 'text-indigo-700' },
    { id: 'tag_concluido', label: 'CONCEDIDO', colorBg: 'bg-emerald-500', colorText: 'text-white' },
    { id: 'tag_negado', label: 'INDEFERIDO', colorBg: 'bg-red-500', colorText: 'text-white' },
    { id: 'tag_receber', label: 'A RECEBER', colorBg: 'bg-emerald-100', colorText: 'text-emerald-800' },
    { id: 'tag_ms', label: 'MANDADO DE SEGURANÇA', colorBg: 'bg-red-100', colorText: 'text-red-800' }, // Nova Tag
];

// Keep this for backwards compatibility if needed, but components should use state
export const SYSTEM_TAGS = DEFAULT_SYSTEM_TAGS;

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

// --- DOCUMENT VARIABLES (For Generator) ---
export const DOCUMENT_VARIABLES = [
    { key: '{NOME_CLIENTE}', label: 'Nome do Cliente' },
    { key: '{CPF}', label: 'CPF' },
    { key: '{RG}', label: 'RG' },
    { key: '{PIS}', label: 'PIS' },
    { key: '{TELEFONE}', label: 'Telefone' },
    { key: '{ESTADO_CIVIL}', label: 'Estado Civil' },
    { key: '{DATA_NASCIMENTO}', label: 'Data de Nascimento' },
    { key: '{NOME_MAE}', label: 'Nome da Mãe' },
    // Endereço Granular
    { key: '{ENDERECO_COMPLETO}', label: 'Endereço (Completo Formatado)' },
    { key: '{RUA}', label: 'Rua/Logradouro' },
    { key: '{NUMERO}', label: 'Número' },
    { key: '{BAIRRO}', label: 'Bairro' },
    { key: '{CIDADE}', label: 'Cidade' },
    { key: '{UF}', label: 'UF' },
    { key: '{CEP}', label: 'CEP' },
    // Processo
    { key: '{NB}', label: 'Número do Benefício (NB)' },
    { key: '{NPU}', label: 'Processo Judicial (NPU)' },
    // Datas e Escritório
    { key: '{DATA_ATUAL}', label: 'Data de Hoje (Extenso)' },
    { key: '{DIA}', label: 'Dia Atual (DD)' },
    { key: '{MES}', label: 'Mês Atual (Nome)' },
    { key: '{ANO}', label: 'Ano Atual (AAAA)' },
    { key: '{ADVOGADO_RESPONSAVEL}', label: 'Advogado Responsável' },
];

// --- DEFAULT DOCUMENT TEMPLATES ---
export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    // ... (templates mantidos como estão)
    {
        id: 'tpl_procuracao_ad_judicia',
        title: 'Procuração Ad Judicia',
        category: 'PROCURACAO',
        lastModified: new Date().toISOString(),
        content: `
        <h3 style="text-align: center;"><strong>PROCURAÇÃO AD JUDICIA ET EXTRA</strong></h3>
        <p>&nbsp;</p>
        <p><strong>OUTORGANTE:</strong> <strong>{NOME_CLIENTE}</strong>, nacionalidade brasileira, {ESTADO_CIVIL}, portador(a) do RG nº {RG} e CPF nº {CPF}, residente e domiciliado(a) na {ENDERECO_COMPLETO}.</p>
        <p>&nbsp;</p>
        <p><strong>OUTORGADO: {ADVOGADO_RESPONSAVEL}</strong>, brasileiro, advogado, inscrito na OAB sob o nº 00.000, com escritório profissional à Rua Exemplo, nº 100, Centro.</p>
        <p>&nbsp;</p>
        <p><strong>PODERES:</strong> Pelo presente instrumento particular de procuração, o(a) OUTORGANTE nomeia e constitui o(a) OUTORGADO(A) seu(sua) bastante procurador(a), conferindo-lhe amplos poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito, as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe ainda, poderes especiais para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromisso e substabelecer esta em outrem, com ou sem reservas de iguais poderes, para agir em conjunto ou separadamente, dando tudo por bom, firme e valioso, especialmente para fins de <strong>REQUERIMENTO DE BENEFÍCIO PREVIDENCIÁRIO E AÇÃO JUDICIAL PREVIDENCIÁRIA</strong>.</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">_________________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `
    },
];

// --- WHATSAPP TEMPLATES (Updated with Better Defaults) ---
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 't_docs_pendencia',
        label: 'Cobrança de Documentos',
        category: 'DOCUMENTOS',
        text: 'Olá *{NOME}*, tudo bem? 👋\n\nSou da equipe do Rambo Prev. Estamos analisando seu processo e notamos que faltam alguns documentos importantes para darmos andamento:\n\n{LISTA_DOCS}\n\n📸 *Você poderia nos enviar fotos legíveis desses documentos por aqui?*\n\nQuanto antes recebermos, mais rápido será o protocolo!'
    },
    {
        id: 't_geral',
        label: 'Boas Vindas',
        category: 'GERAL',
        text: 'Olá *{NOME}*, seja bem-vindo ao Rambo Prev! 🏛️\n\nÉ um prazer ter você conosco. Já iniciamos o cadastro do seu processo em nosso sistema sob o número de controle *{ID_INTERNO}*.\n\nQualquer dúvida sobre o andamento, pode nos chamar diretamente por este WhatsApp. Estamos à disposição!'
    },
    {
        id: 't_pericia',
        label: 'Aviso de Perícia',
        category: 'PERICIA',
        text: '⚠️ *AVISO IMPORTANTE - PERÍCIA AGENDADA*\n\nOlá *{NOME}*, sua perícia médica no INSS foi marcada!\n\n📅 *Data:* {DATA_PERICIA}\n📍 *Local:* {LOCAL_PERICIA}\n\n🛑 *Chegue com 30 minutos de antecedência.*\n📂 Leve seus documentos pessoais (RG/CPF) e todos os exames/laudos médicos originais.'
    },
    {
        id: 't_resultado_aprovado',
        label: 'Resultado: Aprovado',
        category: 'RESULTADO',
        text: '🎉 *ÓTIMA NOTÍCIA {NOME}!* 🎉\n\nTemos o prazer de informar que seu benefício foi *CONCEDIDO* pelo INSS!\n\n📄 *Número do Benefício:* {NB}\n\nEntre em contato conosco ou venha até o escritório para agendarmos o recebimento e passarmos os próximos passos. Parabéns!'
    },
    {
        id: 't_resultado_negado',
        label: 'Resultado: Indeferido',
        category: 'RESULTADO',
        text: 'Olá *{NOME}*. Recebemos o resultado da análise administrativa.\n\nInfelizmente, o INSS negou o pedido inicial. 😕\n\nMas não se preocupe! 🛡️ Nossa equipe jurídica já está analisando o motivo da negativa para entrarmos com o recurso ou ação judicial o mais rápido possível. Em breve entraremos em contato para explicar a estratégia.'
    },
    {
        id: 't_aniversario',
        label: 'Aniversário',
        category: 'GERAL',
        text: '🎈 *Feliz Aniversário, {NOME}!* 🎈\n\nA equipe Rambo Prev deseja um dia repleto de alegria, saúde e realizações para você e sua família.\n\nConte sempre conosco para buscar seus direitos! Um grande abraço.'
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
  },
  ARCHIVED: {
    bgGradient: 'from-slate-200 to-slate-300',
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

// --- WORKFLOW RULES (DEFAULT SET) ---
export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
    // Regra 1: Entrou em Montagem -> Checklist de Documentos
    {
        id: 'wr_def_1',
        name: 'Checklist de Montagem',
        isActive: true,
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'adm_montagem',
        conditions: [],
        actions: [
            { id: 'wa_1', type: 'ADD_TASK', payload: 'Digitalizar RG e CPF' },
            { id: 'wa_2', type: 'ADD_TASK', payload: 'Gerar Procuração' },
            { id: 'wa_3', type: 'ADD_TASK', payload: 'Assinar Contrato' }
        ]
    },
    // Regra 2: Entrou em Triagem de Recurso -> Tarefas de Redação
    {
        id: 'wr_def_2',
        name: 'Fluxo de Recurso',
        isActive: true,
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'rec_triagem',
        conditions: [],
        actions: [
            { id: 'wa_4', type: 'ADD_TASK', payload: 'Analisar motivo do indeferimento' },
            { id: 'wa_5', type: 'ADD_TASK', payload: 'Redigir minuta do recurso' }
        ]
    },
    // Regra 3: Bloqueio de Senha Gov no Protocolo
    {
        id: 'wr_def_3',
        name: 'Bloqueio Sem Senha Gov',
        isActive: true,
        trigger: 'COLUMN_ENTER',
        targetColumnId: 'adm_protocolo',
        conditions: [
            { id: 'wc_1', type: 'FIELD_EMPTY', value: 'govPassword' }
        ],
        actions: [
            { id: 'wa_6', type: 'BLOCK_MOVE', payload: 'A senha do Gov.br é obrigatória para protocolar o pedido.' }
        ]
    }
];

export const AUTOMATION_RULES = []; // Deprecated in favor of Workflow Rules, kept empty to prevent crash

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
    'aux_ativo': { label: 'Calcular RMI', icon: Calculator, actionType: 'TASK' },
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
          { label: 'Consultar E-Proc/PJE', targetView: 'JUDICIAL', targetColumnId: 'jud_ajuizada', icon: Search, colorClass: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50', urgency: 'NORMAL', url: 'https://eproc.trf4.jus.br/' }
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
  
  // Recurso 1ª Instância (Junta)
  { from: '*', to: 'rec_junta', type: 'PROTOCOL_APPEAL' },
  // Recurso 2ª Instância (Câmara) - Usa mesmo form de protocolo
  { from: '*', to: 'rec_camera', type: 'PROTOCOL_APPEAL' },
  // Manter compatibilidade antiga (rec_protocolado não existe mais no novo fluxo, mas regra fica por segurança)
  { from: '*', to: 'rec_protocolado', type: 'PROTOCOL_APPEAL' },

  // NEW: Recurso Ordinário Improvido (Volta da Junta para Produção)
  { from: 'rec_junta', to: 'rec_producao', type: 'APPEAL_RETURN' },
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
