import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/react';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Award,
  Landmark,
  FileText,
  BarChart3,
  Settings,
  FileCheck,
  Wallet,
  Home,
} from 'lucide-react';

const ICONS = {
  'Dashboard Overview': <LayoutDashboard size={18} strokeWidth={1.7} />,
  'Organisations': <Building2 size={18} strokeWidth={1.7} />,
  'Overview': <LayoutDashboard size={18} strokeWidth={1.7} />,
  'Users': <Users size={18} strokeWidth={1.7} />,
  'Employees': <Users size={18} strokeWidth={1.7} />,
  'Payments & Revenues': <CreditCard size={18} strokeWidth={1.7} />,
  'Employee Payments': <CreditCard size={18} strokeWidth={1.7} />,
  'Awards': <Award size={18} strokeWidth={1.7} />,
  'Bank Accounts': <Landmark size={18} strokeWidth={1.7} />,
  'Documents': <FileText size={18} strokeWidth={1.7} />,
  'Reports & Audit': <BarChart3 size={18} strokeWidth={1.7} />,
  'Reports': <BarChart3 size={18} strokeWidth={1.7} />,
  'My Portal': <Home size={18} strokeWidth={1.7} />,
  'Contributions': <Wallet size={18} strokeWidth={1.7} />,
  'Statements': <FileText size={18} strokeWidth={1.7} />,
  'Agreements': <FileCheck size={18} strokeWidth={1.7} />,
  'Settings': <Settings size={18} strokeWidth={1.7} />,
  'Profile Settings': <Settings size={18} strokeWidth={1.7} />,
};

export default function SidebarLayout({ navigation, title, children }) {
  const location = useLocation();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayRole = location.pathname.startsWith('/superadmin') 
    ? 'Superadmin' 
    : location.pathname.startsWith('/admin') 
      ? 'Employer' 
      : 'Employee';

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-[#0B0F0E]" style={{ fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/35 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — exact replica of hajj-sidebar.html */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[#1A1A1A] bg-[#080808] text-[#A1A1AA] transition-transform duration-200 ease-out
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ width: '268px' }} aria-label="Primary">

        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-[#171717] px-5 py-[22px] pb-[18px]">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-[#242424] bg-[#111111]">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 2.5 20 6v6c0 5-3.6 8.3-8 9.5C7.6 20.3 4 17 4 12V6l8-3.5Z" stroke="#C9B37A" strokeWidth="1.6"/><path d="M8.5 12h7M12 8.5v7" stroke="#7BC49E" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="text-[16px] font-bold leading-none tracking-[-0.02em] text-white">Hajj Savings</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">{displayRole}</div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 py-[14px]">
          {(() => {
            let currentCategory = '';
            return navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/superadmin' && item.href !== '/admin' && item.href !== '/employee');
              
              const categoryHeader = item.category && item.category !== currentCategory ? (
                <div key={`cat-${item.category}`} className="px-[10px] pb-2 pt-[18px] first:pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]">{item.category}</p>
                </div>
              ) : null;
              
              if (item.category) currentCategory = item.category;

              return (
                <React.Fragment key={item.name}>
                  {categoryHeader}
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex w-full items-center gap-[11px] rounded-[7px] px-[10px] py-[9px] text-left text-[13.6px] font-medium leading-none tracking-[-0.01em] transition-colors
                      ${isActive 
                        ? 'bg-[#0E5C3E] text-white shadow-[inset_0_0_0_1px_#14523D]' 
                        : 'bg-transparent text-[#A1A1AA] hover:bg-[#122019] hover:text-[#E7F0E8]'
                      }
                    `}
                  >
                    <span className={`shrink-0 opacity-80 ${isActive ? '!opacity-100 !text-[#7BC49E]' : ''}`}>
                      {ICONS[item.name] || ICONS['Dashboard Overview']}
                    </span>
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`ml-auto shrink-0 rounded-full border px-[7px] py-[1px] text-[11px] font-semibold leading-none ${isActive ? 'border-[#1B5A3E] bg-[#0A3D2A] text-[#A7E5C0]' : 'border-[#262626] bg-[#141414] text-[#A1A1AA]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </React.Fragment>
              );
            });
          })()}
        </nav>
        
        <div className="flex items-center gap-[11px] border-t border-[#171717] bg-[#080808] p-[14px]">
           <div className="shrink-0">
             <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
           </div>
           <div className="flex min-w-0 flex-col leading-none">
             <strong className="truncate text-[13.5px] font-semibold text-white">
               {user?.firstName || user?.primaryEmailAddress?.emailAddress.split('@')[0] || 'User'}
             </strong>
             <small className="mt-[2px] text-[12px] capitalize text-[#8EA296]">
               {displayRole}
             </small>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[#E5E7EB] bg-white/90 px-4 shadow-sm backdrop-blur-[10px] sm:px-6 lg:px-[26px]">
          <div className="flex items-center">
            <button 
              className="mr-2 -ml-2 grid h-9 w-9 place-items-center rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#2B3330] hover:bg-[#F9FAFB] lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="truncate text-[16px] font-bold tracking-[-0.02em] text-[#0B0F0E] lg:text-[15px]">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
             <NotificationDropdown />
             <span className="hidden text-[13px] text-[#6B7280] sm:block">
               {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] flex-1 p-4 sm:p-6 lg:p-[26px] lg:pb-[40px] lg:pt-[24px]">
          {children}
        </main>
      </div>
    </div>
  );
}
