import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ConfirmEmail from './pages/ConfirmEmail';
import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import GymPortal from './pages/GymPortal';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const location = useLocation();
  const init = useAuthStore((state) => state.init);
  const user = useAuthStore((state) => state.getUser());
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    init();
  }, [init]);

  // Show nothing while restoring session to avoid flash-redirect to login
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full"
          style={{ border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
        />
      </div>
    );
  }

  const showBottomNav = !!user;

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-surface text-white">
      <Navbar />
      {/* No AnimatePresence — avoids stacking old/new page during exit animation.
          Each key change unmounts old immediately; new page fades+slides in. */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="py-5"
        style={{ paddingBottom: showBottomNav ? 'calc(5rem + env(safe-area-inset-bottom))' : undefined }}
      >
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/progress" element={user ? <Progress /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/gym-portal" element={<GymPortal />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.main>
      {showBottomNav && <BottomNav />}
    </div>
    </ErrorBoundary>
  );
}

export default App;
