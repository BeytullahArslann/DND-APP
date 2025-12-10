import React from 'react';
import { RuleEntry } from '../../types/rules';
import { parseRuleText } from '../../utils/rulesParser';

interface RulesRendererProps {
  entry: RuleEntry | string;
  depth?: number;
}

const RulesRenderer: React.FC<RulesRendererProps> = ({ entry, depth = 0 }) => {
  if (typeof entry === 'string') {
    if (entry.trim().startsWith('<')) {
       // Assume HTML from Rich Text Editor
       return <div className="mb-2 text-gray-300 text-base leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry }} />;
    }
    return <p className="mb-2 text-gray-300 text-base leading-relaxed">{parseRuleText(entry)}</p>;
  }

  // Helper to render children entries recursively
  // Using 'any' for the entries map because the recursive type definition of RuleEntry
  // can sometimes conflict with the iterator type inferred by TypeScript in this specific context.
  const renderEntries = (entries?: (string | RuleEntry)[]) => {
    return entries?.map((subEntry: string | RuleEntry, idx: number) => (
      <RulesRenderer key={idx} entry={subEntry} depth={depth + 1} />
    ));
  };

  switch (entry.type) {
    case 'section':
    case 'entries': // Often acts as a subsection or container
      return (
        <div className="mb-6">
          {entry.name && (
            <h3
              className={`font-bold text-gray-100 mb-3 ${
                depth === 0 ? 'text-2xl border-b border-gray-700 pb-2' :
                depth === 1 ? 'text-xl' : 'text-lg'
              }`}
            >
              {entry.name}
            </h3>
          )}
          {renderEntries(entry.entries)}
        </div>
      );

    case 'list':
      return (
        <ul className={`mb-4 text-gray-300 ${entry.style === 'list-hang-notitle' ? '' : 'list-disc pl-5'}`}>
          {entry.items?.map((item, idx) => (
            <li key={idx} className="mb-1">
              <RulesRenderer entry={item} depth={depth + 1} />
            </li>
          ))}
        </ul>
      );

    case 'item': // Used inside lists sometimes
        return (
            <div>
                {entry.name && <span className="font-bold text-white mr-2">{entry.name}</span>}
                {entry.entry && <span className="text-gray-300">{parseRuleText(entry.entry as string)}</span>}
                {renderEntries(entry.entries)}
            </div>
        );

    case 'table':
      return (
        <div className="overflow-x-auto mb-6 border border-gray-700 rounded-lg">
          {entry.caption && <div className="bg-gray-800 p-2 font-bold text-center border-b border-gray-700">{entry.caption}</div>}
          <table className="w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700">
                {entry.colLabels?.map((label, idx) => (
                  <th key={idx} className="p-2 font-semibold text-gray-200 border-r border-gray-800 last:border-r-0">
                    {parseRuleText(label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entry.rows?.map((row, rowIdx) => {
                let cells: any[] = [];
                // Handle old format (nested array) or new Firestore format (object with cells property)
                if (Array.isArray(row)) {
                    cells = row;
                } else if ((row as any).cells && Array.isArray((row as any).cells)) {
                    cells = (row as any).cells;
                }

                return (
                    <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-800/50">
                    {cells.length > 0 ? (
                        cells.map((cell, cellIdx) => (
                        <td key={cellIdx} className="p-2 border-r border-gray-800 last:border-r-0">
                            {typeof cell === 'object' && cell !== null && (cell as any).type === 'cell' ?
                                ((cell as any).roll ? `${(cell as any).roll.exact || (cell as any).roll.min}-${(cell as any).roll.max}` : '')
                                : (
                                  Array.isArray(cell) ?
                                    cell.map((c: any, i: number) => <RulesRenderer key={i} entry={c} depth={depth} />) :
                                    <RulesRenderer entry={cell as string | RuleEntry} depth={depth} />
                                )
                            }
                        </td>
                        ))
                    ) : (
                        // Handle object rows (like special styled rows or other structures) that are not wrapped arrays
                        <td colSpan={entry.colLabels?.length || 1} className="p-2">
                            {Array.isArray(row) ?
                                row.map((r: any, i: number) => <RulesRenderer key={i} entry={r} depth={depth} />) :
                                <RulesRenderer entry={row as string | RuleEntry} depth={depth} />
                            }
                        </td>
                    )}
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case 'inset': // Like a callout box
      return (
        <div className="bg-gray-800/60 border-l-4 border-indigo-500 p-4 my-4 rounded-r-lg shadow-md">
          {entry.name && <h4 className="text-lg font-bold text-indigo-300 mb-2">{entry.name}</h4>}
          {renderEntries(entry.entries)}
        </div>
      );

    case 'image':
        return (
            <div className="my-4 flex justify-center">
                {/* Since images are relative on the original site, we might need to map them or ignore.
                    For now, placeholder or generic handler.
                    The href path is usually like "rules/Point-of-Origin.png".
                    We can try to point to the github raw url.
                */}
                 {entry.href?.path && (
                    <img
                        src={`https://raw.githubusercontent.com/kanguen/kanguen.github.io/master/img/${entry.href.path}`}
                        alt={entry.name || 'Rule Image'}
                        className="max-w-full h-auto rounded shadow-lg border border-gray-700"
                    />
                 )}
            </div>
        );

    case 'row': // Special row inside tables usually
        // This is tricky because it's usually inside a table structure, but if called directly:
         if (Array.isArray(entry.row)) {
             return (
                 <div className="flex gap-2">
                     {entry.row.map((cell, idx) => (
                         <div key={idx}><RulesRenderer entry={cell} /></div>
                     ))}
                 </div>
             )
         }
         return null;

    default:
      // Fallback for unknown types or just generic containers
      return (
        <div className="mb-2">
            {entry.name && <h4 className="font-bold text-gray-200">{entry.name}</h4>}
            {renderEntries(entry.entries)}
        </div>
      );
  }
};

export default RulesRenderer;
