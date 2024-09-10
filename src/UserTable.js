import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "./firebase.config";
import PerformanceModal from "./PerformanceModal";
import { auth } from "./firebase.config";

const db = getFirestore(app);

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showAllDates, setShowAllDates] = useState(false);

  useEffect(() => {
    const usersCollection = collection(db, "users");

    // Real-time listener for users collection
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          points: data.points !== undefined ? data.points : 0,
          performance: data.performance || {},
          registrationDate: data.registrationDate || "",
          isCurrentUser: auth.currentUser && doc.id === auth.currentUser.uid,
        };
      });

      // Sort users: logged-in user first
      usersList.sort((a, b) => (a.isCurrentUser ? -1 : 1));

      setUsers(usersList);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Get the last 7 days in descending order (today first)
  const getLast7Days = () => {
    const today = new Date();
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split("T")[0]); // Get YYYY-MM-DD format
    }
    return last7Days; // Already in descending order (today first)
  };

  const last7Days = getLast7Days();

  // Control the number of visible dates (default 3, show more with button)
  const visibleDates = showAllDates ? last7Days : last7Days.slice(0, 3);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      fixed: "left",
      width: 100,
    },
    ...users.map((user) => ({
      title: (
        <div>
          {user.name} ({user.points}) {/* Display name with points */}
        </div>
      ),
      key: user.id,
      width: 120, // Fixed width to ensure the columns stay small
      render: (_, record) => {
        const performance = user.performance[record.date];
        const dayPoints = performance ? performance.points : 0;
        const isEditableDate = record.date >= user.registrationDate;

        return isEditableDate ? (
          <div
            onClick={() => {
              if (user.uid === auth.currentUser.uid) {
                setSelectedUser(user);
                setSelectedDate(record.date);
                setModalVisible(true);
              }
            }}
            style={{
              cursor: user.uid === auth.currentUser.uid ? "pointer" : "default",
            }}
          >
            {dayPoints !== undefined ? dayPoints : "-"}
          </div>
        ) : (
          "-"
        );
      },
    })),
  ];

  // Transform visible dates into table rows
  const data = visibleDates.map((date) => ({
    key: date,
    date,
  }));

  return (
    <div className="table-container">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="date"
        pagination={false}
        scroll={{ x: true }} // Enable horizontal scroll if needed
      />
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        {!showAllDates && last7Days.length > 3 && (
          <Button onClick={() => setShowAllDates(true)}>Show More</Button>
        )}
        {showAllDates && (
          <Button onClick={() => setShowAllDates(false)}>Show Less</Button>
        )}
      </div>
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
