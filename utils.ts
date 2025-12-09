

import { Case, ViewType } from './types';

// --- DATE HELPERS ---

// Returns the current date in YYYY-MM-DD format based on LOCAL system time, not UTC.
// Fixes the bug where actions taken in the evening (GMT-3) were recorded as the next day.
export const getLocalDateISOString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse YYYY-MM-DD string as local date (prevents timezone shifts)
export const parseLocalYMD = (dateStr: string | undefined): Date | null => {
    if(!dateStr) return null;
    // Handle ISO strings with time or simple dates
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-'); 
    if (parts.length < 3) return null;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
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
  const start = new Date(dateString); // Last update usually has time, so standard new Date is ok
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
  // Try to parse as local date first if it matches YYYY-MM-DD pattern length
  if (dateString.length === 10) {
      const d = parseLocalYMD(dateString);
      return d ? d.toLocaleDateString('pt-BR') : '';
  }
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getAutomaticUpdatesForColumn = (targetColId: string): Partial<Case> => {
  const updates: Partial<Case> = {};
  
  // Regra: Se for Indeferido, define prazo de 30 dias para recurso automaticamente
  if (targetColId.includes('indeferido')) {
    const today = new Date();
    const next30 = new Date();
    next30.setDate(today.getDate() + 30);
    
    updates.deadlineStart = today.toISOString().slice(0, 10);
    updates.deadlineEnd = next30.toISOString().slice(0, 10);
  }

  return updates;
};

// --- PREDICTIVE INTELLIGENCE ---

export const getPredictiveInsights = (cases: Case[], currentCase: Case) => {
    // 1. Filter completed cases of the same View Type to build a baseline
    // We consider "Completed" cases those in specific columns or archived
    const completedCases = cases.filter(c => 
        c.view === currentCase.view && 
        (c.columnId.includes('concluido') || c.columnId.includes('ativo') || c.columnId.includes('resultado') || c.columnId.includes('arquivado') || c.columnId.includes('transito')) &&
        c.id !== currentCase.id
    );

    const minSample = 2; // Reduced for demo purposes
    
    // Default values if no data
    let avgDuration = 45; // Default assumption days
    let confidence: 'Baixa' | 'Média' | 'Alta' = 'Baixa';

    if (completedCases.length >= minSample) {
        let totalDays = 0;
        completedCases.forEach(c => {
            const start = new Date(c.createdAt).getTime();
            const end = new Date(c.lastUpdate).getTime();
            totalDays += (end - start) / (1000 * 60 * 60 * 24);
        });
        avgDuration = Math.round(totalDays / completedCases.length);
        confidence = completedCases.length > 5 ? 'Alta' : 'Média';
    }

    const currentDuration = getDaysSince(currentCase.createdAt) || 0;
    const remainingDays = Math.max(5, avgDuration - currentDuration);
    
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + remainingDays);

    // Calculate "Risk"
    // If current phase time > avg phase time, risk is high
    const timeInCurrentPhase = getDaysSince(currentCase.lastUpdate) || 0;
    const riskLevel = timeInCurrentPhase > 30 ? 'HIGH' : timeInCurrentPhase > 15 ? 'MEDIUM' : 'LOW';

    // Mock Success Probability based on benefit type (just for demo intelligence)
    // In a real app, this would check win rate per benefit type
    const successProbability = currentCase.benefitType === '31' ? 85 : currentCase.benefitType === '88' ? 60 : 75;

    return {
        avgDuration, 
        currentDuration, 
        remainingDays, 
        predictedDate: predictedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
        confidence, 
        sampleSize: completedCases.length,
        riskLevel,
        successProbability
    };
};

// --- AUDIT & DIFF LOGIC ---

