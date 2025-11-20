import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, appId, storage } from '../../lib/firebase';
import { Send, UserPlus, User, MessageSquare, X, Users, Smile, Image as ImageIcon, Loader2 } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useToast } from '../../context/ToastContext';

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface ChatSystemProps {
  roomId?: string; // If present, room chat. If null, friend/global chat (maybe just friends for now)
  isOverlay?: boolean;
  onClose?: () => void;
}

export const ChatSystem = ({ roomId, isOverlay, onClose }: ChatSystemProps) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [friendSearchEmail, setFriendSearchEmail] = useState('');
  const [view, setView] = useState<'room' | 'friends'>('room');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect: Decide view
  useEffect(() => {
    if (roomId) {
        setView('room');
    } else {
        setView('friends');
    }
  }, [roomId]);

  // Effect: Fetch Messages
  useEffect(() => {
    if (!user) return;

    let q;
    let collectionPath = '';

    if (view === 'room' && roomId) {
        collectionPath = `artifacts/${appId}/rooms/${roomId}/messages`;
        q = query(collection(db, collectionPath), orderBy('timestamp', 'asc'), limit(50));
    } else if (view === 'friends' && selectedFriendId) {
        // Private DM logic: Use a composite ID or a subcollection in user?
        // For simplicity: shared collection 'direct_messages' with field 'participants' (array)
        // Or: artifacts/{appId}/chats/{chatId}/messages
        // Let's generate a chatId: sort(uid1, uid2).join('_')
        const chatId = [user.uid, selectedFriendId].sort().join('_');
        collectionPath = `artifacts/${appId}/chats/${chatId}/messages`;
        q = query(collection(db, collectionPath), orderBy('timestamp', 'asc'), limit(50));
    } else {
        setMessages([]);
        return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgs);
        scrollToBottom();
    });

    return () => unsubscribe();
  }, [view, roomId, selectedFriendId, user]);

  // Effect: Fetch Friends
  useEffect(() => {
    if (!user) return;
    // Assume friends are stored in user doc as array of UIDs 'friends'
    // We need to fetch their profiles.
    const fetchFriends = async () => {
        // This is a bit complex because we need to read the current user doc, get friend UIDs, then fetch each.
        // For realtime, we should listen to user doc.
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const friendUids = docSnap.data().friends || [];
                if (friendUids.length > 0) {
                    // Fetch friend profiles
                    // Firestore 'in' query supports up to 10. If more, need chunks.
                    // For simplicity, let's assume < 10 friends for now or just map promises
                    const friendPromises = friendUids.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
                    const friendSnaps = await Promise.all(friendPromises);
                    const friendList = friendSnaps.map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } : null).filter(Boolean);
                    setFriends(friendList);
                } else {
                    setFriends([]);
                }
            }
        });
        return unsubscribe;
    };
    fetchFriends();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !imageUrl) || !user) return;

    let collectionPath = '';
    if (view === 'room' && roomId) {
        collectionPath = `artifacts/${appId}/rooms/${roomId}/messages`;
    } else if (view === 'friends' && selectedFriendId) {
        const chatId = [user.uid, selectedFriendId].sort().join('_');
        collectionPath = `artifacts/${appId}/chats/${chatId}/messages`;
    } else {
        return;
    }

    await addDoc(collection(db, collectionPath), {
        text: newMessage,
        imageUrl: imageUrl || null,
        senderId: user.uid,
        senderName: user.displayName,
        timestamp: serverTimestamp()
    });

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: any) => {
      setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!user || !e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
          addToast('Dosya boyutu çok büyük (Max 5MB).', 'error');
          return;
      }

      setIsUploading(true);
      try {
          const storageRef = ref(storage, `chat/${user.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          await handleSendMessage(undefined, url);
      } catch (error) {
          console.error("Upload failed", error);
          addToast("Yükleme başarısız.", 'error');
      }
      setIsUploading(false);
  };

  const handleAddFriend = async () => {
      if (!user || !friendSearchEmail) return;
      // Find user by email
      const q = query(collection(db, 'artifacts', appId, 'users'), where('email', '==', friendSearchEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          addToast('Kullanıcı bulunamadı.', 'error');
          return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendId = friendDoc.id;

      if (friendId === user.uid) {
          addToast('Kendini ekleyemezsin.', 'info');
          return;
      }

      // Send Request
      const friendRef = doc(db, 'artifacts', appId, 'users', friendId);

      // Check if already friends or requested (simplified)
      const friendData = friendDoc.data();
      if (friendData.friends?.includes(user.uid)) {
          addToast('Zaten arkadaşsınız.', 'info');
          return;
      }
      if (friendData.friendRequests?.includes(user.uid)) {
          addToast('Zaten istek gönderilmiş.', 'info');
          return;
      }

      await updateDoc(friendRef, {
          friendRequests: arrayUnion(user.uid)
      });

      setFriendSearchEmail('');
      addToast('Arkadaşlık isteği gönderildi!', 'success');
  };

  return (
    <div className={`flex flex-col bg-slate-900 border-l border-slate-700 ${isOverlay ? 'h-full' : 'h-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
            <div className="flex space-x-2">
                {roomId && (
                    <button
                        onClick={() => { setView('room'); setSelectedFriendId(null); }}
                        className={`p-2 rounded ${view === 'room' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Oda Sohbeti"
                    >
                        <Users size={20} />
                    </button>
                )}
                <button
                    onClick={() => setView('friends')}
                    className={`p-2 rounded ${view === 'friends' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Arkadaşlar"
                >
                    <User size={20} />
                </button>
            </div>
            {isOverlay && onClose && (
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
            {view === 'friends' && !selectedFriendId ? (
                <div className="p-4 space-y-4 h-full overflow-y-auto">
                    {/* Add Friend */}
                    <div className="flex space-x-2">
                        <input
                            value={friendSearchEmail}
                            onChange={(e) => setFriendSearchEmail(e.target.value)}
                            placeholder="Arkadaş E-posta"
                            className="bg-slate-800 border border-slate-600 rounded p-2 text-sm flex-1 text-white"
                        />
                        <button onClick={handleAddFriend} className="bg-green-600 text-white p-2 rounded">
                            <UserPlus size={18}/>
                        </button>
                    </div>

                    {/* Friend List */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase">Arkadaşlar</h3>
                        {friends.length === 0 && <p className="text-slate-500 text-sm">Arkadaş yok.</p>}
                        {friends.map(f => (
                            <div
                                key={f.uid}
                                onClick={() => setSelectedFriendId(f.uid)}
                                className="flex items-center p-2 bg-slate-800 rounded cursor-pointer hover:bg-slate-700"
                            >
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                    {f.displayName?.substring(0,2).toUpperCase()}
                                </div>
                                <span className="text-white text-sm font-bold">{f.displayName}</span>
                                <MessageSquare className="ml-auto text-slate-500 w-4 h-4" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Chat Header if DM */}
                    {view === 'friends' && selectedFriendId && (
                        <div className="bg-slate-800 p-2 flex items-center text-sm font-bold text-indigo-400 border-b border-slate-700">
                            <button onClick={() => setSelectedFriendId(null)} className="mr-2 text-slate-400 hover:text-white">{'<'}</button>
                            {friends.find(f => f.uid === selectedFriendId)?.displayName || 'Sohbet'}
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-2 text-sm ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                    {msg.senderId !== user?.uid && <div className="text-[10px] text-slate-400 mb-1">{msg.senderName}</div>}

                                    {msg.imageUrl && (
                                        <img src={msg.imageUrl} alt="Attachment" className="max-w-full rounded mb-2 max-h-40 object-cover" />
                                    )}

                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-600 mt-1">
                                    {msg.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-slate-800 border-t border-slate-700 relative">
                        {showEmojiPicker && (
                            <div className="absolute bottom-16 left-0 z-50">
                                <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} width={300} height={400} />
                            </div>
                        )}

                        <form onSubmit={(e) => handleSendMessage(e)} className="flex space-x-2 items-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-slate-400 hover:text-white p-2"
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />

                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="text-slate-400 hover:text-amber-400 p-2"
                            >
                                <Smile size={20} />
                            </button>

                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none min-w-0"
                                placeholder="Mesaj yaz..."
                            />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full flex-shrink-0">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};
