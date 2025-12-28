import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDS--ix9tgy33y2UTY3IavJOgym4mr61Uw",
  authDomain: "worklyhub-9735f.firebaseapp.com",
  projectId: "worklyhub-9735f",
  storageBucket: "worklyhub-9735f.firebasestorage.app",
  messagingSenderId: "421430807448",
  appId: "1:421430807448:web:ccb6d1f098ca558d61f9ed",
};

// Initialize firebase app once
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
