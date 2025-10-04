import { useState, useEffect } from "react";
import "./FilterModal.css";

const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  filterOptions,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    mandala: "all",
    hymnFrom: "",
    hymnTo: "",
    deity: "all",
    ...initialFilters,
  });

  useEffect(() => {
    if (isOpen) {
      // Reset or apply initial filters when modal opens
      setFilters({
        mandala: "all",
        hymnFrom: "",
        hymnTo: "",
        deity: "all",
        ...initialFilters,
      });
    }
  }, [isOpen, initialFilters]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    const activeFilters = {};

    if (filters.mandala !== "all") {
      activeFilters.mandala = filters.mandala;
    }
    if (filters.hymnFrom) {
      activeFilters.hymnFrom = filters.hymnFrom;
    }
    if (filters.hymnTo) {
      activeFilters.hymnTo = filters.hymnTo;
    }
    if (filters.deity !== "all") {
      activeFilters.deity = filters.deity;
    }

    onApplyFilters(activeFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      mandala: "all",
      hymnFrom: "",
      hymnTo: "",
      deity: "all",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.mandala !== "all" ||
      filters.hymnFrom !== "" ||
      filters.hymnTo !== "" ||
      filters.deity !== "all"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div
        className="filter-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="filter-modal-header">
          <h2>Filter Hymns & Verses</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close filter"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="filter-modal-content">
          <div className="filter-section">
            <label className="filter-label">
              <span className="label-icon">📖</span>
              <span>Mandala</span>
            </label>
            <select
              value={filters.mandala}
              onChange={(e) => handleFilterChange("mandala", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Mandalas</option>
              {filterOptions?.mandalas?.map((mandala) => (
                <option key={mandala} value={mandala}>
                  Mandala {mandala}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">
              <span className="label-icon">📜</span>
              <span>Hymn Range</span>
            </label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="From"
                value={filters.hymnFrom}
                onChange={(e) => handleFilterChange("hymnFrom", e.target.value)}
                min={filterOptions?.hymnRange?.min || 1}
                max={filterOptions?.hymnRange?.max || 191}
                className="filter-input"
              />
              <span className="range-separator">—</span>
              <input
                type="number"
                placeholder="To"
                value={filters.hymnTo}
                onChange={(e) => handleFilterChange("hymnTo", e.target.value)}
                min={filterOptions?.hymnRange?.min || 1}
                max={filterOptions?.hymnRange?.max || 191}
                className="filter-input"
              />
            </div>
            {filterOptions?.hymnRange && (
              <div className="filter-hint">
                Range: {filterOptions.hymnRange.min} -{" "}
                {filterOptions.hymnRange.max}
              </div>
            )}
          </div>

          <div className="filter-section">
            <label className="filter-label">
              <span className="label-icon">⚡</span>
              <span>Deity</span>
            </label>
            <select
              value={filters.deity}
              onChange={(e) => handleFilterChange("deity", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Deities</option>
              {filterOptions?.deities?.map((deity) => (
                <option key={deity} value={deity}>
                  {deity}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-info">
            <div className="info-icon">ℹ️</div>
            <div className="info-text">
              Filters apply to both search results and browsing. Combine
              multiple filters to narrow down your exploration of the Rig Veda.
            </div>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button
            className="reset-button"
            onClick={handleReset}
            disabled={!hasActiveFilters()}
          >
            Reset Filters
          </button>
          <button className="apply-button" onClick={handleApply}>
            Apply Filters
          </button>
        </div>

        {hasActiveFilters() && (
          <div className="active-filters-summary">
            <span className="summary-label">Active Filters:</span>
            {filters.mandala !== "all" && (
              <span className="filter-badge">Mandala {filters.mandala}</span>
            )}
            {(filters.hymnFrom || filters.hymnTo) && (
              <span className="filter-badge">
                Hymns {filters.hymnFrom || "start"} -{" "}
                {filters.hymnTo || "end"}
              </span>
            )}
            {filters.deity !== "all" && (
              <span className="filter-badge">{filters.deity}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterModal;
