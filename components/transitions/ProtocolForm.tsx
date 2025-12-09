import React from 'react';

interface ProtocolFormProps {
  type: 'PROTOCOL_INSS' | 'PROTOCOL_APPEAL';
  data: any;
  onChange: (data: any) => void;
  targetColumnId?: string;
}

export const ProtocolForm: React.FC<ProtocolFormProps> = ({ type, data, onChange, targetColumnId }) => {
  return (
    <div className="space-y-4">
      {type === 'PROTOCOL_INSS' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Prot.</label>
              <input 
                type="date" 
                className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                value={data.protocolDate}
                onChange={e => onChange({ protocolDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Protocolo</label>
              <input 
                type="text" 
                placeholder="Ex: 123456789"
                className="w-full border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                value={data.protocolNumber}
                onChange={e => onChange({ protocolNumber: e.target.value })}
              />
            </div>
          </div>
          {/* Extra Field for Pericia */}
          {targetColumnId === 'aux_pericia' && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">Data da Perícia Agendada</label>
              <input 
                type="datetime-local" 
                className="w-full border-orange-300 rounded text-sm focus:ring-orange-500 focus:border-orange-500"
                value={data.periciaDate || ''}
                onChange={e => onChange({ periciaDate: e.target.value })}
              />
            </div>
          )}
        </>
      )}

      {type === 'PROTOCOL_APPEAL' && (
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Protocolo Recurso</label>
          <input 
            type="text" 
            className="w-full border-indigo-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            value={data.appealProtocolNumber || ''}
            onChange={e => onChange({ appealProtocolNumber: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};