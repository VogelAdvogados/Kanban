
import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Calendar, Hash, ArrowUpCircle, TrendingUp, HelpCircle, MapPin, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { db } from '../../services/database';
import { INSSAgency, Case } from '../../types';
import { DEFAULT_INSS_AGENCIES } from '../../constants';
import { getAgencyStats } from '../../utils'; // Import Algorithm

interface ProtocolFormProps {
  type: 'PROTOCOL_INSS' | 'PROTOCOL_APPEAL';
  data: any;
  onChange: (data: any) => void;
  targetColumnId?: string;
  agencies?: INSSAgency[];
  allCases?: Case[]; // Need historical data for analytics
}

export const ProtocolForm: React.FC<ProtocolFormProps> = ({ type, data, onChange, targetColumnId, agencies, allCases = [] }) => {
  
  const [localAgencies, setLocalAgencies] = useState<INSSAgency[]>(agencies || DEFAULT_INSS_AGENCIES);

  useEffect(() => {
      // Use provided agencies (which might be Courts now) or fallback to DB
      if (agencies && agencies.length > 0) {
          setLocalAgencies(agencies);
      } else {
          db.getAgencies().then(setLocalAgencies);
      }
  }, [agencies]);

  // Agency Analytics
  const agencyStats = useMemo(() => {
      if (!data.periciaLocation || allCases.length === 0) return null;
      return getAgencyStats(data.periciaLocation, allCases);
  }, [data.periciaLocation, allCases]);

  const isSpecialAppeal = targetColumnId === 'rec_camera';
  const isOrdinaryAppeal = targetColumnId === 'rec_junta';
  const isInitialProtocol = !isSpecialAppeal && !isOrdinaryAppeal;
  const isPericiaStep = targetColumnId === 'aux_pericia' || targetColumnId === 'jud_pericia';

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
                      type="range" min="0" max="5" step="1" 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={currentRating}
                      onChange={(e) => onChange({ confidenceRating: parseInt(e.target.value) })}
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 mt-1 uppercase font-bold">
                      <span>0 (Risco)</span>
                      <span>5 (Certo)</span>
                  </div>
              </div>
          </div>
      );
  };

  if (isInitialProtocol) {
    return (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 mb-3 uppercase flex items-center gap-2">
                <FileText size={14}/> {targetColumnId === 'jud_pericia' ? 'Dados do Agendamento Judicial' : 'Dados do Protocolo INSS'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    {targetColumnId === 'jud_pericia' ? 'Nº Processo/Evento' : 'Nº Protocolo'}
                </label>
                <div className="relative">
                    <input 
                        type="text" placeholder="Ex: 123456789"
                        className="w-full border-blue-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500 pl-7 py-2 outline-none font-mono"
                        value={data.protocolNumber || ''}
                        onChange={e => onChange({ protocolNumber: e.target.value })}
                        autoFocus={!isPericiaStep}
                    />
                    <Hash size={12} className="absolute left-2.5 top-3 text-blue-400"/>
                </div>
                </div>
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    {targetColumnId === 'jud_pericia' ? 'Data Despacho' : 'Data Entrada (DER)'}
                </label>
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

          {isPericiaStep && (
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
                    autoFocus
                  />
              </div>
              <div className="relative">
                  <label className="block text-[10px] font-bold text-orange-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin size={12}/> {targetColumnId === 'jud_pericia' ? 'Local (Vara Federal)' : 'Local da Perícia (Agência)'}
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
                  
                  {/* Agency Analytics Widget */}
                  {agencyStats && agencyStats.total > 0 && (
                      <div className="mt-2 flex items-center gap-3 text-[10px] bg-white/60 p-2 rounded border border-orange-200">
                          <div className={`font-bold ${agencyStats.winRate > 50 ? 'text-green-600' : 'text-red-600'}`}>
                              Taxa de Êxito: {agencyStats.winRate}%
                          </div>
                          <div className="text-slate-500 flex items-center gap-1">
                              <ThumbsUp size={10}/> {agencyStats.conceded}
                              <span className="mx-1">|</span>
                              <ThumbsDown size={10}/> {agencyStats.denied}
                          </div>
                          <div className="ml-auto text-slate-400">
                              Tempo Médio: {agencyStats.avgTime}d
                          </div>
                      </div>
                  )}
              </div>
            </div>
          )}
        </div>
    );
  }

  if (isOrdinaryAppeal) {
      return (
        <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 mb-1 uppercase flex items-center gap-2">
                    <ArrowUpCircle size={14}/> 1ª Instância (Junta de Recursos)
                </h4>
                <div className="grid grid-cols-1 gap-3 mt-3">
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

  if (isSpecialAppeal) {
    return (
      <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="text-xs font-bold text-purple-800 mb-1 uppercase flex items-center gap-2">
                  <ArrowUpCircle size={14}/> 2ª Instância (Câmara/CAJ)
              </h4>
              <div className="grid grid-cols-1 gap-3 mt-3">
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
