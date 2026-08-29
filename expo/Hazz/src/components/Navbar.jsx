import { Link } from 'react-router-dom';
import { Show, UserButton, SignInButton, SignUpButton, useUser } from '@clerk/react';

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="bg-emerald-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold tracking-wider flex items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hajj Savings Fund
            </Link>
          </div>
          <div>
            <Show when="signed-in">
              <div className="flex items-center space-x-6">
                <span className="text-sm text-emerald-100 hidden md:block">
                  Welcome, <strong className="text-white">{user?.primaryEmailAddress?.emailAddress}</strong>
                </span>
                <Link to="/dashboard" className="text-emerald-50 hover:text-white font-medium transition">
                  Dashboard
                </Link>
                <UserButton />
              </div>
            </Show>
            <Show when="signed-out">
              <div className="flex items-center space-x-4">
                <SignInButton mode="modal">
                  <button className="text-emerald-50 hover:text-white font-medium transition">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2 rounded-md font-semibold transition shadow-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
