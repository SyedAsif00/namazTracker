// src/RotatingAyah.js
import React, { useEffect, useState } from "react";
import { ayahList } from "./AyaData";

const RotatingAyah = () => {
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAyahIndex((prevIndex) => (prevIndex + 1) % ayahList.length);
    }, 10000); // Change Ayah every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="ayah-arabic">
      <p>{ayahList[currentAyahIndex]}</p>
    </div>
  );
};

export default RotatingAyah;
