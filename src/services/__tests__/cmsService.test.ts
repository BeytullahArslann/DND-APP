import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmsService } from '../cmsService';
import { addDoc, getDocs } from 'firebase/firestore';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
  appId: 'test-app'
}));

const mockBatch = {
  set: vi.fn(),
  commit: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'timestamp'),
  writeBatch: vi.fn(() => mockBatch)
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
    it('should convert content to HTML string using batch operations', async () => {
      await cmsService.seedDatabase();

      // Verify batch.set was called instead of addDoc for seeding
      expect(mockBatch.set).toHaveBeenCalled();

      // Get the argument passed to batch.set for the rule
      const callArgs = mockBatch.set.mock.calls[0][1];
      const content = callArgs.content;

      // content should now be an HTML string
      expect(typeof content).toBe('string');
      expect(content).toContain('<table');
      expect(content).toContain('cell1');
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
