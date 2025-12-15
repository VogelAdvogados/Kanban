
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { db } from '../services/database';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // CENTRAL DE ERROS: Log to Firebase silently
    // We try to get user info from localStorage if available, as we don't have context here easily
    let userId = 'unknown';
    try {
        const storedUser = localStorage.getItem('rambo_prev_user_cache'); // Assuming we might cache this
        if (storedUser) userId = JSON.parse(storedUser).id;
    } catch {}

    db.logError(error, { componentStack: errorInfo.componentStack, context: 'ErrorBoundary Catch' }, userId, 'CRITICAL');
  }

  private handleReload = () => {
      window.location.reload();
  }

  private handleClearData = () => {
      if(confirm('Isso apagará os dados locais do navegador (cache) para tentar recuperar o sistema. Seus dados na nuvem (Firebase) estão seguros. Tem certeza?')) {
          localStorage.clear();
          window.location.reload();
      }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-red-100 p-8 text-center relative overflow-hidden">
            {/* Visual Indicator of Logging */}
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-slate-300">
                <Bug size={10} /> Log Enviado
            </div>

            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              O sistema encontrou um erro inesperado. Fique tranquilo, um relatório técnico foi enviado automaticamente para a central de correção.
            </p>
            
            <div className="bg-slate-100 p-3 rounded text-xs text-slate-600 font-mono text-left mb-6 overflow-auto max-h-32 border border-slate-200 shadow-inner">
                {this.state.error?.message || 'Erro desconhecido'}
            </div>

            <div className="space-y-3">
                <button 
                    onClick={this.handleReload}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
                >
                    <RefreshCw size={18} /> Tentar Novamente
                </button>
                <button 
                    onClick={this.handleClearData}
                    className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                >
                    Resetar Cache Local (Último Recurso)
                </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
