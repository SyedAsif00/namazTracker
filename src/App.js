// src/App.js
import React, { useState, useEffect } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth } from "./firebase.config";
import HadithDisplay from "./HadithDisplay";
import RotatingAyah from "./RotatingAyah";
import AudioPlayer from "./AudioPlayer"; // Import the AudioPlayer component
import "./App.css"; // Ensure your CSS file is linked

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for changes to the user's login state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
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
      <AudioPlayer /> {/* Include the audio player */}
      <RotatingAyah /> {/* Include the rotating Ayah display */}
      <h1>Namaz Tracker</h1>
      {!user ? <GoogleLoginButton setUser={setUser} /> : <UserTable />}
      <HadithDisplay /> {/* Include the Hadith display */}
    </div>
  );
};

export default App;
