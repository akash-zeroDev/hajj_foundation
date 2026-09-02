import React from 'react';

const HorizontalTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HorizontalTabs;
