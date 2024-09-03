import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "./firebase.config";
import PerformanceModal from "./PerformanceModal"; // Import the modal component
import { auth } from "./firebase.config";

const db = getFirestore(app);

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const usersCollection = collection(db, "users");

    // Real-time listener for users collection
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          points: data.points !== undefined ? data.points : 0, // Initialize points to 0 if undefined
          performance: data.performance || {}, // Ensure performance is an empty object if undefined
        };
      });
      setUsers(usersList);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Helper function to get recent dates
  const getRecentDates = () => {
    const today = new Date();
    const recentDates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      recentDates.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
    return recentDates;
  };

  const recentDates = getRecentDates();

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },

    {
      title: "Total Points",
      dataIndex: "points",
      key: "points",
      render: (points) => (points !== undefined ? points : 0), // Show 0 if points is undefined
    },
    ...recentDates.map((date) => ({
      title: date,
      dataIndex: date,
      key: date,
      render: (_, record) => {
        // Safely access the points, defaulting to 0
        const dayPoints = record.performance[date]
          ? record.performance[date].points
          : 0;
        return (
          <div
            onClick={() => {
              if (record.uid === auth.currentUser.uid) {
                setSelectedUser(record);
                setSelectedDate(date);
                setModalVisible(true);
              }
            }}
            style={{
              cursor:
                record.uid === auth.currentUser.uid ? "pointer" : "default",
            }}
          >
            {dayPoints !== undefined ? dayPoints : 0}
          </div>
        );
      },
    })),
  ];

  return (
    <div className="table-container">
      {" "}
      {/* Add this wrapper div */}
      <Table columns={columns} dataSource={users} rowKey="uid" />
      {modalVisible && (
        <PerformanceModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          user={selectedUser}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default UserTable;
