import React, { useState, useEffect } from "react";
import { Table, Radio } from "antd";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "./firebase.config";
import { Modal } from "antd"; // Import Modal

const db = getFirestore(app);

const PerformanceModal = ({ visible, onClose, user, selectedDate }) => {
  const [namazData, setNamazData] = useState({
    Fajr: "",
    Zuhr: "",
    Asr: "",
    Maghrib: "",
    Isha: "",
  });

  useEffect(() => {
    const fetchPerformance = async () => {
      if (user && selectedDate) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const performanceData = userData.performance || {};
          setNamazData(
            performanceData[selectedDate] || {
              Fajr: "",
              Zuhr: "",
              Asr: "",
              Maghrib: "",
              Isha: "",
            }
          );
        }
      }
    };

    if (visible) {
      fetchPerformance();
    }
  }, [user, selectedDate, visible]);

  const calculatePoints = (namazPerformance) => {
    let totalPoints = 0;
    Object.values(namazPerformance).forEach((performance) => {
      switch (performance) {
        case "At Mosque":
          totalPoints += 2;
          break;
        case "At Home":
          totalPoints += 1;
          break;
        case "Qaza":
          totalPoints += 0;
          break;
        case "Not Prayed":
          totalPoints -= 2;
          break;
        default:
          break;
      }
    });
    return totalPoints;
  };

  const updateNamazData = async (updatedNamazData) => {
    const newDayPoints = calculatePoints(updatedNamazData);

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    let userData = {};
    if (docSnap.exists()) {
      userData = docSnap.data();
    }

    const performanceData = userData.performance || {};
    const totalPoints = Object.values(performanceData).reduce(
      (acc, dayPerformance) => acc + (dayPerformance.points || 0),
      0
    );

    const previousDayPoints = performanceData[selectedDate]?.points || 0;
    const updatedTotalPoints = totalPoints - previousDayPoints + newDayPoints;

    await updateDoc(docRef, {
      [`performance.${selectedDate}`]: {
        ...updatedNamazData,
        points: newDayPoints,
      },
      points: updatedTotalPoints,
    });
  };

  const handleRadioChange = (namaz, value) => {
    const updatedNamazData = { ...namazData, [namaz]: value };
    setNamazData(updatedNamazData);

    // Automatically update without modal or notification
    updateNamazData(updatedNamazData);
  };

  const columns = [
    { title: "Namaz", dataIndex: "namaz", key: "namaz" },
    {
      title: "At Mosque",
      dataIndex: "mosque",
      key: "mosque",
      render: (_, record) => (
        <Radio
          checked={namazData[record.namaz] === "At Mosque"}
          onChange={() => handleRadioChange(record.namaz, "At Mosque")}
        />
      ),
    },
    {
      title: "At Home",
      dataIndex: "home",
      key: "home",
      render: (_, record) => (
        <Radio
          checked={namazData[record.namaz] === "At Home"}
          onChange={() => handleRadioChange(record.namaz, "At Home")}
        />
      ),
    },
    {
      title: "Qaza",
      dataIndex: "qaza",
      key: "qaza",
      render: (_, record) => (
        <Radio
          checked={namazData[record.namaz] === "Qaza"}
          onChange={() => handleRadioChange(record.namaz, "Qaza")}
        />
      ),
    },
    {
      title: "Not Prayed",
      dataIndex: "notPrayed",
      key: "notPrayed",
      render: (_, record) => (
        <Radio
          checked={namazData[record.namaz] === "Not Prayed"}
          onChange={() => handleRadioChange(record.namaz, "Not Prayed")}
        />
      ),
    },
  ];

  const data = [
    { key: "1", namaz: "Fajr" },
    { key: "2", namaz: "Zuhr" },
    { key: "3", namaz: "Asr" },
    { key: "4", namaz: "Maghrib" },
    { key: "5", namaz: "Isha" },
  ];

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null} // Remove the OK and Cancel buttons
      title="Update Performance"
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Modal>
  );
};

export default PerformanceModal;
