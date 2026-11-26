
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuyPX6YaSBTFEjG9KzSX_nvPWT60HhSKs",
  authDomain: "campusconnect-f5fb6.firebaseapp.com",
  projectId: "campusconnect-f5fb6",
  storageBucket: "campusconnect-f5fb6.firebasestorage.app",
  messagingSenderId: "716893486090",
  appId: "1:716893486090:web:5da76138f7eaaf680cf3f3",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
