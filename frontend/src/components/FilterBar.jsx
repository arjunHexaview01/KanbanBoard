import React from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { ChevronLeft, ChevronRight, RotateCcw, Filter } from 'lucide-react';

export default function FilterBar() {
  const {
    users,
    filters,
    totalPages,
    totalItems,
    setFilter,
    clearFilters,
  } = useBoardStore();

  const handleAssigneeChange = (e) => {
    setFilter('assigneeId', e.target.value);
  };

  const handlePriorityChange = (e) => {
    setFilter('priority', e.target.value);
  };

  const handlePrevPage = () => {
    if (filters.page > 1) {
      setFilter('page', filters.page - 1);
    }
  };

  const handleNextPage = () => {
    if (filters.page < totalPages) {
      setFilter('page', filters.page + 1);
    }
  };

  const hasActiveFilters = filters.assigneeId !== '' || filters.priority !== '';

  return (
    <div className="actions-bar">
      <div className="filter-bar-container">
        <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
        
        <select
          className="filter-select"
          value={filters.assigneeId}
          onChange={handleAssigneeChange}
        >
          <option value="">All Assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.priority}
          onChange={handlePriorityChange}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            <RotateCcw size={14} /> Clear
          </button>
        )}
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handlePrevPage}
          disabled={filters.page <= 1}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>
        
        <span className="pagination-info">
          Page {filters.page} of {totalPages || 1} ({totalItems} total)
        </span>

        <button
          className="pagination-btn"
          onClick={handleNextPage}
          disabled={filters.page >= totalPages}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
