// src/AudioPlayer.js
import React, { useState, useRef, useEffect } from "react";

// Use an absolute path from the public directory
const lectures = [
  "../public/audios/Namaz Parhna Kun Zaroori Hai  Bayan By  Maulana Tariq Jameel 2024.mp3",
  // Add more paths if needed
];

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(0);
  const audioRef = useRef(new Audio(lectures[currentLecture]));

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnd = () => {
    const nextLecture = (currentLecture + 1) % lectures.length;
    setCurrentLecture(nextLecture);
    audioRef.current.src = lectures[nextLecture];
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  useEffect(() => {
    audioRef.current.src = lectures[currentLecture];
    audioRef.current.onended = handleEnd;
  }, [currentLecture]);

  return (
    <div className="audio-player">
      <button onClick={togglePlayPause} className="audio-button">
        {isPlaying ? "🔊" : "🔇"}
      </button>
    </div>
  );
};

export default AudioPlayer;
