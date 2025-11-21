import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { SpellDocument, Language } from '../../types/cms';
import { Save, Trash2, Plus, Edit, X } from 'lucide-react';

interface SpellFormProps {
  editingSpell: Partial<SpellDocument> | null;
  setEditingSpell: (spell: Partial<SpellDocument> | null) => void;
  fetchSpells: () => void;
}

const SpellForm: React.FC<SpellFormProps> = ({ editingSpell, setEditingSpell, fetchSpells }) => {
  const handleSave = async () => {
    if (!editingSpell || !editingSpell.name) return;
    try {
      await cmsService.saveSpell(editingSpell);
      setEditingSpell(null);
      fetchSpells();
    } catch (e) {
      console.error(e);
      alert('Kaydetme başarısız.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingSpell?.id ? 'Büyü Düzenle' : 'Yeni Büyü'}</h2>
            <button onClick={() => setEditingSpell(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">İsim</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingSpell?.name || ''}
                    onChange={e => setEditingSpell({...editingSpell, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Seviye (0 = Cantrip)</label>
                <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingSpell?.level ?? 0}
                    onChange={e => setEditingSpell({...editingSpell, level: Number(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Okul (Kısaltma örn: V, S)</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingSpell?.school || ''}
                    onChange={e => setEditingSpell({...editingSpell, school: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Kullanım Süresi</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingSpell?.time || ''}
                    onChange={e => setEditingSpell({...editingSpell, time: e.target.value})}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Menzil</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingSpell?.range || ''}
                    onChange={e => setEditingSpell({...editingSpell, range: e.target.value})}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Süre</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingSpell?.duration || ''}
                    onChange={e => setEditingSpell({...editingSpell, duration: e.target.value})}
                />
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Bileşenler</label>
            <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                value={editingSpell?.components || ''}
                onChange={e => setEditingSpell({...editingSpell, components: e.target.value})}
            />
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama (JSON formatında dizi olabilir)</label>
            <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-32 font-mono text-sm"
                value={editingSpell?.description || ''}
                onChange={e => setEditingSpell({...editingSpell, description: e.target.value})}
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

const SpellsEditor: React.FC = () => {
  const [spells, setSpells] = useState<SpellDocument[]>([]);
  const [language, setLanguage] = useState<Language>('tr');
  const [editingSpell, setEditingSpell] = useState<Partial<SpellDocument> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSpells = async () => {
    const data = await cmsService.getSpells(language);
    setSpells(data);
  };

  useEffect(() => {
    fetchSpells();
  }, [language]);

  const handleDelete = async (id: string) => {
    if (confirm('Bu büyüyü silmek istediğinize emin misiniz?')) {
      await cmsService.deleteSpell(id);
      fetchSpells();
    }
  };

  const filteredSpells = spells.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Büyü Yönetimi</h1>
        <div className="flex items-center gap-4">
            <input
                type="text"
                placeholder="Büyü ara..."
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
                onClick={() => setEditingSpell({ language, name: '', level: 0, school: '', time: '', range: '', components: '', duration: '', description: '[]', classes: [] })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
                <Plus size={20} /> Yeni Büyü
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpells.map((spell) => (
            <div key={spell.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col justify-between">
                <div className="mb-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-indigo-400">{spell.name}</h3>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{spell.level === 0 ? 'Cantrip' : `${spell.level}. Seviye`}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{spell.school} • {spell.components}</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-700 pt-3">
                    <button
                        onClick={() => setEditingSpell(spell)}
                        className="p-2 text-blue-400 hover:bg-blue-900/30 rounded"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => spell.id && handleDelete(spell.id)}
                        className="p-2 text-red-400 hover:bg-red-900/30 rounded"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {editingSpell && (
        <SpellForm
          editingSpell={editingSpell}
          setEditingSpell={setEditingSpell}
          fetchSpells={fetchSpells}
        />
      )}
    </div>
  );
};

export default SpellsEditor;
