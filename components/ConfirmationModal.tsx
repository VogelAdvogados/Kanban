
import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface ConfirmationModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  title, description, confirmLabel = "Confirmar", cancelLabel = "Cancelar", onConfirm, onCancel, isDangerous = false 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDangerous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
                {description}
            </p>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={onCancel}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
                {cancelLabel}
            </button>
            <button 
                onClick={onConfirm}
                className={`flex-1 py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {confirmLabel} <ArrowRight size={16} />
            </button>
        </div>

      </div>
    </div>
  );
};
