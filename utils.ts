
import { Case, ViewType, HealthStatus, SystemSettings, SearchIndex, User, INSSAgency } from './types';
import { DEFAULT_INSS_AGENCIES, JUDICIAL_COURTS } from './constants';

// ============================================================================
// HELPER: LOCATION RESOLVER (NEW)
// ============================================================================
export const getLocationAddress = (locationName: string | undefined): string => {
    if (!locationName) return 'Local não definido';

    // 1. Try Judicial Courts
    const court = JUDICIAL_COURTS.find(c => c.name === locationName);
    if (court) return `${court.name} - Endereço: ${court.address}`;

    // 2. Try INSS Agencies
    const agency = DEFAULT_INSS_AGENCIES.find(a => a.name === locationName);
    if (agency) return `${agency.name} - Endereço: ${agency.address}`;

    // 3. Fallback to raw text
    return locationName;
};

// ============================================================================
// ALGORITHM 1: INVERTED INDEX SEARCH ENGINE (Existing)
// ============================================================================
const normalizeToken = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "");
};

export const buildSearchIndex = (cases: Case[]): SearchIndex => {
    const index: SearchIndex = {};
    cases.forEach(c => {
        const content = [
            c.clientName, c.cpf, c.internalId, c.benefitNumber, c.protocolNumber, ...(c.tags || [])
        ].join(' ');
        const tokens = normalizeToken(content).split(/\s+/);
        const uniqueTokens = new Set(tokens);
        uniqueTokens.forEach(token => {
            if (!token) return;
            if (!index[token]) index[token] = [];
            index[token].push(c.id);
        });
    });
    return index;
};

export const searchCasesByIndex = (query: string, index: SearchIndex, allCases: Case[]): Case[] => {
    if (!query.trim()) return allCases;
    const queryTokens = normalizeToken(query).split(/\s+/).filter(t => t);
    if (queryTokens.length === 0) return allCases;
    let resultIds = new Set(index[queryTokens[0]] || []);
    for (let i = 1; i < queryTokens.length; i++) {
        const tokenMatches = new Set(index[queryTokens[i]] || []);
        resultIds = new Set([...resultIds].filter(id => tokenMatches.has(id)));
        if (resultIds.size === 0) break;
    }
    return allCases.filter(c => resultIds.has(c.id));
};

// ============================================================================
// ALGORITHM 2: WEIGHTED HEALTH DECAY SCORE (Existing)
// ============================================================================
export interface CaseHealthAnalysis {
    status: HealthStatus;
    score: number; 
    daysStagnant: number;
    reason: string;
    contactStatus: 'OK' | 'WARNING' | 'CRITICAL';
    daysSinceContact: number;
}

export const analyzeCaseHealth = (c: Case, settings: SystemSettings, historicalAverage?: number): CaseHealthAnalysis => {
    const daysStagnant = getDaysSince(c.lastUpdate) || 0;
    const daysSinceContact = getDaysSince(c.lastContactDate || c.createdAt) || 0;
    const daysSinceCheck = getDaysSince(c.lastCheckedAt) || 0;

    let score = 100;
    let reasons: string[] = [];

    const isInternalPhase = c.columnId.includes('montagem') || c.columnId.includes('triagem') || c.columnId.includes('producao');
    const isWaitingClient = c.columnId.includes('docs') || c.columnId.includes('pendencia');
    const isExternalWait = !isInternalPhase && !isWaitingClient;

    const slaLimit = isInternalPhase ? settings.sla_internal_analysis : settings.sla_stagnation;
    
    if (daysStagnant > slaLimit) {
        const excessDays = daysStagnant - slaLimit;
        const decayRate = isInternalPhase ? 5 : 1; 
        const penalty = Math.min(40, excessDays * decayRate);
        score -= penalty;
        if (penalty > 0) reasons.push(isInternalPhase ? "Atraso interno" : "Estagnado");
    }

    if (c.deadlineEnd) {
        const daysLeft = getDaysDiff(c.deadlineEnd);
        if (daysLeft !== null) {
            if (daysLeft < 0) { score = 0; reasons.push("PRAZO VENCIDO"); }
            else if (daysLeft <= 3) { score -= 50; reasons.push("Prazo iminente"); }
            else if (daysLeft <= 7) { score -= 20; reasons.push("Prazo curto"); }
        }
    }

    const contactLimit = settings.sla_client_contact;
    if (daysSinceContact > contactLimit) {
        const penalty = daysSinceContact > (contactLimit * 2) ? 30 : 10;
        score -= penalty;
        reasons.push("Sem contato");
    }

    const auditLimit = settings.sla_spider_web || 45;
    if (isExternalWait && daysSinceCheck > auditLimit) {
        score -= 15;
        reasons.push("Sem monitoramento");
    }

    score = Math.max(0, Math.min(100, score));
    let status: HealthStatus = 'HEALTHY';
    if (score === 0) status = 'CRITICAL';
    else if (score < 40) status = 'CRITICAL';
    else if (score < 70) status = 'WARNING';
    
    if (isExternalWait && daysSinceCheck > auditLimit) status = 'COBWEB';
    if (isWaitingClient && daysStagnant > 20) status = 'STAGNATED';

    let contactStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (daysSinceContact > (contactLimit * 2)) contactStatus = 'CRITICAL';
    else if (daysSinceContact > contactLimit) contactStatus = 'WARNING';

    return { status, score, daysStagnant, reason: reasons.join('. ') || 'Em dia', contactStatus, daysSinceContact };
};

