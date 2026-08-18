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

// Helper component to scroll to top on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  // User Authentication State (persisted in localStorage)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('patitas_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    // Default demo user for instant testing
    return {
      name: 'Camila Silva',
      email: 'camila@patitasdelsur.cl',
      petName: 'Kira 🐶',
      petType: 'perro',
      memberSince: 'Agosto 2026',
    };
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
    localStorage.setItem('patitas_user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('patitas_user');
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-[#0E8388] selection:text-white">
      <ScrollToTop />

      {/* Global Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content & Routing */}
      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                onSelectProduct={handleSelectProduct}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/perros"
            element={
              <PerrosView
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route
            path="/gatos"
            element={
              <GatosView
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route
            path="/producto/:id"
            element={
              <ProductDetailView
                onAddToCart={handleAddToCart}
                onSelectProduct={handleSelectProduct}
              />
            }
          />
          <Route path="/nosotros" element={<NosotrosView />} />
          <Route path="/contacto" element={<ContactoView />} />
          <Route
            path="/login"
            element={<LoginView onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/mi-cuenta"
            element={
              <CustomerDashboardView
                user={user}
                onLogout={handleLogout}
                onAddToCart={handleAddToCart}
                onSelectProduct={handleSelectProduct}
              />
            }
          />
          <Route path="/admin" element={<AdminDashboardView user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
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
    </div>
  );
}
