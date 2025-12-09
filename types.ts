
import { LucideIcon } from 'lucide-react';

export type ViewType = 'ADMIN' | 'AUX_DOENCA' | 'RECURSO_ADM' | 'JUDICIAL' | 'MESA_DECISAO';

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type TransitionType = 'PROTOCOL_INSS' | 'PROTOCOL_APPEAL' | 'DEADLINE' | 'CONCLUSION_NB' | 'PENDENCY';

export interface ThemeConfig {
    bgGradient: string; // Background class for the main app
    primary: string; // Text color class (e.g. text-blue-600)
    secondary: string; // Lighter text/bg
    accent: string; // Border/Ring colors
    button: string; // Active button bg
    iconColor: string;
}

export interface OfficeData {
  name: string;
  cnpj?: string;
  oab?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string; // Base64 or URL
}

export interface TransitionRule {
  from: string;
  to: string;
  type: TransitionType;
}

export interface WhatsAppTemplate {
  id: string;
  label: string;
  text: string;
  category: 'GERAL' | 'PERICIA' | 'DOCUMENTOS' | 'RESULTADO';
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: 'PROCURACAO' | 'CONTRATO' | 'DECLARACAO' | 'REQUERIMENTO' | 'OUTROS';
  content: string; // HTML/Rich text or Markdown content with placeholders
  lastModified: string;
}

export interface SmartAction {
  label: string;
  targetView: ViewType;
  targetColumnId: string;
  urgency?: UrgencyLevel;
  icon?: any; // LucideIcon
  colorClass: string; // e.g., 'bg-blue-600 text-white'
  requireConfirmation?: boolean;
  tasksToAdd?: Task[]; // Tarefas a injetar automaticamente
}

export interface CaseHistory {
  id: string;
  date: string;
  user: string;
  action: string;
  details?: string;
}

// NEW: Global System Logs for Audit (User management, Template changes, etc.)
export interface SystemLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
  category: 'SYSTEM' | 'SECURITY' | 'TEMPLATE' | 'USER_MANAGEMENT';
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface CaseFile {
  id: string;
  name: string;
  type: string; // MIME type e.g. 'application/pdf'
  size: number; // bytes
  uploadDate: string;
}

export interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  caseId?: string; // Link to open the case
  recipientId?: string; // ID do usuário destino. Se undefined, é global.
}

export interface MandadoSeguranca {
  id: string;
  npu: string; // Número do Processo
  filingDate: string; // Data da Impetração
  reason: 'DEMORA_ANALISE' | 'DEMORA_RECURSO' | 'OUTROS';
  status: 'AGUARDANDO' | 'LIMINAR_DEFERIDA' | 'LIMINAR_INDEFERIDA' | 'SENTENCA';
  notes?: string;
}

export interface Case {
  id: string;
  internalId: string; // Ex: 2024.001 (Gerado na entrada)
  
  clientName: string;
  cpf: string;
  phone: string;
  birthDate?: string; // YYYY-MM-DD
  
  // Extended Client Info
  rg?: string;
  pis?: string;
  motherName?: string;
  fatherName?: string;
  maritalStatus?: string;
  addressZip?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;

  // Specific Benefit Type Code (e.g., 41, 87)
  benefitType?: string;

  // Access Credentials
  govPassword?: string;
  
  // Status tracking
  view: ViewType;
  columnId: string; // The current step in the specific view
  
  // Responsibility
  responsibleId: string;
  responsibleName: string; // Display name (e.g., "Dr. Silva")
  
  // Tasks / Checklist
  tasks?: Task[];

  // Files / Attachments
  files?: CaseFile[];

  // Missing Docs (Pendências)
  missingDocs?: string[];

  // Tags (Labels) - NEW
  tags?: string[];

  // Dates
  createdAt: string;
  lastUpdate: string; // Quando mudou de fase
  lastCheckedAt?: string; // Quando foi verificado pela última vez (sem mudar de fase)
  deadline?: string; // Generic deadline
  
  // --- IDENTIFIERS ACCUMULATION ---
  protocolNumber?: string; // Protocolo INSS
  protocolDate?: string; // YYYY-MM-DD
  
  benefitNumber?: string; // NB (Número do Benefício) - Gerado na Conclusão
  benefitDate?: string; // Data da Concessão/Decisão
  
  // --- RECURSO ADM ---
  appealProtocolNumber?: string; // Protocolo do Recurso
  appealProtocolDate?: string;
  appealDecisionDate?: string; // Data do Julgamento do Recurso
  appealOutcome?: 'PROVIDO' | 'IMPROVIDO' | 'PARCIAL' | 'ANULADO';

  // --- MANDADO DE SEGURANÇA (LISTA) ---
  mandadosSeguranca?: MandadoSeguranca[];

  // --- DEADLINES ---
  deadlineStart?: string; // YYYY-MM-DD (Inicio do Prazo)
  deadlineEnd?: string; // YYYY-MM-DD (Fim do Prazo)

  // Specific Auxílio-Doença Dates
  periciaDate?: string; // Data da Perícia Médica agendada
  dcbDate?: string; // Data da Cessação do Benefício (DCB)
  
  // Flags
  urgency: UrgencyLevel;
  isExtension?: boolean; // Se é um pedido de prorrogação
  
  // History
  history: CaseHistory[];
}

export interface ColumnDefinition {
  id: string;
  title: string;
  color: string; // Tailwind border color class
}

export interface User {
  id: string;
  name: string;
  avatarInitials: string;
  role: 'ADMIN' | 'LAWYER' | 'SECRETARY' | 'FINANCIAL';
  color?: string; // Hex color for avatar identity
}
