
import { Case, User, INSSAgency, SystemTag } from '../types';

export const USERS: User[] = [
    { id: 'u1', name: 'Dr. Maurícius Vogel', email: 'mauricius@vogel.adv.br', role: 'ADMIN', avatarInitials: 'MV', color: '#3b82f6' },
    { id: 'u2', name: 'Dra. Ana Paula', email: 'ana@vogel.adv.br', role: 'LAWYER', avatarInitials: 'AP', color: '#ec4899' },
    { id: 'u3', name: 'Secretaria', email: 'secretaria@vogel.adv.br', role: 'SECRETARY', avatarInitials: 'SC', color: '#10b981' },
    { id: 'u4', name: 'Financeiro', email: 'financeiro@vogel.adv.br', role: 'FINANCIAL', avatarInitials: 'FN', color: '#f59e0b' }
];

export const BENEFIT_OPTIONS = [
    { code: '31', label: '31 - Auxílio Doença Previdenciário' },
    { code: '91', label: '91 - Auxílio Doença Acidentário' },
    { code: '32', label: '32 - Aposentadoria por Invalidez' },
    { code: '41', label: '41 - Aposentadoria por Idade' },
    { code: '42', label: '42 - Aposentadoria por Tempo de Contribuição' },
    { code: '21', label: '21 - Pensão por Morte' },
    { code: '87', label: '87 - LOAS (Deficiente)' },
    { code: '88', label: '88 - LOAS (Idoso)' },
    { code: '46', label: '46 - Aposentadoria Especial' },
    { code: '25', label: '25 - Auxílio Reclusão' },
    { code: '07', label: '07 - Aposentadoria Idade Rural' },
    { code: '08', label: '08 - Aposentadoria Idade Empresário' },
    { code: '48', label: '48 - Aposentadoria Híbrida' },
    { code: '96', label: '96 - Pensão Especial Hanseníase' },
];

export const DEFAULT_INSS_AGENCIES: INSSAgency[] = [
    { id: 'aps_1', name: 'APS Cruz Alta', address: 'Rua Voluntários da Pátria, 100' },
    { id: 'aps_2', name: 'APS Ijuí', address: 'Rua do Comércio, 500' },
    { id: 'aps_3', name: 'APS Santa Maria', address: 'Rua Venâncio Aires, 200' },
    { id: 'aps_4', name: 'APS Panambi', address: 'Rua 7 de Setembro, 300' }
];

export const JUDICIAL_COURTS: INSSAgency[] = [
    { id: 'trf4_ca', name: '1ª Vara Federal de Cruz Alta', address: 'Rua General Câmara, 450' },
    { id: 'trf4_ij', name: '1ª Vara Federal de Ijuí', address: 'Rua 13 de Maio, 200' },
    { id: 'tjrs_ca', name: 'Comarca de Cruz Alta (Estadual)', address: 'Av. Presidente Vargas, 1000' }
];

export const COMMON_DOCUMENTS = [
    'RG / CNH',
    'CPF',
    'Comprovante de Residência',
    'Carteira de Trabalho (CTPS)',
    'CNIS (Extrato Previdenciário)',
    'Laudos Médicos',
    'Receitas Médicas',
    'PPP (Perfil Profissiográfico)',
    'LTCAT',
    'Certidão de Casamento/Nascimento',
    'Declaração Sindicato Rural',
    'Contratos de Arrendamento',
    'Notas Fiscais de Produtor'
];

export const DEFAULT_SYSTEM_TAGS: SystemTag[] = [
    { id: 'tag_1', label: 'Prioridade', colorBg: 'bg-red-100', colorText: 'text-red-700' },
    { id: 'tag_2', label: 'Rural', colorBg: 'bg-amber-100', colorText: 'text-amber-800' },
    { id: 'tag_3', label: 'Acidente Trabalho', colorBg: 'bg-orange-100', colorText: 'text-orange-700' },
    { id: 'tag_4', label: 'Falta Docs', colorBg: 'bg-yellow-100', colorText: 'text-yellow-800' },
    { id: 'tag_5', label: 'Complexo', colorBg: 'bg-purple-100', colorText: 'text-purple-700' },
    { id: 'tag_6', label: 'Revisão', colorBg: 'bg-blue-100', colorText: 'text-blue-700' },
    { id: 'tag_7', label: 'CONCEDIDO', colorBg: 'bg-emerald-100', colorText: 'text-emerald-700' },
    { id: 'tag_8', label: 'INDEFERIDO', colorBg: 'bg-red-100', colorText: 'text-red-700' }
];

export const SYSTEM_TAGS = DEFAULT_SYSTEM_TAGS;

