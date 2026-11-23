import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/mockData';
import { fetchProductsFromSupabase, cleanIngredientName } from '../services/productsService';
import {
  groupProductsForStore,
  getFlavorSwatchStyle,
  resolveProductImage,
  isVariantAvailable,
  getDefaultAvailableVariantIndex,
} from '../utils/productVariants';
import ProductCard from '../components/ProductCard';
import PawProgressLoader from '../components/PawProgressLoader';
import ProductIngredientsBowl from '../components/ProductIngredientsBowl';
import FeedingCalculatorTab from '../components/product/FeedingCalculatorTab';
import SEOHead from '../components/SEOHead';
import { getProductSchema, getBreadcrumbSchema } from '../utils/schemaGenerators';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
  Scale,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Utensils,
  Stethoscope,
  Image as ImageIcon,
} from 'lucide-react';

export default function ProductDetailView({ onAddToCart, onSelectProduct, cartItems = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preferredVariantId = location.state?.variantId || id;

  const [allProducts, setAllProducts] = useState(FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(
    () => !FALLBACK_PRODUCTS || FALLBACK_PRODUCTS.length === 0
  );
  const [loadProgress, setLoadProgress] = useState(10);

  useEffect(() => {
    let isMounted = true;
    let progressTimer = null;
    let finishTimer = null;

    if (!FALLBACK_PRODUCTS || FALLBACK_PRODUCTS.length === 0) {
      setIsLoading(true);
      setLoadProgress(12);
      progressTimer = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 90) return prev;
          const step = Math.max(2, Math.round((92 - prev) * 0.22));
          return Math.min(90, prev + step);
        });
      }, 85);
    }

    const load = async () => {
      try {
        const data = await fetchProductsFromSupabase();
        if (!isMounted) return;
        if (data && data.length > 0) {
          setAllProducts(data);
        }
      } finally {
        if (isMounted) {
          if (progressTimer) clearInterval(progressTimer);
          setLoadProgress(100);
          finishTimer = setTimeout(() => {
            if (isMounted) setIsLoading(false);
          }, 220);
        }
      }
    };
    load();
    window.addEventListener('patitas_products_updated', load);
    return () => {
      isMounted = false;
      if (progressTimer) clearInterval(progressTimer);
      if (finishTimer) clearTimeout(finishTimer);
      window.removeEventListener('patitas_products_updated', load);
    };
  }, []);

  // Find product by URL param, resolving grouped variants without falling back to unrelated products (prevents Soft 404)
  const product = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return null;
    const grouped = groupProductsForStore(allProducts);
    let found = grouped.find((p) => String(p.id) === String(id) || String(p.sku) === String(id));
    if (found) return found;
    found = grouped.find(
      (p) => p.variants && p.variants.some((v) => String(v.id) === String(id) || String(v.sku) === String(id))
    );
    if (found) return found;
    return allProducts.find((p) => String(p.id) === String(id) || String(p.sku) === String(id)) || null;
  }, [allProducts, id]);

  const isDog = product?.petType === 'perros';

  // Remove redundant brand name from title if product name starts with the brand
  const displayProductName = useMemo(() => {
    if (!product?.name) return '';
    const rawName = String(product.name).trim();
    const brand = String(product.brand || '').trim();
    if (!brand) return rawName;

    // Check if name starts with brand (case-insensitive)
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedBrand}\\s*[-•:]?\\s*`, 'i');
    if (regex.test(rawName)) {
      const stripped = rawName.replace(regex, '').trim();
      return stripped || rawName;
    }
    return rawName;
  }, [product?.name, product?.brand]);

  const [selectedWeight, setSelectedWeight] = useState(() => {
    if (!product) return 'Estándar';
    const list = product.variants || [];
    if (list.length > 0) {
      const matchV = list.find((v) => String(v.id) === String(preferredVariantId) || String(v.sku) === String(preferredVariantId));
      if (matchV && isVariantAvailable(matchV)) {
        return matchV.format || matchV.weight;
      }
      const fallbackAvail = list[getDefaultAvailableVariantIndex(list)];
      if (fallbackAvail && isVariantAvailable(fallbackAvail)) {
        return fallbackAvail.format || fallbackAvail.weight;
      }
      if (matchV) {
        return matchV.format || matchV.weight;
      }
    }
    return product.weights ? product.weights[0] : 'Estándar';
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredientes');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [petWeight, setPetWeight] = useState(isDog ? 8 : 4);
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3, or 'result'
  const [selectedLifeStage, setSelectedLifeStage] = useState(null);
  const [selectedBreedSize, setSelectedBreedSize] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variantes y variante activa (hoisted para alimentar galería, bol, ingredientes, análisis y guía)
  const variants = useMemo(() => product?.variants || [], [product?.variants]);
  const activeVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return (
      variants.find((v) => v.format === selectedWeight || v.weight === selectedWeight) ||
      variants[0]
    );
  }, [variants, selectedWeight]);

  // Producto efectivo que refleja la ficha completa del sabor seleccionado (con fallback seguro al maestro)
  const displayProduct = useMemo(() => {
    if (!product) return null;
    if (!product.hasFlavorVariants || !activeVariant) return product;

    const hasVariantIngredients =
      Array.isArray(activeVariant.ingredients) && activeVariant.ingredients.length > 0;
    const hasVariantGa =
      activeVariant.guaranteedAnalysis &&
      typeof activeVariant.guaranteedAnalysis === 'object' &&
      Object.keys(activeVariant.guaranteedAnalysis).length > 0;
    const hasVariantBenefits =
      Array.isArray(activeVariant.benefits) && activeVariant.benefits.length > 0;

    return {
      ...product,
      id: activeVariant.id || product.id,
      sku: activeVariant.sku || product.sku,
      image: activeVariant.image || product.image,
      images:
        Array.isArray(activeVariant.images) && activeVariant.images.length > 0
          ? activeVariant.images
          : product.images,
      tagline: activeVariant.tagline || product.tagline,
      badge: activeVariant.badge || product.badge,
      targetStageLabel: activeVariant.targetStageLabel || product.targetStageLabel,
      ingredients: hasVariantIngredients ? activeVariant.ingredients : product.ingredients,
      guaranteedAnalysis: hasVariantGa
        ? activeVariant.guaranteedAnalysis
        : product.guaranteedAnalysis,
      benefits: hasVariantBenefits ? activeVariant.benefits : product.benefits,
      bowlConfig: activeVariant.bowlConfig || product.bowlConfig,
      feedingGuide: activeVariant.feedingGuide || product.feedingGuide,
      mainProtein: activeVariant.mainProtein || product.mainProtein,
      proteinValue: activeVariant.proteinValue ?? product.proteinValue,
      proteinPercent: activeVariant.proteinPercent ?? product.proteinPercent,
      proteinSubtitle: activeVariant.proteinSubtitle || product.proteinSubtitle,
      animalPercent: activeVariant.animalPercent ?? product.animalPercent,
      animalPercentDetail: activeVariant.animalPercentDetail || product.animalPercentDetail,
      lifeStage: activeVariant.lifeStage || product.lifeStage,
      grainLevel: activeVariant.grainLevel || product.grainLevel,
    };
  }, [product, activeVariant]);

  // Derivar la lista de imágenes del producto (o exclusivamente del sabor activo en familias de sabores)
  const productImages = useMemo(() => {
    if (!product) return [isDog ? '/images/hero_dog.png' : '/images/cat_food_tuna.png'];

    const isPlaceholderImg = (img) =>
      typeof img === 'string' && img.includes('photo-1568640347023-a616a30bc3bd');
    const pushUnique = (target, img) => {
      if (img && typeof img === 'string') {
        const clean = img.trim();
        if (clean && !isPlaceholderImg(clean) && !target.includes(clean)) {
          target.push(clean);
        }
      }
    };

    const list = [];

    if (product.hasFlavorVariants && activeVariant) {
      pushUnique(list, activeVariant.image);
      if (Array.isArray(activeVariant.images)) {
        activeVariant.images.forEach((img) => pushUnique(list, img));
      }
      if (list.length === 0) {
        list.push(resolveProductImage(activeVariant));
      }
      return list;
    }

    pushUnique(list, product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => pushUnique(list, img));
    }
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => pushUnique(list, v.image));
    }
    if (list.length === 0) {
      list.push(resolveProductImage(product));
    }
    return list;
  }, [product, activeVariant, isDog]);

  // Análisis garantizado clasificado: 4 métricas principales fijas + micronutrientes/otros
  const { primaryGuaranteed, secondaryGuaranteed } = useMemo(() => {
    const analysis =
      displayProduct?.guaranteedAnalysis && typeof displayProduct.guaranteedAnalysis === 'object'
        ? displayProduct.guaranteedAnalysis
        : {};
    const entries = Object.entries(analysis);

    const PRIMARY_SPECS = [
      {
        label: 'Proteína Cruda',
        test: (k) => /prote[ií]na/i.test(k) || /protein/i.test(k),
        fallback: displayProduct?.proteinValue ? `${displayProduct.proteinValue}%` : '32%',
      },
      {
        label: 'Grasa Cruda',
        test: (k) => /grasa/i.test(k) || /fat/i.test(k),
        fallback: '16%',
      },
      {
        label: 'Fibra Cruda',
        test: (k) => /fibra/i.test(k) || /fiber/i.test(k),
        fallback: '4%',
      },
      {
        label: 'Humedad',
        test: (k) => /humedad/i.test(k) || /moisture/i.test(k),
        fallback: '10%',
      },
    ];

    const matchedKeys = new Set();
    const primaryList = PRIMARY_SPECS.map((spec) => {
      const foundEntry = entries.find(([k]) => spec.test(k));
      if (foundEntry) {
        matchedKeys.add(foundEntry[0]);
        return { label: spec.label, value: foundEntry[1] };
      }
      return { label: spec.label, value: spec.fallback };
    });

    const secondaryList = entries
      .filter(([k]) => !matchedKeys.has(k) && !PRIMARY_SPECS.some((s) => s.test(k)))
      .map(([k, v]) => ({ label: k, value: v }));

    return { primaryGuaranteed: primaryList, secondaryGuaranteed: secondaryList };
  }, [displayProduct?.guaranteedAnalysis, displayProduct?.proteinValue]);

  // Lista normalizada de ingredientes limpios
  const ingredientList = useMemo(() => {
    if (Array.isArray(displayProduct?.ingredients)) {
      return displayProduct.ingredients
        .map((i) => cleanIngredientName(i) || (typeof i === 'string' ? i.trim() : ''))
        .filter(Boolean);
    }
    if (typeof displayProduct?.ingredients === 'string' && displayProduct.ingredients.trim()) {
      return displayProduct.ingredients
        .split(',')
        .map((i) => cleanIngredientName(i) || i.trim())
        .filter(Boolean);
    }
    return [];
  }, [displayProduct?.ingredients]);

  // Reset al cambiar de producto o sabor (sin provocar scroll hacia arriba)
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
  }, [product?.id, activeVariant?.id]);

  // Precarga pasiva de la portada de los demás sabores para cambio instantáneo sin parpadeo
  useEffect(() => {
    if (!product?.hasFlavorVariants || variants.length <= 1) return;
    variants.forEach((v) => {
      const src = v?.image;
      if (
        src &&
        typeof src === 'string' &&
        !src.includes('photo-1568640347023-a616a30bc3bd') &&
        v.id !== activeVariant?.id
      ) {
        const preload = new Image();
        preload.src = src;
      }
    });
  }, [product?.hasFlavorVariants, variants, activeVariant?.id]);

  const mainCtaRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // IntersectionObserver to show mobile sticky bottom buy bar when main CTA scrolls out of view
  useEffect(() => {
    if (!mainCtaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(mainCtaRef.current);
    return () => observer.disconnect();
  }, [id, product]);

  // Reset wizard steps and active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setWizardStep(1);
    setSelectedLifeStage(null);
    setSelectedBreedSize(null);
  }, [id, product]);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product?.weights && product.weights.length > 0) {
      const list = product.variants || [];
      if (list.length > 0) {
        const matchV = list.find(
          (v) => String(v.id) === String(preferredVariantId) || String(v.sku) === String(preferredVariantId)
        );
        if (matchV && isVariantAvailable(matchV)) {
          setSelectedWeight(matchV.format || matchV.weight);
          return;
        }
        const fallbackAvail = list[getDefaultAvailableVariantIndex(list)];
        if (fallbackAvail && isVariantAvailable(fallbackAvail)) {
          setSelectedWeight(fallbackAvail.format || fallbackAvail.weight);
          return;
        }
        if (matchV) {
          setSelectedWeight(matchV.format || matchV.weight);
          return;
        }
      }
      setSelectedWeight(product.weights[0]);
    }
  }, [id, preferredVariantId, product]);

  if (isLoading) {
    return <PawProgressLoader progress={loadProgress} />;
  }

  if (!product) {
    return (
      <div className="pt-36 pb-24 max-w-4xl mx-auto px-6 text-center space-y-4">
        <SEOHead
          title="Producto no encontrado"
          description="El producto consultado no se encuentra disponible actualmente en nuestro catálogo."
          noindex={true}
        />
        <h1 className="text-2xl font-black text-slate-800">Producto no disponible</h1>
        <p className="text-slate-500 text-sm">El catálogo se encuentra en actualización o el producto consultado no existe.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/perros" className="inline-block px-6 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black hover:text-[#F5BA13] text-white text-xs font-bold transition-all shadow-md active:scale-95">
            Ver Catálogo Perros
          </Link>
          <Link to="/gatos" className="inline-block px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all shadow-xs active:scale-95">
            Ver Catálogo Gatos
          </Link>
        </div>
      </div>
    );
  }

  const customFeedingGuide =
    displayProduct?.feedingGuide &&
    Array.isArray(displayProduct.feedingGuide.rows) &&
    displayProduct.feedingGuide.rows.length > 0
      ? displayProduct.feedingGuide
      : null;

  const getFeedingGuide = () => {
    if (customFeedingGuide) {
      if (customFeedingGuide.type === 'weight_only') {
        return customFeedingGuide.rows.map((row, idx) => ({
          ...row,
          id: row.id || `custom-feed-${idx + 1}`,
          maint: row.maint || row.grams || '—',
          hasDirectConditionValue: true,
        }));
      }

      if (customFeedingGuide.type === 'cat_all_stages') {
        const stageRows =
          selectedLifeStage === 'cachorro' && Array.isArray(customFeedingGuide.kittenRows)
            ? customFeedingGuide.kittenRows
            : Array.isArray(customFeedingGuide.adultRows)
            ? customFeedingGuide.adultRows
            : customFeedingGuide.rows;
        return stageRows.map((row, idx) => ({
          ...row,
          id: row.id || `custom-stage-${idx + 1}`,
          maint: row.maint || '—',
          hasDirectConditionValue: true,
        }));
      }

      const conditionKey =
        selectedLifeStage && ['intact', 'neutered', 'overweight'].includes(selectedLifeStage)
          ? selectedLifeStage
          : 'neutered';

      return customFeedingGuide.rows.map((row, idx) => {
        const directValue = row[conditionKey];
        const fallbackValue = row.neutered || row.intact || row.maint || '—';
        return {
          ...row,
          id: row.id || `custom-feed-${idx + 1}`,
          maint: directValue || fallbackValue,
          hasDirectConditionValue: Boolean(directValue),
        };
      });
    }

    if (!isDog) {
      if (selectedLifeStage === 'cachorro') {
        return [
          { id: 'cat-k1', min: 0, max: 1.5, label: '0.5 - 1.5 kg (Gatito 2-6 meses)', maint: '35 - 55 g / día' },
          { id: 'cat-k2', min: 1.51, max: 3, label: '1.5 - 3 kg (Gatito Joven 6-12 meses)', maint: '55 - 75 g / día' },
        ];
      }
      return [
        { id: 'cat-a1', min: 0, max: 3, label: '1 - 3 kg (Gato Pequeño)', maint: '30 - 50 g / día' },
        { id: 'cat-a2', min: 3.01, max: 5, label: '3 - 5 kg (Gato Promedio)', maint: '50 - 70 g / día' },
        { id: 'cat-a3', min: 5.01, max: 999, label: '5 kg+ (Gato Grande / Robusto)', maint: '70 - 95 g / día' },
      ];
    }

    // DOG TABLES
    if (selectedLifeStage === 'cachorro') {
      return [
        { id: 'pup-1', min: 0, max: 5, label: '1 - 5 kg (Cachorro Pequeño)', maint: '60 - 120 g / día' },
        { id: 'pup-2', min: 5.01, max: 15, label: '5 - 15 kg (Cachorro Mediano)', maint: '120 - 280 g / día' },
        { id: 'pup-3', min: 15.01, max: 30, label: '15 - 30 kg (Cachorro Grande)', maint: '280 - 450 g / día' },
        { id: 'pup-4', min: 30.01, max: 999, label: '30 kg+ (Cachorro Gigante)', maint: '450 - 650 g / día' },
      ];
    }

    if (selectedBreedSize === 'pequena') {
      return [
        { id: 'mini-1', min: 0, max: 3, label: '1 - 3 kg (Toy / Mini)', maint: '30 - 65 g / día' },
        { id: 'mini-2', min: 3.01, max: 6, label: '3 - 6 kg (Raza Pequeña)', maint: '65 - 110 g / día' },
        { id: 'mini-3', min: 6.01, max: 10, label: '6 - 10 kg (Pequeño - Mediano)', maint: '110 - 160 g / día' },
      ];
    }

    if (selectedBreedSize === 'grande') {
      return [
        { id: 'g-1', min: 15, max: 25, label: '15 - 25 kg (Raza Grande)', maint: '230 - 350 g / día' },
        { id: 'g-2', min: 25.01, max: 40, label: '25 - 40 kg (Raza Muy Grande)', maint: '350 - 500 g / día' },
        { id: 'g-3', min: 40.01, max: 999, label: '40 kg+ (Raza Gigante)', maint: '500 - 680 g / día' },
      ];
    }

    // Default Mediana / Estándar
    return [
      { id: 'm-1', min: 0, max: 5, label: '1 - 5 kg (Pequeño)', maint: '45 - 90 g / día' },
      { id: 'm-2', min: 5.01, max: 15, label: '5 - 15 kg (Mediano)', maint: '110 - 220 g / día' },
      { id: 'm-3', min: 15.01, max: 30, label: '15 - 30 kg (Grande)', maint: '220 - 380 g / día' },
      { id: 'm-4', min: 30.01, max: 999, label: '30 kg+ (Gigante)', maint: '380 - 520 g / día' },
    ];
  };

  const feedingGuide = getFeedingGuide();

  const currentWeightNum = parseFloat(petWeight) || 0;
  const matchedFeedingRow = feedingGuide.find(
    (row) => currentWeightNum >= row.min && currentWeightNum <= row.max
  ) || (currentWeightNum > (feedingGuide[feedingGuide.length - 1]?.max || 0) ? feedingGuide[feedingGuide.length - 1] : feedingGuide[0]);

  const activeFeedingRow = (() => {
    if (!matchedFeedingRow) return null;
    const extraRule = customFeedingGuide?.extraPerKgOver;
    if (extraRule && currentWeightNum > Number(extraRule.thresholdKg)) {
      const extraKg = currentWeightNum - Number(extraRule.thresholdKg);
      const totalGrams = Math.round(Number(extraRule.baseGrams) + extraKg * Number(extraRule.gramsPerKg));
      const cupsText = customFeedingGuide.cupGrams
        ? ` (~${(totalGrams / Number(customFeedingGuide.cupGrams)).toFixed(1).replace('.', ',')} tazas)`
        : '';
      return {
        ...matchedFeedingRow,
        maint: `${totalGrams} g / día${cupsText}`,
      };
    }
    return matchedFeedingRow;
  })();

  // Cálculo de precio y stock real por formato o sabor seleccionado
  const currentPrice = activeVariant ? activeVariant.price : (product?.price || 0);
  const currentOriginalPrice = activeVariant ? activeVariant.originalPrice : (product?.originalPrice || null);
  const currentStock = activeVariant
    ? (typeof activeVariant.stock === 'number' ? activeVariant.stock : 10)
    : (typeof product?.stock === 'number' ? product.stock : 10);
  const isOutOfStock = currentStock <= 0;

  const activeVariantId = activeVariant?.id || product?.id;
  const inCartQty = (cartItems || [])
    .filter(
      (ci) =>
        (ci.id === activeVariantId || ci.productId === activeVariantId) &&
        (ci.weight === selectedWeight || ci.selectedWeight === selectedWeight)
    )
    .reduce((sum, ci) => sum + (Number(ci.quantity) || 0), 0);
  const remainingStock = Math.max(0, currentStock - inCartQty);
  const isMaxStockInCart = !isOutOfStock && remainingStock <= 0;
  const effectiveQuantity =
    isOutOfStock || isMaxStockInCart
      ? 0
      : Math.max(1, Math.min(quantity, remainingStock));

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxStockInCart) return;
    const variantName = activeVariant && activeVariant.format && activeVariant.format !== product.name
      ? `${product.name} (${activeVariant.format})`
      : product.name;
    const activeVariantStock = activeVariant && typeof activeVariant.stock === 'number'
      ? activeVariant.stock
      : (typeof product.stock === 'number' ? product.stock : 10);

    const itemToAdd = {
      ...displayProduct,
      id: activeVariant?.id || product.id,
      productId: activeVariant?.id || product.id,
      name: variantName,
      image: productImages[0] || activeVariant?.image || product.image,
      sku: activeVariant?.sku || product.sku,
      price: currentPrice,
      unitCostNeto: activeVariant?.unitCostNeto ?? product.unitCostNeto ?? 0,
      shippingUnitCost: activeVariant?.shippingUnitCost ?? product.shippingUnitCost ?? 0,
      format: selectedWeight,
      selectedWeight: selectedWeight,
      weight: selectedWeight,
      stock: activeVariantStock,
    };
    onAddToCart(itemToAdd, selectedWeight, effectiveQuantity);
    setQuantity(1);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Related products grouped
  const relatedProducts = allProducts && allProducts.length > 0 && product
    ? groupProductsForStore(allProducts)
        .filter((p) => p.petType === product.petType && p.id !== product.id && !p.isPaused && !p.isOutOfStock && (typeof p.stock !== 'number' || p.stock > 0))
        .slice(0, 4)
    : [];

  return (
    <div className="pt-28 pb-44 md:pb-20 bg-[#FAF9F6] min-h-screen text-slate-900 select-none">
      <SEOHead
        title={`${product.name} en Frutillar`}
        description={`${product.name} de ${product.brand || 'Patitas del Sur'}. ${displayProduct?.tagline || 'Alimento natural y super premium para mascotas.'} Stock real y despacho a domicilio el mismo día en Frutillar y alrededores (urbano y parcelaciones).`}
        canonical={`/producto/${product.id}`}
        ogImage={productImages[0] || product.image}
        ogType="product"
        keywords={`${product.name}, ${product.brand || ''}, alimento ${isDog ? 'perros' : 'gatos'} frutillar, comida mascotas frutillar, despacho frutillar`}
        jsonLd={[
          getProductSchema(product, { images: productImages, displayProduct }),
          getBreadcrumbSchema([
            { name: 'Inicio', url: '/' },
            { name: isDog ? 'Perros' : 'Gatos', url: isDog ? '/perros' : '/gatos' },
            { name: product.name, url: `/producto/${product.id}` },
          ]),
        ]}
      />
      
      {/* 1. Breadcrumbs & Top Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 hover:text-[#D97706] text-xs font-extrabold border border-slate-200 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </button>

          {/* Breadcrumb Links */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link to="/" className="hover:text-slate-700">Portada</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={isDog ? "/perros" : "/gatos"} className="hover:text-slate-700">
              {isDog ? "Perros 🐶" : "Gatos 🐱"}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-extrabold truncate max-w-xs">{product.name}</span>
          </div>

        </div>
      </div>

      {/* 2. Main Product Showcase Hero Section (Integrated Single Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          
          {/* Top Grid: Gallery & Purchase Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Minimalist Multi-Image Gallery Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center w-full">
            
            {/* Image Box with Soft Pastel Glow */}
            <div className={`relative w-full aspect-square max-h-[420px] rounded-3xl p-6 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner group ${
              isDog
                ? 'bg-gradient-to-br from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1]'
                : 'bg-gradient-to-br from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5]'
            }`}>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 text-slate-800 border border-slate-200/80 shadow-md backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                    title="Foto Anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>

                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 text-slate-800 border border-slate-200/80 shadow-md backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                    title="Foto Siguiente"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </>
              )}
              
              {/* Photo Counter Pill (Top-Left) */}
              {productImages.length > 1 && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Foto {activeImageIndex + 1} de {productImages.length}</span>
                  </span>
                </div>
              )}

              {/* Mascot Recommendation Tag */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5BA13]" />
                  {isDog ? 'Kira 🐶' : 'Jack 🐱'}
                </span>
              </div>

              {/* Active Product Image */}
              <img
                src={productImages[activeImageIndex] || product.image}
                alt={`${product.name} - Vista ${activeImageIndex + 1}`}
                className={`w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-all duration-500 ${
                  productImages.length > 1 ? 'pb-14' : ''
                }`}
              />

              {/* Miniaturas de Galería superpuestas sobre la card de imagen */}
              {productImages.length > 1 && (
                <div className="absolute bottom-3.5 inset-x-4 z-20 flex items-center justify-center gap-3 py-1 overflow-x-auto scrollbar-none">
                  {productImages.map((img, idx) => {
                    const isActive = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1.5 cursor-pointer flex-shrink-0 transition-all duration-200 border-2 bg-white/95 backdrop-blur-md ${
                          isActive
                            ? 'border-[#F5BA13] shadow-md ring-2 ring-[#F5BA13]/40 scale-105'
                            : 'border-slate-200/90 hover:border-slate-300 opacity-80 hover:opacity-100 hover:scale-102 shadow-sm'
                        }`}
                        title={`Ver foto ${idx + 1}`}
                        aria-label={`Ver foto ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Miniatura ${idx + 1}`}
                          className="w-full h-full object-contain rounded-xl"
                        />
                        {isActive && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs bg-[#F5BA13]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info, Purchase Action & Integrated Detail Tabs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Header: Brand & Rating */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Brand Name */}
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#D97706]">
                    {product.brand || 'Patagonia Holística'}
                  </span>

                  {displayProduct?.targetStageLabel && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                      <span>🐾</span>
                      <span>{displayProduct.targetStageLabel}</span>
                    </span>
                  )}
                  {Boolean(product.isVeterinary) && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 shadow-2xs">
                      <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                      <span>Receta Veterinaria</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-semibold">({product.reviewsCount} opiniones)</span>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                {displayProductName}
              </h1>

              {/* Tagline */}
              {displayProduct?.tagline && (
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                  {displayProduct.tagline}
                </p>
              )}
            </div>

            {/* Weight / Format Selector */}
            {product.weights && product.weights.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs font-bold tracking-tight text-slate-700">
                  <span className="text-slate-500 font-medium">
                    {product.hasFlavorVariants ? 'Sabor:' : 'Formato:'}{' '}
                    <strong className="text-slate-900 font-extrabold">{selectedWeight}</strong>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {product.weights.length} variedades
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => {
                    const matchV = variants.find((v) => v.format === w || v.weight === w);
                    const isVOutOfStock = matchV && matchV.stock <= 0;
                    const isSelected = selectedWeight === w;
                    const swatch = product.hasFlavorVariants ? getFlavorSwatchStyle(w) : null;

                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        disabled={isVOutOfStock}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-amber-50/90 text-slate-950 border-[#F5BA13] shadow-xs ring-2 ring-[#F5BA13]/40'
                            : isVOutOfStock
                            ? 'bg-slate-100 text-slate-300 border-slate-200 line-through cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {swatch && (
                          <span
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 bg-white"
                            style={{
                              border: `1.5px solid ${swatch.primaryColor}`,
                              padding: isSelected ? '2px' : '0px',
                            }}
                          >
                            {isSelected && (
                              <span
                                className="w-full h-full rounded-full block animate-in zoom-in-50 duration-150"
                                style={{ backgroundColor: swatch.primaryColor }}
                              />
                            )}
                          </span>
                        )}
                        <span>{w}</span>
                        {isVOutOfStock && <span className="text-[10px] ml-1 opacity-75">(Agotado)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing & Add to Cart Action Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatCLP(currentPrice)}
                  </span>
                  {currentOriginalPrice && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {formatCLP(currentOriginalPrice)}
                    </span>
                  )}
                </div>

                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs">
                    Agotado en {selectedWeight}
                  </span>
                ) : currentStock === 1 ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-black text-xs">
                    ⚡ ¡Última unidad!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs">
                    ✓ {currentStock} unidades disponibles
                  </span>
                )}
              </div>

              {/* Quantity Spinner & CTA Button */}
              <div ref={mainCtaRef} className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shrink-0">
                  <button
                    disabled={isOutOfStock || isMaxStockInCart || effectiveQuantity <= 1}
                    onClick={() => setQuantity(Math.max(1, effectiveQuantity - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-50 text-slate-800 font-extrabold text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-black text-slate-900">{effectiveQuantity}</span>
                  <button
                    disabled={isOutOfStock || isMaxStockInCart || effectiveQuantity >= remainingStock}
                    onClick={() => setQuantity(Math.min(remainingStock, effectiveQuantity + 1))}
                    className="w-9 h-9 rounded-lg bg-slate-50 text-slate-800 font-extrabold text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isOutOfStock || isMaxStockInCart}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                    isOutOfStock || isMaxStockInCart
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : addedSuccess
                      ? 'bg-[#F5BA13] text-[#1D1D1F] font-black shadow-md'
                      : 'bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] shadow-md hover:shadow-xl'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Agotado en {selectedWeight}</span>
                  ) : isMaxStockInCart ? (
                    <span>STOCK MÁX. EN CARRITO ({inCartQty} un.)</span>
                  ) : addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      <span>¡AGREGADO AL CARRITO!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>AGREGAR AL CARRITO ({formatCLP(currentPrice * effectiveQuantity)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Compact Benefits & Loyalty Strip to balance the 2-column hero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FEF3C7]/60 border border-[#F5BA13]/35">
                <span className="w-8 h-8 rounded-xl bg-[#F5BA13] text-[#1D1D1F] flex items-center justify-center font-black text-sm shrink-0">
                  🐾
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-[#78350F] leading-tight">
                    +{Math.max(1, Math.floor(((currentPrice || 0) * quantity) / 1000))} pts Club Patitas
                  </div>
                  <div className="text-[10px] font-semibold text-[#92400E]/80 truncate">
                    Acumula en cada compra
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-800 leading-tight">
                    Despacho en el Sur
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 truncate">
                    Puerto Varas y alrededores
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-800 leading-tight">
                    Calidad Garantizada
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 truncate">
                    Ingredientes seleccionados
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* =====================================================================
              FULL-WIDTH 12-COLUMN TABS SECTION INSIDE THE SAME MAIN CARD
             ===================================================================== */}
          <div className="mt-7 pt-6 border-t border-slate-200/70 space-y-5">
            {/* Centered Capsule Tab Navigation Bar (Kibo / Patitas del Sur 2.0 style) */}
            <div className="flex justify-center w-full">
              <div
                role="tablist"
                aria-label="Información detallada del producto"
                className="inline-flex items-center justify-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-3xl sm:rounded-full bg-[#F6F3EC] border border-[#E6E0D3] shadow-[inset_0_1px_2px_rgba(20,20,20,0.04),0_8px_24px_-8px_rgba(20,20,20,0.07)] max-w-full overflow-x-auto scrollbar-none"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'ingredientes'}
                  onClick={() => setActiveTab('ingredientes')}
                  className={`group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-extrabold tracking-tight transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                    activeTab === 'ingredientes'
                      ? 'bg-[#141414] text-white shadow-[0_6px_16px_-4px_rgba(20,20,20,0.28)]'
                      : 'bg-transparent text-stone-600 hover:bg-white/90 hover:text-[#141414] hover:shadow-2xs'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      activeTab === 'ingredientes'
                        ? 'bg-[#F5BA13] text-[#141414]'
                        : 'bg-white/80 text-[#D97706] group-hover:bg-[#FEF3C7]'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                  </span>
                  <span>Ingredientes & Análisis</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'racion'}
                  onClick={() => setActiveTab('racion')}
                  className={`group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-extrabold tracking-tight transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                    activeTab === 'racion'
                      ? 'bg-[#141414] text-white shadow-[0_6px_16px_-4px_rgba(20,20,20,0.28)]'
                      : 'bg-transparent text-stone-600 hover:bg-white/90 hover:text-[#141414] hover:shadow-2xs'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      activeTab === 'racion'
                        ? 'bg-[#F5BA13] text-[#141414]'
                        : 'bg-white/80 text-[#D97706] group-hover:bg-[#FEF3C7]'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </span>
                  <span>Guía de Alimentación</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'beneficios'}
                  onClick={() => setActiveTab('beneficios')}
                  className={`group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-extrabold tracking-tight transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                    activeTab === 'beneficios'
                      ? 'bg-[#141414] text-white shadow-[0_6px_16px_-4px_rgba(20,20,20,0.28)]'
                      : 'bg-transparent text-stone-600 hover:bg-white/90 hover:text-[#141414] hover:shadow-2xs'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      activeTab === 'beneficios'
                        ? 'bg-[#F5BA13] text-[#141414]'
                        : 'bg-white/80 text-emerald-600 group-hover:bg-emerald-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span>Beneficios</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'resenas'}
                  onClick={() => setActiveTab('resenas')}
                  className={`group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-extrabold tracking-tight transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                    activeTab === 'resenas'
                      ? 'bg-[#141414] text-white shadow-[0_6px_16px_-4px_rgba(20,20,20,0.28)]'
                      : 'bg-transparent text-stone-600 hover:bg-white/90 hover:text-[#141414] hover:shadow-2xs'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      activeTab === 'resenas'
                        ? 'bg-[#F5BA13] text-[#141414]'
                        : 'bg-white/80 text-[#D97706] group-hover:bg-[#FEF3C7]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    Reseñas{product.reviewsCount ? ` (${product.reviewsCount})` : ''}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: PLATO INTERACTIVO DE INGREDIENTES + ANÁLISIS GARANTIZADO + LISTA COMPLETA */}
            {activeTab === 'ingredientes' && (
              <div className="space-y-5 pt-0.5 animate-in fade-in duration-200">
                {/* 1. Interactive Ingredients Bowl Explorer (con plato y animaciones) */}
                <ProductIngredientsBowl product={displayProduct} embedded={true} />

                {/* 2. Análisis Nutricional Garantizado + Lista Completa de Ingredientes */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch text-[#1D1D1F]"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {/* Left/Top: Guaranteed Analysis Table */}
                  <div className="lg:col-span-6 flex flex-col gap-4 p-5 sm:p-6 rounded-[24px] bg-[#FAF8F4] border border-[#1D1D1F]/[0.08] shadow-[0_16px_40px_-24px_rgba(29,29,31,0.08)]">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                        <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white border border-[#1D1D1F]/[0.1] shadow-[0_6px_16px_-10px_rgba(29,29,31,0.22)] text-[12px] font-semibold text-[#1D1D1F] whitespace-nowrap shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#F5BA13] shrink-0" />
                          Análisis nutricional
                        </span>
                        <h3
                          className="text-[17px] sm:text-[19px] font-bold tracking-[-0.025em] text-[#1D1D1F] leading-tight"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          Valores garantizados
                        </h3>
                      </div>
                    </div>

                    {/* 4 Métricas Principales destacadas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {primaryGuaranteed.map((item, idx) => {
                        const rawVal = String(item.value ?? '').trim();
                        const parsed = rawVal.match(/^(\d+(?:[.,]\d+)?\s*%)\s*(.+)$/);
                        const mainVal = parsed ? parsed[1].replace(/\s+%/, '%') : rawVal;
                        const qualifier = parsed ? parsed[2].trim() : '';
                        const isLead = idx === 0;

                        return (
                          <div
                            key={item.label}
                            className={`flex flex-col items-center justify-center px-2.5 py-3 rounded-2xl bg-white border text-center transition-colors ${
                              isLead
                                ? 'border-[#D97706]/30 shadow-[0_10px_24px_-16px_rgba(217,119,6,0.35)]'
                                : 'border-[#1D1D1F]/[0.08] shadow-[0_8px_20px_-16px_rgba(29,29,31,0.18)]'
                            }`}
                          >
                            <div className="flex items-baseline justify-center gap-1 max-w-full flex-wrap">
                              <span
                                className={`text-[21px] xl:text-[25px] font-bold tracking-[-0.03em] leading-none ${
                                  isLead ? 'text-[#B45309]' : 'text-[#1D1D1F]'
                                }`}
                                style={{ fontFamily: 'var(--font-display)' }}
                              >
                                {mainVal}
                              </span>
                              {qualifier && (
                                <span className="text-[11px] font-semibold text-[#1D1D1F]/55 leading-none">
                                  {qualifier}
                                </span>
                              )}
                            </div>
                            <span
                              className={`mt-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] xl:text-[11px] font-semibold leading-tight max-w-full ${
                                isLead
                                  ? 'bg-[#D97706] text-white'
                                  : 'bg-[#1D1D1F]/[0.055] text-[#1D1D1F]/75'
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Otros Componentes / Micronutrientes sin cortes ni desbordes */}
                    {secondaryGuaranteed.length > 0 && (() => {
                      const compactItems = secondaryGuaranteed.filter(
                        (it) => String(it.value ?? '').trim().length <= 16
                      );
                      const wideItems = secondaryGuaranteed.filter(
                        (it) => String(it.value ?? '').trim().length > 16
                      );
                      const orderedSecondary = [...compactItems, ...wideItems];

                      return (
                        <div className="space-y-2.5 pt-3 border-t border-[#1D1D1F]/[0.08]">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-[#1D1D1F]/65">
                              Otros componentes garantizados
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {orderedSecondary.map((item) => {
                              const valStr = String(item.value ?? '').trim();
                              const isWide = valStr.length > 16;

                              return (
                                <div
                                  key={item.label}
                                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/90 border border-[#1D1D1F]/[0.08] hover:border-[#D97706]/25 hover:bg-white transition-colors ${
                                    isWide ? 'sm:col-span-2 flex-wrap gap-y-1' : ''
                                  }`}
                                >
                                  <span className="text-[12px] font-medium text-[#1D1D1F]/70 leading-snug min-w-0 break-words">
                                    {item.label}
                                  </span>
                                  <span
                                    className="px-2.5 py-0.5 rounded-full bg-[#FAF8F4] border border-[#1D1D1F]/[0.07] text-[12.5px] font-bold text-[#1D1D1F] tracking-[-0.015em] shrink-0 max-w-full break-words text-right"
                                    style={{ fontFamily: 'var(--font-display)' }}
                                  >
                                    {valStr}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right/Bottom: Ingredientes en texto fluido continuo con Top 5 destacados */}
                  <div className="lg:col-span-6 flex flex-col gap-4 p-5 sm:p-6 rounded-[24px] bg-[#FAF8F4] border border-[#1D1D1F]/[0.08] shadow-[0_16px_40px_-24px_rgba(29,29,31,0.08)]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                        <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white border border-[#1D1D1F]/[0.1] shadow-[0_6px_16px_-10px_rgba(29,29,31,0.22)] text-[12px] font-semibold text-[#1D1D1F] whitespace-nowrap shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                          Etiqueta completa
                        </span>
                        <h3
                          className="text-[17px] sm:text-[19px] font-bold tracking-[-0.025em] text-[#1D1D1F] leading-tight"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          Composición de la receta
                        </h3>
                      </div>
                      {ingredientList.length > 5 && (
                        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-[#D97706]/10 text-[#B45309] text-[11px] font-bold whitespace-nowrap">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          Primeros 5 destacados
                        </span>
                      )}
                    </div>

                    {ingredientList.length > 0 ? (
                      <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#1D1D1F]/[0.08] shadow-[0_8px_20px_-16px_rgba(29,29,31,0.16)] text-[13px] leading-[1.65]">
                        <p className="text-[#1D1D1F]/70 break-words">
                          {ingredientList.map((name, idx) => {
                            const isTop5 = idx < 5;
                            const isLast = idx === ingredientList.length - 1;
                            return (
                              <React.Fragment key={idx}>
                                {isTop5 ? (
                                  <strong
                                    className="font-bold text-[#1D1D1F]"
                                    style={{ fontFamily: 'var(--font-display)' }}
                                  >
                                    {name}
                                  </strong>
                                ) : (
                                  <span>{name}</span>
                                )}
                                {!isLast ? ', ' : '.'}
                              </React.Fragment>
                            );
                          })}
                        </p>
                        {ingredientList.length >= 5 && (
                          <div className="mt-3.5 pt-3 border-t border-[#1D1D1F]/[0.08] text-[11.5px] text-[#1D1D1F]/55 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            <span>
                              Los primeros 5 ingredientes en negrita constituyen la base principal de mayor concentración del alimento.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-[#1D1D1F]/55 italic">
                        Ingredientes 100% naturales. Información nutricional detallada en proceso de actualización en ficha técnica.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GUÍA DE ALIMENTACIÓN DIARIA (FORMULARIO MULTI-PASOS) */}
            {activeTab === 'racion' && (
              <FeedingCalculatorTab
                product={displayProduct}
                isDog={isDog}
                wizardStep={wizardStep}
                setWizardStep={setWizardStep}
                selectedLifeStage={selectedLifeStage}
                setSelectedLifeStage={setSelectedLifeStage}
                selectedBreedSize={selectedBreedSize}
                setSelectedBreedSize={setSelectedBreedSize}
                petWeight={petWeight}
                setPetWeight={setPetWeight}
                feedingGuide={feedingGuide}
                activeFeedingRow={activeFeedingRow}
                customFeedingGuide={customFeedingGuide}
              />
            )}

            {/* TAB 3: BENEFICIOS DE NUTRICIÓN */}
            {activeTab === 'beneficios' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
                {Array.isArray(displayProduct?.benefits) && displayProduct.benefits.length > 0 ? (
                  displayProduct.benefits.map((b, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 mb-0.5">Beneficio #{idx + 1}</h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{b}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 mb-0.5">Nutrición Holística Premium</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        Fórmula balanceada rica en nutrientes esenciales para la vitalidad, pelaje saludable y óptima digestión de tu mascota.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RESEÑAS DE CLIENTES */}
            {activeTab === 'resenas' && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-black text-slate-900">{product.rating}</div>
                    <div className="flex text-amber-400 justify-center my-0.5 text-xs">
                      {'★'.repeat(5)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">{product.reviewsCount} opiniones</div>
                  </div>
                  <div className="text-xs space-y-1 font-semibold text-slate-600">
                    <p>🟢 98% de dueños notaron mejoras en pelaje en 14 días.</p>
                    <p>🟢 100% aceptación de palatabilidad y sabor en mascotas exigentes.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 4. Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black text-[#D97706] uppercase tracking-widest">Recomendaciones del Sur</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">También te puede gustar</h2>
            </div>
            <Link
              to={isDog ? "/perros" : "/gatos"}
              className="text-xs font-extrabold text-slate-700 hover:text-[#D97706] flex items-center gap-1 transition-colors"
            >
              Ver todo el catálogo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Buy Bar */}
      <div
        className={`md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 p-2.5 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_25px_rgba(0,0,0,0.12)] transition-all duration-300 ${
          showStickyBar ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-2 max-w-md mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={productImages[0] || product.image}
              alt={product.name}
              className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-tight truncate">
                {selectedWeight}
              </div>
              <div className="text-sm font-black text-slate-900 leading-tight">
                {formatCLP(currentPrice)}
              </div>
            </div>
          </div>

          <button
            disabled={isOutOfStock || isMaxStockInCart}
            onClick={handleAddToCart}
            className={`py-2.5 px-4 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
              isOutOfStock || isMaxStockInCart
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : addedSuccess
                ? 'bg-[#F5BA13] text-[#1D1D1F] font-black shadow-md'
                : 'bg-[#1D1D1F] text-white hover:text-[#F5BA13] shadow-md'
            }`}
          >
            {isOutOfStock ? (
              <span>AGOTADO</span>
            ) : isMaxStockInCart ? (
              <span>STOCK MÁX.</span>
            ) : addedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>¡AGREGADO!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>AGREGAR</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

