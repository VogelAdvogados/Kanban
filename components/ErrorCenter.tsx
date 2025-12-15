
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X, Terminal, Activity, User, Clock, Smartphone, ShieldAlert, RefreshCw } from 'lucide-react';
import { AppErrorLog, User as UserType } from '../types';
import { db } from '../services/database';

interface ErrorCenterProps {
    onClose: () => void;
    users: UserType[];
}

export const ErrorCenter: React.FC<ErrorCenterProps> = ({ onClose, users }) => {
    const [errors, setErrors] = useState<AppErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedError, setSelectedError] = useState<AppErrorLog | null>(null);
    const [showResolved, setShowResolved] = useState(false);

    const fetchErrors = async () => {
        setLoading(true);
        try {
            const data = await db.getSystemErrors(showResolved);
            setErrors(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchErrors();
    }, [showResolved]);

    const handleResolve = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await db.resolveError(id);
        // Optimistic update
        setErrors(prev => prev.map(err => err.id === id ? { ...err, resolved: true } : err));
        if (!showResolved) {
            setErrors(prev => prev.filter(err => err.id !== id));
        }
        if (selectedError?.id === id) {
            setSelectedError({ ...selectedError, resolved: true });
        }
    };

    const getUserName = (id: string) => {
        if (!id || id === 'anonymous') return 'Anônimo';
        const user = users.find(u => u.id === id);
        return user ? user.name : 'Desconhecido';
    };

    const getSeverityColor = (s: string) => {
        if (s === 'CRITICAL') return 'text-red-600 bg-red-100 border-red-200';
        if (s === 'MEDIUM') return 'text-orange-600 bg-orange-100 border-orange-200';
        return 'text-blue-600 bg-blue-100 border-blue-200';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-700/50">
                
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                Central de Estabilidade
                            </h2>
                            <p className="text-xs text-slate-400">Monitoramento técnico de falhas e exceções do sistema.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar / List */}
                    <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={showResolved} 
                                        onChange={e => setShowResolved(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    Exibir Resolvidos
                                </label>
                            </div>
                            <button onClick={fetchErrors} className="p-1.5 hover:bg-slate-200 rounded text-slate-500" title="Atualizar">
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto kanban-scroll">
                            {errors.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                    <CheckCircle size={32} className="text-emerald-500 mb-2 opacity-50"/>
                                    <p className="text-sm font-medium">Sistema Saudável</p>
                                    <p className="text-xs">Nenhum erro pendente.</p>
                                </div>
                            ) : (
                                errors.map(err => (
                                    <div 
                                        key={err.id}
                                        onClick={() => setSelectedError(err)}
                                        className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 relative group ${selectedError?.id === err.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSeverityColor(err.severity)}`}>
                                                {err.severity}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock size={10}/> {new Date(err.timestamp).toLocaleDateString()} {new Date(err.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed mb-1">
                                            {err.message}
                                        </h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <User size={10}/> {getUserName(err.userId || '')}
                                            </span>
                                            {!err.resolved && (
                                                <button 
                                                    onClick={(e) => handleResolve(err.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-100 text-emerald-700 p-1 rounded hover:bg-emerald-200"
                                                    title="Marcar como Resolvido"
                                                >
                                                    <CheckCircle size={14}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detail View */}
                    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                        {selectedError ? (
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-xl font-bold text-slate-800 mb-2">{selectedError.message}</h1>
                                        <div className="flex gap-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded border ${getSeverityColor(selectedError.severity)}`}>
                                                {selectedError.severity}
                                            </span>
                                            <span className="text-xs font-bold px-2 py-1 rounded border bg-slate-200 text-slate-600">
                                                ID: {selectedError.id}
                                            </span>
                                            {selectedError.resolved && (
                                                <span className="text-xs font-bold px-2 py-1 rounded border bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                    <CheckCircle size={12}/> Resolvido
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!selectedError.resolved && (
                                        <button 
                                            onClick={(e) => handleResolve(selectedError.id, e)}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircle size={16}/> Marcar como Resolvido
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <User size={14}/> Contexto do Usuário
                                        </h4>
                                        <div className="space-y-2 text-sm text-slate-600">
                                            <p><span className="font-bold">Usuário:</span> {getUserName(selectedError.userId || '')}</p>
                                            <p><span className="font-bold">Ação:</span> {selectedError.actionContext}</p>
                                            <p><span className="font-bold">Data:</span> {new Date(selectedError.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Smartphone size={14}/> Ambiente
                                        </h4>
                                        <div className="space-y-2 text-sm text-slate-600">
                                            <p className="line-clamp-3" title={selectedError.deviceInfo}><span className="font-bold">Device:</span> {selectedError.deviceInfo}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm overflow-hidden">
                                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Terminal size={14}/> Stack Trace
                                        </h4>
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                                            {selectedError.stack || 'Stack trace indisponível.'}
                                        </pre>
                                        {selectedError.componentStack && (
                                            <>
                                                <div className="h-px bg-slate-800 my-4"></div>
                                                <p className="text-xs font-bold text-slate-500 mb-2">Component Stack:</p>
                                                <pre className="text-[11px] font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
                                                    {selectedError.componentStack}
                                                </pre>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <ShieldAlert size={48} className="opacity-20 mb-4"/>
                                <p className="text-sm font-medium">Selecione um erro para ver os detalhes técnicos.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
