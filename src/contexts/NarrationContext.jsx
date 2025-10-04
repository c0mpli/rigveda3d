import { createContext, useContext, useState, useRef, useEffect } from "react";

const NarrationContext = createContext();

export const useNarration = () => {
  const context = useContext(NarrationContext);
  if (!context) {
    throw new Error("useNarration must be used within NarrationProvider");
  }
  return context;
};

export const NarrationProvider = ({ children }) => {
  const [language, setLanguage] = useState("hi"); // Default to Hindi
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const narrationRef = useRef(null);
  const currentTrackRef = useRef(null);

  const playNarration = (track) => {
    // Don't play if narration is disabled
    if (!isEnabled) {
      console.log("Narration is disabled");
      return;
    }

    // Build path based on language
    const audioPath = `/sounds/narration/${language}/${track}.mp3`;
    console.log("Playing narration:", audioPath);

    // Don't restart if same track is already playing
    if (currentTrackRef.current === audioPath && isPlaying) {
      console.log("Same track already playing");
      return;
    }

    // Stop current narration if playing
    if (narrationRef.current) {
      narrationRef.current.pause();
      narrationRef.current.currentTime = 0;
    }

    // Create new audio instance
    narrationRef.current = new Audio(audioPath);
    currentTrackRef.current = audioPath;

    narrationRef.current.onended = () => {
      console.log("Narration ended");
      setIsPlaying(false);
      currentTrackRef.current = null;
    };

    narrationRef.current.play()
      .then(() => {
        console.log("Narration playing successfully");
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("Error playing narration:", error);
        setIsPlaying(false);
      });
  };

  const stopNarration = () => {
    if (narrationRef.current) {
      narrationRef.current.pause();
      narrationRef.current.currentTime = 0;
      setIsPlaying(false);
      currentTrackRef.current = null;
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === "hi" ? "en" : "hi";
    setLanguage(newLanguage);

    // Stop current narration when switching language
    stopNarration();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (narrationRef.current) {
        narrationRef.current.pause();
      }
    };
  }, []);

  const toggleNarration = () => {
    if (isEnabled) {
      stopNarration();
    }
    setIsEnabled(!isEnabled);
  };

  const value = {
    language,
    isPlaying,
    isEnabled,
    playNarration,
    stopNarration,
    toggleLanguage,
    toggleNarration,
  };

  return (
    <NarrationContext.Provider value={value}>
      {children}
    </NarrationContext.Provider>
  );
};
