import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Search,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  Ticket,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  CreditCard,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Globe,
  Home,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { verifyCouponInSupabase, redeemCouponInSupabase } from '../services/conveniosService';
import {
  createOrderInSupabase,
  getNextOrderId,
  createMercadoPagoOrder,
  getMercadoPagoOrderById,
  updateOrderMercadoPagoData,
  adjustStockForItemsInSupabase,
} from '../services/ordersService';
import {
  updateCustomerPointsAndSpent,
  getCustomerByPhone,
  upsertCustomerProfile,
  saveCustomerReplenishmentData,
} from '../services/customersService';
import { fetchProductsFromSupabase } from '../services/productsService';
import { markCouponAsUsed, getLoyaltySettings } from '../services/loyaltyService';
import { supabase } from '../lib/supabase';
import GoogleAddressAutocomplete from './GoogleAddressAutocomplete';
import CountryCodeDropdown from './CountryCodeDropdown';
import {
  detectCommuneFromAddress,
  CENTRAL_HUB,
  TOWN_COORDINATES,
  calculateHaversineDistance,
} from '../services/googleMapsService';
import {
  getDispatchZonesFromSupabase,
  getUpcomingDeliveryDates,
  getLiveDispatchStatusFromSupabase,
  evaluateSmartDeliverySchedule,
  getChileNowParts,
} from '../services/dispatchService';
import { COMPANY_INFO } from '../constants';
import { formatCLP } from '../utils/formatters';
import CartScheduleStep from './cart/CartScheduleStep';
import CartSuccessStep from './cart/CartSuccessStep';

// Helper para resolver imágenes de productos en el carrito y recomendaciones
const resolveProductImage = (prod) => {
  if (prod?.image && typeof prod.image === 'string' && prod.image.trim() !== '') return prod.image;
  if (Array.isArray(prod?.images) && prod.images.length > 0 && typeof prod.images[0] === 'string' && prod.images[0].trim() !== '') {
    return prod.images[0];
  }
  const lower = (prod?.name || '').toLowerCase();
  if (lower.includes('pollo') || lower.includes('chicken')) return '/images/bravery_chicken.jpg';
  if (lower.includes('cordero') || lower.includes('lamb')) return '/images/bravery_lamb.jpg';
  if (lower.includes('salmón') || lower.includes('salmon') || lower.includes('bravery')) return '/images/bravery_salmon.jpg';
  if (lower.includes('trucha') || lower.includes('patagonia') || lower.includes('gato') || lower.includes('cat') || lower.includes('arena')) return '/images/cat_food_tuna.png';
  if (lower.includes('ciervo') || lower.includes('deshidratado') || lower.includes('alpha') || lower.includes('lata')) return '/images/dog_food_ingredients.png';
  if (lower.includes('nomade') || lower.includes('fit') || lower.includes('acana')) return '/images/dog_kibble_detail.png';
  return '/images/bravery_salmon.jpg';
};

const KNOWN_BRANDS = [
  'Alpha Spirit',
  'Acana',
  'Orijen',
  'Bravery',
  'Fit',
  'Nomade',
  'Stay Happy',
  'Dr. Pet',
  'Dr Pet',
  'Patagonia Holística',
  'Patagonia',
  'Sur Natural',
  'Austral Bio',
  'Chiloé Sea',
];

