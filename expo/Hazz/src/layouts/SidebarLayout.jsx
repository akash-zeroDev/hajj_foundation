import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/react';
import NotificationDropdown from '../components/NotificationDropdown';


export default function SidebarLayout({ navigation, title, children }) {
    const location = useLocation();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayRole = location.pathname.startsWith('/superadmin') 
    ? 'Superadmin' 
    : location.pathname.startsWith('/admin') 
      ? 'Employer' 
      : 'Employee';

  return (
    <div className="flex min-h-screen bg-[#f4f7f6] font-sans text-[#0e1a16]">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-black text-ivory/90 flex flex-col transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="py-5 flex items-center justify-center border-b border-white/10">
          <Link to="/" className="flex flex-col items-center justify-center px-1">
            <span className="font-bold text-[22px] leading-tight tracking-tight text-white">Hajj Savings</span>
            <span className="text-[11px] text-[#7f8f89] tracking-[0.08em] uppercase mt-0.5">
              {displayRole}
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {(() => {
            let currentCategory = '';
            return navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/superadmin' && item.href !== '/admin' && item.href !== '/employee');
              
              const categoryHeader = item.category && item.category !== currentCategory ? (
                <div key={`cat-${item.category}`} className="px-3 pt-5 pb-1 mt-1 first:mt-0 first:pt-2">
                  <p className="text-[10px] tracking-[0.14em] uppercase text-[#5f6d67] font-bold">{item.category}</p>
                </div>
              ) : null;
              
              if (item.category) {
                currentCategory = item.category;
              }

              return (
                <React.Fragment key={item.name}>
                  {categoryHeader}
                  <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-[#296043] text-ivory' 
                    : 'text-ivory/70 hover:bg-green/40 hover:text-ivory'
                  }
                `}
              >
                {item.name}
                {item.badge && (
                  <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#17a377]/15 text-[#9ff0d2]'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
                </React.Fragment>
            );
          })})()}
        </nav>
        
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
           <div className="flex-shrink-0">
             <UserButton />
           </div>
           <div className="flex flex-col min-w-0">
             <strong className="text-[13.5px] font-semibold text-white truncate max-w-[150px]">
               {user?.firstName || user?.primaryEmailAddress?.emailAddress.split('@')[0] || 'User'}
             </strong>
             <small className="text-[11.5px] text-[#7f8f89] capitalize">
               {displayRole}
             </small>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm h-[70px] flex items-center justify-between px-4 sm:px-6 lg:px-[26px] border-b border-[#e6ecea] sticky top-0 z-20">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
             <NotificationDropdown />
             <span className="text-sm text-slate-500 hidden sm:block">
               {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-[26px] lg:pt-[24px] lg:pb-[40px] max-w-[1360px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
