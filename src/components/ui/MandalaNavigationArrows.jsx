import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "../../hooks/useWindowDimensions";

export default function MandalaNavigationArrows({
  selectedAtom,
  mandalaData,
  showOverlay,
  onNavigate,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  if (selectedAtom === null || !showOverlay) return null;

  const mandala = mandalaData[selectedAtom];

  const handlePrevious = () => {
    if (onNavigate) {
      const newIndex = selectedAtom === 0 ? mandalaData.length - 1 : selectedAtom - 1;
      onNavigate(newIndex);
    }
  };

  const handleNext = () => {
    if (onNavigate) {
      const newIndex = selectedAtom === mandalaData.length - 1 ? 0 : selectedAtom + 1;
      onNavigate(newIndex);
    }
  };

  const handleArrowMouseEnter = (e) => {
    e.currentTarget.style.transform = "scale(1.2)";
    e.currentTarget.style.opacity = "1";
  };

  const handleArrowMouseLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.opacity = "0.8";
  };

  const arrowBaseStyle = {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px)",
    border: `2px solid ${mandala.color}`,
    borderRadius: "50%",
    width: isMobile ? "50px" : "60px",
    height: isMobile ? "50px" : "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: mandala.color,
    fontSize: isMobile ? "1.5rem" : "2rem",
    cursor: "pointer",
    opacity: "0.8",
    transition: "all 0.3s ease",
    zIndex: 998,
  };

  // Calculate right arrow position based on overlay width
  const overlayWidth = isMobile ? "100vw" : "450px";
  const rightArrowPosition = isMobile
    ? "calc(100vw - 70px)" // Just left of mobile overlay edge
    : "calc(100vw - 450px - 30px)"; // Just left of desktop overlay (450px width + 30px margin)

  return (
    <>
      <button
        onClick={handlePrevious}
        style={{
          ...arrowBaseStyle,
          left: isMobile ? "10px" : "20px",
        }}
        onMouseEnter={handleArrowMouseEnter}
        onMouseLeave={handleArrowMouseLeave}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <button
        onClick={handleNext}
        style={{
          ...arrowBaseStyle,
          right: isMobile ? "calc(100vw - 70px)" : "calc(450px + 30px)",
        }}
        onMouseEnter={handleArrowMouseEnter}
        onMouseLeave={handleArrowMouseLeave}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </>
  );
}
