import React from 'react';
import { Room } from '../../types';
import { Copy, Mail, Share2, Settings, Crown, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RoomHeaderProps {
  roomData: Room;
  roomId: string;
  userRole: string;
  isDM: boolean;
  isChatOpen: boolean;
  copiedLink: boolean;
  onToggleChat: () => void;
  onOpenInvite: () => void;
  onCopyLink: () => void;
  onCopyCode: () => void;
  onOpenSettings: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomData,
  roomId,
  userRole,
  isDM,
  isChatOpen,
  copiedLink,
  onToggleChat,
  onOpenInvite,
  onCopyLink,
  onCopyCode,
  onOpenSettings
}) => {
  const { t } = useTranslation();

  return (
    <header className="bg-slate-800 p-3 shadow-md border-b border-slate-700 flex justify-between items-center z-10">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-bold text-amber-500 truncate max-w-[150px] md:max-w-xs">{roomData.name}</span>

        {/* Room Code Display */}
        <div
          onClick={onCopyCode}
          className="hidden md:flex items-center bg-slate-900/50 px-2 py-1 rounded border border-slate-700 text-xs text-slate-400 cursor-pointer hover:bg-slate-700 hover:text-white ml-4"
          title={t('room.copy_title')}
        >
           <span className="font-mono mr-2">ID: {roomId}</span>
           <Copy size={12} />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-slate-400">
           <button
              onClick={onOpenInvite}
              className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title={t('room.invite_email')}
          >
              <Mail size={18} />
          </button>

          <button
              onClick={onCopyLink}
              className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title={t('room.copy_link')}
          >
              {copiedLink ? <span className="text-green-400 text-xs font-bold">{t('room.copied')}</span> : <Share2 size={18} />}
          </button>

          {isDM && (
              <>
                  <button
                      onClick={onOpenSettings}
                      className="p-2 hover:bg-slate-700 rounded text-amber-500 hover:text-amber-300 transition-colors relative"
                      title={t('room.settings')}
                  >
                      <Settings size={18} />
                      {roomData.pendingRequests && roomData.pendingRequests.length > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                  </button>
                  <span className="flex items-center text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50"><Crown className="w-3 h-3 mr-1"/> {t('room.dm_badge')}</span>
              </>
          )}
          {userRole === 'spectator' && <span className="flex items-center text-blue-400"><Eye className="w-3 h-3 mr-1"/> {t('room.spectator_badge')}</span>}

          <button
              onClick={onToggleChat}
              className={`ml-2 p-1 rounded border ${isChatOpen ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
          >
              {isChatOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
      </div>
    </header>
  );
};
