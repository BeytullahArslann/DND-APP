import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { db, appId } from '../../lib/firebase';
import { RollLog } from '../../types';
import { DiceCanvas } from './dice3d/DiceCanvas';

interface DiceRollerProps {
    user: FirebaseUser | null;
    roomCode: string | null;
}

export const DiceRoller = ({ user, roomCode }: DiceRollerProps) => {
  // History State
  const [history, setHistory] = useState<RollLog[]>([]);

  // Selection State (e.g. { 20: 2, 6: 1 } means 2d20 + 1d6)
  const [selection, setSelection] = useState<Record<number, number>>({});

  // 3D Scene State
  const [activeDice, setActiveDice] = useState<{type: number, id: string}[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [resultState, setResultState] = useState<{ total: number, details: string } | null>(null);

  // Refs for unmount safety
  const isMounted = useRef(true);

  useEffect(() => {
      isMounted.current = true;
      return () => { isMounted.current = false; };
  }, []);

  // Fetch History
  useEffect(() => {
    if (!roomCode) return;

    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RollLog));
      if (isMounted.current) {
          setHistory(rolls);
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  const addToSelection = (sides: number) => {
    if (isRolling) {
        clearSelection();
    }
    setSelection(prev => ({
        ...prev,
        [sides]: (prev[sides] || 0) + 1
    }));
    setResultState(null);
  };

  const clearSelection = () => {
      setSelection({});
      setActiveDice([]);
      setResultState(null);
      setIsRolling(false);
  };

  const handleRoll = async () => {
    if (!user || Object.keys(selection).length === 0) return;

    setIsRolling(true);
    setResultState(null);

    // 1. Generate Dice for 3D view & Calculate Results locally
    const newDice: {type: number, id: string}[] = [];
    const results: {sides: number, result: number}[] = [];
    let total = 0;

    Object.entries(selection).forEach(([sidesStr, count]) => {
        const sides = parseInt(sidesStr);
        for (let i = 0; i < count; i++) {
            newDice.push({ type: sides, id: Math.random().toString(36).substr(2, 9) });
            const res = Math.floor(Math.random() * sides) + 1;
            results.push({ sides, result: res });
            total += res;
        }
    });

    // Update 3D view
    setActiveDice(newDice);

    // 2. Wait for animation (fake delay)
    setTimeout(async () => {
        if (!isMounted.current) return;

        const detailsStr = results.map(r => `d${r.sides}: ${r.result}`).join(', ');
        setResultState({ total, details: detailsStr });
        setIsRolling(false);

        // 3. Batch write to Firestore
        // We write each die individually to maintain history granularity compatible with existing types
        const promises = results.map(r =>
             addDoc(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`), {
              playerName: user.displayName,
              uid: user.uid,
              sides: r.sides,
              result: r.result,
              timestamp: serverTimestamp(),
              type: 'dice'
            })
        );

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error("Error saving rolls:", error);
        }

    }, 2500); // 2.5 seconds for dice to fall
  };

  const totalSelected = Object.values(selection).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full relative bg-slate-900">
      {/* 3D Area - Takes remaining space */}
      <div className="flex-1 relative bg-slate-800 overflow-hidden rounded-t-xl shadow-inner">
          {/* Result Overlay */}
          {resultState && (
               <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                   <div className="bg-black/70 p-6 rounded-2xl backdrop-blur-md animate-in fade-in zoom-in duration-300 text-center border-2 border-amber-500/50 shadow-2xl">
                       <div className="text-slate-200 text-lg font-bold mb-2 uppercase tracking-wider">Toplam</div>
                       <div className="text-7xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                           {resultState.total}
                       </div>
                       <div className="text-slate-400 text-xs mt-4 font-mono bg-black/50 p-2 rounded">
                           {resultState.details}
                       </div>
                   </div>
               </div>
          )}

          {/* The Canvas */}
          <div className="absolute inset-0">
             <DiceCanvas dice={activeDice} rolling={isRolling} />
          </div>

          {/* Hint if empty */}
          {activeDice.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none select-none">
                  <div className="text-center opacity-50">
                      <div className="text-6xl mb-4 animate-bounce">🎲</div>
                      <p className="text-xl font-light">Zar seç ve at</p>
                  </div>
              </div>
          )}
      </div>

      {/* Controls Area */}
      <div className="bg-slate-900 p-4 border-t border-slate-800 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {/* Selection Summary */}
          {totalSelected > 0 && (
              <div className="flex items-center justify-between mb-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <div className="flex flex-wrap gap-2">
                      {Object.entries(selection).map(([sides, count]) => count > 0 && (
                          <span key={sides} className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center border border-slate-600">
                              <span className="text-amber-500 mr-1">{count}</span>
                              <span>d{sides}</span>
                          </span>
                      ))}
                  </div>
                  <button onClick={clearSelection} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded transition-colors">
                      <Trash2 size={18} />
                  </button>
              </div>
          )}

          <div className="flex gap-2 items-stretch">
              {/* Dice Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-1">
                {[4, 6, 8, 10, 12, 20].map(sides => (
                  <button
                    key={sides}
                    onClick={() => addToSelection(sides)}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 text-slate-200 p-2 rounded-lg font-bold transition-all flex flex-col items-center justify-center group active:scale-95"
                  >
                    <span className="text-xs text-slate-500 group-hover:text-amber-500 uppercase tracking-tighter">d{sides}</span>
                    <span className="text-xl">{sides}</span>
                  </button>
                ))}
              </div>

              {/* Roll Button */}
              {totalSelected > 0 && (
                  <button
                    onClick={handleRoll}
                    disabled={isRolling}
                    className="bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white px-6 rounded-lg font-black text-xl shadow-lg shadow-amber-900/20 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex flex-col items-center justify-center"
                  >
                    {isRolling ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'AT'
                    )}
                  </button>
              )}
          </div>
      </div>

      {/* Recent History (Collapsible or Small) */}
      <div className="bg-slate-950 p-2 max-h-32 overflow-y-auto border-t border-slate-900">
         <div className="flex items-center text-xs text-slate-500 mb-2 sticky top-0 bg-slate-950 py-1 z-10">
             <HistoryIcon className="w-3 h-3 mr-1" /> Son Atışlar
         </div>
         <div className="space-y-1">
             {history.map((roll) => (
                 <div key={roll.id} className="flex justify-between items-center text-xs text-slate-400 px-2 py-1 hover:bg-slate-900 rounded transition-colors">
                     <span className="flex items-center">
                         <span className="font-medium text-slate-300 mr-2">{roll.playerName}</span>
                         <span className="text-slate-600">
                             {roll.type === 'spell' ? roll.spellName : `d${roll.sides}`}
                         </span>
                     </span>
                     <span className={`font-bold font-mono ${roll.type === 'dice' && roll.result === roll.sides ? 'text-green-500' : roll.type === 'dice' && roll.result === 1 ? 'text-red-500' : 'text-amber-500'}`}>
                        {roll.damage ? roll.damage : roll.result}
                     </span>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};
