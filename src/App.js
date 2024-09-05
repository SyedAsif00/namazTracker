import React, { useState, useEffect } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth, db } from "./firebase.config";
import HadithDisplay from "./HadithDisplay";
import RotatingAyah from "./RotatingAyah";
import AudioPlayer from "./AudioPlayer";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Modal, Spin } from "antd"; // Import Modal and Spin from Ant Design
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading

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
      setLoading(false); // Set loading to false after checking authentication status
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

  const showLogoutConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to logout?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleLogout(); // Call the logout function if the user confirms
      },
      onCancel() {
        console.log("Logout canceled");
      },
    });
  };

  return (
    <div>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" /> {/* Loader when the app is loading */}
        </div>
      ) : (
        <>
          <div className="header-container">
            <h1>Namaz Tracker</h1>
            {user ? (
              <div className="user-info">
                Logged in as: {user.displayName}
                <button onClick={showLogoutConfirm} className="logout-button">
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-info">
                {" "}
                {/* Container for the login button */}
                <GoogleLoginButton setUser={setUser} />
              </div>
            )}
          </div>

          <AudioPlayer />
          <RotatingAyah />
          {/* Always show the UserTable */}
          <UserTable user={user} />
        </>
      )}
    </div>
  );
};

export default App;
