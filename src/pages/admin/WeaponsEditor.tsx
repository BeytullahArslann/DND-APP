import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { WeaponDocument, Language } from '../../types/cms';
import { Save, Trash2, Plus, Edit, X } from 'lucide-react';

interface WeaponFormProps {
  editingWeapon: Partial<WeaponDocument> | null;
  setEditingWeapon: (weapon: Partial<WeaponDocument> | null) => void;
  fetchWeapons: () => void;
}

const WeaponForm: React.FC<WeaponFormProps> = ({ editingWeapon, setEditingWeapon, fetchWeapons }) => {
  const handleSave = async () => {
    if (!editingWeapon || !editingWeapon.name) return;
    try {
      await cmsService.saveWeapon(editingWeapon);
      setEditingWeapon(null);
      fetchWeapons();
    } catch (e) {
      console.error(e);
      alert('Kaydetme başarısız.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingWeapon?.id ? 'Silah Düzenle' : 'Yeni Silah'}</h2>
            <button onClick={() => setEditingWeapon(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">İsim</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingWeapon?.name || ''}
                    onChange={e => setEditingWeapon({...editingWeapon, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Kategori</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    placeholder="Basit Yakın Dövüş"
                    value={editingWeapon?.category || ''}
                    onChange={e => setEditingWeapon({...editingWeapon, category: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hasar</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    placeholder="1d8"
                    value={editingWeapon?.damage || ''}
                    onChange={e => setEditingWeapon({...editingWeapon, damage: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hasar Tipi</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    placeholder="kesme"
                    value={editingWeapon?.damageType || ''}
                    onChange={e => setEditingWeapon({...editingWeapon, damageType: e.target.value})}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Maliyet</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingWeapon?.cost || ''}
                    onChange={e => setEditingWeapon({...editingWeapon, cost: e.target.value})}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Ağırlık</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingWeapon?.weight || ''}
                    onChange={e => setEditingWeapon({...editingWeapon, weight: e.target.value})}
                />
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Özellikler (Virgülle ayırın)</label>
            <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                value={editingWeapon?.properties?.join(', ') || ''}
                onChange={e => setEditingWeapon({...editingWeapon, properties: e.target.value.split(',').map(s => s.trim())})}
            />
        </div>

        <div className="flex justify-end gap-2 mt-4">
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
                Kaydet
            </button>
        </div>
      </div>
    </div>
  );
};

const WeaponsEditor: React.FC = () => {
  const [weapons, setWeapons] = useState<WeaponDocument[]>([]);
  const [language, setLanguage] = useState<Language>('tr');
  const [editingWeapon, setEditingWeapon] = useState<Partial<WeaponDocument> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWeapons = async () => {
    const data = await cmsService.getWeapons(language);
    setWeapons(data);
  };

  useEffect(() => {
    fetchWeapons();
  }, [language]);

  const handleDelete = async (id: string) => {
    if (confirm('Bu silahı silmek istediğinize emin misiniz?')) {
      await cmsService.deleteWeapon(id);
      fetchWeapons();
    }
  };

  const filteredWeapons = weapons.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Silah Yönetimi</h1>
        <div className="flex items-center gap-4">
            <input
                type="text"
                placeholder="Silah ara..."
                className="bg-gray-800 border border-gray-700 text-white p-2 rounded"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-800 border border-gray-700 text-white p-2 rounded"
            >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
            </select>
            <button
                onClick={() => setEditingWeapon({ language, name: '', category: '', damage: '', damageType: '', properties: [] })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
                <Plus size={20} /> Yeni Silah
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWeapons.map((weapon) => (
            <div key={weapon.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col justify-between">
                <div className="mb-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-indigo-400">{weapon.name}</h3>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{weapon.category}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                        {weapon.damage} {weapon.damageType}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {weapon.properties.join(', ')}
                    </p>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-700 pt-3">
                    <button
                        onClick={() => setEditingWeapon(weapon)}
                        className="p-2 text-blue-400 hover:bg-blue-900/30 rounded"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => weapon.id && handleDelete(weapon.id)}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {editingWeapon && (
        <WeaponForm
          editingWeapon={editingWeapon}
          setEditingWeapon={setEditingWeapon}
          fetchWeapons={fetchWeapons}
        />
      )}
    </div>
  );
};

export default WeaponsEditor;
