import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roomService } from '../roomService';
import { getDoc, onSnapshot } from 'firebase/firestore';

const mockedGetDoc = vi.mocked(getDoc);
const mockedOnSnapshot = vi.mocked(onSnapshot);

describe('roomService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRoom', () => {
    it('returns room data if exists', async () => {
      const mockRoom = { id: 'room1', name: 'Dungeon' };
      mockedGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'room1',
        data: () => ({ name: 'Dungeon' }),
      } as any);

      const result = await roomService.getRoom('room1');
      expect(result).toEqual(mockRoom);
    });

    it('returns null if room does not exist', async () => {
      mockedGetDoc.mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await roomService.getRoom('room1');
      expect(result).toBeNull();
    });
  });

  describe('subscribeToRoom', () => {
    it('calls onUpdate with room data when snapshot exists', () => {
      const onUpdate = vi.fn();
      // Mock onSnapshot implementation to immediately invoke the callback
      mockedOnSnapshot.mockImplementation((_ref, callback: any) => {
        callback({
          exists: () => true,
          id: 'room1',
          data: () => ({ name: 'Live Room' }),
        });
        return () => {}; // unsubscribe function
      });

      roomService.subscribeToRoom('room1', onUpdate);

      expect(onUpdate).toHaveBeenCalledWith({ id: 'room1', name: 'Live Room' });
    });

    it('calls onUpdate with null when snapshot does not exist', () => {
        const onUpdate = vi.fn();
        mockedOnSnapshot.mockImplementation((_ref, callback: any) => {
          callback({
            exists: () => false,
          });
          return () => {};
        });

        roomService.subscribeToRoom('room1', onUpdate);

        expect(onUpdate).toHaveBeenCalledWith(null);
      });
  });
});
