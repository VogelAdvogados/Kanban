
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Copy, FileText, ChevronRight } from 'lucide-react';
import { Case, INSSAgency, WhatsAppTemplate } from '../types';
import { WHATSAPP_TEMPLATES as DEFAULT_TEMPLATES } from '../constants';
import { formatDate, getLocationAddress } from '../utils';

interface WhatsAppModalProps {
  data: Case;
  onClose: () => void;
  onLog?: (message: string) => void;
  agencies?: INSSAgency[]; // Pass Agencies List
  templates?: WhatsAppTemplate[]; // NEW PROP
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ 
    data, onClose, onLog, agencies = [], templates 
}) => {
  // Use passed templates or fallback to constants if not yet loaded
  const availableTemplates = templates && templates.length > 0 ? templates : DEFAULT_TEMPLATES;
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(availableTemplates[0]?.id || '');
  const [message, setMessage] = useState('');

  // Function to hydrate the template with case data
  const hydrateTemplate = (text: string) => {
    let docsList = 'documentos solicitados';
    if(data.missingDocs && data.missingDocs.length > 0) {
        // Format as bulleted list for WhatsApp
        docsList = '\n- ' + data.missingDocs.join('\n- ');
    }

    // Resolve Location Address Smartly (INSS or Court)
    const fullLocation = getLocationAddress(data.periciaLocation);

    return text
      .replace('{NOME}', data.clientName.split(' ')[0]) // Primeiro nome
      .replace('{ID_INTERNO}', data.internalId)
      .replace('{NB}', data.benefitNumber || 'não informado')
      .replace('{PROTOCOLO}', data.protocolNumber || 'não informado')
      .replace('{DATA_PERICIA}', formatDate(data.periciaDate) || 'não agendada')
      .replace('{LOCAL_PERICIA}', fullLocation)
      .replace('{DATA_DCB}', formatDate(data.dcbDate) || 'não informada')
      .replace('{LISTA_DOCS}', docsList);
  };

  useEffect(() => {
    const template = availableTemplates.find(t => t.id === selectedTemplateId);
    
    // Auto-select Pericia Template Logic
    if (data.periciaDate && !message) {
        let targetId = '';
        
        // 1. Judicial Expertise
        if (data.columnId === 'jud_pericia') {
            const judicialTpl = availableTemplates.find(t => t.id === 't_pericia_judicial');
            if (judicialTpl) targetId = judicialTpl.id;
        } 
        // 2. INSS Expertise
        else if (data.columnId === 'aux_pericia') {
            const inssTpl = availableTemplates.find(t => t.id === 't_pericia_inss') || availableTemplates.find(t => t.category === 'PERICIA');
            if (inssTpl) targetId = inssTpl.id;
        }

        if (targetId) {
            setSelectedTemplateId(targetId);
            const tpl = availableTemplates.find(t => t.id === targetId);
            if(tpl) setMessage(hydrateTemplate(tpl.text));
            return;
        }
    }

    if (template) {
        setMessage(hydrateTemplate(template.text));
    }
  }, [selectedTemplateId, data, agencies, availableTemplates]);

  const handleSend = () => {
    if (!data.phone) {
        alert("Cliente sem telefone cadastrado.");
        return;
    }
    const cleanPhone = data.phone.replace(/\D/g, '');
    const finalNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    
    // Encode and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${finalNumber}?text=${encodedMessage}`, '_blank');
    
    // Log Activity if callback provided
    if (onLog) {
        const template = availableTemplates.find(t => t.id === selectedTemplateId);
        const typeLabel = template ? template.label : 'Mensagem Personalizada';
        const shortMsg = message.length > 50 ? message.substring(0, 50) + '...' : message;
        
        // 360 Feature: Send structured log so History can detect and color it
        onLog(`[WHATSAPP] ${typeLabel}: "${shortMsg}"`);
    }

    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    alert("Mensagem copiada!");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row h-[500px]">
        
        {/* LEFT: Sidebar Templates */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={14}/> Modelos
            </h3>
            <div className="space-y-2">
                {availableTemplates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors border ${selectedTemplateId === t.id ? 'bg-green-50 border-green-200 text-green-800 font-bold shadow-sm' : 'bg-white border-transparent hover:bg-slate-100 text-slate-600'}`}
                    >
                        <div className="flex justify-between items-center">
                            <span>{t.label}</span>
                            {selectedTemplateId === t.id && <ChevronRight size={14}/>}
                        </div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold mt-1 block">{t.category}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* RIGHT: Editor */}
        <div className="flex-1 flex flex-col p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MessageCircle className="text-green-500" /> Enviar Mensagem
                    </h2>
                    <p className="text-sm text-slate-500">Para: {data.clientName} ({data.phone})</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-2 mb-4 focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-400 transition-all">
                <textarea 
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-700 text-sm resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                ></textarea>
            </div>

            <div className="flex justify-end gap-3">
                <button 
                    onClick={copyToClipboard}
                    className="px-4 py-2 text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 rounded flex items-center gap-2"
                >
                    <Copy size={16} /> Copiar Texto
                </button>
                <button 
                    onClick={handleSend}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Send size={16} /> Enviar WhatsApp
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
