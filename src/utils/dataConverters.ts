
interface RuleEntry {
  type?: string;
  name?: string;
  entries?: (string | RuleEntry)[];
  items?: string[];
  caption?: string;
  colLabels?: string[];
  rows?: string[][];
  href?: { type: string; path: string };
}

export const convertRulesToHtml = (entries: (string | RuleEntry)[]): string => {
  let html = '';

  for (const entry of entries) {
    if (typeof entry === 'string') {
      html += `<p>${processString(entry)}</p>`;
    } else {
      if (entry.name) {
        html += `<h3>${entry.name}</h3>`;
      }

      if (entry.type === 'list' && entry.items) {
        html += '<ul>';
        entry.items.forEach(item => {
          html += `<li>${processString(item)}</li>`;
        });
        html += '</ul>';
      } else if (entry.type === 'table' && entry.rows) {
        html += '<table class="w-full border-collapse border border-gray-600 mb-4">';
        if (entry.caption) {
          html += `<caption class="text-lg font-bold mb-2">${entry.caption}</caption>`;
        }
        if (entry.colLabels) {
          html += '<thead><tr>';
          entry.colLabels.forEach(label => {
            html += `<th class="border border-gray-600 p-2 bg-gray-700">${processString(label)}</th>`;
          });
          html += '</tr></thead>';
        }
        html += '<tbody>';
        entry.rows.forEach(row => {
          html += '<tr>';
          row.forEach(cell => {
             // Handle complex cell if necessary, though usually strings in this JSON
             const cellContent = typeof cell === 'string' ? processString(cell) : JSON.stringify(cell);
             html += `<td class="border border-gray-600 p-2">${cellContent}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
      } else if (entry.type === 'image' && entry.href) {
          // Images might be local paths, for now just put a placeholder or skip
          // html += `<img src="${entry.href.path}" alt="Rule Image" />`;
      } else if (entry.entries) {
        html += convertRulesToHtml(entry.entries);
      }
    }
  }

  return html;
};

const processString = (str: string): string => {
  // Simple replacements for internal links {@b ...}, {@i ...}
  return str
    .replace(/{@b (.*?)}/g, '<strong>$1</strong>')
    .replace(/{@i (.*?)}/g, '<em>$1</em>')
    .replace(/{@code (.*?)}/g, '<code>$1</code>')
    .replace(/{@link (.*?)}/g, '<a href="#">$1</a>') // Simplified
    .replace(/{@spell (.*?)}/g, '<span class="text-indigo-400">$1</span>')
    .replace(/{@condition (.*?)}/g, '<span class="text-red-400">$1</span>')
    .replace(/{@item (.*?)}/g, '<span class="text-yellow-400">$1</span>')
    .replace(/{@class (.*?)}/g, '<span class="text-green-400">$1</span>')
    .replace(/{@race (.*?)}/g, '<span class="text-green-400">$1</span>')
    .replace(/{@creature (.*?)}/g, '<span class="text-red-500">$1</span>')
    .replace(/{@dice (.*?)}/g, '<span class="text-blue-300 font-mono">$1</span>');
};

export const normalizeSpellData = (spell: any) => {
  // Normalize Time
  let time = '';
  if (spell.time && spell.time.length > 0) {
    const t = spell.time[0];
    const unitMap: Record<string, string> = {
      'eylem': 'Aksiyon',
      'bonus': 'Bonus Aksiyon',
      'reaksiyon': 'Reaksiyon',
      'dakika': 'Dakika',
      'saat': 'Saat',
      'action': 'Action',
      'bonus action': 'Bonus Action',
      'reaction': 'Reaction',
      'minute': 'Minute',
      'hour': 'Hour'
    };
    const unit = unitMap[t.unit] || t.unit;
    time = `${t.number} ${unit}`;
  }

  // Normalize Range
  let range = '';
  if (spell.range) {
    if (spell.range.distance) {
       const dist = spell.range.distance;
       if (dist.type === 'self') range = 'Kendisi'; // or Self
       else if (dist.type === 'touch') range = 'Dokunma'; // or Touch
       else if (dist.type === 'sight') range = 'Görüş';
       else if (dist.type === 'unlimited') range = 'Sınırsız';
       else if (dist.amount) {
         range = `${dist.amount} ${dist.type}`;
       }
    }
  }

  // Normalize Components
  let components = '';
  if (spell.components) {
    const parts = [];
    if (spell.components.v) parts.push('V');
    if (spell.components.s) parts.push('S');
    if (spell.components.m) parts.push('M'); // Ignore material description for short code
    components = parts.join(', ');
  }

  // Normalize Duration
  let duration = '';
  if (spell.duration && spell.duration.length > 0) {
    const d = spell.duration[0];
    if (d.type === 'instant') duration = 'Anlık'; // Instantaneous
    else if (d.type === 'permanent') duration = 'Bozulana Kadar'; // Until Dispelled
    else if (d.type === 'special') duration = 'Özel';
    else if (d.duration) {
       const unitMap: Record<string, string> = {
          'dakika': 'Dakika',
          'saat': 'Saat',
          'gün': 'Gün',
          'rounds': 'Tur',
          'minute': 'Minute',
          'hour': 'Hour',
          'day': 'Day',
          'round': 'Round'
       };
       const unit = unitMap[d.duration.type] || d.duration.type;
       duration = `${d.duration.amount} ${unit}`;
       if (d.concentration) {
         duration = `Konsantrasyon, ${duration} kadar`; // Approximate match to constants
       }
    }
  }

  // Convert Entries to HTML Description
  let description = '';
  if (spell.entries) {
    description = convertRulesToHtml(spell.entries);
  }

  // Handle Higher Levels
  if (spell.entriesHigherLevel) {
      description += convertRulesToHtml(spell.entriesHigherLevel);
  }

  return {
    ...spell,
    time,
    range,
    components,
    duration,
    description
  };
};
