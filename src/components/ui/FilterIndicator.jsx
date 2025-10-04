import "./FilterIndicator.css";

const FilterIndicator = ({ activeFilters, onClearFilters }) => {
  const hasFilters = Object.keys(activeFilters).length > 0;

  if (!hasFilters) return null;

  return (
    <div className="filter-indicator">
      <span className="filter-indicator-text">Filters Applied</span>
      <button
        className="clear-filters-btn"
        onClick={onClearFilters}
        aria-label="Clear filters"
      >
        ×
      </button>
    </div>
  );
};

export default FilterIndicator;
