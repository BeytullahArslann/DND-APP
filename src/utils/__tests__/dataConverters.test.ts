
import { describe, it, expect } from 'vitest';
import { convertRulesToHtml } from '../dataConverters';

describe('convertRulesToHtml', () => {
  it('should handle mixed row types (array and object) in tables', () => {
    const input = [
      {
        type: 'table',
        caption: 'Test Table',
        colLabels: ['Header 1', 'Header 2'],
        rows: [
          ['cell1', 'cell2'], // standard array row
          { type: 'row', style: 'some-style', row: ['cell3', 'cell4'] } // object row
        ]
      }
    ];

    const result = convertRulesToHtml(input as any);

    expect(result).toContain('<table');
    expect(result).toContain('cell1');
    expect(result).toContain('cell2');
    expect(result).toContain('cell3');
    expect(result).toContain('cell4');
    expect(result).not.toContain('undefined');
  });

  it('should handle recursive entries', () => {
      const input = [
          {
              type: 'section',
              name: 'Section 1',
              entries: [
                  'Paragraph 1',
                  {
                      type: 'entries',
                      entries: ['Paragraph 2']
                  }
              ]
          }
      ];

      const result = convertRulesToHtml(input as any);
      expect(result).toContain('<h3>Section 1</h3>');
      expect(result).toContain('<p>Paragraph 1</p>');
      expect(result).toContain('<p>Paragraph 2</p>');
  });

  it('should handle object items in lists (reproduction of crash)', () => {
    const input = [
      {
        type: 'list',
        items: [
          'Item 1',
          { type: 'item', name: 'Item 2', entry: 'Description' } // Object item
        ]
      }
    ];

    // This is expected to throw "TypeError: item.replace is not a function" with current code
    expect(() => convertRulesToHtml(input as any)).not.toThrow();
  });

  it('should handle non-string colLabels (robustness)', () => {
    const input = [
        {
            type: 'table',
            colLabels: ['Header 1', { weird: 'object' }],
            rows: [['cell']]
        }
    ];
    expect(() => convertRulesToHtml(input as any)).not.toThrow();
  });
});
