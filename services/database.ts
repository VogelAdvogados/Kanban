
import { Case, User, DocumentTemplate, SystemLog, SystemTag, Notification, OfficeData, SystemSettings, INSSAgency, WhatsAppTemplate, WorkflowRule } from '../types';
import { INITIAL_CASES, DEFAULT_DOCUMENT_TEMPLATES, USERS as DEFAULT_USERS, DEFAULT_SYSTEM_TAGS, COMMON_DOCUMENTS, DEFAULT_INSS_AGENCIES, WHATSAPP_TEMPLATES as DEFAULT_WA_TEMPLATES, DEFAULT_WORKFLOW_RULES } from '../constants';

// Keys for LocalStorage (acting as DB tables)
const KEYS = {
  CASES: 'rambo_prev_cases_v1',
  USERS: 'rambo_prev_users_v1',
  TEMPLATES: 'rambo_prev_templates_v1',
  LOGS: 'rambo_prev_system_logs_v1',
  TAGS: 'rambo_prev_tags_v1',
  NOTIFICATIONS: 'rambo_prev_notifications_v1',
  OFFICE: 'rambo_prev_office_data',
  SETTINGS: 'rambo_prev_settings',
  COMMON_DOCS: 'rambo_prev_common_docs',
  AGENCIES: 'rambo_prev_agencies',
  WA_TEMPLATES: 'rambo_prev_wa_templates',
  WORKFLOW_RULES: 'rambo_prev_workflow_rules' // NEW KEY
};

// Simulate Network Latency (0-50ms for local, higher to test spinners)
const LATENCY = 150;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  
  // --- GENERIC HELPERS ---
  private get<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.error(`Error reading ${key} from DB`, e);
      return defaultVal;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to DB`, e);
      throw new Error("Falha ao salvar dados. Armazenamento cheio ou bloqueado.");
    }
  }

  // --- CASES ---
  async getCases(): Promise<Case[]> {
    await delay(LATENCY);
    return this.get<Case[]>(KEYS.CASES, INITIAL_CASES);
  }

  async saveCase(newCase: Case): Promise<Case> {
    // CRITICAL FIX: Read and Write MUST be synchronous (Atomic in JS Event Loop) to prevent race conditions.
    // We delay AFTER the operation to simulate network, not before.
    const cases = this.get<Case[]>(KEYS.CASES, []);
    const exists = cases.find(c => c.id === newCase.id);
    
    let updatedCases;
    if (exists) {
      updatedCases = cases.map(c => c.id === newCase.id ? newCase : c);
    } else {
      updatedCases = [newCase, ...cases];
    }
    
    this.set(KEYS.CASES, updatedCases);
    
    // Simulate latency after data is safely committed
    await delay(LATENCY);
    return newCase;
  }

  async updateCasesBulk(cases: Case[]): Promise<void> {
      // Atomic write
      this.set(KEYS.CASES, cases);
      await delay(LATENCY);
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    await delay(LATENCY);
    return this.get<User[]>(KEYS.USERS, DEFAULT_USERS);
  }

  async saveUsers(users: User[]): Promise<void> {
    this.set(KEYS.USERS, users);
    await delay(LATENCY);
  }

  // --- TEMPLATES ---
  async getTemplates(): Promise<DocumentTemplate[]> {
    await delay(LATENCY);
    return this.get<DocumentTemplate[]>(KEYS.TEMPLATES, DEFAULT_DOCUMENT_TEMPLATES);
  }

  async saveTemplates(templates: DocumentTemplate[]): Promise<void> {
    this.set(KEYS.TEMPLATES, templates);
    await delay(LATENCY);
  }

  // --- LOGS ---
  async getLogs(): Promise<SystemLog[]> {
    await delay(LATENCY);
    return this.get<SystemLog[]>(KEYS.LOGS, []);
  }

  async addLog(log: SystemLog): Promise<void> {
    // No artificial delay for logs to keep UI snappy, but atomic read/write is preserved
    const logs = this.get<SystemLog[]>(KEYS.LOGS, []);
    const updatedLogs = [log, ...logs].slice(0, 500); // Limit log size
    this.set(KEYS.LOGS, updatedLogs);
  }

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<Notification[]> {
    return this.get<Notification[]>(KEYS.NOTIFICATIONS, []);
  }

  async saveNotifications(notifs: Notification[]): Promise<void> {
    this.set(KEYS.NOTIFICATIONS, notifs);
  }

  // --- SETTINGS & TAGS ---
  async getSystemSettings(): Promise<SystemSettings> {
    await delay(LATENCY);
    const defaults: SystemSettings = {
        sla_internal_analysis: 7,
        sla_client_contact: 30,
        sla_stagnation: 45,
        sla_spider_web: 45, // Default for Spider Web
        pp_alert_days: 15, // Default for Extension Alert
        show_probabilities: true
    };
    return this.get<SystemSettings>(KEYS.SETTINGS, defaults);
  }

  async saveSystemSettings(settings: SystemSettings): Promise<void> {
    this.set(KEYS.SETTINGS, settings);
    await delay(LATENCY);
  }

  async getTags(): Promise<SystemTag[]> {
    await delay(LATENCY);
    return this.get<SystemTag[]>(KEYS.TAGS, DEFAULT_SYSTEM_TAGS);
  }

  async saveTags(tags: SystemTag[]): Promise<void> {
    this.set(KEYS.TAGS, tags);
    await delay(LATENCY);
  }

  // --- WORKFLOW RULES (NEW) ---
  async getWorkflowRules(): Promise<WorkflowRule[]> {
      await delay(LATENCY);
      return this.get<WorkflowRule[]>(KEYS.WORKFLOW_RULES, DEFAULT_WORKFLOW_RULES);
  }

  async saveWorkflowRules(rules: WorkflowRule[]): Promise<void> {
      this.set(KEYS.WORKFLOW_RULES, rules);
      await delay(LATENCY);
  }

  // --- COMMON DOCS (CHECKLIST) ---
  async getCommonDocs(): Promise<string[]> {
      await delay(LATENCY);
      return this.get<string[]>(KEYS.COMMON_DOCS, COMMON_DOCUMENTS);
  }

  async saveCommonDocs(docs: string[]): Promise<void> {
      this.set(KEYS.COMMON_DOCS, docs);
      await delay(LATENCY);
  }

  // --- INSS AGENCIES ---
  async getAgencies(): Promise<INSSAgency[]> {
      await delay(LATENCY);
      return this.get<INSSAgency[]>(KEYS.AGENCIES, DEFAULT_INSS_AGENCIES);
  }

  async saveAgencies(agencies: INSSAgency[]): Promise<void> {
      this.set(KEYS.AGENCIES, agencies);
      await delay(LATENCY);
  }

  async getOfficeData(): Promise<OfficeData> {
      await delay(LATENCY);
      return this.get<OfficeData>(KEYS.OFFICE, { name: 'Vogel Advogados' });
  }

  async saveOfficeData(data: OfficeData): Promise<void> {
      this.set(KEYS.OFFICE, data);
      await delay(LATENCY);
  }

  // --- WHATSAPP TEMPLATES ---
  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
      await delay(LATENCY);
      return this.get<WhatsAppTemplate[]>(KEYS.WA_TEMPLATES, DEFAULT_WA_TEMPLATES);
  }

  async saveWhatsAppTemplates(templates: WhatsAppTemplate[]): Promise<void> {
      this.set(KEYS.WA_TEMPLATES, templates);
      await delay(LATENCY);
  }
}

export const db = new DatabaseService();
