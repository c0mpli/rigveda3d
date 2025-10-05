export default function IntroScreen({ onStart }) {
  const playHoverSound = () => {
    const hoverSound = new Audio("/sounds/hover.mp3");
    hoverSound.volume = 1;
    hoverSound.play().catch(() => {});
  };

  return (
    <div className="intro-modal-backdrop">
      <div className="intro-modal">
        <h1 className="intro-title">Welcome to Rig Veda 3D</h1>
        <p className="intro-subtitle">
          Explore the ancient wisdom of the Rig Veda through an immersive 3D
          experience
        </p>
        <button
          className="intro-button"
          onClick={onStart}
          onMouseEnter={playHoverSound}
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
