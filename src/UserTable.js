import React, { useEffect, useState } from "react";
import { Table, Button, Spin } from "antd"; // Import necessary Ant Design components
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "./firebase.config";
import PerformanceModal from "./PerformanceModal";
import { auth } from "./firebase.config";
import moment from "moment"; // Import moment for date handling

const db = getFirestore(app);

const UserTable = ({ user, selectedMonth }) => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllDates, setShowAllDates] = useState(false);

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
          isCurrentUser: user && user.uid === doc.id,
        };
      });

      usersList.sort((a, b) => (a.isCurrentUser ? -1 : 1));

      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getDaysInMonth = (month) => {
    const today = moment();
    const startOfMonth = month.startOf("month");

    const isCurrentMonth = month.isSame(today, "month");
    const endOfMonth = isCurrentMonth ? today : month.endOf("month");

    const days = [];
    let day = startOfMonth;

    while (day <= endOfMonth) {
      days.push(day.format("YYYY-MM-DD"));
      day = day.add(1, "day");
    }

    return days.sort((a, b) => (moment(a).isBefore(moment(b)) ? 1 : -1));
  };

  const daysInSelectedMonth = getDaysInMonth(selectedMonth); // Use selectedMonth passed as a prop

  // Determine how many dates to display based on showAllDates state
  const displayedDates = showAllDates
    ? daysInSelectedMonth
    : daysInSelectedMonth.slice(0, 3); // Show only the first 3 dates by default

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 100,
      fixed: "left", // Fix this column to the left
      render: (text) => (
        <strong>{moment(text).format("D MMM YYYY")}</strong> // Format the date and make it bold
      ),
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
                setSelectedUser(user);
                setSelectedDate(record.date);
                setModalVisible(true);
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

  const data = displayedDates.map((date) => ({
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
            scroll={{ x: 850 }} // Enable horizontal scroll
          />

          {/* Show More/Show Less Button */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            {showAllDates ? (
              <Button onClick={() => setShowAllDates(false)}>Show Less</Button>
            ) : (
              <Button onClick={() => setShowAllDates(true)}>Show More</Button>
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
