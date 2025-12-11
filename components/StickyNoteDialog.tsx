
import React, { useState, useEffect } from 'react';
import { X, Trash2, User, Lock, Users, ChevronLeft, ChevronRight, Plus, Check, Save, Palette, Globe } from 'lucide-react';
import { StickyNote, User as UserType, StickyNoteColor } from '../types';

interface StickyNoteDialogProps {
  notes: StickyNote[];
  users: UserType[];
  currentUser: UserType;
  onSaveNotes: (updatedNotes: StickyNote[], logMessage: string) => void;
  onClose: () => void;
}

const COLORS: { id: StickyNoteColor, bg: string, shadow: string, text: string, placeholder: string }[] = [
    { id: 'YELLOW', bg: 'bg-[#fef08a]', shadow: 'shadow-yellow-200', text: 'text-yellow-950', placeholder: 'placeholder-yellow-800/30' },
    { id: 'RED', bg: 'bg-[#fecaca]', shadow: 'shadow-red-200', text: 'text-red-950', placeholder: 'placeholder-red-800/30' },
    { id: 'BLUE', bg: 'bg-[#bfdbfe]', shadow: 'shadow-blue-200', text: 'text-blue-950', placeholder: 'placeholder-blue-800/30' },
    { id: 'GREEN', bg: 'bg-[#bbf7d0]', shadow: 'shadow-green-200', text: 'text-green-950', placeholder: 'placeholder-green-800/30' },
];

