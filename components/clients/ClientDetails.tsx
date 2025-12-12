
import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, MapPin, Save, Key, Eye, EyeOff, 
  CreditCard, LayoutGrid, ChevronRight, Briefcase, ExternalLink, 
  Check, Copy, Search, XCircle, MessageCircle, CalendarPlus
} from 'lucide-react';
import { Case } from '../../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../../constants';
import { formatDate, formatPhoneNumber } from '../../utils';
import { ClientGroup } from './ClientList';
import { useApp } from '../../contexts/AppContext';

interface ClientDetailsProps {
  client: ClientGroup;
  onClose: () => void;
  onUpdateClient: (cpf: string, data: Partial<Case>) => void;
  onSelectCase: (c: Case) => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onUpdateClient, onSelectCase }) => {
  const { openSchedule } = useApp(); // Using Global Context
  const [editForm, setEditForm] = useState<Partial<Case>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Reset form when client changes or deep data updates
  useEffect(() => {
    const source = client.latestCase;
    setEditForm({
        clientName: source.clientName,
        cpf: source.cpf,
        phone: source.phone,
        birthDate: source.birthDate,
        rg: source.rg,
        pis: source.pis,
        motherName: source.motherName,
        fatherName: source.fatherName,
        maritalStatus: source.maritalStatus,
        govPassword: source.govPassword,
        addressZip: source.addressZip,
        addressStreet: source.addressStreet,
        addressNumber: source.addressNumber,
        addressNeighborhood: source.addressNeighborhood,
        addressCity: source.addressCity,
        addressState: source.addressState,
        referral: source.referral, // Added referral
    });
    setHasChanges(false);
    setShowPassword(false);
  }, [client.key, client]); // Depend on client object to refresh on update

  const handleFormChange = (field: keyof Case, value: any) => {
      setEditForm(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 5) val = val.replace(/^(\d{5})(\d)/, '$1-$2');
      
      handleFormChange('addressZip', val);

      if (val.replace(/\D/g, '').length === 8) {
          setIsLoadingCep(true);
          setCepError(false);
          try {
              const res = await fetch(`https://viacep.com.br/ws/${val.replace(/\D/g, '')}/json/`);
              const data = await res.json();
              if (!data.erro) {
                  setEditForm(prev => ({
                      ...prev,
                      addressZip: val,
                      addressStreet: data.logradouro,
                      addressNeighborhood: data.bairro,
                      addressCity: data.localidade,
                      addressState: data.uf
                  }));
                  setHasChanges(true);
              } else {
                  setCepError(true);
              }
          } catch (error) {
              console.error("CEP Error", error);
              setCepError(true);
          } finally {
              setIsLoadingCep(false);
          }
      }
  };

  const handleSave = () => {
      if (editForm.clientName) {
          onUpdateClient(client.cpf, editForm);
          setHasChanges(false);
          alert('Dados do cliente atualizados com sucesso!');
      }
  };

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleWhatsApp = (phone: string, name: string) => {
      if (!phone) return;
      const num = phone.replace(/\D/g, '');
      const finalNum = num.length <= 11 ? `55${num}` : num;
      window.open(`https://wa.me/${finalNum}?text=Olá ${name.split(' ')[0]}, tudo bem?`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-4 min-w-0">
                <button onClick={onClose} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ChevronRight size={24} className="rotate-180"/>
                </button>

                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0">
                    {client.name.substring(0,2).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-slate-800 truncate">{client.name}</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 rounded text-slate-600">{client.cpf}</span>
                        <span>•</span>
                        <span>{client.activeCasesCount > 0 ? `${client.activeCasesCount} processos ativos` : 'Sem processos ativos'}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 pl-2">
                <button 
                    onClick={() => openSchedule(client.latestCase)}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm font-bold transition-colors"
                >
                    <CalendarPlus size={16}/> Agendar
                </button>
                {hasChanges && (
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 flex items-center gap-2 animate-in fade-in slide-in-from-right-2"
                    >
                        <Save size={16}/> <span className="hidden sm:inline">Salvar</span>
                    </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 md:hidden">
                    <X size={24}/>
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            
            {/* 1. QUICK ACCESS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* GOV.BR CARD */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <LayoutGrid size={12}/> Acesso Gov.br
                        </p>
                        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={editForm.govPassword || ''}
                                onChange={e => handleFormChange('govPassword', e.target.value)}
                                className="bg-transparent border-none text-lg font-bold outline-none w-full text-slate-800 placeholder-slate-300"
                                placeholder="Não cadastrada"
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-indigo-600 p-1">
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                        <div className="mt-2 flex justify-end">
                            <button 
                                onClick={() => copyToClipboard(editForm.govPassword, 'gov')}
                                className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                            >
                                {copiedField === 'gov' ? <Check size={12}/> : <Copy size={12}/>} Copiar Senha
                            </button>
                        </div>
                    </div>
                </div>

                {/* CPF CARD */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-400 transition-all">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <CreditCard size={12}/> CPF
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-mono font-bold text-slate-700 tracking-tight">{client.cpf}</span>
                            <button 
                                onClick={() => copyToClipboard(client.cpf, 'cpf')}
                                className={`p-2 rounded-lg transition-colors ${copiedField === 'cpf' ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                                {copiedField === 'cpf' ? <Check size={18}/> : <Copy size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PHONE CARD */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-400 transition-all">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <MessageCircle size={12}/> Contato Principal
                        </p>
                        <input 
                            value={editForm.phone || ''}
                            onChange={e => handleFormChange('phone', formatPhoneNumber(e.target.value))}
                            className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-green-400 text-xl font-bold outline-none w-full text-slate-800 placeholder-slate-300 transition-all py-1"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                        <div className="mt-2 flex gap-2">
                            {client.phone && (
                                <button 
                                    onClick={() => handleWhatsApp(client.phone, client.name)}
                                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                    <MessageCircle size={12}/> WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PERSONAL DATA & ADDRESS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Personal Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                        <User size={16} className="text-blue-500"/> Dados Pessoais
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.clientName || ''} onChange={e => handleFormChange('clientName', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Nascimento</label>
                            <input type="date" className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.birthDate || ''} onChange={e => handleFormChange('birthDate', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estado Civil</label>
                            <select className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                value={editForm.maritalStatus || ''} onChange={e => handleFormChange('maritalStatus', e.target.value)}>
                                <option value="">Selecione...</option>
                                <option value="Solteiro(a)">Solteiro(a)</option>
                                <option value="Casado(a)">Casado(a)</option>
                                <option value="Divorciado(a)">Divorciado(a)</option>
                                <option value="Viúvo(a)">Viúvo(a)</option>
                                <option value="União Estável">União Estável</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Indicação / Referência</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.referral || ''} onChange={e => handleFormChange('referral', e.target.value)} 
                                placeholder="Quem indicou este cliente?"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">RG</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.rg || ''} onChange={e => handleFormChange('rg', e.target.value)} placeholder="00.000.000-0" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PIS / PASEP</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.pis || ''} onChange={e => handleFormChange('pis', e.target.value)} placeholder="000.00000.00-0" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome da Mãe</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.motherName || ''} onChange={e => handleFormChange('motherName', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Pai</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.fatherName || ''} onChange={e => handleFormChange('fatherName', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Address Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                        <MapPin size={16} className="text-orange-500"/> Endereço Completo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CEP (Busca Auto)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={editForm.addressZip || ''} 
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
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cidade / UF</label>
                            <div className="flex gap-2">
                                <input className="flex-1 border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 text-slate-600"
                                    value={editForm.addressCity || ''} readOnly />
                                <input className="w-12 border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 text-slate-600 text-center"
                                    value={editForm.addressState || ''} readOnly />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Logradouro (Rua, Av.)</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.addressStreet || ''} onChange={e => handleFormChange('addressStreet', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.addressNumber || ''} onChange={e => handleFormChange('addressNumber', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bairro</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                value={editForm.addressNeighborhood || ''} onChange={e => handleFormChange('addressNeighborhood', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CASE TIMELINE */}
            <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={16}/> Processos do Cliente ({client.cases.length})
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                    {client.cases.map(c => {
                        const theme = VIEW_THEMES[c.view] || VIEW_THEMES.ADMIN;
                        const config = VIEW_CONFIG[c.view];
                        return (
                            <div 
                                key={c.id} 
                                onClick={() => { onClose(); onSelectCase(c); }}
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${theme.bgGradient.replace('from-', 'from-slate-400 ').replace('to-', 'to-slate-600 ')}`}></div>
                                
                                <div className="pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-wide flex items-center gap-1">
                                            {config.icon && <config.icon size={10}/>} {config.label}
                                        </span>
                                        <span className="text-xs font-mono text-slate-400">#{c.internalId}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                                        {c.columnId.replace(/_/g, ' ').toUpperCase()}
                                    </h4>
                                    {c.benefitNumber && <p className="text-xs text-emerald-600 font-medium mt-1">NB: {c.benefitNumber}</p>}
                                </div>

                                <div className="flex items-center gap-4 pr-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-slate-400 uppercase">Última Movimentação</p>
                                        <p className="text-xs font-bold text-slate-600">{formatDate(c.lastUpdate)}</p>
                                    </div>
                                    <button className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-full transition-colors">
                                        <ExternalLink size={18}/>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Spacer */}
            <div className="h-10"></div>
        </div>
    </div>
  );
};
