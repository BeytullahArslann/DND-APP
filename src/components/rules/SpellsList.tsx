import React, { useState, useMemo } from 'react';
import { SpellsData, Spell } from '../../types/rules';
import { parseRuleText } from '../../utils/rulesParser';
import RulesRenderer from './RulesRenderer';
import { Search, Filter, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SpellsListProps {
  data: SpellsData;
}

const SCHOOLS: Record<string, string> = {
  'A': 'Abjuration',
  'C': 'Conjuration',
  'D': 'Divination',
  'E': 'Enchantment',
  'V': 'Evocation',
  'I': 'Illusion',
  'N': 'Necromancy',
  'T': 'Transmutation',
};

const SpellsList: React.FC<SpellsListProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [schoolFilter, setSchoolFilter] = useState<string | 'all'>('all');
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const filteredSpells = useMemo(() => {
    return data.spell.filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || spell.level === levelFilter;
      const matchesSchool = schoolFilter === 'all' || spell.school === schoolFilter;
      return matchesSearch && matchesLevel && matchesSchool;
    });
  }, [data, searchTerm, levelFilter, schoolFilter]);

  const toggleSpell = (name: string) => {
    setExpandedSpell(expandedSpell === name ? null : name);
  };

  const formatLevel = (level: number) => {
    if (level === 0) return 'Cantrip';
    return `${level}. Level`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4 flex flex-col md:flex-row gap-4 shadow-md border border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Büyü ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-gray-900 text-white px-4 py-2 rounded border border-gray-700 focus:border-indigo-500 outline-none"
          >
            <option value="all">Tüm Seviyeler</option>
            <option value={0}>Cantrip</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}. Seviye</option>
            ))}
          </select>

          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="bg-gray-900 text-white px-4 py-2 rounded border border-gray-700 focus:border-indigo-500 outline-none"
          >
            <option value="all">Tüm Okullar</option>
            {Object.entries(SCHOOLS).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid gap-3">
          {filteredSpells.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Büyü bulunamadı.</div>
          ) : (
            filteredSpells.map((spell, idx) => (
              <div
                key={`${spell.name}-${idx}`}
                className={`bg-gray-800 border rounded-lg overflow-hidden transition-colors duration-200 ${expandedSpell === spell.name ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-gray-700 hover:border-gray-600'}`}
              >
                <div
                  onClick={() => toggleSpell(spell.name)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-900/50 p-2 rounded-lg text-indigo-300">
                        <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{spell.name}</h3>
                      <div className="text-sm text-gray-400 flex gap-2 items-center">
                        <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{formatLevel(spell.level)}</span>
                        <span>•</span>
                        <span>{SCHOOLS[spell.school] || spell.school}</span>
                      </div>
                    </div>
                  </div>
                  {expandedSpell === spell.name ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>

                {expandedSpell === spell.name && (
                  <div className="p-4 border-t border-gray-700 bg-gray-900/30 text-gray-300 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Kullanım Süresi</span>
                            <span className="text-white font-medium">
                                {spell.time?.[0]?.number} {spell.time?.[0]?.unit} {spell.time?.[0]?.condition ? `(${spell.time[0].condition})` : ''}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Menzil</span>
                            <span className="text-white font-medium">
                                {spell.range.distance?.amount ? `${spell.range.distance.amount} ft` : spell.range.distance?.type}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Süre</span>
                            <span className="text-white font-medium">
                                {spell.duration?.[0]?.concentration ? 'Kons. ' : ''}
                                {spell.duration?.[0]?.duration ? `${spell.duration[0].duration.amount} ${spell.duration[0].duration.type}` : spell.duration?.[0]?.type}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500 text-xs uppercase tracking-wider">Bileşenler</span>
                            <span className="text-white font-medium">
                                {[
                                    spell.components.v && 'V',
                                    spell.components.s && 'S',
                                    spell.components.m && (typeof spell.components.m === 'string' ? `M (${spell.components.m})` : `M (${spell.components.m.text})`)
                                ].filter(Boolean).join(', ')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {spell.entries.map((entry, i) => (
                            <RulesRenderer key={i} entry={entry} />
                        ))}
                    </div>

                    {spell.entriesHigherLevel && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <h4 className="text-sm font-bold text-indigo-300 mb-2">Yüksek Seviyelerde</h4>
                            {spell.entriesHigherLevel.map((entry, i) => (
                                <RulesRenderer key={i} entry={entry} />
                            ))}
                        </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellsList;
