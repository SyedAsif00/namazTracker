// src/App.js
import React, { useState, useEffect } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth, db } from "./firebase.config"; // Import db for Firestore access
import HadithDisplay from "./HadithDisplay";
import RotatingAyah from "./RotatingAyah";
import AudioPlayer from "./AudioPlayer";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for changes to the user's login state
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // If user document doesn't exist, create one with registrationDate
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            registrationDate: new Date().toISOString().split("T")[0], // Set registration date to today
            lastLogin: new Date().toISOString(), // Optional: track last login time
          });
        } else {
          // If user document exists but registrationDate does not, set it
          if (!userDocSnap.data().registrationDate) {
            await setDoc(
              userDocRef,
              { registrationDate: new Date().toISOString().split("T")[0] },
              { merge: true }
            );
          }
        }
        setUser(user); // User is logged in
      } else {
        setUser(null); // User is logged out
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null); // Reset user state on sign out
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <div>
      {user && (
        <div className="user-info">
          Logged in as: {user.displayName}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
      <AudioPlayer />
      <RotatingAyah />
      <h1>Namaz Tracker</h1>
      {!user ? <GoogleLoginButton setUser={setUser} /> : <UserTable />}
      {/* <HadithDisplay /> */}
    </div>
  );
};

export default App;
