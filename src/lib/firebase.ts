import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const demoFirebaseConfig: FirebaseOptions = {
  apiKey: 'demo',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo',
  storageBucket: 'demo.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:demo:web:demo'
};

export let firebaseConfigIssue: string | undefined;

const getFirebaseConfig = (): FirebaseOptions => {
  const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG;

  if (rawConfig) {
    try {
      const parsedConfig = JSON.parse(rawConfig);

      if (parsedConfig && typeof parsedConfig === 'object') {
        return parsedConfig as FirebaseOptions;
      }
    } catch (error) {
      firebaseConfigIssue = 'VITE_FIREBASE_CONFIG JSON parse failed: ' + (error instanceof Error ? error.message : String(error));
      console.warn('VITE_FIREBASE_CONFIG JSON parse failed, falling back to demo config.', error);
    }
  } else {
      firebaseConfigIssue = 'VITE_FIREBASE_CONFIG environment variable is missing.';
  }

  return demoFirebaseConfig;
};

export const firebaseConfig = getFirebaseConfig();
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const appId = import.meta.env.VITE_APP_ID?.trim() || 'default';
export const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN;
export const usingDemoConfig = firebaseConfig === demoFirebaseConfig;
