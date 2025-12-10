import React from 'react';
import { NPC } from '../../../types';
import { User } from 'lucide-react';

interface NPCListProps {
  npcs: NPC[];
  onSelect: (npc: NPC) => void;
  onAdd?: () => void;
  canCreate: boolean;
}

export const NPCList: React.FC<NPCListProps> = ({ npcs, onSelect, onAdd, canCreate }) => {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-full">
      {canCreate && (
        <button
          onClick={onAdd}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-indigo-500 hover:bg-slate-800 transition-colors aspect-[3/4]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-2">
            <span className="text-2xl text-slate-300">+</span>
          </div>
          <span className="text-slate-400 font-medium">Yeni NPC</span>
        </button>
      )}

      {npcs.map((npc) => (
        <div
          key={npc.id}
          onClick={() => onSelect(npc)}
          className="relative group cursor-pointer bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all shadow-lg aspect-[3/4]"
        >
          {npc.imageUrl ? (
            <img
              src={npc.imageUrl}
              alt={npc.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <User size={48} className="text-slate-500" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
            <h3 className="text-white font-bold truncate">{npc.name}</h3>
            {npc.isPrivate && (
              <span className="text-xs text-amber-400 font-medium bg-amber-900/50 px-2 py-0.5 rounded border border-amber-800 inline-block mt-1">
                Gizli (Private)
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
