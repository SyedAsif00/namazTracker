// src/App.js
import React, { useState, useEffect } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth, db } from "./firebase.config";
import HadithDisplay from "./HadithDisplay";
import RotatingAyah from "./RotatingAyah";
import AudioPlayer from "./AudioPlayer";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            registrationDate: new Date().toISOString().split("T")[0],
            lastLogin: new Date().toISOString(),
          });
        } else {
          if (!userDocSnap.data().registrationDate) {
            await setDoc(
              userDocRef,
              { registrationDate: new Date().toISOString().split("T")[0] },
              { merge: true }
            );
          }
        }
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
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
    </div>
  );
};

export default App;
