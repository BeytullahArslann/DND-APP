import React, { useState, useEffect } from 'react';
import { settingsService, SystemSettings } from '../../services/settingsService';
import { Save, Lock, Eye, EyeOff } from 'lucide-react';

export const SystemSettingsPanel = () => {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSystemSettings();
      setSettings(data);
      setApiKey(data.geminiApiKey || '');
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSystemSettings({ geminiApiKey: apiKey });
      setSettings(prev => ({ ...prev, geminiApiKey: apiKey }));
      alert('Ayarlar kaydedildi.');
    } catch (error) {
      console.error('Save failed', error);
      alert('Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Lock className="mr-2" size={20} />
        Sistem Ayarları
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Gemini API Key (Görsel Oluşturma İçin)
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded p-2 pr-10 text-white outline-none focus:border-indigo-500"
              placeholder="AI Studio API Key"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bu anahtar tüm odalarda NPC görseli oluşturmak için kullanılacaktır.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50"
          >
            <Save className="mr-2" size={18} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};
