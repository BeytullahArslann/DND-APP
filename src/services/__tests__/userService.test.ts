import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from '../userService';
import { getDoc, setDoc, query, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

// Mocks are already set up in setupTests.ts, but we need to type them for usage
const mockedGetDoc = vi.mocked(getDoc);
const mockedSetDoc = vi.mocked(setDoc);
const mockedGetDocs = vi.mocked(getDocs);
const mockedQuery = vi.mocked(query);
const mockedUpdateDoc = vi.mocked(updateDoc);
const mockedArrayUnion = vi.mocked(arrayUnion);

describe('userService', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'http://example.com/photo.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncUserProfile', () => {
    it('creates a new profile if user does not exist', async () => {
      // Mock getDoc to return exists() = false (User check)
      mockedGetDoc.mockResolvedValueOnce({
        exists: () => false,
        data: () => undefined,
      } as any);

      // Mock getDocs for admin check (return empty -> means no admins -> should set isAdmin: true)
      mockedGetDocs.mockResolvedValueOnce({
        empty: true,
        docs: []
      } as any);

      await userService.syncUserProfile(mockUser as any);

      // Expect setDoc to be called with new profile data
      expect(mockedSetDoc).toHaveBeenCalledTimes(1);
      const callArgs = mockedSetDoc.mock.calls[0];
      // 1st arg is doc ref (we don't easily check this without more mocking of 'doc', but we can check the data)
      const data = callArgs[1] as any;
      expect(data.uid).toBe(mockUser.uid);
      expect(data.email).toBe(mockUser.email);
      expect(data.createdAt).toBe('MOCKED_TIMESTAMP'); // from setupTests
      expect(data.isAdmin).toBe(true); // First user should be admin
    });

    it('updates existing profile on login', async () => {
      // Mock getDoc to return exists() = true
      mockedGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ uid: 'user123' }),
      } as any);

      await userService.syncUserProfile(mockUser as any);

      expect(mockedSetDoc).toHaveBeenCalledTimes(1);
      const callArgs = mockedSetDoc.mock.calls[0];
      const data = callArgs[1] as any;
      const options = callArgs[2];

      expect(data.lastLogin).toBe('MOCKED_TIMESTAMP');
      expect(options).toEqual({ merge: true });
    });
  });

  describe('getUserProfile', () => {
    it('returns profile if exists', async () => {
      const mockData = { uid: 'user123', displayName: 'Found' };
      mockedGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData,
      } as any);

      const result = await userService.getUserProfile('user123');
      expect(result).toEqual(mockData);
    });

    it('returns null if not found', async () => {
      mockedGetDoc.mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await userService.getUserProfile('user123');
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('returns user if found', async () => {
        const mockData = { uid: 'user123', email: 'test@example.com' };
        mockedGetDocs.mockResolvedValueOnce({
            empty: false,
            docs: [{ data: () => mockData }],
        } as any);

        const result = await userService.getUserByEmail('test@example.com');
        expect(result).toEqual(mockData);
        expect(mockedQuery).toHaveBeenCalled();
    });

    it('returns null if not found', async () => {
        mockedGetDocs.mockResolvedValueOnce({
            empty: true,
            docs: [],
        } as any);

        const result = await userService.getUserByEmail('notfound@example.com');
        expect(result).toBeNull();
    });
  });

  describe('sendRoomInvite', () => {
      it('updates the target user doc with arrayUnion', async () => {
          const invite = { roomId: 'r1', inviterId: 'u1' };
          await userService.sendRoomInvite('target123', invite as any);

          expect(mockedUpdateDoc).toHaveBeenCalledTimes(1);
          expect(mockedArrayUnion).toHaveBeenCalledWith(invite);
      });
  });
});
