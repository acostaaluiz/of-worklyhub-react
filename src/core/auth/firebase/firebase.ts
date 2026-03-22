import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

const readEnvString = (key: string, fallback: string): string => {
  const value = env[key];
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const firebaseConfig = {
  apiKey: readEnvString("VITE_FIREBASE_API_KEY", "AIzaSyDS--ix9tgy33y2UTY3IavJOgym4mr61Uw"),
  authDomain: readEnvString("VITE_FIREBASE_AUTH_DOMAIN", "worklyhub-9735f.firebaseapp.com"),
  projectId: readEnvString("VITE_FIREBASE_PROJECT_ID", "worklyhub-9735f"),
  storageBucket: readEnvString("VITE_FIREBASE_STORAGE_BUCKET", "worklyhub-9735f.firebasestorage.app"),
  messagingSenderId: readEnvString("VITE_FIREBASE_MESSAGING_SENDER_ID", "421430807448"),
  appId: readEnvString("VITE_FIREBASE_APP_ID", "1:421430807448:web:ccb6d1f098ca558d61f9ed"),
};

// Initialize firebase app once
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
