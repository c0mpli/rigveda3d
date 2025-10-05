import { useState, useRef, useEffect } from "react";
import "./HymnsSidebar2D.css";

export default function HymnsSidebar2D({
  hymns,
  selectedHymnIndex,
  onHymnSelect,
  color,
  isVisible,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const gridRef = useRef(null);
  const pageFlipSoundRef = useRef(null);

  useEffect(() => {
    pageFlipSoundRef.current = new Audio("/sounds/whoosh.mp3");
    pageFlipSoundRef.current.volume = 1;
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Prevent wheel events from propagating to canvas
    const handleWheel = (e) => {
      // Stop propagation to prevent canvas from zooming
      e.stopPropagation();

      // Let the browser handle native scrolling
      const { scrollTop, scrollHeight, clientHeight } = grid;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;

      // Only prevent default at scroll boundaries
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault();
      }
    };

    grid.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      grid.removeEventListener("wheel", handleWheel);
    };
  }, []);

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

        <div className="hymns-grid-2d" ref={gridRef}>
          {hymns.map((hymn, index) => (
            <div
              key={index}
              className={`hymn-item-2d ${
                selectedHymnIndex === index ? "selected" : ""
              }`}
              onClick={() => {
                if (pageFlipSoundRef.current) {
                  pageFlipSoundRef.current.currentTime = 0;
                  pageFlipSoundRef.current.play().catch(() => {});
                }
                onHymnSelect(index);

                // Close sidebar on mobile after selecting a hymn
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                  setIsOpen(false);
                }
              }}
              style={{
                borderColor:
                  selectedHymnIndex === index
                    ? color
                    : "rgba(255, 255, 255, 0.2)",
                backgroundColor:
                  selectedHymnIndex === index ? `${color}22` : "transparent",
              }}
            >
              <div className="hymn-number-2d" style={{ color }}>
                {hymn.hymnNumber}
              </div>
              {hymn.verseCount > 0 && (
                <div className="hymn-verses-2d">{hymn.verseCount}v</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