export const StickyNoteDialog: React.FC<StickyNoteDialogProps> = ({ notes, users, currentUser, onSaveNotes, onClose }) => {
  // Filter visible notes immediately
  const [localNotes, setLocalNotes] = useState<StickyNote[]>(() => {
      const filtered = notes.filter(n => {
          if (!n.targetId) return true; // Public
          if (n.targetId === 'SELF') return n.authorId === currentUser.id; // Private
          return n.targetId === currentUser.id || n.authorId === currentUser.id; // Targeted
      });
      return filtered.length > 0 ? filtered : [{
          id: `sn_new_${Date.now()}`,
          text: '',
          color: 'YELLOW',
          authorId: currentUser.id,
          authorName: currentUser.name,
          targetId: null,
          createdAt: new Date().toISOString()
      }];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [showTargetMenu, setShowTargetMenu] = useState(false);

  const currentNote = localNotes[currentIndex];
  const theme = COLORS.find(c => c.id === currentNote.color) || COLORS[0];

  const handleUpdateCurrent = (updates: Partial<StickyNote>) => {
      const updatedList = [...localNotes];
      updatedList[currentIndex] = { ...updatedList[currentIndex], ...updates };
      setLocalNotes(updatedList);
      setIsDirty(true);
  };

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % localNotes.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + localNotes.length) % localNotes.length);

  const handleAddNew = () => {
      const newNote: StickyNote = {
          id: `sn_new_${Date.now()}`,
          text: '',
          color: 'YELLOW',
          authorId: currentUser.id,
          authorName: currentUser.name,
          targetId: null,
          createdAt: new Date().toISOString()
      };
      const newList = [...localNotes, newNote];
      setLocalNotes(newList);
      setCurrentIndex(newList.length - 1);
      setIsDirty(true);
  };

  const handleDeleteCurrent = () => {
      if (confirm("Rasgar e jogar fora esta nota?")) {
          const newList = localNotes.filter((_, i) => i !== currentIndex);
          if (newList.length === 0) {
              // If deleted last one, pass empty array to save and close
              onSaveNotes([], "Todas as notas removidas");
              onClose();
          } else {
              setLocalNotes(newList);
              setCurrentIndex(prev => (prev >= newList.length ? newList.length - 1 : prev));
              setIsDirty(true);
          }
      }
  };

  const handleSaveAndClose = () => {
      // Remove empty notes before saving
      const cleanNotes = localNotes.filter(n => n.text.trim() !== '');
      const hasChanges = JSON.stringify(cleanNotes) !== JSON.stringify(notes);
      
      if (hasChanges) {
          onSaveNotes(cleanNotes, cleanNotes.length > notes.length ? "Nota adicionada" : "Notas atualizadas");
      }
      onClose();
  };

  // Visibility Label Helper
  const getTargetLabel = () => {
      const tid = currentNote.targetId;
      if (!tid) return { label: 'Todos', icon: Globe, color: 'text-slate-400' };
      if (tid === 'SELF') return { label: 'Privado', icon: Lock, color: 'text-amber-500' };
      const u = users.find(x => x.id === tid);
      return { label: u?.name.split(' ')[0] || 'Colega', icon: User, color: 'text-blue-500' };
  };

  const TargetInfo = getTargetLabel();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        
        {/* Click outside to save & close */}
        <div className="absolute inset-0" onClick={handleSaveAndClose}></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl h-full pointer-events-none">
            
            {/* MAIN INTERFACE (Pointer events re-enabled) */}
            <div className="pointer-events-auto flex flex-col items-center gap-8 animate-in zoom-in-90 duration-300">
                
                {/* STACK INDICATOR / NAVIGATION */}
                <div className="flex items-center gap-4 text-white/50">
                    <button 
                        onClick={handlePrev} 
                        disabled={localNotes.length <= 1}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-0"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    
                    <div className="flex gap-1.5">
                        {localNotes.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleNext} 
                        disabled={localNotes.length <= 1}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-0"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>

                {/* THE NOTE */}
                <div className="relative group">
                    {/* Background Stack Visuals */}
                    {localNotes.length > 1 && (
                        <>
                            <div className="absolute top-0 left-2 right-[-2px] bottom-[-2px] bg-white/10 border border-white/20 rounded-sm rotate-2 shadow-sm pointer-events-none"></div>
                            <div className="absolute top-1 left-[-2px] right-2 bottom-[-1px] bg-white/5 border border-white/10 rounded-sm -rotate-1 shadow-sm pointer-events-none"></div>
                        </>
                    )}

                    <div className={`w-[340px] h-[340px] md:w-[420px] md:h-[420px] shadow-2xl transition-colors duration-500 relative flex flex-col ${theme.bg} rounded-sm`}>
                        
                        {/* Tape Visual */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-white/30 backdrop-blur-sm rotate-1 shadow-sm border-l border-r border-white/40 z-20"></div>

                        {/* Text Area */}
                        <textarea
                            autoFocus
                            value={currentNote.text}
                            onChange={(e) => handleUpdateCurrent({ text: e.target.value })}
                            placeholder="Escreva aqui..."
                            className={`w-full h-full bg-transparent border-none outline-none resize-none p-8 pt-10 text-2xl md:text-3xl font-medium leading-normal ${theme.text} ${theme.placeholder} font-serif`} // Using font-serif as a proxy for "handwriting" feel in standard stack
                            spellCheck={false}
                        />

                        {/* Footer Metadata on Note */}
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end opacity-40 pointer-events-none select-none">
                            <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <TargetInfo.icon size={10} /> {TargetInfo.label}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                                {currentNote.authorId === currentUser.id ? 'Eu' : currentNote.authorName.split(' ')[0]}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FLOATING TOOLBAR */}
                <div className="flex items-center gap-1 bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl text-white transform translate-y-0 hover:-translate-y-1 transition-transform duration-200">
                    
                    {/* Add New */}
                    <button onClick={handleAddNew} className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white" title="Nova Nota">
                        <Plus size={20} />
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-2"></div>

                    {/* Color Picker */}
                    <div className="flex gap-2 px-2">
                        {COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => handleUpdateCurrent({ color: c.id })}
                                className={`w-5 h-5 rounded-full border-2 transition-transform ${currentNote.color === c.id ? 'border-white scale-110' : 'border-transparent hover:scale-110'} ${c.bg}`}
                            />
                        ))}
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-2"></div>

                    {/* Target Toggle */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowTargetMenu(!showTargetMenu)} 
                            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors text-xs font-bold w-28 justify-center ${showTargetMenu ? 'bg-white/10' : ''}`}
                        >
                            <TargetInfo.icon size={14} className="text-white/70" />
                            <span className="truncate">{TargetInfo.label}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showTargetMenu && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
                                <div className="p-1 space-y-0.5">
                                    <button onClick={() => { handleUpdateCurrent({ targetId: null }); setShowTargetMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-xs flex items-center gap-2 text-slate-300">
                                        <Globe size={14} className="text-slate-400"/> Todos (Público)
                                    </button>
                                    <button onClick={() => { handleUpdateCurrent({ targetId: 'SELF' }); setShowTargetMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-xs flex items-center gap-2 text-slate-300">
                                        <Lock size={14} className="text-amber-500"/> Apenas Eu
                                    </button>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase">Colegas</div>
                                    {users.filter(u => u.id !== currentUser.id).map(u => (
                                        <button 
                                            key={u.id}
                                            onClick={() => { handleUpdateCurrent({ targetId: u.id }); setShowTargetMenu(false); }} 
                                            className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-xs flex items-center gap-2 text-slate-300"
                                        >
                                            <div className="w-4 h-4 rounded-full bg-slate-600 text-[8px] flex items-center justify-center text-white">{u.avatarInitials}</div>
                                            {u.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-2"></div>

                    {/* Delete */}
                    <button onClick={handleDeleteCurrent} className="p-3 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors" title="Excluir">
                        <Trash2 size={18} />
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-2"></div>

                    {/* Close/Save */}
                    <button onClick={handleSaveAndClose} className="p-3 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors font-bold flex items-center gap-2">
                        <Check size={18} />
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};