// ============================================================================
// ALGORITHM 3: PREDICTIVE DATE ESTIMATION (Existing)
// ============================================================================
export const getPredictiveInsights = (cases: Case[], currentCase: Case) => {
    const completedCases = cases.filter(c => 
        c.view === currentCase.view && 
        (c.columnId.includes('concluido') || c.columnId.includes('ativo') || c.columnId.includes('resultado') || c.columnId.includes('arquivado')) &&
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
            if (validSamples > 20) confidence = 'Alta';
            else if (validSamples > 5) confidence = 'Média';
        }
    }

    const createdAtTime = new Date(currentCase.createdAt).getTime();
    const currentDuration = !isNaN(createdAtTime) ? Math.floor((Date.now() - createdAtTime) / (1000 * 60 * 60 * 24)) : 0;
    let remainingDays = Math.max(1, avgDuration - currentDuration);
    if (currentDuration > avgDuration) remainingDays = Math.round(avgDuration * 0.1) || 5; 
    
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + remainingDays);

    return {
        avgDuration, currentDuration, remainingDays, 
        predictedDate: predictedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
        confidence, sampleSize: completedCases.length,
        successProbability: getSuccessProbability(currentCase)
    };
};

// ============================================================================
// ALGORITHM 4: SMART LOAD BALANCER (NEW)
// ============================================================================
/**
 * Suggests the best user to handle a task based on current workload weight.
 * Critical cases weight 3x, High 2x, Normal 1x.
 */
export const recommendResponsible = (users: User[], allCases: Case[]): string => {
    if (users.length === 0) return '';
    
    // Calculate load score per user
    const loadMap: Record<string, number> = {};
    users.forEach(u => loadMap[u.id] = 0);

    const urgencyWeights = { 'CRITICAL': 3, 'HIGH': 2, 'NORMAL': 1 };

    allCases.forEach(c => {
        // Only count active cases
        if (c.columnId.includes('arquiva') || c.columnId.includes('concluido')) return;
        
        if (loadMap[c.responsibleId] !== undefined) {
            loadMap[c.responsibleId] += urgencyWeights[c.urgency];
        }
    });

    // Find user with min load
    let minLoad = Infinity;
    let recommendedId = users[0].id;

    Object.entries(loadMap).forEach(([userId, load]) => {
        if (load < minLoad) {
            minLoad = load;
            recommendedId = userId;
        }
    });

    return recommendedId;
};

// ============================================================================
// ALGORITHM 5: AGENCY INTELLIGENCE (NEW)
// ============================================================================
export interface AgencyStats {
    total: number;
    conceded: number;
    denied: number;
    winRate: number;
    avgTime: number;
}

/**
 * Analyzes historical data for a specific Agency (Location) to determine win rates.
 */
export const getAgencyStats = (agencyName: string, allCases: Case[]): AgencyStats => {
    // Normalize agency name for fuzzy match
    const target = normalizeToken(agencyName);
    
    const relevantCases = allCases.filter(c => 
        c.periciaLocation && 
        normalizeToken(c.periciaLocation).includes(target) &&
        (c.tags?.includes('CONCEDIDO') || c.tags?.includes('INDEFERIDO'))
    );

    const total = relevantCases.length;
    if (total === 0) return { total: 0, conceded: 0, denied: 0, winRate: 0, avgTime: 0 };

    const conceded = relevantCases.filter(c => c.tags?.includes('CONCEDIDO')).length;
    const denied = total - conceded;
    const winRate = Math.round((conceded / total) * 100);

    // Calculate avg time for decision
    let totalDays = 0;
    relevantCases.forEach(c => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.lastUpdate).getTime();
        if (!isNaN(start) && !isNaN(end)) {
            totalDays += (end - start) / (1000 * 60 * 60 * 24);
        }
    });
    const avgTime = Math.round(totalDays / total);

    return { total, conceded, denied, winRate, avgTime };
};

// --- HELPERS (Keep existing) ---

