import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { History as HistoryIcon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { db, appId } from '../lib/firebase';
import { RollLog } from '../types';

interface DiceRollerProps {
    user: FirebaseUser | null;
    roomCode: string | null;
}

export const DiceRoller = ({ user, roomCode }: DiceRollerProps) => {
  const [history, setHistory] = useState<RollLog[]>([]);
  const [latestRoll, setLatestRoll] = useState<RollLog | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!roomCode) return;

    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RollLog));
      setHistory(rolls);
      if (rolls.length > 0) {
        const newest = rolls[0];
        if (!latestRoll || (newest.timestamp && latestRoll.timestamp && newest.timestamp.seconds !== latestRoll.timestamp.seconds)) {
          setLatestRoll(newest);
        } else if (!latestRoll) {
           setLatestRoll(newest);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  useEffect(() => {
    if (latestRoll) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [latestRoll]);

  const rollDice = async (sides: number) => {
    if (!user) return;
    const result = Math.floor(Math.random() * sides) + 1;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`), {
      playerName: user.displayName,
      uid: user.uid,
      sides: sides,
      result: result,
      timestamp: serverTimestamp(),
      type: 'dice'
    });
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
      <div className="flex-1 bg-slate-800 rounded-xl border-2 border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {latestRoll ? (
          <div className={`transform transition-all duration-700 ${animating ? 'scale-125 rotate-180 opacity-50' : 'scale-100 rotate-0 opacity-100'}`}>
            <div className={`
              w-32 h-32 flex items-center justify-center
              bg-gradient-to-br from-amber-500 to-amber-700
              rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)]
              border-4 border-amber-300
              text-6xl font-black text-white text-shadow
            `}>
              {latestRoll.type === 'spell' && latestRoll.damage ? latestRoll.damage : latestRoll.result}
            </div>
            <div className="text-center mt-4 text-amber-400 font-bold">
              {latestRoll.playerName}
              {latestRoll.type === 'attack' ? ` - Saldırı` : latestRoll.type === 'spell' ? ` - ${latestRoll.spellName}` : ` (d${latestRoll.sides})`}
            </div>
            {latestRoll.type === 'attack' && (
                <div className="text-center text-sm text-slate-300 mt-2 bg-slate-900/50 p-2 rounded">
                    {latestRoll.isCrit && <span className="text-red-500 font-bold animate-pulse">KRİTİK VURUŞ! </span>}
                    <span className="block">Hasar: {latestRoll.damage} ({latestRoll.damageType})</span>
                </div>
            )}
            {latestRoll.type === 'spell' && latestRoll.result === 'Büyü Yapıldı' && (
                <div className="text-center text-sm text-slate-300 mt-2">
                    {latestRoll.spellType === 'utility' ? 'İşlevsel Büyü' : 'Etki/Hasar uygulandı'}
                </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500">Zar bekleniyor...</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[4, 6, 8, 10, 12, 20].map(sides => (
          <button
            key={sides}
            onClick={() => rollDice(sides)}
            className="bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 text-white p-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2"
          >
            <span>d{sides}</span>
          </button>
        ))}
      </div>

      <div className="h-48 bg-slate-900 rounded-lg p-2 overflow-y-auto border border-slate-700">
        <div className="flex items-center text-xs text-slate-400 mb-2 px-1">
          <HistoryIcon className="w-3 h-3 mr-1" /> Son Atışlar
        </div>
        <div className="space-y-2">
          {history.map((roll) => (
            <div key={roll.id} className="flex flex-col bg-slate-800 p-2 rounded text-sm border border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">{roll.playerName}</span>
                <span className="text-slate-500 text-xs">
                    {roll.type === 'attack' ? 'Saldırı' : roll.type === 'spell' ? 'Büyü' : `d${roll.sides}`}
                </span>
              </div>
              {roll.type === 'attack' ? (
                  <div className="mt-1 text-xs grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-1 rounded text-center">
                          <div className="text-slate-500">Tutturma</div>
                          <div className={`font-bold ${roll.result === 20 ? 'text-green-400' : roll.result === 1 ? 'text-red-400' : 'text-white'}`}>
                              {roll.result} {roll.hitBonus && roll.hitBonus >= 0 ? `+${roll.hitBonus}` : roll.hitBonus} = <span className="text-amber-400">{(roll.result as number) + (roll.hitBonus || 0)}</span>
                          </div>
                      </div>
                      <div className="bg-slate-900 p-1 rounded text-center">
                          <div className="text-slate-500">Hasar</div>
                          <div className="font-bold text-red-400">{roll.damage}</div>
                      </div>
                  </div>
              ) : roll.type === 'spell' ? (
                  <div className="mt-1 text-xs">
                      <span className="text-purple-300 font-bold">{roll.spellName}</span>
                      {roll.damage && <span className="ml-2 text-red-300">Hasar: {roll.damage}</span>}
                  </div>
              ) : (
                  <div className="text-right font-bold text-amber-400">{roll.result}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
