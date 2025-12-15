
import React, { Suspense } from 'react';
import { Case, User, OfficeData, SystemLog, SystemSettings, SystemTag, INSSAgency, WhatsAppTemplate, WorkflowRule, Appointment, DocumentTemplate, StickyNote } from '../types';
import { db } from '../services/database';

// Lazy Load Modals
const ManagementHub = React.lazy(() => import('./ManagementHub').then(m => ({ default: m.ManagementHub })));
const SettingsModal = React.lazy(() => import('./SettingsModal').then(m => ({ default: m.SettingsModal })));
const TemplatesDialog = React.lazy(() => import('./TemplatesDialog').then(m => ({ default: m.TemplatesDialog })));
const CaseModal = React.lazy(() => import('./CaseModal').then(m => ({ default: m.CaseModal })));
const TransitionModal = React.lazy(() => import('./TransitionModal').then(m => ({ default: m.TransitionModal })));
const NewCaseDialog = React.lazy(() => import('./NewCaseDialog').then(m => ({ default: m.NewCaseDialog })));
const WhatsAppModal = React.lazy(() => import('./WhatsAppModal').then(m => ({ default: m.WhatsAppModal })));
const GlobalSearch = React.lazy(() => import('./search/GlobalSearch').then(m => ({ default: m.GlobalSearch })));
const StickyNoteDialog = React.lazy(() => import('./StickyNoteDialog').then(m => ({ default: m.StickyNoteDialog })));
const AppointmentDialog = React.lazy(() => import('./AppointmentDialog').then(m => ({ default: m.AppointmentDialog })));
const DocumentGeneratorModal = React.lazy(() => import('./DocumentGeneratorModal').then(m => ({ default: m.DocumentGeneratorModal })));

interface GlobalModalLayerProps {
    appState: {
        currentUser: User;
        activeTool: string | null;
        isModalOpen: boolean;
        selectedCase: Case | null;
        isNewCaseDialogOpen: boolean;
        isSearchOpen: boolean;
        whatsAppCase: Case | null;
        appointmentData: {caseItem?: Case, date?: Date} | null;
        stickyNoteState: { case: Case, note?: StickyNote } | null;
        documentGenCase: Case | null;
        transitionData: any;
    };
    appActions: {
        setActiveTool: (t: any) => void;
        handleCloseCase: () => void;
        handleOpenCase: (c: Case) => void;
        handleUpdateClient: (oldCpf: string, updates: Partial<Case>) => void;
        setIsNewCaseDialogOpen: (v: boolean) => void;
        setIsSearchOpen: (v: boolean) => void;
        setCurrentView: (v: any) => void;
        setWhatsAppCase: (c: Case | null) => void;
        setAppointmentData: (d: any) => void;
        setStickyNoteState: (s: any) => void;
        setDocumentGenCase: (c: Case | null) => void;
        handleTransitionConfirm: () => void;
        setTransitionType: (t: any) => void;
        setPendingMove: (m: any) => void;
        setTransitionData: (d: any) => void;
        handleSaveDocToHistory: (title: string, content: string) => void;
    };
    data: {
        cases: Case[];
        users: User[];
        officeData: OfficeData;
        systemLogs: SystemLog[];
        systemSettings: SystemSettings;
        systemTags: SystemTag[];
        commonDocs: string[];
        agencies: INSSAgency[];
        whatsAppTemplates: WhatsAppTemplate[];
        workflowRules: WorkflowRule[];
        documentTemplates: DocumentTemplate[];
        pendingMove: any;
        transitionType: any;
    };
    setters: {
        setUsers: (u: User[]) => void;
        setOfficeData: (d: OfficeData) => void;
        setCases: (c: Case[]) => void;
        setSystemSettings: (s: SystemSettings) => void;
        setSystemTags: (t: SystemTag[]) => void;
        setCommonDocs: (d: string[]) => void;
        setAgencies: (a: INSSAgency[]) => void;
        setWhatsAppTemplates: (t: WhatsAppTemplate[]) => void;
        setWorkflowRules: (w: WorkflowRule[]) => void;
        setDocumentTemplates: (t: DocumentTemplate[]) => void;
    };
    ops: {
        updateCase: (c: Case, log?: string, user?: string) => Promise<boolean>;
        addCase: (c: Case, user: string) => Promise<void>;
        addSystemLog: (a: string, d: string, u: string, c: any) => void;
        addAppointment: (a: Appointment) => void;
        generateInternalId: () => string;
        currentView: any;
        columns: any[];
    };
    onRefreshTemplates?: () => void;
}

