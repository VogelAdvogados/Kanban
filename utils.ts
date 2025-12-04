import { Case } from './types';

// --- DATE HELPERS ---

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

// --- CPF VALIDATION & FORMATTING ---

export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos de novo (para o segundo bloco de números)
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede entrar mais de 11 dígitos
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