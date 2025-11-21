import React, { useState } from 'react';
import { Book, Sparkles, Menu } from 'lucide-react';
import rulesDataRaw from '../data/rules.json';
import spellsDataRaw from '../data/spells.json';
import RulesRenderer from '../components/rules/RulesRenderer';
import SpellsList from '../components/rules/SpellsList';
import { QuickReferenceData, SpellsData } from '../types/rules';

const rulesData = rulesDataRaw as unknown as QuickReferenceData;
const spellsData = spellsDataRaw as unknown as SpellsData;

const GameRulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'spells'>('rules');
  const [activeChapterName, setActiveChapterName] = useState<string>(rulesData.reference[0].contents[0].name);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Flatten sections for easier navigation menu
  const chapters = rulesData.reference[0].contents;

  // Find the active chapter object to get its headers
  const activeChapter = chapters.find(c => c.name === activeChapterName);

  // Flatten all data entries from all sections
  const allEntries = rulesData.data.flatMap(d => d.entries || []);

  // Filter the data entries that match the headers of the active chapter
  const activeEntries = activeChapter
    ? allEntries.filter(entry =>
        typeof entry !== 'string' && entry.name && activeChapter.headers.includes(entry.name)
      )
    : [];

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

        {activeTab === 'rules' && (
            <button
                className="md:hidden p-2 bg-gray-700 rounded text-gray-200"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                <Menu size={20} />
            </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden relative">

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
                {chapters.map((chapter) => (
                  <button
                    key={chapter.name}
                    onClick={() => {
                        setActiveChapterName(chapter.name);
                        setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      activeChapterName === chapter.name
                        ? 'bg-indigo-900/50 text-indigo-300 border-l-2 border-indigo-500'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                    }`}
                  >
                    {chapter.name}
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
              {activeEntries.length > 0 ? (
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-8 pb-4 border-b border-gray-700">
                    {activeChapterName}
                  </h1>
                  {/* Render all matching entries */}
                  {activeEntries.map((entry, idx) => (
                    <div key={idx} className="mb-12">
                         <RulesRenderer entry={entry} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-20">
                    İçerik yüklenemedi veya bulunamadı.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
              <SpellsList data={spellsData} />
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
      </div>
    </div>
  );
};

export default GameRulesPage;
