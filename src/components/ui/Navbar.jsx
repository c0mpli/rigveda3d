import { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { useNarration } from "../../contexts/NarrationContext";
import useWindowDimensions from "../../hooks/useWindowDimensions";

const Navbar = ({
  // Volume controls
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  // Search
  onSearchClick,
  // Filter
  onFilterClick,
  // Dictionary
  onDictionaryClick,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const { language, toggleLanguage, isEnabled, toggleNarration } =
    useNarration();
  const hoverSoundRef = useRef(null);

  const playHoverSound = () => {
    if (!hoverSoundRef.current) {
      hoverSoundRef.current = new Audio("/sounds/hover.mp3");
      hoverSoundRef.current.volume = 1;
    }
    hoverSoundRef.current.currentTime = 0;
    hoverSoundRef.current.play().catch(() => {});
  };

  // Update collapsed state when switching between mobile and desktop
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <nav className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="navbar-content">
        {/* Collapse toggle */}
        <div className="navbar-top">
          <button
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand navbar" : "Collapse navbar"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>

          {/* Navigation items */}
          <div className="navbar-items">
            {/* Volume Control */}
            <div
              className="navbar-item volume-control"
              onMouseEnter={() => {
                setShowVolumeSlider(true);
                playHoverSound();
              }}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                className="navbar-button"
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : volume > 0.5 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <span>Volume</span>
              </button>
              {showVolumeSlider && (
                <div className="volume-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={onVolumeChange}
                    className="volume-slider"
                  />
                  <span className="volume-value">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="navbar-item" onMouseEnter={playHoverSound}>
              <button
                className="navbar-button"
                onClick={onSearchClick}
                aria-label="Search Rig Veda"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="10.5"
                    cy="10.5"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <line
                    x1="16.5"
                    y1="16.5"
                    x2="21"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="10.5"
                    cy="10.5"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    opacity="0.4"
                    fill="none"
                  />
                </svg>
                <span>Search</span>
              </button>
            </div>

            {/* Filter */}
            {/* <div className="navbar-item">
              <button
                className="navbar-button"
                onClick={onFilterClick}
                aria-label="Filter verses"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <span>Filter</span>
              </button>
            </div> */}

            {/* Stats */}
            <div className="navbar-item" onMouseEnter={playHoverSound}>
              <button
                className="navbar-button"
                aria-label="View stats"
                disabled
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11H7a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2zM17 7h-2a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <span>Stats</span>
              </button>
            </div>

            {/* Dictionary */}
            <div className="navbar-item" onMouseEnter={playHoverSound}>
              <button
                className="navbar-button"
                onClick={onDictionaryClick}
                aria-label="Open dictionary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 19.5A2.5 2.5 0 016.5 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M8 7h8M8 11h8M8 15h5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Dictionary</span>
              </button>
            </div>

            {/* Narration Toggle */}
            <div className="navbar-item" onMouseEnter={playHoverSound}>
              <button
                className="navbar-button"
                onClick={toggleNarration}
                aria-label={
                  isEnabled ? "Disable narration" : "Enable narration"
                }
              >
                {isEnabled ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 9v6m3-8v8m3-5v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 9v6m3-8v8m3-5v2M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                )}
                <span>Narration</span>
              </button>
            </div>

            {/* Narration Language Toggle */}
            <div className="navbar-item" onMouseEnter={playHoverSound}>
              <button
                className="navbar-button"
                onClick={toggleLanguage}
                aria-label="Toggle narration language"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <span>{language === "hi" ? "हिन्दी" : "English"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="navbar-bottom">
          {/* Add any bottom items here if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
