import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9UZK3OcTsKYJxq66XYhwxIj8gPmuVyoU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-portfolio-7cd72.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-portfolio-7cd72",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-portfolio-7cd72.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "39322150875",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:39322150875:web:58e8c59b4fe46e43ba29fe",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-400W825SQ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
