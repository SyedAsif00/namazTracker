// src/HadithDisplay.js
import React, { useEffect, useState } from "react";
import { hadithList } from "./HadithData";

const HadithDisplay = () => {
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHadithIndex((prevIndex) => (prevIndex + 1) % hadithList.length);
    }, 10000); // Change Hadith every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "10px",
        textAlign: "center",
        width: "80%",
        maxWidth: "600px",
        color: "white",
      }}
    >
      <p>{hadithList[currentHadithIndex]}</p>
    </div>
  );
};

export default HadithDisplay;
