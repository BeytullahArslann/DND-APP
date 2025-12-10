import React from 'react';
import { Scroll, Dices, Users, Contact } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RoomBottomNavProps {
  activeTab: 'dice' | 'char' | 'party' | 'npc';
  userRole: string;
  isDM: boolean;
  onTabChange: (tab: 'dice' | 'char' | 'party' | 'npc') => void;
}

export const RoomBottomNav: React.FC<RoomBottomNavProps> = ({
  activeTab,
  userRole,
  isDM,
  onTabChange
}) => {
  const { t } = useTranslation();

  return (
    <nav className="bg-slate-800 border-t border-slate-700 p-2 pb-safe z-20">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {userRole !== 'spectator' && (
            <button
              onClick={() => onTabChange('char')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors w-16 ${activeTab === 'char' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Scroll className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{isDM ? t('room.edit') : t('room.character')}</span>
            </button>
        )}

        <button
          onClick={() => onTabChange('dice')}
          className={`flex flex-col items-center justify-center p-2 transition-all transform -translate-y-5 bg-slate-800 border-4 border-slate-900 shadow-lg rounded-full w-16 h-16 ${activeTab === 'dice' ? 'text-amber-500 ring-2 ring-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
        >
          <Dices className={`w-8 h-8 ${activeTab === 'dice' ? 'animate-spin-slow' : ''}`} />
        </button>

        <button
          onClick={() => onTabChange('party')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors w-16 ${activeTab === 'party' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">{t('room.party')}</span>
        </button>

        <button
          onClick={() => onTabChange('npc')}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors w-16 ${activeTab === 'npc' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Contact className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">NPC</span>
        </button>
      </div>
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </nav>
  );
};
