import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { RuleDocument, Language } from '../../types/cms';
import { Save, Trash2, Plus, Edit } from 'lucide-react';

interface EditFormProps {
  editingRule: Partial<RuleDocument> | null;
  setEditingRule: (rule: Partial<RuleDocument> | null) => void;
  fetchRules: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ editingRule, setEditingRule, fetchRules }) => {
  const [jsonString, setJsonString] = useState(JSON.stringify(editingRule?.content || [], null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Update local json string if editingRule changes (e.g. initially)
  useEffect(() => {
      setJsonString(JSON.stringify(editingRule?.content || [], null, 2));
  }, [editingRule]);

  const onSave = () => {
      try {
          const content = JSON.parse(jsonString);
          const updatedRule = { ...editingRule, content };

          cmsService.saveRule(updatedRule).then(() => {
              setEditingRule(null);
              fetchRules();
          });
      } catch (e) {
          setJsonError("Geçersiz JSON formatı");
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">{editingRule?.id ? 'Kural Düzenle' : 'Yeni Kural'}</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Başlık</label>
                <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingRule?.title || ''}
                    onChange={e => setEditingRule({...editingRule, title: e.target.value})}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Sıra (Order)</label>
                <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                    value={editingRule?.order || 0}
                    onChange={e => setEditingRule({...editingRule, order: Number(e.target.value)})}
                />
            </div>

            <div className="flex-1 min-h-0 flex flex-col mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">İçerik (JSON)</label>
                <p className="text-xs text-gray-500 mb-2">Karmaşık kural yapısı için ham JSON düzenleyici. Dikkatli olun.</p>
                <textarea
                    className="flex-1 w-full bg-gray-900 border border-gray-600 rounded p-4 text-sm font-mono text-green-400 resize-none"
                    value={jsonString}
                    onChange={e => {
                        setJsonString(e.target.value);
                        setJsonError(null);
                    }}
                />
                {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setEditingRule(null)}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                >
                    İptal
                </button>
                <button
                    onClick={onSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                >
                    Kaydet
                </button>
            </div>
        </div>
    </div>
  );
};

const RulesEditor: React.FC = () => {
  const [rules, setRules] = useState<RuleDocument[]>([]);
  const [language, setLanguage] = useState<Language>('tr');
  const [editingRule, setEditingRule] = useState<Partial<RuleDocument> | null>(null);

  const fetchRules = async () => {
    const data = await cmsService.getRules(language);
    setRules(data);
  };

  useEffect(() => {
    fetchRules();
  }, [language]);

  const handleDelete = async (id: string) => {
    if (confirm('Bu kural bölümünü silmek istediğinize emin misiniz?')) {
      await cmsService.deleteRule(id);
      fetchRules();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kural Yönetimi</h1>
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
                onClick={() => setEditingRule({ language, title: '', content: [], order: rules.length })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
                <Plus size={20} /> Yeni Bölüm
            </button>
        </div>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
            <div key={rule.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">{rule.title}</h3>
                    <p className="text-sm text-gray-400">Sıra: {rule.order}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditingRule(rule)}
                        className="p-2 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => rule.id && handleDelete(rule.id)}
                        className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
        {rules.length === 0 && <p className="text-gray-500 text-center py-10">Kayıtlı kural bulunamadı.</p>}
      </div>

      {editingRule && (
          <EditForm
            editingRule={editingRule}
            setEditingRule={setEditingRule}
            fetchRules={fetchRules}
          />
      )}
    </div>
  );
};

export default RulesEditor;
