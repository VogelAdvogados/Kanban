
import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsHelpProps {
  onClose: () => void;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ onClose }) => {
  const shortcuts = [
    { keys: ['N'], desc: 'Novo Processo' },
    { keys: ['/'], desc: 'Busca Global' },
    { keys: ['Esc'], desc: 'Fechar Modais' },
    { keys: ['1-6'], desc: 'Alternar Visão (Admin, Judicial...)' },
    { keys: ['?'], desc: 'Mostrar Atalhos' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={20} />
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Keyboard size={20} className="text-blue-600"/> Atalhos de Teclado
        </h3>
        <div className="space-y-2">
            {shortcuts.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                    <span className="text-sm text-slate-600">{s.desc}</span>
                    <div className="flex gap-1">
                        {s.keys.map(k => (
                            <kbd key={k} className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-700 min-w-[24px] text-center shadow-sm">
                                {k}
                            </kbd>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
