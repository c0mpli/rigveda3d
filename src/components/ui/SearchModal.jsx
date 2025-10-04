import { useState, useEffect } from "react";
import "./SearchModal.css";

const SearchModal = ({
  isOpen,
  onClose,
  onSearch,
  results,
  loading,
  error,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Focus the input when modal opens
      setTimeout(() => {
        const input = document.querySelector(".search-input");
        if (input) input.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), 8);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const formatSimilarity = (similarity) => {
    return `${(similarity * 100).toFixed(1)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="search-modal-header">
          <h2>Search Rig Veda</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query (e.g., 'fire', 'wisdom', 'Indra')..."
              className="search-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="search-submit-button"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
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
              )}
            </button>
          </div>
        </form>

        <div className="search-results-container">
          {error && (
            <div className="search-error">
              <p>⚠️ {error}</p>
              <p className="error-note">
                Showing text-based search results as fallback
              </p>
            </div>
          )}

          {loading && (
            <div className="search-loading">
              <div className="loading-spinner large"></div>
              <p>🧠 AI-powered semantic search through ancient wisdom...</p>
            </div>
          )}

          {results && results.length > 0 && !loading && (
            <div className="search-results">
              <div className="results-header">
                <h3>Search Results ({results.length})</h3>
                {results[0]?.similarity !== 0.5 && !error && (
                  <span className="search-type semantic">
                    🧠 Semantic Search
                  </span>
                )}
                {(results[0]?.similarity === 0.5 || error) && (
                  <span className="search-type text">📝 Text Search</span>
                )}
              </div>
              <div className="results-list">
                {results.map((verse, index) => (
                  <div key={verse.id || index} className="result-item">
                    <div className="result-header">
                      <h4>{verse.title}</h4>
                      <span className="similarity-score">
                        {formatSimilarity(verse.similarity)}
                      </span>
                    </div>
                    <div className="result-location">
                      Mandala {verse.mandala}, Hymn {verse.hymn}, Verse{" "}
                      {verse.verse}
                    </div>
                    <div className="result-content">
                      <div className="sanskrit-text">
                        <strong>Sanskrit:</strong> {verse.sanskrit}
                      </div>
                      <div className="transliteration">
                        <strong>Transliteration:</strong>{" "}
                        {verse.transliteration}
                      </div>
                      <div className="translation">
                        <strong>Translation:</strong> {verse.translation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && results.length === 0 && !loading && !error && query && (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <p>Try different keywords or check your spelling</p>
            </div>
          )}

          {!results && !loading && !query && (
            <div className="search-placeholder">
              <div className="placeholder-icon">🔍</div>
              <h3>🧠 AI-Powered Semantic Search</h3>
              <p>
                Find verses by meaning, not just keywords. Our AI understands
                concepts and context to surface the most relevant ancient
                wisdom.
              </p>
              <div className="search-tips">
                <h4>Semantic Search Tips:</h4>
                <ul>
                  <li>
                    💭 Search by concepts: "divine light", "cosmic order",
                    "inner peace"
                  </li>
                  <li>
                    🔥 Explore themes: "battle", "sacrifice", "enlightenment",
                    "creation"
                  </li>
                  <li>
                    ⚡ Find deities: "thunder god", "fire deity", "dawn goddess"
                  </li>
                  <li>
                    🌟 Use emotions: "joy", "reverence", "strength", "wisdom"
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
