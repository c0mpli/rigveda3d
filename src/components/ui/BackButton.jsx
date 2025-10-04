const BUTTON_STYLE = {
  position: "fixed",
  top: "20px",
  right: "180px", // Position to the left of the navbar (navbar width 160px + some margin)
  zIndex: 1000,
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  width: "44px",
  height: "36px",
  color: "rgba(255, 255, 255, 0.85)",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
};

export default function BackButton({ onClick }) {
  const handleMouseEnter = (e) => {
    e.target.style.background = "rgba(255, 215, 0, 0.12)";
    e.target.style.borderColor = "rgba(255, 215, 0, 0.25)";
    e.target.style.color = "rgba(255, 215, 0, 0.95)";
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "0 4px 15px rgba(255, 215, 0, 0.15)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.background = "rgba(255, 255, 255, 0.05)";
    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
    e.target.style.color = "rgba(255, 255, 255, 0.85)";
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow =
      "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
  };

  return (
    <button
      onClick={onClick}
      style={BUTTON_STYLE}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      ←
    </button>
  );
}
