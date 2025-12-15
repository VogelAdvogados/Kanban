
import { WhatsAppTemplate, DocumentTemplate } from '../types';

export const AUTOMATION_TEMPLATES = [
    { 
        name: 'Boas Vindas Automático', 
        trigger: 'COLUMN_ENTER', 
        targetColumnId: 'adm_triagem', 
        conditions: [], 
        actions: [{ type: 'ADD_TASK', payload: 'Enviar mensagem de boas vindas' }],
        description: 'Cria uma tarefa de recepção ao iniciar um novo caso.'
    },
    { 
        name: 'Urgência em Indeferidos', 
        trigger: 'COLUMN_ENTER', 
        targetColumnId: 'aux_indeferido', 
        conditions: [], 
        actions: [{ type: 'SET_URGENCY', payload: 'HIGH' }, { type: 'ADD_TAG', payload: 'INDEFERIDO' }],
        description: 'Marca urgência e etiqueta casos negados para recurso.'
    }
];

export const DOCUMENT_VARIABLES = [
    { key: '{NOME_CLIENTE}', label: 'Nome do Cliente' },
    { key: '{CPF}', label: 'CPF' },
    { key: '{RG}', label: 'RG' },
    { key: '{PIS}', label: 'PIS' },
    { key: '{TELEFONE}', label: 'Telefone' },
    { key: '{ESTADO_CIVIL}', label: 'Estado Civil' },
    { key: '{DATA_NASCIMENTO}', label: 'Data de Nascimento' },
    { key: '{NOME_MAE}', label: 'Nome da Mãe' },
    { key: '{NB}', label: 'Número do Benefício' },
    { key: '{NPU}', label: 'NPU (Processo Judicial)' },
    { key: '{ADVOGADO_RESPONSAVEL}', label: 'Advogado Responsável' },
    { key: '{ENDERECO_COMPLETO}', label: 'Endereço Completo (Inteligente)' },
    { key: '{RUA}', label: 'Rua' },
    { key: '{NUMERO}', label: 'Número' },
    { key: '{BAIRRO}', label: 'Bairro' },
    { key: '{CIDADE}', label: 'Cidade' },
    { key: '{UF}', label: 'Estado (UF)' },
    { key: '{CEP}', label: 'CEP' },
    { key: '{SAUDACAO}', label: 'Sr. / Sra. (Auto)' },
    { key: '{ARTIGO}', label: 'o / a (Auto)' },
    { key: '{ARTIGO_CAP}', label: 'O / A (Auto)' },
    { key: '{PREZADO}', label: 'Prezado / Prezada (Auto)' },
    { key: '{AO_A}', label: 'ao / à (Auto)' },
    { key: '{DATA_ATUAL}', label: 'Data por Extenso' },
    { key: '{DIA}', label: 'Dia' },
    { key: '{MES}', label: 'Mês' },
    { key: '{ANO}', label: 'Ano' },
];

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
    { id: 't_boas_vindas', label: 'Boas Vindas', category: 'GERAL', text: 'Olá {NOME}, aqui é da Vogel Advocacia. Recebemos seu contato e vamos iniciar a análise do seu caso. Qualquer dúvida, estamos à disposição.' },
    { id: 't_pericia_inss', label: 'Aviso Perícia INSS', category: 'PERICIA', text: 'Olá {NOME}. Sua perícia no INSS foi agendada para dia {DATA_PERICIA} às {HORA_PERICIA}, na agência: {LOCAL_PERICIA}. Leve seus documentos e laudos médicos atualizados.' },
    { id: 't_pericia_judicial', label: 'Aviso Perícia Judicial', category: 'PERICIA', text: 'Olá {NOME}. Sua perícia judicial foi marcada para dia {DATA_PERICIA} às {HORA_PERICIA}, no endereço: {LOCAL_PERICIA}. É muito importante não se atrasar.' },
    { id: 't_docs_pendentes', label: 'Cobrança Documentos', category: 'DOCUMENTOS', text: 'Olá {NOME}, precisamos dos seguintes documentos para dar andamento no seu processo:\n{LISTA_DOCS}\nPor favor, envie fotos legíveis ou traga no escritório.' },
    { id: 't_concessao', label: 'Benefício Concedido', category: 'RESULTADO', text: 'Ótima notícia {NOME}! Seu benefício foi CONCEDIDO! Entre em contato para agendarmos a entrega da carta de concessão.' },
    { id: 't_aniversario', label: 'Aniversário', category: 'GERAL', text: 'Parabéns {NOME}! A Vogel Advocacia deseja um feliz aniversário, muita saúde e paz.' }
];

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    {
        id: 'tpl_procuracao_prev_v4',
        title: 'Procuração INSS e Judicial (Completa)',
        category: 'PROCURACAO',
        content: `
        <p style="text-align: center;"><strong><u>PROCURAÇÃO AD JUDICIA ET EXTRA</u></strong></p>
        <p><br></p>
        <p style="text-align: justify;"><strong>OUTORGANTE:</strong> {NOME_CLIENTE}, {ESTADO_CIVIL}, portador(a) do RG n° {RG}, inscrito(a) no CPF sob o n° {CPF}, residente e domiciliado(a) em {ENDERECO_COMPLETO}.</p>
        <p style="text-align: justify;"><strong>OUTORGADO(S):</strong> {ADVOGADO_RESPONSAVEL}, brasileiro, advogado, inscrito na OAB/UF sob o nº ..., com escritório profissional na ..., onde recebe intimações e notificações.</p>
        <p style="text-align: justify;"><strong>PODERES:</strong> Pelo presente instrumento, o(a) OUTORGANTE nomeia e constitui seu bastante procurador o(s) OUTORGADO(S), concedendo-lhe(s) amplos poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, seguindo umas e outras até final decisão.</p>
        <p style="text-align: justify;"><strong>PODERES ESPECÍFICOS (INSS):</strong> Concede poderes especiais para atuar junto ao Instituto Nacional do Seguro Social - INSS, visando a concessão, revisão ou manutenção de benefícios previdenciários e assistenciais, podendo requerer, agendar, acompanhar, tomar ciência de despachos, cumprir exigências, interpor recursos, solicitar cópias de processos administrativos, <strong>cadastrar e alterar senha de acesso ao portal MEU INSS</strong>, obter extratos (CNIS, HISCRE, PLENUS), e praticar todos os atos necessários.</p>
        <p style="text-align: justify;"><strong>PODERES ESPECIAIS:</strong> Confere-se ainda poderes especiais para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromisso e substabelecer.</p>
        <p style="text-align: justify;"><strong>LEVANTAMENTO DE VALORES:</strong> Fica expressamente autorizado o(s) Outorgado(s) a receber e dar quitação de valores, levantar Alvarás Judiciais, RPVs (Requisições de Pequeno Valor) e Precatórios, diretamente em nome do(a) Outorgante ou em nome próprio, em qualquer instituição financeira.</p>
        <p><br></p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p><br></p>
        <p><br></p>
        <p style="text-align: center;">___________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `,
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_contrato_quota_litis_v4',
        title: 'Contrato de Honorários (Quota Litis 30%)',
        category: 'CONTRATO',
        content: `
        <p style="text-align: center;"><strong><u>CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</u></strong></p>
        <p><br></p>
        <p style="text-align: justify;"><strong>CONTRATANTE:</strong> {NOME_CLIENTE}, CPF {CPF}, residente em {ENDERECO_COMPLETO}.</p>
        <p style="text-align: justify;"><strong>CONTRATADO:</strong> {ADVOGADO_RESPONSAVEL}, advogado, OAB/UF ..., com endereço profissional na ...</p>
        <p><br></p>
        <p style="text-align: justify;"><strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> O presente contrato tem por objeto a prestação de serviços advocatícios na esfera administrativa e/ou judicial, visando a concessão/restabelecimento/revisão de benefício previdenciário.</p>
        <p style="text-align: justify;"><strong>CLÁUSULA SEGUNDA - DOS HONORÁRIOS (QUOTA LITIS):</strong> Em remuneração aos serviços profissionais, o(a) CONTRATANTE pagará ao CONTRATADO honorários exclusivamente em caso de êxito, no percentual de <strong>30% (trinta por cento)</strong> sobre o proveito econômico obtido.</p>
        <p style="text-align: justify;"><strong>PARÁGRAFO PRIMEIRO - BASE DE CÁLCULO:</strong> O percentual incidirá sobre todas as parcelas vencidas (atrasados) recebidas administrativamente ou judicialmente (PAB, RPV ou Precatório) e sobre as 12 (doze) primeiras parcelas vincendas do benefício implantado.</p>
        <p style="text-align: justify;"><strong>PARÁGRAFO SEGUNDO - DO RISCO:</strong> Caso não haja êxito na demanda após esgotados os recursos cabíveis, nada será devido a título de honorários advocatícios pelo CONTRATANTE.</p>
        <p style="text-align: justify;"><strong>CLÁUSULA TERCEIRA - DO DESTAQUE:</strong> O(A) CONTRATANTE autoriza expressamente, desde já, o destaque dos honorários contratuais diretamente do montante a ser recebido via RPV ou Precatório, nos termos do art. 22, §4º da Lei 8.906/94.</p>
        <p style="text-align: justify;"><strong>CLÁUSULA QUARTA - SUCUMBÊNCIA:</strong> Os honorários de sucumbência pertencem ao advogado, sem prejuízo dos honorários contratuais aqui estipulados.</p>
        <p style="text-align: justify;"><strong>CLÁUSULA QUINTA - FORO:</strong> Elegem o foro de {CIDADE} para dirimir questões deste contrato.</p>
        <p><br></p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p><br></p>
        <div style="display: flex; justify-content: space-between;">
            <div style="width: 45%; text-align: center;">
                _________________________<br>
                <strong>{NOME_CLIENTE}</strong><br>Contratante
            </div>
            <div style="width: 45%; text-align: center;">
                _________________________<br>
                <strong>{ADVOGADO_RESPONSAVEL}</strong><br>Contratado
            </div>
        </div>
        <p><br></p>
        <p style="font-size: 10px;">Testemunhas:</p>
        <p style="font-size: 10px;">1. _____________________________ CPF:</p>
        <p style="font-size: 10px;">2. _____________________________ CPF:</p>
        `,
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_hipossuficiencia_cpc_v4',
        title: 'Declaração de Hipossuficiência (Justiça Gratuita)',
        category: 'DECLARACAO',
        content: `
        <p style="text-align: center;"><strong><u>DECLARAÇÃO DE HIPOSSUFICIÊNCIA</u></strong></p>
        <p><br></p>
        <p style="text-align: justify;">Eu, <strong>{NOME_CLIENTE}</strong>, {ESTADO_CIVIL}, portador(a) do RG n° {RG} e inscrito(a) no CPF sob o n° {CPF}, residente e domiciliado(a) em {ENDERECO_COMPLETO},</p>
        <p><br></p>
        <p style="text-align: justify;"><strong>DECLARO</strong>, para os devidos fins de direito e sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.</p>
        <p><br></p>
        <p style="text-align: justify;">Por esta razão, requeiro os benefícios da <strong>GRATUIDADE DE JUSTIÇA</strong>, assegurados pela Constituição Federal, artigo 5º, LXXIV e pelo Código de Processo Civil (Lei nº 13.105/2015), artigo 98 e seguintes.</p>
        <p><br></p>
        <p style="text-align: justify;">Estou ciente de que a falsidade desta declaração pode implicar na sanção penal prevista no art. 299 do Código Penal.</p>
        <p><br></p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p><br></p>
        <p><br></p>
        <p style="text-align: center;">___________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `,
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_residencia_lei_v4',
        title: 'Declaração de Residência (Lei 7.115/83)',
        category: 'DECLARACAO',
        content: `
        <p style="text-align: center;"><strong><u>DECLARAÇÃO DE RESIDÊNCIA</u></strong></p>
        <p><br></p>
        <p style="text-align: justify;">Eu, <strong>{NOME_CLIENTE}</strong>, {ESTADO_CIVIL}, inscrito(a) no CPF sob o n° {CPF},</p>
        <p><br></p>
        <p style="text-align: justify;"><strong>DECLARO</strong>, sob as penas da Lei nº 7.115/83, que resido e sou domiciliado(a) no endereço abaixo discriminado:</p>
        <p><br></p>
        <p style="margin-left: 40px;"><strong>Logradouro:</strong> {RUA}, {NUMERO}</p>
        <p style="margin-left: 40px;"><strong>Bairro:</strong> {BAIRRO}</p>
        <p style="margin-left: 40px;"><strong>Cidade/UF:</strong> {CIDADE} / {UF}</p>
        <p style="margin-left: 40px;"><strong>CEP:</strong> {CEP}</p>
        <p><br></p>
        <p style="text-align: justify;">Declaro também que não possuo comprovantes de residência (contas de consumo como água, luz ou telefone) em meu próprio nome, razão pela qual firmo este documento para comprovação perante o INSS e/ou Poder Judiciário.</p>
        <p><br></p>
        <p style="text-align: justify;">Declaro estar ciente de que a falsidade da presente declaração pode implicar na sanção penal prevista no art. 299 do Código Penal (Falsidade Ideológica).</p>
        <p><br></p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p><br></p>
        <p><br></p>
        <p style="text-align: center;">___________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `,
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_uniao_estavel_v4',
        title: 'Declaração de União Estável (Para Pensão)',
        category: 'DECLARACAO',
        content: `
        <p style="text-align: center;"><strong><u>DECLARAÇÃO DE UNIÃO ESTÁVEL</u></strong></p>
        <p><br></p>
        <p style="text-align: justify;">Eu, <strong>{NOME_CLIENTE}</strong>, {ESTADO_CIVIL}, CPF n° {CPF}, residente e domiciliado(a) em {ENDERECO_COMPLETO},</p>
        <p><br></p>
        <p style="text-align: justify;"><strong>DECLARO</strong>, sob as penas da lei, para fins de prova junto ao Instituto Nacional do Seguro Social (INSS), que mantive convivência pública, contínua e duradoura, estabelecida com objetivo de constituição de família (UNIÃO ESTÁVEL), com o Sr(a). <strong>___________________________________ (Instituidor)</strong>, falecido(a) em ___/___/___.</p>
        <p><br></p>
        <p style="text-align: justify;">Declaro que convivemos sob o mesmo teto, como se casados fossemos, desde o ano de _______ até a data do óbito, e que não havia impedimentos legais para o casamento.</p>
        <p><br></p>
        <p style="text-align: justify;">Por ser verdade, firmo a presente.</p>
        <p><br></p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p><br></p>
        <p><br></p>
        <p style="text-align: center;">___________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `,
        lastModified: new Date().toISOString()
    },
    {
        id: 'tpl_renuncia_jef_v4',
        title: 'Termo de Renúncia (Juizado Especial Federal)',
        category: 'REQUERIMENTO',
        content: `
        <p style="text-align: center;"><strong><u>TERMO DE RENÚNCIA AOS VALORES EXCEDENTES</u></strong></p>
        <p style="text-align: center;"><strong>(JUIZADO ESPECIAL FEDERAL)</strong></p>
        <p><br></p>
        <p style="text-align: justify;"><strong>AUTOR(A):</strong> {NOME_CLIENTE}, CPF {CPF}.</p>
        <p><br></p>
        <p style="text-align: justify;">Pelo presente termo, o(a) Autor(a) declara, para fins de ajuizamento de ação perante o Juizado Especial Federal (JEF), que <strong>RENUNCIA</strong> expressamente aos valores da causa que eventualmente excederem o limite de 60 (sessenta) salários mínimos na data do ajuizamento da ação, conforme disposto no art. 3º da Lei nº 10.259/2001.</p>
        <p><br></p>
        <p style="text-align: justify;">Declara estar ciente de que, ao optar pelo rito do JEF, abre mão do recebimento de qualquer valor que ultrapasse este teto, exceto as parcelas que se vencerem no curso do processo.</p>
        <p><br></p>
        <p style="text-align: center;">{CIDADE}, {DATA_ATUAL}.</p>
        <p><br></p>
        <p><br></p>
        <p style="text-align: center;">___________________________________________</p>
        <p style="text-align: center;"><strong>{NOME_CLIENTE}</strong></p>
        `,
        lastModified: new Date().toISOString()
    }
];
    