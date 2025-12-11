
import React, { useRef } from 'react';
import { Download, FileText, Upload, AlertTriangle, Info } from 'lucide-react';
import { exportToCSV } from '../../utils';
import { Case, User, DocumentTemplate, SystemTag, OfficeData, SystemSettings } from '../../types';

interface BackupSettingsProps {
  allCases: Case[];
  users: User[];
  documentTemplates: DocumentTemplate[];
  systemTags: SystemTag[];
  officeData: OfficeData;
  systemSettings: SystemSettings;
  onImportData: (data: Case[]) => void;
  setUsers: (u: User[]) => void;
  setDocumentTemplates: (t: DocumentTemplate[]) => void;
  setSystemTags: (t: SystemTag[]) => void;
  setOfficeData: (d: OfficeData) => void;
  setSystemSettings: (s: SystemSettings) => void;
  currentUser?: User;
  addSystemLog?: (action: string, details: string, user: string, category: any) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onClose: () => void;
}

export const BackupSettings: React.FC<BackupSettingsProps> = ({ 
    allCases, users, documentTemplates, systemTags, officeData, systemSettings,
    onImportData, setUsers, setDocumentTemplates, setSystemTags, setOfficeData, setSystemSettings,
    currentUser, addSystemLog, showToast, onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
      const systemBackup = {
          version: '2.1',
          timestamp: new Date().toISOString(),
          officeData: officeData,
          settings: systemSettings,
          data: {
              cases: allCases,
              users: users,
              templates: documentTemplates,
              tags: systemTags
          }
      };

      const jsonString = JSON.stringify(systemBackup, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", `rambo_prev_FULL_BACKUP_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);
      URL.revokeObjectURL(url); // Clean up memory

      if (addSystemLog && currentUser) {
          addSystemLog('Backup Completo', 'Download de backup completo do sistema realizado.', currentUser.name, 'SECURITY');
      }
      showToast('Backup gerado com sucesso!', 'success');
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files && event.target.files[0];
      if (!fileObj) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const rawContent = e.target?.result as string;
              if (!rawContent) throw new Error("Arquivo vazio");

              const json = JSON.parse(rawContent);
              
              if (json.version && json.data) {
                  if (!Array.isArray(json.data.cases)) throw new Error("Formato de casos inválido");

                  if (confirm(`Backup encontrado de: ${new Date(json.timestamp).toLocaleString()}.\nDeseja restaurar TUDO (Casos, Usuários e Modelos)?`)) {
                      onImportData(json.data.cases || []);
                      if (Array.isArray(json.data.users)) setUsers(json.data.users);
                      if (Array.isArray(json.data.templates)) setDocumentTemplates(json.data.templates);
                      if (Array.isArray(json.data.tags)) setSystemTags(json.data.tags);
                      if (json.officeData) setOfficeData(json.officeData);
                      if (json.settings) setSystemSettings(json.settings);
                      
                      if (addSystemLog && currentUser) {
                          addSystemLog('Restauração de Backup', 'Backup completo restaurado.', currentUser.name, 'SECURITY');
                      }
                      
                      showToast('Sistema restaurado completamente!', 'success');
                      setTimeout(onClose, 1500);
                  }
              } else if (Array.isArray(json)) {
                  if (confirm('Este arquivo parece ser um backup antigo (apenas casos). Deseja importar?')) {
                      onImportData(json);
                      if (addSystemLog && currentUser) {
                          addSystemLog('Importação Legado', 'Importação de casos via JSON antigo.', currentUser.name, 'SECURITY');
                      }
                      showToast('Casos importados com sucesso!', 'success');
                      setTimeout(onClose, 1500);
                  }
              } else {
                  showToast('Arquivo desconhecido. Verifique se é um JSON válido.', 'error');
              }
          } catch (error) {
              console.error(error);
              showToast('Erro crítico: Arquivo corrompido ou inválido.', 'error');
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = "";
          }
      };
      reader.readAsText(fileObj);
  };

  const handleFactoryReset = () => {
      if (confirm('ATENÇÃO: Isso apagará TODOS os dados locais e restaurará o estado inicial de fábrica. Deseja continuar?')) {
          if (confirm('Tem certeza absoluta? Essa ação não pode ser desfeita.')) {
              localStorage.clear();
              window.location.reload();
          }
      }
  };

  return (
    <div className="space-y-8">
        <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Cópia de Segurança</h3>
            <p className="text-sm text-slate-500 mb-6">Exporte seus dados regularmente para evitar perdas.</p>

            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6">
                <h4 className="text-xs font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                    <Info size={14}/> Manual de Exportação: Qual escolher?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <strong className="block text-blue-900 mb-1">Backup Completo (.JSON)</strong>
                        <p className="text-slate-600 leading-relaxed">
                            Exporta <strong>TUDO</strong>: Processos, Clientes, Histórico, Usuários Cadastrados, Cores, Modelos e Configurações de Automação.
                            <br/><br/>
                            <em className="text-blue-600">Use este arquivo se precisar trocar de computador ou formatar a máquina. Ele restaura o escritório inteiro.</em>
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="block text-slate-800 mb-1">Relatório Simples (.CSV)</strong>
                        <p className="text-slate-600 leading-relaxed">
                            Exporta apenas uma tabela simples com dados básicos (Nome, CPF, Status) para ser aberta no <strong>Excel</strong>.
                            <br/><br/>
                            <em className="text-slate-500">Use este arquivo apenas para criar planilhas ou relatórios gerenciais externos. Não serve para restaurar o sistema.</em>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                        <Download size={20}/>
                    </div>
                    <h4 className="font-bold text-slate-700 mb-1">Backup Completo (.JSON)</h4>
                    <p className="text-xs text-slate-500 mb-4 h-10">Exporta Casos, Usuários e Configurações para restauração total.</p>
                    <button 
                        onClick={() => handleExportJSON()}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                    >
                        Baixar Backup Completo
                    </button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
                    <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
                        <FileText className="lucide" size={20}/> 
                    </div>
                    <h4 className="font-bold text-slate-700 mb-1">Relatório Excel (.CSV)</h4>
                    <p className="text-xs text-slate-500 mb-4 h-10">Exporta tabela simples para leitura em planilhas.</p>
                    <button 
                        onClick={() => exportToCSV(allCases)}
                        className="w-full py-2 bg-white border border-slate-300 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50"
                    >
                        Baixar Planilha
                    </button>
                </div>
            </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2">
                <Upload size={20} className="text-orange-500"/> Restaurar Dados
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
                <div className="flex gap-3">
                    <AlertTriangle className="text-orange-600 flex-shrink-0" size={24} />
                    <div>
                        <p className="text-sm text-orange-800 font-bold mb-1">Atenção: Ação Irreversível</p>
                        <p className="text-xs text-orange-700 mb-4">
                            Ao importar um backup JSON, os dados atuais serão <strong>substituídos</strong>. Certifique-se de que está carregando o arquivo correto.
                        </p>
                        <input 
                            type="file" 
                            accept=".json" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                        <button 
                            onClick={() => handleImportClick()}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm"
                        >
                            Selecionar Backup (.JSON) para Restaurar
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500">Reset de Fábrica</p>
                        <p className="text-xs text-slate-400">Apaga tudo e volta ao estado inicial.</p>
                    </div>
                    <button 
                        onClick={handleFactoryReset}
                        className="text-xs text-red-400 hover:text-red-600 underline"
                    >
                        Limpar Tudo
                    </button>
            </div>
        </div>
    </div>
  );
};
