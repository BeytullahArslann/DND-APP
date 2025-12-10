import React, { useState } from 'react';
import { NPC } from '../../../types';
import { Wand2, Image as ImageIcon, Loader } from 'lucide-react';

interface NPCEditorProps {
  initialData?: NPC;
  onSubmit: (data: Omit<NPC, 'id' | 'roomId' | 'createdBy'>) => Promise<void>;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const NPCEditor: React.FC<NPCEditorProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isProcessing = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
    appearance: initialData?.appearance || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    isPrivate: initialData?.isPrivate || false,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateImage = async () => {
    // This will be implemented later with actual API call
    setIsGenerating(true);
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // Mock result
    // setFormData(prev => ({ ...prev, imageUrl: '...' }));
    alert('AI Image Generation not connected yet. (Prototype)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">
        {initialData ? 'NPC Düzenle' : 'Yeni NPC Oluştur'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">İsim</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={e => handleChange('isPrivate', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
              />
              <span className="text-slate-300">Gizli (Sadece DM Görebilir)</span>
            </label>
          </div>
        </div>

        {/* Physical Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Yaş</label>
            <input
              type="text"
              value={formData.age}
              onChange={e => handleChange('age', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Boy</label>
            <input
              type="text"
              value={formData.height}
              onChange={e => handleChange('height', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Kilo</label>
            <input
              type="text"
              value={formData.weight}
              onChange={e => handleChange('weight', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none"
            />
          </div>
        </div>

        {/* Appearance & Description */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Görünüm Seçenekleri</label>
          <input
            type="text"
            value={formData.appearance}
            onChange={e => handleChange('appearance', e.target.value)}
            placeholder="Kızıl saçlı, yara izi var..."
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Karakter Tarifi / Detaylar</label>
          <textarea
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            rows={4}
            className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none resize-none"
          />
        </div>

        {/* Image Generation Section */}
        <div className="bg-slate-750 border border-slate-600 rounded-lg p-4 space-y-3">
          <label className="block text-sm font-bold text-slate-300">NPC Görseli</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="Görsel URL (veya aşağıdan oluşturun)"
              className="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-white outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2 px-4 rounded transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader className="animate-spin" size={18} /> : <Wand2 size={18} />}
              Gemini ile Oluştur
            </button>
            <button
              type="button"
              onClick={() => alert("File upload unimplemented in prototype")}
              className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded transition-all"
            >
              <ImageIcon size={18} />
              Yükle
            </button>
          </div>
          <p className="text-xs text-slate-500">
            *Gemini görsel oluşturma yukarıdaki yaş, boy, kilo ve görünüm verilerini kullanır.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};