export const extractDataFromText = (text: string): Partial<Case> => {
    const extracted: Partial<Case> = {};
    const cpfMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
    if (cpfMatch) extracted.cpf = formatCPF(cpfMatch[0]);
    const birthKeywords = /(?:nascimento|nasc\.|data de nasc)/i;
    if (birthKeywords.test(text)) {
        const dateMatch = text.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
        if (dateMatch) extracted.birthDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) extracted.email = emailMatch[0]; 
    const rgMatch = text.match(/\b(\d{1,2})\.?(\d{3})\.?(\d{3})-?(\d{1}|X|x)\b/);
    if (rgMatch) extracted.rg = rgMatch[0];
    const pisMatch = text.match(/\b\d{3}\.?\d{5}\.?\d{2}-?\d{1}\b/);
    if (pisMatch && !cpfMatch) extracted.pis = pisMatch[0];
    const cepMatch = text.match(/\b\d{5}-?\d{3}\b/);
    if (cepMatch) extracted.addressZip = cepMatch[0];
    const nbMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{1}\b/);
    if (nbMatch) extracted.benefitNumber = formatBenefitNumber(nbMatch[0]);
    return extracted;
};

export const compressImage = async (file: File, quality = 0.6, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const calculateDynamicSLA = (allCases: Case[], columnId: string): number | null => {
    const completedCases = allCases.filter(c => c.columnId.includes('concluido') || c.columnId.includes('arquivado'));
    if (completedCases.length < 3) return null; 
    let totalDays = 0;
    completedCases.forEach(c => {
        const days = getDaysSince(c.createdAt) || 0;
        totalDays += days;
    });
    return Math.round(totalDays / completedCases.length);
};

export const getBenefitGroup = (code: string | undefined) => {
    if (!code) return 'UNKNOWN';
    const c = code.toString();
    if (['31', '32', '91', '92'].includes(c)) return 'INCAPACITY';
    if (['87'].includes(c)) return 'INCAPACITY'; 
    if (['88'].includes(c)) return 'LOAS'; 
    if (['21', '93'].includes(c)) return 'PENSION';
    if (['25'].includes(c)) return 'PENSION'; 
    if (['41', '07', '08', '48'].includes(c)) return 'RETIREMENT_AGE';
    if (['42', '96'].includes(c)) return 'RETIREMENT_TIME';
    if (['46'].includes(c)) return 'SPECIAL';
    return 'UNKNOWN';
};

export const getLocalDateISOString = () => {
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
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } catch(e) { return null; }
};

export const getDaysDiff = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  const target = parseLocalYMD(dateString);
  if (!target) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDaysSince = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  const start = new Date(dateString); 
  if (isNaN(start.getTime())) return null; 
  const today = new Date();
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const getAge = (birthDate: string | undefined): number | null => {
  if (!birthDate) return null;
  const birth = parseLocalYMD(birthDate);
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

export const getSuccessProbability = (c: Case): number => {
    if (c.confidenceRating !== undefined && c.confidenceRating !== null) {
        return [5, 20, 40, 60, 80, 100][c.confidenceRating];
    }
    let prob = 50; 
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

export const generateDiffLog = (original: Case, updated: Case): string => {
    const changes: string[] = [];
    const trackableFields: (keyof Case)[] = ['clientName', 'cpf', 'phone', 'benefitType', 'protocolNumber', 'benefitNumber', 'govPassword', 'urgency', 'deadlineEnd', 'periciaDate', 'periciaLocation'];
    trackableFields.forEach(field => {
        if (original[field] !== updated[field]) {
            if ((!original[field] && !updated[field])) return;
            changes.push(`${field}: ${original[field]} ➝ ${updated[field]}`);
        }
    });
    if (changes.length === 0) return ""; 
    return changes.join(' | ');
};

export const formatCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
export const formatPhoneNumber = (v: string) => {
  const n = v.replace(/\D/g, '');
  return n.length > 10 ? n.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3') : n.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
};
export const formatBenefitNumber = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{1})\d+?$/, '$1');
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf == '' || cpf.length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let add = 0; for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11); if (rev >= 10) rev = 0; if (rev != parseInt(cpf.charAt(9))) return false;
  add = 0; for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11); if (rev >= 10) rev = 0; if (rev != parseInt(cpf.charAt(10))) return false;
  return true;
};

export const exportToCSV = (cases: Case[]) => {
  const headers = ["Nome", "CPF", "Beneficio", "Status", "Responsavel", "Atualizado"];
  const rows = cases.map(c => [c.clientName, c.cpf, c.benefitType, c.columnId, c.responsibleName, c.lastUpdate].map(s => `"${s||''}"`).join(","));
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })));
  link.setAttribute("download", `rambo_prev_backup.csv`);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

export const formatDate = (d: string | undefined): string => {
  if (!d) return '';
  const date = parseLocalYMD(d) || new Date(d); 
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
};

export const getAutomaticUpdatesForColumn = (columnId: string): Partial<Case> => {
    return columnId.includes('concluido') ? { urgency: 'NORMAL' } : {};
};
