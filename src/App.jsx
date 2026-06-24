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
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Community from './pages/Community';
import CommunityPost from './pages/CommunityPost';
import CommunityDetail from './pages/CommunityDetail';

// Components
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import AIAssist from './components/AIAssist';

// ProtectedRoute — must be inside AuthProvider tree
function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, role, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    if (!role) return children;
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
        {/* Public — no auth needed */}
        <Route path="/" element={!currentUser ? <Landing /> : <Navigate to={role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor/dashboard' : '/vendors'} replace />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor/dashboard' : '/vendors'} replace />} />
        <Route path="/signup/corps" element={!currentUser ? <SignupCorps /> : <Navigate to="/vendors" replace />} />
        <Route path="/signup/vendor" element={!currentUser ? <SignupVendor /> : <Navigate to="/vendor/dashboard" replace />} />
        <Route path="/vendors" element={<Home />} />
        <Route path="/vendors/:id" element={<VendorProfile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/new" element={<CommunityPost />} />
        <Route path="/community/:postId" element={<CommunityDetail />} />

        {/* Corps Member (logged-in) */}
        <Route path="/home" element={<Navigate to="/vendors" replace />} />
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
      {!currentUser ? <PublicNavbar /> : <Navbar />}
      <AIAssist />
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

