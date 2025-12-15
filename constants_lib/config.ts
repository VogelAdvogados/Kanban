
import { AppTheme, UserPermission, WorkflowRule } from '../types';

export const USER_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
];

export const ROLE_PERMISSIONS: Record<string, UserPermission[]> = {
    'ADMIN': ['MANAGE_SETTINGS', 'MANAGE_USERS', 'VIEW_LOGS', 'DELETE_CASE', 'EDIT_CASE', 'VIEW_FINANCIAL', 'EXPORT_DATA'],
    'LAWYER': ['EDIT_CASE', 'VIEW_FINANCIAL', 'EXPORT_DATA'],
    'SECRETARY': ['EDIT_CASE'],
    'FINANCIAL': ['VIEW_FINANCIAL', 'EXPORT_DATA']
};

export const APP_THEMES: AppTheme[] = [
    // --- CLASSIC & CORPORATE ---
    { 
        id: 'default', label: 'Rambo Clássico', previewColor: '#1e3a8a', 
        bgClass: 'bg-[#f0f2f5]', 
        headerTop: 'bg-white border-b border-slate-200', 
        headerBottom: 'bg-[#1e3a8a] shadow-md', 
        headerText: 'text-slate-800', 
        searchBg: 'bg-slate-100 border-transparent text-slate-700', 
        menuHover: 'hover:bg-slate-50'
    },
    { 
        id: 'dark', label: 'Modo Escuro', previewColor: '#0f172a', 
        bgClass: 'bg-slate-900', 
        headerTop: 'bg-slate-800', headerBottom: 'bg-slate-900', 
        headerText: 'text-white', searchBg: 'bg-slate-700 border-slate-600', menuHover: 'hover:bg-slate-700'
    },
    { 
        id: 'minimal', label: 'Minimalista (Clean)', previewColor: '#f8fafc', 
        bgClass: 'bg-white', 
        headerTop: 'bg-white', headerBottom: 'bg-white border-b border-slate-100', 
        headerText: 'text-slate-900', searchBg: 'bg-white border-slate-200', menuHover: 'hover:bg-slate-50'
    },
    // --- MASCULINE / SOBRIETY ---
    { 
        id: 'midnight', label: 'Midnight Blue', previewColor: '#1e1b4b', 
        bgClass: 'from-slate-200 to-slate-300', 
        headerTop: 'bg-[#1e1b4b]', headerBottom: 'bg-[#312e81]', 
        headerText: 'text-white', searchBg: 'bg-indigo-900/50 border-indigo-800', menuHover: 'hover:bg-indigo-800'
    },
    { 
        id: 'gunmetal', label: 'Cinza Executivo', previewColor: '#334155', 
        bgClass: 'from-gray-100 to-gray-200', 
        headerTop: 'bg-[#334155]', headerBottom: 'bg-[#475569]', 
        headerText: 'text-white', searchBg: 'bg-slate-600/50 border-slate-500', menuHover: 'hover:bg-slate-600'
    },
    { 
        id: 'forest', label: 'Floresta Profunda', previewColor: '#064e3b', 
        bgClass: 'from-green-50 to-green-100', 
        headerTop: 'bg-[#064e3b]', headerBottom: 'bg-[#065f46]', 
        headerText: 'text-white', searchBg: 'bg-emerald-800/50 border-emerald-700', menuHover: 'hover:bg-emerald-800'
    },
    // --- FEMININE / SOFT ---
    { 
        id: 'rose', label: 'Rose Gold', previewColor: '#fff1f2', 
        bgClass: 'from-rose-50 to-rose-100', 
        headerTop: 'bg-[#fff1f2]', headerBottom: 'bg-white', 
        headerText: 'text-rose-900', searchBg: 'bg-white border-rose-200', menuHover: 'hover:bg-rose-100'
    },
    { 
        id: 'lavender', label: 'Lavanda Suave', previewColor: '#f3e8ff', 
        bgClass: 'from-purple-50 to-purple-100', 
        headerTop: 'bg-[#f3e8ff]', headerBottom: 'bg-white', 
        headerText: 'text-purple-900', searchBg: 'bg-white border-purple-200', menuHover: 'hover:bg-purple-100'
    },
    { 
        id: 'mint', label: 'Menta Fresca', previewColor: '#ecfdf5', 
        bgClass: 'from-emerald-50 to-emerald-100', 
        headerTop: 'bg-[#ecfdf5]', headerBottom: 'bg-white', 
        headerText: 'text-emerald-900', searchBg: 'bg-white border-emerald-200', menuHover: 'hover:bg-emerald-100'
    },
    // --- VIBRANT / MODERN ---
    { 
        id: 'ocean', label: 'Oceano Vibrante', previewColor: '#0ea5e9', 
        bgClass: 'from-sky-50 to-sky-100', 
        headerTop: 'bg-gradient-to-r from-cyan-500 to-blue-600', headerBottom: 'bg-white', 
        headerText: 'text-white', searchBg: 'bg-white/20 border-white/30 placeholder-white/70', menuHover: 'hover:bg-white/20'
    },
    { 
        id: 'sunset', label: 'Pôr do Sol', previewColor: '#f97316', 
        bgClass: 'from-orange-50 to-amber-50', 
        headerTop: 'bg-gradient-to-r from-orange-500 to-red-500', headerBottom: 'bg-white', 
        headerText: 'text-white', searchBg: 'bg-white/20 border-white/30 placeholder-white/70', menuHover: 'hover:bg-white/20'
    },
    { 
        id: 'royal', label: 'Royal Gold', previewColor: '#171717', 
        bgClass: 'from-stone-100 to-stone-200', 
        headerTop: 'bg-[#1c1917]', headerBottom: 'bg-[#292524]', 
        headerText: 'text-[#fbbf24]', searchBg: 'bg-stone-800 border-stone-700 text-stone-200', menuHover: 'hover:bg-stone-800'
    },
];

export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [];
export const SUGGESTED_ACTIONS = [];
export const SMART_ACTIONS_CONFIG = [];
