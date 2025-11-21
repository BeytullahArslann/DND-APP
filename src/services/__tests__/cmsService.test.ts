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

describe('cmsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getDocs to return empty to simulate no existing data (so seed proceeds)
    (getDocs as any).mockResolvedValue({ empty: true, docs: [] });
  });

  describe('seedDatabase', () => {
    it('should complete seeding without crashing', async () => {
      // This calls seedDatabase. Even if it uses real data (because json mock might fail in some envs),
      // it should not crash with "Cannot read properties of undefined".
      await cmsService.seedDatabase();

      // Expect addDoc to be called at least once (indicating the loop ran and tried to save)
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('saveRule', () => {
      it('should sanitize data before adding', async () => {
          const ruleWithUndefined = {
              language: 'tr',
              title: 'Test',
              content: [],
              order: 1,
              extraUndefined: undefined
          } as any;

          await cmsService.saveRule(ruleWithUndefined);

          // Check that addDoc was called with sanitized data
          const expectedCall = {
              language: 'tr',
              title: 'Test',
              content: [],
              order: 1,
              createdAt: 'timestamp',
              updatedAt: 'timestamp'
          };
          // We expect the second argument of the first call to addDoc to match
          expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining(expectedCall));

          // Ensure 'extraUndefined' key is NOT present
          // We check the first call's second argument (the data object)
          const saveRuleCallArgs = (addDoc as any).mock.calls[0][1];
          expect(saveRuleCallArgs).not.toHaveProperty('extraUndefined');
      });
  });
});
