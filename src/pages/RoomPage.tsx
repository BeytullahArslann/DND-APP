import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DiceRoller } from '../components/game/DiceRoller';
import { CharacterSheet } from '../components/game/CharacterSheet';
import { PartyView } from '../components/game/PartyView';
import {
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { Dices, Scroll, Users, Crown, Eye, Settings, Link2, Share2 } from 'lucide-react';
import { RoomSettings } from '../components/room/RoomSettings';

export const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dice' | 'char' | 'party'>('dice');
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null); // For DM view
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!roomId || !user) return;

    const roomRef = doc(db, 'artifacts', appId, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setRoomData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setRoomData(null); // Room deleted or doesn't exist
      }
      setLoading(false);
    });

    // By default select own character if player
    setSelectedPlayerId(user.uid);

    return () => unsubscribe();
  }, [roomId, user]);

  if (loading) return <div className="p-8 text-slate-500">Oda yükleniyor...</div>;

  if (!roomData) return <div className="p-8 text-red-500">Oda bulunamadı veya silinmiş.</div>;

  // Check Access
  const isMember = roomData.members?.includes(user?.uid);
  if (!isMember) {
      return <Navigate to="/" replace />;
  }

  const userRole = roomData.roles?.[user!.uid] || 'spectator';
  const isDM = userRole === 'dm';

  const handleDMSelectPlayer = (uid: string) => {
    setSelectedPlayerId(uid);
    setActiveTab('char');
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden relative">
       {/* Header */}
       <header className="bg-slate-800 p-3 shadow-md border-b border-slate-700 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-amber-500 truncate max-w-[150px] md:max-w-xs">{roomData.name}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
            <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                title="Davet Linkini Kopyala"
            >
                {copiedLink ? <span className="text-green-400 text-xs font-bold">Kopyalandı!</span> : <Share2 size={18} />}
            </button>

            {isDM && (
                <>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-slate-700 rounded text-amber-500 hover:text-amber-300 transition-colors relative"
                        title="Oda Ayarları"
                    >
                        <Settings size={18} />
                        {roomData.pendingRequests?.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>
                    <span className="flex items-center text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50"><Crown className="w-3 h-3 mr-1"/> DM</span>
                </>
            )}
            {userRole === 'spectator' && <span className="flex items-center text-blue-400"><Eye className="w-3 h-3 mr-1"/> İzleyici</span>}
        </div>
      </header>

      {isDM && (
          <RoomSettings
            roomData={roomData}
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dice' && <DiceRoller user={user} roomCode={roomId!} />}

        {activeTab === 'char' && userRole !== 'spectator' && (
            <CharacterSheet
                user={user}
                roomCode={roomId!}
                targetUid={selectedPlayerId}
                isDM={isDM}
            />
        )}

        {activeTab === 'party' && (
            <PartyView
                roomCode={roomId!}
                currentUserUid={user!.uid}
                role={userRole}
                onSelectPlayer={handleDMSelectPlayer}
                selectedPlayerId={selectedPlayerId}
            />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-slate-800 border-t border-slate-700 p-2 pb-safe z-20">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {userRole !== 'spectator' && (
              <button
                onClick={() => setActiveTab('char')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors w-16 ${activeTab === 'char' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Scroll className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{isDM ? 'Düzenle' : 'Karakter'}</span>
              </button>
          )}

          <button
            onClick={() => setActiveTab('dice')}
            className={`flex flex-col items-center justify-center p-2 transition-all transform -translate-y-5 bg-slate-800 border-4 border-slate-900 shadow-lg rounded-full w-16 h-16 ${activeTab === 'dice' ? 'text-amber-500 ring-2 ring-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
          >
            <Dices className={`w-8 h-8 ${activeTab === 'dice' ? 'animate-spin-slow' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('party')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors w-16 ${activeTab === 'party' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Parti</span>
          </button>
        </div>
      </nav>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
};
