import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DiceRoller } from '../components/game/DiceRoller';
import { CharacterSheet } from '../components/game/CharacterSheet';
import { PartyView } from '../components/game/PartyView';
import { ChatSystem } from '../components/chat/ChatSystem';
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { Dices, Scroll, Users, Crown, Eye, Settings, Link2, Share2, Copy, Mail, ChevronRight, ChevronLeft } from 'lucide-react';
import { RoomSettings } from '../components/room/RoomSettings';
import { Modal } from '../components/Modal';

export const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dice' | 'char' | 'party'>('dice');
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null); // For DM view
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Layout State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
      navigator.clipboard.writeText(roomId!);
      alert('Oda kodu kopyalandı: ' + roomId);
  };

  const handleInviteByEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail.trim() || !user) return;

      try {
          const q = query(collection(db, 'artifacts', appId, 'users'), where('email', '==', inviteEmail));
          const snap = await getDocs(q);

          if (snap.empty) {
              alert('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
              return;
          }

          const targetUserDoc = snap.docs[0];
          const targetUserRef = doc(db, 'artifacts', appId, 'users', targetUserDoc.id);

          // Check if already in room
          if (roomData.members?.includes(targetUserDoc.id)) {
              alert('Kullanıcı zaten odada.');
              return;
          }

          // Add to target user's roomInvites
          const inviteData = {
              roomId: roomId,
              roomName: roomData.name,
              inviterName: user.displayName,
              timestamp: Date.now()
          };

          await updateDoc(targetUserRef, {
              roomInvites: arrayUnion(inviteData)
          });

          alert(`${inviteEmail} adresine davet gönderildi!`);
          setInviteEmail('');
          setShowInviteModal(false);
      } catch (e) {
          console.error(e);
          alert('Hata oluştu.');
      }
  };

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Game Area */}
      <div className="flex-1 flex flex-col min-w-0 relative transition-all duration-300">
       {/* Header */}
       <header className="bg-slate-800 p-3 shadow-md border-b border-slate-700 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-amber-500 truncate max-w-[150px] md:max-w-xs">{roomData.name}</span>

          {/* Room Code Display */}
          <div
            onClick={handleCopyCode}
            className="hidden md:flex items-center bg-slate-900/50 px-2 py-1 rounded border border-slate-700 text-xs text-slate-400 cursor-pointer hover:bg-slate-700 hover:text-white ml-4"
            title="Oda Kodunu Kopyala"
          >
             <span className="font-mono mr-2">ID: {roomId}</span>
             <Copy size={12} />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-400">
             <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                title="E-posta ile Davet Et"
            >
                <Mail size={18} />
            </button>

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

            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`ml-2 p-1 rounded border ${isChatOpen ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
            >
                {isChatOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
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
      </div>

      {/* Right Sidebar: Chat */}
      <div className={`${isChatOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-slate-700 bg-slate-900 overflow-hidden flex flex-col relative z-20`}>
          <ChatSystem roomId={roomId} isOverlay={false} />
      </div>

      {/* Modals */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Arkadaş Davet Et">
          <form onSubmit={handleInviteByEmail} className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Arkadaş E-posta</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                    placeholder="ornek@email.com"
                  />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded">
                  Davet Gönder
              </button>
          </form>
      </Modal>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
};
