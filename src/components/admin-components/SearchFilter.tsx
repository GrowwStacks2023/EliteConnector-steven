import React from 'react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus?: 'all' | 'active' | 'inactive';
  onFilterChange?: (value: 'all' | 'active' | 'inactive') => void;
  placeholder?: string;
  showStatusFilter?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  placeholder = 'Search...',
  showStatusFilter = true
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <style>{`
        .glow-cyan {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3),
                      0 0 40px rgba(34, 211, 238, 0.1);
        }
      `}</style>

      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-3 bg-slate-900 border border-cyan-900/30 rounded-lg text-white placeholder-slate-500 font-rajdhani focus:outline-none focus:border-cyan-500 glow-cyan"
      />
      
      {showStatusFilter && onFilterChange && (
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-3 bg-slate-900 border border-cyan-900/30 rounded-lg text-white font-rajdhani focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      )}
    </div>
  );
};

export default SearchFilter;