import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { ArmorDocument } from '../../types/cms';
import { Save, Trash2, Plus, Edit, X, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

interface EditFormProps {
  editingArmor: Partial<ArmorDocument> | null;
  setEditingArmor: (armor: Partial<ArmorDocument> | null) => void;
  fetchArmors: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ editingArmor, setEditingArmor, fetchArmors }) => {
  const [formData, setFormData] = useState<Partial<ArmorDocument>>(editingArmor || {});
  const [showTR, setShowTR] = useState(false);

  useEffect(() => {
    // Deep clone to allow safe nested updates
    setFormData(JSON.parse(JSON.stringify(editingArmor || {})));
  }, [editingArmor]);

  const handleChange = (key: keyof ArmorDocument, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTrChange = (key: keyof NonNullable<NonNullable<ArmorDocument['translations']>['tr']>, value: any) => {
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

  const onSave = async () => {
    try {
      await cmsService.saveArmor(formData);
      setEditingArmor(null);
      fetchArmors();
    } catch (e) {
      console.error(e);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2"><Shield size={24}/> {formData.id ? 'Zırh Düzenle' : 'Yeni Zırh'}</h2>
            <button onClick={() => setEditingArmor(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <select
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formData.type || 'Light'}
                        onChange={e => handleChange('type', e.target.value)}
                    >
                        <option value="Light">Light Armor</option>
                        <option value="Medium">Medium Armor</option>
                        <option value="Heavy">Heavy Armor</option>
                        <option value="Shield">Shield</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">AC (Base)</label>
                    <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.ac || 10}
                    onChange={e => handleChange('ac', parseInt(e.target.value))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Dex Bonus Limit</label>
                    <select
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formData.dexBonus || 'Full'}
                        onChange={e => handleChange('dexBonus', e.target.value)}
                    >
                        <option value="Full">Full Dex Modifier</option>
                        <option value="Max 2">Max 2</option>
                        <option value="None">None</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Strength Requirement</label>
                    <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={formData.strengthRequirement || 0}
                    onChange={e => handleChange('strengthRequirement', parseInt(e.target.value))}
                    />
                </div>
                <div className="flex items-center gap-3 pt-6">
                    <input
                        type="checkbox"
                        id="stealthDis"
                        className="w-5 h-5"
                        checked={formData.stealthDisadvantage || false}
                        onChange={e => handleChange('stealthDisadvantage', e.target.checked)}
                    />
                    <label htmlFor="stealthDis" className="text-sm font-medium text-gray-400 cursor-pointer">Stealth Disadvantage</label>
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
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tip (TR)</label>
                            <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={formData.translations?.tr?.type || ''}
                            onChange={e => handleTrChange('type', e.target.value)}
                            />
                        </div>
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
            onClick={() => setEditingArmor(null)}
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

const ArmorsEditor: React.FC = () => {
  const [armors, setArmors] = useState<ArmorDocument[]>([]);
  const [editingArmor, setEditingArmor] = useState<Partial<ArmorDocument> | null>(null);

  const fetchArmors = async () => {
    const data = await cmsService.getArmors();
    setArmors(data);
  };

  useEffect(() => {
    fetchArmors();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bu zırhı silmek istediğinize emin misiniz?')) {
      await cmsService.deleteArmor(id);
      fetchArmors();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Zırh Yönetimi</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditingArmor({ name: '', type: 'Light', ac: 11, dexBonus: 'Full', stealthDisadvantage: false })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            <Plus size={20} /> Yeni Zırh
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {armors.map((armor) => (
          <div key={armor.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{armor.name}</h3>
                  {armor.translations?.tr?.name && (
                      <span className="text-sm text-gray-400 italic">({armor.translations.tr.name})</span>
                  )}
              </div>
              <p className="text-gray-400 text-sm">
                AC {armor.ac} | {armor.type} | Dex: {armor.dexBonus} | {armor.stealthDisadvantage ? 'Stealth Disadv.' : 'No Stealth Penalty'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingArmor(armor)}
                className="p-2 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => armor.id && handleDelete(armor.id)}
                className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {armors.length === 0 && <p className="text-gray-500 text-center py-10">Kayıtlı zırh bulunamadı.</p>}
      </div>

      {editingArmor && (
        <EditForm
          editingArmor={editingArmor}
          setEditingArmor={setEditingArmor}
          fetchArmors={fetchArmors}
        />
      )}
    </div>
  );
};

export default ArmorsEditor;
