import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (Safely for build-time)
let app: FirebaseApp | undefined, auth: Auth | undefined, db: Firestore | undefined;

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here';

if (isConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("⚠️ Firebase configuration missing or invalid. Skipping initialization.");
}

// Enable emulators if running locally (optional, can be toggled via env)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && auth && db) {
    connectAuthEmulator(auth as any, 'http://localhost:9099');
    connectFirestoreEmulator(db as any, 'localhost', 8080);
}

export { app, auth, db };
