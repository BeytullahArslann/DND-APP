import React, { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import {
  Users,
  Sword,
  Skull,
  Edit3
} from 'lucide-react';
import { db, appId } from '../../lib/firebase';

interface PartyViewProps {
  roomCode: string;
  currentUserUid: string;
  role: string;
  onSelectPlayer: (uid: string) => void;
  selectedPlayerId: string | null;
}

export const PartyView = ({ roomCode, currentUserUid, role, onSelectPlayer, selectedPlayerId }: PartyViewProps) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Listen to Room Members to get list of UIDs
  useEffect(() => {
      if (!roomCode) return;
      const roomRef = doc(db, 'artifacts', appId, 'rooms', roomCode);
      const unsubscribe = onSnapshot(roomRef, async (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              const memberUids = data.members || [];

              // Fetch profiles
              const memberPromises = memberUids.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
              const memberSnaps = await Promise.all(memberPromises);
              const memberList = memberSnaps.map(snap => {
                  if (snap.exists()) {
                      return { uid: snap.id, ...snap.data() };
                  }
                  return { uid: snap.id, displayName: 'Bilinmeyen Oyuncu' };
              });
              setMembers(memberList);
          }
      });
      return () => unsubscribe();
  }, [roomCode]);

  // Listen to Presence for Stats (HP etc)
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

  // Merge data
  const mergedPlayers = members.map(m => {
      const presence = players.find(p => p.uid === m.uid) || {};
      return { ...m, ...presence };
  });

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2" /> Maceracılar
      </h2>

      <div className="grid gap-4">
        {mergedPlayers.length === 0 ? (
          <p className="text-slate-500 text-center">Henüz kimse görünmüyor...</p>
        ) : (
          mergedPlayers.map(p => (
            <div
                key={p.uid}
                onClick={() => role === 'dm' && onSelectPlayer(p.uid)}
                className={`bg-slate-800 p-4 rounded-xl border shadow-lg flex items-center transition-all
                    ${p.uid === selectedPlayerId ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-700'}
                    ${role === 'dm' ? 'cursor-pointer hover:bg-slate-750' : ''}
                `}
            >
              <div className="bg-slate-700 p-3 rounded-full mr-4 relative flex-shrink-0">
                 {p.photoURL ? (
                     <img src={p.photoURL} className="w-12 h-12 rounded-full object-cover" alt={p.displayName} />
                 ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                         <Sword className="w-6 h-6 text-slate-300" />
                    </div>
                 )}
                {(p.hp !== undefined && p.hp <= 0) && (
                  <div className="absolute inset-0 bg-red-900/80 rounded-full flex items-center justify-center">
                    <Skull className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-white text-lg truncate pr-2">{p.displayName || 'Bilinmeyen'}</h3>
                  <span className="text-xs text-slate-400 flex-shrink-0">{p.level ? `Lvl ${p.level}` : ''} {p.class || ''}</span>
                </div>

                {p.maxHp ? (
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
                ) : (
                    <div className="mt-2 text-xs text-slate-500 italic">Karakter sayfası yok</div>
                )}

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
