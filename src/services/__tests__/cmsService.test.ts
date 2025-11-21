import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmsService } from '../cmsService';
import { addDoc, collection, getDocs } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
  appId: 'test-app'
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'timestamp'),
}));

// Mock Data - Correct paths relative to this test file
vi.mock('../../data/rules.json', () => ({
  default: {
    reference: [{ name: "Test Section", contents: [{ name: "Test Content", headers: ["Header"] }] }],
    data: [
      {
        name: "Ignored Parent",
        entries: [
          {
            name: "Header", // Matches the header in reference
            type: "table",
            rows: [
              ["cell1", "cell2"], // Nested array
              ["cell3", "cell4"]
            ]
          }
        ]
      }
    ]
  }
}));

vi.mock('../../data/spells.json', () => ({
  default: {
    spell: []
  }
}));

describe('cmsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getDocs to return empty to simulate no existing data (so seed proceeds)
    (getDocs as any).mockResolvedValue({ empty: true, docs: [] });
  });

  describe('seedDatabase', () => {
    it('should transform nested arrays in rules data', async () => {
      await cmsService.seedDatabase();

      // Verify addDoc was called
      expect(addDoc).toHaveBeenCalled();

      // Get the argument passed to addDoc for the rule
      const callArgs = (addDoc as any).mock.calls[0][1];
      const content = callArgs.content;

      // content[0] should be the table entry itself
      const tableEntry = content[0];
      expect(tableEntry.type).toBe('table');

      // Check that rows are transformed from [['cell1', 'cell2']] to [{cells: ['cell1', 'cell2']}]
      const firstRow = tableEntry.rows[0];
      expect(firstRow).toHaveProperty('cells');
      expect(firstRow.cells).toEqual(['cell1', 'cell2']);
    });
  });

  describe('saveRule', () => {
      it('should sanitize data and transform nested arrays', async () => {
          const ruleWithNestedArray = {
              language: 'tr',
              title: 'Test',
              content: [
                  {
                      type: 'table',
                      rows: [['a', 'b'], ['c', 'd']]
                  }
              ],
              order: 1
          } as any;

          await cmsService.saveRule(ruleWithNestedArray);

          // Find the call that saves this specific rule
          const saveRuleCallArgs = (addDoc as any).mock.calls.find((call: any) => call[1].title === 'Test')[1];
          const rows = saveRuleCallArgs.content[0].rows;

          expect(rows[0]).toHaveProperty('cells');
          expect(rows[0].cells).toEqual(['a', 'b']);
      });
  });
});
