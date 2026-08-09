import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAXQnTiwgNfTEf3tRyK_owFNDtbabKzZmw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-portfolio-7cd72.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-portfolio-7cd72",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-portfolio-7cd72.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "39322150875",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:39322150875:web:26e874d5a4ffc610ba29fe",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RQP7CXJVYP"
};

const app = initializeApp(firebaseConfig);
// Using the default database since we successfully deployed rules to it
export const db = getFirestore(app);
export const auth = getAuth(app);
