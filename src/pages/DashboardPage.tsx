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
  getDoc,
  limit,
  onSnapshot,
  arrayRemove
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Lock, Users, DoorOpen, LogIn, UserPlus, Check, X } from 'lucide-react';

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

  // Friends & Requests
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  // Invites
  const [invitations, setInvitations] = useState<any[]>([]);

  // Fetch friends and requests
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Handle Friend Requests
        const requests = userData.friendRequests || [];
        if (requests.length > 0) {
             // Fetch profiles of requesters
             const reqPromises = requests.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
             const reqSnaps = await Promise.all(reqPromises);
             const reqList = reqSnaps.map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } : null).filter(Boolean);
             setFriendRequests(reqList);
        } else {
            setFriendRequests([]);
        }

        // Handle Friends List
        const friendUids = userData.friends || [];
        if (friendUids.length > 0) {
             const friendPromises = friendUids.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
             const friendSnaps = await Promise.all(friendPromises);
             const friendList = friendSnaps.map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } : null).filter(Boolean);
             setFriends(friendList);
        } else {
            setFriends([]);
        }

        // Handle Room Invites
        setInvitations(userData.roomInvites || []);

        setLoadingFriends(false);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleAcceptInvite = async (invite: any) => {
    if (!user) return;
    try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
        const roomRef = doc(db, 'artifacts', appId, 'rooms', invite.roomId);

        // Add to room members
        await updateDoc(roomRef, {
            members: arrayUnion(user.uid),
            [`roles.${user.uid}`]: 'player' // Default role
        });

        // Remove invite
        await updateDoc(userRef, {
            roomInvites: arrayRemove(invite)
        });

        navigate(`/room/${invite.roomId}`);
    } catch (error) {
        console.error("Accept invite error", error);
    }
  };

  const handleRejectInvite = async (invite: any) => {
    if (!user) return;
    try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
        await updateDoc(userRef, {
            roomInvites: arrayRemove(invite)
        });
    } catch (error) {
        console.error("Reject invite error", error);
    }
  };

  const handleAcceptFriend = async (requesterId: string) => {
      if (!user) return;
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      const requesterRef = doc(db, 'artifacts', appId, 'users', requesterId);

      // Add to both friends lists
      await updateDoc(userRef, {
          friends: arrayUnion(requesterId),
          friendRequests: arrayRemove(requesterId)
      });
      await updateDoc(requesterRef, {
          friends: arrayUnion(user.uid)
      });
  };

  const handleRejectFriend = async (requesterId: string) => {
       if (!user) return;
       const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
       await updateDoc(userRef, {
          friendRequests: arrayRemove(requesterId)
      });
  };

  // Hub: Public Rooms
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [showHub, setShowHub] = useState(false); // Toggle between Dashboard and Hub

  const fetchPublicRooms = async (isNext = false) => {
      setLoadingRooms(true);
      try {
          let q = query(
              collection(db, 'artifacts', appId, 'rooms'),
              // orderBy('createdAt', 'desc'), // Requires index
              // where('isPrivate', '==', false),
              limit(10)
          );

          if (isNext && lastVisible) {
             // q = query(q, startAfter(lastVisible));
             // Firestore pagination requires consistent ordering.
             // Simplified for now: just fetch all and filter client side for search, or use limit.
          }

          const snapshot = await getDocs(q);
          const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          setPublicRooms(rooms); // Should append if paging
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } catch (error) {
          console.error("Error fetching rooms", error);
      }
      setLoadingRooms(false);
  };

  useEffect(() => {
      if (showHub) {
          fetchPublicRooms();
      }
  }, [showHub]);

  const filteredRooms = publicRooms.filter(r =>
    r.name?.toLowerCase().includes(roomSearch.toLowerCase())
  );

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
        roles: { [user.uid]: 'dm' }, // Owner is DM
        memberJoinedAt: { [user.uid]: serverTimestamp() }
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
                  [`roles.${user.uid}`]: selectedRole,
                  [`memberJoinedAt.${user.uid}`]: serverTimestamp()
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
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{showHub ? 'Oyun Merkezi (Hub)' : 'Lobi'}</h1>
            <p className="text-slate-400">{showHub ? 'Tüm açık oyunları keşfet.' : 'Yeni bir maceraya başla veya mevcut birine katıl.'}</p>
          </div>
          <div className="flex gap-2 md:gap-4 flex-wrap">
             <button
                onClick={() => setShowHub(!showHub)}
                className={`px-6 py-3 rounded-lg font-bold flex items-center border transition-colors ${showHub ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            >
                <DoorOpen className="mr-2 w-5 h-5" /> {showHub ? 'Lobime Dön' : 'Tüm Oyunlar'}
            </button>

            <button
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold flex items-center border border-slate-700 transition-colors"
            >
                <Search className="mr-2 w-5 h-5" /> Kod İle Katıl
            </button>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-lg transition-colors"
            >
                <Plus className="mr-2 w-5 h-5" /> Yeni Oda
            </button>
          </div>
        </header>

        {showHub ? (
             <div className="space-y-6">
                 {/* Hub Search */}
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                     <input
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="Oda adı ara..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
                     />
                 </div>

                 {/* Room List Grid */}
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {loadingRooms ? (
                         <div className="col-span-full text-center text-slate-500 py-8">Odalar yükleniyor...</div>
                     ) : filteredRooms.length === 0 ? (
                         <div className="col-span-full text-center text-slate-500 py-8">Oda bulunamadı.</div>
                     ) : (
                         filteredRooms.map(room => (
                             <div key={room.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500 transition-colors relative group">
                                 <div className="flex items-start justify-between mb-2">
                                     <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-xl font-bold text-slate-300">
                                         {room.name?.substring(0,2).toUpperCase()}
                                     </div>
                                     {room.hasPassword && <Lock className="w-4 h-4 text-amber-500" />}
                                 </div>
                                 <h3 className="font-bold text-white truncate mb-1">{room.name}</h3>
                                 <div className="text-xs text-slate-500 mb-4">
                                     {room.members?.length || 1} Oyuncu
                                 </div>
                                 <button
                                    onClick={() => {
                                        setJoinRoomId(room.id);
                                        setIsJoinModalOpen(true);
                                    }}
                                    className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white py-2 rounded font-bold text-sm transition-all"
                                 >
                                     Katıl
                                 </button>
                             </div>
                         ))
                     )}
                 </div>
             </div>
        ) : (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Friend Requests */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <UserPlus className="mr-2"/> Arkadaş İstekleri
                    {friendRequests.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{friendRequests.length}</span>
                    )}
                </h2>
                <div className="space-y-2">
                    {friendRequests.length === 0 ? (
                         <div className="text-slate-500 text-center py-4">Bekleyen istek yok.</div>
                    ) : (
                        friendRequests.map(req => (
                            <div key={req.uid} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold">
                                        {req.displayName?.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-sm">{req.displayName}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAcceptFriend(req.uid)}
                                        className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleRejectFriend(req.uid)}
                                        className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Friend List */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Users className="mr-2"/> Arkadaşların</h2>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {loadingFriends ? (
                        <div className="text-slate-500 text-center py-4">Yükleniyor...</div>
                    ) : friends.length === 0 ? (
                        <div className="text-slate-500 text-center py-4">Henüz arkadaş eklemedin.</div>
                    ) : (
                        friends.map(f => (
                             <div key={f.uid} className="flex items-center p-3 bg-slate-700/30 rounded-lg">
                                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-bold mr-3">
                                    {f.photoURL ? (
                                        <img src={f.photoURL} alt={f.displayName} className="w-full h-full rounded-full object-cover"/>
                                    ) : (
                                        f.displayName?.substring(0,2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{f.displayName}</div>
                                    <div className="text-xs text-slate-400 truncate max-w-[150px]">{f.email}</div>
                                </div>
                                <div className="ml-auto flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${f.isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
                                </div>
                             </div>
                        ))
                    )}
                </div>
            </div>

            {/* Room Invites */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 md:col-span-2">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <DoorOpen className="mr-2"/> Bekleyen Oyun Davetleri
                    {invitations.length > 0 && (
                        <span className="ml-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{invitations.length}</span>
                    )}
                </h2>

                {invitations.length === 0 ? (
                     <div className="text-slate-500 text-center py-8">Bekleyen davet yok.</div>
                ) : (
                    <div className="space-y-3">
                        {invitations.map((invite, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                <div>
                                    <div className="font-bold text-lg text-white">{invite.roomName}</div>
                                    <div className="text-xs text-slate-400">
                                        Davet eden: <span className="text-amber-500">{invite.inviterName}</span>
                                        <span className="mx-1">•</span>
                                        {new Date(invite.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAcceptInvite(invite)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold text-sm flex items-center"
                                    >
                                        <Check size={16} className="mr-1"/> Katıl
                                    </button>
                                    <button
                                        onClick={() => handleRejectInvite(invite)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-bold text-sm flex items-center"
                                    >
                                        <X size={16} className="mr-1"/> Reddet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        )}

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
