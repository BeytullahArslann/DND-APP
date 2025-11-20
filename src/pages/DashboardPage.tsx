import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Lock, Users, DoorOpen, LogIn } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Create Room State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Join Room State
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinRoomPassword, setJoinRoomPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('player');
  const [joinError, setJoinError] = useState('');

  // Public Rooms List
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

  // Fetch public rooms
  useEffect(() => {
    const fetchPublicRooms = async () => {
        const q = query(
            collection(db, 'artifacts', appId, 'rooms'),
            where('isPrivate', '==', false) // Only fetch public or non-password protected? Or fetch all and show lock?
            // Let's say we fetch recent rooms for now.
        );
        // Ideally use a separate collection for public listings or an index
        // For simplicity, let's just query all rooms (limit 20) and filter client side if needed
        // or just show rooms where user is NOT a member.

        // NOTE: Firestore requires index for complex queries. Let's keep it simple.
        // We will just show "Featured" or list created rooms.
    };
    // fetchPublicRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newRoomName) return;

    try {
      const roomData = {
        name: newRoomName,
        ownerId: user.uid,
        password: newRoomPassword || null,
        requiresApproval: !!newRoomPassword, // If password, approval is automatic on correct password. If no password, maybe auto-approve?
        // Wait, user requirement: "sifre var ise sifre girip katilsin sifre yok ise oda kurucusunda onaya dussun"
        // Logic:
        // Password exists -> Input Password -> Join (No Owner Approval needed, Password is the key)
        // No Password -> Request -> Owner Approval needed.
        hasPassword: !!newRoomPassword,
        createdAt: serverTimestamp(),
        members: [user.uid], // Owner is a member
        roles: { [user.uid]: 'dm' } // Owner is DM
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'rooms'), roomData);

      // Add room to user's room list
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userRef, {
          rooms: arrayUnion({ id: docRef.id, name: newRoomName })
      });

      setIsCreateModalOpen(false);
      navigate(`/room/${docRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
      e.preventDefault();
      setJoinError('');
      if (!user || !joinRoomId) return;

      try {
          const roomRef = doc(db, 'artifacts', appId, 'rooms', joinRoomId);
          const roomSnap = await getDoc(roomRef);

          if (!roomSnap.exists()) {
              setJoinError("Oda bulunamadı.");
              return;
          }

          const roomData = roomSnap.data();

          // Check if already member
          if (roomData.members && roomData.members.includes(user.uid)) {
              navigate(`/room/${joinRoomId}`);
              return;
          }

          if (roomData.hasPassword) {
              if (roomData.password !== joinRoomPassword) {
                  setJoinError("Hatalı şifre.");
                  return;
              }
              // Password correct -> Join immediately
              await updateDoc(roomRef, {
                  members: arrayUnion(user.uid),
                  [`roles.${user.uid}`]: selectedRole
              });
               // Add to user profile
              const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
              await updateDoc(userRef, {
                rooms: arrayUnion({ id: joinRoomId, name: roomData.name })
              });
              navigate(`/room/${joinRoomId}`);
          } else {
              // No password -> Send Request
              // Check if request already sent
              const pending = roomData.pendingRequests || [];
              if (pending.some((p: any) => p.uid === user.uid)) {
                  setJoinError("Zaten istek gönderilmiş.");
                  return;
              }

              await updateDoc(roomRef, {
                  pendingRequests: arrayUnion({
                      uid: user.uid,
                      name: user.displayName,
                      role: selectedRole,
                      timestamp: Date.now()
                  })
              });
              setJoinError("Katılım isteği gönderildi. Oda sahibi onayladığında girebileceksiniz.");
              setTimeout(() => setIsJoinModalOpen(false), 2000);
          }

      } catch (error) {
          console.error("Join error:", error);
          setJoinError("Bir hata oluştu.");
      }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lobi</h1>
            <p className="text-slate-400">Yeni bir maceraya başla veya mevcut birine katıl.</p>
          </div>
          <div className="flex gap-4">
            <button
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold flex items-center border border-slate-700 transition-colors"
            >
                <Search className="mr-2 w-5 h-5" /> Odaya Katıl
            </button>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-lg transition-colors"
            >
                <Plus className="mr-2 w-5 h-5" /> Yeni Oda Oluştur
            </button>
          </div>
        </header>

        {/* Placeholder for Public Rooms or Featured content */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Users className="mr-2"/> Arkadaşların</h2>
                <div className="text-slate-500 text-center py-8">
                    Henüz arkadaş eklemedin.
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><DoorOpen className="mr-2"/> Bekleyen Davetler</h2>
                <div className="text-slate-500 text-center py-8">
                    Bekleyen davet yok.
                </div>
            </div>
        </div>

        {/* CREATE ROOM MODAL */}
        <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Yeni Oda Oluştur"
        >
            <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Oda Adı</label>
                    <input
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="Ejderha Mızrağı"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Şifre (İsteğe Bağlı)</label>
                    <input
                        type="password"
                        value={newRoomPassword}
                        onChange={(e) => setNewRoomPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="Boş bırakılırsa onayla giriş yapılır"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Şifre belirlerseniz, şifreyi bilen herkes girebilir. Şifre yoksa, her katılım isteğini onaylamanız gerekir.
                    </p>
                </div>
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded mt-4">
                    Oluştur
                </button>
            </form>
        </Modal>

        {/* JOIN ROOM MODAL */}
        <Modal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            title="Odaya Katıl"
        >
             <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Oda ID</label>
                    <input
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="Oda kodunu girin"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Şifre (Varsa)</label>
                    <input
                        type="password"
                        value={joinRoomPassword}
                        onChange={(e) => setJoinRoomPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                        placeholder="Oda şifresi"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Rol Seçimi</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                    >
                        <option value="player">Oyuncu</option>
                        <option value="spectator">İzleyici</option>
                        <option value="dm">DM (Yönetici)</option>
                    </select>
                </div>

                {joinError && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50">{joinError}</div>}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded mt-4 flex items-center justify-center">
                    <LogIn className="w-4 h-4 mr-2"/> Katıl / İstek Gönder
                </button>
            </form>
        </Modal>
      </div>
    </div>
  );
};
