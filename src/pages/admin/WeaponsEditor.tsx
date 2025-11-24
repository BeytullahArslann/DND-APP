import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { WeaponDocument } from '../../types/cms';
import { Save, Trash2, Plus, Edit, X, ChevronDown, ChevronRight } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

interface EditFormProps {
  editingWeapon: Partial<WeaponDocument> | null;
  setEditingWeapon: (weapon: Partial<WeaponDocument> | null) => void;
  fetchWeapons: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ editingWeapon, setEditingWeapon, fetchWeapons }) => {
  const [formData, setFormData] = useState<Partial<WeaponDocument>>(editingWeapon || {});
  const [showTR, setShowTR] = useState(false);

  useEffect(() => {
    // Deep clone to allow safe nested updates
    setFormData(JSON.parse(JSON.stringify(editingWeapon || {})));
  }, [editingWeapon]);

  const handleChange = (key: keyof WeaponDocument, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTrChange = (key: keyof NonNullable<NonNullable<WeaponDocument['translations']>['tr']>, value: any) => {
      setFormData(prev => ({
          ...prev,
          translations: {
              ...prev.translations,
              tr: {
                  ...prev.translations?.tr,
                  [key]: value
              }
          }
      }));
  };

  const handlePropertyChange = (prop: string, checked: boolean, isTr: boolean = false) => {
      // This is a simple implementation. For production, handle arrays properly.
      // Assuming properties is string[]
      const currentProps = isTr
        ? (formData.translations?.tr?.properties || [])
        : (formData.properties || []);

      let newProps;
      if (checked) {
          newProps = [...currentProps, prop];
      } else {
          newProps = currentProps.filter(p => p !== prop);
      }

      if (isTr) {
          handleTrChange('properties', newProps);
      } else {
          handleChange('properties', newProps);
      }
  };

  const onSave = async () => {
    try {
      await cmsService.saveWeapon(formData);
      setEditingWeapon(null);
      fetchWeapons();
    } catch (e) {
      console.error(e);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl font-bold">{formData.id ? 'Silah Düzenle' : 'Yeni Silah'}</h2>
            <button onClick={() => setEditingWeapon(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">

          {/* ENGLISH (MANDATORY) */}
          <div className="border-b border-gray-700 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-indigo-400 mb-4">English Content (Mandatory)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.category || ''}
                    onChange={e => handleChange('category', e.target.value)}
                    placeholder="Simple Melee, Martial Ranged..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Damage</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.damage || ''}
                    onChange={e => handleChange('damage', e.target.value)}
                    placeholder="1d8"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Damage Type</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.damageType || ''}
                    onChange={e => handleChange('damageType', e.target.value)}
                    placeholder="slashing"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Weight</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.weight || ''}
                    onChange={e => handleChange('weight', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cost</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.cost || ''}
                    onChange={e => handleChange('cost', e.target.value)}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Range</label>
                    <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.range || ''}
                    onChange={e => handleChange('range', e.target.value)}
                    />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Properties (comma separated)</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.properties?.join(', ') || ''}
                    onChange={e => handleChange('properties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <div className="h-32 bg-white text-black rounded">
                    <RichTextEditor
                        value={formData.description || ''}
                        onChange={val => handleChange('description', val)}
                        className="h-full"
                    />
                </div>
              </div>
          </div>

          {/* TURKISH (OPTIONAL) */}
          <div className="mb-4">
            <button
                onClick={() => setShowTR(!showTR)}
                className="flex items-center gap-2 text-lg font-semibold text-indigo-400 hover:text-indigo-300 w-full text-left"
            >
                {showTR ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Turkish Translation (Optional)
            </button>

            {showTR && (
                <div className="mt-4 pl-4 border-l-2 border-indigo-900/50 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">İsim (TR)</label>
                            <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.translations?.tr?.name || ''}
                            onChange={e => handleTrChange('name', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Kategori (TR)</label>
                            <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.translations?.tr?.category || ''}
                            onChange={e => handleTrChange('category', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Hasar Tipi (TR)</label>
                            <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.translations?.tr?.damageType || ''}
                            onChange={e => handleTrChange('damageType', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Özellikler (TR, virgülle ayırın)</label>
                        <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.translations?.tr?.properties?.join(', ') || ''}
                            onChange={e => handleTrChange('properties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama (TR)</label>
                        <div className="h-32 bg-white text-black rounded">
                            <RichTextEditor
                                value={formData.translations?.tr?.description || ''}
                                onChange={val => handleTrChange('description', val)}
                                className="h-full"
                            />
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700 shrink-0">
          <button
            onClick={() => setEditingWeapon(null)}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-2"
          >
            <Save size={18} /> Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

const WeaponsEditor: React.FC = () => {
  const [weapons, setWeapons] = useState<WeaponDocument[]>([]);
  const [editingWeapon, setEditingWeapon] = useState<Partial<WeaponDocument> | null>(null);

  const fetchWeapons = async () => {
    // Fetch all weapons (unified documents)
    const data = await cmsService.getWeapons();
    setWeapons(data);
  };

  useEffect(() => {
    fetchWeapons();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bu silahı silmek istediğinize emin misiniz?')) {
      await cmsService.deleteWeapon(id);
      fetchWeapons();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Silah Yönetimi</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditingWeapon({ name: '', category: '', properties: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            <Plus size={20} /> Yeni Silah
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {weapons.map((weapon) => (
          <div key={weapon.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{weapon.name}</h3>
                  {weapon.translations?.tr?.name && (
                      <span className="text-sm text-gray-400 italic">({weapon.translations.tr.name})</span>
                  )}
              </div>
              <p className="text-gray-400 text-sm">
                {weapon.category} • {weapon.damage} {weapon.damageType}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingWeapon(weapon)}
                className="p-2 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => weapon.id && handleDelete(weapon.id)}
                className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {weapons.length === 0 && <p className="text-gray-500 text-center py-10">Kayıtlı silah bulunamadı.</p>}
      </div>

      {editingWeapon && (
        <EditForm
          editingWeapon={editingWeapon}
          setEditingWeapon={setEditingWeapon}
          fetchWeapons={fetchWeapons}
        />
      )}
    </div>
  );
};

export default WeaponsEditor;
