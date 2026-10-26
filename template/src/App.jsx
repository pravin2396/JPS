import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicOnlyRoute from './components/routes/PublicOnlyRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import Profile from './pages/common/Profile';
import Unauthorized from './pages/common/Unauthorized';
import NotFound from './pages/common/NotFound';

// Protected App Layout with Sidebar Navigation (Edge-to-Edge)
const AppDashboardLayout = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Pages (Glassmorphic Design in Login Theme) */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Dashboard Module Routes (Edge-to-Edge Sidebar Layout) */}
        <Route
          element={
            <ProtectedRoute>
              <AppDashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Candidate Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/saved"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/post-job"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/manage-jobs"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/applicants"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Profile Route */}
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Utility Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
