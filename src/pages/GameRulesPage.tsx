import React, { useState, useEffect } from 'react';
import { Book, Sparkles, Menu, Globe } from 'lucide-react';
import RulesRenderer from '../components/rules/RulesRenderer';
import SpellsList from '../components/rules/SpellsList';
import { cmsService } from '../services/cmsService';
import { RuleDocument, SpellDocument, Language } from '../types/cms';
import { Spell, SpellsData } from '../types/rules';

const GameRulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'spells'>('rules');
  const [language, setLanguage] = useState<Language>('tr');
  const [rules, setRules] = useState<RuleDocument[]>([]);
  const [spells, setSpells] = useState<SpellDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rulesData, spellsData] = await Promise.all([
          cmsService.getRules(language),
          cmsService.getSpells(language)
        ]);
        setRules(rulesData);
        setSpells(spellsData);
        if (rulesData.length > 0 && !activeChapterId) {
            setActiveChapterId(rulesData[0].id || '');
        }
      } catch (error) {
        console.error("Error fetching CMS data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  const activeRule = rules.find(r => r.id === activeChapterId);

  // Convert SpellDocument to Spell interface for SpellsList compatibility
  const convertedSpellsData: SpellsData = {
      spell: spells.map(s => {
          let time: any = [];
          let range: any = {};
          let components: any = {};
          let duration: any = [];
          let entries: any = [];

          try { time = JSON.parse(s.time); } catch {}
          try { range = JSON.parse(s.range); } catch {}
          try { components = JSON.parse(s.components); } catch {}
          try { duration = JSON.parse(s.duration); } catch {}
          try { entries = JSON.parse(s.description); } catch {}

          return {
              name: s.name,
              level: s.level,
              school: s.school,
              time,
              range,
              components,
              duration,
              entries,
              source: 'CMS',
              page: 0
          } as Spell;
      })
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-900 text-gray-100 overflow-hidden">
      {/* Header Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shrink-0">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Book size={18} />
            <span>Kurallar</span>
          </button>
          <button
            onClick={() => setActiveTab('spells')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'spells'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Sparkles size={18} />
            <span>Büyüler</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-700 rounded px-2 py-1">
                <Globe size={16} className="mr-2 text-gray-400"/>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
                >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                </select>
            </div>

            {activeTab === 'rules' && (
                <button
                    className="md:hidden p-2 bg-gray-700 rounded text-gray-200 ml-2"
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                >
                    <Menu size={20} />
                </button>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {loading ? (
            <div className="flex-1 flex items-center justify-center">Yükleniyor...</div>
        ) : (
            <>
                {/* Rules Sidebar (Desktop) */}
                {activeTab === 'rules' && (
                <aside className={`
                    absolute md:relative z-10 h-full w-64 bg-gray-800/95 backdrop-blur border-r border-gray-700
                    transition-transform duration-300 ease-in-out transform
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    shrink-0 overflow-y-auto custom-scrollbar
                `}>
                    <div className="p-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Bölümler</h2>
                    <nav className="space-y-1">
                        {rules.map((rule) => (
                        <button
                            key={rule.id}
                            onClick={() => {
                                setActiveChapterId(rule.id || '');
                                setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            activeChapterId === rule.id
                                ? 'bg-indigo-900/50 text-indigo-300 border-l-2 border-indigo-500'
                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                            }`}
                        >
                            {rule.title}
                        </button>
                        ))}
                    </nav>
                    </div>
                </aside>
                )}

                {/* Main View */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar w-full">
                {activeTab === 'rules' ? (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                    {activeRule ? (
                        <div className="prose prose-invert max-w-none">
                        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-8 pb-4 border-b border-gray-700">
                            {activeRule.title}
                        </h1>
                        {/* Render content entries */}
                        {activeRule.content.map((entry, idx) => (
                            <div key={idx} className="mb-12">
                                <RulesRenderer entry={entry} />
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-20">
                            İçerik bulunamadı. Admin panelinden içerik ekleyin veya veritabanını tohumlayın.
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="h-full max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
                        <SpellsList data={convertedSpellsData} />
                    </div>
                )}
                </main>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && activeTab === 'rules' && (
                    <div
                        className="absolute inset-0 bg-black/50 z-0 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default GameRulesPage;
