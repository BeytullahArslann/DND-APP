import React, { useState } from 'react';
import { cmsService } from '../../services/cmsService';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleResetAndSeed = async () => {
    if (confirm('UYARI: Bu işlem tüm kuralları ve büyüleri silecek ve JSON dosyalarından yeniden oluşturacaktır. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
        setLoading(true);
        try {
            await cmsService.resetAndSeedDatabase();
            alert('Veritabanı başarıyla sıfırlandı ve yeniden oluşturuldu!');
        } catch (e) {
            console.error(e);
            alert('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Veri İşlemleri</h2>
        <p className="text-gray-400 mb-4">
          Aşağıdaki buton mevcut veritabanındaki (kurallar ve büyüler) tüm verileri siler ve kaynak dosyalardan güncel formatta yeniden yükler.
          Yeni editör formatlarına geçiş için bu işlemi bir kez yapmanız önerilir.
        </p>
        <button
          onClick={handleResetAndSeed}
          disabled={loading}
          className={`px-4 py-2 rounded text-white font-bold ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {loading ? 'İşleniyor...' : 'Veritabanını Sıfırla ve Doldur (Reset & Seed)'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
