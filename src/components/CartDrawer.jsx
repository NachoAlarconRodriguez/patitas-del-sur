import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Search,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Ticket,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  CreditCard,
  Landmark,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Copy,
  CheckCircle2,
  Banknote,
  Globe,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { verifyCouponInSupabase, redeemCouponInSupabase } from '../services/conveniosService';
import { createOrderInSupabase, getNextOrderId } from '../services/ordersService';
import {
  updateCustomerPoints,
  getCustomerByPhone,
  upsertCustomerProfile,
  saveCustomerReplenishmentData,
} from '../services/customersService';
import { updateProductInSupabase, fetchProductsFromSupabase } from '../services/productsService';
import { markCouponAsUsed, getLoyaltySettings } from '../services/loyaltyService';
import { supabase } from '../lib/supabase';
import GoogleAddressAutocomplete from './GoogleAddressAutocomplete';
import CustomDropdown from './CustomDropdown';
import CountryCodeDropdown from './CountryCodeDropdown';
import {
  ALLOWED_COMMUNES,
  detectCommuneFromAddress,
  CENTRAL_HUB,
  TOWN_COORDINATES,
  calculateHaversineDistance,
} from '../services/googleMapsService';
import {
  getDispatchZonesFromSupabase,
  getDeliverySchedulesFromSupabase,
  getSlotsForCity,
  DEFAULT_DELIVERY_SCHEDULES,
} from '../services/dispatchService';

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
}) {
  const navigate = useNavigate();

  // Navigation step inside drawer: 'cart' | 'shipping' | 'success'
  const [step, setStep] = useState('cart');

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

  const getItemStock = (item) => {
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
  };

  // Auto-ajustar cantidades en el carrito al stock real disponible en bodega si excede
  useEffect(() => {
    if (Object.keys(liveStockMap).length === 0 || cartItems.length === 0) return;
    cartItems.forEach((item, idx) => {
      const avail = getItemStock(item);
      if (avail > 0 && item.quantity > avail) {
        onUpdateQuantity(idx, avail);
      }
    });
  }, [liveStockMap, cartItems.length]);

  const hasOutOfStockItems = useMemo(() => {
    return cartItems.some((item) => {
      const avail = getItemStock(item);
      return avail <= 0 || item.quantity > avail;
    });
  }, [cartItems, liveStockMap]);

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
      setAddressMode('habitual');
    }
  };

  const handleSwitchToTemporary = () => {
    setAddressMode('temporary');
    setAddress('');
    setCity('');
    setDepto('');
    setDeliveryReference('');
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

  // Auto-cargar datos del cliente guardados en perfil al entrar al paso de despacho
  useEffect(() => {
    if (isOpen && step === 'shipping') {
      try {
        const raw =
          localStorage.getItem('patitas_customer_profile') ||
          localStorage.getItem('patitas_pwa_session');
        if (raw) {
          const profile = JSON.parse(raw);
          if (profile.phone && !phone) {
            handlePhoneChange(profile.phone);
          } else if (profile) {
            if (!recipientName && (profile.name || profile.full_name)) {
              setRecipientName(profile.name || profile.full_name);
            }
            if (!address && profile.address) {
              setAddress(profile.address);
            }
            if (!city && profile.city) {
              setCity(profile.city);
            }
            if (!depto && (profile.depto || profile.dept)) {
              setDepto(profile.depto || profile.dept);
            }
            if (!deliveryReference && (profile.delivery_reference || profile.notes || profile.deliveryReference)) {
              setDeliveryReference(profile.delivery_reference || profile.notes || profile.deliveryReference);
            }
            if (!email && profile.email) {
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
  const [paymentType, setPaymentType] = useState('anticipado'); // 'anticipado' (Mercado Pago) | 'contra_entrega' (Al recibir)
  const [paymentMethod, setPaymentMethod] = useState('tarjeta'); // 'tarjeta' (Mercado Pago) | 'transferencia_entrega' | 'efectivo' | 'pos'
  const [cashChangeNote, setCashChangeNote] = useState(''); // Opcional: con cuánto paga en efectivo
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
      if (paymentMethod === 'tarjeta' || paymentMethod === 'transferencia') {
        setPaymentMethod('transferencia_entrega');
      }
    }
  };

  // Delivery Schedules cargados desde Supabase
  const [deliverySchedules, setDeliverySchedules] = useState(DEFAULT_DELIVERY_SCHEDULES);

  useEffect(() => {
    getDeliverySchedulesFromSupabase().then((schedules) => {
      if (Array.isArray(schedules) && schedules.length > 0) {
        setDeliverySchedules(schedules);
      }
    });

    const handleSchedulesUpdated = (e) => {
      if (Array.isArray(e.detail)) {
        setDeliverySchedules(e.detail);
      }
    };
    window.addEventListener('patitas_delivery_schedules_updated', handleSchedulesUpdated);
    return () => {
      window.removeEventListener('patitas_delivery_schedules_updated', handleSchedulesUpdated);
    };
  }, []);

  // Opciones de horarios calculadas dinámicamente según la comuna/ciudad seleccionada
  const availableSlots = useMemo(() => {
    if (!city) return [];
    return getSlotsForCity(city, deliverySchedules);
  }, [city, deliverySchedules]);

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
    setAutofillCustomer(null);
    setFormError(null);
  };

  // Reset coupon and step if cart is emptied externally
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'success') {
      setAppliedCoupon(null);
      setCouponError(null);
      setStep('cart');
    }
  }, [cartItems, step]);

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

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

  // Resolución de zona de despacho según dirección, coordenadas y comuna detectada
  const matchedDispatchZone = useMemo(() => {
    if (activeDispatchZones.length === 0) return null;

    // 1. Si tenemos coordenadas exactas del autocompletado de Google Maps
    if (customerCoords && customerCoords.lat && customerCoords.lng) {
      const dist = calculateHaversineDistance(
        CENTRAL_HUB.lat,
        CENTRAL_HUB.lng,
        customerCoords.lat,
        customerCoords.lng
      );
      const sorted = [...activeDispatchZones].sort((a, b) => (a.radiusMaxKm || 0) - (b.radiusMaxKm || 0));
      const matched = sorted.find((z) => dist <= (z.radiusMaxKm ?? 999));
      if (matched) return { ...matched, distanceKm: dist };
    }

    // 2. Si tenemos comuna detectada (city)
    const effectiveCity = city || (address ? detectCommuneFromAddress(address) : null);
    if (effectiveCity) {
      const normCity = effectiveCity.toLowerCase().trim();
      const matchedByName = activeDispatchZones.find(
        (z) =>
          z.name?.toLowerCase().trim() === normCity ||
          z.name?.toLowerCase().includes(normCity) ||
          normCity.includes(z.name?.toLowerCase().trim()) ||
          z.coverage?.toLowerCase().includes(normCity)
      );
      if (matchedByName) return matchedByName;

      const refCoords = TOWN_COORDINATES[effectiveCity];
      if (refCoords) {
        const dist = calculateHaversineDistance(
          CENTRAL_HUB.lat,
          CENTRAL_HUB.lng,
          refCoords.lat,
          refCoords.lng
        );
        const sorted = [...activeDispatchZones].sort((a, b) => (a.radiusMaxKm || 0) - (b.radiusMaxKm || 0));
        const matchedRadius = sorted.find((z) => dist <= (z.radiusMaxKm ?? 999));
        if (matchedRadius) return { ...matchedRadius, distanceKm: dist };
      }
    }

    return activeDispatchZones[0] || null;
  }, [activeDispatchZones, customerCoords, city, address]);

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

  // Tarifa base de despacho configurada en el panel de administración
  const zoneBaseFee = useMemo(() => {
    if (matchedDispatchZone && matchedDispatchZone.baseFee !== undefined) {
      return Number(matchedDispatchZone.baseFee) || 0;
    }
    if (activeDispatchZones.length > 0 && activeDispatchZones[0].baseFee !== undefined) {
      return Number(activeDispatchZones[0].baseFee) || 0;
    }
    return 2000;
  }, [matchedDispatchZone, activeDispatchZones]);

  // Determinar si ya se ingresó la dirección de despacho
  const hasShippingAddress = Boolean(address.trim() && (city || detectCommuneFromAddress(address)));

  // Costo efectivo de despacho: gratuito si supera el umbral, si no la tarifa base configurada
  const isFreeShippingApplicable = subtotal >= freeShippingThreshold;
  const calculatedShippingCost = isFreeShippingApplicable ? 0 : zoneBaseFee;

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
        const { data: redemption, error: redErr } = await supabase
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

  // Validate step 1 to proceed to shipping
  const handleProceedToShipping = () => {
    if (cartItems.length === 0) return;
    if (hasOutOfStockItems) {
      setFormError('Por favor elimina los productos agotados de tu carrito antes de continuar.');
      return;
    }
    setFormError(null);
    setStep('shipping');
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

    const errors = {};
    let firstErrorField = null;

    // Validate fields: Phone is Customer ID and mandatory first field
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
    if (!deliverySlot) {
      errors.deliverySlot = 'Por favor selecciona el horario preferido de entrega.';
      if (!firstErrorField) {
        firstErrorField = addressMode === 'habitual'
          ? 'field-delivery-slot-habitual'
          : 'field-delivery-slot-temporary';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorMessage = Object.values(errors)[0];
      setFormError(firstErrorMessage);

      if (firstErrorField) {
        setTimeout(() => {
          const el = document.getElementById(firstErrorField);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const focusTarget = el.querySelector('input, button') || (typeof el.focus === 'function' ? el : null);
            if (focusTarget && typeof focusTarget.focus === 'function') {
              focusTarget.focus({ preventScroll: true });
            }
          }
        }, 80);
      }
      return;
    }

    const fullPhone = phone.trim().startsWith('+')
      ? phone.trim()
      : `${countryCode} ${phone.trim()}`;

    setIsSubmitting(true);

    const orderId = await getNextOrderId();
    const seqMatch = String(orderId).match(/PED-(\d+)/i);
    const seqNum = seqMatch ? seqMatch[1] : '0001';
    const pointsEarned = Math.floor(total / 1000); // 1 Punto por cada $1.000 CLP gastados
    const fullAddress = depto.trim() ? `${address.trim()}, Depto/Casa ${depto.trim()}` : address.trim();

    let finalPaymentMethodLabel = 'Tarjeta Débito / Crédito (Mercado Pago)';
    if (paymentType === 'contra_entrega') {
      if (paymentMethod === 'efectivo') {
        finalPaymentMethodLabel = 'Efectivo (Contra Entrega)';
      } else if (paymentMethod === 'pos') {
        finalPaymentMethodLabel = 'Tarjeta al Recibir (POS Móvil)';
      } else {
        finalPaymentMethodLabel = 'Transferencia Bancaria al Recibir';
      }
    } else {
      finalPaymentMethodLabel = 'Tarjeta Débito / Crédito (Mercado Pago)';
    }

    let notesText = deliveryReference.trim() ? `Referencia: ${deliveryReference.trim()}` : 'Pedido desde la web';
    if (paymentType === 'contra_entrega' && paymentMethod === 'efectivo' && cashChangeNote.trim()) {
      notesText += ` · Pago Efectivo: ${cashChangeNote.trim()}`;
    }

    const orderPayload = {
      id: orderId,
      customerId: user?.id || null,
      customerName: recipientName.trim(),
      customerEmail: email.trim() || user?.email || null,
      customerPhone: fullPhone,
      channel: 'web',
      paymentMethod: finalPaymentMethodLabel,
      paymentStatus: paymentType === 'anticipado' && paymentMethod === 'tarjeta' ? 'pagado' : 'pendiente',
      status: 'en_preparacion',
      subtotal,
      shippingCost,
      discount: discountAmount,
      total,
      pointsEarned,
      deliveryDayText: 'Hoy Mismo',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliverySlot: deliverySlot,
      address: fullAddress,
      city: effectiveCity,
      deliveryZone: matchedDispatchZone ? `Zona ${matchedDispatchZone.name}` : `Zona Despacho: ${effectiveCity}`,
      agreementUsed: appliedCoupon ? `${appliedCoupon.convenioName} (${appliedCoupon.code})` : null,
      couponCodeUsed: appliedCoupon ? appliedCoupon.code : null,
      notes: notesText,
      invoiceNumber: `BOL-2026-${seqNum}`,
    };

    try {
      // 1. Guardar orden e ítems en Supabase
      const result = await createOrderInSupabase(orderPayload, cartItems);
      if (!result.success) {
        throw new Error(result.error?.message || 'Error registrando el pedido en base de datos');
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
      if (appliedCoupon) {
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

      // 3. Sumar puntos acumulados al cliente (1 punto por cada $1.000 gastados)
      // Solo si el pago ya está aprobado (ej. tarjeta online inmediata). Si queda pendiente, se sumarán al validar el pago en administración.
      const isPaymentApproved = orderPayload.paymentStatus === 'pagado';
      if (savedCustId && pointsEarned > 0 && isPaymentApproved) {
        try {
          await updateCustomerPoints(savedCustId, pointsEarned);
        } catch (ptsErr) {
          console.warn('Error updating customer points:', ptsErr);
        }
      }

      // 4. Emitir eventos globales de sincronización
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

      // Set order result and switch to modern success screen
      setCompletedOrder({
        id: orderId,
        total,
        pointsEarned,
        recipientName: recipientName.trim(),
        phone: (phone || user?.phone || '').trim(),
        customerId: savedCustId,
        address: fullAddress,
        city: effectiveCity,
        deliverySlot,
        paymentMethod: finalPaymentMethodLabel,
        paymentType,
        specificMethod: paymentMethod,
        cashChangeNote: cashChangeNote.trim(),
        itemsCount: cartItems.length,
        items: orderedItems,
        hasFoodItem,
      });

      setReplenishmentSaved(false);
      setSelectedReplenishFrequency(30);

      // Guardar automáticamente como pedido habitual por defecto si tiene alimentos
      if (hasFoodItem && (savedCustId || phone)) {
        saveCustomerReplenishmentData(savedCustId, phone, {
          frequencyDays: 30,
          habitualOrder: orderedItems,
          lastOrderDate: new Date().toISOString(),
          orderId,
        }).catch((err) => console.warn('Replenishment auto-save warning:', err));
      }

      if (onClearCart) {
        onClearCart();
      }

      setStep('success');
    } catch (err) {
      console.error('Error during checkout process:', err);
      setFormError('Hubo un inconveniente al procesar tu pedido. Por favor intenta nuevamente.');
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
Banco: Banco de Chile
Tipo: Cuenta Corriente
N° Cuenta: 00-123-45678-09
RUT: 77.892.451-2
Titular: Comercial Kira SpA
Email: pagos@patitasdelsur.cl
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full justify-end">
        
        {/* Drawer Panel */}
        <div className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 h-full">
          
          {/* ========================================================= */}
          {/* HEADER: Dinámico según el paso                            */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              {step === 'shipping' && (
                <button
                  onClick={() => setStep('cart')}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-700 transition-colors mr-1 cursor-pointer"
                  title="Volver al carrito"
                  aria-label="Volver al carrito"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <ShoppingBag className="w-5 h-5 text-[#0E8388]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {step === 'cart' && 'Tu Carrito'}
                {step === 'shipping' && 'Despacho & Pago'}
                {step === 'success' && '¡Pedido Exitoso!'}
              </h2>

              {step === 'cart' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                  {cartItems.length} items
                </span>
              )}
            </div>

            <button
              onClick={step === 'success' ? handleCloseAndFinish : onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================= */}
          {/* PASO 1: VISTA DE ÍTEMS Y CARRITO                          */}
          {/* ========================================================= */}
          {step === 'cart' && (
            <>
              {/* Free Shipping Progress Bar */}
              <div className="bg-[#0E8388]/5 px-5 sm:px-6 py-3 border-b border-[#0E8388]/10">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#0E8388]" />
                    {subtotal >= freeShippingThreshold
                      ? '¡Envío Gratis desbloqueado!'
                      : `Te faltan ${formatCLP(freeShippingThreshold - subtotal)} para Envío Gratis`}
                  </span>
                  <span>{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0E8388] to-[#10B981] transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 py-12">
                    <div className="p-4 rounded-full bg-slate-100">
                      <ShoppingBag className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold">Tu carrito está vacío por ahora</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-[#0E8388] text-white text-xs font-extrabold hover:bg-[#10B981] transition-colors shadow-md cursor-pointer"
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
                      className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-[#0E8388] bg-slate-50/70 hover:bg-teal-50/40 text-slate-700 hover:text-[#0E8388] text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#0E8388] transition-transform group-hover:rotate-90 duration-300" />
                      <span>Seguir comprando en la tienda</span>
                    </button>

                    {/* Bloque de Recomendados con Stock ("Completa tu pedido") */}
                    {displayedCrossSellProducts.length > 0 && (
                      <div className="p-3.5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#0E8388]" />
                            <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                              Completa tu pedido
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowQuickSearch(!showQuickSearch)}
                            className="text-[11px] font-bold text-[#0E8388] hover:text-teal-700 flex items-center gap-1 hover:underline cursor-pointer"
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
                              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-[#0E8388] focus:ring-1 focus:ring-[#0E8388] outline-none text-slate-900 placeholder:text-slate-400 shadow-2xs"
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
                                          <span className="text-[#0E8388] font-bold bg-teal-50 px-1 rounded">
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
                                      : 'bg-slate-900 hover:bg-[#0E8388] text-white shadow-2xs hover:shadow-xs'
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

              {/* Footer Cart Summary & Next Step */}
              {cartItems.length > 0 && (
                <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 space-y-2.5 pb-safe">
                  {/* Collapsible Coupon Section */}
                  <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200">
                    {!isCouponExpanded && !appliedCoupon ? (
                      /* Compact Collapsed Trigger */
                      <button
                        type="button"
                        onClick={() => setIsCouponExpanded(true)}
                        className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-600 hover:text-[#0E8388] hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 group-hover:text-[#0E8388] transition-colors">
                          <Ticket className="w-3.5 h-3.5 text-[#0E8388] group-hover:scale-110 transition-transform" />
                          <span>¿Tienes un cupón de convenio?</span>
                        </span>
                        <span className="text-[11px] font-extrabold text-[#0E8388] flex items-center gap-0.5 group-hover:underline">
                          <span>Ingresar</span>
                          <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                        </span>
                      </button>
                    ) : (
                      /* Expanded Coupon Form or Applied Badge */
                      <div className="p-2.5 space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                            <Ticket className="w-3.5 h-3.5 text-[#0E8388]" />
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
                              className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={isVerifyingCoupon || !couponInput.trim()}
                              className="px-3 py-1.5 bg-[#0E8388] hover:bg-[#10B981] text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
                        : 'bg-[#0E8388] hover:bg-[#10B981] text-white shadow-xl shadow-[#0E8388]/30 active:scale-95 cursor-pointer'
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
          {/* PASO 2: FORMULARIO DE DESPACHO Y MÉTODO DE PAGO          */}
          {/* ========================================================= */}
          {step === 'shipping' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between">
              <form onSubmit={handleConfirmOrder} className="space-y-4">
                
                {/* Error Banner */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Sección 1: Datos del Receptor */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0E8388]" />
                    <span>1. Datos de Entrega</span>
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
                            : 'border border-slate-200 focus-within:border-[#0E8388] focus-within:ring-2 focus-within:ring-[#0E8388]/20'
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
                            <Loader2 className="w-3.5 h-3.5 text-[#0E8388] animate-spin" />
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

                      {/* Notificación de Beneficio Club Patitas y Datos Auto-completados */}
                      {autofillCustomer && (
                        <div className="mt-2 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2.5 shadow-2xs animate-in fade-in slide-in-from-top-1">
                          <div className="w-6 h-6 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <p className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                                <span>¡Hola, {(autofillCustomer.full_name || autofillCustomer.name || 'Tutor').trim().split(' ')[0]}!</span>
                                <span className="text-[10.5px] text-emerald-700 font-bold">Sumas puntos con esta compra ✨</span>
                              </p>
                              <span className="text-[9px] px-2 py-0.5 bg-emerald-600 text-white rounded-full font-black uppercase tracking-wider shadow-2xs">
                                Club Patitas
                              </span>
                            </div>
                            <p className="text-emerald-800/90 text-[10.5px] mt-0.5 font-medium leading-relaxed">
                              Tus datos se rellenaron automáticamente. Cada compra acumula puntos canjeables por descuentos en tus próximos pedidos.
                            </p>
                          </div>
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
                            : 'border border-slate-200 focus:border-[#0E8388]'
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
                                ? 'bg-white text-[#0E8388] shadow-xs'
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
                                ? 'bg-white text-[#0E8388] shadow-xs'
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
                        <div className="p-3 bg-white rounded-2xl border border-teal-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                              <Home className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-slate-800 whitespace-nowrap">
                              Dirección guardada
                            </span>
                          </div>

                          <div className="pl-9 space-y-0.5">
                            <p className="text-xs font-bold text-slate-800 leading-snug">
                              {activeSavedAddress?.address}
                              {activeSavedAddress?.depto && (
                                <span className="text-slate-500 font-medium"> ({activeSavedAddress.depto})</span>
                              )}
                            </p>
                            {activeSavedAddress?.city && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                Comuna: <strong className="text-slate-700">{activeSavedAddress.city}</strong>
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
                                  className={`text-[10.5px] px-2 py-0.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                    selectedSavedAddressId === addr.id
                                      ? 'bg-teal-50 border-teal-300 text-teal-900 ring-1 ring-teal-200'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                  }`}
                                >
                                  {addr.label || addr.address}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Horario Preferido */}
                        <div id="field-delivery-slot-habitual">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Horario Preferido *
                          </label>
                          <CustomDropdown
                            id="delivery-slot-dropdown-habitual"
                            value={deliverySlot}
                            options={availableSlots}
                            onChange={(val) => {
                              clearFieldError('deliverySlot');
                              setDeliverySlot(val);
                            }}
                            placeholder={!city ? 'Primero indica dirección...' : 'Seleccionar horario...'}
                            disabled={!city}
                            buttonClassName={`w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold focus:outline-none text-left flex items-center justify-between transition-all ${
                              fieldErrors.deliverySlot
                                ? '!border-2 !border-rose-500 !ring-2 !ring-rose-500/20 !bg-rose-50/40 text-rose-950'
                                : 'border border-slate-200 focus:border-[#0E8388]'
                            }`}
                            usePortal={true}
                          />
                          {fieldErrors.deliverySlot && (
                            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{fieldErrors.deliverySlot}</span>
                            </p>
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
                              const detected = detectCommuneFromAddress(val);
                              if (detected && detected !== city) {
                                setCity(detected);
                              }
                            }}
                            onSelect={(item) => {
                              clearFieldError('address');
                              setAddress(item.street);
                              if (item.lat && item.lng) {
                                setCustomerCoords({ lat: item.lat, lng: item.lng });
                              }
                              if (item.city) {
                                setCity(item.city);
                              } else {
                                const detected = detectCommuneFromAddress(item.formattedAddress || item.street);
                                if (detected) setCity(detected);
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
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                            />
                          </div>

                          <div id="field-delivery-slot-temporary">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Horario Preferido *
                            </label>
                            <CustomDropdown
                              id="delivery-slot-dropdown-temporary"
                              value={deliverySlot}
                              options={availableSlots}
                              onChange={(val) => {
                                clearFieldError('deliverySlot');
                                setDeliverySlot(val);
                              }}
                              placeholder={!city ? 'Primero indica dirección...' : 'Seleccionar horario...'}
                              disabled={!city}
                              buttonClassName={`w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold focus:outline-none text-left flex items-center justify-between transition-all ${
                                fieldErrors.deliverySlot
                                  ? '!border-2 !border-rose-500 !ring-2 !ring-rose-500/20 !bg-rose-50/40 text-rose-950'
                                  : 'border border-slate-200 focus:border-[#0E8388]'
                              }`}
                              usePortal={true}
                            />
                            {fieldErrors.deliverySlot && (
                              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{fieldErrors.deliverySlot}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Referencia para el despachador (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Indicaciones para el despachador (opcional)"
                            value={deliveryReference}
                            onChange={(e) => setDeliveryReference(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                          />
                        </div>

                        {/* Opción para guardar o no en libreta permanente */}
                        {address.trim().length > 3 && (
                          <div className="pt-1.5 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={saveNewAddressToProfile}
                                onChange={(e) => setSaveNewAddressToProfile(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#0E8388] focus:ring-[#0E8388] cursor-pointer"
                              />
                              <span>Guardar esta dirección para futuras compras</span>
                            </label>
                            {saveNewAddressToProfile && (
                              <input
                                type="text"
                                placeholder="Nombre de esta dirección (ej: Parcela, Oficina, Playa)..."
                                value={newAddressLabel}
                                onChange={(e) => setNewAddressLabel(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Sección 2: Selección de Modalidad y Método de Pago */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>2. Método de Pago</span>
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {paymentType === 'anticipado' ? '💳 Mercado Pago' : '🚚 Contra Entrega'}
                    </span>
                  </div>

                  {/* Selector previo: Modalidad de Pago (Pago Anticipado vs Pago Contra Entrega) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      ¿Cuándo y cómo deseas pagar? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Opción A: Pago Anticipado por la Web */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentType('anticipado')}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentType === 'anticipado'
                            ? 'bg-white border-[#0E8388] shadow-xs ring-2 ring-[#0E8388]/20'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Globe className={`w-3.5 h-3.5 ${paymentType === 'anticipado' ? 'text-[#0E8388]' : 'text-slate-400'}`} />
                          <span className={`text-xs font-black ${paymentType === 'anticipado' ? 'text-slate-900' : 'text-slate-700'}`}>
                            Pago Anticipado
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          Vía Mercado Pago (Débito/Crédito)
                        </p>
                      </button>

                      {/* Opción B: Pago Contra Entrega */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentType('contra_entrega')}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentType === 'contra_entrega'
                            ? 'bg-white border-[#0E8388] shadow-xs ring-2 ring-[#0E8388]/20'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Truck className={`w-3.5 h-3.5 ${paymentType === 'contra_entrega' ? 'text-[#0E8388]' : 'text-slate-400'}`} />
                          <span className={`text-xs font-black ${paymentType === 'contra_entrega' ? 'text-slate-900' : 'text-slate-700'}`}>
                            Contra Entrega
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          Al recibir en tu domicilio
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Medios de pago disponibles según la modalidad */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Selecciona medio de pago:
                    </label>

                    {paymentType === 'anticipado' ? (
                      /* Opción Única Anticipada: Botón de Pago Mercado Pago (Tarjeta Débito/Crédito) */
                      <label
                        onClick={() => setPaymentMethod('tarjeta')}
                        className="flex items-start gap-3 p-3.5 rounded-xl border bg-white border-[#0E8388] shadow-xs ring-1 ring-[#0E8388] transition-all cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'tarjeta'}
                          onChange={() => setPaymentMethod('tarjeta')}
                          className="mt-0.5 text-[#0E8388] focus:ring-[#0E8388]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-[#0E8388]" />
                              <span>Tarjeta Débito / Crédito</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                              Mercado Pago
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Pago seguro con tarjeta de crédito o débito a través del botón oficial de Mercado Pago.
                          </p>
                        </div>
                      </label>
                    ) : (
                      <>
                        {/* Opción Contra Entrega 1: Transferencia al Recibir */}
                        <label
                          onClick={() => setPaymentMethod('transferencia_entrega')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            paymentMethod === 'transferencia_entrega'
                              ? 'bg-white border-[#0E8388] shadow-xs ring-1 ring-[#0E8388]'
                              : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'transferencia_entrega'}
                            onChange={() => setPaymentMethod('transferencia_entrega')}
                            className="mt-0.5 text-[#0E8388] focus:ring-[#0E8388]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <Landmark className="w-3.5 h-3.5 text-teal-600" />
                                <span>Transferencia Bancaria al Recibir</span>
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                                Al Recibir
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Transfieres desde tu app bancaria al momento exacto en que te entregamos tu pedido.
                            </p>
                          </div>
                        </label>

                        {/* Opción Contra Entrega 2: Efectivo al Recibir */}
                        <label
                          onClick={() => setPaymentMethod('efectivo')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            paymentMethod === 'efectivo'
                              ? 'bg-white border-[#0E8388] shadow-xs ring-1 ring-[#0E8388]'
                              : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'efectivo'}
                            onChange={() => setPaymentMethod('efectivo')}
                            className="mt-0.5 text-[#0E8388] focus:ring-[#0E8388]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Efectivo al Recibir</span>
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Efectivo
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Pagas en efectivo directamente al repartidor cuando llegue a tu domicilio.
                            </p>

                            {/* Campo opcional interactivo de vuelto */}
                            {paymentMethod === 'efectivo' && (
                              <div
                                className="mt-2.5 pt-2.5 border-t border-slate-100 animate-in fade-in"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                  ¿Con cuánto vas a pagar? (Opcional, para llevarte vuelto):
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Pago con $20.000 / Pago exacto"
                                  value={cashChangeNote}
                                  onChange={(e) => setCashChangeNote(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                                />
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setCashChangeNote('Pago con monto exacto')}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    Monto exacto
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCashChangeNote('Pago con $20.000')}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    Con $20.000
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCashChangeNote('Pago con $50.000')}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    Con $50.000
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>

                        {/* Opción Contra Entrega 3: Tarjeta Débito / Crédito al Recibir (POS Móvil) */}
                        <label
                          onClick={() => setPaymentMethod('pos')}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            paymentMethod === 'pos'
                              ? 'bg-white border-[#0E8388] shadow-xs ring-1 ring-[#0E8388]'
                              : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'pos'}
                            onChange={() => setPaymentMethod('pos')}
                            className="mt-0.5 text-[#0E8388] focus:ring-[#0E8388]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                                <span>Tarjeta Débito / Crédito al Recibir</span>
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                                Máquina POS
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              El repartidor lleva la máquina para cobrarte con tarjeta de débito o crédito en tu puerta.
                            </p>
                          </div>
                        </label>
                      </>
                    )}
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
                      <Truck className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>Despacho {city ? `(${city})` : ''}</span>
                    </span>
                    {hasShippingAddress ? (
                      <span className={`font-bold ${calculatedShippingCost === 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-900'}`}>
                        {calculatedShippingCost === 0 ? 'GRATIS' : formatCLP(calculatedShippingCost)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 italic">
                        Ingresa tu dirección para calcular
                      </span>
                    )}
                  </div>


                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total a Pagar</span>
                    <span className="text-[#0E8388]">{formatCLP(shippingStepTotal)}</span>
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

                {/* Botón Final de Envío */}
                <button
                  type="submit"
                  disabled={isSubmitting || hasOutOfStockItems}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-transform ${
                    hasOutOfStockItems
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed shadow-none opacity-90'
                      : 'bg-[#10B981] hover:bg-[#34D399] text-slate-950 shadow-xl shadow-[#10B981]/30 active:scale-95 cursor-pointer disabled:opacity-50'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>REGISTRANDO ORDEN EN BASE DE DATOS...</span>
                    </>
                  ) : hasOutOfStockItems ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>HAY PRODUCTOS AGOTADOS</span>
                    </>
                  ) : paymentType === 'anticipado' ? (
                    <>
                      <span>PAGAR CON MERCADO PAGO</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>CONFIRMAR Y FINALIZAR PEDIDO</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 3: CONFIRMACIÓN DE COMPRA EXITOSA (MODERNA, SIN ALERT) */}
          {/* ========================================================= */}
          {step === 'success' && completedOrder && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* Banner de Éxito */}
                <div className="text-center py-4 px-2 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/30">
                    ✓
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    ¡Pedido Recibido con Éxito! 🐾
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Número de Orden:{' '}
                    <span className="font-mono font-black text-[#0E8388] bg-[#0E8388]/10 px-2 py-0.5 rounded-md">
                      {completedOrder.id}
                    </span>
                  </p>
                </div>

                {/* Resumen de Entrega */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Destinatario:</span>
                    <span className="font-bold text-slate-900">{completedOrder.recipientName}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Dirección:</span>
                    <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">
                      {completedOrder.address}, {completedOrder.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Ventana de Entrega:</span>
                    <span className="font-bold text-emerald-800">{completedOrder.deliverySlot}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-black text-sm text-[#0E8388]">
                      {formatCLP(completedOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Puntos Acumulados */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">
                      Puntos Club Patitas Ganados
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    +{completedOrder.pointsEarned} Pts
                  </span>
                </div>

                {/* Información según el método de pago seleccionado */}
                {completedOrder.paymentMethod?.toLowerCase().includes('efectivo') ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-emerald-950 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                          <span>Pago Contra Entrega (Efectivo)</span>
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Pagarás en efectivo al repartidor al recibir tu pedido.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-emerald-200/80 text-xs space-y-1.5">
                      <div className="flex justify-between font-extrabold text-slate-800">
                        <span>Total a pagar en efectivo:</span>
                        <span className="text-emerald-700 font-black text-sm">{formatCLP(completedOrder.total)}</span>
                      </div>
                      {completedOrder.cashChangeNote && (
                        <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                          <strong>Indicación de vuelto:</strong> {completedOrder.cashChangeNote}
                        </div>
                      )}
                    </div>
                  </div>
                ) : completedOrder.paymentMethod?.toLowerCase().includes('pos') ? (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-purple-950 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                          Tarjeta al Recibir (Máquina POS)
                        </h4>
                        <p className="text-[11px] text-purple-700 font-medium">
                          El repartidor llevará la máquina para cobrarte con tarjeta directamente en tu puerta.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : completedOrder.paymentMethod?.toLowerCase().includes('transferencia') ? (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-[#0E8388]" />
                        <span>Datos para Transferir al Recibir</span>
                      </h4>
                      <button
                        onClick={handleCopyBankData}
                        className="text-[11px] font-bold text-[#0E8388] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBankData ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Datos</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs space-y-1 text-slate-700 font-medium font-mono">
                      <div><strong className="font-sans">Banco:</strong> Banco de Chile</div>
                      <div><strong className="font-sans">Tipo:</strong> Cuenta Corriente</div>
                      <div><strong className="font-sans">N°:</strong> 00-123-45678-09</div>
                      <div><strong className="font-sans">RUT:</strong> 77.892.451-2</div>
                      <div><strong className="font-sans">Titular:</strong> Comercial Kira SpA</div>
                      <div><strong className="font-sans">Email:</strong> pagos@patitasdelsur.cl</div>
                      <div><strong className="font-sans">Asunto:</strong> Pedido {completedOrder.id}</div>
                    </div>

                    <a
                      href={`https://wa.me/56987654321?text=Hola%20Patitas%20del%20Sur%2C%20adjunto%20comprobante%20de%20mi%20pedido%20${completedOrder.id}%20por%20${encodeURIComponent(formatCLP(completedOrder.total))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Enviar Comprobante por WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-1 animate-in fade-in">
                    <p className="font-bold flex items-center gap-1.5 text-sky-900">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span>Pago con Mercado Pago Registrado</span>
                    </p>
                    <p className="text-[11px] text-sky-700">
                      Tu pago anticipado con tarjeta fue registrado vía Mercado Pago y tu pedido ya está en preparación.
                    </p>
                  </div>
                )}

                {/* 🥫 DESPENSA INTELIGENTE: PREGUNTAR FRECUENCIA SI HAY ALIMENTO */}
                {completedOrder.hasFoodItem && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/80 to-[#E6F4F1] border-2 border-[#0E8388]/30 shadow-sm space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0E8388] text-white flex items-center justify-center shrink-0 shadow-sm text-lg">
                        🥫
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                            Despensa Inteligente
                          </span>
                          <span className="text-[10px] font-bold text-teal-700">1 solo clic</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                          ¿Cada cuánto tiempo sueles reponer el alimento seco en casa?
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Así tendremos listo tu próximo pedido habitual para que lo repitas sin complicaciones.
                        </p>
                      </div>
                    </div>

                    {replenishmentSaved ? (
                      <div className="p-3 bg-white/95 rounded-xl border border-emerald-300 flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-in zoom-in-95 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>¡Anotado! Te recordaremos reponer en <strong>{selectedReplenishFrequency} días</strong> y podrás pedir todo junto con 1 clic en tu perfil.</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {[15, 21, 30, 45, 60].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => handleSaveReplenishment(days)}
                              className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                selectedReplenishFrequency === days
                                  ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-sm font-black scale-102'
                                  : 'bg-white hover:bg-emerald-50/80 text-slate-700 border-slate-200/90 font-bold hover:border-[#0E8388]/40'
                              }`}
                            >
                              <div className="text-xs font-black">{days} días</div>
                              <div className={`text-[9px] font-semibold ${selectedReplenishFrequency === days ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {days === 30 ? '⭐ Habitual' : days < 30 ? 'Quincenal' : 'Bimestral'}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Toca los días para activar tu reposición automática sin cálculos manuales
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Botón de Finalizar */}
              <button
                onClick={handleCloseAndFinish}
                className="w-full py-3.5 rounded-2xl bg-[#0E8388] hover:bg-[#10B981] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer mt-4"
              >
                <span>FINALIZAR Y SEGUIR EXPLORANDO</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
