import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import { User } from 'lucide-react';

interface FriendSelectorProps {
    onSelect: (email: string) => void;
}

export const FriendSelector = ({ onSelect }: FriendSelectorProps) => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const friendUids = docSnap.data().friends || [];
                if (friendUids.length > 0) {
                     const friendPromises = friendUids.map((uid: string) => getDoc(doc(db, 'artifacts', appId, 'users', uid)));
                     const friendSnaps = await Promise.all(friendPromises);
                     const friendList = friendSnaps.map(snap => snap.exists() ? { uid: snap.id, ...snap.data() } : null).filter(Boolean);
                     setFriends(friendList);
                } else {
                    setFriends([]);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    if (loading) return <div className="text-xs text-slate-500">Yükleniyor...</div>;

    if (friends.length === 0) return <div className="text-xs text-slate-500">Arkadaş listen boş.</div>;

    return (
        <div className="space-y-2">
            {friends.map(f => (
                <div
                    key={f.uid}
                    onClick={() => f.email && onSelect(f.email)}
                    className="flex items-center p-2 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                >
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-2">
                        {f.photoURL ? <img src={f.photoURL} className="w-full h-full rounded-full object-cover"/> : <User size={12}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{f.displayName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{f.email}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};
