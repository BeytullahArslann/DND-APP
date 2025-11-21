import React from 'react';
import { cmsService } from '../../services/cmsService';

const AdminDashboard: React.FC = () => {
  const handleSeed = async () => {
    if (confirm('Mevcut veriler veritabanına eklenecek. Bu işlem biraz sürebilir. Devam etmek istiyor musunuz?')) {
        try {
            await cmsService.seedDatabase();
            alert('Veri aktarımı tamamlandı!');
        } catch (e) {
            console.error(e);
            alert('Bir hata oluştu.');
        }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Veri İşlemleri</h2>
        <p className="text-gray-400 mb-4">
          Mevcut JSON dosyalarındaki (kurallar ve büyüler) verileri Firebase veritabanına aktarmak için aşağıdaki butonu kullanın.
          Bu işlemi sadece ilk kurulumda veya verileri sıfırlamak istediğinizde yapmalısınız.
        </p>
        <button
          onClick={handleSeed}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
        >
          Veritabanını Tohumla (Seed Database)
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
