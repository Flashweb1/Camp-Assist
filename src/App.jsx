import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignupCorps from './pages/SignupCorps';
import SignupVendor from './pages/SignupVendor';
import Home from './pages/Home';
import VendorProfile from './pages/VendorProfile';
import PlaceOrder from './pages/PlaceOrder';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import CorpsProfile from './pages/CorpsProfile';
import CorpsProfileEdit from './pages/CorpsProfileEdit';
import VendorDashboard from './pages/VendorDashboard';
import VendorOrders from './pages/VendorOrders';
import VendorProfileEdit from './pages/VendorProfileEdit';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';

// ProtectedRoute — must be inside AuthProvider tree
function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, role, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}

// AppRoutes — inside AuthProvider so useAuth() works
function AppRoutes() {
  const { currentUser, role } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={!currentUser ? <Landing /> : <Navigate to={role === 'vendor' ? '/vendor/dashboard' : '/home'} replace />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={role === 'vendor' ? '/vendor/dashboard' : '/home'} replace />} />
        <Route path="/signup/corps" element={!currentUser ? <SignupCorps /> : <Navigate to="/home" replace />} />
        <Route path="/signup/vendor" element={!currentUser ? <SignupVendor /> : <Navigate to="/vendor/dashboard" replace />} />

        {/* Corps Member */}
        <Route path="/home" element={<ProtectedRoute allowedRole="corps_member"><Home /></ProtectedRoute>} />
        <Route path="/vendor/:id" element={<ProtectedRoute allowedRole="corps_member"><VendorProfile /></ProtectedRoute>} />
        <Route path="/order/new/:vendorId" element={<ProtectedRoute allowedRole="corps_member"><PlaceOrder /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRole="corps_member"><MyOrders /></ProtectedRoute>} />
        <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRole="corps_member"><CorpsProfile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute allowedRole="corps_member"><CorpsProfileEdit /></ProtectedRoute>} />

        {/* Vendor */}
        <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRole="vendor"><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/orders" element={<ProtectedRoute allowedRole="vendor"><VendorOrders /></ProtectedRoute>} />
        <Route path="/vendor/profile/edit" element={<ProtectedRoute allowedRole="vendor"><VendorProfileEdit /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {currentUser && <Navbar />}
    </>
  );
}

// AuthProvider wraps AppRoutes so all children can call useAuth()
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

