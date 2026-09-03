import re

with open('src/pages/Home.jsx', 'r') as f:
    code = f.read()

# Add useNavigate import
code = code.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link, useNavigate } from 'react-router-dom';"
)

# Modify LandingPage component
old_comp = """export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const [dashboardLink, setDashboardLink] = useState('/dashboard');

  useEffect(() => {
    if (isLoaded && user) {
      setDashboardLink('/dashboard');
    }
  }, [isLoaded, user]);"""

new_comp = """export default function LandingPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [dashboardLink, setDashboardLink] = useState('/dashboard');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);"""

code = code.replace(old_comp, new_comp)

with open('src/pages/Home.jsx', 'w') as f:
    f.write(code)
