import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhBk8X1q7uF0eHqMHmXKJt9mTLpbhccOU",
  authDomain: "geomap-424702.firebaseapp.com",
  projectId: "geomap-424702",
  storageBucket: "geomap-424702.appspot.com",
  messagingSenderId: "758157170313",
  appId: "1:758157170313:android:a1c7083bf15572f86bd858"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Storage
const storage = getStorage(app);

export { app, db, auth, storage };