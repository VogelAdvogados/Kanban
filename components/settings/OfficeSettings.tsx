
import React, { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { OfficeData } from '../../types';

interface OfficeSettingsProps {
  officeData: OfficeData;
  setOfficeData: (data: OfficeData) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const OfficeSettings: React.FC<OfficeSettingsProps> = ({ officeData, setOfficeData, showToast }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('A imagem é muito grande (Máx 2MB).', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        if (ev.target?.result) {
            setOfficeData({ ...officeData, logo: ev.target!.result as string });
            showToast('Logo carregada com sucesso!', 'success');
        }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
      setOfficeData({ ...officeData, logo: undefined });
  };

  return (
    <div className="space-y-6">
        
        {/* Logo Upload Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-6">
            <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative overflow-hidden group">
                {officeData.logo ? (
                    <img src={officeData.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => logoInputRef.current?.click()} className="text-white text-xs font-bold">Alterar</button>
                </div>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-700 mb-1">Logotipo do Escritório</h4>
                <p className="text-xs text-slate-500 mb-3">Carregue uma imagem (PNG/JPG) para usar nos documentos gerados.</p>
                <div className="flex gap-2">
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/png, image/jpeg" className="hidden" />
                    <button 
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        Carregar Imagem
                    </button>
                    {officeData.logo && (
                        <button 
                            onClick={handleRemoveLogo}
                            className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 font-bold"
                        >
                            Remover
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Escritório (Exibido no Cabeçalho)</label>
                    <input 
                        type="text" 
                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        value={officeData.name}
                        onChange={e => setOfficeData({...officeData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ</label>
                    <input 
                        type="text" 
                        placeholder="00.000.000/0001-00"
                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        value={officeData.cnpj || ''}
                        onChange={e => setOfficeData({...officeData, cnpj: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OAB / Registro</label>
                    <input 
                        type="text" 
                        placeholder="OAB/UF 00000"
                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        value={officeData.oab || ''}
                        onChange={e => setOfficeData({...officeData, oab: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                    <textarea 
                        rows={3}
                        placeholder="Rua Exemplo, 123, Bairro, Cidade - UF, CEP"
                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                        value={officeData.address || ''}
                        onChange={e => setOfficeData({...officeData, address: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / WhatsApp</label>
                    <input 
                        type="text" 
                        placeholder="(00) 00000-0000"
                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        value={officeData.phone || ''}
                        onChange={e => setOfficeData({...officeData, phone: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail de Contato</label>
                    <input 
                        type="email" 
                        placeholder="contato@advocacia.com.br"
                        className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        value={officeData.email || ''}
                        onChange={e => setOfficeData({...officeData, email: e.target.value})}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};