export const GlobalModalLayer = React.memo<GlobalModalLayerProps>(({ appState, appActions, data, setters, ops, onRefreshTemplates }) => {
    const { currentUser, activeTool, isModalOpen, selectedCase, isNewCaseDialogOpen, isSearchOpen, whatsAppCase, appointmentData, stickyNoteState, documentGenCase, transitionData } = appState;
    const { setActiveTool, handleCloseCase, handleOpenCase, handleUpdateClient, setIsNewCaseDialogOpen, setIsSearchOpen, setCurrentView, setWhatsAppCase, setAppointmentData, setStickyNoteState, setDocumentGenCase, handleTransitionConfirm, setTransitionType, setPendingMove, setTransitionData, handleSaveDocToHistory } = appActions;
    
    // Performance Optimization: Only render the layer if there is an active modal/tool
    const hasActiveModal = activeTool || isModalOpen || isNewCaseDialogOpen || isSearchOpen || whatsAppCase || appointmentData || stickyNoteState || documentGenCase || data.transitionType;

    if (!hasActiveModal) return null;

    return (
        <Suspense fallback={null}>
            {activeTool && activeTool !== 'SETTINGS' && activeTool !== 'TEMPLATES' && (
                <ManagementHub 
                    isOpen={true} 
                    onClose={() => setActiveTool(null)} 
                    initialTab={activeTool} 
                    cases={data.cases} users={data.users} currentUser={currentUser} setUsers={setters.setUsers} 
                    officeData={data.officeData} setOfficeData={setters.setOfficeData} 
                    onImportData={d => { setters.setCases(d); db.updateCasesBulk(d); }} 
                    onSelectCase={handleOpenCase} 
                    onToggleTask={(cid, tid) => { const c = data.cases.find(x => x.id === cid); if(c) ops.updateCase({...c, tasks: c.tasks?.map(t => t.id === tid ? {...t, completed: !t.completed} : t)}, '', currentUser.name); }} 
                    onNewCase={() => setIsNewCaseDialogOpen(true)} 
                    onUpdateClient={handleUpdateClient} 
                    systemLogs={data.systemLogs}
                    updateCase={ops.updateCase} 
                    onNewAppointment={(d) => setAppointmentData({ date: d })} 
                />
            )}

            {activeTool === 'SETTINGS' && (
                <SettingsModal 
                    onClose={() => setActiveTool(null)} 
                    allCases={data.cases} 
                    users={data.users} setUsers={setters.setUsers} 
                    currentUser={currentUser}
                    onImportData={d => { setters.setCases(d); db.updateCasesBulk(d); }} 
                    officeData={data.officeData} setOfficeData={setters.setOfficeData}
                    addSystemLog={ops.addSystemLog}
                    systemSettings={data.systemSettings} setSystemSettings={setters.setSystemSettings}
                    systemTags={data.systemTags} setSystemTags={setters.setSystemTags}
                    commonDocs={data.commonDocs} setCommonDocs={setters.setCommonDocs}
                    agencies={data.agencies} setAgencies={setters.setAgencies}
                    whatsAppTemplates={data.whatsAppTemplates} setWhatsAppTemplates={setters.setWhatsAppTemplates}
                    workflowRules={data.workflowRules} setWorkflowRules={setters.setWorkflowRules}
                    documentTemplates={data.documentTemplates} setDocumentTemplates={setters.setDocumentTemplates}
                />
            )}

            {activeTool === 'TEMPLATES' && (
                <TemplatesDialog 
                    isOpen={true}
                    onClose={() => setActiveTool(null)}
                    currentUser={currentUser}
                    addSystemLog={ops.addSystemLog}
                    officeData={data.officeData}
                    onRefreshGlobal={onRefreshTemplates}
                />
            )}
            
            {isModalOpen && selectedCase && (
                <CaseModal 
                    data={selectedCase} allCases={data.cases} users={data.users} 
                    isOpen={isModalOpen} onClose={handleCloseCase} 
                    onSave={(u, l) => ops.updateCase(u, l, currentUser?.name)} 
                    onSelectCase={handleOpenCase} 
                    onOpenWhatsApp={setWhatsAppCase} 
                    onOpenSchedule={(c) => setAppointmentData({ caseItem: c })} 
                    commonDocs={data.commonDocs} whatsAppTemplates={data.whatsAppTemplates} agencies={data.agencies} systemSettings={data.systemSettings} 
                    onOpenDocumentGenerator={setDocumentGenCase} 
                />
            )}
            
            {isSearchOpen && (
                <GlobalSearch 
                    isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} 
                    cases={data.cases} onSelectCase={handleOpenCase} 
                    onNavigate={(v) => setCurrentView(v)} 
                    onAction={(act) => { if(act === 'DASHBOARD') setActiveTool('DASHBOARD'); if(act === 'CALENDAR') setActiveTool('CALENDAR'); if(act === 'SETTINGS') setActiveTool('SETTINGS'); }} 
                />
            )}

            {data.transitionType && data.pendingMove && (
                <TransitionModal 
                    type={data.transitionType} data={transitionData} setData={setTransitionData} 
                    caseContext={data.cases.find(c => c.id === data.pendingMove.caseId)} 
                    currentResponsibleId={currentUser!.id} users={data.users} targetColumnId={data.pendingMove.targetColId} 
                    onConfirm={handleTransitionConfirm} 
                    onCancel={() => { setTransitionType(null); setPendingMove(null); }} 
                    agencies={data.agencies} 
                />
            )}
            
            {isNewCaseDialogOpen && (
                <NewCaseDialog 
                    cases={data.cases} onClose={() => setIsNewCaseDialogOpen(false)} 
                    onProceed={(cpf, existingData) => ops.addCase({ 
                        id: `c_${Date.now()}`, internalId: ops.generateInternalId(), clientName: existingData?.clientName || 'Novo', cpf, 
                        view: ops.currentView, columnId: ops.columns[0].id, responsibleId: currentUser!.id, responsibleName: currentUser!.name, 
                        createdAt: new Date().toISOString(), lastUpdate: new Date().toISOString(), urgency: 'NORMAL', history: [], ...existingData 
                    }, currentUser!.name)} 
                />
            )}
            
            {whatsAppCase && (
                <WhatsAppModal 
                    data={whatsAppCase} onClose={() => setWhatsAppCase(null)} 
                    agencies={data.agencies} templates={data.whatsAppTemplates} 
                    onLog={(msg) => ops.updateCase(whatsAppCase, msg, currentUser?.name)} 
                />
            )}
            
            {appointmentData && (
                <AppointmentDialog 
                    caseItem={appointmentData.caseItem} initialDate={appointmentData.date} 
                    allCases={data.cases} users={data.users} currentUser={currentUser!} 
                    onSave={(appt) => { ops.addAppointment(appt); if (appointmentData.caseItem) ops.updateCase(appointmentData.caseItem, 'Agendamento criado', currentUser?.name); }} 
                    onClose={() => setAppointmentData(null)} 
                />
            )}
            
            {stickyNoteState && (
                <StickyNoteDialog 
                    notes={stickyNoteState.case.stickyNotes || []} users={data.users} currentUser={currentUser!} 
                    onSaveNotes={(updatedNotes, log) => { ops.updateCase({ ...stickyNoteState.case, stickyNotes: updatedNotes }, log, currentUser?.name); setStickyNoteState(null); }} 
                    onClose={() => setStickyNoteState(null)} 
                />
            )}

            {documentGenCase && (
                <DocumentGeneratorModal 
                    data={documentGenCase} 
                    templates={data.documentTemplates} 
                    onClose={() => setDocumentGenCase(null)} 
                    officeData={data.officeData}
                    onSaveToHistory={handleSaveDocToHistory}
                />
            )}
        </Suspense>
    );
});
