import React, { useState, useEffect, useRef } from "react";
import GoogleLoginButton from "./LoginBtn";
import UserTable from "./UserTable";
import { auth, db } from "./firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Modal, Spin } from "antd";
import moment from "moment";
import AudioPlayer from "./AudioPlayer";
import RotatingAyah from "./RotatingAyah.js";
import "./App.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarOutlined } from "@ant-design/icons"; // Import the calendar icon

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Initialize with JavaScript Date
  const [calendarOpen, setCalendarOpen] = useState(false); // For controlling calendar open/close state
  const calendarRef = useRef(null); // Ref to handle outside clicks

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
      setSelectedMonth(date); // Update the selected month using Date
      setCalendarOpen(false); // Close calendar after selection
    }
  };

  // Disable dates outside the current year and only show months
  const tileDisabled = ({ date }) => {
    const currentYear = new Date().getFullYear();
    return date.getFullYear() !== currentYear;
  };

  // Handle clicks outside the calendar to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 style={{ marginRight: "20px", padding: 0 }}>Namaz Tracker</h1>

              {/* Button to open the calendar */}
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                style={{
                  marginLeft: "10px",
                  borderRadius: "30px",
                  padding: "8px 16px",
                  fontSize: "16px",
                  cursor: "pointer",
                  backgroundColor: "#1890ff", // Blue color for button
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CalendarOutlined style={{ marginRight: "8px" }} />
                {moment(selectedMonth).format("MMM YYYY")}
              </button>
            </div>
            {user ? (
              <div className="user-info">
                Logged in as: {user.displayName}
                <button
                  onClick={showLogoutConfirm}
                  className="logout-button"
                  style={{
                    color: "#fff",
                    border: "none",
                    borderRadius: "30px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    marginLeft: "20px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
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
          {/* Calendar Component */}
          {calendarOpen && (
            <div
              ref={calendarRef}
              style={{
                position: "absolute",
                zIndex: 1000,
                top: "80px",
                left: "20px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <Calendar
                onChange={handleMonthChange}
                value={selectedMonth} // Pass the JavaScript Date object
                view="year" // Only show months
                maxDetail="year" // Limit to months only
                tileDisabled={tileDisabled} // Disable months outside the current year
              />
            </div>
          )}
          <AudioPlayer />
          <RotatingAyah />
          {/* Always show the UserTable and pass the selected month */}
          <UserTable user={user} selectedMonth={moment(selectedMonth)} />{" "}
        </>
      )}
    </div>
  );
};

export default App;
