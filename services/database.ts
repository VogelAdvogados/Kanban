
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, setDoc, doc, getDoc, persistentLocalCache, persistentMultipleTabManager, onSnapshot, updateDoc, arrayUnion, query, orderBy, limit, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Case, User, DocumentTemplate, SystemLog, SystemTag, Notification, OfficeData, SystemSettings, INSSAgency, WhatsAppTemplate, WorkflowRule, Appointment, AppErrorLog } from '../types';
import { USERS as DEFAULT_USERS, COMMON_DOCUMENTS, DEFAULT_INSS_AGENCIES, JUDICIAL_COURTS, WHATSAPP_TEMPLATES as DEFAULT_WA_TEMPLATES, DEFAULT_WORKFLOW_RULES, DEFAULT_SYSTEM_TAGS, DEFAULT_DOCUMENT_TEMPLATES } from '../constants';
import { safeDeepCopy } from '../utils';

const firebaseConfig = {
  apiKey: "AIzaSyAbrfQcLaAKNhNlmgw3Sk8O1Gr0te7mF5E",
  authDomain: "ramboprev.firebaseapp.com",
  projectId: "ramboprev",
  storageBucket: "ramboprev.firebasestorage.app",
  messagingSenderId: "1007129924404",
  appId: "1:1007129924404:web:c00d598b91cf3b29214b61",
  measurementId: "G-17C2XYB6EF"
};

let app;
try { app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig); } catch (e) { console.warn("Firebase init error:", e); app = getApp(); }

let firestore;
try {
    firestore = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
} catch (e) {
    const { getFirestore } = await import('firebase/firestore');
    firestore = getFirestore(app);
}

let storage: any = null;
try { storage = getStorage(app); } catch (e) { console.error("Storage init failed:", e); }

// Optimized Sanitize using safeDeepCopy from utils
const sanitize = (obj: any): any => {
    return safeDeepCopy(obj);
};

class DatabaseService {
  // --- CORE HELPERS ---
  private async getDocData<T>(coll: string, id: string, defaultVal: T): Promise<T> {
      if (!firestore) return defaultVal;
      try {
          const snap = await getDoc(doc(firestore, coll, id));
          return snap.exists() ? (snap.data().data as T) : defaultVal;
      } catch (e) { return defaultVal; }
  }

  private async saveDocData<T>(coll: string, id: string, val: T): Promise<void> {
      if (!firestore) return;
      try {
          const clean = sanitize(val);
          if (clean) await setDoc(doc(firestore, coll, id), { data: clean }, { merge: true });
      } catch (e) { console.error(`Error saving ${coll}/${id}`, e); }
  }

  // --- FILE STORAGE ---
  async uploadCaseFile(file: File, caseId: string): Promise<string> {
      if (!storage) throw new Error("Storage indisponível.");
      const snap = await uploadBytes(ref(storage, `cases/${caseId}/${Date.now()}_${file.name}`), file);
      return await getDownloadURL(snap.ref);
  }

  // --- REAL-TIME CASES ---
  subscribeToCases(cb: (cases: Case[]) => void) {
      if (!firestore) return () => {};
      return onSnapshot(query(collection(firestore, "cases")), (snap) => {
          const list: Case[] = [];
          snap.forEach((d) => list.push(d.data() as Case));
          cb(list);
      }, (e) => console.error("Snapshot error", e));
  }

  subscribeToCase(id: string, cb: (data: Case) => void) {
      if (!firestore) return () => {};
      return onSnapshot(doc(firestore, "cases", id), (d) => { if (d.exists()) cb(d.data() as Case); });
  }

  async getCases(): Promise<Case[] | null> {
    if (!firestore) return null;
    const snap = await getDocs(collection(firestore, "cases"));
    const list: Case[] = [];
    snap.forEach((d) => list.push(d.data() as Case));
    return list;
  }

  async saveCase(c: Case): Promise<Case> {
    if (!firestore) throw new Error("Firestore offline");
    const clean = sanitize(c);
    if (!clean) throw new Error("Invalid data");
    await setDoc(doc(firestore, "cases", c.id), clean);
    return c;
  }

  // OPTIMIZED BATCH UPDATE
  async updateCasesBulk(cases: Case[]): Promise<void> {
      if (!firestore) return;
      
      const BATCH_SIZE = 450; // Firestore limit is 500, keeping safety margin
      const chunks = [];
      
      for (let i = 0; i < cases.length; i += BATCH_SIZE) {
          chunks.push(cases.slice(i, i + BATCH_SIZE));
      }

      for (const chunk of chunks) {
          const batch = writeBatch(firestore);
          chunk.forEach(c => {
              const clean = sanitize(c);
              if (clean) {
                  const ref = doc(firestore, "cases", c.id);
                  batch.set(ref, clean, { merge: true });
              }
          });
          await batch.commit();
      }
  }

