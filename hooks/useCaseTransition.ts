
import { useState } from 'react';
import { Case, User, MandadoSeguranca } from '../types';
import { getLocalDateISOString } from '../utils';

export const useCaseTransition = (
    cases: Case[],
    users: User[],
    addCase: (c: Case, user: string) => Promise<void>,
    updateCase: (c: Case, log?: string, user?: string) => Promise<boolean>,
    finalizeMove: (c: Case, target: string, updates: any, log: string, user: string) => void,
    setCurrentView: (view: any) => void
) => {
    
    const executeTransition = async (
        transitionType: string,
        transitionData: any,
        pendingMove: { caseId: string, targetColId: string },
        currentUser: User | null
    ) => {
        const c = cases.find(x => x.id === pendingMove.caseId);
        if (!c || !currentUser) return;

        let updates: Partial<Case> = {}; 
        let log = 'Movimentação realizada.';

        // 1. RETORNO AO ADMINISTRATIVO (LOOP)
        if (transitionType === 'ADMIN_RETURN') {
            if (transitionData.returnMode === 'CLONE') {
                const cloneId = `c_new_${Date.now()}`; 
                const newInternalId = c.internalId.includes('-R') ? `${c.internalId}2` : `${c.internalId}-R`;
                
                const childCase: Case = { 
                    ...c, 
                    id: cloneId, 
                    internalId: newInternalId, 
                    parentCaseId: c.id, 
                    view: 'ADMIN', 
                    columnId: 'adm_triagem', 
                    createdAt: new Date().toISOString(), 
                    lastUpdate: new Date().toISOString(), 
                    protocolNumber: transitionData.protocolNumber, 
                    protocolDate: transitionData.protocolDate, 
                    benefitNumber: undefined, 
                    benefitDate: undefined, 
                    deadlineEnd: undefined, 
                    appealOrdinarioProtocol: undefined, 
                    appealEspecialProtocol: undefined, 
                    history: [{ 
                        id: `h_init_clone_${Date.now()}`, 
                        date: new Date().toISOString(), 
                        user: currentUser.name, 
                        action: 'Novo Requerimento', 
                        details: `Processo derivado de ${c.internalId}. Protocolo: ${transitionData.protocolNumber}` 
                    }] 
                };
                
                await addCase(childCase, currentUser.name); 
                setCurrentView('ADMIN'); 
                alert(`Novo processo administrativo criado com sucesso!\nProtocolo: ${transitionData.protocolNumber}`); 
                return; // Stop here, no move needed for original
            } else { 
                // Simple Move
                pendingMove.targetColId = 'adm_triagem'; 
                updates.view = 'ADMIN'; 
                log = 'Processo retornado para fase Administrativa (Triagem).'; 
            }
        }

        // 2. PENDÊNCIAS
        if (transitionType === 'PENDENCY') { 
            updates.missingDocs = transitionData.missingDocs; 
            log = `Pendências atualizadas. Itens: ${transitionData.missingDocs?.join(', ') || 'Nenhum'}`; 
            
            if (transitionData.missingDocs && transitionData.missingDocs.length > 0) { 
                const currentTags = c.tags || []; 
                if (!currentTags.includes('Falta Docs')) updates.tags = [...currentTags, 'Falta Docs']; 
            } 
        }

        // 3. PROTOCOLOS (INSS & JUDICIAL)
        if (transitionType === 'PROTOCOL_INSS') { 
            if (pendingMove.targetColId === 'jud_pericia' || pendingMove.targetColId === 'aux_pericia') { 
                updates.periciaDate = transitionData.periciaDate; 
                updates.periciaLocation = transitionData.periciaLocation; 
                log = `Perícia agendada para ${new Date(transitionData.periciaDate).toLocaleDateString()}.`; 
            } else { 
                updates.protocolNumber = transitionData.protocolNumber; 
                updates.protocolDate = transitionData.protocolDate; 
                log = `Protocolo registrado: ${transitionData.protocolNumber}`; 
            } 
        }

        // 4. RECURSOS
        if (transitionType === 'PROTOCOL_APPEAL') { 
            if (pendingMove.targetColId === 'rec_junta') { 
                updates.appealOrdinarioProtocol = transitionData.appealOrdinarioProtocol; 
                updates.appealOrdinarioDate = transitionData.appealOrdinarioDate; 
                updates.appealOrdinarioStatus = 'AGUARDANDO'; 
                log = 'Recurso Ordinário interposto.'; 
            } else if (pendingMove.targetColId === 'rec_camera') { 
                updates.appealEspecialProtocol = transitionData.appealEspecialProtocol; 
                updates.appealEspecialDate = transitionData.appealEspecialDate; 
                updates.appealEspecialStatus = 'AGUARDANDO'; 
                log = 'Recurso Especial interposto.'; 
            } 
        }

        if (transitionType === 'APPEAL_RETURN') { 
            updates.appealDecisionDate = transitionData.appealDecisionDate; 
            updates.appealOutcome = transitionData.appealOutcome as any; 
            log = `Retorno de Recurso. Resultado: ${transitionData.appealOutcome}`; 
        }

        // 5. PRAZOS
        if (transitionType === 'DEADLINE') { 
            updates.deadlineStart = transitionData.deadlineStart; 
            updates.deadlineEnd = transitionData.deadlineEnd; 
            updates.exigencyDetails = transitionData.exigencyDetails; 
            log = `Exigência aberta. Prazo fatal: ${new Date(transitionData.deadlineEnd).toLocaleDateString()}`; 
        }

        // 6. CONCLUSÃO / DECISÃO
        if(transitionType === 'CONCLUSION_NB') { 
            updates.benefitNumber = transitionData.benefitNumber; 
            updates.benefitDate = transitionData.benefitDate; 
            
            if (transitionData.outcome === 'PARTIAL') { 
                // SPLIT LOGIC
                pendingMove.targetColId = 'adm_pagamento'; 
                updates.dcbDate = transitionData.dcbDate; 
                updates.tags = [...(c.tags || []), 'PARCIALMENTE PROVIDO', 'A RECEBER']; 
                updates.urgency = 'HIGH'; 
                log = `Decisão INSS: PARCIALMENTE PROVIDO. NB: ${transitionData.benefitNumber}.`; 
                
                const childCase: Case = { 
                    ...c, 
                    id: `c_split_${Date.now()}`, 
                    internalId: c.internalId + 'R', 
                    parentCaseId: c.id, 
                    view: 'RECURSO_ADM', 
                    columnId: 'rec_triagem', 
                    createdAt: new Date().toISOString(), 
                    lastUpdate: new Date().toISOString(), 
                    deadlineStart: transitionData.benefitDate, 
                    deadlineEnd: transitionData.deadlineEnd, 
                    tags: ['RECURSO PARCIAL', 'INDEFERIDO'], 
                    benefitNumber: undefined, 
                    history: JSON.parse(JSON.stringify(c.history)), 
                    tasks: [{ id: `t_split_${Date.now()}`, text: 'Analisar parte indeferida', completed: false }], 
                    files: JSON.parse(JSON.stringify(c.files || [])) 
                }; 
                addCase(childCase, currentUser.name); 

            } else if (transitionData.outcome === 'GRANTED') { 
                updates.dcbDate = transitionData.dcbDate; 
                const newTags = (c.tags || []).filter(t => t !== 'INDEFERIDO'); 
                updates.tags = [...newTags, 'CONCEDIDO']; 
                if (pendingMove.targetColId === 'adm_pagamento') updates.tags.push('A RECEBER'); 
                log = `Concessão Registrada. NB: ${transitionData.benefitNumber}`; 

            } else if (transitionData.outcome === 'DENIED') { 
                updates.deadlineEnd = transitionData.deadlineEnd; 
                const newTags = (c.tags || []).filter(t => t !== 'CONCEDIDO'); 
                updates.tags = [...newTags, 'INDEFERIDO']; 
                log = `Indeferimento Registrado. Prazo Recursal: ${new Date(transitionData.deadlineEnd).toLocaleDateString()}`; 
            } 
        }

        // 7. MUDANÇA DE RESPONSÁVEL
        if (transitionData.newResponsibleId && transitionData.newResponsibleId !== c.responsibleId) { 
            const newResp = users.find(u => u.id === transitionData.newResponsibleId); 
            updates.responsibleId = transitionData.newResponsibleId; 
            updates.responsibleName = newResp?.name || 'Desconhecido'; 
            log += ` | Responsável alterado para ${updates.responsibleName}`; 
        }

        // 8. MS INCIDENTAL (TRIGGER AUTOMÁTICO)
        if (transitionType === 'PROTOCOL_INSS' && c.tags?.includes('MANDADO DE SEGURANÇA') && c.parentCaseId) { 
            const parentCase = cases.find(p => p.id === c.parentCaseId); 
            if (parentCase) { 
                const newMS: MandadoSeguranca = { 
                    id: `ms_${Date.now()}`, 
                    npu: transitionData.protocolNumber || 'N/A', 
                    filingDate: transitionData.protocolDate || new Date().toISOString(), 
                    status: 'AGUARDANDO', 
                    reason: 'DEMORA_ANALISE', 
                    notes: 'Sincronizado automaticamente do Processo Judicial (MS).' 
                }; 
                const updatedMSTags = (parentCase.tags || []).filter(t => t !== 'MS SOLICITADO'); 
                if(!updatedMSTags.includes('MS IMPETRADO')) updatedMSTags.push('MS IMPETRADO'); 
                if(!updatedMSTags.includes('COM MS')) updatedMSTags.push('COM MS'); 
                
                await updateCase({ 
                    ...parentCase, 
                    mandadosSeguranca: [...(parentCase.mandadosSeguranca || []), newMS], 
                    tags: updatedMSTags 
                }, `MS Protocolado Judicialmente. NPU: ${newMS.npu}`, 'Sistema (Sync)'); 
            } 
        }

        // FINALIZAR MOVIMENTO
        finalizeMove(c, pendingMove.targetColId, updates, log, currentUser.name);
    };

    return { executeTransition };
};
