import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Views
import HomeView from './views/HomeView';
import PerrosView from './views/PerrosView';
import GatosView from './views/GatosView';
import ProductDetailView from './views/ProductDetailView';
import NosotrosView from './views/NosotrosView';
import ContactoView from './views/ContactoView';
import LoginView from './views/LoginView';
import CustomerDashboardView from './views/CustomerDashboardView';
import AdminDashboardView from './views/AdminDashboardView';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import AuthModal from './components/AuthModal';
import Preloader from './components/Preloader';
import BottomNavBar from './components/BottomNavBar';
import PWAInstallBanner from './components/PWAInstallBanner';

// Helper component to scroll to top on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();

  // User Authentication State (persisted in localStorage)
  // By default, if no active PWA session exists, user is null so the login screen is the FIRST screen seen
  const [user, setUser] = useState(() => {
    const savedSession = localStorage.getItem('patitas_pwa_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'cliente')) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored session', e);
      }
    }
    return null;
  });

  // Cart State (persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('patitas_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing stored cart', e);
      }
    }
    return [];
  });

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('patitas_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Auth Handlers
  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    localStorage.setItem('patitas_pwa_session', JSON.stringify(userObj));
    localStorage.setItem('patitas_user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('patitas_pwa_session');
    localStorage.removeItem('patitas_user');
  };

  const handleSwitchRole = (newRole) => {
    setUser((prev) => {
      const updated = prev
        ? { ...prev, role: newRole }
        : {
            name: newRole === 'admin' ? 'Camila Silva' : 'Felipe Soto',
            email: newRole === 'admin' ? 'camila@patitasdelsur.cl' : 'felipe@tutor.cl',
            role: newRole,
            petName: newRole === 'admin' ? 'Kira 🐶' : 'Jack 🐱',
            petType: newRole === 'admin' ? 'perro' : 'gato',
            memberSince: 'Octubre 2026',
          };
      localStorage.setItem('patitas_pwa_session', JSON.stringify(updated));
      localStorage.setItem('patitas_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Cart Handlers
  const handleAddToCart = (product, weight, quantity = 1) => {
    if (!product) return;

    const selectedWeight =
      weight ||
      product.selectedWeight ||
      (product.weights && product.weights[0]) ||
      'Formato Estándar';

    const qtyToAdd = typeof quantity === 'number' && quantity > 0 ? quantity : 1;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.id === product.id && (item.weight === selectedWeight || item.selectedWeight === selectedWeight)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            ...product,
            weight: selectedWeight,
            selectedWeight: selectedWeight,
            quantity: qtyToAdd,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((_, idx) => idx !== index);
      }
      return prevItems.map((item, idx) =>
        idx === index ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleRemoveItem = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, idx) => idx !== index));
  };

  // Product Modal Quick View
  const handleSelectProduct = (product) => {
    setSelectedProductModal(product);
  };

  const handleCloseProductModal = () => {
    setSelectedProductModal(null);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const isLoginPage = !user || location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-[#0E8388] selection:text-white">
      <Preloader />
      <ScrollToTop />

      {/* Global Navigation Bar - Hidden on Login screen to provide an immersive PWA entry */}
      {!isLoginPage && (
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {/* Main Content & Routing */}
      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin' : '/mi-cuenta'} replace />
              ) : (
                <LoginView onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <HomeView />
              )
            }
          />
          <Route
            path="/perros"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <PerrosView
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                />
              )
            }
          />
          <Route
            path="/gatos"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <GatosView
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                />
              )
            }
          />
          <Route
            path="/producto/:id"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <ProductDetailView
                  onAddToCart={handleAddToCart}
                  onSelectProduct={handleSelectProduct}
                />
              )
            }
          />
          <Route
            path="/nosotros"
            element={!user ? <Navigate to="/login" replace /> : <NosotrosView />}
          />
          <Route
            path="/contacto"
            element={!user ? <Navigate to="/login" replace /> : <ContactoView />}
          />
          <Route
            path="/mi-cuenta"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <CustomerDashboardView
                  user={user}
                  onLogout={handleLogout}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={handleSelectProduct}
                  onSwitchRole={handleSwitchRole}
                />
              )
            }
          />
          <Route
            path="/admin"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <AdminDashboardView
                  user={user}
                  onSwitchRole={handleSwitchRole}
                  onLogout={handleLogout}
                />
              )
            }
          />
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </main>

      {/* Global Footer - Hidden on Login and Admin dashboards */}
      {!isLoginPage && location.pathname !== '/admin' && <Footer />}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        user={user}
        onClearCart={() => setCartItems([])}
      />

      {/* Quick View Product Modal */}
      {selectedProductModal && (
        <ProductModal
          product={selectedProductModal}
          onClose={handleCloseProductModal}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Mobile Bottom Navigation Bar - Hidden on Login and Admin */}
      {!isLoginPage && location.pathname !== '/admin' && (
        <BottomNavBar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Progressive Web App Install Banner (iOS & Android) */}
      {!isLoginPage && <PWAInstallBanner />}
    </div>
  );
}
