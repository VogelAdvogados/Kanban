
import { Case, ViewType, HealthStatus, SystemSettings } from './types';

// --- BENEFIT CLASSIFICATION HELPERS ---

export const getBenefitGroup = (code: string | undefined): 'INCAPACITY' | 'PENSION' | 'RETIREMENT_AGE' | 'RETIREMENT_TIME' | 'SPECIAL' | 'LOAS' | 'UNKNOWN' => {
    if (!code) return 'UNKNOWN';
    const c = code.toString();
    
    // Incapacidade (Aux Doença, Apos Invalidez)
    if (['31', '32', '91', '92'].includes(c)) return 'INCAPACITY';
    
    // LOAS (Deficiente entra em incapacidade para fins de perícia, mas separaremos por lógica)
    if (['87'].includes(c)) return 'INCAPACITY'; // LOAS Deficiente (tem perícia)
    if (['88'].includes(c)) return 'LOAS'; // LOAS Idoso (foco em renda)

    // Pensão
    if (['21', '93'].includes(c)) return 'PENSION';
    if (['25'].includes(c)) return 'PENSION'; // Auxílio Reclusão (lógica similar a pensão - dependentes)

    // Idade / Híbrida / Rural
    if (['41', '07', '08', '48'].includes(c)) return 'RETIREMENT_AGE';

    // Tempo de Contribuição
    if (['42', '96'].includes(c)) return 'RETIREMENT_TIME';

    // Especial
    if (['46'].includes(c)) return 'SPECIAL';

    return 'UNKNOWN';
};

// --- DATE HELPERS ---

export const getLocalDateISOString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalYMD = (dateStr: string | undefined): Date | null => {
    if(!dateStr || typeof dateStr !== 'string') return null;
    try {
        const cleanDate = dateStr.split('T')[0];
        const parts = cleanDate.split('-'); 
        if (parts.length < 3) return null;
        
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; 
        const day = parseInt(parts[2], 10);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

        return new Date(year, month, day);
    } catch(e) {
        console.warn('Falha ao analisar data', dateStr);
        return null;
    }
};

