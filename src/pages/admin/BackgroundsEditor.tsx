import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { BackgroundDocument, Language } from '../../types/cms';
import { Save, Trash2, Plus, Edit } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

interface EditFormProps {
  editingBackground: Partial<BackgroundDocument> | null;
  setEditingBackground: (bg: Partial<BackgroundDocument> | null) => void;
  fetchBackgrounds: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ editingBackground, setEditingBackground, fetchBackgrounds }) => {
  const [formData, setFormData] = useState<Partial<BackgroundDocument>>(editingBackground || {});

  useEffect(() => {
    setFormData(editingBackground || {});
  }, [editingBackground]);

  const handleChange = (key: keyof BackgroundDocument, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    try {
      await cmsService.saveBackground(formData);
      setEditingBackground(null);
      fetchBackgrounds();
    } catch (e) {
      console.error(e);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <h2 className="text-xl font-bold mb-4">{formData.id ? 'Geçmişi Düzenle' : 'Yeni Geçmiş'}</h2>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">İsim</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label>
            <div className="h-40">
                <RichTextEditor
                    value={formData.description || ''}
                    onChange={val => handleChange('description', val)}
                    className="h-full"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Yetenek Yetkinlikleri</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={formData.skillProficiencies || ''}
                  onChange={e => handleChange('skillProficiencies', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Araç Yetkinlikleri</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={formData.toolProficiencies || ''}
                  onChange={e => handleChange('toolProficiencies', e.target.value)}
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Diller</label>
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              value={formData.languages || ''}
              onChange={e => handleChange('languages', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Ekipman</label>
            <div className="h-32">
                <RichTextEditor
                    value={formData.equipment || ''}
                    onChange={val => handleChange('equipment', val)}
                    className="h-full"
                />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="font-bold text-lg mb-2 text-indigo-400">Özellik</h3>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Özellik İsmi</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={formData.featureName || ''}
                  onChange={e => handleChange('featureName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Özellik Açıklaması</label>
                 <div className="h-32">
                    <RichTextEditor
                        value={formData.featureDescription || ''}
                        onChange={val => handleChange('featureDescription', val)}
                        className="h-full"
                    />
                </div>
              </div>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Önerilen Özellikler (Tablolar)</label>
              <div className="h-64">
                <RichTextEditor
                    value={formData.suggestedCharacteristics || ''}
                    onChange={val => handleChange('suggestedCharacteristics', val)}
                    className="h-full"
                />
              </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setEditingBackground(null)}
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

const BackgroundsEditor: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<BackgroundDocument[]>([]);
  const [language, setLanguage] = useState<Language>('tr');
  const [editingBackground, setEditingBackground] = useState<Partial<BackgroundDocument> | null>(null);

  const fetchBackgrounds = async () => {
    const data = await cmsService.getBackgrounds(language);
    setBackgrounds(data);
  };

  useEffect(() => {
    fetchBackgrounds();
  }, [language]);

  const handleDelete = async (id: string) => {
    if (confirm('Bu geçmişi silmek istediğinize emin misiniz?')) {
      await cmsService.deleteBackground(id);
      fetchBackgrounds();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Geçmiş (Background) Yönetimi</h1>
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-gray-800 border border-gray-700 text-white p-2 rounded"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
          <button
            onClick={() => setEditingBackground({ language, name: '', description: '' })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            <Plus size={20} /> Yeni Geçmiş
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {backgrounds.map((bg) => (
          <div key={bg.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{bg.name}</h3>
              <p className="text-gray-400 text-sm truncate max-w-xl" dangerouslySetInnerHTML={{ __html: bg.description.substring(0, 100) + '...' }}></p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingBackground(bg)}
                className="p-2 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => bg.id && handleDelete(bg.id)}
                className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {backgrounds.length === 0 && <p className="text-gray-500 text-center py-10">Kayıtlı geçmiş bulunamadı.</p>}
      </div>

      {editingBackground && (
        <EditForm
          editingBackground={editingBackground}
          setEditingBackground={setEditingBackground}
          fetchBackgrounds={fetchBackgrounds}
        />
      )}
    </div>
  );
};

export default BackgroundsEditor;
