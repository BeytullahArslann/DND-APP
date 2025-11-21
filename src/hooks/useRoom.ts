import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { Room } from '../types';
import { FirestoreError } from 'firebase/firestore';

export const useRoom = (roomId: string | undefined) => {
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
        setLoading(false);
        return;
    }

    const unsubscribe = roomService.subscribeToRoom(
      roomId,
      (data) => {
        setRoomData(data);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Room subscription error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return { roomData, loading, error };
};
