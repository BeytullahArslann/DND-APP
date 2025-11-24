import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { SpellDocument } from '../../types/cms';
import { Trash2, Plus, Edit, X, ChevronDown, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { SPELL_SCHOOLS, CASTING_TIMES, SPELL_RANGES, DURATIONS, COMPONENTS } from '../../data/spellConstants';

interface SpellFormProps {
  editingSpell: Partial<SpellDocument> | null;
  setEditingSpell: (spell: Partial<SpellDocument> | null) => void;
  fetchSpells: () => void;
}

const SpellForm: React.FC<SpellFormProps> = ({ editingSpell, setEditingSpell, fetchSpells }) => {
  const [showTR, setShowTR] = useState(false);

  // Use local state for form inputs to handle nested structure cleanly
  const [formState, setFormState] = useState({
      ...editingSpell,
      translations: {
          tr: {
              ...editingSpell?.translations?.tr
          }
      }
  });

  const updateField = (field: keyof SpellDocument, value: any) => {
      setFormState(prev => ({ ...prev, [field]: value }));
  };

  const updateTrField = (field: keyof NonNullable<NonNullable<SpellDocument['translations']>['tr']>, value: any) => {
      setFormState(prev => ({
          ...prev,
          translations: {
              ...prev.translations,
              tr: {
                  ...prev.translations?.tr,
                  [field]: value
              }
          }
      }));
  };

  const handleSave = async () => {
    if (!formState || !formState.name) return;
    try {
      await cmsService.saveSpell(formState);
      setEditingSpell(null);
      fetchSpells();
    } catch (e) {
      console.error(e);
      alert('Kaydetme başarısız.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto flex flex-col custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingSpell?.id ? 'Büyü Düzenle' : 'Yeni Büyü'}</h2>
            <button onClick={() => setEditingSpell(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        {/* ENGLISH (DEFAULT/MANDATORY) */}
        <div className="border-b border-gray-700 pb-6 mb-6">
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">English Content (Mandatory)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input
                        type="text"
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formState.name || ''}
                        onChange={e => updateField('name', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Level (0 = Cantrip)</label>
                    <input
                        type="number"
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formState.level ?? 0}
                        onChange={e => updateField('level', Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">School</label>
                    <select
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                        value={formState.school || ''}
                        onChange={e => updateField('school', e.target.value)}
                    >
                        <option value="">Select</option>
                        {SPELL_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Casting Time</label>
                    {/* Assuming free text or simplified selection for now, or use mapped EN values */}
                    <input
                        type="text"
                         className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                         value={formState.time || ''}
                         onChange={e => updateField('time', e.target.value)}
                         placeholder="e.g. 1 Action"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Range</label>
                     <input
                        type="text"
                         className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                         value={formState.range || ''}
                         onChange={e => updateField('range', e.target.value)}
                         placeholder="e.g. 60 feet"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                     <input
                        type="text"
                         className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                         value={formState.duration || ''}
                         onChange={e => updateField('duration', e.target.value)}
                         placeholder="e.g. Instantaneous"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Components</label>
                 <input
                        type="text"
                         className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                         value={formState.components || ''}
                         onChange={e => updateField('components', e.target.value)}
                         placeholder="e.g. V, S, M (a pinch of dust)"
                    />
            </div>

            <div className="flex-1 flex flex-col mb-4 min-h-[200px]">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <div className="bg-white text-black rounded h-full">
                    <ReactQuill
                        theme="snow"
                        value={formState.description || ''}
                        onChange={(content) => updateField('description', content)}
                        className="h-[150px]"
                        modules={{
                            toolbar: [
                                ['bold', 'italic', 'underline'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['clean']
                            ],
                        }}
                    />
                </div>
            </div>
        </div>

        {/* TURKISH (OPTIONAL) */}
        <div>
            <button
                onClick={() => setShowTR(!showTR)}
                className="flex items-center gap-2 text-lg font-semibold text-indigo-400 hover:text-indigo-300 w-full text-left mb-4"
            >
                {showTR ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Turkish Translation (Optional)
            </button>

            {showTR && (
                <div className="pl-4 border-l-2 border-indigo-900/50 animate-in slide-in-from-top-2">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">İsim (TR)</label>
                            <input
                                type="text"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                                value={formState.translations?.tr?.name || ''}
                                onChange={e => updateTrField('name', e.target.value)}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-1">Kullanım Süresi (TR)</label>
                             <input
                                type="text"
                                 className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                                 value={formState.translations?.tr?.time || ''}
                                 onChange={e => updateTrField('time', e.target.value)}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-1">Menzil (TR)</label>
                             <input
                                type="text"
                                 className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                                 value={formState.translations?.tr?.range || ''}
                                 onChange={e => updateTrField('range', e.target.value)}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-1">Süre (TR)</label>
                             <input
                                type="text"
                                 className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                                 value={formState.translations?.tr?.duration || ''}
                                 onChange={e => updateTrField('duration', e.target.value)}
                            />
                        </div>
                     </div>

                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Bileşenler (TR)</label>
                         <input
                                type="text"
                                 className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                                 value={formState.translations?.tr?.components || ''}
                                 onChange={e => updateTrField('components', e.target.value)}
                            />
                    </div>

                    <div className="flex-1 flex flex-col mb-4 min-h-[200px]">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama (TR)</label>
                        <div className="bg-white text-black rounded h-full">
                            <ReactQuill
                                theme="snow"
                                value={formState.translations?.tr?.description || ''}
                                onChange={(content) => updateTrField('description', content)}
                                className="h-[150px]"
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'underline'],
                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2 mt-8">
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
  const [editingSpell, setEditingSpell] = useState<Partial<SpellDocument> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSpells = async () => {
    const data = await cmsService.getSpells();
    setSpells(data);
  };

  useEffect(() => {
    fetchSpells();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bu büyüyü silmek istediğinize emin misiniz?')) {
      await cmsService.deleteSpell(id);
      fetchSpells();
    }
  };

  const filteredSpells = spells.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.translations?.tr?.name && s.translations.tr.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <button
                onClick={() => setEditingSpell({ name: '', level: 0, school: '', time: '', range: '', components: '', duration: '', description: '', classes: [] })}
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
                    {spell.translations?.tr?.name && <p className="text-sm text-gray-500 italic">{spell.translations.tr.name}</p>}
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
