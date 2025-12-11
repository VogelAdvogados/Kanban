
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Hash, ArrowUpCircle, TrendingUp, HelpCircle, MapPin } from 'lucide-react';
import { db } from '../../services/database';
import { INSSAgency } from '../../types';
import { DEFAULT_INSS_AGENCIES } from '../../constants';

interface ProtocolFormProps {
  type: 'PROTOCOL_INSS' | 'PROTOCOL_APPEAL';
  data: any;
  onChange: (data: any) => void;
  targetColumnId?: string;
  agencies?: INSSAgency[]; // Optional prop passed down
}

export const ProtocolForm: React.FC<ProtocolFormProps> = ({ type, data, onChange, targetColumnId, agencies }) => {
  
  // Use passed agencies or fallback to defaults (or local state if not passed)
  const [localAgencies, setLocalAgencies] = useState<INSSAgency[]>(agencies || DEFAULT_INSS_AGENCIES);

  useEffect(() => {
      if (!agencies) {
          db.getAgencies().then(setLocalAgencies);
      } else {
          setLocalAgencies(agencies);
      }
  }, [agencies]);

  // Detect Context based on Target Column
  const isSpecialAppeal = targetColumnId === 'rec_camera'; // 2ª Instância
  const isOrdinaryAppeal = targetColumnId === 'rec_junta'; // 1ª Instância
  const isInitialProtocol = !isSpecialAppeal && !isOrdinaryAppeal; // INSS Padrão

  // --- FEELING WIDGET ---
  const ConfidenceWidget = () => {
      const currentRating = data.confidenceRating !== undefined ? data.confidenceRating : 3;
      
      const getLabel = (val: number) => {
          if(val === 0) return 'Risco Muito Alto (Aventura)';
          if(val === 1) return 'Risco Alto';
          if(val === 2) return 'Incerto / Dividido';
          if(val === 3) return 'Provável';
          if(val === 4) return 'Muito Provável';
          if(val === 5) return 'Direito Líquido e Certo';
          return '';
      };

      const getColor = (val: number) => {
          if(val <= 1) return 'text-red-500';
          if(val === 2) return 'text-orange-500';
          if(val === 3) return 'text-yellow-600';
          if(val >= 4) return 'text-emerald-600';
          return 'text-slate-500';
      };

      return (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1"><TrendingUp size={12}/> Feeling do Advogado</span>
                  <span className={`text-[10px] ${getColor(currentRating)} font-bold transition-colors`}>{getLabel(currentRating)}</span>
              </label>
              
              <div className="px-2">
                  <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="1" 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={currentRating}
                      onChange={(e) => onChange({ confidenceRating: parseInt(e.target.value) })}
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 mt-1 uppercase font-bold">
                      <span>0 (Risco)</span>
                      <span>5 (Certo)</span>
                  </div>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1 leading-tight">
                  <HelpCircle size={10}/> Sua opinião subjetiva calibrará a "Probabilidade de Êxito" no painel.
              </p>
          </div>
      );
  };

  // --- 1. CONTEXTO: INSS (ADMIN OU AUXILIO) ---
  if (isInitialProtocol) {
    return (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 mb-3 uppercase flex items-center gap-2">
                <FileText size={14}/> Dados do Protocolo INSS
            </h4>
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Protocolo</label>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Ex: 123456789"
                        className="w-full border-blue-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500 pl-7 py-2 outline-none font-mono"
                        value={data.protocolNumber || ''}
                        onChange={e => onChange({ protocolNumber: e.target.value })}
                        autoFocus
                    />
                    <Hash size={12} className="absolute left-2.5 top-3 text-blue-400"/>
                </div>
                </div>
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Entrada (DER)</label>
                <input 
                    type="date" 
                    className="w-full border-blue-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500 py-2 outline-none"
                    value={data.protocolDate || ''}
                    onChange={e => onChange({ protocolDate: e.target.value })}
                />
                </div>
            </div>
          </div>

          <ConfidenceWidget />

          {/* Extra Field for Pericia */}
          {targetColumnId === 'aux_pericia' && (
            <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg space-y-3">
              <div>
                  <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1 flex items-center gap-1">
                      <Calendar size={12}/> Data da Perícia Agendada
                  </label>
                  <input 
                    type="datetime-local" 
                    className="w-full border-orange-300 rounded text-sm focus:ring-orange-500 focus:border-orange-500 outline-none p-2"
                    value={data.periciaDate || ''}
                    onChange={e => onChange({ periciaDate: e.target.value })}
                  />
              </div>
              <div className="relative">
                  <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin size={12}/> Local da Perícia
                  </label>
                  <input 
                    type="text" 
                    placeholder="Selecione ou digite..."
                    className="w-full border-orange-300 rounded text-sm focus:ring-orange-500 focus:border-orange-500 outline-none p-2"
                    value={data.periciaLocation || ''}
                    onChange={e => onChange({ periciaLocation: e.target.value })}
                    list="agencies-transition-list"
                  />
                  <datalist id="agencies-transition-list">
                      {localAgencies.map(agency => (
                          <option key={agency.id} value={agency.name} />
                      ))}
                  </datalist>
              </div>
            </div>
          )}
        </div>
    );
  }

  // --- 2. CONTEXTO: RECURSO ORDINÁRIO (JUNTA) ---
  if (isOrdinaryAppeal) {
      return (
        <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 mb-1 uppercase flex items-center gap-2">
                    <ArrowUpCircle size={14}/> 1ª Instância (Junta de Recursos)
                </h4>
                <p className="text-[10px] text-indigo-600 mb-3">
                    Insira os dados do protocolo do Recurso Ordinário.
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Protocolo Recurso (JR)</label>
                        <input 
                            type="text" 
                            className="w-full border-indigo-200 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono py-2 outline-none"
                            value={data.appealOrdinarioProtocol || ''}
                            onChange={e => onChange({ appealOrdinarioProtocol: e.target.value })}
                            placeholder="Ex: 00000.000000/2024-00"
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data da Interposição</label>
                        <input 
                            type="date" 
                            className="w-full border-indigo-200 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 outline-none"
                            value={data.appealOrdinarioDate || ''}
                            onChange={e => onChange({ appealOrdinarioDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            
            <ConfidenceWidget />
        </div>
      );
  }

  // --- 3. CONTEXTO: RECURSO ESPECIAL (CÂMARA) ---
  if (isSpecialAppeal) {
    return (
      <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="text-xs font-bold text-purple-800 mb-1 uppercase flex items-center gap-2">
                  <ArrowUpCircle size={14}/> 2ª Instância (Câmara/CAJ)
              </h4>
              <p className="text-[10px] text-purple-600 mb-3">
                  O processo subiu para a Câmara. Insira o protocolo do Recurso Especial.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Protocolo Especial (CAJ)</label>
                      <input 
                          type="text" 
                          className="w-full border-purple-200 rounded text-sm focus:ring-purple-500 focus:border-purple-500 font-mono py-2 outline-none"
                          value={data.appealEspecialProtocol || ''}
                          onChange={e => onChange({ appealEspecialProtocol: e.target.value })}
                          placeholder="Protocolo CAJ"
                          autoFocus
                      />
                  </div>
                  
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data da Interposição</label>
                      <input 
                          type="date" 
                          className="w-full border-purple-200 rounded text-sm focus:ring-purple-500 focus:border-purple-500 py-2 outline-none"
                          value={data.appealEspecialDate || ''}
                          onChange={e => onChange({ appealEspecialDate: e.target.value })}
                      />
                  </div>
              </div>
          </div>

          <ConfidenceWidget />
      </div>
    );
  }

  return null;
};
