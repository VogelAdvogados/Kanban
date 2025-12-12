
import React, { createContext, useContext, ReactNode } from 'react';
import { User, Case, SmartAction, StickyNote } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  // Actions
  openSchedule: (c: Case) => void;
  openWhatsApp: (c: Case) => void;
  openSmartAction: (c: Case, action: SmartAction) => void;
  openStickyNote: (c: Case, note?: StickyNote) => void;
  openQuickCheck: (c: Case) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode; value: AppContextType }> = ({ children, value }) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