export const INITIAL_CASES: Case[] = [
    // --- ADMIN VIEW ---
    {
        id: 'c1', internalId: '2023.001', clientName: 'João da Silva', cpf: '123.456.789-00', phone: '(55) 99999-1234',
        view: 'ADMIN', columnId: 'adm_triagem', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel', sex: 'MALE',
        urgency: 'NORMAL', createdAt: '2023-10-01T10:00:00Z', lastUpdate: '2023-10-15T10:00:00Z', history: [],
        tasks: [{ id: 't1', text: 'Coletar CNIS atualizado', completed: false }], benefitType: '41'
    },
    {
        id: 'c2', internalId: '2023.005', clientName: 'Maria Oliveira', cpf: '222.333.444-55', phone: '(55) 98888-7777',
        view: 'ADMIN', columnId: 'adm_docs', responsibleId: 'u2', responsibleName: 'Dra. Ana Paula', sex: 'FEMALE',
        urgency: 'HIGH', createdAt: '2023-09-20T10:00:00Z', lastUpdate: '2023-10-10T10:00:00Z', history: [],
        missingDocs: ['RG / CNH', 'Comprovante de Residência'], tags: ['Prioridade', 'Falta Docs'], benefitType: '21'
    },
    {
        id: 'c3', internalId: '2023.012', clientName: 'Carlos Pereira', cpf: '333.444.555-66', phone: '(55) 97777-6666',
        view: 'ADMIN', columnId: 'adm_exigencia', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'CRITICAL', createdAt: '2023-08-15T10:00:00Z', lastUpdate: '2023-10-14T10:00:00Z', history: [],
        deadlineStart: '2023-10-10T10:00:00Z', deadlineEnd: '2023-10-17T10:00:00Z', 
        exigencyDetails: 'Apresentar PPP original da empresa Metalúrgica Ltda.', protocolNumber: '123456789', protocolDate: '2023-08-15T10:00:00Z',
        benefitType: '46'
    },
    {
        id: 'c4', internalId: '2023.020', clientName: 'Ana Souza', cpf: '444.555.666-77', phone: '(55) 96666-5555',
        view: 'ADMIN', columnId: 'adm_pagamento', responsibleId: 'u4', responsibleName: 'Financeiro',
        urgency: 'HIGH', createdAt: '2023-06-01T10:00:00Z', lastUpdate: '2023-10-12T10:00:00Z', history: [],
        benefitNumber: '987.654.321-0', benefitDate: '2023-09-15T10:00:00Z', tags: ['CONCEDIDO', 'A RECEBER'], benefitType: '42'
    },
    {
        id: 'c5', internalId: '2023.030', clientName: 'Roberto Lima', cpf: '555.666.777-88', phone: '(55) 95555-4444',
        view: 'AUX_DOENCA', columnId: 'aux_chegada', responsibleId: 'u3', responsibleName: 'Secretaria',
        urgency: 'NORMAL', createdAt: '2023-10-14T10:00:00Z', lastUpdate: '2023-10-14T10:00:00Z', history: [],
        benefitType: '31', tags: ['Acidente Trabalho']
    },
    {
        id: 'c6', internalId: '2023.035', clientName: 'Fernanda Costa', cpf: '666.777.888-99', phone: '(55) 94444-3333',
        view: 'AUX_DOENCA', columnId: 'aux_pericia', responsibleId: 'u2', responsibleName: 'Dra. Ana Paula',
        urgency: 'HIGH', createdAt: '2023-09-25T10:00:00Z', lastUpdate: '2023-10-05T10:00:00Z', history: [],
        benefitType: '31', periciaDate: '2023-10-16T17:30:00.000Z', 
        periciaTime: '14:30', periciaLocation: 'Agência INSS - CRUZ ALTA', protocolNumber: '998877665'
    },
    {
        id: 'c7', internalId: '2023.040', clientName: 'Paulo Santos', cpf: '777.888.999-00', phone: '(55) 93333-2222',
        view: 'AUX_DOENCA', columnId: 'aux_ativo', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'NORMAL', createdAt: '2023-04-01T10:00:00Z', lastUpdate: '2023-05-01T10:00:00Z', history: [],
        benefitType: '31', benefitNumber: '112.233.445-5', dcbDate: '2023-10-25T10:00:00Z', 
        tags: ['CONCEDIDO']
    },
    {
        id: 'c8', internalId: '2023.045', clientName: 'Juliana Martins', cpf: '888.999.000-11', phone: '(55) 92222-1111',
        view: 'AUX_DOENCA', columnId: 'aux_indeferido', responsibleId: 'u2', responsibleName: 'Dra. Ana Paula',
        urgency: 'HIGH', createdAt: '2023-08-01T10:00:00Z', lastUpdate: '2023-10-13T10:00:00Z', history: [],
        benefitType: '31', tags: ['INDEFERIDO'], protocolNumber: '556677889'
    },
    {
        id: 'c9', internalId: '2023.050', clientName: 'Marcos Rocha', cpf: '999.000.111-22', phone: '(55) 91111-0000',
        view: 'RECURSO_ADM', columnId: 'rec_triagem', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'NORMAL', createdAt: '2023-09-01T10:00:00Z', lastUpdate: '2023-10-10T10:00:00Z', history: [],
        benefitType: '42', tags: ['INDEFERIDO'], tasks: [{id: 't_rec1', text: 'Analisar motivo indeferimento', completed: false}]
    },
    {
        id: 'c10', internalId: '2023.055', clientName: 'Sofia Alves', cpf: '000.111.222-33', phone: '(55) 90000-9999',
        view: 'RECURSO_ADM', columnId: 'rec_junta', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'NORMAL', createdAt: '2023-07-01T10:00:00Z', lastUpdate: '2023-09-15T10:00:00Z', history: [],
        benefitType: '88', appealOrdinarioProtocol: '4455667788', appealOrdinarioDate: '2023-08-15T10:00:00Z',
        appealOrdinarioStatus: 'AGUARDANDO'
    },
    {
        id: 'c11', internalId: '2023.060', clientName: 'Lucas Mendes', cpf: '111.222.333-44', phone: '(55) 98888-1111',
        view: 'JUDICIAL', columnId: 'jud_triagem', responsibleId: 'u2', responsibleName: 'Dra. Ana Paula',
        urgency: 'NORMAL', createdAt: '2023-06-15T10:00:00Z', lastUpdate: '2023-10-10T10:00:00Z', history: [],
        benefitType: '91', tags: ['Acidente Trabalho'], 
        mandadosSeguranca: [{id: 'ms1', npu: '5001234-55.2023.4.04.7100', filingDate: '2023-10-05T10:00:00Z', status: 'AGUARDANDO', reason: 'DEMORA_ANALISE'}]
    },
    {
        id: 'c12', internalId: '2023.065', clientName: 'Beatriz Lima', cpf: '222.333.444-55', phone: '(55) 97777-2222',
        view: 'JUDICIAL', columnId: 'jud_pericia', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'HIGH', createdAt: '2023-05-01T10:00:00Z', lastUpdate: '2023-09-25T10:00:00Z', history: [],
        benefitType: '32', periciaDate: '2023-10-30T13:00:00.000Z',
        periciaTime: '10:00', periciaLocation: '1ª Vara Federal de Cruz Alta',
        tags: ['Rural', 'Perícia Judicial']
    },
    {
        id: 'c13', internalId: '2023.070', clientName: 'Ricardo Gomes', cpf: '333.444.555-66', phone: '(55) 96666-3333',
        view: 'MESA_DECISAO', columnId: 'mesa_aguardando', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'HIGH', createdAt: '2023-08-15T10:00:00Z', lastUpdate: '2023-10-13T10:00:00Z', history: [],
        benefitType: '48', tags: ['Complexo', 'Rural'], 
        referral: 'Dr. Carlos (Parceiro)'
    },
    {
        id: 'c14', internalId: '2022.099', clientName: 'Antônio Silva', cpf: '444.555.666-77', phone: '(55) 91234-5678', 
        view: 'ARCHIVED', columnId: 'arq_geral', responsibleId: 'u1', responsibleName: 'Dr. Maurícius Vogel',
        urgency: 'NORMAL', createdAt: '2022-09-01T10:00:00Z', lastUpdate: '2023-07-01T10:00:00Z', history: [],
        benefitType: '41', tags: ['CONCEDIDO', 'Arquivado'], benefitNumber: '123.456.789-0'
    },
    {
        id: 'c15', internalId: '2023.002', clientName: 'Caso Estagnado Teste', cpf: '999.888.777-66', phone: '(55) 98765-4321', 
        view: 'ADMIN', columnId: 'adm_protocolo', responsibleId: 'u2', responsibleName: 'Dra. Ana Paula',
        urgency: 'NORMAL', createdAt: '2023-06-15T10:00:00Z', lastUpdate: '2023-07-10T10:00:00Z', lastCheckedAt: '2023-08-25T10:00:00Z', history: [],
        benefitType: '87', protocolNumber: '111222333', protocolDate: '2023-06-15T10:00:00Z'
    }
];
