import { useState } from "react";
import "./HymnsSidebar2D.css";

export default function HymnsSidebar2D({
  hymns,
  selectedHymnIndex,
  onHymnSelect,
  color,
  isVisible
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          className="sidebar-toggle-btn-2d"
          onClick={() => setIsOpen(true)}
          style={{ borderColor: color }}
        >
          <span style={{ color }}>☰</span>
        </button>
      )}

      {/* Sidebar */}
      <div className={`hymns-sidebar-2d ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header-2d">
          <h2 style={{ color }}>Hymns</h2>
          <button
            className="close-btn-2d"
            onClick={() => setIsOpen(false)}
            style={{ color }}
          >
            ✕
          </button>
        </div>

        <div className="hymns-grid-2d">
          {hymns.map((hymn, index) => (
            <div
              key={index}
              className={`hymn-item-2d ${selectedHymnIndex === index ? "selected" : ""}`}
              onClick={() => onHymnSelect(index)}
              style={{
                borderColor: selectedHymnIndex === index ? color : "rgba(255, 255, 255, 0.2)",
                backgroundColor: selectedHymnIndex === index ? `${color}22` : "transparent"
              }}
            >
              <div className="hymn-number-2d" style={{ color }}>
                {hymn.hymnNumber}
              </div>
              {hymn.verseCount > 0 && (
                <div className="hymn-verses-2d">
                  {hymn.verseCount}v
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
