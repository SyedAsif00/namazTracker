import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBSLPc5j_Dgs6Zmk0B9c3V8R6jsqCvumC8",
  authDomain: "namaztracker-9a45d.firebaseapp.com",
  projectId: "namaztracker-9a45d",
  storageBucket: "namaztracker-9a45d.appspot.com",
  messagingSenderId: "76834035046",
  appId: "1:76834035046:web:5adf40af6e89515677e4a7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialize Firestore

// Export the initialized app
export { app };
export default app;
