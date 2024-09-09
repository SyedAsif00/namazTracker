import React, { useEffect, useState } from "react";
import { Table, Button, Spin } from "antd"; // Import necessary Ant Design components
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "./firebase.config";
import PerformanceModal from "./PerformanceModal";
import { auth } from "./firebase.config";
import moment from "moment"; // Import moment for date handling
import useSize from "./useSize";
const db = getFirestore(app);

const UserTable = ({ user, selectedMonth }) => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllDates, setShowAllDates] = useState(false);
  const { isMobile } = useSize();

  useEffect(() => {
    const usersCollection = collection(db, "users");

    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      //snapshot function updated in real time, if there is any remove or add in the userList
      const usersList = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Ensure we include days even if points are 0
        // performance object stores the namaz record, it has it's key which is the date at which the record is present. we say data.performance is truthy, if not we or empty object is used to manage erros
        // day is the key for the perforance of that day,
        // here we obtain the amount of days present for which the perfromance is there.
        const daysWithRecords = Object.keys(data.performance || {}).filter(
          (day) => data.performance[day] !== undefined
        ).length;

        const maxPointsForUser = daysWithRecords * 10; // Max points based on the number of logged days
        const totalPoints = data.points !== undefined ? data.points : 0;
        const normalizedPoints =
          maxPointsForUser > 0
            ? Math.round((totalPoints / maxPointsForUser) * 10) // Normalize and round to the nearest whole number
            : 0;

        return {
          id: doc.id,
          ...data,
          points: totalPoints,
          normalizedPoints: normalizedPoints, // Add the normalized points
          performance: data.performance || {},
          registrationDate: data.registrationDate || "",
          isCurrentUser: user && user.uid === doc.id,
        };
      });
      //the sort function is used, to order the users, -1 comes first then 1. this way...
      usersList.sort((a, b) => (a.isCurrentUser ? -1 : 1));

      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getDaysInMonth = (month) => {
    const today = moment();
    const startOfMonth = month.clone().startOf("month"); // Use clone() to avoid mutating the original object
    const isCurrentMonth = month.isSame(today, "month");
    const endOfMonth = isCurrentMonth ? today : month.clone().endOf("month"); // Also clone here

    const days = [];
    let day = startOfMonth.clone(); // Clone the starting day

    while (day <= endOfMonth) {
      days.push(day.format("YYYY-MM-DD"));
      day = day.clone().add(1, "day"); // Clone before adding to avoid mutation
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
      width: isMobile ? 25 : 40,
      fixed: "left", // Fix this column to the left
      render: (text) => (
        <strong>{moment(text).format("D MMM YYYY")}</strong> // Format the date and make it bold
      ),
    },

    ...users.map((user) => ({
      title: (
        <div>
          {user.name} ({user.normalizedPoints}){" "}
        </div>
      ),
      key: user.id,
      width: isMobile ? 50 : 120,
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
