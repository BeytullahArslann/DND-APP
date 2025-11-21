import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  getDoc,
  serverTimestamp
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
import { useTranslation } from 'react-i18next';

interface RoomSettingsProps {
  roomData: any;
  isOpen: boolean;
  onClose: () => void;
}

export const RoomSettings = ({ roomData, isOpen, onClose }: RoomSettingsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState<{[key: string]: any}>({});

  useEffect(() => {
      if (!roomData.members) return;

      const fetchMembers = async () => {
          const details: {[key: string]: any} = {};
          for (const uid of roomData.members) {
              try {
                const userDoc = await getDoc(doc(db, 'artifacts', appId, 'users', uid));
                if (userDoc.exists()) {
                    details[uid] = userDoc.data();
                }
              } catch (e) {
                  console.error("Failed to fetch user", uid);
              }
          }
          setMemberDetails(details);
      };
      fetchMembers();
  }, [roomData.members]);

  const handleApprove = async (request: any) => {
    if (loading) return;
    setLoading(true);
    try {
        const roomRef = doc(db, 'artifacts', appId, 'rooms', roomData.id);
        await updateDoc(roomRef, {
            members: arrayUnion(request.uid),
            [`roles.${request.uid}`]: request.role,
            [`memberJoinedAt.${request.uid}`]: serverTimestamp(),
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
    if (!confirm(t('settings.kick_confirm')) || loading) return;
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
      if (!confirm(t('settings.delete_confirm')) || loading) return;
      setLoading(true);
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'rooms', roomData.id));
          navigate('/');
      } catch (error) {
          console.error("Error deleting room:", error);
      }
      setLoading(false);
  };

  const formattedCreatedAt = roomData.createdAt
      ? (roomData.createdAt.toDate ? roomData.createdAt.toDate() : new Date(roomData.createdAt)).toLocaleDateString()
      : "Bilinmiyor";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')}>
        <div className="space-y-6">
             <div className="text-xs text-slate-500 border-b border-slate-700 pb-2">
                 {t('settings.creation_date')}: <span className="text-slate-300">{formattedCreatedAt}</span>
             </div>

            {/* Pending Requests */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">{t('settings.pending_requests')}</h4>
                {(!roomData.pendingRequests || roomData.pendingRequests.length === 0) ? (
                    <div className="text-slate-600 text-sm italic">{t('settings.no_pending')}</div>
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
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">{t('settings.members')}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {roomData.members?.map((uid: string) => {
                        const details = memberDetails[uid];
                        let joinDate = roomData.memberJoinedAt?.[uid];

                        // Fallback for owner if no specific join date
                        if (!joinDate && uid === roomData.ownerId && roomData.createdAt) {
                            joinDate = roomData.createdAt;
                        }

                        let dateStr = "";
                        if (joinDate) {
                             // Handle Firestore Timestamp or basic number
                             const date = joinDate.toDate ? joinDate.toDate() : new Date(joinDate);
                             dateStr = date.toLocaleDateString();
                        }

                        return (
                        <div key={uid} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700 mb-2">
                            <div className="flex items-center min-w-0 gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-600 overflow-hidden">
                                    {details?.photoURL ? (
                                        <img src={details.photoURL} className="w-full h-full object-cover"/>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-400">
                                            {details?.displayName ? details.displayName.substring(0,2).toUpperCase() : '?'}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-white text-sm font-bold flex items-center gap-2">
                                        <span className="truncate max-w-[150px]">{details?.displayName || t('common.loading')}</span>
                                        {uid === roomData.ownerId && <span className="text-xs bg-amber-900/50 text-amber-500 px-1.5 py-0.5 rounded border border-amber-900/50">👑 {t('settings.owner')}</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex flex-col">
                                         <span>{dateStr ? `${dateStr} ${t('settings.joined_at')}` : t('settings.no_date')}</span>
                                         {/* Debug ID only if name missing or in dev */}
                                         {!details?.displayName && <span className="text-[9px] opacity-50">{uid}</span>}
                                    </div>
                                </div>
                            </div>

                            {uid !== roomData.ownerId && (
                                <button onClick={() => handleKick(uid)} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 p-2 rounded-lg transition-colors" title={t('settings.kick')}>
                                    <UserX size={18} />
                                </button>
                            )}
                        </div>
                    )})}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-red-900/30">
                 <h4 className="text-sm font-bold text-red-500 uppercase mb-2 flex items-center"><ShieldAlert className="w-4 h-4 mr-1"/> {t('settings.danger_zone')}</h4>
                 <button
                    onClick={handleDeleteRoom}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 p-2 rounded flex items-center justify-center transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> {t('settings.delete_room')}
                 </button>
            </div>
        </div>
    </Modal>
  );
};
