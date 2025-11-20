import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { Users, Sword, Skull, Edit3 } from 'lucide-react';
import { db, appId } from '../lib/firebase';
import { PlayerPresence } from '../types';

interface PartyViewProps {
    roomCode: string | null;
    currentUserUid: string;
    role: string;
    onSelectPlayer: (uid: string) => void;
    selectedPlayerId: string | null;
}

export const PartyView = ({ roomCode, currentUserUid, role, onSelectPlayer, selectedPlayerId }: PartyViewProps) => {
  const [players, setPlayers] = useState<PlayerPresence[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    const presenceRef = doc(db, 'artifacts', appId, 'public', 'data', 'presence', roomCode);
    const unsubscribe = onSnapshot(presenceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.players) {
            setPlayers(Object.values(data.players));
        }
      }
    });
    return () => unsubscribe();
  }, [roomCode]);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2" /> Maceracılar
      </h2>

      <div className="grid gap-4">
        {players.length === 0 ? (
          <p className="text-slate-500 text-center">Henüz kimse görünmüyor...</p>
        ) : (
          players.map(p => (
            <div
                key={p.uid}
                onClick={() => role === 'dm' && onSelectPlayer(p.uid)}
                className={`bg-slate-800 p-4 rounded-xl border shadow-lg flex items-center transition-all
                    ${p.uid === selectedPlayerId ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-700'}
                    ${role === 'dm' ? 'cursor-pointer hover:bg-slate-750' : ''}
                `}
            >
              <div className="bg-slate-700 p-3 rounded-full mr-4 relative">
                <Sword className="w-6 h-6 text-slate-300" />
                {p.hp <= 0 && (
                  <div className="absolute inset-0 bg-red-900/80 rounded-full flex items-center justify-center">
                    <Skull className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-white text-lg">{p.name}</h3>
                  <span className="text-xs text-slate-400">Lvl {p.level} {p.class}</span>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>HP</span>
                    <span className={p.hp < p.maxHp / 2 ? 'text-red-400' : 'text-green-400'}>{p.hp}/{p.maxHp}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${p.hp <= 0 ? 'bg-slate-600' : 'bg-green-600'}`}
                      style={{ width: `${(p.hp / (p.maxHp || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {role === 'dm' && (
                    <div className="mt-2 text-[10px] text-amber-500 flex items-center justify-end">
                        <Edit3 className="w-3 h-3 mr-1"/> Düzenlemek için tıkla
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
