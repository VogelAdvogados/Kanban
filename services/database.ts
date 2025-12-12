
import { Case, User, DocumentTemplate, SystemLog, SystemTag, Notification, OfficeData, SystemSettings, INSSAgency, WhatsAppTemplate, WorkflowRule, Appointment } from '../types';
import { INITIAL_CASES, DEFAULT_DOCUMENT_TEMPLATES, USERS as DEFAULT_USERS, DEFAULT_SYSTEM_TAGS, COMMON_DOCUMENTS, DEFAULT_INSS_AGENCIES, WHATSAPP_TEMPLATES as DEFAULT_WA_TEMPLATES, DEFAULT_WORKFLOW_RULES } from '../constants';

// Keys for LocalStorage
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
  WORKFLOW_RULES: 'rambo_prev_workflow_rules',
  APPOINTMENTS: 'rambo_prev_appointments'
};

const LATENCY = 150;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple Mutex to prevent race conditions during async operations
class Mutex {
    private mutex = Promise.resolve();

    lock(): Promise<() => void> {
        let unlock: () => void = () => {};
        const lockPromise = new Promise<void>(resolve => {
            unlock = resolve;
        });
        const willLock = this.mutex.then(() => unlock);
        this.mutex = this.mutex.then(() => lockPromise);
        return willLock;
    }
}

class DatabaseService {
  private mutex = new Mutex();

  private get<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultVal;
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error reading ${key} from DB. Data might be corrupted.`, e);
      return defaultVal;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          alert("CRÍTICO: Limite de armazenamento do navegador atingido! Não é possível salvar novos dados/arquivos. Exclua anexos antigos ou faça backup.");
          throw new Error("Armazenamento cheio.");
      }
      console.error(`Error writing ${key} to DB`, e);
      throw e;
    }
  }

  // --- CASES (Protected by Mutex) ---
  async getCases(): Promise<Case[]> {
    await delay(LATENCY);
    return this.get<Case[]>(KEYS.CASES, INITIAL_CASES);
  }

  async saveCase(newCase: Case): Promise<Case> {
    const unlock = await this.mutex.lock(); // Lock database
    try {
        const cases = this.get<Case[]>(KEYS.CASES, []);
        const exists = cases.find(c => c.id === newCase.id);
        
        let updatedCases;
        if (exists) {
          updatedCases = cases.map(c => c.id === newCase.id ? newCase : c);
        } else {
          updatedCases = [newCase, ...cases];
        }
        
        this.set(KEYS.CASES, updatedCases);
        await delay(LATENCY); // Simulate latency inside lock to maintain order
        return newCase;
    } finally {
        unlock(); // Release lock
    }
  }

  async updateCasesBulk(casesToUpdate: Case[]): Promise<void> {
      const unlock = await this.mutex.lock();
      try {
          this.set(KEYS.CASES, casesToUpdate);
          await delay(LATENCY);
      } finally {
          unlock();
      }
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    await delay(LATENCY);
    return this.get<User[]>(KEYS.USERS, DEFAULT_USERS);
  }

  async saveUsers(users: User[]): Promise<void> {
    const unlock = await this.mutex.lock();
    try {
        this.set(KEYS.USERS, users);
        await delay(LATENCY);
    } finally {
        unlock();
    }
  }

  // --- APPOINTMENTS ---
  async getAppointments(): Promise<Appointment[]> {
      await delay(LATENCY);
      return this.get<Appointment[]>(KEYS.APPOINTMENTS, []);
  }

  async saveAppointment(appt: Appointment): Promise<void> {
      const unlock = await this.mutex.lock();
      try {
          const all = this.get<Appointment[]>(KEYS.APPOINTMENTS, []);
          const exists = all.find(a => a.id === appt.id);
          let updated;
          if (exists) {
              updated = all.map(a => a.id === appt.id ? appt : a);
          } else {
              updated = [...all, appt];
          }
          this.set(KEYS.APPOINTMENTS, updated);
          await delay(LATENCY);
      } finally {
          unlock();
      }
  }

  // --- LOGS ---
  async getLogs(): Promise<SystemLog[]> {
    return this.get<SystemLog[]>(KEYS.LOGS, []);
  }

  async addLog(log: SystemLog): Promise<void> {
    try {
        const logs = this.get<SystemLog[]>(KEYS.LOGS, []);
        const updatedLogs = [log, ...logs].slice(0, 500); // Strict limit
        this.set(KEYS.LOGS, updatedLogs);
    } catch (e) {
        console.warn("Could not save log due to storage limits");
    }
  }

  // --- GENERIC GETTERS/SETTERS (Simpler mutex wrapper) ---
  
  async getTemplates(): Promise<DocumentTemplate[]> { await delay(LATENCY); return this.get(KEYS.TEMPLATES, DEFAULT_DOCUMENT_TEMPLATES); }
  async saveTemplates(v: DocumentTemplate[]): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.TEMPLATES, v); await delay(LATENCY); u(); }

  async getNotifications(): Promise<Notification[]> { return this.get(KEYS.NOTIFICATIONS, []); }
  async saveNotifications(v: Notification[]): Promise<void> { this.set(KEYS.NOTIFICATIONS, v); } 

  async getSystemSettings(): Promise<SystemSettings> { 
      await delay(LATENCY); 
      const defaults: SystemSettings = { sla_internal_analysis: 7, sla_client_contact: 30, sla_stagnation: 45, sla_spider_web: 45, pp_alert_days: 15, show_probabilities: true };
      return this.get(KEYS.SETTINGS, defaults); 
  }
  async saveSystemSettings(v: SystemSettings): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.SETTINGS, v); await delay(LATENCY); u(); }

  async getTags(): Promise<SystemTag[]> { await delay(LATENCY); return this.get(KEYS.TAGS, DEFAULT_SYSTEM_TAGS); }
  async saveTags(v: SystemTag[]): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.TAGS, v); await delay(LATENCY); u(); }

  async getWorkflowRules(): Promise<WorkflowRule[]> { await delay(LATENCY); return this.get(KEYS.WORKFLOW_RULES, DEFAULT_WORKFLOW_RULES); }
  async saveWorkflowRules(v: WorkflowRule[]): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.WORKFLOW_RULES, v); await delay(LATENCY); u(); }

  async getCommonDocs(): Promise<string[]> { await delay(LATENCY); return this.get(KEYS.COMMON_DOCS, COMMON_DOCUMENTS); }
  async saveCommonDocs(v: string[]): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.COMMON_DOCS, v); await delay(LATENCY); u(); }

  async getAgencies(): Promise<INSSAgency[]> { await delay(LATENCY); return this.get(KEYS.AGENCIES, DEFAULT_INSS_AGENCIES); }
  async saveAgencies(v: INSSAgency[]): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.AGENCIES, v); await delay(LATENCY); u(); }

  async getOfficeData(): Promise<OfficeData> { await delay(LATENCY); return this.get(KEYS.OFFICE, { name: 'Vogel Advogados' }); }
  async saveOfficeData(v: OfficeData): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.OFFICE, v); await delay(LATENCY); u(); }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> { await delay(LATENCY); return this.get(KEYS.WA_TEMPLATES, DEFAULT_WA_TEMPLATES); }
  async saveWhatsAppTemplates(v: WhatsAppTemplate[]): Promise<void> { const u = await this.mutex.lock(); this.set(KEYS.WA_TEMPLATES, v); await delay(LATENCY); u(); }
}

export const db = new DatabaseService();
