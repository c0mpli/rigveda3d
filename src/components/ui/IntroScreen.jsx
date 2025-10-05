export default function IntroScreen({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="intro-content">
        <h1 className="intro-title">Welcome to Rig Veda 3D</h1>
        <p className="intro-subtitle">
          Explore the ancient wisdom of the Rig Veda through an immersive 3D experience
        </p>
        <button className="intro-button" onClick={onStart}>
          Start Learning
        </button>
      </div>
    </div>
  );
}
