
import React, { useState } from 'react';
import { User, Copy, Check, Send, Key, ChevronUp, ChevronDown, MapPin, Search, XCircle, Phone, Cake, Users, Wand2 } from 'lucide-react';
import { Case } from '../../types';
import { formatCPF, formatPhoneNumber, extractDataFromText } from '../../utils';

interface ClientInfoProps {
  data: Case;
  onChange: (updates: Partial<Case>) => void;
  onOpenWhatsApp?: (c: Case) => void;
}

export const ClientInfo: React.FC<ClientInfoProps> = ({ data, onChange, onOpenWhatsApp }) => {
  const [showExtendedInfo, setShowExtendedInfo] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState(false);
  const [isMagicPasteOpen, setIsMagicPasteOpen] = useState(false);
  const [magicText, setMagicText] = useState('');

  const copyToClipboard = (text: string | undefined, f: string) => { 
    if(text) { 
        navigator.clipboard.writeText(text).catch(err => console.error("Erro ao copiar", err)); 
        setCopiedField(f); 
        setTimeout(()=>setCopiedField(null), 1500); 
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    setIsLoadingCep(true);
    setCepError(false);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const result = await response.json();
        
        if (!result.erro) {
            onChange({
                addressStreet: result.logradouro,
                addressNeighborhood: result.bairro,
                addressCity: result.localidade,
                addressState: result.uf
            });
        } else {
            setCepError(true);
        }
    } catch (e) {
        console.error("Erro ao buscar CEP", e);
        setCepError(true);
    } finally {
        setIsLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '');
      let formattedValue = rawValue;
      if (rawValue.length > 5) {
          formattedValue = rawValue.replace(/^(\d{5})(\d)/, '$1-$2');
      }
      onChange({ addressZip: formattedValue });
      if (rawValue.length === 8) {
          fetchAddressByCep(rawValue);
      }
  };

  const handleMagicPaste = () => {
      if(!magicText.trim()) return;
      const extracted = extractDataFromText(magicText);
      onChange(extracted);
      setMagicText('');
      setIsMagicPasteOpen(false);
      setShowExtendedInfo(true); // Show fields to verify
      
      // Feedback via alert for now
      const fields = Object.keys(extracted).length;
      if(fields > 0) alert(`${fields} campos identificados e preenchidos automaticamente! Verifique os dados.`);
      else alert('Nenhum dado reconhecido no texto colado.');
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden">
        
        {/* MAGIC PASTE OVERLAY */}
        {isMagicPasteOpen && (
            <div className="absolute inset-0 bg-white/95 z-20 flex flex-col p-4 animate-in fade-in">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                        <Wand2 size={16}/> Colagem Mágica (IA)
                    </h4>
                    <button onClick={() => setIsMagicPasteOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XCircle size={18} className="text-slate-400"/></button>
                </div>
                <textarea
                    autoFocus
                    className="flex-1 w-full border border-purple-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-purple-100 outline-none resize-none mb-3"
                    placeholder="Cole aqui o texto do CNIS, RG, ou Ficha Cadastral... O sistema extrairá CPF, Nome, Datas e Endereço automaticamente."
                    value={magicText}
                    onChange={(e) => setMagicText(e.target.value)}
                />
                <button 
                    onClick={handleMagicPaste}
                    className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-purple-700 shadow-md"
                >
                    Processar Texto
                </button>
            </div>
        )}

        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14}/> Dados do Cliente
            </h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsMagicPasteOpen(true)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 border border-purple-100 px-2 py-1 rounded transition-colors"
                    title="Preencher dados automaticamente colando texto"
                >
                    <Wand2 size={12} /> Auto-Preencher
                </button>
                <button 
                    onClick={() => setShowExtendedInfo(!showExtendedInfo)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                    {showExtendedInfo ? <><ChevronUp size={14} /> Menos</> : <><ChevronDown size={14} /> Mais Detalhes</>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CPF */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col relative group">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">CPF</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={data.cpf || ''} 
                        onChange={(e) => onChange({ cpf: formatCPF(e.target.value) })}
                        className="bg-transparent font-mono font-bold text-slate-800 text-lg w-full outline-none"
                        maxLength={14}
                    />
                    <button onClick={() => copyToClipboard(data.cpf, 'cpf')} className="p-1.5 bg-white text-slate-400 hover:text-blue-600 rounded shadow-sm border border-slate-200 transition-colors" title="Copiar CPF">
                        {copiedField === 'cpf' ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                    </button>
                </div>
            </div>
            
            {/* BIRTH DATE & SEX */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-2 relative group">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Cake size={10}/> Nascimento</label>
                    <input 
                        type="date" 
                        value={data.birthDate || ''} 
                        onChange={(e) => onChange({ birthDate: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 text-sm w-full outline-none"
                    />
                </div>
                <div className="w-px bg-slate-300"></div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Sexo</label>
                    <select 
                        value={data.sex || ''} 
                        onChange={(e) => onChange({ sex: e.target.value as any })}
                        className="bg-transparent font-bold text-slate-800 text-sm w-full outline-none"
                    >
                        <option value="">-</option>
                        <option value="MALE">Masc.</option>
                        <option value="FEMALE">Fem.</option>
                    </select>
                </div>
            </div>

            {/* TELEFONE */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col relative group">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Phone size={10}/> Telefone / WhatsApp</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={data.phone || ''} 
                        onChange={(e) => onChange({ phone: formatPhoneNumber(e.target.value) })}
                        className="bg-transparent font-bold text-slate-800 text-lg w-full outline-none"
                        maxLength={15}
                    />
                    <button onClick={() => onOpenWhatsApp && onOpenWhatsApp(data)} className="p-1.5 bg-green-500 text-white hover:bg-green-600 rounded shadow-sm border border-green-600 transition-colors" title="Abrir WhatsApp">
                        <Send size={16}/>
                    </button>
                </div>
            </div>

            {/* SENHA GOV.BR */}
            <div className={`p-3 rounded-lg border flex flex-col relative group transition-colors ${data.govPassword ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className={`text-[10px] font-bold uppercase mb-1 flex items-center gap-1 ${data.govPassword ? 'text-indigo-600' : 'text-slate-500'}`}>
                    <Key size={10}/> Senha Gov.br / Meu INSS
                </label>
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={data.govPassword || ''} 
                        onChange={(e) => onChange({ govPassword: e.target.value })}
                        className={`bg-transparent font-mono font-bold text-lg w-full outline-none ${data.govPassword ? 'text-indigo-800' : 'text-slate-400'}`}
                        placeholder="Não cadastrada"
                    />
                    {data.govPassword && (
                        <button onClick={() => copyToClipboard(data.govPassword, 'gov')} className="p-1.5 bg-white text-indigo-500 hover:text-indigo-700 rounded shadow-sm border border-indigo-100 transition-colors" title="Copiar Senha">
                            {copiedField === 'gov' ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* --- EXTENDED INFO --- */}
        {showExtendedInfo && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                 
                 {/* INDICAÇÃO & DOCS */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="relative group">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <Users size={12}/> Indicação (Referência)
                        </label>
                        <input 
                            type="text" 
                            value={data.referral || ''} 
                            onChange={(e) => onChange({ referral: e.target.value })}
                            className="w-full bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800 font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Ex: Dr. Carlos"
                            list="referral-options"
                        />
                        <datalist id="referral-options">
                            <option value="Dr. Carlos" />
                            <option value="Dr. Luciano" />
                            <option value="Dr. Sérgio" />
                            <option value="Cliente Antigo" />
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">RG (Identidade)</label>
                        <input 
                            type="text" 
                            value={data.rg || ''} 
                            onChange={(e) => onChange({ rg: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="00.000.000-0"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PIS / PASEP</label>
                        <input 
                            type="text" 
                            value={data.pis || ''} 
                            onChange={(e) => onChange({ pis: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="000.00000.00-0"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estado Civil</label>
                        <select 
                            value={data.maritalStatus || ''} 
                            onChange={(e) => onChange({ maritalStatus: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="">Selecione...</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado(a)">Casado(a)</option>
                            <option value="Divorciado(a)">Divorciado(a)</option>
                            <option value="Viúvo(a)">Viúvo(a)</option>
                            <option value="União Estável">União Estável</option>
                        </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome da Mãe</label>
                        <input 
                            type="text" 
                            value={data.motherName || ''} 
                            onChange={(e) => onChange({ motherName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Pai</label>
                        <input 
                            type="text" 
                            value={data.fatherName || ''} 
                            onChange={(e) => onChange({ fatherName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                 </div>

                 <div className="pt-2 border-t border-slate-100">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1 mt-2">
                         <MapPin size={12}/> Endereço Completo
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CEP (Busca Auto)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={data.addressZip || ''} 
                                    onChange={handleCepChange}
                                    className={`w-full bg-slate-50 border rounded p-2 text-sm text-slate-700 focus:ring-2 outline-none ${cepError ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'}`}
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                                {isLoadingCep ? (
                                    <div className="absolute right-2 top-2.5 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : cepError ? (
                                    <div className="absolute right-2 top-2.5" title="CEP não encontrado">
                                        <XCircle size={14} className="text-red-500" />
                                    </div>
                                ) : (
                                    <div className="absolute right-2 top-2 text-slate-300">
                                        <Search size={14} />
                                    </div>
                                )}
                            </div>
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cidade</label>
                            <input 
                                type="text" 
                                value={data.addressCity || ''} 
                                onChange={(e) => onChange({ addressCity: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">UF</label>
                            <input 
                                type="text" 
                                value={data.addressState || ''} 
                                onChange={(e) => onChange({ addressState: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                                maxLength={2}
                                placeholder="UF"
                            />
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                         <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Logradouro (Rua, Av.)</label>
                            <input 
                                type="text" 
                                value={data.addressStreet || ''} 
                                onChange={(e) => onChange({ addressStreet: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número</label>
                            <input 
                                type="text" 
                                value={data.addressNumber || ''} 
                                onChange={(e) => onChange({ addressNumber: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bairro</label>
                            <input 
                                type="text" 
                                value={data.addressNeighborhood || ''} 
                                onChange={(e) => onChange({ addressNeighborhood: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                         </div>
                     </div>
                 </div>
            </div>
        )}
    </div>
  );
};
