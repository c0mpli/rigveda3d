import { useNarration } from "../../contexts/NarrationContext";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useEffect } from "react";
import CopyLinkButton from "./CopyLinkButton";
import { getMandalaLink } from "../../utils/deepLinkUtils";

const getOverlayStyle = (isMobile) => {
  return {
    position: "fixed",
    top: 0,
    right: 0,
    width: isMobile ? "100vw" : "450px",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(20px)",
    zIndex: 999,
    color: "white",
    fontFamily: '"Inter", sans-serif',
    display: "flex",
    flexDirection: "column",
  };
};

const getContentStyle = (isMobile) => {
  return {
    flex: 1,
    overflowY: "auto",
    padding: isMobile ? "20px 16px 10px" : "40px 30px 20px",
  };
};

const getButtonContainerStyle = (isMobile) => {
  return {
    padding: isMobile ? "16px" : "20px 30px",
    marginBottom: isMobile ? "60px" : "0",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.5)",
  };
};

const getHeaderContainerStyle = (isMobile) => {
  return {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "10px" : "15px",
    marginBottom: "15px",
  };
};

const getEmojiStyle = (isMobile) => {
  return {
    fontSize: isMobile ? "2rem" : "3rem",
  };
};

const getTitleStyle = (isMobile) => {
  return {
    fontSize: isMobile ? "1.3rem" : "1.8rem",
    marginBottom: "5px",
    fontWeight: 700,
  };
};

const getSubtitleStyle = (isMobile) => {
  return {
    fontSize: isMobile ? "0.95rem" : "1.1rem",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: 500,
  };
};

const INFO_CONTAINER_STYLE = {
  display: "flex",
  gap: "20px",
  marginBottom: "25px",
  fontSize: "0.85rem",
  color: "rgba(255, 255, 255, 0.6)",
};

const DIVIDER_STYLE = {
  borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
  paddingLeft: "20px",
};

const SECTION_STYLE = {
  marginBottom: "25px",
};

const SECTION_TITLE_STYLE = {
  fontSize: "1.1rem",
  marginBottom: "12px",
  fontWeight: 600,
};

const SECTION_TEXT_STYLE = {
  lineHeight: "1.7",
  color: "rgba(255, 255, 255, 0.85)",
  fontSize: "0.95rem",
};

const DEITY_LIST_STYLE = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "0.9rem",
  listStyle: "none",
  paddingLeft: "0",
};

const DEITY_ITEM_STYLE = {
  display: "flex",
  alignItems: "center",
};

const BULLET_STYLE = {
  marginRight: "8px",
};

export default function MandalaOverlay({
  mandalaData,
  selectedAtom,
  showOverlay,
  onExplore,
  skipNarration = false,
}) {
  const { playNarration } = useNarration();
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  // Play mandala-specific narration when overlay is shown (unless skipped)
  useEffect(() => {
    if (showOverlay && selectedAtom !== null && !skipNarration) {
      const mandalaNumber = selectedAtom + 1;
      playNarration(mandalaNumber.toString());
    }
  }, [showOverlay, selectedAtom, playNarration, skipNarration]);

  if (selectedAtom === null) return null;

  const mandala = mandalaData[selectedAtom];

  const handleMouseEnter = (e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = `0 8px 20px ${mandala.color}60`;
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      style={{
        ...getOverlayStyle(isMobile),
        borderLeft: `2px solid ${mandala.color}40`,
        transform: showOverlay ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.5s ease",
      }}
    >
      <div style={getContentStyle(isMobile)}>
        <div style={getHeaderContainerStyle(isMobile)}>
          <span style={getEmojiStyle(isMobile)}>{mandala.emoji}</span>
          <div>
            <h2
              style={{
                ...getTitleStyle(isMobile),
                color: mandala.color,
              }}
            >
              Mandala {selectedAtom + 1}
            </h2>
            <p style={getSubtitleStyle(isMobile)}>{mandala.title}</p>
          </div>
        </div>

        <div style={INFO_CONTAINER_STYLE}>
          <div>
            <strong style={{ color: mandala.color }}>{mandala.hymns}</strong>{" "}
            hymns
          </div>
          <div style={DIVIDER_STYLE}>
            <strong>Family:</strong> {mandala.family}
          </div>
        </div>

        <div style={SECTION_STYLE}>
          <h3
            style={{
              ...SECTION_TITLE_STYLE,
              color: mandala.color,
            }}
          >
            Overview
          </h3>
          <p style={SECTION_TEXT_STYLE}>{mandala.description}</p>
        </div>

        <div style={SECTION_STYLE}>
          <h3
            style={{
              ...SECTION_TITLE_STYLE,
              color: mandala.color,
            }}
          >
            Key Deities
          </h3>
          <ul style={DEITY_LIST_STYLE}>
            {mandala.deities.map((deity, idx) => (
              <li key={idx} style={DEITY_ITEM_STYLE}>
                <span style={{ ...BULLET_STYLE, color: mandala.color }}>•</span>
                {deity}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3
            style={{
              ...SECTION_TITLE_STYLE,
              color: mandala.color,
            }}
          >
            Significance
          </h3>
          <p style={SECTION_TEXT_STYLE}>{mandala.significance}</p>
        </div>
      </div>

      <div style={getButtonContainerStyle(isMobile)}>
        <div style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
          <CopyLinkButton
            url={getMandalaLink(selectedAtom + 1)}
            label="Copy Link"
            color={mandala.color}
          />
          <button
            onClick={onExplore}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: `linear-gradient(135deg, ${mandala.color}, ${mandala.color}dd)`,
              border: `2px solid ${mandala.color}`,
              borderRadius: "12px",
              color: "white",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            ✨ Click to Explore
          </button>
        </div>
      </div>
    </div>
  );
}
