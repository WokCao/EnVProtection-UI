import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import ForgotPassword from './pages/ForgotPassword';
import Organizations from './pages/Organizations';
import OrganizationDetails from './pages/OrganizationDetails';
import OrganizationProjects from './pages/OrganizationProjects';
import Notifications from './pages/Notifications';
import OrganizationVolunteers from './pages/OrganizationVolunteers';
import { useEffect, useRef, useState } from 'react';
// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading, reloadUser, error } = useAuthStore();
  const [isReloadingSuccessful, setIsReloadingSuccessful] = useState(false);
  const hasReloaded = useRef(false);

  useEffect(() => {
    if (!user && !hasReloaded.current) {
      reloadUser(setIsReloadingSuccessful);
      hasReloaded.current = true;
    }
  }, [user]);

  if (isLoading || (!user && !isAuthenticated && !isReloadingSuccessful)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || error) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Organization-only route component
const OrganizationRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ORGANIZATION') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <OrganizationRoute>
                  <CreateProject />
                </OrganizationRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/organizations"
              element={
                <ProtectedRoute>
                  <Organizations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/organizations/:id"
              element={
                <ProtectedRoute>
                  <OrganizationDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/organizations/:id/projects"
              element={
                <ProtectedRoute>
                  <OrganizationProjects />
                </ProtectedRoute>
              }
            />

            <Route
              path="/organizations/:id/volunteers"
              element={
                <ProtectedRoute>
                  <OrganizationVolunteers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
