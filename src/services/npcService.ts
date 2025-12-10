import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  getDocs,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';
import { NPC, NPCNote } from '../types';

const COLLECTION_PATH = `artifacts/${appId}/rooms`;

export const npcService = {
  // --- NPCs ---

  subscribeToNPCs(roomId: string, onUpdate: (npcs: NPC[]) => void) {
    // We store NPCs as a subcollection of the room
    const npcsRef = collection(db, COLLECTION_PATH, roomId, 'npcs');
    // We can't easily filter 'private' here for players securely without Firestore Rules
    // So we fetch all and filter in UI (Rules should enforce security ideally)
    const q = query(npcsRef); // Order by name or creation?

    return onSnapshot(q, (snapshot) => {
      const npcs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NPC[];
      onUpdate(npcs);
    });
  },

  async createNPC(roomId: string, data: Omit<NPC, 'id'>) {
    const npcsRef = collection(db, COLLECTION_PATH, roomId, 'npcs');
    await addDoc(npcsRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  async updateNPC(roomId: string, npcId: string, data: Partial<NPC>) {
    const npcRef = doc(db, COLLECTION_PATH, roomId, 'npcs', npcId);
    await updateDoc(npcRef, data);
  },

  async deleteNPC(roomId: string, npcId: string) {
    const npcRef = doc(db, COLLECTION_PATH, roomId, 'npcs', npcId);
    await deleteDoc(npcRef);
  },

  // --- Notes ---

  subscribeToNotes(roomId: string, npcId: string, onUpdate: (notes: NPCNote[]) => void) {
    // Notes as subcollection of NPC
    const notesRef = collection(db, COLLECTION_PATH, roomId, 'npcs', npcId, 'notes');
    const q = query(notesRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NPCNote[];
      onUpdate(notes);
    });
  },

  async addNote(roomId: string, npcId: string, note: Omit<NPCNote, 'id'>) {
    const notesRef = collection(db, COLLECTION_PATH, roomId, 'npcs', npcId, 'notes');
    await addDoc(notesRef, note);
  },

  async deleteNote(roomId: string, npcId: string, noteId: string) {
    const noteRef = doc(db, COLLECTION_PATH, roomId, 'npcs', npcId, 'notes', noteId);
    await deleteDoc(noteRef);
  },

  // --- Image Upload ---

  async uploadNPCImage(file: File | Blob): Promise<string> {
    const filename = `npc_images/${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
};
