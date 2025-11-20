import React, { useState, useEffect, useMemo } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { Scroll, Users, Dices, Link2, Crown, Eye } from 'lucide-react';
import { auth, initialAuthToken, usingDemoConfig, firebaseConfigIssue } from './lib/firebase';
import { Lobby } from './components/Lobby';
import { DiceRoller } from './components/DiceRoller';
import { CharacterSheet } from './components/CharacterSheet';
import { PartyView } from './components/PartyView';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dice');
  const [role, setRole] = useState('player'); // Varsayılan
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null); // DM için seçili oyuncu
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const firebaseUnavailableMessage = firebaseConfigIssue || 'Firebase yapılandırması doğrulanamadı.';

  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    if (roomCode) {
      url.searchParams.set('room', roomCode);
    }
    return url.toString();
  }, [roomCode]);

  useEffect(() => {
    if (usingDemoConfig) return;

    const initAuth = async () => {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (usingDemoConfig) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-amber-500 text-center px-6">
        <div className="max-w-xl space-y-3">
          <p className="text-xl font-semibold">Firebase yapılandırması bulunamadı</p>
          <p className="text-sm text-amber-200/80">{firebaseUnavailableMessage}</p>
          <p className="text-sm text-amber-200/70">Lütfen geçerli VITE_FIREBASE_CONFIG ayarlarını sağlayın.</p>
        </div>
      </div>
    );
  }

  const handleJoin = (userName: string, room: string, selectedRole: string) => {
    if (user) {
      // Fix for read-only property if needed, otherwise this might fail if user object is frozen
      try {
          // @ts-ignore
          user.displayName = userName;
      } catch (e) {
          Object.defineProperty(user, 'displayName', { value: userName, writable: true });
      }

      setRoomCode(room);
      setRole(selectedRole);
      setJoined(true);
      
      // Eğer rol oyuncuysa kendi karakterini seçili yap, DM ise boş başla
      if(selectedRole === 'player') {
          setSelectedPlayerId(user.uid);
      }
    }
  };

  const handleDMSelectPlayer = (uid: string) => {
      setSelectedPlayerId(uid);
      setActiveTab('char'); // Seçince direkt kağıda git
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 1500);
    } catch (error) {
      window.prompt('Oda linkini kopyala', shareLink);
    }
  };

  if (!user) return <div className="flex items-center justify-center h-screen bg-slate-900 text-amber-500">Büyü hazırlanıyor...</div>;
  
  if (!joined) return <Lobby onJoin={handleJoin} />;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <header className="bg-slate-800 p-4 shadow-md border-b border-slate-700 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-amber-500">Oda: {roomCode}</span>
          {usingDemoConfig && (
            <span className="text-xs px-2 py-1 bg-amber-900/40 border border-amber-700 text-amber-200 rounded-full">
              Demo Firebase
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-sm text-slate-400">
            <button
              onClick={handleCopyShareLink}
              disabled={!roomCode}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border transition-colors ${roomCode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-slate-700 text-slate-600 cursor-not-allowed'}`}
            >
              <Link2 className="w-4 h-4" />
              <span>{copiedShareLink ? 'Kopyalandı!' : 'Odayı Paylaş'}</span>
            </button>
            {role === 'dm' && <Crown className="w-4 h-4 text-amber-400" />}
            {role === 'spectator' && <Eye className="w-4 h-4 text-blue-400" />}
            <span>{user.displayName}</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dice' && <DiceRoller user={user} roomCode={roomCode} />}
        
        {/* Karakter Kağıdı: Oyuncu kendi kağıdını, DM seçili kağıdı görür */}
        {activeTab === 'char' && role !== 'spectator' && (
            <CharacterSheet 
                user={user} 
                roomCode={roomCode} 
                targetUid={selectedPlayerId} 
                isDM={role === 'dm'}
            />
        )}
        
        {/* Parti Görünümü: Herkes görür ama DM tıklayabilir */}
        {activeTab === 'party' && (
            <PartyView 
                roomCode={roomCode} 
                currentUserUid={user.uid} 
                role={role}
                onSelectPlayer={handleDMSelectPlayer}
                selectedPlayerId={selectedPlayerId}
            />
        )}
      </main>

      <nav className="bg-slate-800 border-t border-slate-700 p-2 pb-safe">
        <div className="flex justify-around items-center">
          {role !== 'spectator' && (
              <button 
                onClick={() => setActiveTab('char')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'char' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Scroll className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{role === 'dm' ? 'Düzenle' : 'Karakter'}</span>
              </button>
          )}

          <button 
            onClick={() => setActiveTab('dice')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors transform -translate-y-4 bg-slate-800 border-4 border-slate-900 shadow-lg rounded-full w-16 h-16 justify-center ${activeTab === 'dice' ? 'text-amber-500 ring-2 ring-amber-500' : 'text-slate-400'}`}
          >
            <Dices className={`w-8 h-8 ${activeTab === 'dice' ? 'animate-spin-slow' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('party')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'party' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Parti</span>
          </button>
        </div>
      </nav>

      <style>{`
        .text-shadow { text-shadow: 2px 2px 0px rgba(0,0,0,0.3); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        @keyframes zoom-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-in { animation: zoom-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
