import { memo } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = memo(({ searchTerm, onSearchChange, onClearSearch }) => (
  <div className="search-container">
    <div className="search-input-container">
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search by email, name, or body..."
        value={searchTerm}
        onChange={onSearchChange}
        className="search-input"
        aria-label="Search comments"
      />
      {searchTerm && (
        <button 
          className="clear-search"
          onClick={onClearSearch}
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  </div>
));

export default SearchBar;
