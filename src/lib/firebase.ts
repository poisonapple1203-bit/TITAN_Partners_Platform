import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCW7OwDJn4vM0tPObuxXzh9Z9vSpVLB6QY",
  authDomain: "titan-partners.firebaseapp.com",
  databaseURL: "https://titan-partners-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "titan-partners",
  storageBucket: "titan-partners.firebasestorage.app",
  messagingSenderId: "368375523942",
  appId: "1:368375523942:web:8cef7696d20e21684b1ba7",
  measurementId: "G-5FWM4L1E8C"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
