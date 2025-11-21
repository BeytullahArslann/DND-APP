import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Trash2, Sword, Sparkles } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { db, appId } from '../../lib/firebase';
import { RollLog } from '../../types';
import { DiceCanvas } from './dice3d/DiceCanvas';

interface DiceRollerProps {
    user: FirebaseUser | null;
    roomCode: string | null;
}

export const DiceRoller = ({ user, roomCode }: DiceRollerProps) => {
  // State
  const [history, setHistory] = useState<RollLog[]>([]);
  const [selection, setSelection] = useState<Record<number, number>>({});
  const [activeDice, setActiveDice] = useState<{type: number, id: string}[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [resultState, setResultState] = useState<{ total: number, details: string } | null>(null);

  // New state for physics-based results
  const [pendingResults, setPendingResults] = useState<Record<string, number>>({});

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
      limit(30)
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
    if (isRolling) return; // Prevent changing selection while rolling

    setSelection(prev => ({
        ...prev,
        [sides]: (prev[sides] || 0) + 1
    }));
  };

  const clearSelection = () => {
      if (isRolling) return;
      setSelection({});
      setResultState(null);
  };

  // Callback from Die component when it settles
  const handleDieSettled = (id: string, result: number) => {
      setPendingResults(prev => {
          const newState = { ...prev, [id]: result };
          return newState;
      });
  };

  // Monitor pending results to finalize roll
  useEffect(() => {
      if (!isRolling || activeDice.length === 0) return;

      const allSettled = activeDice.every(d => pendingResults[d.id] !== undefined);

      if (allSettled) {
          // All dice have reported!
          finalizeRoll();
      }
  }, [pendingResults, isRolling, activeDice]);


  const finalizeRoll = async () => {
      if (!user || !roomCode) return;

      const results = activeDice.map(d => ({
          sides: d.type,
          result: pendingResults[d.id]
      }));

      const total = results.reduce((a, b) => a + b.result, 0);
      const detailsStr = results.map(r => `d${r.sides}: ${r.result}`).join(', ');

      setResultState({ total, details: detailsStr });
      setIsRolling(false);

      // Batch write to Firestore
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

      setSelection({}); // Clear selection

      try {
          await Promise.all(promises);
      } catch (error) {
          console.error("Error saving rolls:", error);
      }
  };

  const handleRoll = () => {
    if (!user || Object.keys(selection).length === 0 || isRolling) return;

    setIsRolling(true);
    setResultState(null);
    setPendingResults({});
    setActiveDice([]); // Reset to respawn

    // Slight delay to allow unmount/remount of dice if needed, or just state update
    setTimeout(() => {
        const newDice: {type: number, id: string}[] = [];
        Object.entries(selection).forEach(([sidesStr, count]) => {
            const sides = parseInt(sidesStr);
            for (let i = 0; i < count; i++) {
                newDice.push({ type: sides, id: Math.random().toString(36).substr(2, 9) });
            }
        });
        setActiveDice(newDice);
    }, 50);
  };

  const totalSelected = Object.values(selection).reduce((a, b) => a + b, 0);

  const renderHistoryItem = (roll: RollLog) => {
      if (roll.type === 'attack') {
          return (
              <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                      <Sword size={14} className="text-red-400" />
                      <span className="font-bold text-[#EFEBE9] text-sm">{roll.weapon || 'Attack'}</span>
                      {roll.isCrit && <span className="text-yellow-400 text-xs font-black animate-pulse">CRIT!</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#A1887F]">Hit: <span className="text-white font-bold">{roll.result}</span></span>
                      {roll.damage !== undefined && (
                          <span className="text-red-300">Dmg: <span className="text-red-400 font-bold">{roll.damage}</span> {roll.damageType}</span>
                      )}
                  </div>
              </div>
          );
      }
      if (roll.type === 'spell') {
           return (
              <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-400" />
                      <span className="font-bold text-[#EFEBE9] text-sm">{roll.spellName || 'Spell'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                      {roll.damage !== undefined && (
                           <span className="text-blue-300">Dmg: <span className="text-blue-400 font-bold">{roll.damage}</span></span>
                      )}
                      {roll.result && <span className="text-[#A1887F]">Result: {roll.result}</span>}
                  </div>
              </div>
          );
      }
      // Default dice
      return (
        <div className="flex-1 flex items-center gap-2">
            <div className="bg-[#3E2723] px-2 py-0.5 rounded text-xs text-[#FFECB3] font-bold border border-[#5D4037]">
                d{roll.sides || '?'}
            </div>
            <div className="text-[#8D6E63] text-xs">attı ve</div>
            <div className="text-lg font-bold text-white drop-shadow-md">
                {roll.result}
            </div>
            <div className="text-[#8D6E63] text-xs">geldi.</div>
        </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEBE9] font-serif relative">

      {/* 1. Top Area: 3D Tray */}
      <div className="flex-1 relative min-h-[40%] w-full">

          {/* Total Result Sign */}
          <div className="absolute top-6 left-0 right-0 z-10 flex justify-center pointer-events-none">
             <div className={`transition-all duration-500 transform ${resultState ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
                 <div
                    className="relative px-16 py-4 bg-gradient-to-b from-[#8D6E63] to-[#4E342E] border-4 border-[#3E2723] rounded-lg shadow-2xl text-[#FFECB3] text-3xl font-black tracking-widest"
                    style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                 >
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay pointer-events-none"></div>
                     {resultState ? `TOPLAM: ${resultState.total}` : ''}
                     <div className="absolute top-2 left-2 w-3 h-3 bg-[#271c19] rounded-full shadow-inner border border-[#5D4037]"></div>
                     <div className="absolute top-2 right-2 w-3 h-3 bg-[#271c19] rounded-full shadow-inner border border-[#5D4037]"></div>
                     <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#271c19] rounded-full shadow-inner border border-[#5D4037]"></div>
                     <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#271c19] rounded-full shadow-inner border border-[#5D4037]"></div>
                 </div>
             </div>
          </div>

          <DiceCanvas
            dice={activeDice}
            rolling={isRolling}
            onDieSettled={handleDieSettled}
          />
      </div>

      {/* 2. Middle Area: Selection & Controls */}
      <div className="flex-shrink-0 z-20 bg-[#D7CCC8] shadow-lg border-t-4 border-[#8D6E63] relative">
           <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

           <div className="max-w-4xl mx-auto p-4 flex flex-col items-center gap-4">

               {/* Staging Area */}
               <div className="h-12 flex items-center justify-center w-full">
                   {totalSelected > 0 ? (
                       <div className="flex items-center gap-3 bg-[#5D4037] text-[#FFECB3] px-6 py-2 rounded-full shadow-inner border border-[#3E2723] animate-in fade-in slide-in-from-bottom-2">
                           {Object.entries(selection).map(([sides, count]) => (
                               <div key={sides} className="flex items-center gap-1 font-bold text-lg">
                                   <span className="text-amber-500">{count}x</span>
                                   <span className="text-sm uppercase tracking-wider">d{sides}</span>
                               </div>
                           ))}
                           <div className="w-[1px] h-6 bg-[#8D6E63] mx-2"></div>
                           <button
                             onClick={clearSelection}
                             className="text-red-300 hover:text-red-100 transition-colors p-1"
                           >
                               <Trash2 size={20} />
                           </button>
                       </div>
                   ) : (
                       <span className="text-[#8D6E63] italic font-medium">Zar seçmek için aşağıya tıkla...</span>
                   )}
               </div>

               {/* Controls */}
               <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">

                   {/* Dice Buttons */}
                   <div className="flex gap-2 p-2 bg-[#A1887F] rounded-xl shadow-inner border border-[#5D4037]">
                       {[4, 6, 8, 10, 12, 20].map(sides => (
                           <button
                               key={sides}
                               onClick={() => addToSelection(sides)}
                               className="w-12 h-12 flex flex-col items-center justify-center rounded bg-[#EFEBE9] text-[#4E342E] font-black border-b-4 border-[#8D6E63] active:border-b-0 active:translate-y-1 transition-all hover:bg-white shadow-sm"
                           >
                               <span className="text-xs text-[#8D6E63] font-medium">d</span>
                               <span className="text-lg leading-none">{sides}</span>
                           </button>
                       ))}
                   </div>

                   {/* ROLL BUTTON */}
                   <button
                       onClick={handleRoll}
                       disabled={totalSelected === 0 || isRolling}
                       className={`
                           relative w-48 h-16 flex items-center justify-center
                           text-2xl font-black tracking-widest text-[#FFECB3]
                           transition-all duration-100
                           ${totalSelected > 0 && !isRolling
                               ? 'hover:scale-105 active:scale-95 cursor-pointer'
                               : 'opacity-50 cursor-not-allowed grayscale'}
                       `}
                       style={{
                           background: 'linear-gradient(180deg, #8D6E63 0%, #5D4037 100%)',
                           borderRadius: '8px',
                           border: '2px solid #3E2723',
                           boxShadow: totalSelected > 0 && !isRolling ? '0 6px 0 #271c19, 0 10px 10px rgba(0,0,0,0.3)' : 'none',
                           transform: totalSelected > 0 && !isRolling ? 'translateY(0)' : 'translateY(6px)'
                       }}
                   >
                       {isRolling ? (
                         <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FFECB3]"></div>
                            <span className="text-lg">Oynanıyor...</span>
                         </div>
                       ) : (
                         <>
                           ZAR AT!
                           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded"></div>
                         </>
                       )}
                   </button>
               </div>
           </div>
      </div>

      {/* 3. Bottom Area: History */}
      <div className="h-48 bg-[#3E2723] text-[#D7CCC8] flex flex-col border-t-4 border-[#271c19]">
          <div className="px-4 py-2 bg-[#271c19] text-xs uppercase tracking-widest font-bold text-[#A1887F] shadow-md z-10">
              Zar Geçmişi
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {history.length === 0 && (
                  <div className="text-center text-[#8D6E63] py-4 italic opacity-50">Henüz zar atılmadı.</div>
              )}
              {history.map((roll) => (
                  <div key={roll.id} className="flex items-center gap-3 bg-[#4E342E] p-2 rounded border border-[#5D4037] shadow-sm animate-in slide-in-from-left-2 fade-in duration-300">
                      {/* Time */}
                      <div className="text-[10px] text-[#A1887F] w-12 text-right">
                          {roll.timestamp?.toDate ? roll.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                      </div>

                      {/* User */}
                      <div className="font-bold text-[#EFEBE9] text-sm w-24 truncate">
                          {roll.playerName}
                      </div>

                      {renderHistoryItem(roll)}
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};
