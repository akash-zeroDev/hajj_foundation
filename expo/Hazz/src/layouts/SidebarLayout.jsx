import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser, useOrganization } from '@clerk/react';
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
import NotificationDropdown from '../components/NotificationDropdown';

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
  const { organization } = useOrganization();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayRole = location.pathname.startsWith('/superadmin') 
    ? 'Superadmin' 
    : location.pathname.startsWith('/admin') 
      ? 'Employer' 
      : 'Employee';

  // close drawer on route change + esc
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-[#0B0F0E]" style={{ fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* Mobile scrim */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/35 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — exact replica of hajj-sidebar.html */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/5 bg-noir-rich text-[#C2BEB4] transition-transform duration-200 ease-out
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ width: '268px' }} aria-label="Primary">

        {/* Brand */}
        <div className="flex flex-col items-center justify-center border-b border-white/5 px-5 py-5">
          <div className="text-[16px] font-bold leading-none tracking-[-0.02em] text-[#C19F5C] text-center">Hajj Savings</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C19F5C]/80 text-center">{organization?.name ? `${organization.name} • ${displayRole}` : displayRole}</div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 py-[14px]">
          {(() => {
            let currentCategory = '';
            return navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/superadmin' && item.href !== '/admin' && item.href !== '/employee');
              
              const categoryHeader = item.category && item.category !== currentCategory ? (
                <div key={`cat-${item.category}`} className="px-[10px] pb-2 pt-[18px] first:pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C19F5C]/70">{item.category}</p>
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
                        ? 'bg-[#C19F5C]/10 text-[#C19F5C] shadow-[inset_0_0_0_1px_var(--tw-shadow-color)] shadow-[#C19F5C]/20' 
                        : 'bg-transparent text-[#C2BEB4] hover:bg-[#C19F5C]/10 hover:text-[#F4F0E6]'
                      }
                    `}
                  >
                    <span className={`shrink-0 opacity-80 ${isActive ? '!opacity-100 !text-[#C19F5C]' : ''}`}>
                      {ICONS[item.name] || ICONS['Dashboard Overview']}
                    </span>
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`ml-auto shrink-0 rounded-full border px-[7px] py-[1px] text-[11px] font-semibold leading-none ${isActive ? 'border-[#C19F5C]/30 bg-[#C19F5C]/20 text-[#DDBE7B]' : 'border-white/10 bg-white/5 text-[#C2BEB4]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </React.Fragment>
              );
            });
          })()}
        </nav>
        
        <div className="flex items-center gap-[11px] border-t border-white/5 bg-noir-rich p-[14px]">
           <div className="shrink-0">
             <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
           </div>
           <div className="flex min-w-0 flex-col leading-none">
             <strong className="truncate text-[13.5px] font-semibold text-[#F4F0E6]">
               {user?.firstName || user?.primaryEmailAddress?.emailAddress.split('@')[0] || 'User'}
             </strong>
             <small className="mt-[2px] text-[12px] capitalize text-[#C19F5C]/80">
               {organization?.name ? `${organization.name} • ${displayRole}` : displayRole}
             </small>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
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

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1360px] flex-1 p-4 sm:p-6 lg:p-[26px] lg:pb-[40px] lg:pt-[24px]">
          {children}
        </main>
      </div>
    </div>
  );
}
