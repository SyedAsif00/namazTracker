import React, { useState, useEffect } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth, db } from "./firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Modal, Spin, DatePicker } from "antd"; // Import DatePicker here
import moment from "moment"; // Import moment for formatting months
import AudioPlayer from "./AudioPlayer";
import RotatingAyah from "./RotatingAyah.js";
import "./App.css"; // Assuming styles are in this file

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(moment()); // Track selected month

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
      setLoading(false);
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
        handleLogout();
      },
      onCancel() {
        console.log("Logout canceled");
      },
    });
  };

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date); // Update the selected month
    }
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
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div
            className="header-container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 style={{ marginRight: "20px", padding: 0 }}>Namaz Tracker</h1>
              {/* DatePicker next to the heading */}
              <DatePicker
                style={{
                  marginLeft: "10px",
                  borderRadius: "5px",
                  padding: "6px",
                  fontSize: "16px",
                }}
                picker="month"
                format="MMM YYYY" // Format to display "Sep" for September
                value={selectedMonth} // Bind to selected month state
                onChange={handleMonthChange}
                disabledDate={(current) =>
                  current && current > moment().endOf("month")
                }
              />
            </div>
            {user ? (
              <div className="user-info">
                Logged in as: {user.displayName}
                <button
                  onClick={showLogoutConfirm}
                  className="logout-button"
                  style={{
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-info">
                <GoogleLoginButton setUser={setUser} />
              </div>
            )}
          </div>
          <AudioPlayer />
          <RotatingAyah />
          {/* Always show the UserTable */}
          <UserTable user={user} selectedMonth={selectedMonth} />{" "}
          {/* Pass selectedMonth as prop */}
        </>
      )}
    </div>
  );
};

export default App;
