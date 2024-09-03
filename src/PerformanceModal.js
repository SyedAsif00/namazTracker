import React, { useState } from "react";
import { Modal, Table } from "antd";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
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
    const dayPoints = calculatePoints(namazData);
    const updatedPoints = (user.points || 0) + dayPoints;

    await updateDoc(doc(db, "users", user.uid), {
      [`performance.${selectedDate}`]: { ...namazData, points: dayPoints },
      points: updatedPoints,
    });

    onClose();
  };

  const columns = [
    { title: "Namaz", dataIndex: "namaz", key: "namaz" },
    {
      title: "At Mosque",
      dataIndex: "mosque",
      key: "mosque",
      render: (_, record) => (
        <input
          type="radio"
          checked={namazData[record.namaz] === "At Mosque"}
          onChange={() =>
            setNamazData({ ...namazData, [record.namaz]: "At Mosque" })
          }
        />
      ),
    },
    {
      title: "At Home",
      dataIndex: "home",
      key: "home",
      render: (_, record) => (
        <input
          type="radio"
          checked={namazData[record.namaz] === "At Home"}
          onChange={() =>
            setNamazData({ ...namazData, [record.namaz]: "At Home" })
          }
        />
      ),
    },
    {
      title: "Qaza",
      dataIndex: "qaza",
      key: "qaza",
      render: (_, record) => (
        <input
          type="radio"
          checked={namazData[record.namaz] === "Qaza"}
          onChange={() =>
            setNamazData({ ...namazData, [record.namaz]: "Qaza" })
          }
        />
      ),
    },
    {
      title: "Not Prayed",
      dataIndex: "notPrayed",
      key: "notPrayed",
      render: (_, record) => (
        <input
          type="radio"
          checked={namazData[record.namaz] === "Not Prayed"}
          onChange={() =>
            setNamazData({ ...namazData, [record.namaz]: "Not Prayed" })
          }
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
      title="Add Record"
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Modal>
  );
};

export default PerformanceModal;
