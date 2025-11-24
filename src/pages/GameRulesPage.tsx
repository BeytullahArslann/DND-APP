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
        // Fetch all data (containing both languages)
        const [rulesData, spellsData] = await Promise.all([
          cmsService.getRules(),
          cmsService.getSpells()
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
  }, []); // Run once on mount

  const activeRule = rules.find(r => r.id === activeChapterId);

  // Helper to get localized rule
  const getLocalizedRule = (rule: RuleDocument) => {
      if (language === 'en') return { title: rule.title, content: rule.content };
      if (language === 'tr' && rule.translations?.tr) {
          return {
              title: rule.translations.tr.title || rule.title,
              content: rule.translations.tr.content || rule.content
          };
      }
      return { title: rule.title, content: rule.content };
  };

  const localizedActiveRule = activeRule ? getLocalizedRule(activeRule) : null;

  // Convert SpellDocument to Spell interface for SpellsList compatibility
  const convertedSpellsData: SpellsData = {
      spell: spells.map(s => {
          // Determine source data based on language
          const source = (language === 'tr' && s.translations?.tr) ? s.translations.tr : s;
          const fallback = s;

          // Name
          const name = source.name || fallback.name;

          // Time
          let time: any = [];
          const timeStr = source.time || fallback.time;
          try {
              time = JSON.parse(timeStr);
          } catch {
              time = [{ number: 0, unit: timeStr }];
          }

          // Range
          let range: any = {};
          const rangeStr = source.range || fallback.range;
          try {
              range = JSON.parse(rangeStr);
          } catch {
              range = { type: 'point', distance: { type: rangeStr, amount: 0 } };
          }

          // Components
          let components: any = {};
          const compStr = source.components || fallback.components;
          try {
              components = JSON.parse(compStr);
          } catch {
              const hasV = compStr.includes('V');
              const hasS = compStr.includes('S');
              const hasM = compStr.includes('M');
              // Basic parsing attempt
              let mVal: string | undefined = undefined;
              if (hasM) {
                   const match = compStr.match(/M\s*\(([^)]+)\)/);
                   if (match) {
                       mVal = match[1];
                   } else if (compStr.trim() === "M" || compStr.includes("M,")) {
                       mVal = " ";
                   }
              }
              components = { v: hasV, s: hasS, m: mVal };
          }

          // Duration
          let duration: any = [];
          const durStr = source.duration || fallback.duration;
          try {
              duration = JSON.parse(durStr);
          } catch {
              duration = [{ type: 'timed', duration: { type: durStr, amount: 0 } }];
          }

          // Description (Entries)
          let entries: any = [];
          const descStr = source.description || fallback.description;
          try {
              entries = JSON.parse(descStr);
          } catch {
              entries = [descStr];
          }

          return {
              name: name,
              level: s.level, // Shared
              school: s.school, // Shared (Code)
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
                        {rules.map((rule) => {
                           const loc = getLocalizedRule(rule);
                           return (
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
                                {loc.title}
                            </button>
                           );
                        })}
                    </nav>
                    </div>
                </aside>
                )}

                {/* Main View */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar w-full">
                {activeTab === 'rules' ? (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                    {localizedActiveRule ? (
                        <div className="prose prose-invert max-w-none">
                        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-8 pb-4 border-b border-gray-700">
                            {localizedActiveRule.title}
                        </h1>
                        {/* Render content entries */}
                        {Array.isArray(localizedActiveRule.content) ? (
                            localizedActiveRule.content.map((entry: any, idx: number) => (
                                <div key={idx} className="mb-12">
                                    <RulesRenderer entry={entry} />
                                </div>
                            ))
                        ) : (
                            /* Handle HTML string content from new Editor */
                            <div dangerouslySetInnerHTML={{ __html: localizedActiveRule.content as string }} />
                        )}
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
