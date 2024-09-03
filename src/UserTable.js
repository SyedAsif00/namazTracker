import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "./firebase.config";
import PerformanceModal from "./PerformanceModal";
import { auth } from "./firebase.config";

const db = getFirestore(app);

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const usersCollection = collection(db, "users");

    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  const getRecentDates = () => {
    const today = new Date();
    const recentDates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      recentDates.push(date.toISOString().split("T")[0]);
    }
    return recentDates;
  };

  const recentDates = getRecentDates();

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "UID", dataIndex: "uid", key: "uid" },
    {
      title: "Total Points",
      dataIndex: "points",
      key: "points",
      render: (points) => (points ? points : 0),
    },
    ...recentDates.map((date) => ({
      title: date,
      dataIndex: date,
      key: date,
      render: (_, record) => {
        const dayPoints =
          record.performance && record.performance[date]
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
            {dayPoints}
          </div>
        );
      },
    })),
  ];

  return (
    <>
      <Table columns={columns} dataSource={users} rowKey="uid" />
      {modalVisible && (
        <PerformanceModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          user={selectedUser}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
};

export default UserTable;
