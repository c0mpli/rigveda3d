import { useEffect, useRef } from "react";
import "./WordMeaningSidebar.css";

export default function WordMeaningSidebar({ word, isVisible, onClose, color }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && word) {
      iframeRef.current.src = `https://www.learnsanskrit.cc/translate?search=${encodeURIComponent(word)}`;
    }
  }, [word]);

  if (!isVisible) return null;

  return (
    <>
      <div className={`word-meaning-sidebar-overlay ${isVisible ? "open" : ""}`}>
        <div className="word-meaning-sidebar-header">
          <h3 style={{ color }}>{word}</h3>
          <button className="close-word-sidebar-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="iframe-container">
          <iframe
            ref={iframeRef}
            className="word-meaning-iframe"
            title="Sanskrit Word Meaning"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <div className="iframe-credits">
          Powered by{" "}
          <a
            href="https://www.learnsanskrit.cc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color }}
          >
            Learn Sanskrit
          </a>
        </div>
      </div>
    </>
  );
}
