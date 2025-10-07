import useWindowDimensions from "../../hooks/useWindowDimensions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const getButtonStyle = (isMobile) => {
  return {
    position: "fixed",
    top: isMobile ? "10px" : "20px",
    right: isMobile ? "130px" : "180px", // Adjust for mobile navbar width
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
};

export default function BackButton({ onClick }) {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
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
      style={getButtonStyle(isMobile)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
  );
}
