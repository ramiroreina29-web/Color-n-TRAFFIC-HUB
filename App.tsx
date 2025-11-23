import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Catalog from './pages/Catalog';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import CookiesPolicy from './pages/legal/CookiesPolicy';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Gallery from './pages/admin/Gallery';
import Settings from './pages/admin/Settings';
import NotFound from './pages/NotFound';
import { CookieConsent } from './components/CookieConsent';
import { ThemeProvider } from './contexts/ThemeContext';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/catalog" element={<Catalog />} />
          
          {/* Legal Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/admin/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;