import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { UserProfile } from '../../types';
import { Search, Shield, ShieldOff, Ban, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (targetUid: string, currentStatus: boolean | undefined) => {
    if (targetUid === currentUser?.uid) {
      alert("Kendi yetkinizi değiştiremezsiniz.");
      return;
    }
    if (confirm(`Bu kullanıcının admin yetkisini ${currentStatus ? 'almak' : 'vermek'} istediğinize emin misiniz?`)) {
      try {
        await userService.toggleAdminStatus(targetUid, !currentStatus);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error("Error toggling admin:", error);
        alert("İşlem başarısız oldu.");
      }
    }
  };

  const handleBanUser = async (targetUid: string, isBanned: boolean | undefined) => {
      if (targetUid === currentUser?.uid) {
          alert("Kendinizi yasaklayamazsınız.");
          return;
      }
      const action = isBanned ? 'yasağını kaldırmak' : 'yasaklamak';
      if (confirm(`Bu kullanıcıyı ${action} istediğinize emin misiniz?`)) {
          try {
              await userService.banUser(targetUid, !isBanned);
              fetchUsers();
          } catch (error) {
              console.error("Error banning user:", error);
              alert("İşlem başarısız oldu.");
          }
      }
  };

  const handleDeleteUser = async (targetUid: string) => {
      if (targetUid === currentUser?.uid) {
          alert("Kendinizi silemezsiniz.");
          return;
      }
      if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
          try {
              await userService.deleteUser(targetUid);
              setUsers(prev => prev.filter(u => u.uid !== targetUid));
          } catch (error) {
              console.error("Error deleting user:", error);
              alert("İşlem başarısız oldu.");
              fetchUsers(); // Revert state on error
          }
      }
  };

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Kullanıcı Yönetimi</h1>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="İsim veya E-posta ile ara..."
          className="w-full pl-10 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-900 text-gray-400 uppercase text-sm">
              <tr>
                <th className="px-6 py-3">Kullanıcı</th>
                <th className="px-6 py-3">E-posta</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Yükleniyor...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Kullanıcı bulunamadı.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-750">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName || ''} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                          {u.displayName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                          <span className="font-medium text-white block">{u.displayName || 'İsimsiz'}</span>
                          {u.isBanned && <span className="text-xs text-red-500 font-bold">Yasaklı</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.isAdmin ? (
                        <span className="px-2 py-1 text-xs font-bold rounded bg-green-900 text-green-300">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold rounded bg-gray-700 text-gray-300">
                          Kullanıcı
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleAdmin(u.uid, u.isAdmin)}
                        className={`p-2 rounded transition-colors ${
                          u.isAdmin
                            ? 'text-yellow-400 hover:bg-yellow-900/50'
                            : 'text-green-400 hover:bg-green-900/50'
                        }`}
                        title={u.isAdmin ? "Admin yetkisini al" : "Admin yap"}
                      >
                        {u.isAdmin ? <ShieldOff size={20} /> : <Shield size={20} />}
                      </button>
                      <button
                          onClick={() => handleBanUser(u.uid, u.isBanned)}
                          className={`p-2 rounded transition-colors ${
                              u.isBanned
                                  ? 'text-gray-400 hover:bg-gray-700'
                                  : 'text-orange-400 hover:bg-orange-900/50'
                          }`}
                          title={u.isBanned ? "Yasağı kaldır" : "Yasakla"}
                      >
                          <Ban size={20} />
                      </button>
                      <button
                          onClick={() => handleDeleteUser(u.uid)}
                          className="p-2 rounded transition-colors text-red-400 hover:bg-red-900/50"
                          title="Kullanıcıyı sil"
                      >
                          <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
