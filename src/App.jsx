import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import SEOHead from './components/SEOHead';

// Core Views for instant first paint
import HomeView from './views/HomeView';
import PerrosView from './views/PerrosView';
import GatosView from './views/GatosView';

// Code-split Views loaded on demand (dramatically reduces initial JS bundle)
const ProductDetailView = lazy(() => import('./views/ProductDetailView'));
const NosotrosView = lazy(() => import('./views/NosotrosView'));
const LoginView = lazy(() => import('./views/LoginView'));
const CustomerDashboardView = lazy(() => import('./views/CustomerDashboardView'));
const AdminDashboardView = lazy(() => import('./views/AdminDashboardView'));
const LegalView = lazy(() => import('./views/LegalView'));
const DigitalCatalogView = lazy(() => import('./views/DigitalCatalogView'));

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import AuthModal from './components/AuthModal';
import Preloader from './components/Preloader';
import BottomNavBar from './components/BottomNavBar';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import RouteLoadingFallback from './components/RouteLoadingFallback';

import { supabase } from './lib/supabase';
import { getCustomerProfile } from './services/customersService';

// Helper component to scroll to top on route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Error Boundary para evitar pantallas en blanco ante fallos de red o carga diferida (lazy)
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RouteErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAF9F6]">
          <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF5F3] text-[#0E8388] mx-auto flex items-center justify-center font-black text-lg">
              !
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Recargando vista actualizada
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Se detectó una actualización reciente en los módulos de la aplicación. Pulsa el botón para recargar la vista.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 px-5 rounded-full bg-[#0E8388] hover:bg-[#0c7276] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Recargar ahora
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Limpieza inicial para arrancar el sistema en 0 (sin datos residuales de demo)
if (typeof window !== 'undefined' && !localStorage.getItem('patitas_system_zero_v1')) {
  localStorage.removeItem('patitas_orders');
  localStorage.removeItem('patitas_inventory');
  localStorage.removeItem('patitas_expenses');
  localStorage.removeItem('patitas_vehicles');
  localStorage.removeItem('patitas_invoices');
  localStorage.removeItem('patitas_convenios');
  localStorage.removeItem('patitas_paused_products');
  localStorage.removeItem('patitas_deleted_products');
  localStorage.removeItem('patitas_cart');
  localStorage.removeItem('patitas_saved_cart');
  localStorage.setItem('patitas_system_zero_v1', 'true');
}

// Limpieza para garantizar que Supabase sea la única fuente de verdad sin bloqueos locales
if (typeof window !== 'undefined' && !localStorage.getItem('patitas_clean_visibility_v2')) {
  localStorage.removeItem('patitas_paused_products');
  localStorage.removeItem('patitas_deleted_products');
  localStorage.setItem('patitas_clean_visibility_v2', 'true');
}

export default function App() {
  const location = useLocation();

  // User Authentication State (persisted in localStorage + synchronized with Supabase Auth)
  const [user, setUser] = useState(() => {
    const savedSession = localStorage.getItem('patitas_user') || localStorage.getItem('patitas_pwa_session');
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

  // Modals & Drawers State (abrir automáticamente si el cliente regresa desde Mercado Pago)
  const [isCartOpen, setIsCartOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      return (
        params.has('mp_return') ||
        ((params.has('status') || params.has('collection_status')) &&
          (params.has('external_reference') || params.has('order_id') || params.has('payment_id')))
      );
    }
    return false;
  });
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Atribución ligera de origen (Catálogo Digital / Instagram / WhatsApp WebViews)
  const [orderSourceLabel, setOrderSourceLabel] = useState(() => {
    try {
      return sessionStorage.getItem('patitas_order_source') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(location.search || '');
    const explicitSrc = (params.get('src') || params.get('utm_source') || '').toLowerCase().trim();
    const ua = navigator.userAgent || '';
    const ref = (document.referrer || '').toLowerCase();

    const isInstagram =
      explicitSrc.includes('ig') ||
      explicitSrc.includes('instagram') ||
      /instagram/i.test(ua) ||
      ref.includes('instagram.com') ||
      ref.includes('l.instagram.com');
    const isWhatsApp =
      explicitSrc.includes('wa') ||
      explicitSrc.includes('whatsapp') ||
      /whatsapp/i.test(ua) ||
      ref.includes('whatsapp.com');

    let detected = '';
    if (location.pathname === '/catalogo') {
      if (isInstagram) detected = 'Catálogo Digital (Instagram)';
      else if (isWhatsApp) detected = 'Catálogo Digital (WhatsApp)';
      else detected = 'Catálogo Digital';
    } else if (isInstagram) {
      detected = 'Instagram';
    } else if (isWhatsApp) {
      detected = 'WhatsApp';
    }

    if (detected) {
      setOrderSourceLabel(detected);
      try {
        sessionStorage.setItem('patitas_order_source', detected);
      } catch {
        // ignore storage errors in private WebViews
      }
    }
  }, [location.pathname, location.search]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('patitas_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Synchronize real Supabase Auth session on mount and state changes
  useEffect(() => {
    const clearStaleSupabaseTokens = () => {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Error clearing stale Supabase token:', e);
      }
    };

    const isStandalonePWA = () => {
      if (typeof window === 'undefined') return false;
      return (
        Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator?.standalone === true
      );
    };

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          clearStaleSupabaseTokens();
          localStorage.removeItem('patitas_user');
          localStorage.removeItem('patitas_pwa_session');
          setUser(null);
          if (sessionError) {
            await supabase.auth.signOut({ scope: 'local' }).catch(() => { });
          }
          return;
        }
        if (session?.user) {
          const profile = (await getCustomerProfile(session.user.id)) || (await getCustomerProfile(session.user.email));
          if (profile) {
            const verifiedRole = profile.role === 'admin' ? 'admin' : 'cliente';

            // Si está ejecutándose como PWA instalada, solo permitir usuarios con rol 'admin'
            if (isStandalonePWA() && verifiedRole !== 'admin') {
              await supabase.auth.signOut().catch(() => { });
              localStorage.removeItem('patitas_user');
              localStorage.removeItem('patitas_pwa_session');
              setUser(null);
              return;
            }

            const userObj = {
              id: profile.id,
              auth_user_id: session.user.id,
              name: profile.full_name || session.user.user_metadata?.full_name || 'Tutor Patitas',
              email: profile.email || session.user.email,
              role: verifiedRole,
              petName: session.user.user_metadata?.pet_name || null,
              petType: session.user.user_metadata?.pet_type || null,
              city: profile.city || '',
              address: profile.address || '',
              phone: profile.phone || '',
              points: profile.points || 0,
              created_at: profile.created_at || session.user.created_at || new Date().toISOString(),
              memberSince: profile.created_at
                ? new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at))
                : 'Octubre 2026',
            };
            setUser(userObj);
            localStorage.setItem('patitas_user', JSON.stringify(userObj));
            localStorage.setItem('patitas_pwa_session', JSON.stringify(userObj));
          } else {
            localStorage.removeItem('patitas_user');
            localStorage.removeItem('patitas_pwa_session');
            setUser(null);
          }
        }
      } catch (err) {
        clearStaleSupabaseTokens();
        console.error('Error synchronizing auth session:', err);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const profile = (await getCustomerProfile(session.user.id)) || (await getCustomerProfile(session.user.email));
        if (profile) {
          const verifiedRole = profile.role === 'admin' ? 'admin' : 'cliente';
          if (isStandalonePWA() && verifiedRole !== 'admin') {
            await supabase.auth.signOut().catch(() => { });
            localStorage.removeItem('patitas_user');
            localStorage.removeItem('patitas_pwa_session');
            setUser(null);
            return;
          }
          const userObj = {
            id: profile.id,
            auth_user_id: session.user.id,
            name: profile.full_name || session.user.user_metadata?.full_name || 'Tutor Patitas',
            email: profile.email || session.user.email,
            role: verifiedRole,
            petName: session.user.user_metadata?.pet_name || null,
            petType: session.user.user_metadata?.pet_type || null,
            city: profile.city || '',
            address: profile.address || '',
            phone: profile.phone || '',
            points: profile.points || 0,
            memberSince: profile.created_at
              ? new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at))
              : 'Octubre 2026',
          };
          setUser(userObj);
          localStorage.setItem('patitas_user', JSON.stringify(userObj));
          localStorage.setItem('patitas_pwa_session', JSON.stringify(userObj));
        }
      } else if (event === 'SIGNED_OUT') {
        clearStaleSupabaseTokens();
        localStorage.removeItem('patitas_pwa_session');
        localStorage.removeItem('patitas_user');
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Listen for global open cart requests (e.g. from Despensa Habitual) and Mercado Pago return URLs
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('patitas_open_cart', handleOpenCart);

    // Detectar retorno desde el checkout de Mercado Pago (success_url, failure_url, pending_url)
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const hasMpReturn =
        params.has('mp_return') ||
        ((params.has('status') || params.has('collection_status')) &&
          (params.has('external_reference') || params.has('order_id') || params.has('payment_id')));
      if (hasMpReturn) {
        setIsCartOpen(true);
      }
    }

    return () => window.removeEventListener('patitas_open_cart', handleOpenCart);
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    localStorage.setItem('patitas_pwa_session', JSON.stringify(userObj));
    localStorage.setItem('patitas_user', JSON.stringify(userObj));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error during signOut:', e);
    }
    setUser(null);
    localStorage.removeItem('patitas_pwa_session');
    localStorage.removeItem('patitas_user');
  };

  const handleSwitchRole = (newRoleOrUser) => {
    setUser((prev) => {
      if (newRoleOrUser && typeof newRoleOrUser === 'object') {
        const updatedUser = { ...(prev || {}), ...newRoleOrUser };
        localStorage.setItem('patitas_pwa_session', JSON.stringify(updatedUser));
        localStorage.setItem('patitas_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      if (!prev) return null;
      const updated = { ...prev, role: newRoleOrUser };
      localStorage.setItem('patitas_pwa_session', JSON.stringify(updated));
      localStorage.setItem('patitas_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Cart Handlers
  const handleAddToCart = (product, weight, quantity = 1, options = { openDrawer: true }) => {
    if (!product) return;

    const selectedWeight =
      weight ||
      product.selectedWeight ||
      (product.weights && product.weights[0]) ||
      'Formato Estándar';

    // Validación defensiva de stock: Priorizar stock específico de la variante sobre el total del grupo
    const variants = product?.variants || [];
    const activeVariant = variants.find((v) => v.format === selectedWeight || v.weight === selectedWeight) || (variants.length > 0 ? variants[0] : null);
    const availableStock = activeVariant && typeof activeVariant.stock === 'number'
      ? activeVariant.stock
      : (typeof product.stock === 'number' ? product.stock : 10);

    if (availableStock <= 0 || product.isOutOfStock || product.isPaused || activeVariant?.isPaused) {
      return;
    }

    const qtyToAdd = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    const resolvedVariantId = activeVariant?.id || product.productId || product.id;
    const resolvedPrice = activeVariant?.price ?? product.price ?? 0;
    const resolvedUnitCostNeto = activeVariant?.unitCostNeto ?? product.unitCostNeto ?? 0;
    const resolvedShippingUnitCost = activeVariant?.shippingUnitCost ?? product.shippingUnitCost ?? 0;
    const resolvedSku = activeVariant?.sku || product.sku || '';

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          (item.id === resolvedVariantId || item.productId === resolvedVariantId) &&
          (item.weight === selectedWeight || item.selectedWeight === selectedWeight)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity;
        const newQty = Math.min(availableStock, currentQty + qtyToAdd);
        updated[existingIndex] = {
          ...updated[existingIndex],
          id: resolvedVariantId,
          productId: resolvedVariantId,
          price: resolvedPrice,
          unitCostNeto: resolvedUnitCostNeto,
          shippingUnitCost: resolvedShippingUnitCost,
          sku: resolvedSku,
          quantity: newQty,
          stock: availableStock,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            ...product,
            id: resolvedVariantId,
            productId: resolvedVariantId,
            sku: resolvedSku,
            price: resolvedPrice,
            unitCostNeto: resolvedUnitCostNeto,
            shippingUnitCost: resolvedShippingUnitCost,
            format: selectedWeight,
            weight: selectedWeight,
            selectedWeight: selectedWeight,
            quantity: Math.min(availableStock, qtyToAdd),
            stock: availableStock,
          },
        ];
      }
    });

    if (options?.openDrawer !== false) {
      setIsCartOpen(true);
    }
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((_, idx) => idx !== index);
      }
      return prevItems.map((item, idx) => {
        if (idx !== index) return item;
        const maxStock = typeof item.stock === 'number' ? Math.max(1, item.stock) : 99;
        return {
          ...item,
          quantity: Math.min(maxStock, newQuantity),
        };
      });
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
  const isLoginPage = location.pathname === '/login';
  const isKiboryHome = location.pathname === '/';
  const isDigitalCatalog = location.pathname === '/catalogo';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-[#F5BA13] selection:text-[#1D1D1F]">
      {!isDigitalCatalog && <Preloader />}
      <ScrollToTop />

      {/* Global Navigation Bar - Hidden on Login screen, Kibory Home, and Digital Catalog Express */}
      {!isLoginPage && !isKiboryHome && !isDigitalCatalog && (
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
        <RouteErrorBoundary key={location.pathname}>
          <Suspense fallback={<RouteLoadingFallback />}>
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
                  <HomeView
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={handleAddToCart}
                    cartCount={totalCartCount}
                    onOpenCart={() => setIsCartOpen(true)}
                    user={user}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  />
                }
              />
              <Route
                path="/catalogo"
                element={
                  <DigitalCatalogView
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onOpenCart={() => setIsCartOpen(true)}
                    onSelectProduct={handleSelectProduct}
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
                    cartItems={cartItems}
                  />
                }
              />
              <Route path="/nosotros" element={<NosotrosView />} />
              <Route path="/contacto" element={<Navigate to="/" replace />} />
              <Route path="/legal" element={<Navigate to="/terminos-y-condiciones" replace />} />
              <Route path="/terminos-y-condiciones" element={<LegalView />} />
              <Route path="/politicas-de-privacidad" element={<LegalView />} />
              <Route path="/politicas-de-despacho" element={<LegalView />} />
              <Route path="/cambios-y-devoluciones" element={<LegalView />} />
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
                  user && user.role !== 'admin' ? (
                    <Navigate to="/mi-cuenta" replace />
                  ) : (
                    <AdminDashboardView
                      user={user}
                      onSwitchRole={handleSwitchRole}
                      onLogout={handleLogout}
                    />
                  )
                }
              />
              <Route
                path="*"
                element={
                  <div className="pt-36 pb-24 max-w-3xl mx-auto px-6 text-center space-y-5">
                    <SEOHead
                      title="Página no encontrada (404)"
                      description="La página que buscas no existe o fue trasladada en Patitas del Sur."
                      noindex={true}
                    />
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-900 text-xs font-black uppercase tracking-wider">
                      Error 404 · Ruta no encontrada
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      No encontramos la página que buscabas 🐾
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                      Es posible que el enlace haya cambiado o que la dirección tenga un error. Explora nuestro catálogo de alimentos naturales con despacho a domicilio:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Link
                        to="/"
                        className="px-6 py-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] text-xs sm:text-sm font-bold transition-all shadow-md"
                      >
                        Ir al Inicio
                      </Link>
                      <Link
                        to="/perros"
                        className="px-6 py-3 rounded-full bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] text-xs sm:text-sm font-black transition-all shadow-md"
                      >
                        Catálogo Perros
                      </Link>
                      <Link
                        to="/gatos"
                        className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold transition-all shadow-xs"
                      >
                        Catálogo Gatos
                      </Link>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </main>

      {/* Global Footer - Hidden on Login, Admin dashboards, Kibory Home, and Digital Catalog Express */}
      {!isLoginPage && !isKiboryHome && !isDigitalCatalog && location.pathname !== '/admin' && <Footer />}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        user={user}
        onClearCart={() => setCartItems([])}
        onAddToCart={handleAddToCart}
        orderSourceLabel={orderSourceLabel}
      />

      {/* Quick View Product Modal */}
      {selectedProductModal && (
        <ProductModal
          product={selectedProductModal}
          onClose={handleCloseProductModal}
          onAddToCart={(prod, weight, qty) =>
            handleAddToCart(prod, weight, qty, { openDrawer: !isDigitalCatalog })
          }
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Mobile Bottom Navigation Bar - Hidden on Login, Admin, and Digital Catalog Express */}
      {!isLoginPage && !isDigitalCatalog && location.pathname !== '/admin' && (
        <BottomNavBar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Botón Flotante Oficial de WhatsApp */}
      <FloatingWhatsAppButton
        phoneNumber="56953332492"
        hidden={isDigitalCatalog || isCartOpen || Boolean(selectedProductModal) || isAuthModalOpen}
      />
    </div>
  );
}
