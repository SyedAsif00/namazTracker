// src/App.js
import React, { useState, useEffect } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth } from "./firebase.config"; // Import the auth instance

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

  return (
    <div>
      <h1>Namaz Tracker</h1>
      {!user ? <GoogleLoginButton setUser={setUser} /> : <UserTable />}
    </div>
  );
};

export default App;
