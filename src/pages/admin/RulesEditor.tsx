import React, { useState, useEffect } from 'react';
import { cmsService } from '../../services/cmsService';
import { RuleDocument } from '../../types/cms';
import { Trash2, Plus, Edit, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
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
  // English Content State
  const [titleEN, setTitleEN] = useState(editingRule?.title || '');
  const [contentEN, setContentEN] = useState<any>(editingRule?.content || '');
  const [modeEN, setModeEN] = useState<'editor' | 'json'>('editor');
  const [jsonStringEN, setJsonStringEN] = useState(JSON.stringify(editingRule?.content || [], null, 2));

  // Turkish Content State
  const [showTR, setShowTR] = useState(false);
  const [titleTR, setTitleTR] = useState(editingRule?.translations?.tr?.title || '');
  const [contentTR, setContentTR] = useState<any>(editingRule?.translations?.tr?.content || '');
  const [modeTR, setModeTR] = useState<'editor' | 'json'>('editor');
  const [jsonStringTR, setJsonStringTR] = useState(JSON.stringify(editingRule?.translations?.tr?.content || [], null, 2));

  // JSON Validation Errors
  const [jsonErrorEN, setJsonErrorEN] = useState<string | null>(null);
  const [jsonErrorTR, setJsonErrorTR] = useState<string | null>(null);

  useEffect(() => {
    // Initialize modes based on content type
    if (typeof contentEN === 'string') setModeEN('editor');
    else setModeEN('json');

    if (typeof contentTR === 'string') setModeTR('editor');
    else setModeTR('json');
  }, []);

  const onSave = async () => {
      try {
          let finalContentEN = contentEN;
          if (modeEN === 'json') {
              finalContentEN = JSON.parse(jsonStringEN);
          }

          let finalContentTR = contentTR;
          if (showTR && modeTR === 'json') {
               try {
                  finalContentTR = JSON.parse(jsonStringTR);
               } catch {
                   // If empty or invalid but not critical
                   finalContentTR = [];
               }
          }

          const updatedRule: Partial<RuleDocument> = {
              ...editingRule,
              title: titleEN,
              content: finalContentEN,
              translations: {
                  tr: {
                      title: titleTR,
                      content: finalContentTR
                  }
              }
          };

          await cmsService.saveRule(updatedRule);
          setEditingRule(null);
          fetchRules();
      } catch (e) {
          console.error(e);
          if (e instanceof SyntaxError) {
             alert("JSON hatası: Lütfen JSON formatını kontrol edin.");
          } else {
             alert("Kaydetme sırasında bir hata oluştu.");
          }
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold mb-4">{editingRule?.id ? 'Kural Düzenle' : 'Yeni Kural'}</h2>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* ENGLISH SECTION (MANDATORY) */}
                <div className="mb-8 border-b border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-indigo-400 mb-4">English Content (Mandatory)</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                            value={titleEN}
                            onChange={e => setTitleEN(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 mb-2">
                        <button
                            onClick={() => setModeEN('editor')}
                            className={`px-3 py-1 rounded text-sm ${modeEN === 'editor' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            Visual Editor
                        </button>
                        <button
                            onClick={() => setModeEN('json')}
                            className={`px-3 py-1 rounded text-sm ${modeEN === 'json' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            JSON Source
                        </button>
                    </div>

                    <div className="min-h-[300px] flex flex-col">
                        {modeEN === 'json' ? (
                            <textarea
                                className="w-full h-[300px] bg-gray-900 border border-gray-600 rounded p-4 text-sm font-mono text-green-400 resize-none"
                                value={jsonStringEN}
                                onChange={e => {
                                    setJsonStringEN(e.target.value);
                                    setJsonErrorEN(null);
                                }}
                            />
                        ) : (
                            <RichTextEditor
                                value={typeof contentEN === 'string' ? contentEN : ''}
                                onChange={setContentEN}
                                className="h-[300px]"
                            />
                        )}
                        {jsonErrorEN && <p className="text-red-500 text-sm mt-1">{jsonErrorEN}</p>}
                    </div>
                </div>

                {/* TURKISH SECTION (OPTIONAL) */}
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
                                <label className="block text-sm font-medium text-gray-400 mb-1">Başlık (TR)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                                    value={titleTR}
                                    onChange={e => setTitleTR(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 mb-2">
                                <button
                                    onClick={() => setModeTR('editor')}
                                    className={`px-3 py-1 rounded text-sm ${modeTR === 'editor' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                >
                                    Görsel Editör
                                </button>
                                <button
                                    onClick={() => setModeTR('json')}
                                    className={`px-3 py-1 rounded text-sm ${modeTR === 'json' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                >
                                    JSON Kaynak
                                </button>
                            </div>

                            <div className="min-h-[300px] flex flex-col">
                                {modeTR === 'json' ? (
                                    <textarea
                                        className="w-full h-[300px] bg-gray-900 border border-gray-600 rounded p-4 text-sm font-mono text-green-400 resize-none"
                                        value={jsonStringTR}
                                        onChange={e => {
                                            setJsonStringTR(e.target.value);
                                            setJsonErrorTR(null);
                                        }}
                                    />
                                ) : (
                                    <RichTextEditor
                                        value={typeof contentTR === 'string' ? contentTR : ''}
                                        onChange={setContentTR}
                                        className="h-[300px]"
                                    />
                                )}
                                {jsonErrorTR && <p className="text-red-500 text-sm mt-1">{jsonErrorTR}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
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
                    {rule.translations?.tr?.title && (
                        <p className="text-sm text-gray-500">{rule.translations.tr.title}</p>
                    )}
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
  const [editingRule, setEditingRule] = useState<Partial<RuleDocument> | null>(null);

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
      })
  );

  const fetchRules = async () => {
    const data = await cmsService.getRules();
    setRules(data);
  };

  useEffect(() => {
    fetchRules();
  }, []);

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
          setRules(newRules);

          try {
              const updates = newRules.map((rule, index) => ({
                  ...rule,
                  order: index
              }));
              await Promise.all(updates.map(r => cmsService.saveRule(r)));
          } catch (error) {
              console.error("Error updating order:", error);
              fetchRules();
          }
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kural Yönetimi</h1>
        <div className="flex items-center gap-4">
            <button
                onClick={() => setEditingRule({ title: '', content: '', order: rules.length })}
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