export const getDaysDiff = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  const target = parseLocalYMD(dateString);
  if (!target) return null;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysSince = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  const start = new Date(dateString); 
  if (isNaN(start.getTime())) return null; 

  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getAge = (birthDate: string | undefined): number | null => {
  if (!birthDate) return null;
  const birth = parseLocalYMD(birthDate);
  if (!birth) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  if (dateString.length === 10) {
      const d = parseLocalYMD(dateString);
      return d ? d.toLocaleDateString('pt-BR') : '';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
};

export const getAutomaticUpdatesForColumn = (targetColId: string): Partial<Case> => {
  const updates: Partial<Case> = {};
  if (targetColId.includes('indeferido')) {
    const today = new Date();
    const next30 = new Date();
    next30.setDate(today.getDate() + 30);
    
    updates.deadlineStart = today.toISOString().slice(0, 10);
    updates.deadlineEnd = next30.toISOString().slice(0, 10);
  }
  return updates;
};

// --- PREDICTIVE & 360 INTELLIGENCE ---

export interface CaseHealthAnalysis {
    status: HealthStatus;
    score: number; // 0 to 100 (100 is best)
    daysStagnant: number;
    reason: string;
    contactStatus: 'OK' | 'WARNING' | 'CRITICAL';
    daysSinceContact: number;
}

export const analyzeCaseHealth = (c: Case, settings: SystemSettings): CaseHealthAnalysis => {
    const daysStagnant = getDaysSince(c.lastUpdate) || 0;
    const daysSinceContact = getDaysSince(c.lastContactDate || c.createdAt) || 0;
    const daysSinceCheck = getDaysSince(c.lastCheckedAt) || 0;

    let status: HealthStatus = 'HEALTHY';
    let reason = 'Movimentação recente';
    let score = 100;

    // 1. SLA Logic based on Settings
    const isWaitingClient = c.columnId.includes('docs') || c.columnId.includes('pendencia');
    const isInternalAnalysis = c.columnId.includes('montagem') || c.columnId.includes('triagem') || c.columnId.includes('producao');
    const isExternalWait = c.columnId.includes('protocolo') || c.columnId.includes('aguardando');

    const SLA_INTERNAL = settings.sla_internal_analysis;
    const SLA_STAGNATION = settings.sla_stagnation;
    const SLA_CONTACT = settings.sla_client_contact;
    const SLA_SPIDER = settings.sla_spider_web || 45; 

    if (isInternalAnalysis) {
        if (daysStagnant > SLA_INTERNAL * 1.5) { status = 'CRITICAL'; reason = 'Produção interna atrasada'; score = 20; }
        else if (daysStagnant > SLA_INTERNAL) { status = 'WARNING'; reason = 'Atenção na produção'; score = 60; }
    } else if (isWaitingClient) {
        if (daysStagnant > 20) { status = 'STAGNATED'; reason = 'Cliente não responde'; score = 40; }
        else if (daysStagnant > 10) { status = 'WARNING'; reason = 'Cobrar cliente'; score = 70; }
    } else if (isExternalWait) {
        if (daysStagnant > SLA_STAGNATION) { status = 'WARNING'; reason = 'Demora excessiva do Órgão (MS?)'; score = 50; }
    }

    if (c.deadlineEnd) {
        const daysLeft = getDaysDiff(c.deadlineEnd);
        if (daysLeft !== null && daysLeft < 0) { status = 'CRITICAL'; reason = 'Prazo vencido!'; score = 0; }
        else if (daysLeft !== null && daysLeft <= 3) { status = 'CRITICAL'; reason = 'Prazo fatal iminente'; score = 10; }
    }

    let contactStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (daysSinceContact > (SLA_CONTACT * 2)) contactStatus = 'CRITICAL';
    else if (daysSinceContact > SLA_CONTACT) contactStatus = 'WARNING';

    if (isExternalWait && daysSinceCheck > SLA_SPIDER) {
        status = 'COBWEB';
        reason = `Processo abandonado (Teia de Aranha): ${daysSinceCheck} dias sem consulta.`;
        score = 15;
    }

    if (contactStatus === 'CRITICAL') score -= 30;
    if (contactStatus === 'WARNING') score -= 10;

    return {
        status,
        score: Math.max(0, score),
        daysStagnant,
        reason,
        contactStatus,
        daysSinceContact
    };
};

export const getSuccessProbability = (c: Case): number => {
    if (c.confidenceRating !== undefined && c.confidenceRating !== null) {
        const ratingMap = [5, 20, 40, 60, 80, 100];
        return ratingMap[c.confidenceRating];
    }

    let prob = 50; 

    // Benefit Logic Heuristics
    const group = getBenefitGroup(c.benefitType);
    if (group === 'INCAPACITY') prob += 15; 
    if (group === 'RETIREMENT_AGE') {
        const age = getAge(c.birthDate);
        if (age && ((c.tags?.includes('Rural') && age >= 55) || age >= 65)) prob += 25;
    }

    if (c.files && c.files.length > 5) prob += 10;
    if (c.missingDocs && c.missingDocs.length > 0) prob -= 15;

    if (c.tags?.includes('Prioridade')) prob += 5;
    if (c.columnId.includes('exigencia')) prob -= 10;

    return Math.min(95, Math.max(5, prob));
};

export const getPredictiveInsights = (cases: Case[], currentCase: Case) => {
    const completedCases = cases.filter(c => 
        c.view === currentCase.view && 
        (c.columnId.includes('concluido') || c.columnId.includes('ativo') || c.columnId.includes('resultado') || c.columnId.includes('arquivado') || c.columnId.includes('transito')) &&
        c.id !== currentCase.id
    );

    const minSample = 2;
    let avgDuration = 45; 
    let confidence: 'Baixa' | 'Média' | 'Alta' = 'Baixa';

    if (completedCases.length >= minSample) {
        let totalDays = 0;
        let validSamples = 0;
        completedCases.forEach(c => {
            const start = new Date(c.createdAt).getTime();
            const end = new Date(c.lastUpdate).getTime();
            if (!isNaN(start) && !isNaN(end) && end > start) {
                totalDays += (end - start) / (1000 * 60 * 60 * 24);
                validSamples++;
            }
        });
        
        if (validSamples > 0) {
            avgDuration = Math.round(totalDays / validSamples);
            confidence = validSamples > 5 ? 'Alta' : 'Média';
        }
    }

    const createdAtTime = new Date(currentCase.createdAt).getTime();
    const currentDuration = !isNaN(createdAtTime) ? Math.floor((Date.now() - createdAtTime) / (1000 * 60 * 60 * 24)) : 0;
    
    const remainingDays = Math.max(1, avgDuration - currentDuration);
    
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + remainingDays);

    const successProbability = getSuccessProbability(currentCase);

    return {
        avgDuration, 
        currentDuration, 
        remainingDays, 
        predictedDate: predictedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
        confidence, 
        sampleSize: completedCases.length,
        successProbability
    };
};

