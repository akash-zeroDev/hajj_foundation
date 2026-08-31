import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/react';

export default function SidebarLayout({ navigation, title, children }) {
  const location = useLocation();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-olive-deep text-ivory/90 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-center border-b border-ivory/10">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex-shrink-0 text-ivory">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" opacity="0.8"/>
                <circle cx="12" cy="12" r="2.5" fill="white" />
              </svg>
            </span>
            <span className="font-serif text-lg tracking-[0.25em] text-ivory">EDEN</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/superadmin' && item.href !== '/admin' && item.href !== '/employee');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-green text-ivory shadow-sm' 
                    : 'text-ivory/70 hover:bg-green/40 hover:text-ivory'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-ivory/10 flex items-center gap-3">
           <UserButton />
           <div className="flex flex-col">
             <span className="text-sm font-medium text-ivory truncate max-w-[150px]">
               {user?.firstName || user?.primaryEmailAddress?.emailAddress.split('@')[0]}
             </span>
             <span className="text-xs text-ivory/50 capitalize">
               {user?.publicMetadata?.role || 'User'}
             </span>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200">
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
             {/* Additional header items could go here */}
             <span className="text-sm text-slate-500 hidden sm:block">
               {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
