import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { MainDashboard } from './pages/MainDashboard';
import { Settings } from './pages/Settings';
import { Profit } from './pages/Profit';
import { Asset } from './pages/Asset';
import ROI from './pages/ROI';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

// Helper to redirect logged-in users away from auth pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  if (isAuthenticated && user?.nickname) {
    return <Navigate to="/main" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/signup" element={<SignUp />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/main" element={<MainDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profit" element={<Profit />} />
            <Route path="/asset" element={<Asset />} />
            <Route path="/roi" element={<ROI />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
