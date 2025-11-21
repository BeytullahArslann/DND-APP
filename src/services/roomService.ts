import {
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  FirestoreError
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { Room } from '../types';

export const roomService = {
  /**
   * Subscribes to a room's data changes.
   */
  subscribeToRoom(
    roomId: string,
    onUpdate: (room: Room | null) => void,
    onError?: (error: FirestoreError) => void
  ): Unsubscribe {
    const roomRef = doc(db, 'artifacts', appId, 'rooms', roomId);

    return onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as Room);
      } else {
        onUpdate(null);
      }
    }, onError);
  },

  /**
   * Fetches a single room once.
   */
  async getRoom(roomId: string): Promise<Room | null> {
    const roomRef = doc(db, 'artifacts', appId, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Room;
    }
    return null;
  }
};
