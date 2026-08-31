import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';

const Home = () => {
  const { isSignedIn, userId } = useAuth();
  // Basic redirect link logic
  const dashboardLink = isSignedIn ? '/admin' : '/login';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Hero Section with Islamic Background */}
      <div className="flex-grow flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden">
        
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80 mix-blend-luminosity"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        ></div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Subtle Gold Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-medium tracking-wide mb-8 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Halal & Shariah Compliant Savings
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-xl leading-tight">
            Secure Your Journey to <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">The Holy City</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            A premium, dedicated platform empowering organisations and their employees to manage contributions, agreements, and awards securely.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            {isSignedIn ? (
              <Link 
                to={dashboardLink} 
                className="px-8 py-4 text-base font-bold rounded-full text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-8 py-4 text-base font-bold rounded-full text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  Sign In to Portal
                </Link>
                <a 
                  href="#how-it-works" 
                  className="px-8 py-4 text-base font-medium rounded-full text-white border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm transition-all duration-300"
                >
                  Learn More
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modern Feature Cards */}
      <div className="relative z-10 bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">Shariah Compliant</h3>
              <p className="text-slate-400 font-light leading-relaxed">Every transaction and agreement is strictly monitored to ensure 100% Shariah compliance and ethical safeguarding of funds.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">Enterprise Grade</h3>
              <p className="text-slate-400 font-light leading-relaxed">Built for organisations. Employers can seamlessly onboard their entire workforce and track monthly payroll deductions automatically.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v1m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-3">Transparent Awards</h3>
              <p className="text-slate-400 font-light leading-relaxed">Our cryptographic award engine fairly selects eligible employees for the fully-funded Hajj draw, verified by immutable audit logs.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
