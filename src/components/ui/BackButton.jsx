const BUTTON_STYLE = {
  position: "fixed",
  bottom: "20px",
  left: "20px",
  zIndex: 1000,
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "50%",
  width: "50px",
  height: "50px",
  color: "white",
  cursor: "pointer",
  fontSize: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
};

export default function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={BUTTON_STYLE}>
      ←
    </button>
  );
}
