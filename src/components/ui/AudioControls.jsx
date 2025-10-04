const CONTAINER_STYLE = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
};

const BUTTON_STYLE = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "50%",
  width: "50px",
  height: "50px",
  color: "white",
  cursor: "pointer",
  fontSize: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
};

const SLIDER_STYLE = {
  accentColor: "white",
  cursor: "pointer",
  writingMode: "bt-lr",
  WebkitAppearance: "slider-vertical",
  height: "100px",
  width: "20px",
};

export default function AudioControls({ isMuted, volume, onToggleMute, onVolumeChange, showSlider, onMouseEnter, onMouseLeave }) {
  return (
    <div
      style={CONTAINER_STYLE}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          opacity: showSlider ? 1 : 0,
          transform: showSlider ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.3s ease",
          pointerEvents: showSlider ? "auto" : "none",
        }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          orient="vertical"
          style={SLIDER_STYLE}
        />
      </div>
      <button onClick={onToggleMute} style={BUTTON_STYLE}>
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
