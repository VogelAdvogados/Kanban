
import React from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectCase: (caseId: string) => void;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, onMarkAsRead, onMarkAllAsRead, onSelectCase, onClose 
}) => {
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper for relative time
  const timeAgo = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Agora mesmo';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`;
      return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
  };

  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'WARNING': return <AlertTriangle size={16} className="text-orange-500" />;
          case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
          case 'ALERT': return <Clock size={16} className="text-red-500" />;
          default: return <Info size={16} className="text-blue-500" />;
      }
  };

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-[90] overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-500" />
                <h3 className="font-bold text-slate-700 text-sm">Notificações</h3>
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}
            </div>
            <div className="flex gap-2">
                {unreadCount > 0 && (
                    <button onClick={onMarkAllAsRead} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                        Ler tudo
                    </button>
                )}
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                </button>
            </div>
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto custom-scroll">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                    <Bell size={32} className="mb-2 opacity-20" />
                    <p className="text-xs">Nenhuma notificação recente.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => {
                                if (n.caseId) {
                                    onSelectCase(n.caseId);
                                    onClose();
                                }
                                if (!n.isRead) onMarkAsRead(n.id);
                            }}
                            className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-white shadow-sm border border-slate-200' : 'bg-slate-100'}`}>
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${!n.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                        {n.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                        {timeAgo(n.timestamp)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                    {n.description}
                                </p>
                            </div>
                            {!n.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
