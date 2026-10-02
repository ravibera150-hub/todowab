/**
 * =========================================================================
 * Filter Bar Component (components/FilterBar.jsx)
 * =========================================================================
 * Provides search, category filtering, priority filtering, and sorting.
 */

import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const FilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="filter-bar" aria-label="Task Filters">
      <div className="filter-controls">
        {/* Search Keyword Input */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by Category"
        >
          <option value="All">All Categories</option>
          <option value="Work">Work</option>
          <option value="Study">Study</option>
          <option value="Personal">Personal</option>
          <option value="Health">Health</option>
          <option value="Urgent">Urgent</option>
          <option value="General">General</option>
        </select>

        {/* Priority Filter */}
        <select
          className="filter-select"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          aria-label="Filter by Priority"
        >
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      {/* Sorting Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowUpDown size={16} color="var(--text-muted)" />
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort Tasks"
        >
          <option value="default">Sort: Default</option>
          <option value="dueTime">Sort: Due Time (Earliest)</option>
          <option value="priority">Sort: Priority (High to Low)</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
