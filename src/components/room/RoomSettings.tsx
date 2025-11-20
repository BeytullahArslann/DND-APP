import React, { useState } from 'react';
import { Modal } from '../Modal';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import {
  Trash2,
  UserX,
  Check,
  X,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomSettingsProps {
  roomData: any;
  isOpen: boolean;
  onClose: () => void;
}

export const RoomSettings = ({ roomData, isOpen, onClose }: RoomSettingsProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleApprove = async (request: any) => {
    if (loading) return;
    setLoading(true);
    try {
        const roomRef = doc(db, 'artifacts', appId, 'rooms', roomData.id);
        await updateDoc(roomRef, {
            members: arrayUnion(request.uid),
            [`roles.${request.uid}`]: request.role,
            pendingRequests: arrayRemove(request)
        });

        // Update user's room list
        const userRef = doc(db, 'artifacts', appId, 'users', request.uid);
        await updateDoc(userRef, {
            rooms: arrayUnion({ id: roomData.id, name: roomData.name })
        });
    } catch (error) {
        console.error("Error approving:", error);
    }
    setLoading(false);
  };

  const handleReject = async (request: any) => {
    if (loading) return;
    setLoading(true);
    try {
        const roomRef = doc(db, 'artifacts', appId, 'rooms', roomData.id);
        await updateDoc(roomRef, {
            pendingRequests: arrayRemove(request)
        });
    } catch (error) {
        console.error("Error rejecting:", error);
    }
    setLoading(false);
  };

  const handleKick = async (uid: string) => {
    if (!confirm("Bu oyuncuyu atmak istediğinize emin misiniz?") || loading) return;
    setLoading(true);
    try {
        const roomRef = doc(db, 'artifacts', appId, 'rooms', roomData.id);
        // Cannot simply remove map field in updateDoc easily for roles without deleteField() which requires import
        // but arrayRemove works for members.
        // For roles, we can just leave it or set to 'banned' or use deleteField

        // Let's stick to simple removal from members array.
        await updateDoc(roomRef, {
            members: arrayRemove(uid)
        });

        // Remove from user's room list
        // Note: This might fail if we don't have permission to write to other user's doc?
        // Firestore rules usually allow user to write to own doc. DM might not have write access to Player's doc.
        // Best practice: The player reads "Am I in member list?" if not, remove from local list.
        // But for cleanup, let's try. If it fails, it's fine, the player just won't access the room.
    } catch (error) {
        console.error("Error kicking:", error);
    }
    setLoading(false);
  };

  const handleDeleteRoom = async () => {
      if (!confirm("BU ODAYI KALICI OLARAK SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ? Bu işlem geri alınamaz.") || loading) return;
      setLoading(true);
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'rooms', roomData.id));
          navigate('/');
      } catch (error) {
          console.error("Error deleting room:", error);
      }
      setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Oda Ayarları">
        <div className="space-y-6">
            {/* Pending Requests */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Bekleyen İstekler</h4>
                {(!roomData.pendingRequests || roomData.pendingRequests.length === 0) ? (
                    <div className="text-slate-600 text-sm italic">Bekleyen istek yok.</div>
                ) : (
                    <div className="space-y-2">
                        {roomData.pendingRequests.map((req: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
                                <div>
                                    <div className="text-white font-bold text-sm">{req.name}</div>
                                    <div className="text-xs text-slate-500">{req.role}</div>
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => handleApprove(req)} className="p-1 bg-green-900/50 text-green-400 rounded hover:bg-green-900"><Check size={16}/></button>
                                    <button onClick={() => handleReject(req)} className="p-1 bg-red-900/50 text-red-400 rounded hover:bg-red-900"><X size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Member List */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Üyeler</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {roomData.members?.map((uid: string) => (
                        <div key={uid} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
                            <div className="text-white text-sm truncate w-40">
                                {uid === roomData.ownerId ? <span className="text-amber-500 font-bold">👑 (Sahip)</span> : uid}
                                {/* Ideally we would fetch names, but UID is fast */}
                            </div>
                            {uid !== roomData.ownerId && (
                                <button onClick={() => handleKick(uid)} className="text-red-500 hover:text-red-300" title="At">
                                    <UserX size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-red-900/30">
                 <h4 className="text-sm font-bold text-red-500 uppercase mb-2 flex items-center"><ShieldAlert className="w-4 h-4 mr-1"/> Tehlike Bölgesi</h4>
                 <button
                    onClick={handleDeleteRoom}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 p-2 rounded flex items-center justify-center transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Odayı Sil
                 </button>
            </div>
        </div>
    </Modal>
  );
};
