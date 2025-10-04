import { useState } from "react";
import "./Dictionary.css";

const Dictionary = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample dictionary entries - this would come from a real dictionary API/data
  const sampleEntries = [
    {
      term: "Agni",
      sanskrit: "अग्नि",
      meaning: "Fire; the Vedic god of fire and sacrifice",
      etymology: "From Sanskrit root 'ag' meaning 'to drive' or 'to lead'",
      context:
        "Central deity in Rigveda, invoked in most hymns as the messenger between humans and gods",
    },
    {
      term: "Indra",
      sanskrit: "इन्द्र",
      meaning: "King of gods; god of thunder, lightning, storms, and rain",
      etymology:
        "Possibly from root 'ind' meaning 'to drop' (referring to rain)",
      context:
        "Most frequently mentioned deity in Rigveda, slayer of Vritra the dragon",
    },
    {
      term: "Soma",
      sanskrit: "सोम",
      meaning: "Sacred drink; deity associated with the ritual drink",
      etymology: "From root 'su' meaning 'to press' or 'to extract'",
      context:
        "Central to Vedic rituals, entire Mandala 9 is dedicated to Soma",
    },
    {
      term: "Rta",
      sanskrit: "ऋत",
      meaning: "Cosmic order; natural law; truth",
      etymology: "From root 'r' meaning 'to go' or 'to move'",
      context: "Fundamental concept governing cosmic, moral, and ritual order",
    },
  ];

  const filteredEntries = sampleEntries.filter(
    (entry) =>
      entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="dictionary-overlay" onClick={onClose}>
      <div className="dictionary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dictionary-header">
          <h2>📚 Vedic Dictionary</h2>
          <button className="close-button" onClick={onClose}>
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

        <div className="dictionary-search">
          <input
            type="text"
            placeholder="Search terms, meanings, or Sanskrit words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dictionary-search-input"
          />
        </div>

        <div className="dictionary-content">
          {filteredEntries.length > 0 ? (
            <div className="dictionary-entries">
              {filteredEntries.map((entry, index) => (
                <div key={index} className="dictionary-entry">
                  <div className="entry-header">
                    <h3 className="entry-term">{entry.term}</h3>
                    <span className="entry-sanskrit">{entry.sanskrit}</span>
                  </div>
                  <div className="entry-meaning">{entry.meaning}</div>
                  <div className="entry-etymology">
                    <strong>Etymology:</strong> {entry.etymology}
                  </div>
                  <div className="entry-context">
                    <strong>Context:</strong> {entry.context}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-entries">
              <p>No entries found for "{searchTerm}"</p>
              <p className="dictionary-note">
                This is a sample dictionary. In a full implementation, this
                would contain thousands of Vedic terms and concepts.
              </p>
            </div>
          )}

          {searchTerm === "" && (
            <div className="dictionary-placeholder">
              <div className="placeholder-icon">📖</div>
              <h3>Vedic Dictionary</h3>
              <p>
                Search for Sanskrit terms, deity names, concepts, and their
                meanings from the Rigveda.
              </p>
              <div className="dictionary-features">
                <h4>Features:</h4>
                <ul>
                  <li>🔍 Search Sanskrit terms and their meanings</li>
                  <li>📜 Etymology and linguistic roots</li>
                  <li>🏛️ Cultural and religious context</li>
                  <li>🌟 Cross-references with verses</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
