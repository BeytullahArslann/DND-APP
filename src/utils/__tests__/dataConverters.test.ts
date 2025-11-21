
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
});
