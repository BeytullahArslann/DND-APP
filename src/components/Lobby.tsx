import React, { useState } from 'react';
import { Dices } from 'lucide-react';

interface LobbyProps {
  onJoin: (name: string, room: string, role: string) => void;
}

export const Lobby = ({ onJoin }: LobbyProps) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('room') || '';
  });
  const [role, setRole] = useState('player');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && room) {
      setLoading(true);
      onJoin(name, room, role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <div className="flex justify-center mb-6">
          <Dices className="w-16 h-16 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-center text-amber-500 mb-2">Zindan Ustası</h1>
        <p className="text-slate-400 text-center mb-8">Rolünü seç ve maceraya katıl.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Örn: Caner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Oda Kodu</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Örn: masa1"
              required
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                  <option value="player">Oyuncu (Karakter Yönetimi)</option>
                  <option value="dm">DM (Yönetici)</option>
                  <option value="spectator">İzleyici (Sadece İzle)</option>
              </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition-colors shadow-lg mt-4 ${loading ? 'bg-slate-600' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {loading ? 'Katılıyor...' : 'Maceraya Katıl'}
          </button>
        </form>
      </div>
    </div>
  );
};
