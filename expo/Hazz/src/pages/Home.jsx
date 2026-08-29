import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 text-slate-800">
      
      {/* Hero Section */}
      <div className="flex-grow flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
           <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
           <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
            Secure Your Journey with the <span className="text-emerald-600 block mt-2">Hajj Savings Fund</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A dedicated platform empowering organisations and their employees to manage contributions, agreements, and awards securely and transparently.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link 
                to={`/${user?.role}`} 
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            )}
            <a 
              href="#features" 
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-emerald-200 text-lg font-bold rounded-lg text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition shadow-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Feature Highlight Section */}
      <div id="features" className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Organisation Onboarding</h3>
              <p className="text-slate-600">Digitise onboarding for employers and seamlessly track annual fees and agreements.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Employee Management</h3>
              <p className="text-slate-600">Empower employees to track monthly contributions, view payments, and download statements.</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Secure & Compliant</h3>
              <p className="text-slate-600">Built with role-based access, GDPR compliance, and full audit trails to ensure complete transparency.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
