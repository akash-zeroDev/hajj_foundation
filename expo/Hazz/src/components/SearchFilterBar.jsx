import React from 'react';

const SearchFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  placeholder = "Search..." 
}) => {
  return (
    <div className="flex mb-6">
      <div className="flex-1 relative">
        <svg className="w-[18px] h-[18px] absolute left-3 top-[11px] text-slate-400 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-sm transition-shadow"
        />
      </div>
    </div>
  );
};

export default SearchFilterBar;
