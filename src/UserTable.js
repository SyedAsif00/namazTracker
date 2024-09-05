import React, { useEffect, useState } from "react";
import { Table, Button, Spin, message } from "antd"; // Import message
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "./firebase.config";
import PerformanceModal from "./PerformanceModal";
import { auth } from "./firebase.config";

const db = getFirestore(app);

const UserTable = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showAllDates, setShowAllDates] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersCollection = collection(db, "users");

    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          points: data.points !== undefined ? data.points : 0,
          performance: data.performance || {},
          registrationDate: data.registrationDate || "",
          isCurrentUser: user && user.uid === doc.id, // Check if the user is logged in and is the current user
        };
      });

      usersList.sort((a, b) => (a.isCurrentUser ? -1 : 1));

      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getLast7Days = () => {
    const today = new Date();
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split("T")[0]);
    }
    return last7Days;
  };

  const last7Days = getLast7Days();
  const visibleDates = showAllDates ? last7Days : last7Days.slice(0, 3);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",

      width: 90,
    },
    ...users.map((user) => ({
      title: (
        <div>
          {user.name} ({user.points})
        </div>
      ),
      key: user.id,
      width: 120,
      render: (_, record) => {
        const performance = user.performance[record.date];
        const dayPoints = performance ? performance.points : 0;
        const isEditableDate = record.date >= user.registrationDate;

        return isEditableDate ? (
          <div
            onClick={() => {
              if (auth.currentUser && user.uid === auth.currentUser.uid) {
                // Allow interaction if the user is logged in
                setSelectedUser(user);
                setSelectedDate(record.date);
                setModalVisible(true);
              } else {
                // Show a notification if the user is not logged in
                console.log("");
              }
            }}
            style={{
              cursor:
                auth.currentUser && user.uid === auth.currentUser.uid
                  ? "pointer"
                  : "default",
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

  const data = visibleDates.map((date) => ({
    key: date,
    date,
  }));

  return (
    <div className="table-container">
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="date"
            pagination={false}
            scroll={{ x: 800 }}
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
        </>
      )}
    </div>
  );
};

export default UserTable;
