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

  // Selection State
  const [selection, setSelection] = useState<Record<number, number>>({});

  // 3D Scene State
  const [activeDice, setActiveDice] = useState<{type: number, id: string}[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [resultState, setResultState] = useState<{ total: number, details: string } | null>(null);

  // Refs
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

    // 1. Generate Dice for 3D view & Calculate Results
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

    setActiveDice(newDice);

    // 2. Wait for animation
    setTimeout(async () => {
        if (!isMounted.current) return;

        const detailsStr = results.map(r => `d${r.sides}: ${r.result}`).join(', ');
        setResultState({ total, details: detailsStr });
        setIsRolling(false);

        // 3. Batch write to Firestore
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

    }, 2000);
  };

  const totalSelected = Object.values(selection).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: '#EFEBE9' }}>

      {/* 3D Scene Area */}
      <div className="flex-1 relative overflow-hidden">
          {/* Top Overlay: Total Result - Wood Plank Style */}
          {resultState && (
               <div className="absolute top-8 left-0 right-0 z-10 flex flex-col items-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500">
                   <div
                        className="relative px-12 py-3 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform"
                        style={{
                            background: `linear-gradient(to bottom, #A1887F, #6D4C41, #5D4037)`,
                            borderRadius: '12px',
                            border: '4px solid #4E342E',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                   >
                       {/* Wood grain effect via CSS gradient or just color */}
                       <div className="text-amber-100 text-lg font-bold uppercase tracking-widest drop-shadow-md font-serif">
                           Toplam: {resultState.total}
                       </div>

                       {/* Nails */}
                       <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-stone-800 shadow-inner"></div>
                       <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-stone-800 shadow-inner"></div>
                       <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-stone-800 shadow-inner"></div>
                       <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-stone-800 shadow-inner"></div>
                   </div>

                   <div className="mt-2 px-4 py-1 bg-black/40 rounded-full text-white text-xs backdrop-blur-sm">
                       {resultState.details}
                   </div>
               </div>
          )}

          {/* Canvas */}
          <div className="absolute inset-0 z-0">
             <DiceCanvas dice={activeDice} rolling={isRolling} />
          </div>

          {/* Hint Overlay if empty */}
          {activeDice.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <div className="text-center opacity-30 text-stone-800">
                       <h2 className="text-2xl font-serif font-bold italic">Zarlarını Seç</h2>
                  </div>
              </div>
          )}
      </div>

      {/* Bottom Controls Area - "Rustic" Panel */}
      <div className="relative z-20 pb-6 pt-2 px-4 flex flex-col items-center gap-4 bg-gradient-to-t from-[#D7CCC8] to-transparent">

          {/* Selection List (Floating above buttons) */}
          {totalSelected > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in">
                  {Object.entries(selection).map(([sides, count]) => count > 0 && (
                      <div key={sides} className="bg-[#5D4037] text-[#EFEBE9] px-3 py-1 rounded shadow-md border border-[#3E2723] flex items-center gap-2 text-sm font-serif">
                          <span className="font-bold text-amber-400">{count}x</span> d{sides}
                      </div>
                  ))}
                  <button onClick={clearSelection} className="bg-red-900/80 hover:bg-red-800 text-white p-1 rounded shadow transition-colors border border-red-950">
                      <Trash2 size={16} />
                  </button>
              </div>
          )}

          <div className="flex flex-col items-center gap-6 w-full max-w-lg">

              {/* Roll Button - Big Wood Plank */}
              {totalSelected > 0 && (
                <button
                  onClick={handleRoll}
                  disabled={isRolling}
                  className="relative group w-64 h-16 flex items-center justify-center transform transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
                  style={{
                      background: `linear-gradient(to bottom, #8D6E63, #5D4037, #4E342E)`,
                      borderRadius: '50px', // More rounded like a lozenge or plank
                      border: '3px solid #3E2723',
                      boxShadow: '0 8px 0 #271c19, 0 15px 20px rgba(0,0,0,0.4)'
                  }}
                >
                    <span className="text-2xl font-black text-[#FFECB3] tracking-widest drop-shadow-md font-serif group-hover:text-white transition-colors">
                        {isRolling ? '...' : 'ZAR AT!'}
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                </button>
              )}

              {/* Dice Selection Bar */}
              <div className="flex gap-2 p-2 bg-[#8D6E63]/20 backdrop-blur-sm rounded-full border border-[#8D6E63]/30 shadow-inner">
                {[4, 6, 8, 10, 12, 20].map(sides => (
                  <button
                    key={sides}
                    onClick={() => addToSelection(sides)}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[#EFEBE9] hover:bg-white text-[#5D4037] font-bold border-2 border-[#8D6E63] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all active:translate-y-0"
                  >
                    <span className="text-sm sm:text-base font-serif">d{sides}</span>
                  </button>
                ))}
              </div>
          </div>
      </div>
    </div>
  );
};
