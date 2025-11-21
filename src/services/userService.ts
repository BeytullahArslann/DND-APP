import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  query,
  collection,
  where,
  getDocs
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, appId } from '../lib/firebase';
import { UserProfile, RoomInvite } from '../types';

export const userService = {
  /**
   * Creates or updates the user profile in Firestore upon login.
   */
  async syncUserProfile(user: User): Promise<void> {
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        friends: [],
        rooms: [],
        roomInvites: []
      };

      // We use serverTimestamp() which is a FieldValue, not strictly matching the type in frontend,
      // but Firestore handles it. Casting to any to avoid type conflict with strict TS if enabled.
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email
      }, { merge: true });
    }
  },

  /**
   * Fetches a user profile by UID.
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'artifacts', appId, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  },

  /**
   * Finds a user by email.
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
      const q = query(collection(db, 'artifacts', appId, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as UserProfile;
  },

  /**
   * Fetches all users (Admin only - ideally protected by Firestore rules)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const snap = await getDocs(collection(db, 'artifacts', appId, 'users'));
    return snap.docs.map(doc => doc.data() as UserProfile);
  },

  /**
   * Toggles admin status for a user.
   */
  async toggleAdminStatus(uid: string, isAdmin: boolean): Promise<void> {
    const userRef = doc(db, 'artifacts', appId, 'users', uid);
    await updateDoc(userRef, { isAdmin });
  },

  /**
   * Sends a room invite to a user.
   */
  async sendRoomInvite(targetUid: string, invite: RoomInvite): Promise<void> {
    const targetUserRef = doc(db, 'artifacts', appId, 'users', targetUid);
    await updateDoc(targetUserRef, {
      roomInvites: arrayUnion(invite)
    });
  }
};
