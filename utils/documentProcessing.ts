
import { Case } from '../types';
import { formatDate } from '../utils';

export const safeGet = (val: string | undefined | null) => val ? val.trim() : null;

// Alterado para retornar um SPAN vazio com atributo de dados.
// O conteúdo visual (texto amarelo ou linha) será controlado via CSS no Modal/Impressão.
export const wrapData = (val: string | null, label: string) => {
    if (val) return val;
    return `<span class="var-missing" data-label="${label}"></span>`;
};

export const getSmartMaritalStatus = (c: Case) => {
    let status = safeGet(c.maritalStatus);
    if (!status) return null;
    const isFemale = c.sex === 'FEMALE';
    status = status.toLowerCase();
    if (status.includes('solteiro')) return isFemale ? 'solteira' : 'solteiro';
    if (status.includes('casado')) return isFemale ? 'casada' : 'casado';
    if (status.includes('divorciado')) return isFemale ? 'divorciada' : 'divorciado';
    if (status.includes('viúvo') || status.includes('viuvo')) return isFemale ? 'viúva' : 'viúvo';
    if (status.includes('separado')) return isFemale ? 'separada' : 'separado';
    return c.maritalStatus;
};

export const fillTemplate = (content: string, c: Case) => {
    const today = new Date();
    const isFemale = c.sex === 'FEMALE';
    
    const day = String(today.getDate()).padStart(2, '0');
    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const month = monthNames[today.getMonth()];
    const year = String(today.getFullYear());
    const longDate = `${day} de ${month} de ${year}`;

    let addressSmart = "";
    const street = safeGet(c.addressStreet);
    const num = safeGet(c.addressNumber) || "S/N";
    const neigh = safeGet(c.addressNeighborhood);
    const city = safeGet(c.addressCity);
    const state = safeGet(c.addressState);
    const zip = safeGet(c.addressZip);

    const parts = [];
    if (street) parts.push(`${street}`);
    if (street) parts.push(`nº ${num}`);
    if (neigh) parts.push(`Bairro ${neigh}`);
    if (zip) parts.push(`CEP ${zip}`);
    if (city && state) parts.push(`${city}/${state}`);
    else if (city) parts.push(city);
    
    addressSmart = parts.length > 0 ? parts.join(', ') : wrapData(null, 'ENDEREÇO');

    const replacements: Record<string, string> = {
        '{NOME_CLIENTE}': wrapData(safeGet(c.clientName), 'NOME'),
        '{CPF}': wrapData(safeGet(c.cpf), 'CPF'),
        '{RG}': wrapData(safeGet(c.rg), 'RG'),
        '{PIS}': wrapData(safeGet(c.pis), 'PIS'),
        '{TELEFONE}': wrapData(safeGet(c.phone), 'TELEFONE'),
        '{ESTADO_CIVIL}': wrapData(getSmartMaritalStatus(c), 'EST. CIVIL'),
        '{DATA_NASCIMENTO}': c.birthDate ? formatDate(c.birthDate) : wrapData(null, 'NASCIMENTO'),
        '{NOME_MAE}': wrapData(safeGet(c.motherName), 'MÃE'),
        '{NB}': wrapData(safeGet(c.benefitNumber), 'NB'),
        '{NPU}': wrapData(safeGet(c.mandadosSeguranca?.[0]?.npu), 'NPU'),
        '{ADVOGADO_RESPONSAVEL}': wrapData(safeGet(c.responsibleName), 'ADVOGADO'),
        '{SAUDACAO}': isFemale ? 'Sra.' : 'Sr.',
        '{ARTIGO}': isFemale ? 'a' : 'o',
        '{ARTIGO_CAP}': isFemale ? 'A' : 'O',
        '{AO_A}': isFemale ? 'à' : 'ao',
        '{PREZADO}': isFemale ? 'Prezada' : 'Prezado',
        '{DATA_ATUAL}': longDate,
        '{DIA}': day,
        '{MES}': month,
        '{ANO}': year,
        '{ENDERECO_COMPLETO}': addressSmart,
        '{RUA}': wrapData(street, 'RUA'),
        '{NUMERO}': wrapData(num, 'NÚMERO'),
        '{BAIRRO}': wrapData(neigh, 'BAIRRO'),
        '{CIDADE}': wrapData(city, 'CIDADE'),
        '{UF}': wrapData(state, 'UF'),
        '{CEP}': wrapData(zip, 'CEP'),
    };

    let processed = content;
    Object.entries(replacements).forEach(([key, value]) => {
        processed = processed.split(key).join(value);
    });

    return processed;
};