// Helper para extraer la marca y limpiar el nombre del producto en vistas compactas (Opción 1 Apple Eyebrow)
const extractBrandAndCleanName = (product) => {
  let brand = (product?.brand || '').trim();
  let cleanName = (product?.name || product?.foodName || '').trim();

  if (!brand) {
    const matchedBrand = KNOWN_BRANDS.find((b) =>
      cleanName.toLowerCase().startsWith(b.toLowerCase())
    );
    if (matchedBrand) {
      brand = matchedBrand;
    }
  }

  if (brand && cleanName.toLowerCase().startsWith(brand.toLowerCase())) {
    cleanName = cleanName.slice(brand.length).trim();
  }

  cleanName = cleanName.replace(/^[-–—:·\s]+/, '');

  return {
    brand: brand.toUpperCase(),
    cleanName: cleanName || product?.name || product?.foodName || '',
  };
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  user,
  onClearCart,
  onAddToCart,
  orderSourceLabel = '',
  fullScreen = false,
}) {
  const navigate = useNavigate();

  // Navigation step inside drawer: 'cart' | 'shipping' | 'schedule' | 'payment' | 'success'
  const [step, setStep] = useState('cart');
  const drawerScrollRef = useRef(null);
  const stepRef = useRef(step);
  const onCloseRef = useRef(onClose);
  const handleCloseAndFinishRef = useRef(null);
  const wasOpenRef = useRef(false);
  const closedByPopStateRef = useRef(false);

  stepRef.current = step;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (drawerScrollRef.current) {
      drawerScrollRef.current.scrollTop = 0;
    }
  }, [step]);

  // Bloquear scroll del fondo mientras el carrito está abierto (evita que se mueva el catálogo detrás)
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  // Sincronizar con History API para que el botón "Atrás" del celular retroceda de paso
  // o cierre el carrito sin sacar al usuario del catálogo hacia Instagram/WhatsApp
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen) {
      wasOpenRef.current = true;
      closedByPopStateRef.current = false;

      if (!window.history.state?.__patitasCartOverlay) {
        window.history.pushState(
          { ...(window.history.state || {}), __patitasCartOverlay: true },
          '',
          window.location.href
        );
      }

      const handlePopState = () => {
        const currentStep = stepRef.current;
        if (currentStep === 'payment') {
          setFormError(null);
          setStep('schedule');
          window.history.pushState(
            { ...(window.history.state || {}), __patitasCartOverlay: true },
            '',
            window.location.href
          );
          return;
        }
        if (currentStep === 'schedule') {
          setFormError(null);
          setStep('shipping');
          window.history.pushState(
            { ...(window.history.state || {}), __patitasCartOverlay: true },
            '',
            window.location.href
          );
          return;
        }
        if (currentStep === 'shipping') {
          setFormError(null);
          setStep('cart');
          window.history.pushState(
            { ...(window.history.state || {}), __patitasCartOverlay: true },
            '',
            window.location.href
          );
          return;
        }

        closedByPopStateRef.current = true;
        if (currentStep === 'success' && handleCloseAndFinishRef.current) {
          handleCloseAndFinishRef.current();
        } else if (onCloseRef.current) {
          onCloseRef.current();
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (!closedByPopStateRef.current && window.history.state?.__patitasCartOverlay) {
        window.history.back();
      }
      closedByPopStateRef.current = false;
    }
  }, [isOpen]);

  // Live stock sync for cart items
  const [liveStockMap, setLiveStockMap] = useState({});
  const [rawDbProducts, setRawDbProducts] = useState([]);

  // Catálogo y Venta Cruzada / Quick Add dentro del carrito
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [addedFeedbackId, setAddedFeedbackId] = useState(null);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // Zonas de despacho desde Supabase (store_settings)
  const [dispatchZones, setDispatchZones] = useState([]);
  const [customerCoords, setCustomerCoords] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadZones = async () => {
      try {
        const zones = await getDispatchZonesFromSupabase();
        if (isMounted && Array.isArray(zones) && zones.length > 0) {
          setDispatchZones(zones);
        }
      } catch (e) {
        console.warn('Error loading dispatch zones in CartDrawer:', e);
      }
    };

    loadZones();

    const handleZonesUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setDispatchZones(e.detail);
      } else {
        loadZones();
      }
    };

    window.addEventListener('patitas_dispatch_zones_updated', handleZonesUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_dispatch_zones_updated', handleZonesUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const syncCartStockAndCatalog = async () => {
      try {
        const prods = await fetchProductsFromSupabase();
        if (isMounted && Array.isArray(prods) && prods.length > 0) {
          setCatalogProducts(prods);
          setRawDbProducts(prods);

          const map = {};
          prods.forEach((p) => {
            const pStock = typeof p.stock === 'number' ? p.stock : 10;
            const isPaused = Boolean(p.isPaused ?? p.is_paused);
            const effStock = isPaused ? 0 : pStock;
            map[p.id] = effStock;
            if (p.name) {
              const clean = p.name.toLowerCase().trim();
              map[clean] = effStock;
              const noAcc = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              map[noAcc] = effStock;
            }
          });
          setLiveStockMap(map);
        }
      } catch (err) {
        console.warn('Error syncing cart stock and catalog in CartDrawer:', err);
      }
    };

    syncCartStockAndCatalog();

    const handleSync = () => syncCartStockAndCatalog();
    window.addEventListener('patitas_products_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('patitas_products_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [isOpen]);

  const getItemStock = useCallback((item) => {
    if (!item) return 10;
    // 1. Direct ID match
    if (item.id && liveStockMap[item.id] !== undefined) {
      return liveStockMap[item.id];
    }
    // 2. Direct name match (con o sin acentos)
    const cleanName = String(item.name || '').toLowerCase().trim();
    if (liveStockMap[cleanName] !== undefined) {
      return liveStockMap[cleanName];
    }
    const noAcc = cleanName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (liveStockMap[noAcc] !== undefined) {
      return liveStockMap[noAcc];
    }
    // 3. Name containment matching in rawDbProducts (e.g. "Acana Free Run Poultry (11,35 kg)" contains "Acana Free Run Poultry")
    if (rawDbProducts && rawDbProducts.length > 0) {
      const matchedByName = rawDbProducts.find((p) => {
        if (!p.name) return false;
        const pClean = p.name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return noAcc.includes(pClean) || pClean.includes(noAcc);
      });
      if (matchedByName) {
        return matchedByName.is_paused ? 0 : (typeof matchedByName.stock === 'number' ? matchedByName.stock : 10);
      }
    }
    // 4. Variant / flavor matching
    if (rawDbProducts && rawDbProducts.length > 0 && (item.weight || item.selectedWeight)) {
      const targetFormat = String(item.weight || item.selectedWeight || '').toLowerCase().trim();
      const formatNoAcc = targetFormat.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const matched = rawDbProducts.find((p) => {
        const pName = (p.name || '').toLowerCase();
        const pNoAcc = pName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return pNoAcc.includes(formatNoAcc) || formatNoAcc.includes(pNoAcc);
      });
      if (matched) {
        return matched.is_paused ? 0 : (typeof matched.stock === 'number' ? matched.stock : 10);
      }
    }
    return typeof item.stock === 'number' ? item.stock : 10;
  }, [liveStockMap, rawDbProducts]);

  // Auto-ajustar cantidades en el carrito al stock real disponible en bodega si excede
  useEffect(() => {
    if (Object.keys(liveStockMap).length === 0 || cartItems.length === 0) return;
    cartItems.forEach((item, idx) => {
      const avail = getItemStock(item);
      if (avail > 0 && item.quantity > avail) {
        onUpdateQuantity(idx, avail);
      }
    });
  }, [liveStockMap, cartItems, getItemStock, onUpdateQuantity]);

  const hasOutOfStockItems = useMemo(() => {
    return cartItems.some((item) => {
      const avail = getItemStock(item);
      return avail <= 0 || item.quantity > avail;
    });
  }, [cartItems, getItemStock]);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);

  // Shipping & Checkout form state (vacíos de forma predeterminada al comprar)
  const [recipientName, setRecipientName] = useState('');
  const [countryCode, setCountryCode] = useState('+56'); // Fijo por defecto Chile (+56)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(''); // Se detecta automáticamente desde la dirección
  const [address, setAddress] = useState('');

  // Formateador estricto para número telefónico en formato "x xxxx xxxx" (máx 9 dígitos)
  const formatChileanPhone = (val) => {
    if (!val) return '';
    let digits = String(val).replace(/\D/g, '');
    if (digits.startsWith('56') && digits.length > 9) {
      digits = digits.slice(2);
    }
    const limited = digits.slice(0, 9);
    if (limited.length <= 1) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 1)} ${limited.slice(1)}`;
    return `${limited.slice(0, 1)} ${limited.slice(1, 5)} ${limited.slice(5)}`;
  };

  const [depto, setDepto] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Estado para la búsqueda y autocompletado de cliente por teléfono
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [autofillCustomer, setAutofillCustomer] = useState(null);

  // Modo de dirección: 'habitual' (usa dirección guardada) vs 'temporary' (dirección para hoy)
  const [addressMode, setAddressMode] = useState('habitual');
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('default');
  const [saveNewAddressToProfile, setSaveNewAddressToProfile] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');

  const activeSavedAddress = useMemo(() => {
    return savedAddressesList.find((a) => a.id === selectedSavedAddressId) || savedAddressesList[0] || null;
  }, [savedAddressesList, selectedSavedAddressId]);

  const handleSelectSavedAddress = (addrId) => {
    setSelectedSavedAddressId(addrId);
    const target = savedAddressesList.find((a) => a.id === addrId);
    if (target) {
      setAddress(target.address || '');
      setCity(target.city || (target.address ? detectCommuneFromAddress(target.address) : '') || '');
      setDepto(target.depto || '');
      setDeliveryReference(target.deliveryReference || '');
      setCustomerCoords(target.lat && target.lng ? { lat: target.lat, lng: target.lng } : null);
      setAddressMode('habitual');
    }
  };

  const handleSwitchToTemporary = () => {
    setAddressMode('temporary');
    setAddress('');
    setCity('');
    setDepto('');
    setDeliveryReference('');
    setCustomerCoords(null);
    setSaveNewAddressToProfile(false);
    setNewAddressLabel('');
  };

  const handleSwitchToHabitual = () => {
    setAddressMode('habitual');
    const target = savedAddressesList.find((a) => a.id === selectedSavedAddressId) || savedAddressesList[0];
    if (target) {
      setAddress(target.address || '');
      setCity(target.city || (target.address ? detectCommuneFromAddress(target.address) : '') || '');
      setDepto(target.depto || '');
      setDeliveryReference(target.deliveryReference || '');
      setCustomerCoords(target.lat && target.lng ? { lat: target.lat, lng: target.lng } : null);
    }
  };

  const checkAndAutofillCustomer = async (cleanDigits) => {
    setIsSearchingCustomer(true);
    try {
      const found = await getCustomerByPhone(cleanDigits);

      // Buscar también si hay datos en perfil local del cliente
      let localProfile = null;
      try {
        const raw =
          localStorage.getItem('patitas_customer_profile') ||
          localStorage.getItem('patitas_pwa_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          const pDigits = String(parsed.phone || '').replace(/\D/g, '');
          if (!cleanDigits || pDigits.endsWith(cleanDigits) || cleanDigits.endsWith(pDigits)) {
            localProfile = parsed;
          }
        }
      } catch (err) {
        console.warn('Error reading local profile in CartDrawer:', err);
      }

      const customer = {
        ...(localProfile || {}),
        ...(found || {}),
      };

      if (found || localProfile) {
        setAutofillCustomer(customer);
        const nameVal = customer.full_name || customer.name || '';
        if (nameVal) setRecipientName(nameVal);

        // Cargar libreta de direcciones guardadas
        let addresses = Array.isArray(customer.saved_addresses) && customer.saved_addresses.length > 0
          ? customer.saved_addresses
          : (customer.address ? [{
              id: 'default',
              label: 'Dirección guardada',
              address: customer.address,
              depto: customer.depto || customer.dept || '',
              city: customer.city || detectCommuneFromAddress(customer.address) || 'Puerto Varas',
              deliveryReference: customer.delivery_reference || customer.deliveryReference || customer.notes || '',
              isDefault: true,
            }] : []);

        setSavedAddressesList(addresses);

        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          setSelectedSavedAddressId(defaultAddr.id);
          setAddress(defaultAddr.address || '');
          setCity(defaultAddr.city || (defaultAddr.address ? detectCommuneFromAddress(defaultAddr.address) : '') || '');
          setDepto(defaultAddr.depto || '');
          setDeliveryReference(defaultAddr.deliveryReference || '');
          setAddressMode('habitual');
        } else {
          setAddressMode('temporary');
          const addrVal = customer.address || '';
          if (addrVal) setAddress(addrVal);
          const cityVal = customer.city || (addrVal ? detectCommuneFromAddress(addrVal) : '');
          if (cityVal) setCity(cityVal);
          const deptoVal = customer.depto || customer.dept || '';
          if (deptoVal) setDepto(deptoVal);
          const refVal = customer.delivery_reference || customer.deliveryReference || customer.notes || '';
          if (refVal) setDeliveryReference(refVal);
        }

        if (customer.email && !email) setEmail(customer.email);
      }
    } catch (e) {
      console.warn('Error autofilling customer data by phone:', e);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handlePhoneChange = (rawVal) => {
    const formatted = formatChileanPhone(rawVal);
    setPhone(formatted);
    const digitsOnly = formatted.replace(/\D/g, '');
    if (digitsOnly.length === 9) {
      checkAndAutofillCustomer(digitsOnly);
    } else {
      if (autofillCustomer) setAutofillCustomer(null);
    }
  };

  const shippingAutofillRef = useRef(null);
  shippingAutofillRef.current = {
    phone,
    recipientName,
    address,
    city,
    depto,
    deliveryReference,
    email,
    handlePhoneChange,
  };

  // Auto-cargar datos del cliente guardados en perfil al entrar al paso de despacho
  useEffect(() => {
    if (isOpen && step === 'shipping') {
      try {
        const raw =
          localStorage.getItem('patitas_customer_profile') ||
          localStorage.getItem('patitas_pwa_session');
        if (raw) {
          const profile = JSON.parse(raw);
          const cur = shippingAutofillRef.current;
          if (profile.phone && !cur.phone) {
            cur.handlePhoneChange(profile.phone);
          } else if (profile) {
            if (!cur.recipientName && (profile.name || profile.full_name)) {
              setRecipientName(profile.name || profile.full_name);
            }
            if (!cur.address && profile.address) {
              setAddress(profile.address);
            }
            if (!cur.city && profile.city) {
              setCity(profile.city);
            }
            if (!cur.depto && (profile.depto || profile.dept)) {
              setDepto(profile.depto || profile.dept);
            }
            if (!cur.deliveryReference && (profile.delivery_reference || profile.notes || profile.deliveryReference)) {
              setDeliveryReference(profile.delivery_reference || profile.notes || profile.deliveryReference);
            }
            if (!cur.email && profile.email) {
              setEmail(profile.email);
            }
          }
        }
      } catch (e) {
        console.warn('Error loading initial profile in CartDrawer:', e);
      }
    }
  }, [isOpen, step]);
  // Modalidad y Método de Pago
  const [paymentType, setPaymentType] = useState('anticipado'); // 'anticipado' (Paga Ahora · Mercado Pago) | 'contra_entrega' (Paga al Recibir)
  const [paymentMethod, setPaymentMethod] = useState('tarjeta'); // 'tarjeta' (Mercado Pago) | 'contra_entrega' (Pago al Recibir)
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (fieldName) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setFormError(null);
  };

  const handleSelectPaymentType = (type) => {
    setPaymentType(type);
    if (type === 'anticipado') {
      setPaymentMethod('tarjeta');
    } else {
      setPaymentMethod('contra_entrega');
    }
  };

  // Estado en vivo de reparto ("En Reparto" vs "En Bodega") desde Supabase
  const [isFleetOnRoute, setIsFleetOnRoute] = useState(false);

  useEffect(() => {
    const refreshLiveRouteStatus = () => {
      getLiveDispatchStatusFromSupabase().then((res) => {
        if (res && typeof res.isFleetOnRoute === 'boolean') {
          setIsFleetOnRoute(res.isFleetOnRoute);
        }
      });
    };

    refreshLiveRouteStatus();

    const handleLiveStatusUpdated = () => {
      refreshLiveRouteStatus();
    };

    window.addEventListener('patitas_dispatch_live_status_updated', handleLiveStatusUpdated);
    window.addEventListener('patitas_orders_updated', handleLiveStatusUpdated);
    return () => {
      window.removeEventListener('patitas_dispatch_live_status_updated', handleLiveStatusUpdated);
      window.removeEventListener('patitas_orders_updated', handleLiveStatusUpdated);
    };
  }, [isOpen, step]);

  // Submission & Post-order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedBankData, setCopiedBankData] = useState(false);
  const [selectedReplenishFrequency, setSelectedReplenishFrequency] = useState(30);
  const [replenishmentSaved, setReplenishmentSaved] = useState(false);

  // Helper para resetear los campos del formulario
  const handleResetForm = () => {
    setRecipientName('');
    setPhone('');
    setEmail('');
    setCity('');
    setAddress('');
    setDepto('');
    setDeliveryReference('');
    setDeliverySlot('');
    setDeliveryDate('');
    setAutofillCustomer(null);
    setFormError(null);
  };

  const mpReturnFallbackRef = useRef(null);
  mpReturnFallbackRef.current = {
    subtotal: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    recipientName,
    user,
    phone,
    address,
    city,
    deliveryDate,
    deliverySlot,
    cartItems,
    onClearCart,
  };

  // Procesar URLs de retorno de Mercado Pago (Paso 3: success_url, failure_url, pending_url)
  // o verificar el estado en vivo si existe una orden pendiente en localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fallbackCtx = mpReturnFallbackRef.current;

    const params = new URLSearchParams(window.location.search || '');
    const mpReturn = params.get('mp_return'); // 'success' | 'failure' | 'pending'
    const mpStatus = params.get('status') || params.get('collection_status'); // 'approved' | 'rejected' | 'pending' | 'in_process' | 'null'
    const externalRef = params.get('external_reference');
    const mpPaymentId = params.get('payment_id') || params.get('collection_id');
    const mpOrderId =
      params.get('order_id') ||
      params.get('merchant_order_id') ||
      params.get('preference_id');
    const mpPaymentType = params.get('payment_type');

    const hasMpParams =
      Boolean(mpReturn) ||
      Boolean(mpStatus && (externalRef || mpOrderId || mpPaymentId));

    let savedPendingOrder = null;
    try {
      const rawPending = localStorage.getItem('patitas_pending_mp_order');
      if (rawPending) {
        savedPendingOrder = JSON.parse(rawPending);
      }
    } catch (err) {
      console.warn('Error leyendo orden pendiente de Mercado Pago:', err);
    }

    // Caso B: Si el usuario volvió a la tienda sin parámetros en la URL pero tiene una orden MP recién creada,
    // consultar su estado real en la API de Mercado Pago (/v1/orders/{id})
    if (!hasMpParams) {
      if (savedPendingOrder?.mpOrderId) {
        getMercadoPagoOrderById(savedPendingOrder.mpOrderId).then(async (res) => {
          if (!res?.success || !res.mpOrder) return;
          const orderData = res.mpOrder;
          const liveStatus = String(orderData.status || '').toLowerCase();
          const liveDetail = String(orderData.status_detail || '').toLowerCase();
          const firstPayment = orderData.transactions?.payments?.[0] || null;
          const paymentStatus = String(firstPayment?.status || '').toLowerCase();

          const isPaidLive =
            liveStatus === 'processed' ||
            liveStatus === 'approved' ||
            liveDetail === 'accredited' ||
            paymentStatus === 'approved' ||
            paymentStatus === 'processed';

          if (isPaidLive) {
            const livePaymentId = firstPayment?.reference?.id || firstPayment?.id || null;
            const restoredOrder = {
              ...savedPendingOrder,
              paymentStatus: 'pagado',
              mpPaymentId: livePaymentId,
              mpOrderId: savedPendingOrder.mpOrderId,
            };

            setCompletedOrder(restoredOrder);
            setStep('success');
            localStorage.removeItem('patitas_pending_mp_order');
            if (fallbackCtx.onClearCart) fallbackCtx.onClearCart();
            window.dispatchEvent(new Event('patitas_open_cart'));

            if (savedPendingOrder.id) {
              const { data: currentOrderRow } = await supabase
                .from('orders')
                .select('id, status, payment_status, customer_id, points_earned, total')
                .eq('id', savedPendingOrder.id)
                .maybeSingle();

              const alreadyPaidInDb = String(currentOrderRow?.payment_status || '').toLowerCase() === 'pagado';
              const wasCancelledInDb = currentOrderRow?.status === 'cancelado';

              await updateOrderMercadoPagoData(savedPendingOrder.id, {
                mpOrderId: savedPendingOrder.mpOrderId,
                mpPaymentId: livePaymentId || undefined,
                paymentStatus: 'pagado',
              });

              if (wasCancelledInDb) {
                await supabase
                  .from('orders')
                  .update({ status: 'en_preparacion' })
                  .eq('id', savedPendingOrder.id);
                if (Array.isArray(savedPendingOrder.items) && savedPendingOrder.items.length > 0) {
                  await adjustStockForItemsInSupabase(savedPendingOrder.items, -1);
                }
              }

              const targetCustId = currentOrderRow?.customer_id || savedPendingOrder.customerId;
              const ptsToCredit = Number(currentOrderRow?.points_earned ?? savedPendingOrder.pointsEarned ?? 0) || 0;
              const totalToCredit = Number(currentOrderRow?.total ?? savedPendingOrder.total ?? 0) || 0;
              if (!alreadyPaidInDb && targetCustId && (ptsToCredit > 0 || totalToCredit > 0)) {
                try {
                  await updateCustomerPointsAndSpent(targetCustId, ptsToCredit, totalToCredit);
                } catch (ptsErr) {
                  console.warn('Error acreditando puntos tras verificación de Mercado Pago:', ptsErr);
                }
              }
            }
            window.dispatchEvent(new Event('patitas_orders_updated'));
            window.dispatchEvent(new Event('patitas_products_updated'));
            window.dispatchEvent(new Event('patitas_customers_updated'));
          }
        });
      }
      return;
    }

    const targetOrderId = externalRef || savedPendingOrder?.id || null;
    const cleanPaymentId = mpPaymentId && mpPaymentId !== 'null' ? mpPaymentId : null;
    const cleanMpOrderId = mpOrderId && mpOrderId !== 'null' ? mpOrderId : (savedPendingOrder?.mpOrderId || null);

    // Determinar el resultado de la transacción
    const isRejectedOrCanceled =
      mpStatus === 'rejected' ||
      mpStatus === 'null' ||
      (mpReturn === 'failure' && mpStatus !== 'approved');

    const isPending =
      !isRejectedOrCanceled &&
      (mpStatus === 'pending' || mpStatus === 'in_process' || (mpReturn === 'pending' && mpStatus !== 'approved'));

    const isApproved =
      !isRejectedOrCanceled &&
      !isPending &&
      (mpStatus === 'approved' || mpReturn === 'success');

    // Abrir el drawer de inmediato antes de limpiar la URL para que nunca quede oculto
    window.dispatchEvent(new Event('patitas_open_cart'));

    // Limpiar los parámetros de la URL para evitar reprocesamiento al recargar
    window.history.replaceState(window.history.state || {}, '', window.location.pathname);

    if (isRejectedOrCanceled) {
      if (savedPendingOrder) {
        if (savedPendingOrder.recipientName) setRecipientName(savedPendingOrder.recipientName);
        if (savedPendingOrder.phone) setPhone(formatChileanPhone(savedPendingOrder.phone));
        if (savedPendingOrder.address) setAddress(savedPendingOrder.address);
        if (savedPendingOrder.city) setCity(savedPendingOrder.city);
        if (savedPendingOrder.deliveryDate) setDeliveryDate(savedPendingOrder.deliveryDate);
        if (savedPendingOrder.deliverySlot) setDeliverySlot(savedPendingOrder.deliverySlot);
        setStep('payment');
      } else {
        setStep('shipping');
      }
      setPaymentType('anticipado');
      setPaymentMethod('tarjeta');
      setFormError(
        'El pago en Mercado Pago fue rechazado o cancelado. Puedes intentar nuevamente o elegir pago contra entrega.'
      );
      return;
    }

    const finalPaymentStatus = isApproved ? 'pagado' : 'pendiente';

    const restoredOrder = savedPendingOrder
      ? {
          ...savedPendingOrder,
          id: targetOrderId || savedPendingOrder.id,
          paymentStatus: finalPaymentStatus,
          mpPaymentId: cleanPaymentId,
          mpOrderId: cleanMpOrderId,
          mpPaymentType: mpPaymentType && mpPaymentType !== 'null' ? mpPaymentType : null,
        }
      : {
          id: targetOrderId || 'PED-MP',
          total: fallbackCtx.subtotal,
          pointsEarned: Math.floor(fallbackCtx.subtotal / 1000),
          recipientName: fallbackCtx.recipientName || fallbackCtx.user?.name || 'Cliente Web',
          phone: fallbackCtx.phone || fallbackCtx.user?.phone || '',
          customerId: fallbackCtx.user?.id || null,
          address: fallbackCtx.address || fallbackCtx.user?.address || 'Dirección registrada',
          city: fallbackCtx.city || fallbackCtx.user?.city || 'Puerto Varas',
          deliveryDayText: 'Según programación',
          deliveryDate: fallbackCtx.deliveryDate || '',
          deliverySlot: fallbackCtx.deliverySlot || 'Horario programado',
          paymentMethod: 'Tarjeta Débito / Crédito (Mercado Pago)',
          paymentType: 'anticipado',
          specificMethod: 'tarjeta',
          paymentStatus: finalPaymentStatus,
          mpPaymentId: cleanPaymentId,
          mpOrderId: cleanMpOrderId,
          mpPaymentType: mpPaymentType && mpPaymentType !== 'null' ? mpPaymentType : null,
          itemsCount: fallbackCtx.cartItems.length,
          items: fallbackCtx.cartItems,
          hasFoodItem: false,
        };

    // Mostrar el cuadro de confirmación ("¡Pedido Recibido con Éxito!") de forma instantánea
    setCompletedOrder(restoredOrder);
    setStep('success');
    localStorage.removeItem('patitas_pending_mp_order');
    if (fallbackCtx.onClearCart) {
      fallbackCtx.onClearCart();
    }
    window.dispatchEvent(new Event('patitas_open_cart'));

    const syncOrderInBackground = async () => {
      if (targetOrderId) {
        const { data: currentOrderRow } = await supabase
          .from('orders')
          .select('id, status, payment_status, customer_id, points_earned, total')
          .eq('id', targetOrderId)
          .maybeSingle();

        const alreadyPaidInDb = String(currentOrderRow?.payment_status || '').toLowerCase() === 'pagado';
        const wasCancelledInDb = currentOrderRow?.status === 'cancelado';

        await updateOrderMercadoPagoData(targetOrderId, {
          mpOrderId: cleanMpOrderId || undefined,
          mpPaymentId: cleanPaymentId || undefined,
          paymentStatus: alreadyPaidInDb ? 'pagado' : finalPaymentStatus,
        });

        if (isApproved && wasCancelledInDb) {
          await supabase
            .from('orders')
            .update({ status: 'en_preparacion' })
            .eq('id', targetOrderId);
          if (Array.isArray(savedPendingOrder?.items) && savedPendingOrder.items.length > 0) {
            await adjustStockForItemsInSupabase(savedPendingOrder.items, -1);
          }
        }

        const targetCustId = currentOrderRow?.customer_id || savedPendingOrder?.customerId;
        const ptsToCredit = Number(currentOrderRow?.points_earned ?? savedPendingOrder?.pointsEarned ?? 0) || 0;
        const totalToCredit = Number(currentOrderRow?.total ?? savedPendingOrder?.total ?? 0) || 0;
        if (isApproved && !alreadyPaidInDb && targetCustId && (ptsToCredit > 0 || totalToCredit > 0)) {
          try {
            await updateCustomerPointsAndSpent(targetCustId, ptsToCredit, totalToCredit);
          } catch (ptsErr) {
            console.warn('Error acreditando puntos tras retorno de Mercado Pago:', ptsErr);
          }
        }
      }

      window.dispatchEvent(new Event('patitas_orders_updated'));
      window.dispatchEvent(new Event('patitas_products_updated'));
      window.dispatchEvent(new Event('patitas_customers_updated'));
    };

    syncOrderInBackground();
  }, []);

  // Reset coupon and step if cart is emptied externally
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'success') {
      setAppliedCoupon(null);
      setCouponError(null);
      setStep('cart');
    }
  }, [cartItems, step]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Productos recomendados para agregar al carrito (con stock real > 0 y no pausados)
  const availableCrossSellProducts = useMemo(() => {
    if (!catalogProducts || catalogProducts.length === 0) return [];

    return catalogProducts.filter((p) => {
      const isPaused = Boolean(p.isPaused ?? p.is_paused);
      if (isPaused) return false;
      const stock = typeof p.stock === 'number' ? p.stock : 10;
      return stock > 0;
    });
  }, [catalogProducts]);

  const displayedCrossSellProducts = useMemo(() => {
    if (quickSearchQuery.trim().length > 0) {
      const q = quickSearchQuery.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return availableCrossSellProducts.filter((p) => {
        const name = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const brand = (p.brand || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(q) || brand.includes(q);
      });
    }

    // 1) Productos que NO están en el carrito todavía
    const notInCart = availableCrossSellProducts.filter((p) => {
      return !cartItems.some((ci) => ci.id === p.id || ci.name === p.name);
    });

    // 2) Productos en el carrito que aún tienen stock disponible para sumar
    const inCartWithStock = availableCrossSellProducts.filter((p) => {
      const inCartItem = cartItems.find((ci) => ci.id === p.id || ci.name === p.name);
      if (!inCartItem) return false;
      const pStock = typeof p.stock === 'number' ? p.stock : 10;
      return inCartItem.quantity < pStock;
    });

    // Ordenar por precio ascendente para sugerir complementos accesibles (latas $3.000, snacks)
    const sorted = [...notInCart, ...inCartWithStock].sort((a, b) => (a.price || 0) - (b.price || 0));
    return sorted.slice(0, 4);
  }, [availableCrossSellProducts, quickSearchQuery, cartItems]);

  const handleQuickAdd = (product) => {
    const format = (Array.isArray(product.weights) && product.weights[0]) || product.format || 'Formato Estándar';
    const preparedProduct = {
      ...product,
      price: Number(product.price || product.salePrice || 0),
      image: resolveProductImage(product),
      stock: typeof product.stock === 'number' ? product.stock : 10,
    };
    if (onAddToCart) {
      onAddToCart(preparedProduct, format, 1);
    }
    setAddedFeedbackId(product.id);
    setTimeout(() => {
      setAddedFeedbackId(null);
    }, 1200);
  };

  const handleContinueShopping = () => {
    onClose();
    if (window.location.pathname.startsWith('/mi-cuenta') || window.location.pathname.startsWith('/admin')) {
      navigate('/');
    }
  };

  // Zonas activas configuradas en Supabase (store_settings)
  const activeDispatchZones = useMemo(
    () => dispatchZones.filter((z) => z.active !== false),
    [dispatchZones]
  );

  // Evaluación estricta de zona de despacho según el círculo de cobertura configurado en Despachos
  const deliveryCoverageEval = useMemo(() => {
    const trimmedAddr = (address || '').trim();
    const effectiveCity = city || (trimmedAddr ? detectCommuneFromAddress(trimmedAddr) : null);

    if (activeDispatchZones.length === 0) {
      return {
        zone: null,
        isOutOfZone: false,
        distanceKm: null,
        maxRadiusKm: 0,
      };
    }

    const sorted = [...activeDispatchZones].sort(
      (a, b) => (parseFloat(a.radiusMaxKm) || 0) - (parseFloat(b.radiusMaxKm) || 0)
    );
    const maxRadiusKm = Math.max(
      ...sorted.map((z) => parseFloat(z.radiusMaxKm) || 0),
      0
    );

    // 1. Si tenemos coordenadas exactas del autocompletado de Google Maps o de la dirección guardada
    if (customerCoords && customerCoords.lat && customerCoords.lng) {
      const dist = calculateHaversineDistance(
        CENTRAL_HUB.lat,
        CENTRAL_HUB.lng,
        customerCoords.lat,
        customerCoords.lng
      );
      const matched = sorted.find((z) => dist <= (parseFloat(z.radiusMaxKm) || 0));
      if (matched) {
        return {
          zone: { ...matched, distanceKm: dist },
          isOutOfZone: false,
          distanceKm: dist,
          maxRadiusKm,
        };
      }
      return {
        zone: null,
        isOutOfZone: true,
        distanceKm: dist,
        maxRadiusKm,
      };
    }

    // 2. Si tenemos comuna detectada (city)
    if (effectiveCity) {
      const refCoords = TOWN_COORDINATES[effectiveCity];
      if (refCoords) {
        const dist = calculateHaversineDistance(
          CENTRAL_HUB.lat,
          CENTRAL_HUB.lng,
          refCoords.lat,
          refCoords.lng
        );
        const matchedRadius = sorted.find((z) => dist <= (parseFloat(z.radiusMaxKm) || 0));
        if (matchedRadius) {
          return {
            zone: { ...matchedRadius, distanceKm: dist },
            isOutOfZone: false,
            distanceKm: dist,
            maxRadiusKm,
          };
        }
        return {
          zone: null,
          isOutOfZone: true,
          distanceKm: dist,
          maxRadiusKm,
        };
      }

      const normCity = effectiveCity.toLowerCase().trim();
      const matchedByName = sorted.find(
        (z) =>
          z.name?.toLowerCase().trim() === normCity ||
          z.name?.toLowerCase().includes(normCity) ||
          normCity.includes(z.name?.toLowerCase().trim()) ||
          z.coverage?.toLowerCase().includes(normCity)
      );
      if (matchedByName) {
        return {
          zone: matchedByName,
          isOutOfZone: false,
          distanceKm: null,
          maxRadiusKm,
        };
      }

      return {
        zone: null,
        isOutOfZone: true,
        distanceKm: null,
        maxRadiusKm,
      };
    }

    // 3. Si el cliente escribió una dirección manual que no coincide con ninguna comuna cubierta
    if (trimmedAddr.length >= 6) {
      return {
        zone: null,
        isOutOfZone: true,
        distanceKm: null,
        maxRadiusKm,
      };
    }

    // Aún no ha ingresado dirección (valor referencial inicial)
    return {
      zone: sorted[0] || null,
      isOutOfZone: false,
      distanceKm: null,
      maxRadiusKm,
    };
  }, [activeDispatchZones, customerCoords, city, address]);

  const matchedDispatchZone = deliveryCoverageEval.zone;
  const isOutOfDeliveryZone = deliveryCoverageEval.isOutOfZone;

  const outOfZoneWhatsAppUrl = useMemo(() => {
    const cleanAddr = [address?.trim(), depto?.trim() ? `(${depto.trim()})` : '', city?.trim()].filter(Boolean).join(', ');
    const distInfo = deliveryCoverageEval.distanceKm
      ? ` (~${deliveryCoverageEval.distanceKm.toFixed(1)} km desde bodega)`
      : '';
    const itemsSummary = cartItems
      .map((item) => `• ${item.quantity}x ${item.name} (${item.weight || item.selectedWeight || 'Estándar'})`)
      .join('\n');
    const msg = `Hola Patitas del Sur 🐾, quería consultar si es posible coordinar un despacho a mi dirección (aparece fuera del radio automático de ${deliveryCoverageEval.maxRadiusKm || 8} km en la web):\n\n📍 Dirección: ${cleanAddr || 'Por confirmar'}${distInfo}\n👤 Nombre: ${recipientName?.trim() || user?.name || 'Cliente'}\n\n🛒 Mi carrito:\n${itemsSummary}`;
    return `https://wa.me/56953332492?text=${encodeURIComponent(msg)}`;
  }, [address, depto, city, deliveryCoverageEval, cartItems, recipientName, user?.name]);

  // Próximas fechas de reparto disponibles según los días habilitados de la zona y estado del reparto en vivo
  const availableDeliveryDates = useMemo(() => {
    const allowedDays = Array.isArray(matchedDispatchZone?.deliveryDays) && matchedDispatchZone.deliveryDays.length > 0
      ? matchedDispatchZone.deliveryDays
      : [1, 2, 3, 4, 5, 6];
    return getUpcomingDeliveryDates(allowedDays, 6, { isFleetOnRoute });
  }, [matchedDispatchZone, isFleetOnRoute]);

  // Sincronizar fecha seleccionada con las fechas disponibles
  useEffect(() => {
    if (availableDeliveryDates.length > 0) {
      const exists = availableDeliveryDates.some((d) => d.isoDate === deliveryDate);
      if (!exists) {
        setDeliveryDate(availableDeliveryDates[0].isoDate);
      }
    }
  }, [availableDeliveryDates, deliveryDate]);

  // Evaluación inteligente de las 2 ventanas (10:00-13:00 y 15:30-19:30) + Pedido Urgente
  const smartScheduleEval = useMemo(() => {
    const targetIso = deliveryDate || availableDeliveryDates[0]?.isoDate || '';
    return evaluateSmartDeliverySchedule({
      isFleetOnRoute,
      selectedDateIso: targetIso,
    });
  }, [isFleetOnRoute, deliveryDate, availableDeliveryDates]);

  // Opciones de horarios calculadas dinámicamente según la hora actual y si se anda en reparto
  const availableSlots = useMemo(() => {
    if (isOutOfDeliveryZone) return [];
    return smartScheduleEval.slots || [];
  }, [isOutOfDeliveryZone, smartScheduleEval]);

  // Pre-seleccionar automáticamente la ventana recomendada más rápida cuando cambia la fecha o el estado de reparto
  useEffect(() => {
    if (availableSlots.length === 0) return;
    const exists = availableSlots.some((s) => s.value === deliverySlot);
    if (!exists && smartScheduleEval.recommendedSlotValue) {
      setDeliverySlot(smartScheduleEval.recommendedSlotValue);
    }
  }, [availableSlots, deliverySlot, smartScheduleEval.recommendedSlotValue]);

  // Objeto de la fecha seleccionada
  const selectedDateObj = useMemo(() => {
    return availableDeliveryDates.find((d) => d.isoDate === deliveryDate) || availableDeliveryDates[0] || null;
  }, [availableDeliveryDates, deliveryDate]);

  // ¿El día seleccionado es un día especial para esta zona (ej: Sábado)?
  const isSpecialDeliveryDay = useMemo(() => {
    if (!matchedDispatchZone || !matchedDispatchZone.hasSpecialDayPricing || !selectedDateObj) {
      return false;
    }
    const specialDays = Array.isArray(matchedDispatchZone.specialDays) ? matchedDispatchZone.specialDays : [6];
    return specialDays.includes(selectedDateObj.dayOfWeek);
  }, [matchedDispatchZone, selectedDateObj]);

  // Objeto de la franja horaria seleccionada
  const selectedSlotData = useMemo(() => {
    return availableSlots.find((s) => s.value === deliverySlot) || null;
  }, [availableSlots, deliverySlot]);

  // Umbral de despacho gratis: obtenido de la zona configurada en el panel de administración
  const freeShippingThreshold = useMemo(() => {
    if (matchedDispatchZone && matchedDispatchZone.freeThreshold !== undefined) {
      return Number(matchedDispatchZone.freeThreshold) || 25000;
    }
    if (activeDispatchZones.length > 0) {
      const thresholds = activeDispatchZones.map((z) => Number(z.freeThreshold)).filter((t) => t > 0);
      return thresholds.length > 0 ? Math.min(...thresholds) : 25000;
    }
    return 25000;
  }, [matchedDispatchZone, activeDispatchZones]);

  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Tarifa base de despacho estándar configurada en el panel de administración
  const zoneBaseFee = useMemo(() => {
    if (matchedDispatchZone && matchedDispatchZone.baseFee !== undefined) {
      return Number(matchedDispatchZone.baseFee) || 0;
    }
    if (activeDispatchZones.length > 0 && activeDispatchZones[0].baseFee !== undefined) {
      return Number(activeDispatchZones[0].baseFee) || 0;
    }
    return 2000;
  }, [matchedDispatchZone, activeDispatchZones]);

  // ¿Aplica exclusión de envío gratis por día especial o por horario?
  const isFreeShippingExcluded = Boolean(
    (isSpecialDeliveryDay && matchedDispatchZone?.specialDayNoFreeShipping) ||
    (selectedSlotData?.noFreeShipping)
  );

  // Tarifa efectiva según horario seleccionado o día especial
  const effectiveBaseFee = useMemo(() => {
    // 1. Si el horario seleccionado tiene tarifa especial
    if (selectedSlotData && selectedSlotData.fee !== null && selectedSlotData.fee !== undefined && Number(selectedSlotData.fee) > 0) {
      return Number(selectedSlotData.fee);
    }
    // 2. Si el día de reparto tiene tarifa especial
    if (isSpecialDeliveryDay && matchedDispatchZone?.specialDayFee !== undefined && Number(matchedDispatchZone.specialDayFee) > 0) {
      return Number(matchedDispatchZone.specialDayFee);
    }
    // 3. Tarifa estándar de la zona
    return zoneBaseFee;
  }, [selectedSlotData, isSpecialDeliveryDay, matchedDispatchZone, zoneBaseFee]);

  // Determinar si ya se ingresó la dirección de despacho
  const hasShippingAddress = Boolean(address.trim() && (city || detectCommuneFromAddress(address)));

  // Costo efectivo de despacho: gratuito si supera el umbral Y no está excluido de despacho gratis
  const isFreeShippingApplicable = !isFreeShippingExcluded && subtotal >= freeShippingThreshold;
  const calculatedShippingCost = isFreeShippingApplicable ? 0 : effectiveBaseFee;

  // Coupon Discount Calculation (Soporta descuento porcentual o dinero fijo de fidelización)
  const discountPercent = appliedCoupon ? (appliedCoupon.discountPercent || 0) : 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountAmount !== undefined
      ? Math.min(subtotal, appliedCoupon.discountAmount)
      : Math.round((subtotal * discountPercent) / 100)
    : 0;
  const cartStepTotal = Math.max(0, subtotal - discountAmount);
  const shippingStepTotal = Math.max(0, subtotal - discountAmount + (hasShippingAddress ? calculatedShippingCost : 0));
  const total = step === 'cart' ? cartStepTotal : shippingStepTotal;
  const shippingCost = hasShippingAddress ? calculatedShippingCost : 0;

  // Validate and Apply Coupon (Soporta cupones PTS- de fidelización y convenios)
  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    setCouponError(null);
    const cleanCode = couponInput.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('Ingresa un código de cupón.');
      return;
    }

    setIsVerifyingCoupon(true);

    try {
      // 1. Verificar si es un cupón del Club Patitas (PTS-XXXXX)
      if (cleanCode.startsWith('PTS-')) {
        const { data: redemption } = await supabase
          .from('points_redemptions')
          .select('*')
          .eq('coupon_code', cleanCode)
          .maybeSingle();

        if (redemption) {
          if (redemption.status !== 'activo') {
            setCouponError('Este cupón ya fue utilizado en un pedido anterior.');
            setIsVerifyingCoupon(false);
            return;
          }

          let dAmount = 1000;
          try {
            const loyaltySettings = await getLoyaltySettings();
            const matchedTier = (loyaltySettings?.tiers || []).find(
              (t) => t.id === redemption.reward_id || Number(t.points) === Number(redemption.points_spent)
            );
            if (matchedTier && matchedTier.discountAmount) {
              dAmount = Number(matchedTier.discountAmount);
            } else if (redemption.points_spent === 200) {
              dAmount = 2000;
            } else if (redemption.points_spent === 350) {
              dAmount = 3500;
            } else if (redemption.points_spent === 500) {
              dAmount = 5000;
            } else {
              dAmount = Number(redemption.points_spent) * 10;
            }
          } catch (e) {
            console.warn('Error fetching loyalty settings in cart:', e);
            dAmount = Number(redemption.points_spent) * 10;
          }

          setAppliedCoupon({
            code: cleanCode,
            source: 'loyalty',
            convenioName: 'Club Patitas (Canje de Puntos)',
            discountAmount: dAmount,
            discountPercent: 0,
            isSingleUse: true,
          });
          setCouponInput('');
          setIsVerifyingCoupon(false);
          return;
        }
      }

      const result = await verifyCouponInSupabase(cleanCode);
      if (result && result.valid) {
        setAppliedCoupon({
          code: cleanCode,
          source: 'convenio',
          convenioId: result.convenio?.id,
          convenioName: result.convenio?.name || 'Convenio Aliado',
          discountPercent: result.discountPercent || 10,
          isSingleUse: result.isSingleUse ?? true,
        });
        setCouponInput('');
        setIsVerifyingCoupon(false);
        return;
      }

      // Fallback a convenios locales
      let savedConvenios = [];
      try {
        const raw = localStorage.getItem('patitas_convenios');
        if (raw) savedConvenios = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading convenios', err);
      }

      let matchedConvenio = null;
      let matchedCoupon = null;

      for (const conv of savedConvenios) {
        if (!conv.active) continue;

        if (conv.discountType === 'single_use' && conv.coupons) {
          const found = conv.coupons.find((c) => c.code.toUpperCase() === cleanCode);
          if (found) {
            matchedConvenio = conv;
            matchedCoupon = found;
            break;
          }
        } else if (conv.code && conv.code.toUpperCase() === cleanCode) {
          matchedConvenio = conv;
          break;
        }
      }

      if (!matchedConvenio) {
        setCouponError(result?.error || 'Código no válido o el convenio no se encuentra activo.');
        setIsVerifyingCoupon(false);
        return;
      }

      if (matchedCoupon && matchedCoupon.status === 'canjeado') {
        setCouponError(`El cupón ${cleanCode} ya fue utilizado en una compra anterior.`);
        setIsVerifyingCoupon(false);
        return;
      }

      const pct = matchedConvenio.discountPercent || 10;
      setAppliedCoupon({
        code: cleanCode,
        convenioId: matchedConvenio.id,
        convenioName: matchedConvenio.name,
        discountPercent: pct,
        isSingleUse: matchedConvenio.discountType === 'single_use',
      });
      setCouponInput('');
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponError('Ocurrió un error al verificar el cupón.');
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const focusFieldById = (fieldId) => {
    if (!fieldId) return;
    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusTarget = el.querySelector('input, button') || (typeof el.focus === 'function' ? el : null);
        if (focusTarget && typeof focusTarget.focus === 'function') {
          focusTarget.focus({ preventScroll: true });
        }
      }
    }, 80);
  };

  // Validate step 'cart' -> 'shipping' (Datos y Dirección)
  const handleProceedToShipping = () => {
    if (cartItems.length === 0) return;
    if (hasOutOfStockItems) {
      setFormError('Por favor elimina los productos agotados de tu carrito antes de continuar.');
      return;
    }
    setFormError(null);
    setFieldErrors({});
    setStep('shipping');
  };

  // Validate step 'shipping' (Datos y Dirección) -> 'schedule' (Agenda de Despacho)
  const handleProceedToSchedule = (e) => {
    e?.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (hasOutOfStockItems) {
      setFormError('No es posible continuar con productos agotados en el carrito.');
      return;
    }

    if (isOutOfDeliveryZone) {
      setFormError('Tu dirección se encuentra fuera del radio de despacho automático. Por favor contáctanos por WhatsApp con el botón de abajo para consultar si podemos despachar a tu ubicación.');
      return;
    }

    const errors = {};
    let firstErrorField = null;

    const cleanDigits = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanDigits.length !== 9) {
      errors.phone = 'El teléfono móvil (ID de cliente) es obligatorio (9 dígitos en formato 9 xxxx xxxx).';
      if (!firstErrorField) firstErrorField = 'field-phone';
    }
    if (!recipientName.trim()) {
      errors.recipientName = 'Por favor ingresa el nombre de quien recibe el pedido.';
      if (!firstErrorField) firstErrorField = 'field-recipient-name';
    }
    if (!address.trim()) {
      errors.address = 'Por favor ingresa la calle y número para el despacho.';
      if (!firstErrorField) {
        if (addressMode === 'habitual') setAddressMode('temporary');
        firstErrorField = 'checkout-shipping-address';
      }
    }
    let effectiveCity = city;
    if (!effectiveCity && address.trim()) {
      effectiveCity = detectCommuneFromAddress(address);
      if (effectiveCity) {
        setCity(effectiveCity);
      } else {
        errors.address = 'Por favor selecciona una dirección sugerida en la lista para detectar tu comuna.';
        if (!firstErrorField) firstErrorField = 'checkout-shipping-address';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0]);
      focusFieldById(firstErrorField);
      return;
    }

    setStep('schedule');
  };

  // Validate step 'schedule' (Agenda de Despacho) -> 'payment' (Método de Pago)
  const handleProceedToPayment = () => {
    setFormError(null);
    setFieldErrors({});

    if (hasOutOfStockItems) {
      setFormError('No es posible continuar con productos agotados en el carrito.');
      return;
    }

    if (isOutOfDeliveryZone) {
      setStep('shipping');
      setFormError('Tu dirección se encuentra fuera del radio de despacho automático.');
      return;
    }

    const errors = {};
    let firstErrorField = null;

    if (!deliveryDate) {
      errors.deliveryDate = 'Por favor selecciona el día de entrega.';
      if (!firstErrorField) firstErrorField = 'field-delivery-date';
    }
    if (!deliverySlot) {
      errors.deliverySlot = 'Por favor selecciona el bloque horario de entrega.';
      if (!firstErrorField) firstErrorField = 'field-delivery-slot';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0]);
      focusFieldById(firstErrorField);
      return;
    }

    setStep('payment');
  };

  // Submit Order to Supabase
  const handleConfirmOrder = async (e) => {
    e?.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (hasOutOfStockItems) {
      setFormError('No es posible procesar el pedido con productos agotados en el carrito.');
      return;
    }

    if (isOutOfDeliveryZone) {
      setStep('shipping');
      setFormError('Tu dirección se encuentra fuera del radio de despacho automático. Por favor contáctanos por WhatsApp con el botón de abajo para consultar si podemos despachar a tu ubicación.');
      return;
    }

    const errors = {};
    let firstErrorField = null;
    let targetErrorStep = null;

    // Validate fields: Phone is Customer ID and mandatory first field
    const cleanDigits = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanDigits.length !== 9) {
      errors.phone = 'El teléfono móvil (ID de cliente) es obligatorio (9 dígitos en formato 9 xxxx xxxx).';
      if (!firstErrorField) {
        firstErrorField = 'field-phone';
        targetErrorStep = 'shipping';
      }
    }
    if (!recipientName.trim()) {
      errors.recipientName = 'Por favor ingresa el nombre de quien recibe el pedido.';
      if (!firstErrorField) {
        firstErrorField = 'field-recipient-name';
        targetErrorStep = 'shipping';
      }
    }
    if (!address.trim()) {
      errors.address = 'Por favor ingresa la calle y número para el despacho.';
      if (!firstErrorField) {
        if (addressMode === 'habitual') setAddressMode('temporary');
        firstErrorField = 'checkout-shipping-address';
        targetErrorStep = 'shipping';
      }
    }
    let effectiveCity = city;
    if (!effectiveCity && address.trim()) {
      effectiveCity = detectCommuneFromAddress(address);
      if (effectiveCity) {
        setCity(effectiveCity);
      } else {
        errors.address = 'Por favor selecciona una dirección sugerida en la lista para detectar tu comuna.';
        if (!firstErrorField) {
          firstErrorField = 'checkout-shipping-address';
          targetErrorStep = 'shipping';
        }
      }
    }
    if (!deliveryDate) {
      errors.deliveryDate = 'Por favor selecciona el día de entrega.';
      if (!firstErrorField) {
        firstErrorField = 'field-delivery-date';
        targetErrorStep = 'schedule';
      }
    }
    if (!deliverySlot) {
      errors.deliverySlot = 'Por favor selecciona el horario preferido de entrega.';
      if (!firstErrorField) {
        firstErrorField = 'field-delivery-slot';
        targetErrorStep = 'schedule';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorMessage = Object.values(errors)[0];
      setFormError(firstErrorMessage);
      if (targetErrorStep && targetErrorStep !== step) {
        setStep(targetErrorStep);
      }
      focusFieldById(firstErrorField);
      return;
    }

    const fullPhone = phone.trim().startsWith('+')
      ? phone.trim()
      : `${countryCode} ${phone.trim()}`;

    setIsSubmitting(true);

    // Verificar si ya existe un pedido pendiente de un intento previo en Mercado Pago para no duplicar la orden ni descontar stock dos veces
    let existingPendingOrder = null;
    try {
      const rawPending = localStorage.getItem('patitas_pending_mp_order');
      if (rawPending) {
        const parsed = JSON.parse(rawPending);
        if (parsed?.id && parsed?.createdInSupabase) {
          existingPendingOrder = parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo patitas_pending_mp_order:', e);
    }

    const orderId = existingPendingOrder?.id || (await getNextOrderId());
    const seqMatch = String(orderId).match(/PED-(\d+)/i);
    const seqNum = seqMatch ? seqMatch[1] : '0001';
    const pointsEarned = Math.floor(total / 1000); // 1 Punto por cada $1.000 CLP gastados
    const fullAddress = depto.trim() ? `${address.trim()}, Depto/Casa ${depto.trim()}` : address.trim();

    const finalPaymentMethodLabel =
      paymentType === 'contra_entrega'
        ? 'Pago al Recibir'
        : 'Tarjeta Débito / Crédito (Mercado Pago)';

    let notesText = deliveryReference.trim()
      ? `Referencia: ${deliveryReference.trim()}`
      : orderSourceLabel
        ? `Origen: ${orderSourceLabel}`
        : 'Pedido desde la web';
    if (deliveryReference.trim() && orderSourceLabel) {
      notesText += ` · Origen: ${orderSourceLabel}`;
    }

    // El estado inicial siempre es 'pendiente'; al aprobarse en Mercado Pago pasa a 'pagado'
    const orderPayload = {
      id: orderId,
      customerId: user?.id || null,
      customerName: recipientName.trim(),
      customerEmail: email.trim() || user?.email || null,
      customerPhone: fullPhone,
      channel: 'web',
      paymentMethod: finalPaymentMethodLabel,
      paymentStatus: 'pendiente',
      status: 'en_preparacion',
      subtotal,
      shippingCost,
      discount: discountAmount,
      total,
      pointsEarned,
      deliveryDayText: selectedDateObj?.cleanLabel || selectedDateObj?.label || 'Por confirmar',
      deliveryDate: deliveryDate || getChileNowParts().isoDate,
      deliverySlot: deliverySlot,
      address: fullAddress,
      city: effectiveCity,
      deliveryLat: customerCoords?.lat ?? null,
      deliveryLng: customerCoords?.lng ?? null,
      deliveryZone: matchedDispatchZone ? `Zona ${matchedDispatchZone.name}` : `Zona Despacho: ${effectiveCity}`,
      agreementUsed: appliedCoupon ? `${appliedCoupon.convenioName} (${appliedCoupon.code})` : null,
      couponCodeUsed: appliedCoupon ? appliedCoupon.code : null,
      notes: notesText,
      invoiceNumber: `BOL-2026-${seqNum}`,
    };

    try {
      // Si el cliente seleccionó Pagar con Mercado Pago (paymentType === 'anticipado'),
      // creamos primero la orden en Mercado Pago (Orders API /v1/orders) para obtener checkout_url
      let mpOrderResult = null;
      if (paymentType === 'anticipado') {
        const nameParts = (recipientName || user?.name || '').trim().split(/\s+/).filter(Boolean);
        const payerFirstName = nameParts[0] || 'Cliente';
        const payerLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Patitas del Sur';

        mpOrderResult = await createMercadoPagoOrder({
          externalReference: orderId,
          totalAmount: total,
          payerEmail: email.trim() || user?.email || COMPANY_INFO.email,
          payerFirstName,
          payerLastName,
          payerName: recipientName.trim() || user?.name || 'Cliente Patitas del Sur',
          payerPhone: {
            area_code: String(countryCode || '+56').replace(/\D/g, '') || '56',
            number: cleanDigits,
          },
          payerIdentification: {
            type: 'RUT',
            number: autofillCustomer?.rut || user?.rut || '11111111-1',
          },
          payerRegistrationDate:
            autofillCustomer?.created_at ||
            user?.created_at ||
            new Date().toISOString(),
          payerIsFirstPurchaseOnline: !autofillCustomer,
          payerAuthenticationType: 'WEB',
          items: cartItems.map((it, idx) => ({
            external_code: String(it.sku || it.id || `PROD-${idx + 1}`),
            title: `${it.name}${it.weight ? ` (${it.weight})` : ''}`,
            description:
              it.description ||
              it.tagline ||
              `${it.brand ? `${it.brand} - ` : ''}${it.name}${it.weight ? ` (${it.weight})` : ''} - Nutrición natural Patitas del Sur`,
            unit_price: it.price,
            quantity: it.quantity || 1,
            category_id: 'others',
          })),
          shippingCost,
          description: `Pedido Patitas del Sur #${orderId}`,
        });

        if (!mpOrderResult.success || !mpOrderResult.checkoutUrl) {
          throw new Error(
            mpOrderResult.error?.message ||
              'No se pudo generar el enlace de pago en Mercado Pago. Intenta nuevamente.'
          );
        }

        orderPayload.mercadopagoPreferenceId = mpOrderResult.mpOrderId;
      }

      // 1. Guardar o actualizar orden en Supabase
      if (existingPendingOrder?.id) {
        const { data: existingOrderRow } = await supabase
          .from('orders')
          .select('id, status')
          .eq('id', orderId)
          .maybeSingle();

        if (!existingOrderRow) {
          const result = await createOrderInSupabase(orderPayload, cartItems);
          if (!result.success) {
            throw new Error(result.error?.message || 'Error registrando el pedido en base de datos');
          }
        } else {
          const wasCancelled = existingOrderRow.status === 'cancelado';
          const { error: updErr } = await supabase
            .from('orders')
            .update({
              customer_name: orderPayload.customerName,
              customer_email: orderPayload.customerEmail,
              customer_phone: orderPayload.customerPhone,
              payment_method: orderPayload.paymentMethod,
              payment_status: 'pendiente',
              ...(wasCancelled ? { status: 'en_preparacion' } : {}),
              mercadopago_preference_id: orderPayload.mercadopagoPreferenceId || null,
              subtotal: orderPayload.subtotal,
              shipping_cost: orderPayload.shippingCost,
              discount: orderPayload.discount,
              total: orderPayload.total,
              points_earned: orderPayload.pointsEarned,
              delivery_day_text: orderPayload.deliveryDayText,
              delivery_date: orderPayload.deliveryDate,
              delivery_slot: orderPayload.deliverySlot,
              address: orderPayload.address,
              city: orderPayload.city,
              delivery_zone: orderPayload.deliveryZone,
              notes: orderPayload.notes,
            })
            .eq('id', orderId);

          if (updErr) {
            throw new Error(updErr.message || 'Error actualizando el pedido en base de datos');
          }

          // Si el intento anterior fue cancelado (y ya había devuelto stock), reservar stock de nuevo para este reintento
          if (wasCancelled && Array.isArray(cartItems) && cartItems.length > 0) {
            await adjustStockForItemsInSupabase(cartItems, -1);
          }
        }
      } else {
        const result = await createOrderInSupabase(orderPayload, cartItems);
        if (!result.success) {
          throw new Error(result.error?.message || 'Error registrando el pedido en base de datos');
        }
      }

      // 1.5 Guardar o actualizar datos del cliente con su teléfono como identificador
      let savedCustId = user?.id || null;
      try {
        const isTemporaryDelivery = addressMode === 'temporary' && savedAddressesList.length > 0;
        const shouldPreserveHabitual = isTemporaryDelivery && !saveNewAddressToProfile;

        const habitualAddr = savedAddressesList.find((a) => a.isDefault) || savedAddressesList[0] || autofillCustomer;

        const profileAddress = shouldPreserveHabitual ? (habitualAddr?.address || '') : address.trim();
        const profileCity = shouldPreserveHabitual ? (habitualAddr?.city || '') : effectiveCity;
        const profileDepto = shouldPreserveHabitual ? (habitualAddr?.depto || '') : depto.trim();
        const profileRef = shouldPreserveHabitual ? (habitualAddr?.deliveryReference || '') : deliveryReference.trim();

        let updatedSavedAddresses = [...savedAddressesList];
        if (isTemporaryDelivery && saveNewAddressToProfile && address.trim()) {
          const newAddressItem = {
            id: `addr_${Date.now()}`,
            label: (newAddressLabel || 'Otra Dirección').trim(),
            address: address.trim(),
            depto: depto.trim(),
            city: effectiveCity,
            deliveryReference: deliveryReference.trim(),
            isDefault: false,
          };
          updatedSavedAddresses.push(newAddressItem);
        }

        const custRes = await upsertCustomerProfile({
          id: autofillCustomer?.id || user?.id,
          fullName: recipientName.trim(),
          phone: fullPhone,
          address: profileAddress,
          city: profileCity,
          depto: profileDepto,
          deliveryReference: profileRef,
          email: email.trim() || user?.email || '',
          saved_addresses: updatedSavedAddresses,
        });
        if (custRes?.data?.id) {
          savedCustId = custRes.data.id;
        }
      } catch (custErr) {
        console.warn('Error saving customer profile by phone:', custErr);
      }

      // 2. Quemar cupón si aplica (Fidelización Club Patitas vs Convenio Aliado)
      if (appliedCoupon && !existingPendingOrder?.couponRedeemed) {
        try {
          if (appliedCoupon.source === 'loyalty' || (appliedCoupon.code && appliedCoupon.code.startsWith('PTS-'))) {
            await markCouponAsUsed(appliedCoupon.code, orderId);
          } else {
            await redeemCouponInSupabase(appliedCoupon.code, orderId);
          }
        } catch (couponBurnErr) {
          console.warn('Error marking coupon as used:', couponBurnErr);
        }
      }

      // 3. Emitir eventos globales de sincronización
      window.dispatchEvent(new Event('patitas_orders_updated'));
      window.dispatchEvent(new Event('patitas_products_updated'));
      window.dispatchEvent(new Event('patitas_convenios_updated'));

      // Identificar si la orden incluye alimento seco o productos nutricionales
      const orderedItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand || '',
        price: item.price,
        quantity: item.quantity,
        weight: item.weight || item.format || '',
        image: resolveProductImage(item),
        category: item.category || '',
      }));

      const hasFoodItem = cartItems.some((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return (
          cat.includes('alimento') ||
          cat.includes('seco') ||
          cat.includes('nutricion') ||
          cat.includes('perro') ||
          cat.includes('gato') ||
          name.includes('alimento') ||
          name.includes('perro') ||
          name.includes('gato') ||
          name.includes('puppy') ||
          name.includes('adult') ||
          name.includes('senior') ||
          name.includes('kg') ||
          name.includes('bravery') ||
          name.includes('acana') ||
          name.includes('orijen') ||
          name.includes('taste') ||
          name.includes('fit') ||
          name.includes('nomade') ||
          name.includes('hills') ||
          name.includes('royal') ||
          name.includes('pro plan') ||
          name.includes('eukanuba')
        );
      });

      const orderSummaryObj = {
        id: orderId,
        total,
        pointsEarned,
        recipientName: recipientName.trim(),
        phone: (phone || user?.phone || '').trim(),
        customerId: savedCustId,
        address: fullAddress,
        city: effectiveCity,
        deliveryDayText: selectedDateObj?.label || 'Hoy Mismo',
        deliveryDate: selectedDateObj?.label || deliveryDate,
        deliverySlot,
        paymentMethod: finalPaymentMethodLabel,
        paymentType,
        specificMethod: paymentMethod,
        paymentStatus: 'pendiente',
        mpOrderId: mpOrderResult?.mpOrderId || null,
        itemsCount: cartItems.length,
        items: orderedItems,
        hasFoodItem,
        createdInSupabase: true,
        couponRedeemed: Boolean(appliedCoupon),
      };

      // Guardar automáticamente como pedido habitual por defecto si tiene alimentos
      if (hasFoodItem && (savedCustId || phone)) {
        saveCustomerReplenishmentData(savedCustId, phone, {
          frequencyDays: 30,
          habitualOrder: orderedItems,
          lastOrderDate: new Date().toISOString(),
          orderId,
        }).catch((err) => console.warn('Replenishment auto-save warning:', err));
      }

      // PASO 4: Si es pago con Mercado Pago, guardar contexto local y redirigir a checkout_url
      if (paymentType === 'anticipado' && mpOrderResult?.checkoutUrl) {
        localStorage.setItem('patitas_pending_mp_order', JSON.stringify(orderSummaryObj));
        window.location.href = mpOrderResult.checkoutUrl;
        return;
      }

      // Si es pago contra entrega, limpiar cualquier intento pendiente de MP y mostrar pantalla de éxito
      localStorage.removeItem('patitas_pending_mp_order');
      setCompletedOrder(orderSummaryObj);
      setReplenishmentSaved(false);
      setSelectedReplenishFrequency(30);

      if (onClearCart) {
        onClearCart();
      }

      setStep('success');
    } catch (err) {
      console.error('Error during checkout process:', err);
      setFormError(
        err?.message || 'Hubo un inconveniente al procesar tu pedido. Por favor intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveReplenishment = async (days) => {
    setSelectedReplenishFrequency(days);
    setReplenishmentSaved(true);
    try {
      await saveCustomerReplenishmentData(
        completedOrder?.customerId || autofillCustomer?.id || user?.id,
        completedOrder?.phone || phone,
        {
          frequencyDays: days,
          habitualOrder: completedOrder?.items || [],
          lastOrderDate: new Date().toISOString(),
          orderId: completedOrder?.id,
        }
      );
      window.dispatchEvent(new Event('patitas_replenishment_updated'));
    } catch (err) {
      console.warn('Error saving replenishment:', err);
    }
  };

  const handleCopyBankData = () => {
    const bankText = `Patitas del Sur - Datos de Transferencia:
Banco: ${COMPANY_INFO.bankTransfer.bank}
Tipo: ${COMPANY_INFO.bankTransfer.accountType}
N° Cuenta: ${COMPANY_INFO.bankTransfer.accountNumber}
RUT: ${COMPANY_INFO.bankTransfer.rut}
Titular: ${COMPANY_INFO.bankTransfer.holder}
Email: ${COMPANY_INFO.bankTransfer.email}
Monto: ${formatCLP(completedOrder?.total || total)}
Asunto: Pedido ${completedOrder?.id}`;

    navigator.clipboard.writeText(bankText);
    setCopiedBankData(true);
    setTimeout(() => setCopiedBankData(false), 3000);
  };

  const handleCloseAndFinish = () => {
    setStep('cart');
    setCompletedOrder(null);
    setAppliedCoupon(null);
    setFormError(null);
    handleResetForm();
    onClose();
  };
  handleCloseAndFinishRef.current = handleCloseAndFinish;

  if (!isOpen) return null;

  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 z-[80] overflow-hidden bg-[#FAF8F4] animate-in fade-in duration-200'
          : 'fixed inset-0 z-[80] overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300'
      }
    >
      {!fullScreen && (
        <div
          className="absolute inset-0"
          onClick={step === 'success' ? handleCloseAndFinish : onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={
          fullScreen
            ? 'w-full h-full flex justify-center'
            : 'absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full justify-end pointer-events-none'
        }
      >
        
        {/* Drawer / Full-Screen Panel */}
        <div
          className={
            fullScreen
              ? 'w-full max-w-2xl bg-white sm:shadow-xl sm:border-x sm:border-[#1D1D1F]/8 flex flex-col h-full max-h-full overflow-hidden'
              : 'pointer-events-auto w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 h-full max-h-full overflow-hidden'
          }
        >
          
          {/* ========================================================= */}
          {/* HEADER: Dinámico según el paso                            */}
          {/* ========================================================= */}
          <div className="shrink-0 border-b border-[#1D1D1F]/8 bg-[#FAF8F4]">
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(fullScreen && step === 'cart') && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl hover:bg-[#FEF3C7] text-[#1D1D1F] transition-colors mr-1 cursor-pointer"
                    title="Volver al catálogo"
                    aria-label="Volver al catálogo"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}

                {(step === 'shipping' || step === 'schedule' || step === 'payment') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      if (step === 'shipping') setStep('cart');
                      else if (step === 'schedule') setStep('shipping');
                      else if (step === 'payment') setStep('schedule');
                    }}
                    className="p-1.5 rounded-xl hover:bg-[#FEF3C7] text-[#1D1D1F] transition-colors mr-1 cursor-pointer"
                    title={
                      step === 'shipping'
                        ? 'Volver al carrito'
                        : step === 'schedule'
                          ? 'Volver a datos y dirección'
                          : 'Volver a agenda de despacho'
                    }
                    aria-label="Volver al paso anterior"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}

                {step === 'schedule' ? (
                  <Truck className="w-5 h-5 text-[#D97706]" />
                ) : step === 'payment' ? (
                  <CreditCard className="w-5 h-5 text-[#D97706]" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-[#D97706]" />
                )}

                <h2 className="text-lg sm:text-xl font-black text-[#1D1D1F]">
                  {step === 'cart' && 'Tu Carrito'}
                  {step === 'shipping' && 'Datos y Dirección'}
                  {step === 'schedule' && 'Agenda de Despacho'}
                  {step === 'payment' && 'Método de Pago'}
                  {step === 'success' && '¡Pedido Exitoso!'}
                </h2>

                {step === 'cart' && (
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F5BA13]/40">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={step === 'success' ? handleCloseAndFinish : onClose}
                className="p-2 rounded-full text-slate-500 hover:bg-[#FEF3C7] hover:text-[#1D1D1F] transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Indicador de pasos del checkout (1. Datos → 2. Despacho → 3. Pago) */}
            {(step === 'shipping' || step === 'schedule' || step === 'payment') && (
              <div className="px-4 sm:px-5 pb-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'shipping', num: 1, label: 'Datos' },
                    { key: 'schedule', num: 2, label: 'Despacho' },
                    { key: 'payment', num: 3, label: 'Pago' },
                  ].map((s) => {
                    const stepOrder = { shipping: 1, schedule: 2, payment: 3 };
                    const currentIdx = stepOrder[step] || 1;
                    const isCompleted = s.num < currentIdx;
                    const isCurrent = s.num === currentIdx;
                    const canNavigateBack = isCompleted;

                    return (
                      <button
                        key={s.key}
                        type="button"
                        disabled={!canNavigateBack}
                        onClick={() => {
                          if (!canNavigateBack) return;
                          setFormError(null);
                          setStep(s.key);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all border ${
                          isCurrent
                            ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F] shadow-2xs'
                            : isCompleted
                              ? 'bg-[#FEF3C7] text-[#78350F] border-[#F5BA13]/50 hover:bg-[#FDE68A] cursor-pointer'
                              : 'bg-white/70 text-slate-400 border-slate-200/80 cursor-default'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#F5BA13] text-[#1D1D1F]'
                              : isCompleted
                                ? 'bg-[#1D1D1F] text-[#F5BA13]'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3.5]" /> : s.num}
                        </span>
                        <span className="truncate">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* PASO 1: VISTA DE ÍTEMS Y CARRITO                          */}
          {/* ========================================================= */}
          {step === 'cart' && (
            <>
              {/* Free Shipping Progress Bar */}
              {(() => {
                const isFreeShippingUnlocked = subtotal > 0 && subtotal >= freeShippingThreshold;
                return (
                  <div
                    className={`shrink-0 px-5 sm:px-6 py-3 border-b transition-colors duration-300 ${
                      isFreeShippingUnlocked
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-[#F5BA13]/10 border-[#F5BA13]/15'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between text-xs font-bold mb-1.5 transition-colors duration-300 ${
                        isFreeShippingUnlocked ? 'text-emerald-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isFreeShippingUnlocked ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        )}
                        {isFreeShippingUnlocked
                          ? '¡Envío Gratis desbloqueado!'
                          : `Te faltan ${formatCLP(freeShippingThreshold - subtotal)} para Envío Gratis`}
                      </span>
                      <span className={isFreeShippingUnlocked ? 'text-emerald-700 font-extrabold' : ''}>
                        {Math.round(progressToFreeShipping)}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden transition-colors duration-300 ${
                        isFreeShippingUnlocked ? 'bg-emerald-200/70' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`h-full transition-all duration-500 ${
                          isFreeShippingUnlocked
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : 'bg-gradient-to-r from-[#F5BA13] to-[#D97706]'
                        }`}
                        style={{ width: `${progressToFreeShipping}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Items List */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 py-12">
                    <div className="p-4 rounded-full bg-slate-100">
                      <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold">Tu carrito está vacío por ahora</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-[#F5BA13] text-[#1D1D1F] text-white text-xs font-extrabold hover:bg-[#10B981] transition-colors shadow-md cursor-pointer"
                    >
                      Ir a Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  cartItems.map((item, idx) => {
                    const stockAvail = getItemStock(item);
                    const isOutOfStock = stockAvail <= 0;
                    const isOverStock = stockAvail > 0 && item.quantity > stockAvail;

                    return (
                      <div
                        key={`${item.id}-${item.weight}-${idx}`}
                        className={`relative flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                          isOutOfStock
                            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                            : isOverStock
                            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                            : 'bg-slate-50/90 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {/* Botón Eliminar en la esquina superior derecha */}
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer z-10"
                          title="Eliminar producto"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Imagen del Producto */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 shrink-0 border border-slate-100 shadow-2xs"
                        />

                        {/* Contenido Principal con Ancho Completo */}
                        <div className="flex-1 min-w-0 pr-6">
                          {(() => {
                            const { brand: brandUpper, cleanName } = extractBrandAndCleanName(item);
                            return (
                              <div className="space-y-0.5">
                                {brandUpper && (
                                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate leading-none">
                                    {brandUpper}
                                  </span>
                                )}
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words" title={item.name}>
                                  {cleanName}
                                </h4>
                              </div>
                            );
                          })()}

                          {item.weight && (
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{item.weight}</p>
                          )}

                          {isOutOfStock && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                                ⚠️ Agotado en bodega
                              </span>
                            </div>
                          )}

                          {isOverStock && (
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                                ⚠️ Stock en bodega: {stockAvail} u.
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(idx, stockAvail)}
                                className="text-[10px] font-bold text-amber-700 underline hover:text-amber-900 cursor-pointer"
                              >
                                Ajustar a {stockAvail}
                              </button>
                            </div>
                          )}

                          {/* Fila Inferior: Precio a la izquierda + Selector de Cantidad compacto a la derecha */}
                          <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-200/60">
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-900">
                                {formatCLP(item.price * item.quantity)}
                              </div>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {formatCLP(item.price)} c/u
                                </span>
                              )}
                            </div>

                            {/* Selector de Cantidades Compacto */}
                            <div className={`flex items-center border rounded-xl bg-white text-xs p-0.5 shadow-2xs ${
                              isOutOfStock
                                ? 'border-rose-200 opacity-60'
                                : isOverStock
                                ? 'border-amber-200'
                                : 'border-slate-200'
                            }`}>
                              <button
                                onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                                className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 cursor-pointer text-xs"
                                aria-label="Disminuir cantidad"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold text-slate-900 text-xs">{item.quantity}</span>
                              <button
                                disabled={isOutOfStock || isOverStock || item.quantity >= stockAvail}
                                onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Sección Ecommerce: Seguir Agregando Productos / Cross-sell / Quick Add */}
                {cartItems.length > 0 && (
                  <div className="pt-2 space-y-3">
                    {/* Botón Principal: Seguir Comprando en la Tienda */}
                    <button
                      type="button"
                      onClick={handleContinueShopping}
                      className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-[#F5BA13] bg-slate-50/70 hover:bg-teal-50/40 text-slate-700 hover:text-[#D97706] text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#D97706] transition-transform group-hover:rotate-90 duration-300" />
                      <span>Seguir comprando en la tienda</span>
                    </button>

                    {/* Bloque de Recomendados con Stock ("Completa tu pedido") */}
                    {displayedCrossSellProducts.length > 0 && (
                      <div className="p-3.5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                            <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                              Completa tu pedido
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowQuickSearch(!showQuickSearch)}
                            className="text-[11px] font-bold text-[#D97706] hover:text-teal-700 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Search className="w-3 h-3" />
                            <span>{showQuickSearch ? 'Cerrar búsqueda' : 'Buscar otro'}</span>
                          </button>
                        </div>

                        {/* Buscador Rápido Integrado (Opcional, expandible) */}
                        {showQuickSearch && (
                          <div className="relative pt-1">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={quickSearchQuery}
                              onChange={(e) => setQuickSearchQuery(e.target.value)}
                              placeholder="Buscar por nombre o marca..."
                              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-[#F5BA13] focus:ring-1 focus:ring-[#F5BA13] outline-none text-slate-900 placeholder:text-slate-400 shadow-2xs"
                              autoFocus
                            />
                            {quickSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setQuickSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Lista de productos para agregar en 1 clic */}
                        <div className="space-y-2">
                          {displayedCrossSellProducts.map((p) => {
                            const pStock = typeof p.stock === 'number' ? p.stock : 10;
                            const isJustAdded = addedFeedbackId === p.id;
                            const formatText = (Array.isArray(p.weights) && p.weights[0]) || p.format || '';

                            // Chequear si ya está en el carrito y con qué cantidad
                            const inCartItem = cartItems.find((ci) => ci.id === p.id || ci.name === p.name);
                            const inCartQty = inCartItem?.quantity || 0;
                            const isMaxInCart = inCartQty >= pStock;

                            return (
                              <div
                                key={p.id}
                                className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs transition-all"
                              >
                                <img
                                  src={resolveProductImage(p)}
                                  alt={p.name}
                                  className="w-11 h-11 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0"
                                />
                                {(() => {
                                  const { brand: brandUpper, cleanName } = extractBrandAndCleanName(p);
                                  return (
                                    <div className="flex-1 min-w-0">
                                      {brandUpper && (
                                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate leading-none mb-0.5">
                                          {brandUpper}
                                        </span>
                                      )}
                                      <h5 className="text-xs font-bold text-slate-900 truncate leading-snug" title={p.name}>
                                        {cleanName}
                                      </h5>
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
                                        {formatText && (
                                          <span className="text-[#D97706] font-bold bg-teal-50 px-1 rounded">
                                            {formatText}
                                          </span>
                                        )}
                                        <span className="text-slate-400">·</span>
                                        <span className="text-slate-900 font-black">{formatCLP(p.price)}</span>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Botón Agregar Rápido */}
                                <button
                                  type="button"
                                  disabled={isMaxInCart}
                                  onClick={() => handleQuickAdd(p)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer ${
                                    isJustAdded
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : isMaxInCart
                                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed text-[11px]'
                                      : 'bg-slate-900 hover:bg-[#F5BA13] text-[#1D1D1F] text-white shadow-2xs hover:shadow-xs'
                                  }`}
                                  title={isMaxInCart ? 'Stock máximo ya en tu carrito' : 'Agregar 1 unidad a tu carrito'}
                                >
                                  {isJustAdded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>¡Listo!</span>
                                    </>
                                  ) : isMaxInCart ? (
                                    <span>En carrito ({inCartQty})</span>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Agregar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Cart Summary & Next Step (siempre fijo abajo) */}
              {cartItems.length > 0 && (
                <div className="shrink-0 relative z-10 p-3.5 sm:p-4 border-t border-slate-200/80 bg-slate-50 shadow-[0_-8px_20px_-12px_rgba(29,29,31,0.16)] space-y-2.5 pb-safe">
                  {/* Collapsible Coupon Section */}
                  <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200">
                    {!isCouponExpanded && !appliedCoupon ? (
                      /* Compact Collapsed Trigger */
                      <button
                        type="button"
                        onClick={() => setIsCouponExpanded(true)}
                        className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-600 hover:text-[#D97706] hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 group-hover:text-[#D97706] transition-colors">
                          <Ticket className="w-3.5 h-3.5 text-[#D97706] group-hover:scale-110 transition-transform" />
                          <span>¿Tienes un cupón de convenio?</span>
                        </span>
                        <span className="text-[11px] font-extrabold text-[#D97706] flex items-center gap-0.5 group-hover:underline">
                          <span>Ingresar</span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                        </span>
                      </button>
                    ) : (
                      /* Expanded Coupon Form or Applied Badge */
                      <div className="p-2.5 space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                            <Ticket className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Cupón de descuento o convenio</span>
                          </span>
                          {appliedCoupon ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveCoupon();
                                setIsCouponExpanded(false);
                              }}
                              className="text-red-500 hover:underline font-bold text-[11px] cursor-pointer"
                            >
                              Quitar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCouponExpanded(false);
                                setCouponError(null);
                              }}
                              className="text-slate-400 hover:text-slate-600 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Cerrar</span>
                              <ChevronUp className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <div>
                                <div className="font-black text-emerald-900 flex items-center gap-1.5 text-xs">
                                  <span>{appliedCoupon.code}</span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-1 py-0.2 rounded">
                                    -{appliedCoupon.discountPercent}%
                                  </span>
                                </div>
                                <p className="text-[10px] text-emerald-700">Convenio {appliedCoupon.convenioName}</p>
                              </div>
                            </div>
                            <span className="font-black text-emerald-800 text-xs">
                              -{formatCLP(discountAmount)}
                            </span>
                          </div>
                        ) : (
                          <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Ej: SWD-7K9P"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#F5BA13]"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={isVerifyingCoupon || !couponInput.trim()}
                              className="px-3 py-1.5 bg-[#F5BA13] text-[#1D1D1F] hover:bg-[#10B981] text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {isVerifyingCoupon ? '...' : 'Aplicar'}
                            </button>
                          </form>
                        )}

                        {couponError && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 animate-in fade-in">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{couponError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>{formatCLP(subtotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Descuento ({appliedCoupon.discountPercent}%)
                        </span>
                        <span>-{formatCLP(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-500 py-1">
                      <span className="shrink-0">Envío estimado</span>
                      {isFreeShippingApplicable ? (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 flex items-center gap-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          GRATIS
                        </span>
                      ) : (
                        <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-500 italic bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/70 text-right max-w-[210px] sm:max-w-none leading-tight">
                          Se calculará en el paso siguiente con tu dirección
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-baseline text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                      <div>
                        <span>Total estimado</span>
                        {isFreeShippingApplicable ? (
                          <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Envío gratis desbloqueado
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-medium">
                            * El costo de despacho se calculará al ingresar tu dirección
                          </p>
                        )}
                      </div>
                      <span className={appliedCoupon ? 'text-emerald-700' : 'text-slate-900'}>
                        {formatCLP(cartStepTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Warning banner if out-of-stock items */}
                  {hasOutOfStockItems && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>Hay productos con stock insuficiente en tu carrito. Ajusta la cantidad o elimínalos para poder continuar al despacho.</span>
                    </div>
                  )}

                  {/* Button to proceed to Step 2 */}
                  <button
                    disabled={hasOutOfStockItems}
                    onClick={handleProceedToShipping}
                    className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      hasOutOfStockItems
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 shadow-none cursor-not-allowed opacity-90'
                        : 'bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] hover:text-white shadow-xl shadow-[#F5BA13]/30 font-black active:scale-95 cursor-pointer'
                    }`}
                  >
                    {hasOutOfStockItems ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>PRODUCTOS AGOTADOS EN EL CARRITO</span>
                      </>
                    ) : (
                      <>
                        <span>CONTINUAR AL DESPACHO</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* PASO 1 DEL CHECKOUT: DATOS PERSONALES Y DIRECCIÓN         */}
          {/* ========================================================= */}
          {step === 'shipping' && (
            <div ref={drawerScrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col justify-between">
              <form onSubmit={handleProceedToSchedule} className="space-y-4">
                
                {/* Error Banner */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Sección 1: Datos del Receptor y Dirección */}
                <div className="space-y-2.5 bg-[#FAF8F4] p-3.5 rounded-2xl border border-[#1D1D1F]/10">
                  <h3 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>1. Datos Personales y Dirección</span>
                  </h3>

                  <div className="space-y-2">
                    {/* 1. Teléfono Móvil con Prefijo de País Fijo / Selector Personalizado (ID de Cliente Principal) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <span>Teléfono Móvil (WhatsApp / ID Cliente) *</span>
                        </label>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                          phone.replace(/\D/g, '').length === 9
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {phone.replace(/\D/g, '').length}/9 dígitos
                        </span>
                      </div>
                      <div
                        id="field-phone"
                        className={`relative flex items-center rounded-xl border bg-white transition-all shadow-2xs ${
                          fieldErrors.phone
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40'
                            : 'border border-slate-200 focus-within:border-[#F5BA13] focus-within:ring-2 focus-within:ring-[#F5BA13]/20'
                        }`}
                      >
                        <CountryCodeDropdown
                          value={countryCode}
                          onChange={(code) => setCountryCode(code)}
                        />
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          placeholder="9 5333 2492"
                          value={phone}
                          onChange={(e) => {
                            clearFieldError('phone');
                            handlePhoneChange(e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-transparent text-xs font-mono font-semibold tracking-wider text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none pr-8"
                        />
                        <div className="absolute right-2.5 flex items-center pointer-events-none">
                          {isSearchingCustomer && (
                            <Loader2 className="w-3.5 h-3.5 text-[#D97706] animate-spin" />
                          )}
                          {!isSearchingCustomer && phone.replace(/\D/g, '').length === 9 && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in" />
                          )}
                        </div>
                      </div>
                      {fieldErrors.phone && (
                        <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 pl-0.5">
                        Formato: <strong className="text-slate-600">x xxxx xxxx</strong> (9 dígitos obligatorios). Tu teléfono es tu ID de cliente.
                      </p>

                      {/* Notificación minimalista de cliente reconocido */}
                      {autofillCustomer && (
                        <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200/90 rounded-xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="font-extrabold text-emerald-950 text-xs truncate">
                              ¡Hola, {(autofillCustomer.full_name || autofillCustomer.name || 'Tutor').trim().split(' ')[0]}!
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-600 text-white rounded-full font-black uppercase tracking-wider shrink-0">
                            Club Patitas
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Nombre completo de quien recibe */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nombre completo de quien recibe *
                      </label>
                      <input
                        id="field-recipient-name"
                        type="text"
                        required
                        placeholder="Nombre y apellido"
                        value={recipientName}
                        onChange={(e) => {
                          clearFieldError('recipientName');
                          setRecipientName(e.target.value);
                        }}
                        className={`w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                          fieldErrors.recipientName
                            ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-rose-950'
                            : 'border border-slate-200 focus:border-[#F5BA13]'
                        }`}
                      />
                      {fieldErrors.recipientName && (
                        <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.recipientName}</span>
                        </p>
                      )}
                    </div>

                    {/* Selector de Modo de Entrega: Habitual vs Otra Dirección Hoy */}
                    {savedAddressesList && savedAddressesList.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-bold text-slate-600">
                          ¿Dónde entregamos tu pedido hoy? *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={handleSwitchToHabitual}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              addressMode === 'habitual'
                                ? 'bg-white text-[#D97706] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Home className="w-3.5 h-3.5 shrink-0" />
                            <span>Dirección habitual</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSwitchToTemporary}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              addressMode === 'temporary'
                                ? 'bg-white text-[#D97706] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>Dirección diferente</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Caso A: Dirección Habitual Seleccionada */}
                    {addressMode === 'habitual' && savedAddressesList.length > 0 ? (
                      <div className="space-y-2.5 animate-in fade-in">
                        <div className="p-3 bg-white rounded-2xl border border-[#F5BA13]/45 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shrink-0">
                              <Home className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-[#1D1D1F] whitespace-nowrap">
                              Dirección guardada
                            </span>
                          </div>

                          <div className="pl-9 space-y-0.5">
                            <p className="text-xs font-bold text-[#1D1D1F] leading-snug">
                              {activeSavedAddress?.address}
                              {activeSavedAddress?.depto && (
                                <span className="text-slate-500 font-medium"> ({activeSavedAddress.depto})</span>
                              )}
                            </p>
                            {activeSavedAddress?.city && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                Comuna: <strong className="text-[#1D1D1F]">{activeSavedAddress.city}</strong>
                              </p>
                            )}
                            {activeSavedAddress?.deliveryReference && (
                              <p className="text-[11px] text-slate-500 italic">
                                Ref: "{activeSavedAddress.deliveryReference}"
                              </p>
                            )}
                          </div>

                          {/* Selector si tiene múltiples direcciones guardadas */}
                          {savedAddressesList.length > 1 && (
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Otras guardadas:</span>
                              {savedAddressesList.map((addr) => (
                                <button
                                  key={addr.id}
                                  type="button"
                                  onClick={() => handleSelectSavedAddress(addr.id)}
                                  className={`text-[10.5px] px-2.5 py-0.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                    selectedSavedAddressId === addr.id
                                      ? 'bg-[#1D1D1F] border-[#1D1D1F] text-[#F5BA13] ring-1 ring-[#F5BA13]/40'
                                      : 'bg-[#FAF8F4] border-[#1D1D1F]/12 text-slate-700 hover:border-[#F5BA13]'
                                  }`}
                                >
                                  {addr.label || addr.address}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Caso B: Ingresar Dirección Temporal / Nueva */
                      <div className="space-y-2 animate-in fade-in">
                        {savedAddressesList.length > 0 && (
                          <div className="px-3 py-1.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span>📍</span>
                              <span>Ingresa la dirección donde recibirás el pedido de hoy.</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleSwitchToHabitual}
                              className="text-[10.5px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                            >
                              Volver a habitual
                            </button>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-600">
                            Dirección {savedAddressesList.length > 0 ? 'para este despacho' : ''} (Calle y Número) *
                          </label>
                          <GoogleAddressAutocomplete
                            id="checkout-shipping-address"
                            required
                            placeholder="Calle y número de casa o depto..."
                            value={address}
                            className={fieldErrors.address ? '!border-2 !border-rose-500 !ring-2 !ring-rose-500/20 !bg-rose-50/40 text-rose-950' : ''}
                            onChange={(val) => {
                              clearFieldError('address');
                              setAddress(val);
                              setCustomerCoords(null);
                              const detected = detectCommuneFromAddress(val);
                              if (detected !== city) {
                                setCity(detected || '');
                              }
                            }}
                            onSelect={(item) => {
                              clearFieldError('address');
                              setAddress(item.street);
                              if (item.lat && item.lng) {
                                setCustomerCoords({ lat: item.lat, lng: item.lng });
                              } else {
                                setCustomerCoords(null);
                              }
                              if (item.city) {
                                setCity(item.city);
                              } else {
                                const detected = detectCommuneFromAddress(item.formattedAddress || item.street);
                                setCity(detected || '');
                              }
                            }}
                          />
                          {fieldErrors.address && (
                            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{fieldErrors.address}</span>
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Depto / Casa (Opcional)
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: Depto 402, Casa B (opcional)"
                              value={depto}
                              onChange={(e) => setDepto(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#F5BA13]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Referencia (Opcional)
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: Portón verde, rejas negras"
                              value={deliveryReference}
                              onChange={(e) => setDeliveryReference(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#F5BA13]"
                            />
                          </div>
                        </div>

                        {/* Opción para guardar o no en libreta permanente */}
                        {address.trim().length > 3 && (
                          <div className="pt-1.5 space-y-1.5 bg-white p-2.5 rounded-xl border border-[#1D1D1F]/10">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={saveNewAddressToProfile}
                                onChange={(e) => setSaveNewAddressToProfile(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#D97706] focus:ring-[#F5BA13] cursor-pointer"
                              />
                              <span>Guardar esta dirección para futuras compras</span>
                            </label>
                            {saveNewAddressToProfile && (
                              <input
                                type="text"
                                placeholder="Nombre de esta dirección (ej: Parcela, Oficina, Playa)..."
                                value={newAddressLabel}
                                onChange={(e) => setNewAddressLabel(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#F5BA13]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Aviso cuando la dirección está fuera del círculo de cobertura configurado */}
                    {isOutOfDeliveryZone && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300/90 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-black text-amber-950 leading-snug">
                              Dirección fuera del radio de despacho web
                            </h4>
                            <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed">
                              {deliveryCoverageEval.distanceKm
                                ? `Tu ubicación se encuentra a ~${deliveryCoverageEval.distanceKm.toFixed(1)} km de nuestra bodega central en Frutillar (radio automático actual: hasta ${deliveryCoverageEval.maxRadiusKm || 8} km).`
                                : `Tu dirección se encuentra fuera del círculo actual de despacho automático (hasta ${deliveryCoverageEval.maxRadiusKm || 8} km desde nuestra bodega en Frutillar).`}{' '}
                              Escríbenos por WhatsApp para consultar si podemos coordinar el envío a tu domicilio.
                            </p>
                          </div>
                        </div>
                        <a
                          href={outOfZoneWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4 shrink-0" />
                          <span>Consultar despacho por WhatsApp</span>
                        </a>
                      </div>
                    )}

                  </div>
                </div>

                {hasOutOfStockItems && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Tu carrito contiene artículos agotados en bodega. Regresa al carrito para eliminarlos antes de continuar.</span>
                  </div>
                )}

                {isOutOfDeliveryZone ? (
                  <a
                    href={outOfZoneWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/25 transition-all active:scale-95 cursor-pointer text-center"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>CONSULTAR DESPACHO POR WHATSAPP</span>
                  </a>
                ) : (
                  <button
                    type="submit"
                    disabled={hasOutOfStockItems}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      hasOutOfStockItems
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed shadow-none opacity-90'
                        : 'bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] hover:text-white shadow-xl shadow-[#F5BA13]/30 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <span>ELEGIR DÍA Y HORARIO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 2 DEL CHECKOUT: AGENDA DE DESPACHO (DÍA Y HORARIO)   */}
          {/* ========================================================= */}
          {step === 'schedule' && (
            <div ref={drawerScrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col justify-between">
              <CartScheduleStep
                address={address}
                depto={depto}
                city={city}
                matchedDispatchZone={matchedDispatchZone}
                availableDeliveryDates={availableDeliveryDates}
                deliveryDate={deliveryDate}
                selectedDateObj={selectedDateObj}
                onSelectDate={(val) => {
                  clearFieldError('deliveryDate');
                  if (selectedDateObj?.dayOfWeek === 0 || selectedSlotData?.isSundayOnly) {
                    setDeliverySlot('');
                  }
                  setDeliveryDate(val);
                }}
                availableSlots={availableSlots}
                deliverySlot={deliverySlot}
                selectedSlotData={selectedSlotData}
                recommendedSlotValue={smartScheduleEval?.recommendedSlotValue}
                onSelectSlot={(val) => {
                  clearFieldError('deliverySlot');
                  setDeliverySlot(val);
                }}
                smartScheduleEval={smartScheduleEval}
                isSpecialDeliveryDay={isSpecialDeliveryDay}
                zoneBaseFee={zoneBaseFee}
                effectiveBaseFee={effectiveBaseFee}
                freeShippingThreshold={freeShippingThreshold}
                subtotal={subtotal}
                calculatedShippingCost={calculatedShippingCost}
                shippingStepTotal={shippingStepTotal}
                fieldErrors={fieldErrors}
                formError={formError}
                onEditAddress={() => {
                  setFormError(null);
                  setStep('shipping');
                }}
                onContinueToPayment={handleProceedToPayment}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 3 DEL CHECKOUT: MÉTODO DE PAGO Y CONFIRMACIÓN        */}
          {/* ========================================================= */}
          {step === 'payment' && (
            <div ref={drawerScrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col justify-between">
              <form onSubmit={handleConfirmOrder} className="space-y-4 animate-in fade-in duration-200">
                {/* Resumen compacto de entrega y agenda confirmada */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#1D1D1F]/10 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Entrega para {recipientName || 'Cliente'}
                        </p>
                        <p className="text-xs font-bold text-[#1D1D1F] leading-snug break-words">
                          {address}
                          {depto ? ` (${depto})` : ''}
                          {city ? `, ${city}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setStep('shipping');
                      }}
                      className="text-[10.5px] font-extrabold text-[#B45309] hover:text-[#1D1D1F] hover:underline shrink-0 cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#1D1D1F]/8 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Calendar className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Despacho agendado
                        </p>
                        <p className="text-xs font-bold text-[#1D1D1F] leading-snug">
                          {selectedDateObj?.label || deliveryDate}
                        </p>
                        <p className="text-[11px] font-semibold text-[#B45309]">
                          {deliverySlot}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setStep('schedule');
                      }}
                      className="text-[10.5px] font-extrabold text-[#B45309] hover:text-[#1D1D1F] hover:underline shrink-0 cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>

                {/* Sección 3: Selección de Modalidad y Método de Pago */}
                <div className="space-y-3 bg-[#FAF8F4] p-3.5 rounded-2xl border border-[#1D1D1F]/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>3. Método de Pago</span>
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        paymentType === 'anticipado'
                          ? 'bg-[#009EE3]/10 text-[#007EB5] border-[#009EE3]/30'
                          : 'bg-[#FEF3C7] text-[#78350F] border-[#F5BA13]/40'
                      }`}
                    >
                      {paymentType === 'anticipado' ? '💳 Mercado Pago' : '🚚 Paga al Recibir'}
                    </span>
                  </div>

                  {/* Selector previo: Modalidad de Pago (Paga Ahora vs Paga al Recibir) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      ¿Cuándo y cómo deseas pagar? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Opción A: Paga Ahora (Mercado Pago) */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentType('anticipado')}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentType === 'anticipado'
                            ? 'bg-white border-[#009EE3] shadow-xs ring-2 ring-[#009EE3]/20'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Globe className={`w-3.5 h-3.5 ${paymentType === 'anticipado' ? 'text-[#009EE3]' : 'text-slate-400'}`} />
                          <span className={`text-xs font-black ${paymentType === 'anticipado' ? 'text-[#002E6E]' : 'text-slate-700'}`}>
                            Paga Ahora
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          Vía Mercado Pago (Débito/Crédito)
                        </p>
                      </button>

                      {/* Opción B: Paga al Recibir */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentType('contra_entrega')}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentType === 'contra_entrega'
                            ? 'bg-white border-[#F5BA13] shadow-xs ring-2 ring-[#F5BA13]/20'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Truck className={`w-3.5 h-3.5 ${paymentType === 'contra_entrega' ? 'text-[#D97706]' : 'text-slate-400'}`} />
                          <span className={`text-xs font-black ${paymentType === 'contra_entrega' ? 'text-slate-900' : 'text-slate-700'}`}>
                            Paga al Recibir
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          Al recibir en tu domicilio
                        </p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resumen Total y Confirmación */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatCLP(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-xs font-bold text-emerald-700">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Despacho {city ? `(${city})` : ''}</span>
                    </span>
                    {isOutOfDeliveryZone ? (
                      <span className="text-[11px] font-bold text-rose-600">
                        Fuera del radio ({deliveryCoverageEval.maxRadiusKm || 8} km)
                      </span>
                    ) : hasShippingAddress ? (
                      <span className={`font-bold ${calculatedShippingCost === 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-900'}`}>
                        {calculatedShippingCost === 0 ? 'GRATIS' : formatCLP(calculatedShippingCost)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 italic">
                        Ingresa tu dirección para calcular
                      </span>
                    )}
                  </div>

                  {hasShippingAddress && !isOutOfDeliveryZone && isFreeShippingExcluded && subtotal >= freeShippingThreshold && (
                    <div className="py-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200/90 text-[10.5px] text-amber-950 font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>
                        {selectedSlotData?.isUrgent
                          ? selectedDateObj?.dayOfWeek === 0
                            ? `Domingo · Pedido Urgente (10:00 a 20:00 hrs): los domingos no hay reparto estándar, se aplica tarifa fija de ${formatCLP(effectiveBaseFee)} (sin envío gratis).`
                            : `Pedido Urgente (fuera de ventana): se cobra despacho obligatorio (${formatCLP(effectiveBaseFee)}) aunque el pedido supere los ${formatCLP(freeShippingThreshold)}.`
                          : isSpecialDeliveryDay && matchedDispatchZone?.specialDayNoFreeShipping
                            ? `Tarifa especial para el día ${selectedDateObj?.label?.split(' - ').pop() || 'seleccionado'}: no aplica envío gratis.`
                            : 'El horario seleccionado tiene condiciones especiales: no aplica envío gratis.'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total a Pagar</span>
                    <span className="text-[#D97706]">{formatCLP(isOutOfDeliveryZone ? cartStepTotal : shippingStepTotal)}</span>
                  </div>
                </div>

                {hasOutOfStockItems && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Tu carrito contiene artículos agotados en bodega. Regresa al paso anterior para eliminarlos antes de confirmar.</span>
                  </div>
                )}

                {/* Banner de error visible directamente sobre el botón de confirmación */}
                {formError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in shadow-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Botón Final de Envío o Contacto por WhatsApp si está fuera del círculo */}
                {isOutOfDeliveryZone ? (
                  <a
                    href={outOfZoneWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/25 transition-all active:scale-95 cursor-pointer text-center"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>CONSULTAR DESPACHO POR WHATSAPP</span>
                  </a>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || hasOutOfStockItems}
                    className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all ${
                      hasOutOfStockItems
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed shadow-none opacity-90'
                        : paymentType === 'anticipado'
                          ? 'bg-[#009EE3] hover:bg-[#008AD0] text-white shadow-xl shadow-[#009EE3]/30 active:scale-95 cursor-pointer disabled:opacity-50'
                          : 'bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] hover:text-white shadow-xl shadow-[#F5BA13]/30 active:scale-95 cursor-pointer disabled:opacity-50'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {paymentType === 'anticipado'
                            ? 'REDIRIGIENDO A MERCADO PAGO...'
                            : 'REGISTRANDO ORDEN EN BASE DE DATOS...'}
                        </span>
                      </>
                    ) : hasOutOfStockItems ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>HAY PRODUCTOS AGOTADOS</span>
                      </>
                    ) : paymentType === 'anticipado' ? (
                      <>
                        <span>PAGAR CON MERCADO PAGO</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    ) : (
                      <>
                        <span>CONFIRMAR Y FINALIZAR PEDIDO</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 3: CONFIRMACIÓN DE COMPRA EXITOSA (MODERNA, SIN ALERT) */}
          {/* ========================================================= */}
          {step === 'success' && completedOrder && (
            <CartSuccessStep
              completedOrder={completedOrder}
              copiedBankData={copiedBankData}
              onCopyBankData={handleCopyBankData}
              replenishmentSaved={replenishmentSaved}
              selectedReplenishFrequency={selectedReplenishFrequency}
              onSaveReplenishment={handleSaveReplenishment}
              onCloseAndFinish={handleCloseAndFinish}
            />
          )}

        </div>
      </div>
    </div>
  );
}
