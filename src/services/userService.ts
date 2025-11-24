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
  getDocs,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, appId, usingDemoConfig } from '../lib/firebase';
import { UserProfile, RoomInvite } from '../types';

export const userService = {
  /**
   * Creates or updates the user profile in Firestore upon login.
   */
  async syncUserProfile(user: User): Promise<void> {
    if (usingDemoConfig) {
      console.warn('Using demo config: Skipping Firestore user sync.');
      return;
    }

    console.log(`Syncing user profile for ${user.uid} (${user.email}) in app ${appId}`);

    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Check if the user is already an admin
    let isUserAdmin = false;
    if (userSnap.exists()) {
        const data = userSnap.data();
        isUserAdmin = !!data.isAdmin;
    }

    // If user is not admin, check if any admin exists in the system
    let shouldMakeAdmin = false;
    if (!isUserAdmin) {
        if (user.email === 'beytullahars0@gmail.com') {
            shouldMakeAdmin = true;
        } else {
            const adminQuery = query(
                collection(db, 'artifacts', appId, 'users'),
                where('isAdmin', '==', true),
                limit(1)
            );
            const adminSnap = await getDocs(adminQuery);
            // If no admins exist, this user should become one
            if (adminSnap.empty) {
                shouldMakeAdmin = true;
            }
        }
    }

    if (!userSnap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        friends: [],
        rooms: [],
        roomInvites: [],
        isAdmin: shouldMakeAdmin
      };

      // We use serverTimestamp() which is a FieldValue, not strictly matching the type in frontend,
      // but Firestore handles it. Casting to any to avoid type conflict with strict TS if enabled.
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp()
      });
    } else {
      const updateData: any = {
        lastLogin: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email
      };

      if (shouldMakeAdmin) {
          updateData.isAdmin = true;
      }

      await setDoc(userRef, updateData, { merge: true });
    }
  },

  /**
   * Fetches a user profile by UID.
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (usingDemoConfig) {
        return {
            uid,
            displayName: 'Demo User',
            email: 'demo@example.com',
            photoURL: null,
            friends: [],
            rooms: [],
            isAdmin: true // Always admin in demo mode
        };
    }

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
      if (usingDemoConfig) return null;

      const q = query(collection(db, 'artifacts', appId, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as UserProfile;
  },

  /**
   * Fetches all users (Admin only - ideally protected by Firestore rules)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    if (usingDemoConfig) {
        return [{
            uid: 'demo-uid',
            displayName: 'Demo User',
            email: 'demo@example.com',
            photoURL: null,
            friends: [],
            rooms: [],
            isAdmin: true
        }];
    }

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
  },

  /**
   * Updates specific fields of the user profile.
   * Uses setDoc with merge: true to ensure document creation if missing.
   */
  async updateProfileData(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'artifacts', appId, 'users', uid);
    await setDoc(userRef, data, { merge: true });
  },

  /**
   * Bans or unbans a user.
   */
  async banUser(uid: string, isBanned: boolean): Promise<void> {
    const userRef = doc(db, 'artifacts', appId, 'users', uid);
    await updateDoc(userRef, { isBanned });
  },

  /**
   * Deletes a user profile (admin action).
   * Note: This only deletes the Firestore document. Auth deletion requires Admin SDK.
   */
  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, 'artifacts', appId, 'users', uid);
    await deleteDoc(userRef);
  }
};
