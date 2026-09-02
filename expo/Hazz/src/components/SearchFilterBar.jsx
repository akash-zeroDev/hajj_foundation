import React from 'react';
import { Search } from 'lucide-react';

const SearchFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  placeholder = "Search...",
  containerClassName = "flex mb-6",
  inputClassName = "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-sm transition-shadow"
}) => {
  return (
    <div className={containerClassName}>
      <div className="flex-1 relative">
        <Search className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClassName}
        />
      </div>
    </div>
  );
};

export default SearchFilterBar;
