import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DiceRoller } from '../components/game/DiceRoller';
import { CharacterSheet } from '../components/game/CharacterSheet';
import { PartyView } from '../components/game/PartyView';
import { ChatSystem } from '../components/chat/ChatSystem';
import { RoomSettings } from '../components/room/RoomSettings';
import { Modal } from '../components/Modal';
import { FriendSelector } from '../components/room/FriendSelector';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useRoom } from '../hooks/useRoom';
import { userService } from '../services/userService';
import { RoomHeader } from '../components/room/RoomHeader';
import { RoomBottomNav } from '../components/room/RoomBottomNav';
import { RoomInvite } from '../types';

export const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const { roomData, loading } = useRoom(roomId);

  const [activeTab, setActiveTab] = useState<'dice' | 'char' | 'party'>('dice');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Layout State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Select own character by default when data is loaded
  useEffect(() => {
      if (user && roomData && !selectedPlayerId) {
          setSelectedPlayerId(user.uid);
      }
  }, [user, roomData]);

  if (loading) return <div className="p-8 text-slate-500">{t('room.loading')}</div>;

  if (!roomData) return <div className="p-8 text-red-500">{t('room.not_found')}</div>;

  // Check Access
  const isMember = roomData.members?.includes(user?.uid || '');
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
      if (!roomId) return;
      navigator.clipboard.writeText(roomId);
      addToast(t('room.copy_code') + roomId, 'success');
  };

  const handleInviteByEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteEmail.trim() || !user || !roomId) return;

      try {
          const targetUser = await userService.getUserByEmail(inviteEmail);

          if (!targetUser) {
              addToast(t('room.user_not_found_email'), 'error');
              return;
          }

          // Check if already in room
          if (roomData.members?.includes(targetUser.uid)) {
              addToast(t('room.user_already_in'), 'info');
              return;
          }

          const inviteData: RoomInvite = {
              roomId: roomId,
              roomName: roomData.name,
              inviterName: user.displayName || 'Unknown',
              timestamp: Date.now()
          };

          await userService.sendRoomInvite(targetUser.uid, inviteData);

          addToast(`${inviteEmail} ${t('room.invite_sent')}`, 'success');
          setInviteEmail('');
          setShowInviteModal(false);
      } catch (e) {
          console.error(e);
          addToast(t('room.invite_error'), 'error');
      }
  };

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Game Area */}
      <div className="flex-1 flex flex-col min-w-0 relative transition-all duration-300">
       <RoomHeader
          roomData={roomData}
          roomId={roomId!}
          userRole={userRole}
          isDM={isDM}
          isChatOpen={isChatOpen}
          copiedLink={copiedLink}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onOpenInvite={() => setShowInviteModal(true)}
          onCopyLink={handleCopyLink}
          onCopyCode={handleCopyCode}
          onOpenSettings={() => setShowSettings(true)}
       />

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

      <RoomBottomNav
        activeTab={activeTab}
        userRole={userRole}
        isDM={isDM}
        onTabChange={setActiveTab}
      />
      </div>

      {/* Right Sidebar: Chat */}
      <div className={`${isChatOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-slate-700 bg-slate-900 overflow-hidden flex flex-col relative z-20`}>
          <ChatSystem roomId={roomId} isOverlay={false} />
      </div>

      {/* Modals */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title={t('room.invite_modal_title')}>
          <form onSubmit={handleInviteByEmail} className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">{t('room.friend_email_label')}</label>
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
                  {t('room.send_invite')}
              </button>
          </form>

          {/* Friend List Selection */}
          <div className="mt-6 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-bold text-slate-400 mb-2">{t('room.select_friend')}</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                     <FriendSelector onSelect={(email) => setInviteEmail(email)} />
                </div>
          </div>
      </Modal>
    </div>
  );
};