  // --- ERROR LOGGING ---
  async logError(err: Error, info?: any, userId?: string, severity: 'LOW'|'MEDIUM'|'CRITICAL' = 'MEDIUM') {
      if (!firestore) return;
      const log: AppErrorLog = {
          id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          message: err.message || 'Unknown', stack: err.stack, componentStack: info?.componentStack,
          userId: userId || 'anon', actionContext: info?.context || 'Unspecified', timestamp: new Date().toISOString(),
          deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server', resolved: false, severity
      };
      // Fire and forget, don't await
      setDoc(doc(firestore, "system_errors", log.id), log).catch(console.error);
  }

  async getSystemErrors(showResolved = false): Promise<AppErrorLog[]> {
      if (!firestore) return [];
      const q = query(collection(firestore, "system_errors"), orderBy("timestamp", "desc"), limit(50));
      const snap = await getDocs(q);
      let list: AppErrorLog[] = [];
      snap.forEach(d => list.push(d.data() as AppErrorLog));
      return showResolved ? list : list.filter(e => !e.resolved);
  }

  async resolveError(id: string) {
      if (!firestore) return;
      await updateDoc(doc(firestore, "system_errors", id), { resolved: true });
  }

  // --- COLLECTIONS ---
  async getUsers() { return this.getDocData('app_data', 'users', DEFAULT_USERS); }
  async saveUsers(v: User[]) { return this.saveDocData('app_data', 'users', v); }
  async addUser(u: User) { 
      if (!firestore) return;
      try { await updateDoc(doc(firestore, 'app_data', 'users'), { data: arrayUnion(sanitize(u)) }); } 
      catch { const cur = await this.getUsers(); await this.saveUsers([...cur, u]); }
  }

  // Logs optimization: limit array size to prevent document bloat
  async getLogs() { return this.getDocData('app_data', 'logs', []); }
  async addLog(l: SystemLog) { 
      const logs = await this.getLogs(); 
      // Keep only last 500 logs to avoid exceeding 1MB doc limit
      const trimmedLogs = [l, ...logs].slice(0, 500);
      return this.saveDocData('app_data', 'logs', trimmedLogs); 
  }

  async getAppointments() { return this.getDocData('app_data', 'appointments', []); }
  async saveAppointment(v: Appointment) { 
      const list = await this.getAppointments();
      const idx = list.findIndex(a => a.id === v.id);
      const newList = idx >= 0 ? list.map(a => a.id === v.id ? v : a) : [...list, v];
      return this.saveDocData('app_data', 'appointments', newList); 
  }

  // Generic Getters/Setters
  async getNotifications() { return this.getDocData('app_data', 'notifications', []); }
  async saveNotifications(v: Notification[]) { 
      // Limit notifications to 200
      const trimmed = v.slice(0, 200);
      return this.saveDocData('app_data', 'notifications', trimmed); 
  }

  async getSystemSettings() { return this.getDocData('app_data', 'settings', { sla_internal_analysis: 7, sla_client_contact: 30, sla_stagnation: 45, sla_spider_web: 45, sla_mandado_seguranca: 120, pp_alert_days: 15, show_probabilities: true }); }
  async saveSystemSettings(v: SystemSettings) { return this.saveDocData('app_data', 'settings', v); }

  async getTags() { return this.getDocData('app_data', 'tags', DEFAULT_SYSTEM_TAGS); }
  async saveTags(v: SystemTag[]) { return this.saveDocData('app_data', 'tags', v); }

  async getWorkflowRules() { return this.getDocData('app_data', 'workflow_rules', DEFAULT_WORKFLOW_RULES); }
  async saveWorkflowRules(v: WorkflowRule[]) { return this.saveDocData('app_data', 'workflow_rules', v); }

  async getCommonDocs() { return this.getDocData('app_data', 'common_docs', COMMON_DOCUMENTS); }
  async saveCommonDocs(v: string[]) { return this.saveDocData('app_data', 'common_docs', v); }

  async getAgencies() { return this.getDocData('app_data', 'agencies', [...DEFAULT_INSS_AGENCIES, ...JUDICIAL_COURTS]); }
  async saveAgencies(v: INSSAgency[]) { return this.saveDocData('app_data', 'agencies', v); }

  async getOfficeData() { return this.getDocData('app_data', 'office', { name: 'Vogel Advogados' }); }
  async saveOfficeData(v: OfficeData) { return this.saveDocData('app_data', 'office', v); }

  async getWhatsAppTemplates() { return this.getDocData('app_data', 'wa_templates', DEFAULT_WA_TEMPLATES); }
  async saveWhatsAppTemplates(v: WhatsAppTemplate[]) { return this.saveDocData('app_data', 'wa_templates', v); }

  async getTemplates() { return this.getDocData('app_data', 'templates', DEFAULT_DOCUMENT_TEMPLATES); }
  async saveTemplates(v: DocumentTemplate[]) { return this.saveDocData('app_data', 'templates', v); }
}

export const db = new DatabaseService();
