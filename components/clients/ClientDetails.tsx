
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, User, Phone, MapPin, Save, Key, Eye, EyeOff, 
  CreditCard, LayoutGrid, ChevronRight, Briefcase, ExternalLink, 
  Check, Copy, Search, XCircle, MessageCircle, CalendarPlus,
  FileText, Clock, Paperclip, Send, FolderOpen, History
} from 'lucide-react';
import { Case, User as UserType } from '../../types';
import { VIEW_CONFIG, VIEW_THEMES } from '../../constants';
import { formatDate, formatPhoneNumber, formatBytes, getClientAvatarColor } from '../../utils';
import { ClientGroup } from './ClientList';
import { useApp } from '../../contexts/AppContext';

interface ClientDetailsProps {
  client: ClientGroup;
  onClose: () => void;
  onUpdateClient: (cpf: string, data: Partial<Case>) => void;
  onSelectCase: (c: Case) => void;
  updateCase?: (updatedCase: Case, logMessage?: string, userName?: string) => Promise<boolean>;
  currentUser?: UserType;
}

type TabType = 'OVERVIEW' | 'CASES' | 'DOCS' | 'HISTORY';

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onUpdateClient, onSelectCase, updateCase, currentUser }) => {
  const { openSchedule, openWhatsApp, openDocumentGenerator } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [editForm, setEditForm] = useState<Partial<Case>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // 1. Reset form ONLY when client KEY changes (Fixes typing reset bug)
  useEffect(() => {
    const source = client.latestCase;
    setEditForm({
        clientName: source.clientName,
        cpf: source.cpf,
        phone: source.phone,
        sex: source.sex,
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
        referral: source.referral,
    });
    setHasChanges(false);
    setShowPassword(false);
    setActiveTab('OVERVIEW');
    setNewNote('');
  }, [client.key]); // Dependency fixed: Only re-run if client ID changes, not on every prop update.

  // 2. Aggregate Data for Tabs
  const allFiles = useMemo(() => {
      return client.cases.flatMap(c => 
          (c.files || []).map(f => ({ ...f, caseContext: c }))
      ).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [client.cases]);

  const allHistory = useMemo(() => {
      return client.cases.flatMap(c => 
          c.history.map(h => ({ ...h, caseContext: c }))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [client.cases]);

  // --- Handlers ---

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

  const handleAddNote = async () => {
      if (!newNote.trim() || !updateCase || !currentUser) return;
      
      const targetCase = client.latestCase;
      const historyItem = {
          id: `h_client_note_${Date.now()}`,
          date: new Date().toISOString(),
          user: currentUser.name,
          action: 'Nota no Cadastro',
          details: newNote
      };
      
      const updatedCase = {
          ...targetCase,
          history: [...targetCase.history, historyItem]
      };

      const success = await updateCase(updatedCase, '', currentUser.name);
      if (success) {
          setNewNote('');
      } else {
          alert("Erro ao salvar nota.");
      }
  };

  const copyToClipboard = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleWhatsApp = () => {
      if (!client.phone) return;
      openWhatsApp(client.latestCase);
  };

  const avatarColorClass = getClientAvatarColor(client.latestCase.sex);

  return (
    <div className="flex flex-col h-full bg-slate-50">
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-6 pt-4 pb-0 flex-shrink-0 z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 min-w-0">
                    <button onClick={onClose} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ChevronRight size={24} className="rotate-180"/>
                    </button>

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0 ${avatarColorClass}`}>
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
                    <button 
                        onClick={() => openDocumentGenerator(client.latestCase)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-bold transition-colors"
                    >
                        <FileText size={16}/> Docs
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

            {/* TABS */}
            <div className="flex gap-6 text-sm font-bold text-slate-500 mt-2">
                <button 
                    onClick={() => setActiveTab('OVERVIEW')} 
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'OVERVIEW' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-700'}`}
                >
                    <User size={16}/> Visão Geral
                </button>
                <button 
                    onClick={() => setActiveTab('CASES')} 
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CASES' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-700'}`}
                >
                    <Briefcase size={16}/> Processos
                </button>
                <button 
                    onClick={() => setActiveTab('DOCS')} 
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'DOCS' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-700'}`}
                >
                    <FolderOpen size={16}/> Documentos ({allFiles.length})
                </button>
                <button 
                    onClick={() => setActiveTab('HISTORY')} 
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'HISTORY' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-700'}`}
                >
                    <History size={16}/> Histórico & Notas
                </button>
            </div>
        </div>

        {/* CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            
            {/* 1. VISÃO GERAL */}
            {activeTab === 'OVERVIEW' && (
                <>
                    {/* QUICK ACCESS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            onClick={handleWhatsApp}
                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <MessageCircle size={12}/> WhatsApp
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PERSONAL DATA & ADDRESS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                                        value={editForm.birthDate ? editForm.birthDate.split('T')[0] : ''} onChange={e => handleFormChange('birthDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sexo</label>
                                    <select className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                        value={editForm.sex || ''} onChange={e => handleFormChange('sex', e.target.value)}>
                                        <option value="">Selecione...</option>
                                        <option value="MALE">Masculino</option>
                                        <option value="FEMALE">Feminino</option>
                                    </select>
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
                </>
            )}

            {/* 2. PROCESSOS */}
            {activeTab === 'CASES' && (
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
            )}

            {/* 3. DOCUMENTOS UNIFICADOS */}
            {activeTab === 'DOCS' && (
                <div className="space-y-4">
                    {allFiles.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <FolderOpen size={48} className="mx-auto mb-2 opacity-20"/>
                            <p>Nenhum documento encontrado nos processos deste cliente.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {allFiles.map(file => (
                                <div key={file.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3 hover:border-blue-300 transition-colors">
                                    <div className="bg-blue-50 p-2 rounded text-blue-600 flex-shrink-0">
                                        <Paperclip size={18}/>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-700 truncate" title={file.name}>{file.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {formatBytes(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                                        </p>
                                        <div 
                                            onClick={() => { onClose(); onSelectCase(file.caseContext); }}
                                            className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-1 cursor-pointer hover:bg-blue-100 truncate max-w-full"
                                        >
                                            Em: {file.caseContext.columnId.replace(/_/g, ' ')} (#{file.caseContext.internalId})
                                        </div>
                                    </div>
                                    <a 
                                        href={file.url} 
                                        download={file.name}
                                        className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <ExternalLink size={14}/>
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 4. HISTÓRICO & NOTAS */}
            {activeTab === 'HISTORY' && (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {allHistory.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 text-sm">Sem histórico.</div>
                        ) : (
                            <div className="relative pl-6 space-y-6">
                                <div className="absolute left-2.5 top-2 bottom-0 w-px bg-slate-200"></div>
                                {allHistory.map(h => (
                                    <div key={`${h.id}_${h.caseContext.id}`} className="relative">
                                        <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-slate-700">{h.action}</span>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                    {new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-xs leading-relaxed mb-2">{h.details}</p>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-bold text-slate-400 uppercase">{h.user}</span>
                                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                    Ref: Processo #{h.caseContext.internalId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ADD NOTE SECTION */}
                    {updateCase && (
                        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                <FileText size={12}/> Adicionar Nota ao Processo Recente
                            </h4>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="Escreva uma observação..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                />
                                <button 
                                    onClick={handleAddNote}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    disabled={!newNote.trim()}
                                >
                                    <Send size={18}/>
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 ml-1">
                                A nota será salva no processo: <strong>#{client.latestCase.internalId} - {client.latestCase.columnId}</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Spacer */}
            <div className="h-10"></div>
        </div>
    </div>
  );
};
