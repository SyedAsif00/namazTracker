import React, { useState, useRef, useEffect } from "react";

const lectures = [
  process.env.PUBLIC_URL + "/audios/audio.mp3", // Use PUBLIC_URL for proper path resolution
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
    audioRef.current.onerror = (e) => {
      console.error("Error loading audio file:", e);
    };
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
