

import { ColumnDefinition, Case, User, ViewType, TransitionRule, Task, SmartAction, WhatsAppTemplate, ThemeConfig, DocumentTemplate } from './types';
import { LayoutDashboard, Stethoscope, Scale, FileText, Gavel, Archive, ArrowRight, RefreshCw, AlertTriangle, BadgeDollarSign, Siren, Search, FileCheck, Send, Calculator, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';

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
    {
        id: 'tpl_hipossuficiencia',
        title: 'Declaração de Hipossuficiência',
        category: 'DECLARACAO',
        lastModified: new Date().toISOString(),
        content: `
        <h3 style="text-align: center;"><strong>DECLARAÇÃO DE HIPOSSUFICIÊNCIA</strong></h3>
        <p>&nbsp;</p>
        <p>Eu, <strong>{NOME_CLIENTE}</strong>, inscrito(a) no CPF sob o nº {CPF}, RG nº {RG}, residente e domiciliado(a) na {ENDERECO_COMPLETO}.</p>
        <p>&nbsp;</p>
        <p><strong>DECLARO</strong>, para os devidos fins de direito e sob as penas da lei, que não tenho condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família. Por tal razão, pleiteio os benefícios da <strong>JUSTIÇA GRATUITA</strong>, assegurados pela Constituição Federal, artigo 5º, LXXIV e pela Lei 13.105/2015 (CPC), artigo 98 e seguintes.</p>
        <p>&nbsp;</p>
        <p>Por ser verdade, firmo a presente declaração.</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">_________________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `
    },
    {
        id: 'tpl_residencia',
        title: 'Declaração de Residência',
        category: 'DECLARACAO',
        lastModified: new Date().toISOString(),
        content: `
        <h3 style="text-align: center;"><strong>DECLARAÇÃO DE RESIDÊNCIA</strong></h3>
        <p>&nbsp;</p>
        <p>Eu, <strong>{NOME_CLIENTE}</strong>, portador(a) do RG nº {RG} e inscrito(a) no CPF sob o nº {CPF}.</p>
        <p>&nbsp;</p>
        <p><strong>DECLARO</strong> ao INSS e a quem possa interessar, sob as penas da Lei (art. 299 do Código Penal), que sou residente e domiciliado(a) no seguinte endereço:</p>
        <p>&nbsp;</p>
        <p><strong>Logradouro:</strong> {RUA}, nº {NUMERO}</p>
        <p><strong>Bairro:</strong> {BAIRRO}</p>
        <p><strong>Cidade/UF:</strong> {CIDADE} - {UF}</p>
        <p><strong>CEP:</strong> {CEP}</p>
        <p>&nbsp;</p>
        <p>Declaro ainda estar ciente de que a falsidade da presente declaração pode implicar na sanção penal prevista no art. 299 do Código Penal Brasileiro, bem como nas sanções administrativas e cíveis cabíveis.</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">_________________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `
    },
    {
        id: 'tpl_contrato_aposentadoria',
        title: 'Contrato Hon. Aposentadoria',
        category: 'CONTRATO',
        lastModified: new Date().toISOString(),
        content: `
        <h3 style="text-align: center;"><strong>CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (APOSENTADORIA)</strong></h3>
        <p>&nbsp;</p>
        <p><strong>CONTRATANTE:</strong> <strong>{NOME_CLIENTE}</strong>, brasileiro(a), {ESTADO_CIVIL}, portador(a) do CPF nº {CPF}, residente e domiciliado(a) na {ENDERECO_COMPLETO}.</p>
        <p><strong>CONTRATADO: {ADVOGADO_RESPONSAVEL}</strong>, advogado inscrito na OAB sob o nº 00.000.</p>
        <p>&nbsp;</p>
        <p><strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> O presente instrumento tem como objeto a prestação de serviços advocatícios para propositura e acompanhamento de <strong>PEDIDO DE APOSENTADORIA</strong> junto ao INSS e, se necessário, na via judicial.</p>
        <p>&nbsp;</p>
        <p><strong>CLÁUSULA SEGUNDA - DOS HONORÁRIOS:</strong> Em remuneração aos serviços profissionais ora pactuados, o(a) CONTRATANTE pagará ao CONTRATADO honorários equivalentes a:</p>
        <ul>
            <li><strong>30% (trinta por cento)</strong> sobre o valor bruto dos atrasados (parcelas vencidas) recebidos administrativamente ou judicialmente.</li>
            <li>O valor correspondente aos <strong>03 (três) primeiros benefícios mensais</strong> integrais recebidos.</li>
        </ul>
        <p>&nbsp;</p>
        <p><strong>CLÁUSULA TERCEIRA - DAS DESPESAS:</strong> As despesas com custas judiciais e extrajudiciais, se houver, correrão por conta do(a) CONTRATANTE, exceto se beneficiário da Justiça Gratuita.</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p>&nbsp;</p>
        <div style="display: flex; justify-content: space-between; padding-top: 50px;">
            <div style="text-align: center; width: 45%;">
                <p>__________________________</p>
                <p><strong>{ADVOGADO_RESPONSAVEL}</strong></p>
            </div>
            <div style="text-align: center; width: 45%;">
                <p>__________________________</p>
                <p><strong>{NOME_CLIENTE}</strong></p>
            </div>
        </div>
        `
    },
    {
        id: 'tpl_contrato_aux_doenca',
        title: 'Contrato Hon. Auxílio Doença',
        category: 'CONTRATO',
        lastModified: new Date().toISOString(),
        content: `
        <h3 style="text-align: center;"><strong>CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (AUXÍLIO DOENÇA)</strong></h3>
        <p>&nbsp;</p>
        <p><strong>CONTRATANTE:</strong> <strong>{NOME_CLIENTE}</strong>, brasileiro(a), {ESTADO_CIVIL}, portador(a) do CPF nº {CPF}, residente e domiciliado(a) na {ENDERECO_COMPLETO}.</p>
        <p><strong>CONTRATADO: {ADVOGADO_RESPONSAVEL}</strong>, advogado inscrito na OAB sob o nº 00.000.</p>
        <p>&nbsp;</p>
        <p><strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> O presente contrato tem por objeto o requerimento administrativo e/ou judicial de <strong>BENEFÍCIO POR INCAPACIDADE (AUXÍLIO-DOENÇA/APOSENTADORIA POR INVALIDEZ)</strong>.</p>
        <p>&nbsp;</p>
        <p><strong>CLÁUSULA SEGUNDA - DOS HONORÁRIOS:</strong> O(A) CONTRATANTE pagará, a título de honorários advocatícios, o valor correspondente a <strong>30% (trinta por cento)</strong> sobre o proveito econômico da ação (atrasados), com valor mínimo estipulado em R$ 1.500,00 (hum mil e quinhentos reais) em caso de êxito.</p>
        <p>&nbsp;</p>
        <p><strong>CLÁUSULA TERCEIRA:</strong> Não havendo êxito na demanda, nada será devido a título de honorários (Cláusula <em>Ad Exitum</em>).</p>
        <p>&nbsp;</p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p>&nbsp;</p>
        <div style="display: flex; justify-content: space-between; padding-top: 50px;">
            <div style="text-align: center; width: 45%;">
                <p>__________________________</p>
                <p><strong>{ADVOGADO_RESPONSAVEL}</strong></p>
            </div>
            <div style="text-align: center; width: 45%;">
                <p>__________________________</p>
                <p><strong>{NOME_CLIENTE}</strong></p>
            </div>
        </div>
        `
    }
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

// --- SUGGESTED ACTIONS (The "Brain" of the Facilitator) ---
export const SUGGESTED_ACTIONS: Record<string, { label: string, icon: any, actionType: 'MOVE' | 'LINK' | 'TASK' | 'WHATSAPP', target?: string, urgency?: string }> = {
    // Administrativo
    'adm_triagem': { label: 'Analisar Docs', icon: Search, actionType: 'MOVE', target: 'adm_montagem' },
    'adm_docs': { label: 'Cobrar Cliente', icon: Send, actionType: 'WHATSAPP' },
    'adm_montagem': { label: 'Protocolar', icon: FileText, actionType: 'MOVE', target: 'adm_protocolo' },
    'adm_protocolo': { label: 'Checar Status', icon: RefreshCw, actionType: 'LINK' }, // Link pro MEU INSS
    'adm_exigencia': { label: 'Cumprir Exigência', icon: FileCheck, actionType: 'TASK' },
    'adm_concluido': { label: 'Analisar Decisão', icon: Search, actionType: 'MOVE', target: 'zone_mesa_decisao' },
    
    // Auxílio Doença
    'aux_chegada': { label: 'Agendar Perícia', icon: Calendar, actionType: 'MOVE', target: 'aux_protocolo' },
    'aux_pericia': { label: 'Consultar Laudo', icon: FileText, actionType: 'MOVE', target: 'aux_aguarda_resultado' },
    'aux_aguarda_resultado': { label: 'Ver Resultado', icon: Search, actionType: 'MOVE', target: 'aux_ativo' },
    'aux_ativo': { label: 'Calcular RMI', icon: Calculator, actionType: 'TASK' },
    'aux_prorrogacao': { label: 'Checar Prorrogação', icon: RefreshCw, actionType: 'LINK' },
    'aux_indeferido': { label: 'Recorrer / Judicial', icon: Scale, actionType: 'MOVE', target: 'zone_mesa_decisao' },

    // Recurso
    'rec_triagem': { label: 'Redigir Recurso', icon: FileText, actionType: 'MOVE', target: 'rec_producao' },
    'rec_producao': { label: 'Protocolar Recurso', icon: Send, actionType: 'MOVE', target: 'rec_protocolado' },
    'rec_protocolado': { label: 'Monitorar Julgamento', icon: Search, actionType: 'MOVE', target: 'rec_aguardando' },
    'rec_aguardando': { label: 'Consultar Andamento', icon: RefreshCw, actionType: 'LINK' },
    'rec_resultado': { label: 'Analisar Acórdão', icon: Gavel, actionType: 'MOVE', target: 'zone_judicial' },

    // Judicial
    'jud_triagem': { label: 'Ajuizar Ação', icon: Scale, actionType: 'MOVE', target: 'jud_ajuizada' },
    'jud_coleta': { label: 'Cobrar Docs', icon: Send, actionType: 'WHATSAPP' },
    'jud_montagem': { label: 'Ajuizar Ação', icon: Scale, actionType: 'MOVE', target: 'jud_ajuizada' },
};


// --- SMART ACTIONS CONFIGURATION (Dynamic Buttons) ---
export const SMART_ACTIONS_CONFIG: Record<string, { title: string, description: string, actions: SmartAction[] }> = {
  // 1. Final do Administrativo -> Mesa de Decisão
  'ADMIN_adm_concluido': {
    title: 'Análise Administrativa Concluída',
    description: 'O processo técnico foi finalizado. Defina a estratégia ou inicie um novo ciclo.',
    actions: [
      {
        label: 'Enviar p/ Mesa de Decisão',
        targetView: 'MESA_DECISAO',
        targetColumnId: 'mesa_aguardando',
        icon: Gavel,
        colorClass: 'bg-slate-800 text-white hover:bg-slate-700',
        urgency: 'NORMAL'
      },
      {
        label: 'Novo Protocolo (Reentrada)',
        targetView: 'ADMIN',
        targetColumnId: 'adm_protocolo',
        icon: RefreshCw,
        colorClass: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50',
        urgency: 'NORMAL'
      }
    ]
  },
  // 1.1 Pendência Documental
  'ADMIN_adm_docs': {
    title: 'Pendência Documental',
    description: 'Documentos pendentes impedem o andamento. Cobre o cliente ou avance se já recebeu.',
    actions: [
        {
            label: 'Cobrar via WhatsApp',
            targetView: 'ADMIN', 
            targetColumnId: 'adm_docs', // No move, just action
            icon: Send, 
            colorClass: 'bg-green-600 text-white hover:bg-green-700',
            urgency: 'HIGH'
        },
        {
            label: 'Docs Recebidos -> Montagem',
            targetView: 'ADMIN',
            targetColumnId: 'adm_montagem',
            icon: FileCheck,
            colorClass: 'bg-blue-600 text-white hover:bg-blue-700',
            urgency: 'NORMAL'
        }
    ]
  },
  // 1.2 Cumprimento de Exigência
  'ADMIN_adm_exigencia': {
    title: 'Exigência Aberta',
    description: 'O INSS solicitou documentos complementares. Cumpra o prazo para evitar indeferimento.',
    actions: [
        {
            label: 'Exigência Cumprida',
            targetView: 'ADMIN',
            targetColumnId: 'adm_protocolo', // Returns to analysis
            icon: CheckCircle,
            colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
            urgency: 'HIGH'
        }
    ]
  },
  // 1.3 Protocolo INSS (Decisões)
  'ADMIN_adm_protocolo': {
    title: 'Processo em Análise',
    description: 'Aguardando decisão do INSS. Verifique se houve movimentação no sistema.',
    actions: [
        {
            label: 'Caiu em Exigência',
            targetView: 'ADMIN',
            targetColumnId: 'adm_exigencia',
            icon: AlertTriangle,
            colorClass: 'bg-yellow-500 text-white hover:bg-yellow-600',
            urgency: 'HIGH'
        },
        {
            label: 'Conclusão (Deferido/Indeferido)',
            targetView: 'ADMIN',
            targetColumnId: 'adm_concluido',
            icon: FileText,
            colorClass: 'bg-blue-600 text-white hover:bg-blue-700',
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
    description: 'O recurso foi concluído. Defina o próximo passo.',
    actions: [
      {
        label: 'Recurso Negado? Ajuizar Ação',
        targetView: 'JUDICIAL',
        targetColumnId: 'jud_triagem',
        icon: Scale,
        colorClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
        urgency: 'HIGH',
        tasksToAdd: JUDICIAL_START_TASKS
      },
      {
        label: 'Novo Pedido ADM (Reentrada)',
        targetView: 'ADMIN',
        targetColumnId: 'adm_protocolo',
        icon: RefreshCw,
        colorClass: 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50',
        urgency: 'NORMAL'
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
  },
  // 4.1 Auxílio Doença -> Resultado Prorrogação
  'AUX_DOENCA_aux_prorrogacao': {
    title: 'Pedido de Prorrogação (PP)',
    description: 'O pedido de prorrogação foi feito. Registre o resultado da nova perícia.',
    actions: [
        {
            label: 'Prorrogação Deferida',
            targetView: 'AUX_DOENCA',
            targetColumnId: 'aux_ativo',
            icon: CheckCircle,
            colorClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
            urgency: 'NORMAL'
        },
        {
            label: 'Prorrogação Indeferida',
            targetView: 'AUX_DOENCA',
            targetColumnId: 'aux_indeferido',
            icon: XCircle,
            colorClass: 'bg-red-600 text-white hover:bg-red-700',
            urgency: 'HIGH'
        }
    ]
  },
  // 4.2 Auxílio Doença -> Indeferido (Ações de Reentrada)
  'AUX_DOENCA_aux_indeferido': {
    title: 'Benefício Indeferido/Cessado',
    description: 'O benefício foi negado. Você pode judicializar ou fazer um novo pedido.',
    actions: [
        {
            label: 'Judicializar Agora',
            targetView: 'JUDICIAL',
            targetColumnId: 'jud_triagem',
            icon: Scale,
            colorClass: 'bg-blue-600 text-white hover:bg-blue-700',
            urgency: 'HIGH',
            tasksToAdd: JUDICIAL_START_TASKS
        },
        {
            label: 'Novo Pedido AD (Reentrada)',
            targetView: 'AUX_DOENCA',
            targetColumnId: 'aux_protocolo',
            icon: RefreshCw,
            colorClass: 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50',
            urgency: 'NORMAL'
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