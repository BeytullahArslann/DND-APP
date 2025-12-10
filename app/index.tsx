import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal as RNModal } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Stack, router } from 'expo-router';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  limit,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  onSnapshot,
  arrayRemove
} from 'firebase/firestore';
import { db, appId } from '../src/lib/firebase';
import { Plus, Search, Lock, Users, DoorOpen, LogIn, UserPlus, Check, X, Shield, Sword } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple Modal Component for React Native
const SimpleModal = ({ visible, onClose, title, children }: any) => (
  <RNModal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/80 p-4">
      <View className="bg-slate-800 w-full max-w-md p-6 rounded-2xl border border-slate-700">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-white">{title}</Text>
          <TouchableOpacity onPress={onClose}><X color="#94a3b8" /></TouchableOpacity>
        </View>
        {children}
      </View>
    </View>
  </RNModal>
);

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');

  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinRoomPassword, setJoinRoomPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('player');
  const [joinError, setJoinError] = useState('');

  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [invitations, setInvitations] = useState<any[]>([]);

  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [showHub, setShowHub] = useState(false);

  // Auth Redirect Check
  useEffect(() => {
    if (!user) {
        // router.replace('/login'); // Handled by Layout or ProtectedRoute logic ideally
    }
  }, [user]);

  // Fetch Friends Logic (Copied and Adapted)
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Requests
        const requests = userData.friendRequests || [];
        if (requests.length > 0) {
             const reqPromises = requests.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
             const reqSnaps = await Promise.all(reqPromises);
             const reqList = reqSnaps.map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } : null).filter(Boolean);
             setFriendRequests(reqList);
        } else {
            setFriendRequests([]);
        }

        // Friends
        const friendUids = userData.friends || [];
        if (friendUids.length > 0) {
             const friendPromises = friendUids.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
             const friendSnaps = await Promise.all(friendPromises);
             const friendList = friendSnaps.map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } : null).filter(Boolean);
             setFriends(friendList);
        } else {
            setFriends([]);
        }

        // Invites
        setInvitations(userData.roomInvites || []);
        setLoadingFriends(false);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleCreateRoom = async () => {
    if (!user || !newRoomName) return;
    try {
      const roomData = {
        name: newRoomName,
        ownerId: user.uid,
        password: newRoomPassword || null,
        requiresApproval: !!newRoomPassword,
        hasPassword: !!newRoomPassword,
        createdAt: serverTimestamp(),
        members: [user.uid],
        roles: { [user.uid]: 'dm' },
        memberJoinedAt: { [user.uid]: serverTimestamp() }
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'rooms'), roomData);
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userRef, {
          rooms: arrayUnion({ id: docRef.id, name: newRoomName })
      });

      setIsCreateModalOpen(false);
      // Navigate to Room (Not implemented yet in this migration plan, alerting for now)
      Alert.alert("Oda Oluşturuldu", "ID: " + docRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const fetchPublicRooms = async () => {
    setLoadingRooms(true);
    try {
        let q = query(
            collection(db, 'artifacts', appId, 'rooms'),
            limit(10)
        );
        const snapshot = await getDocs(q);
        const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPublicRooms(rooms);
    } catch (error) {
        console.error("Error fetching rooms", error);
    }
    setLoadingRooms(false);
  };

  useEffect(() => {
      if (showHub) fetchPublicRooms();
  }, [showHub]);

  const filteredRooms = publicRooms.filter(r =>
    r.name?.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1 p-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-2xl font-bold text-white">{showHub ? t('dashboard.hub', 'Oyun Merkezi') : t('dashboard.lobby', 'Lobi')}</Text>
                <Text className="text-slate-400 text-xs">{showHub ? t('dashboard.hub_desc', 'Tüm oyunları keşfet') : t('dashboard.lobby_desc', 'Oyunlarına ve arkadaşlarına göz at')}</Text>
            </View>
            <TouchableOpacity onPress={logout} className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <Text className="text-red-400 font-bold text-xs">Çıkış</Text>
            </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row flex-wrap gap-2 mb-8">
             <TouchableOpacity
                onPress={() => setShowHub(!showHub)}
                className={`flex-row items-center px-4 py-3 rounded-lg border ${showHub ? 'bg-slate-700 border-slate-500' : 'bg-slate-800 border-slate-700'}`}
            >
                <DoorOpen size={20} color={showHub ? "#ffffff" : "#94a3b8"} style={{marginRight: 8}} />
                <Text className={showHub ? "text-white font-bold" : "text-slate-400 font-bold"}>{showHub ? t('dashboard.my_lobby', 'Lobim') : t('dashboard.all_games', 'Tüm Oyunlar')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setIsJoinModalOpen(true)}
                className="flex-row items-center px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"
            >
                <Search size={20} color="#ffffff" style={{marginRight: 8}} />
                <Text className="text-white font-bold">{t('dashboard.join_code', 'Kodla Katıl')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setIsCreateModalOpen(true)}
                className="flex-row items-center px-4 py-3 rounded-lg bg-amber-600 shadow-lg"
            >
                <Plus size={20} color="#ffffff" style={{marginRight: 8}} />
                <Text className="text-white font-bold">{t('dashboard.new_room', 'Oda Kur')}</Text>
            </TouchableOpacity>
        </View>

        {showHub ? (
            <View>
                {/* Search */}
                <View className="mb-4 relative">
                    <View className="absolute left-3 top-3 z-10"><Search size={20} color="#64748b" /></View>
                    <TextInput
                        value={roomSearch}
                        onChangeText={setRoomSearch}
                        placeholder={t('dashboard.search_room', 'Oda ara...')}
                        placeholderTextColor="#64748b"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500"
                    />
                </View>

                {/* List */}
                {loadingRooms ? (
                     <Text className="text-center text-slate-500">{t('common.loading', 'Yükleniyor...')}</Text>
                ) : (
                    filteredRooms.map((room) => (
                        <View key={room.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
                             <View className="flex-row justify-between items-start mb-2">
                                <View className="w-10 h-10 bg-slate-700 rounded-lg justify-center items-center">
                                     <Text className="text-white font-bold">{room.name?.substring(0,2).toUpperCase()}</Text>
                                </View>
                                {room.hasPassword && <Lock size={16} color="#f59e0b" />}
                             </View>
                             <Text className="font-bold text-white mb-1">{room.name}</Text>
                             <Text className="text-xs text-slate-500 mb-4">{room.members?.length || 1} {t('dashboard.players', 'Oyuncu')}</Text>
                             <TouchableOpacity
                                onPress={() => { setJoinRoomId(room.id); setIsJoinModalOpen(true); }}
                                className="w-full bg-indigo-600/20 py-2 rounded items-center"
                             >
                                 <Text className="text-indigo-400 font-bold">{t('dashboard.join', 'Katıl')}</Text>
                             </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        ) : (
            <View className="gap-6">
                {/* Friend Requests */}
                <View className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <View className="flex-row items-center mb-4">
                        <UserPlus size={20} color="white" style={{marginRight: 8}} />
                        <Text className="text-white font-bold text-lg">{t('dashboard.friend_requests', 'Arkadaş İstekleri')}</Text>
                        {friendRequests.length > 0 && <View className="ml-2 bg-red-500 px-2 rounded-full"><Text className="text-white text-xs">{friendRequests.length}</Text></View>}
                    </View>
                    {friendRequests.length === 0 ? (
                        <Text className="text-slate-500 text-center py-2">{t('dashboard.no_requests', 'İstek yok')}</Text>
                    ) : (
                        friendRequests.map(req => (
                            <View key={req.uid} className="flex-row justify-between items-center bg-slate-700/50 p-2 rounded mb-2">
                                <Text className="text-white font-medium">{req.displayName}</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity className="bg-green-600 p-1 rounded"><Check size={16} color="white" /></TouchableOpacity>
                                    <TouchableOpacity className="bg-red-600 p-1 rounded"><X size={16} color="white" /></TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Friends */}
                <View className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <View className="flex-row items-center mb-4">
                        <Users size={20} color="white" style={{marginRight: 8}} />
                        <Text className="text-white font-bold text-lg">{t('dashboard.friends', 'Arkadaşlar')}</Text>
                    </View>
                    {friends.map(f => (
                        <View key={f.uid} className="flex-row items-center p-2 bg-slate-700/30 rounded mb-2">
                            <View className="w-8 h-8 bg-slate-600 rounded-full justify-center items-center mr-3">
                                <Text className="text-white font-bold">{f.displayName?.substring(0,2).toUpperCase()}</Text>
                            </View>
                            <View>
                                <Text className="text-white font-bold text-sm">{f.displayName}</Text>
                                <Text className="text-slate-400 text-xs">{f.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        )}

      </ScrollView>

      {/* Create Modal */}
      <SimpleModal visible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('room_modal.create_title', 'Oda Oluştur')}>
        <View className="gap-4">
            <View>
                <Text className="text-slate-400 text-sm font-bold mb-1">{t('room_modal.room_name', 'Oda Adı')}</Text>
                <TextInput value={newRoomName} onChangeText={setNewRoomName} className="bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </View>
            <View>
                <Text className="text-slate-400 text-sm font-bold mb-1">{t('room_modal.password', 'Şifre (İsteğe bağlı)')}</Text>
                <TextInput value={newRoomPassword} onChangeText={setNewRoomPassword} secureTextEntry className="bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </View>
            <TouchableOpacity onPress={handleCreateRoom} className="bg-amber-600 p-3 rounded items-center mt-2">
                <Text className="text-white font-bold">{t('room_modal.create_btn', 'Oluştur')}</Text>
            </TouchableOpacity>
        </View>
      </SimpleModal>

       {/* Join Modal */}
       <SimpleModal visible={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title={t('room_modal.join_title', 'Odaya Katıl')}>
        <View className="gap-4">
            <View>
                <Text className="text-slate-400 text-sm font-bold mb-1">{t('room_modal.room_id', 'Oda ID')}</Text>
                <TextInput value={joinRoomId} onChangeText={setJoinRoomId} className="bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </View>
             <View>
                <Text className="text-slate-400 text-sm font-bold mb-1">{t('room_modal.password_if_any', 'Şifre')}</Text>
                <TextInput value={joinRoomPassword} onChangeText={setJoinRoomPassword} secureTextEntry className="bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Join not implemented in prototype")} className="bg-indigo-600 p-3 rounded items-center mt-2">
                <Text className="text-white font-bold">{t('room_modal.join_btn', 'Katıl')}</Text>
            </TouchableOpacity>
        </View>
      </SimpleModal>

    </SafeAreaView>
  );
}
