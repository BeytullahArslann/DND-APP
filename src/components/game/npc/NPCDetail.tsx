import React, { useState } from 'react';
import { NPC, NPCNote } from '../../../types';
import { User, Shield, Globe, Lock, Send, ArrowLeft, Trash2, Edit } from 'lucide-react';

interface NPCDetailProps {
  npc: NPC;
  currentUserUid: string;
  isDM: boolean;
  notes: NPCNote[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddNote: (content: string, isPublic: boolean) => void;
}

export const NPCDetail: React.FC<NPCDetailProps> = ({
  npc,
  currentUserUid,
  isDM,
  notes,
  onClose,
  onEdit,
  onDelete,
  onAddNote
}) => {
  const [newNote, setNewNote] = useState('');
  const [noteIsPublic, setNoteIsPublic] = useState(false);

  // Filter notes based on permissions
  const visibleNotes = notes.filter(note => {
    if (note.isPublic) return true; // Everyone sees public notes
    if (note.authorId === currentUserUid) return true; // Author sees own notes
    return false;
  }).sort((a, b) => b.timestamp - a.timestamp); // Newest first

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote, noteIsPublic);
    setNewNote('');
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-900 overflow-hidden">
      {/* Left: NPC Profile (Image & Stats) */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-800 border-r border-slate-700 flex flex-col overflow-y-auto">
        <div className="p-4">
          <button
            onClick={onClose}
            className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Geri Dön
          </button>

          <div className="relative aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-600 mb-4 shadow-xl">
            {npc.imageUrl ? (
              <img src={npc.imageUrl} alt={npc.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={64} className="text-slate-600" />
              </div>
            )}

            {npc.isPrivate && (
              <div className="absolute top-2 right-2 bg-amber-900/80 text-amber-200 text-xs px-2 py-1 rounded border border-amber-700 backdrop-blur-sm flex items-center">
                <Lock size={12} className="mr-1" />
                Gizli
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{npc.name}</h2>

          <div className="space-y-3 text-sm text-slate-300 mb-6">
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-500">Yaş</span>
              <span>{npc.age || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-500">Boy / Kilo</span>
              <span>{npc.height || '-'} / {npc.weight || '-'}</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">Görünüm</span>
              <p className="leading-relaxed">{npc.appearance || '-'}</p>
            </div>
          </div>

          {isDM && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition-colors"
              >
                <Edit size={16} /> Düzenle
              </button>
              <button
                onClick={() => {
                   if(confirm('Bu NPC\'yi silmek istediğinize emin misiniz?')) onDelete();
                }}
                className="flex items-center justify-center p-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded transition-colors border border-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Description & Notes */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center">
              <span className="w-1 h-6 bg-indigo-500 rounded mr-2"></span>
              Karakter Hikayesi / Tarifi
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg text-slate-300 leading-relaxed border border-slate-700/50 min-h-[100px] whitespace-pre-wrap">
              {npc.description || 'Açıklama girilmemiş.'}
            </div>
          </section>

          {/* Notes Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-1 h-6 bg-emerald-500 rounded mr-2"></span>
                Notlar
              </div>
              <span className="text-xs font-normal text-slate-500">
                {visibleNotes.length} not bulundu
              </span>
            </h3>

            <div className="space-y-3 mb-4">
              {visibleNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-600 italic border border-dashed border-slate-800 rounded-lg">
                  Henüz not eklenmemiş.
                </div>
              ) : (
                visibleNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg border ${
                      note.isPublic
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-indigo-950/20 border-indigo-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                         <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                           note.isPublic ? 'bg-slate-700 text-slate-300' : 'bg-indigo-900 text-indigo-300'
                         }`}>
                           {note.isPublic ? 'Herkese Açık' : 'Gizli Not'}
                         </span>
                         <span className="text-xs text-slate-500">
                            {new Date(note.timestamp).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Note Input Area */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <form onSubmit={handleAddNote} className="flex flex-col gap-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Bu NPC hakkında not al..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none resize-none h-20"
            />
            <div className="flex justify-between items-center">
              {isDM ? (
                 <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-slate-700 transition-colors">
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${noteIsPublic ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${noteIsPublic ? 'left-6' : 'left-1'}`}></div>
                      <input
                        type="checkbox"
                        checked={noteIsPublic}
                        onChange={(e) => setNoteIsPublic(e.target.checked)}
                        className="hidden"
                      />
                   </div>
                   <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                     {noteIsPublic ? <Globe size={12}/> : <Shield size={12}/>}
                     {noteIsPublic ? 'Herkese Görünür' : 'Sadece Bana Görünür'}
                   </span>
                 </label>
              ) : (
                <div className="flex items-center text-xs text-slate-500 px-2">
                  <Shield size={12} className="mr-1" />
                  Sadece sen görebilirsin
                </div>
              )}

              <button
                type="submit"
                disabled={!newNote.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <Send size={16} /> Not Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
