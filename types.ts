
import { LucideIcon } from 'lucide-react';

export type ViewType = 'ADMIN' | 'AUX_DOENCA' | 'RECURSO_ADM' | 'JUDICIAL' | 'MESA_DECISAO' | 'ARCHIVED';

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type TransitionType = 'PROTOCOL_INSS' | 'PROTOCOL_APPEAL' | 'DEADLINE' | 'CONCLUSION_NB' | 'PENDENCY' | 'APPEAL_RETURN';

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'STAGNATED' | 'COBWEB';

export type StickyNoteColor = 'YELLOW' | 'RED' | 'BLUE' | 'GREEN';

export interface StickyNote {
  id: string;
  text: string;
  color: StickyNoteColor;
  authorId: string;
  authorName: string;
  targetId: string | 'SELF' | null; // null = Everyone
  createdAt: string;
}

export interface ThemeConfig {
    bgGradient: string; 
    primary: string; 
    secondary: string; 
    accent: string; 
    button: string; 
    iconColor: string;
}

// NEW: INSS Agency Model
export interface INSSAgency {
    id: string;
    name: string; // Ex: Agência INSS - CRUZ ALTA
    address: string; // Ex: Rua Voluntários da Pátria, 123, Centro
}

// NEW: Global Settings for SLAs and Automation
export interface SystemSettings {
    sla_internal_analysis: number; // Max days for internal tasks (Triagem, Montagem)
    sla_client_contact: number;    // Max days without talking to client
    sla_stagnation: number;        // Days before a case is considered "Stagnated" in external phases
    sla_spider_web: number;        // NEW: Days without manual log/check to show spider web
    pp_alert_days: number;         // NEW: Days before DCB to alert for Extension (PP)
    show_probabilities: boolean;   // Toggle AI Probability Badge
}

export interface OfficeData {
  name: string;
  cnpj?: string;
  oab?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string; 
}

// NEW: Smart Tag Rules
export interface AutoTagRule {
    type: 'BENEFIT_TYPE' | 'AGE_GREATER' | 'COLUMN_CONTAINS';
    value: string | number;
}

export interface SystemTag {
  id: string;
  label: string;
  colorBg: string;
  colorText: string;
  rules?: AutoTagRule[]; // Automation Rules
}

export interface TransitionRule {
  from: string;
  to: string;
  type: TransitionType;
}

// --- WORKFLOW ENGINE TYPES ---
export type WorkflowTrigger = 'COLUMN_ENTER';

export type WorkflowConditionType = 'TAG_CONTAINS' | 'BENEFIT_TYPE' | 'FIELD_EMPTY' | 'FIELD_NOT_EMPTY' | 'URGENCY_IS';

export type WorkflowActionType = 'ADD_TASK' | 'SET_RESPONSIBLE' | 'BLOCK_MOVE' | 'SET_URGENCY' | 'ADD_TAG' | 'SEND_NOTIFICATION';

export interface WorkflowCondition {
    id: string;
    type: WorkflowConditionType;
    value?: string; // e.g. Tag Name, Benefit Code, or Field Name
}

export interface WorkflowAction {
    id: string;
    type: WorkflowActionType;
    payload?: any; // Task text, User ID, or Error Message for Block
}

export interface WorkflowRule {
    id: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    targetColumnId: string; // The column that triggers the rule
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
}
// -----------------------------

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
  content: string; 
  lastModified: string;
}

export interface SmartAction {
  label: string;
  targetView: ViewType;
  targetColumnId: string;
  urgency?: UrgencyLevel;
  icon?: any; 
  colorClass: string; 
  requireConfirmation?: boolean;
  tasksToAdd?: Task[]; 
  url?: string; // New: Support for direct links
}

export interface CaseHistory {
  id: string;
  date: string;
  user: string;
  action: string;
  details?: string;
  isContact?: boolean; // New: Marks if this history item was a contact with client
}

