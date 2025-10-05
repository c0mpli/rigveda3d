import { useState } from "react";

export default function IntroScreen({ onStart }) {
  const [isClosing, setIsClosing] = useState(false);

  const playHoverSound = () => {
    const hoverSound = new Audio("/sounds/hover.mp3");
    hoverSound.volume = 1;
    hoverSound.play().catch(() => {});
  };

  const handleStart = () => {
    setIsClosing(true);
    setTimeout(() => {
      onStart();
    }, 500); // Wait for animation to complete
  };

  return (
    <div className={`intro-modal-backdrop ${isClosing ? 'closing' : ''}`}>
      <div className="intro-modal">
        <h1 className="intro-title">Welcome to Rig Veda 3D</h1>
        <p className="intro-subtitle">
          Explore the ancient wisdom of the Rig Veda through an immersive 3D
          experience
        </p>
        <button
          className="intro-button"
          onClick={handleStart}
          onMouseEnter={playHoverSound}
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
