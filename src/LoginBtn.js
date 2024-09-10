// src/LoginBtn.js
import React from "react";
import { Button, message } from "antd"; // Import Ant Design button
import { auth } from "./firebase.config"; // Use already initialized auth instance
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "./firebase.config"; // Import the app instance

const db = getFirestore(app); // Initialize Firestore

const GoogleLoginButton = ({ setUser }) => {
  const provider = new GoogleAuthProvider();

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        setUser(user);

        if (userDocSnap) return message.info("welcome back.");
        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          lastLogin: new Date().toISOString(),
        });
      })
      .catch((error) => {
        console.error("Error signing in with Google", error);
      });
  };

  return <Button onClick={handleLogin}>Login with Google</Button>;
};

export default GoogleLoginButton;
