import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { RuleDocument, Language } from '../../types/cms';
import { Save, Trash2, Plus, Edit, GripVertical } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditFormProps {
  editingRule: Partial<RuleDocument> | null;
  setEditingRule: (rule: Partial<RuleDocument> | null) => void;
  fetchRules: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ editingRule, setEditingRule, fetchRules }) => {
  // We store content as "any" because it can be RuleEntry[] or an HTML string
  const [mode, setMode] = useState<'editor' | 'json'>('editor');
  const [content, setContent] = useState<any>(editingRule?.content || []);
  const [jsonString, setJsonString] = useState(JSON.stringify(editingRule?.content || [], null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Determine initial mode
  useEffect(() => {
      const initialContent = editingRule?.content;
      if (Array.isArray(initialContent) && initialContent.length > 0) {
          // If complex structure, prefer JSON but allow override
          setMode('json');
          setJsonString(JSON.stringify(initialContent, null, 2));
          setContent(initialContent);
      } else if (typeof initialContent === 'string') {
          setMode('editor');
          setContent(initialContent);
      } else {
          setMode('editor');
          setContent('');
      }
  }, [editingRule]);

  const onSave = async () => {
      try {
          let finalContent = content;
          if (mode === 'json') {
              finalContent = JSON.parse(jsonString);
          }

          const updatedRule = { ...editingRule, content: finalContent };

          await cmsService.saveRule(updatedRule);
          setEditingRule(null);
          fetchRules();
      } catch (e) {
          console.error(e);
          if (e instanceof SyntaxError) {
             setJsonError("Geçersiz JSON formatı");
          } else {
             alert("Kaydetme sırasında bir hata oluştu.");
          }
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
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

            <div className="flex gap-4 mb-4 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setMode('editor')}
                    className={`px-3 py-1 rounded ${mode === 'editor' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    Görsel Editör
                </button>
                <button
                    onClick={() => setMode('json')}
                    className={`px-3 py-1 rounded ${mode === 'json' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    JSON Kaynak
                </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col mb-4">
                {mode === 'json' ? (
                    <>
                        <p className="text-xs text-gray-500 mb-2">Gelişmiş veri yapısı düzenleme.</p>
                        <textarea
                            className="flex-1 w-full bg-gray-900 border border-gray-600 rounded p-4 text-sm font-mono text-green-400 resize-none"
                            value={jsonString}
                            onChange={e => {
                                setJsonString(e.target.value);
                                setJsonError(null);
                            }}
                        />
                        {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
                    </>
                ) : (
                    <RichTextEditor
                        value={typeof content === 'string' ? content : ''}
                        onChange={setContent}
                        className="h-full"
                    />
                )}
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

interface SortableRuleItemProps {
    rule: RuleDocument;
    onEdit: (rule: RuleDocument) => void;
    onDelete: (id: string) => void;
}

const SortableRuleItem: React.FC<SortableRuleItemProps> = ({ rule, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: rule.id || '' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                    <GripVertical size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{rule.title}</h3>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(rule)}
                    className="p-2 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => rule.id && onDelete(rule.id)}
                    className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

const RulesEditor: React.FC = () => {
  const [rules, setRules] = useState<RuleDocument[]>([]);
  const [language, setLanguage] = useState<Language>('tr');
  const [editingRule, setEditingRule] = useState<Partial<RuleDocument> | null>(null);

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
      })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
          const oldIndex = rules.findIndex((r) => r.id === active.id);
          const newIndex = rules.findIndex((r) => r.id === over.id);

          const newRules = arrayMove(rules, oldIndex, newIndex);
          setRules(newRules); // Optimistic update

          // Update orders in Firestore
          try {
              // Update only the affected items or all items to ensure consistency
              // Simple approach: Update all with new index
              const updates = newRules.map((rule, index) => ({
                  ...rule,
                  order: index
              }));

              // In a real app with many items, use batch write.
              // For now, simple Promise.all is okay for small list
              await Promise.all(updates.map(r => cmsService.saveRule(r)));
          } catch (error) {
              console.error("Error updating order:", error);
              fetchRules(); // Revert on error
          }
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
                onClick={() => setEditingRule({ language, title: '', content: '', order: rules.length })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
                <Plus size={20} /> Yeni Bölüm
            </button>
        </div>
      </div>

      <div className="grid gap-4">
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={rules.map(r => r.id || '')}
                strategy={verticalListSortingStrategy}
            >
                {rules.map((rule) => (
                    <SortableRuleItem
                        key={rule.id}
                        rule={rule}
                        onEdit={setEditingRule}
                        onDelete={handleDelete}
                    />
                ))}
            </SortableContext>
        </DndContext>
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