export interface SystemLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
  category: 'SYSTEM' | 'SECURITY' | 'TEMPLATE' | 'USER_MANAGEMENT' | 'WORKFLOW';
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface CaseFile {
  id: string;
  name: string;
  type: string; 
  size: number; 
  uploadDate: string;
  category?: string; // TIPO DE DOCUMENTO (RG, CPF, PROCURAÇÃO...)
  url?: string; // Para download real
}

export interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  caseId?: string; 
  recipientId?: string; 
}

export interface MandadoSeguranca {
  id: string;
  npu: string; 
  filingDate: string; 
  reason: 'DEMORA_ANALISE' | 'DEMORA_RECURSO' | 'OUTROS';
  status: 'AGUARDANDO' | 'LIMINAR_DEFERIDA' | 'LIMINAR_INDEFERIDA' | 'SENTENCA';
  notes?: string;
}

export interface Case {
  id: string;
  internalId: string; 
  
  clientName: string;
  cpf: string;
  phone: string;
  birthDate?: string; 
  
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

  benefitType?: string;

  govPassword?: string;
  
  view: ViewType;
  columnId: string; 
  
  responsibleId: string;
  responsibleName: string; 
  
  tasks?: Task[];

  files?: CaseFile[];

  missingDocs?: string[];

  tags?: string[];
  
  stickyNotes?: StickyNote[];

  createdAt: string;
  lastUpdate: string; 
  lastCheckedAt?: string; 
  lastContactDate?: string; 
  deadline?: string; 
  
  protocolNumber?: string; 
  protocolDate?: string; 
  
  exigencyDetails?: string; // NOVO: O que o INSS pediu na exigência?

  benefitNumber?: string; 
  benefitDate?: string; 
  
  // Legacy / Generic Appeal Fields
  appealProtocolNumber?: string; 
  appealProtocolDate?: string;
  appealDecisionDate?: string; 
  appealOutcome?: 'PROVIDO' | 'IMPROVIDO' | 'PARCIAL' | 'ANULADO';

  // Specific 1st Instance (Junta)
  appealOrdinarioProtocol?: string;
  appealOrdinarioDate?: string;
  appealOrdinarioStatus?: 'AGUARDANDO' | 'PROVIDO' | 'IMPROVIDO' | 'EXIGENCIA';

  // Specific 2nd Instance (Câmara/CAJ)
  appealEspecialProtocol?: string;
  appealEspecialDate?: string;
  appealEspecialStatus?: 'AGUARDANDO' | 'PROVIDO' | 'IMPROVIDO' | 'BAIXADO';

  mandadosSeguranca?: MandadoSeguranca[];

  deadlineStart?: string; 
  deadlineEnd?: string; 

  // Module Auxilio-Doença (Incapacidade)
  periciaDate?: string;
  periciaTime?: string; // NEW
  periciaLocation?: string; // NEW
  strategyType?: 'ATESTMED' | 'PRESENCIAL'; // NEW
  
  // Module Pensão (Death)
  deceasedName?: string; // Nome do Instituidor
  deceasedDate?: string; // Data do Óbito
  
  // Module Tempo/Rural
  contributionTimeYears?: number; // Tempo apurado (Anos)
  contributionTimeMonths?: number; // Tempo apurado (Meses)
  ruralProofStart?: string; // Data início prova rural

  dcbDate?: string; 
  
  referral?: string; // Indicação

  urgency: UrgencyLevel;
  isExtension?: boolean;
  
  // NEW: Manual Confidence Rating (0-5)
  confidenceRating?: number;
  
  history: CaseHistory[];
}

export interface ColumnDefinition {
  id: string;
  title: string;
  color: string; 
}

export interface User {
  id: string;
  name: string;
  avatarInitials: string;
  role: 'ADMIN' | 'LAWYER' | 'SECRETARY' | 'FINANCIAL';
  color?: string; 
}
