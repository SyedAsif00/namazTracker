import React, { useState, useEffect } from "react";
import { Modal, Table, Radio, message } from "antd";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "./firebase.config";

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
          totalPoints += 0.5;
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
  const handleSave = async () => {
    // Calculate new points based on the updated namaz data
    const newDayPoints = calculatePoints(namazData);

    // Fetch the previous points for the selected date if they exist
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    let previousDayPoints = 0;

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.performance && userData.performance[selectedDate]) {
        previousDayPoints = userData.performance[selectedDate].points || 0;
      }
    }

    // Calculate the updated total points
    const updatedPoints = (user.points || 0) - previousDayPoints + newDayPoints;

    // Update Firestore with the new performance data and adjusted points
    await updateDoc(docRef, {
      [`performance.${selectedDate}`]: { ...namazData, points: newDayPoints },
      points: updatedPoints,
    });

    onClose();
  };

  const handleRadioChange = (namaz, value) => {
    if (namazData[namaz] && namazData[namaz] !== value) {
      Modal.confirm({
        title: "Update Confirmation",
        content: "Do you really want to update the previous record?",
        onOk: () => {
          setNamazData({ ...namazData, [namaz]: value });
          message.success("Record updated successfully.");
        },
      });
    } else {
      setNamazData({ ...namazData, [namaz]: value });
    }
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
      onOk={handleSave}
      title="Update Performance"
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Modal>
  );
};

export default PerformanceModal;
