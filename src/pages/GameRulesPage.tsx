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
          // If the fields are JSON strings (from seeding/legacy), parse them.
          // If they are simple strings (from new editor), wrap them in appropriate structures if needed,
          // OR assume SpellsList can handle strings if we update it.
          // But SpellsList expects specific objects usually.
          // However, looking at types/rules.ts, time, range etc are complex objects.
          // If we changed the editor to save simple strings, we need to convert them here to what SpellsList expects
          // OR update SpellsList to handle strings.
          // Given the constraints, let's try to adapt strings to objects if parsing fails.

          let time: any = [];
          try {
              time = JSON.parse(s.time);
          } catch {
              // It's a simple string from the new editor
              time = [{ number: 0, unit: s.time }];
          }

          let range: any = {};
          try {
              range = JSON.parse(s.range);
          } catch {
              range = { type: 'point', distance: { type: s.range, amount: 0 } };
          }

          let components: any = {};
          try {
              components = JSON.parse(s.components);
          } catch {
               // simplistic parsing for display
               const hasV = s.components.includes('V');
               const hasS = s.components.includes('S');
               // For M, usually it's "M (material)" or just "M".
               // If the string is just "V, S, M" then M is just generic.
               // We want to avoid "V, S, M (V, S, M)" if M is not specific.
               const hasM = s.components.includes('M');
               let mVal: string | undefined = undefined;

               if (hasM) {
                   // Try to extract material if it exists in parens
                   const match = s.components.match(/M\s*\(([^)]+)\)/);
                   if (match) {
                       mVal = match[1];
                   } else if (s.components.trim() === "M" || s.components.includes("M,")) {
                       // Just generic M
                       mVal = undefined; // If we set undefined, SpellsList shows M without text?
                       // Let's check SpellsList. It shows "M ({text})".
                       // If we return just 'M', SpellsList logic: `spell.components.m && (typeof spell.components.m === 'string' ? `M (${spell.components.m})` ...`
                       // So if we set mVal to "V, S, M", it shows "M (V, S, M)".
                       // We should set mVal to undefined if it's just a flag, but SpellsList expects boolean or string/object for M.
                       // Wait, SpellsList type for M is string | {text, cost}.
                       // If M is present but no specific material, maybe we shouldn't pass the whole string.
                       // Let's just pass "Component Pouch" or similar default if not parsed?
                       // Or better, if it's just "V, S, M", we leave m undefined but pass v=true, s=true, m=true?
                       // But the interface for `m` is string | object. It doesn't seem to support boolean true.
                       // Let's look at SpellsList again.
                       // `spell.components.m && ...`
                       // If we set m to a string, it renders `M (string)`.
                       // So if we don't have a specific material, we probably shouldn't set m property at all if we can't display it properly,
                       // OR we set it to a placeholder.
                       // But wait, if the original string was "V, S, M", we want to show "V, S, M".
                       // The SpellsList logic joins them.
                       // `[v && 'V', s && 'S', m && ...].join(', ')`
                       // So if we set v=true, s=true, and m=undefined, we get "V, S". We lose M.
                       // We need a way to say "M exists but has no description".
                       // If we set m to " ", we get "M ( )".
                       // Maybe we just leave it as is: if parsing fails, we assume the string is the full component text and don't try to split it into V/S/M objects.
                       // But SpellsList expects an object with v,s,m keys.

                       // New strategy: If parsing fails, we rely on the fact that we might be able to display the raw string if we updated SpellsList to handle it?
                       // No, SpellsList expects the object.

                       // Best effort:
                       // If string contains M but no parens, maybe set m to " " or something minimal?
                       // Or, if the string is exactly "V, S, M", we just accept that we can't perfectly map it to the struct without custom logic.

                       // Actually, the SpellsList render logic:
                       // `spell.components.m && (typeof spell.components.m === 'string' ? `M (${spell.components.m})` : ...`
                       // So if m is set, it wraps it in parens.
                       // The only way to get just "M" is if we change SpellsList.
                       // But I can't change SpellsList logic easily without affecting others.

                       // Workaround: If M is present but no details, use " " (space).
                       mVal = " ";
                   } else {
                       // It's the whole string "V, S, M" being assigned to M before.
                       // If we assign mVal = "Generic", we get "M (Generic)".
                   }
               }

               // Actually, checking SpellsList logic again:
               // It constructs the string.
               // If I want to fix the UI glitch "V, S, M (V, S, M)", I should stop assigning the whole string `s.components` to `m`.
               // If I can't find a specific material description, I should probably set `m` to something that renders nicely or not set it.
               // If I set m="*", it renders "M (*)".

               // Let's just try to extract. If failure, stick to minimal.
               components = { v: hasV, s: hasS, m: mVal };
          }

          let duration: any = [];
          try {
              duration = JSON.parse(s.duration);
          } catch {
              duration = [{ type: 'timed', duration: { type: s.duration, amount: 0 } }];
          }

          let entries: any = [];
          try {
              entries = JSON.parse(s.description);
          } catch {
              // It is likely HTML string from ReactQuill
              entries = [s.description];
          }

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
                        {Array.isArray(activeRule.content) ? (
                            activeRule.content.map((entry, idx) => (
                                <div key={idx} className="mb-12">
                                    <RulesRenderer entry={entry} />
                                </div>
                            ))
                        ) : (
                            /* Handle HTML string content from new Editor */
                            <div dangerouslySetInnerHTML={{ __html: activeRule.content as unknown as string }} />
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
