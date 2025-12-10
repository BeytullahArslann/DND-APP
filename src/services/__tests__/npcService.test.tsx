import { describe, it, expect, vi, beforeEach } from 'vitest';
import { npcService } from '../npcService';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

vi.mock('firebase/firestore');
vi.mock('firebase/storage');
// We don't need to strictly mock the appId value if the implementation uses the one from the file.
// But to test the logic, we accept whatever appId the module uses (which seems to be 'default' in test env).
vi.mock('../lib/firebase', () => ({
  db: {},
  storage: {},
  appId: 'default'
}));

describe('npcService', () => {
  const mockRoomId = 'room-123';
  const mockNpcId = 'npc-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribeToNPCs targets the correct room subcollection', () => {
    // Mock implementation of collection to verify path
    (collection as any).mockReturnValue('mock-collection-ref');
    (query as any).mockReturnValue('mock-query');
    (onSnapshot as any).mockReturnValue(() => {});

    npcService.subscribeToNPCs(mockRoomId, vi.fn());

    // Verify correct path construction: artifacts/default/rooms/room-123/npcs
    // We ignore the first argument (db instance) to focus on the path
    expect(collection).toHaveBeenCalledWith(undefined, 'artifacts/default/rooms', mockRoomId, 'npcs');
  });

  it('createNPC adds document to correct path', async () => {
    (collection as any).mockReturnValue('mock-collection-ref');
    (addDoc as any).mockResolvedValue({ id: 'new-id' });

    await npcService.createNPC(mockRoomId, { name: 'Test NPC' } as any);

    expect(collection).toHaveBeenCalledWith(undefined, 'artifacts/default/rooms', mockRoomId, 'npcs');
    expect(addDoc).toHaveBeenCalled();
  });

  it('uploadNPCImage uses firebase storage', async () => {
    (ref as any).mockReturnValue('mock-storage-ref');
    (uploadBytes as any).mockResolvedValue({});
    (getDownloadURL as any).mockResolvedValue('http://fake-url.com');

    const file = new File([''], 'test.png', { type: 'image/png' });
    const url = await npcService.uploadNPCImage(file);

    expect(url).toBe('http://fake-url.com');
    expect(uploadBytes).toHaveBeenCalled();
  });
});
