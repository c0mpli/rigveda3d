import { useState } from "react";
import "./SearchButton.css";

const SearchButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="search-button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Search Rig Veda"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`search-icon ${isHovered ? "hovered" : ""}`}
      >
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
    </button>
  );
};

export default SearchButton;