export const generateDiffLog = (original: Case, updated: Case): string => {
    const changes: string[] = [];

    const trackableFields: (keyof Case)[] = [
        'clientName', 'cpf', 'phone', 'benefitType', 'protocolNumber', 
        'benefitNumber', 'govPassword', 'urgency', 'deadlineEnd', 'periciaDate',
        'motherName', 'fatherName', 'rg', 'pis', 'addressCity', 'maritalStatus', 'addressStreet', 'confidenceRating',
        'periciaLocation', 'periciaTime', 'strategyType',
        'deceasedName', 'deceasedDate', 'contributionTimeYears', 'ruralProofStart'
    ];

    const labels: Record<string, string> = {
        clientName: 'Nome',
        cpf: 'CPF',
        phone: 'Telefone',
        benefitType: 'Benefício',
        protocolNumber: 'Protocolo',
        benefitNumber: 'NB',
        govPassword: 'Senha Gov',
        urgency: 'Prioridade',
        deadlineEnd: 'Prazo Fatal',
        periciaDate: 'Data Perícia',
        motherName: 'Nome Mãe',
        fatherName: 'Nome Pai',
        rg: 'RG',
        pis: 'PIS',
        addressCity: 'Cidade',
        maritalStatus: 'Est. Civil',
        addressStreet: 'Rua',
        confidenceRating: 'Feeling (0-5)',
        periciaLocation: 'Local Perícia',
        periciaTime: 'Hora Perícia',
        strategyType: 'Estratégia',
        deceasedName: 'Nome Instituidor',
        deceasedDate: 'Data Óbito',
        contributionTimeYears: 'Tempo Contrib. (Anos)',
        ruralProofStart: 'Início Prova Rural'
    };

    trackableFields.forEach(field => {
        const oldVal = original[field];
        const newVal = updated[field];

        if (oldVal !== newVal) {
            if ((oldVal === undefined || oldVal === null) && (newVal === undefined || newVal === null)) return;
            
            let displayOld = oldVal !== undefined && oldVal !== null ? String(oldVal) : '(vazio)';
            let displayNew = newVal !== undefined && newVal !== null ? String(newVal) : '(vazio)';

            if (field.includes('Date') || field.includes('deadline') || field === 'ruralProofStart') {
                displayOld = formatDate(oldVal as string) || '(vazio)';
                displayNew = formatDate(newVal as string) || '(vazio)';
            }

            changes.push(`${labels[field] || field}: ${displayOld} ➝ ${displayNew}`);
        }
    });

    const oldFiles = original.files || [];
    const newFiles = updated.files || [];
    
    newFiles.forEach(nf => {
        if (!oldFiles.find(of => of.id === nf.id)) changes.push(`[+] Anexo: ${nf.name}`);
    });
    oldFiles.forEach(of => {
        if (!newFiles.find(nf => nf.id === of.id)) changes.push(`[-] Anexo removido: ${of.name}`);
    });

    const oldTags = original.tags || [];
    const newTags = updated.tags || [];
    newTags.filter(t => !oldTags.includes(t)).forEach(t => changes.push(`[+] Tag: ${t}`));
    oldTags.filter(t => !newTags.includes(t)).forEach(t => changes.push(`[-] Tag removida: ${t}`));

    const oldTasks = original.tasks || [];
    const newTasks = updated.tasks || [];

    newTasks.forEach(nt => {
        if (!oldTasks.find(ot => ot.id === nt.id)) changes.push(`[+] Tarefa: "${nt.text}"`);
    });
    oldTasks.forEach(ot => {
        if (!newTasks.find(nt => nt.id === ot.id)) changes.push(`[-] Tarefa ex: "${ot.text}"`);
    });
    newTasks.forEach(nt => {
        const oldTask = oldTasks.find(ot => ot.id === nt.id);
        if (oldTask && oldTask.completed !== nt.completed) {
            const status = nt.completed ? 'Feito' : 'Pendente';
            changes.push(`[ok] Tarefa "${nt.text}": ${status}`);
        }
    });

    const oldDocs = original.missingDocs || [];
    const newDocs = updated.missingDocs || [];
    newDocs.filter(d => !oldDocs.includes(d)).forEach(d => changes.push(`[!] Pendência: ${d}`));
    oldDocs.filter(d => !newDocs.includes(d)).forEach(d => changes.push(`[v] Resolvido: ${d}`));

    if (changes.length === 0) return ""; 
    return changes.join(' | ');
};

export const formatCPF = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
};

export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length > 10) return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  else return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
};

export const formatBenefitNumber = (value: string) => {
  return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{1})\d+?$/, '$1');
};

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf == '') return false;
  if (cpf.length != 11 || cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" || cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" || cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" || cpf == "99999999999") return false;
  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) rev = 0;
  if (rev != parseInt(cpf.charAt(9))) return false;
  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) rev = 0;
  if (rev != parseInt(cpf.charAt(10))) return false;
  return true;
};

export const exportToCSV = (cases: Case[]) => {
  const headers = ["Nome Cliente", "CPF", "Telefone", "Beneficio", "Visao", "Fase Atual", "Responsavel", "Ultima Atualizacao"];
  const escapeCsv = (val: string | undefined) => {
      if (!val) return "";
      const stringVal = String(val);
      if (stringVal.includes(",") || stringVal.includes("\n") || stringVal.includes('"')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
  };
  const rows = cases.map(c => [
    escapeCsv(c.clientName), escapeCsv(c.cpf), escapeCsv(c.phone), escapeCsv(c.benefitType),
    escapeCsv(c.view), escapeCsv(c.columnId), escapeCsv(c.responsibleName), escapeCsv(formatDate(c.lastUpdate))
  ].join(","));
  const BOM = "\uFEFF"; 
  const csvContent = BOM + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `rambo_prev_backup_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
