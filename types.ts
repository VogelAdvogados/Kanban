
import { LucideIcon } from 'lucide-react';

export type ViewType = 'ADMIN' | 'AUX_DOENCA' | 'RECURSO_ADM' | 'JUDICIAL' | 'MESA_DECISAO' | 'ARCHIVED';

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type TransitionType = 'PROTOCOL_INSS' | 'PROTOCOL_APPEAL' | 'DEADLINE' | 'CONCLUSION_NB' | 'PENDENCY' | 'APPEAL_RETURN' | 'ADMIN_RETURN';

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'STAGNATED' | 'COBWEB';

export type StickyNoteColor = 'YELLOW' | 'RED' | 'BLUE' | 'GREEN';

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    caseId: string;
}

export interface AppErrorLog {
    id: string;
    message: string;
    stack?: string;
    componentStack?: string; 
    userId?: string;
    userName?: string;
    actionContext?: string; 
    timestamp: string;
    deviceInfo?: string;
    resolved: boolean;
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
}

export type UserPermission = 
    | 'MANAGE_SETTINGS' 
    | 'MANAGE_USERS'    
    | 'VIEW_LOGS'       
    | 'DELETE_CASE'     
    | 'EDIT_CASE'       
    | 'VIEW_FINANCIAL'  
    | 'EXPORT_DATA';    

export type AppointmentType = 'MEETING' | 'VIDEO_CALL' | 'PHONE_CALL' | 'VISIT';

export interface Appointment {
    id: string;
    caseId: string;
    clientName: string;
    lawyerId: string;
    date: string; // ISO String (Data + Hora)
    type: AppointmentType;
    notes?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
}

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

export interface AppTheme {
    id: string;
    label: string;
    bgClass: string; // Background do corpo da página
    previewColor: string; // Cor da bolinha no seletor
    headerTop: string; // Classe de Background do Header
    headerBottom: string; // Classe de Background da barra inferior do header
    headerText: string; // Classe de cor do texto (ex: text-white ou text-slate-800)
    searchBg: string; // Classe de fundo da barra de busca para garantir contraste
    menuHover: string; // Classe de hover dos itens de menu
}

export interface INSSAgency {
    id: string;
    name: string; 
    address: string; 
}

export interface SystemSettings {
    sla_internal_analysis: number; 
    sla_client_contact: number;    
    sla_stagnation: number;        
    sla_spider_web: number;        
    sla_mandado_seguranca: number; 
    pp_alert_days: number;         
    show_probabilities: boolean;   
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

export interface AutoTagRule {
    type: 'BENEFIT_TYPE' | 'AGE_GREATER' | 'COLUMN_CONTAINS';
    value: string | number;
}

export interface SystemTag {
  id: string;
  label: string;
  colorBg: string;
  colorText: string;
  rules?: AutoTagRule[]; 
}

export interface TransitionRule {
    from: string;
    to: string;
    type: TransitionType;
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
    url?: string;
    category?: string;
    caseContext?: Case; // Used in aggregations
}

export interface MandadoSeguranca {
    id: string;
    npu: string;
    filingDate: string;
    status: 'AGUARDANDO' | 'LIMINAR_DEFERIDA' | 'LIMINAR_INDEFERIDA' | 'SENTENCA';
    reason: 'DEMORA_ANALISE' | 'DEMORA_RECURSO' | 'OUTROS';
    notes?: string;
}

export interface CaseHistoryItem {
    id: string;
    date: string;
    user: string;
    action: string;
    details?: string;
    caseContext?: Case; // Used in aggregations
}

export interface Case {
    id: string;
    internalId: string;
    clientName: string;
    cpf: string;
    view: ViewType;
    columnId: string;
    responsibleId: string;
    responsibleName: string;
    createdAt: string;
    lastUpdate: string;
    urgency: UrgencyLevel;
    
    // Identity
    phone?: string;
    email?: string;
    birthDate?: string;
    sex?: 'MALE' | 'FEMALE';
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
    govPassword?: string;
    referral?: string;

    // Specific Fields
    benefitType?: string;
    protocolNumber?: string;
    protocolDate?: string;
    benefitNumber?: string;
    benefitDate?: string;
    
