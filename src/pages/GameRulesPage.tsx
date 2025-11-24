import React, { useState, useEffect } from 'react';
import { Book, Sparkles, Menu, Globe, Sword } from 'lucide-react';
import RulesRenderer from '../components/rules/RulesRenderer';
import SpellsList from '../components/rules/SpellsList';
import { cmsService } from '../services/cmsService';
import { RuleDocument, SpellDocument, WeaponDocument, Language } from '../types/cms';
import { Spell, SpellsData } from '../types/rules';

const GameRulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'spells' | 'weapons'>('rules');
  const [language, setLanguage] = useState<Language>('tr');
  const [rules, setRules] = useState<RuleDocument[]>([]);
  const [spells, setSpells] = useState<SpellDocument[]>([]);
  const [weapons, setWeapons] = useState<WeaponDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rulesData, spellsData, weaponsData] = await Promise.all([
          cmsService.getRules(),
          cmsService.getSpells(),
          cmsService.getWeapons()
        ]);
        setRules(rulesData);
        setSpells(spellsData);
        setWeapons(weaponsData);
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
  }, []);

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

  // Helper to get localized weapon
  const getLocalizedWeapon = (weapon: WeaponDocument) => {
      if (language === 'en') return weapon;
      if (language === 'tr' && weapon.translations?.tr) {
          return {
              ...weapon,
              name: weapon.translations.tr.name || weapon.name,
              category: weapon.translations.tr.category || weapon.category,
              damageType: weapon.translations.tr.damageType || weapon.damageType,
              properties: weapon.translations.tr.properties || weapon.properties,
              description: weapon.translations.tr.description || weapon.description
          };
      }
      return weapon;
  }

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
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Book size={18} />
            <span>{language === 'tr' ? 'Kurallar' : 'Rules'}</span>
          </button>
          <button
            onClick={() => setActiveTab('spells')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'spells'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Sparkles size={18} />
            <span>{language === 'tr' ? 'Büyüler' : 'Spells'}</span>
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'weapons'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Sword size={18} />
            <span>{language === 'tr' ? 'Silahlar' : 'Weapons'}</span>
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
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        {language === 'tr' ? 'Bölümler' : 'Chapters'}
                    </h2>
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
                            {language === 'tr'
                                ? 'İçerik bulunamadı. Admin panelinden içerik ekleyin veya veritabanını tohumlayın.'
                                : 'Content not found. Add content via Admin panel or seed database.'}
                        </div>
                    )}
                    </div>
                ) : activeTab === 'spells' ? (
                    <div className="h-full max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
                        <SpellsList data={convertedSpellsData} />
                    </div>
                ) : (
                    <div className="h-full max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weapons.map((weapon) => {
                                const w = getLocalizedWeapon(weapon);
                                return (
                                    <div key={w.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col">
                                        <div className="mb-2">
                                            <h3 className="font-bold text-lg text-red-400">{w.name}</h3>
                                            <p className="text-xs text-gray-500">{w.category} • {w.range ? `${w.range} ft` : 'Melee'}</p>
                                        </div>
                                        <div className="text-sm mb-2">
                                            <span className="font-mono bg-gray-900 px-2 py-1 rounded text-yellow-500">
                                                {w.damage} {w.damageType}
                                            </span>
                                        </div>
                                        {w.properties && w.properties.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {w.properties.map(p => (
                                                    <span key={p} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {w.description && (
                                            <div className="mt-2 text-sm text-gray-400 border-t border-gray-700 pt-2" dangerouslySetInnerHTML={{ __html: w.description }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
