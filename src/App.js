import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';
import Search from './pages/Search';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import EditProduct from './pages/EditProduct';

const Spinner = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
    <div className="spinner" style={{width:36,height:36,borderWidth:3}} />
  </div>
);

function Guard({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/home" replace />;
  return children;
}

function PubGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/home" replace /> : children;
}

function Layout({ children }) {
  return <>
    <Navbar />
    <main style={{ paddingTop: 68, minHeight: 'calc(100vh - 68px)' }}>{children}</main>
  </>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PubGuard><Landing /></PubGuard>} />
      <Route path="/login" element={<PubGuard><Login /></PubGuard>} />
      <Route path="/register" element={<PubGuard><Register /></PubGuard>} />
      <Route path="/home" element={<Guard><Layout><Home /></Layout></Guard>} />
      <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />
      <Route path="/create-listing" element={<Guard><Layout><CreateProduct /></Layout></Guard>} />
      <Route path="/messages" element={<Guard><Layout><Messages /></Layout></Guard>} />
      <Route path="/notifications" element={<Guard><Layout><Notifications /></Layout></Guard>} />
      <Route path="/profile/:id?" element={<Guard><Layout><Profile /></Layout></Guard>} />
      <Route path="/orders" element={<Guard><Layout><Orders /></Layout></Guard>} />
      <Route path="/edit-product/:id" element={<Guard><Layout><EditProduct /></Layout></Guard>} />
      <Route path="/admin" element={<Guard admin><Layout><Admin /></Layout></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#0f1b2d', color: '#f0f6ff', border: '1px solid #1a2d45', borderRadius: 14, fontFamily: 'Satoshi, sans-serif', fontSize: 14 },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