    // Appeal
    appealProtocolNumber?: string; 
    appealProtocolDate?: string; 
    appealOrdinarioProtocol?: string;
    appealOrdinarioDate?: string;
    appealOrdinarioStatus?: 'AGUARDANDO' | 'PROVIDO' | 'IMPROVIDO' | 'EXIGENCIA';
    appealEspecialProtocol?: string;
    appealEspecialDate?: string;
    appealEspecialStatus?: 'AGUARDANDO' | 'PROVIDO' | 'IMPROVIDO' | 'BAIXADO';
    appealDecisionDate?: string;
    appealOutcome?: 'PROVIDO' | 'IMPROVIDO' | 'PARCIAL';

    // Judicial
    periciaDate?: string;
    periciaTime?: string;
    periciaLocation?: string;
    mandadosSeguranca?: MandadoSeguranca[];

    // Deadlines
    deadlineStart?: string;
    deadlineEnd?: string;
    dcbDate?: string; 
    
    // Details
    exigencyDetails?: string;
    missingDocs?: string[];
    tags?: string[];
    history: CaseHistoryItem[];
    tasks?: Task[];
    files?: CaseFile[];
    stickyNotes?: StickyNote[];
    
    // Automation / Meta
    lastCheckedAt?: string; 
    lastContactDate?: string;
    confidenceRating?: number; 
    strategyType?: 'ATESTMED' | 'PRESENCIAL';
    isExtension?: boolean; 
    
    // Family / Rural
    deceasedName?: string;
    deceasedDate?: string;
    contributionTimeYears?: number;
    contributionTimeMonths?: number;
    ruralProofStart?: string;

    parentCaseId?: string; // For split/clone
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'LAWYER' | 'SECRETARY' | 'FINANCIAL';
    avatarInitials: string;
    color?: string;
    avatarIcon?: string;
    password?: string;
    lastLogin?: string;
    themePref?: string;
    vacation?: {
        start?: string;
        end?: string;
        backupUserId?: string;
    };
}

// ACTION ZONES CONFIGURATION
export interface ActionZoneConfig {
    id: string;
    targetView: ViewType;
    targetColumnId: string;
    label: string;
    subLabel: string;
    icon: any; // React Component
    colorClass: string;
    hoverClass: string;
    activeInViews: ViewType[] | 'ALL';
}

export interface ColumnDefinition {
    id: string;
    title: string;
    color: string;
    zoneConfig?: ActionZoneConfig; // Optional config if column is a zone
}

export interface SmartAction {
    id: string;
    label: string;
    targetColumnId?: string;
    urgency?: UrgencyLevel;
    tasksToAdd?: Task[];
    requireConfirmation?: boolean;
}

export interface WhatsAppTemplate {
    id: string;
    label: string;
    category: 'GERAL' | 'PERICIA' | 'DOCUMENTOS' | 'RESULTADO';
    text: string;
}

export interface DocumentTemplate {
    id: string;
    title: string;
    category: 'PROCURACAO' | 'CONTRATO' | 'DECLARACAO' | 'REQUERIMENTO' | 'OUTROS';
    content: string; // HTML Rich Text
    lastModified: string;
}

export interface WorkflowCondition {
    id: string;
    type: 'TAG_CONTAINS' | 'BENEFIT_TYPE' | 'URGENCY_IS' | 'FIELD_EMPTY' | 'FIELD_NOT_EMPTY';
    value: any;
}

export interface WorkflowAction {
    id: string;
    type: 'ADD_TASK' | 'ADD_TAG' | 'SET_URGENCY' | 'SEND_NOTIFICATION' | 'BLOCK_MOVE';
    payload: any;
}

export interface WorkflowRule {
    id: string;
    name: string;
    isActive: boolean;
    trigger: 'COLUMN_ENTER';
    targetColumnId: string;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
}

export interface Notification {
    id: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
    caseId?: string;
}

export interface SystemLog {
    id: string;
    date: string;
    user: string;
    action: string;
    details: string;
    category: 'CASE' | 'SYSTEM' | 'USER_MANAGEMENT' | 'TEMPLATE' | 'SECURITY' | 'WORKFLOW';
}

export type SearchIndex = Record<string, string[]>;
