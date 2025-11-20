import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Plus,
  Home,
  MessageSquare,
  User
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { ChatSystem } from '../components/chat/ChatSystem';
import { ProfileSettings } from '../components/ProfileSettings';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRooms, setUserRooms] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch user's rooms
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserRooms(data.rooms || []);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;
  const isRoomActive = (roomId: string) => location.pathname.startsWith(`/room/${roomId}`);

  // Determine if we are in a room to pass roomId to chat
  const currentRoomId = location.pathname.startsWith('/room/') ? location.pathname.split('/')[2] : undefined;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Sidebar - Room Switcher */}
      <div className="w-20 flex flex-col items-center py-4 bg-slate-950 border-r border-slate-800 z-20 h-full space-y-4">
        {/* Home / Dashboard */}
        <Link
            to="/"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group relative flex-shrink-0
            ${isActive('/') ? 'bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-900/20' : 'bg-slate-800 text-amber-500 hover:bg-amber-600 hover:text-white hover:rounded-xl'}`}
        >
            <Home size={24} />
            <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Ana Sayfa
            </div>
        </Link>

        <div className="w-10 h-0.5 bg-slate-800 rounded-full flex-shrink-0" />

        {/* Room List */}
        <div className="flex-1 flex flex-col space-y-3 overflow-y-auto w-full items-center scrollbar-hide px-2 overflow-x-hidden">
            {userRooms.map((room) => (
                <Link
                    key={room.id}
                    to={`/room/${room.id}`}
                    className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 group relative border-2
                    ${isRoomActive(room.id) ? 'border-indigo-500 bg-indigo-600/20 text-white rounded-xl' : 'border-transparent bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white hover:rounded-xl hover:border-transparent'}`}
                >
                    {room.icon ? (
                        <img src={room.icon} alt={room.name} className="w-full h-full object-cover rounded-inherit" />
                    ) : (
                        <span className="font-bold text-sm">{room.name?.substring(0, 2).toUpperCase()}</span>
                    )}

                    <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {room.name}
                    </div>
                </Link>
            ))}

            {/* Add Room Button */}
            <button
                onClick={() => navigate('/')}
                className="w-12 h-12 flex-shrink-0 rounded-full bg-slate-800/50 text-green-500 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-200 group relative border border-dashed border-slate-600 hover:border-transparent"
            >
                <Plus size={24} />
                <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Oda Ekle
                </div>
            </button>
        </div>

        {/* User / Settings */}
        <div className="mt-auto flex flex-col space-y-3 flex-shrink-0">
             <button
                onClick={() => setShowProfile(true)}
                className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all duration-200 group relative"
            >
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <User size={20} />
                )}
                 <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Profilim
                </div>
            </button>

             <button
                onClick={() => setShowChat(!showChat)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group relative ${showChat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white'}`}
            >
                <MessageSquare size={20} />
                 <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Sohbet
                </div>
            </button>

             <button
                onClick={logout}
                className="w-12 h-12 rounded-full bg-slate-800 text-red-500 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-200 group relative"
            >
                <LogOut size={20} />
                 <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Çıkış Yap
                </div>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 relative">
        <Outlet />
      </div>

      {/* Chat Overlay / Sidebar (Global Overlay for now, Room will use its own) */}
      {showChat && !currentRoomId && (
          <div className="absolute right-0 top-0 bottom-0 w-80 border-l border-slate-700 bg-slate-900 z-30 shadow-xl animate-in slide-in-from-right duration-300">
              <ChatSystem isOverlay onClose={() => setShowChat(false)} />
          </div>
      )}

      <ProfileSettings isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
};
