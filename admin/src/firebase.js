import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - using the same config as the main app
const firebaseConfig = {
  apiKey: "AIzaSyCx-MSwIlBdbG1IOVQ6ZFKX38nDC7RZrZo",
  authDomain: "ludo-game-eec96.firebaseapp.com",
  projectId: "ludo-game-eec96",
  storageBucket: "ludo-game-eec96.firebasestorage.app",
  messagingSenderId: "556700028163",
  appId: "1:556700028163:web:d2691fb3db11a9c4f46d36",
  measurementId: "G-KNS7ZB00NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;