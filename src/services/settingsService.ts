import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export interface SystemSettings {
  geminiApiKey?: string;
}

const SETTINGS_PATH = `artifacts/${appId}/settings/system`;

export const settingsService = {
  async getSystemSettings(): Promise<SystemSettings> {
    const ref = doc(db, 'artifacts', appId, 'settings', 'system');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
    return {};
  },

  async updateSystemSettings(settings: Partial<SystemSettings>) {
    const ref = doc(db, 'artifacts', appId, 'settings', 'system');
    await setDoc(ref, settings, { merge: true });
  },

  subscribeToSettings(onUpdate: (settings: SystemSettings) => void) {
    const ref = doc(db, 'artifacts', appId, 'settings', 'system');
    return onSnapshot(ref, (snap) => {
        if(snap.exists()) {
            onUpdate(snap.data() as SystemSettings);
        } else {
            onUpdate({});
        }
    });
  }
};
