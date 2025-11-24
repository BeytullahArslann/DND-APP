import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { BackgroundDocument } from '../../types/cms';
import { Save, Trash2, Plus, Edit, X, ChevronDown, ChevronRight } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

// Must match keys in CharacterSheet for automation
const SKILL_KEYS = [
    'acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception',
    'history', 'insight', 'intimidation', 'investigation', 'medicine',
    'nature', 'perception', 'performance', 'persuasion', 'religion',
    'sleight_of_hand', 'stealth', 'survival'
];

interface EditFormProps {
  editingBackground: Partial<BackgroundDocument> | null;
  setEditingBackground: (bg: Partial<BackgroundDocument> | null) => void;
  fetchBackgrounds: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ editingBackground, setEditingBackground, fetchBackgrounds }) => {
  const [formData, setFormData] = useState<Partial<BackgroundDocument>>(editingBackground || {});
  const [showTR, setShowTR] = useState(false);

  useEffect(() => {
    // Deep clone to ensure nested translations object is editable without mutation issues
    setFormData(JSON.parse(JSON.stringify(editingBackground || {})));
  }, [editingBackground]);

  // Update Root (English/Default) Fields
  const handleChange = (key: keyof BackgroundDocument, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Update TR Translation Fields
  const handleTrChange = (key: keyof NonNullable<NonNullable<BackgroundDocument['translations']>['tr']>, value: any) => {
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

  const toggleSkill = (skill: string) => {
      const currentSkills = formData.bonuses?.skills || [];
      const newSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];

      setFormData(prev => ({
          ...prev,
          bonuses: {
              ...prev.bonuses,
              skills: newSkills
          }
      }));
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
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
             <h2 className="text-xl font-bold">{formData.id ? 'Geçmişi Düzenle' : 'Yeni Geçmiş'}</h2>
             <button onClick={() => setEditingBackground(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">

          {/* ENGLISH / DEFAULT SECTION (MANDATORY) */}
          <div className="border-b border-gray-700 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-indigo-400 mb-4">English Content (Mandatory)</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <div className="h-40 bg-white text-black rounded">
                    <RichTextEditor
                        value={formData.description || ''}
                        onChange={val => handleChange('description', val)}
                        className="h-full"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Display Text (Skill Proficiencies)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                      value={formData.skillProficiencies || ''}
                      onChange={e => handleChange('skillProficiencies', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Display Text (Tool Proficiencies)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                      value={formData.toolProficiencies || ''}
                      onChange={e => handleChange('toolProficiencies', e.target.value)}
                    />
                  </div>
              </div>

              {/* AUTOMATION SECTION */}
              <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded mt-4">
                  <h4 className="font-bold text-indigo-400 mb-2">Automation Mechanics</h4>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Skill Proficiencies (Select for auto-fill)</label>
                  <div className="grid grid-cols-3 gap-2">
                      {SKILL_KEYS.map(skill => (
                          <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={(formData.bonuses?.skills || []).includes(skill)}
                                onChange={() => toggleSkill(skill)}
                                className="rounded text-indigo-500 focus:ring-indigo-500"
                              />
                              <span className="capitalize text-sm text-gray-300">{skill.replace('_', ' ')}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Languages</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  value={formData.languages || ''}
                  onChange={e => handleChange('languages', e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Equipment</label>
                <div className="h-32 bg-white text-black rounded">
                    <RichTextEditor
                        value={formData.equipment || ''}
                        onChange={val => handleChange('equipment', val)}
                        className="h-full"
                    />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="font-bold text-md mb-2 text-indigo-300">Feature</h4>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Feature Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                      value={formData.featureName || ''}
                      onChange={e => handleChange('featureName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Feature Description</label>
                     <div className="h-32 bg-white text-black rounded">
                        <RichTextEditor
                            value={formData.featureDescription || ''}
                            onChange={val => handleChange('featureDescription', val)}
                            className="h-full"
                        />
                    </div>
                  </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Suggested Characteristics</label>
                  <div className="h-48 bg-white text-black rounded">
                    <RichTextEditor
                        value={formData.suggestedCharacteristics || ''}
                        onChange={val => handleChange('suggestedCharacteristics', val)}
                        className="h-full"
                    />
                  </div>
              </div>
          </div>

          {/* TURKISH / OPTIONAL SECTION */}
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
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">İsim (TR)</label>
                        <input
                          type="text"
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                          value={formData.translations?.tr?.name || ''}
                          onChange={e => handleTrChange('name', e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama (TR)</label>
                        <div className="h-40 bg-white text-black rounded">
                            <RichTextEditor
                                value={formData.translations?.tr?.description || ''}
                                onChange={val => handleTrChange('description', val)}
                                className="h-full"
                            />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Yetenek Yetkinlikleri (TR)</label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                              value={formData.translations?.tr?.skillProficiencies || ''}
                              onChange={e => handleTrChange('skillProficiencies', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Araç Yetkinlikleri (TR)</label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                              value={formData.translations?.tr?.toolProficiencies || ''}
                              onChange={e => handleTrChange('toolProficiencies', e.target.value)}
                            />
                          </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Diller (TR)</label>
                        <input
                          type="text"
                          className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                          value={formData.translations?.tr?.languages || ''}
                          onChange={e => handleTrChange('languages', e.target.value)}
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Ekipman (TR)</label>
                        <div className="h-32 bg-white text-black rounded">
                            <RichTextEditor
                                value={formData.translations?.tr?.equipment || ''}
                                onChange={val => handleTrChange('equipment', val)}
                                className="h-full"
                            />
                        </div>
                      </div>

                      <div className="border-t border-gray-700 pt-4 mt-4">
                          <h4 className="font-bold text-md mb-2 text-indigo-300">Özellik (TR)</h4>
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Özellik İsmi</label>
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                              value={formData.translations?.tr?.featureName || ''}
                              onChange={e => handleTrChange('featureName', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Özellik Açıklaması</label>
                             <div className="h-32 bg-white text-black rounded">
                                <RichTextEditor
                                    value={formData.translations?.tr?.featureDescription || ''}
                                    onChange={val => handleTrChange('featureDescription', val)}
                                    className="h-full"
                                />
                            </div>
                          </div>
                      </div>

                      <div className="border-t border-gray-700 pt-4 mt-4">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Önerilen Özellikler (TR)</label>
                          <div className="h-48 bg-white text-black rounded">
                            <RichTextEditor
                                value={formData.translations?.tr?.suggestedCharacteristics || ''}
                                onChange={val => handleTrChange('suggestedCharacteristics', val)}
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
  const [editingBackground, setEditingBackground] = useState<Partial<BackgroundDocument> | null>(null);

  const fetchBackgrounds = async () => {
    const data = await cmsService.getBackgrounds();
    setBackgrounds(data);
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

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
          <button
            onClick={() => setEditingBackground({ name: '', description: '', bonuses: { skills: [] } })}
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
              <div className="flex items-center gap-2">
                   <h3 className="font-bold text-lg">{bg.name}</h3>
                   {bg.translations?.tr?.name && (
                       <span className="text-sm text-gray-400 italic">({bg.translations.tr.name})</span>
                   )}
              </div>
              <p className="text-gray-400 text-sm truncate max-w-xl" dangerouslySetInnerHTML={{ __html: bg.description.substring(0, 100) + '...' }}></p>
              {bg.bonuses?.skills && bg.bonuses.skills.length > 0 && (
                  <div className="flex gap-1 mt-1">
                      {bg.bonuses.skills.map(s => (
                          <span key={s} className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded capitalize">{s.replace('_', ' ')}</span>
                      ))}
                  </div>
              )}
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