export const generateDiffLog = (original: Case, updated: Case): string => {
    const changes: string[] = [];

    // 1. SCALAR FIELDS (Text/Date/Selects)
    const trackableFields: (keyof Case)[] = [
        'clientName', 'cpf', 'phone', 'benefitType', 'protocolNumber', 
        'benefitNumber', 'govPassword', 'urgency', 'deadlineEnd', 'periciaDate',
        'motherName', 'fatherName', 'rg', 'pis', 'addressCity', 'maritalStatus', 'addressStreet'
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
        addressStreet: 'Rua'
    };

    trackableFields.forEach(field => {
        const oldVal = original[field];
        const newVal = updated[field];

        // Simple comparison (handling undefined/null)
        if (oldVal !== newVal) {
            // Ignore empty to empty/undefined transitions
            if ((!oldVal && !newVal)) return;
            
            let displayOld = oldVal ? String(oldVal) : '(vazio)';
            let displayNew = newVal ? String(newVal) : '(vazio)';

            // Format dates for readability
            if (field.includes('Date') || field.includes('deadline')) {
                displayOld = formatDate(oldVal as string) || '(vazio)';
                displayNew = formatDate(newVal as string) || '(vazio)';
            }

            changes.push(`${labels[field] || field}: ${displayOld} ➝ ${displayNew}`);
        }
    });

    // 2. ARRAY FIELDS: FILES
    const oldFiles = original.files || [];
    const newFiles = updated.files || [];
    
    // Added Files
    newFiles.forEach(nf => {
        if (!oldFiles.find(of => of.id === nf.id)) {
            changes.push(`[+] Anexo: ${nf.name}`);
        }
    });
    // Removed Files
    oldFiles.forEach(of => {
        if (!newFiles.find(nf => nf.id === of.id)) {
            changes.push(`[-] Anexo removido: ${of.name}`);
        }
    });

    // 3. ARRAY FIELDS: TAGS
    const oldTags = original.tags || [];
    const newTags = updated.tags || [];
    const addedTags = newTags.filter(t => !oldTags.includes(t));
    const removedTags = oldTags.filter(t => !newTags.includes(t));

    addedTags.forEach(t => changes.push(`[+] Tag: ${t}`));
    removedTags.forEach(t => changes.push(`[-] Tag removida: ${t}`));

    // 4. ARRAY FIELDS: TASKS
    const oldTasks = original.tasks || [];
    const newTasks = updated.tasks || [];

    // Added Tasks
    newTasks.forEach(nt => {
        if (!oldTasks.find(ot => ot.id === nt.id)) {
            changes.push(`[+] Tarefa criada: "${nt.text}"`);
        }
    });
    // Removed Tasks
    oldTasks.forEach(ot => {
        if (!newTasks.find(nt => nt.id === ot.id)) {
            changes.push(`[-] Tarefa excluída: "${ot.text}"`);
        }
    });
    // Changed Status
    newTasks.forEach(nt => {
        const oldTask = oldTasks.find(ot => ot.id === nt.id);
        if (oldTask && oldTask.completed !== nt.completed) {
            const status = nt.completed ? 'CONCLUÍDA' : 'PENDENTE';
            changes.push(`[ok] Tarefa "${nt.text}" marcada como ${status}`);
        }
    });

    // 5. ARRAY FIELDS: MISSING DOCS (Pendências)
    const oldDocs = original.missingDocs || [];
    const newDocs = updated.missingDocs || [];
    newDocs.filter(d => !oldDocs.includes(d)).forEach(d => changes.push(`[!] Nova Pendência: ${d}`));
    oldDocs.filter(d => !newDocs.includes(d)).forEach(d => changes.push(`[v] Pendência Resolvida: ${d}`));

    if (changes.length === 0) return "Edição de detalhes.";
    return changes.join(' | ');
};

// --- CPF, PHONE & BENEFIT FORMATTING ---

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede entrar mais de 11 dígitos
};

export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length > 10) {
      // (11) 91234-5678 (Mobile)
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
  } else {
      // (11) 1234-5678 (Landline - initial typing)
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
  }
};

export const formatBenefitNumber = (value: string) => {
  // Pattern: 000.000.000-0
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{1})\d+?$/, '$1');
};

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  
  if (cpf == '') return false;
  
  // Elimina CPFs invalidos conhecidos
  if (cpf.length != 11 || 
      cpf == "00000000000" || 
      cpf == "11111111111" || 
      cpf == "22222222222" || 
      cpf == "33333333333" || 
      cpf == "44444444444" || 
      cpf == "55555555555" || 
      cpf == "66666666666" || 
      cpf == "77777777777" || 
      cpf == "88888888888" || 
      cpf == "99999999999")
          return false;
          
  // Valida 1o digito
  let add = 0;
  for (let i = 0; i < 9; i++) 
      add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) 
      rev = 0;
  if (rev != parseInt(cpf.charAt(9))) 
      return false;
      
  // Valida 2o digito
  add = 0;
  for (let i = 0; i < 10; i++) 
      add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) 
      rev = 0;
  if (rev != parseInt(cpf.charAt(10))) 
      return false;
      
  return true;
};

// --- EXPORT HELPER (BLOB OPTIMIZED) ---

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
    escapeCsv(c.clientName),
    escapeCsv(c.cpf),
    escapeCsv(c.phone),
    escapeCsv(c.benefitType),
    escapeCsv(c.view),
    escapeCsv(c.columnId),
    escapeCsv(c.responsibleName),
    escapeCsv(formatDate(c.lastUpdate))
  ].join(","));

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF"; 
  const csvContent = BOM + [headers.join(","), ...rows].join("\n");
  
  // Create a Blob to handle large datasets
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `rambo_prev_backup_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up memory
};