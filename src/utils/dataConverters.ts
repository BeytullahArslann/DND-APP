
interface RuleEntry {
  type?: string;
  name?: string;
  entries?: (string | RuleEntry)[];
  items?: any[]; // Changed to any[] to handle mixed types
  caption?: string;
  colLabels?: any[]; // Changed to any[]
  rows?: (string[] | { type: string; style?: string; row: string[] })[];
  href?: { type: string; path: string };
  // Common fields in object items
  entry?: string;
  style?: string;
}

export const convertRulesToHtml = (entries: (string | RuleEntry)[]): string => {
  let html = '';

  if (!entries || !Array.isArray(entries)) return html;

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
          if (typeof item === 'string') {
            html += `<li>${processString(item)}</li>`;
          } else {
            // Handle object items (e.g. { type: 'item', name: '...', entry: '...' })
            let content = '';
            if (item.name) content += `<strong>${processString(item.name)}</strong>. `;
            if (item.entry) content += processString(item.entry);
            if (item.entries) content += convertRulesToHtml(item.entries);

            // Fallback if generic object
            if (!content) {
                content = processString(item);
            }
            html += `<li>${content}</li>`;
          }
        });
        html += '</ul>';
      } else if (entry.type === 'table' && entry.rows) {
        if (entry.caption) {
          html += `<p><strong>${entry.caption}</strong></p>`;
        }
        html += '<table>';
        if (entry.colLabels) {
          html += '<thead><tr>';
          entry.colLabels.forEach(label => {
            html += `<th>${processString(label)}</th>`;
          });
          html += '</tr></thead>';
        }
        html += '<tbody>';
        entry.rows.forEach(rowItem => {
          // Handle mixed row types: array or object { type: 'row', row: [...] }
          const row = Array.isArray(rowItem) ? rowItem : (rowItem.row || []);
          html += '<tr>';
          if (Array.isArray(row)) {
              row.forEach(cell => {
                 const cellContent = processString(cell);
                 html += `<td>${cellContent}</td>`;
              });
          }
          html += '</tr>';
        });
        html += '</tbody></table>';
      } else if (entry.type === 'image' && entry.href) {
          // html += `<img src="${entry.href.path}" alt="Rule Image" />`;
      } else if (entry.entries) {
        html += convertRulesToHtml(entry.entries);
      }
    }
  }

  return html;
};

const processString = (str: any): string => {
  if (typeof str !== 'string') {
    if (str === null || str === undefined) return '';
    if (typeof str === 'object') return JSON.stringify(str); // Fallback for debugging/safety
    return String(str);
  }

  // Simple replacements for internal links {@b ...}, {@i ...}
  return str
    .replace(/{@b (.*?)}/g, '<strong>$1</strong>')
    .replace(/{@i (.*?)}/g, '<em>$1</em>')
    .replace(/{@code (.*?)}/g, '<code>$1</code>')
    .replace(/{@link (.*?)}/g, '<a href="#">$1</a>')
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
       if (dist.type === 'self') range = 'Kendisi';
       else if (dist.type === 'touch') range = 'Dokunma';
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
    if (spell.components.m) parts.push('M');
    components = parts.join(', ');
  }

  // Normalize Duration
  let duration = '';
  if (spell.duration && spell.duration.length > 0) {
    const d = spell.duration[0];
    if (d.type === 'instant') duration = 'Anlık';
    else if (d.type === 'permanent') duration = 'Bozulana Kadar';
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
         duration = `Konsantrasyon, ${duration} kadar`;
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
