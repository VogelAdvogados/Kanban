
import { useMemo } from 'react';
import { Case, User } from '../types';
import { getDaysSince, getDaysDiff, analyzeCaseHealth, parseLocalYMD } from '../utils';

export const useDashboardStats = (cases: Case[], users: User[]) => {
  return useMemo(() => {
    const total = cases.length;
    
    // Arrays for DrillDown
    const concededCases = cases.filter(c => ['adm_concluido', 'aux_ativo', 'jud_transito', 'jud_cumprimento', 'jud_rpv'].includes(c.columnId));
    const deniedCases = cases.filter(c => ['aux_indeferido', 'rec_resultado'].includes(c.columnId));
    
    const rate = (concededCases.length + deniedCases.length) > 0 
        ? Math.round((concededCases.length / (concededCases.length + deniedCases.length)) * 100) 
        : 0;

    // Health Analysis Lists
    const criticalHealthCases: Case[] = [];
    const warningHealthCases: Case[] = [];
    const criticalContactCases: Case[] = [];

    const defaultSettings = {
        sla_internal_analysis: 7,
        sla_client_contact: 30,
        sla_stagnation: 45,
        sla_spider_web: 45,
        sla_mandado_seguranca: 120,
        pp_alert_days: 15,
        show_probabilities: true
    };

    cases.forEach(c => {
        const analysis = analyzeCaseHealth(c, defaultSettings);
        if (analysis.status === 'CRITICAL') criticalHealthCases.push(c);
        if (analysis.status === 'WARNING') warningHealthCases.push(c);
        if (analysis.contactStatus === 'CRITICAL') criticalContactCases.push(c);
    });

    // Workload Lists
    const workloadMap: Record<string, { count: number, cases: Case[] }> = {};
    cases.forEach(c => {
        const user = users.find(u => u.id === c.responsibleId);
        const rawName = user ? user.name : (c.responsibleName || 'Desconhecido');
        const safeName = typeof rawName === 'string' ? rawName : 'Desconhecido';
        
        const parts = safeName.trim().split(' ');
        const displayName = parts.length > 0 ? (parts[0] + (parts.length > 1 ? ' ' + parts[1][0] + '.' : '')) : 'N/A';
        
        if (!workloadMap[displayName]) workloadMap[displayName] = { count: 0, cases: [] };
        workloadMap[displayName].count++;
        workloadMap[displayName].cases.push(c);
    });
    const workload = Object.entries(workloadMap).sort((a, b) => b[1].count - a[1].count);

    // View Lists
    const viewMap: Record<string, { count: number, cases: Case[] }> = {};
    cases.forEach(c => {
        if (!viewMap[c.view]) viewMap[c.view] = { count: 0, cases: [] };
        viewMap[c.view].count++;
        viewMap[c.view].cases.push(c);
    });

    const stagnatedCases = cases.filter(c => {
        const days = getDaysSince(c.lastUpdate);
        return days !== null && days > 90;
    }).sort((a, b) => (getDaysSince(b.lastUpdate) || 0) - (getDaysSince(a.lastUpdate) || 0));

    const upcomingDeadlines = cases.filter(c => {
        const diff = getDaysDiff(c.deadlineEnd);
        return diff !== null && diff >= 0 && diff <= 7;
    }).sort((a, b) => (getDaysDiff(a.deadlineEnd) || 0) - (getDaysDiff(b.deadlineEnd) || 0));

    const today = new Date();
    const uniqueClients = new Map();
    cases.forEach(c => {
        if(c.birthDate && !uniqueClients.has(c.cpf)) {
            uniqueClients.set(c.cpf, c);
        }
    });
    
    const birthdaysToday = Array.from(uniqueClients.values()).filter(c => {
        const bdate = parseLocalYMD(c.birthDate);
        if(!bdate) return false;
        return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
    });

    return { 
        total, rate, birthdaysToday, workload, viewMap, stagnatedCases, upcomingDeadlines, 
        concededCases, deniedCases,
        criticalHealthCases, warningHealthCases, criticalContactCases,
        stagnatedCount: stagnatedCases.length, 
        upcomingDeadlinesCount: upcomingDeadlines.length,
        healthCritical: criticalHealthCases.length, 
        healthWarning: warningHealthCases.length, 
        contactCritical: criticalContactCases.length
    };
  }, [cases, users]);
};
