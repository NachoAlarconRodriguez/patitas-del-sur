import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { getWebSiteSchema, getOrganizationSchema, getLocalBusinessSchema } from '../utils/schemaGenerators';
import { fetchProductsFromSupabase, getCachedProducts } from '../services/productsService';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/mockData';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';
import { COMPANY_INFO } from '../constants';
import { WhatsAppIcon } from '../components/OfficialIcons';
import { saveSpecialOrderToSupabase } from '../services/specialOrdersService';
import { getDispatchZonesFromSupabase } from '../services/dispatchService';

const POLAROID_ITEMS = [
  {
    num: '01',
    title: 'Carne y salmón',
    sub: 'Pollo, pavo, cordero y salmón austral',
    img: 'https://media.kolpusites.com/kibory/ing-01.webp',
    dx: '200%',
    r: '-6deg',
    y: '10px',
    tape: 'var(--biscuit)',
  },
  {
    num: '02',
    title: 'Verduras frescas',
    sub: 'Camote, calabaza y zanahoria',
    img: 'https://media.kolpusites.com/kibory/ing-02.webp',
    dx: '100%',
    r: '3deg',
    y: '-14px',
    tape: 'var(--green-300)',
  },
  {
    num: '03',
    title: 'Aceite de salmón',
    sub: 'Omega 3 puro para piel y pelaje',
    img: 'https://media.kolpusites.com/kibory/ing-03.webp',
    dx: '0%',
    r: '-2deg',
    y: '18px',
    tape: 'var(--blush-300)',
  },
  {
    num: '04',
    title: 'Frutas y bayas',
    sub: 'Arándanos patagónicos y manzana',
    img: 'https://media.kolpusites.com/kibory/ing-04.webp',
    dx: '-100%',
    r: '5deg',
    y: '-8px',
    tape: 'var(--biscuit)',
  },
  {
    num: '05',
    title: 'Botánicos y semillas',
    sub: 'Linaza, algas marinas y prebióticos',
    img: 'https://media.kolpusites.com/kibory/ing-05.webp',
    dx: '-200%',
    r: '-4deg',
    y: '12px',
    tape: 'var(--green-300)',
  },
];

const REVIEWS_DATA = [
  {
    photo: 'https://media.kolpusites.com/kibory/resena-perro-1.webp',
    alt: 'Toby, Puerto Varas',
    tag: 'Puerto Varas · 4 años',
    title: 'Llegó en menos de 2 horas',
    quote: '“Increíble atención. Pedimos el saco de Acana por la mañana y antes del almuerzo ya estaba en la puerta de la casa.”',
    author: 'Camila M.',
    withPet: 'con Toby',
  },
  {
    photo: 'https://media.kolpusites.com/kibory/resena-perro-2.webp',
    alt: 'Nala, Golden, Llanquihue',
    tag: 'Llanquihue · Golden, 3 años',
    title: 'Pelaje brillante y cero alergias',
    quote: '“Nos asesoraron por WhatsApp para cambiar a una receta libre de granos. En dos semanas notamos el cambio en su digestión.”',
    author: 'Javier P.',
    withPet: 'con Nala',
  },
  {
    photo: '/images/jack_cat.jpg',
    alt: 'Milo, Gato, Frutillar',
    tag: 'Frutillar · Felino, 2 años',
    title: 'A nuestro gato le fascina',
    quote: '“Siempre nos costaba encontrar Bravery y snacks naturales para gatos a buen precio en la zona. Ahora compramos todo acá.”',
    author: 'Valentina S.',
    withPet: 'con Milo',
  },
  {
    photo: 'https://media.kolpusites.com/kibory/resena-perro-4.webp',
    alt: 'Rufo, Mestizo, Puerto Montt',
    tag: 'Puerto Montt · 5 años',
    title: 'Los mejores precios del sur',
    quote: '“Comparé en varias tiendas y Patitas del Sur tiene el mejor precio en alimentos Super Premium, además acumulas puntos.”',
    author: 'Marta G.',
    withPet: 'con Rufo',
  },
  {
    photo: 'https://media.kolpusites.com/kibory/resena-perro-5.webp',
    alt: 'Kira, Pastor, Puerto Varas',
    tag: 'Puerto Varas · Senior, 10 años',
    title: 'Encargo especial impecable',
    quote: '“Necesitábamos una fórmula específica para senior. La encargaron y nos avisaron por WhatsApp apenas llegó.”',
    author: 'Andrés L.',
    withPet: 'con Kira',
  },
  {
    photo: 'https://media.kolpusites.com/kibory/resena-perro-6.webp',
    alt: 'Pipa, Cachorro, Llanquihue',
    tag: 'Llanquihue · Cachorro, 6 meses',
    title: 'Cachorro feliz y sano',
    quote: '“Sus snacks deshidratados naturales son el premio favorito de Pipa. Se nota el cariño y dedicación detrás de la tienda.”',
    author: 'Sara R.',
    withPet: 'con Pipa',
  },
];

export default function HomeView({
  onSelectProduct,
  onAddToCart: _onAddToCart,
  cartCount = 0,
  onOpenCart,
  user,
  onOpenAuthModal: _onOpenAuthModal,
}) {
  const navigate = useNavigate();
  const cached = getCachedProducts();
  const [allProducts, setAllProducts] = useState(cached || FALLBACK_PRODUCTS);
  const [hiddenProducts, setHiddenProducts] = useState(getHiddenProductIdentifiers);
  const [dispatchZones, setDispatchZones] = useState([]);
  const [activeReviewDot, setActiveReviewDot] = useState(0);
  const [showSpecialOrderModal, setShowSpecialOrderModal] = useState(false);

  // Special Order Form State
  const [encargoFood, setEncargoFood] = useState('');
  const [encargoName, setEncargoName] = useState('');
  const [encargoPhone, setEncargoPhone] = useState('');
  const [encargoEmail, setEncargoEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+56');
  const [encargoSubmitted, setEncargoSubmitted] = useState(false);
  const [encargoError, setEncargoError] = useState('');
  const [encargoSubmitting, setEncargoSubmitting] = useState(false);

  const pageRef = useRef(null);
  const navRef = useRef(null);
  const burgerRef = useRef(null);
  const heroRef = useRef(null);
  const dogWrapRef = useRef(null);
  const dogElRef = useRef(null);
  const kiraHeadRef = useRef(null);
  const tittleRef = useRef(null);
  const wmHalfLRef = useRef(null);
  const wmHalfRRef = useRef(null);
  const rvTrackRef = useRef(null);
  const rvStadiumRef = useRef(null);
  const rvPeekRef = useRef(null);

  // Sync products from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const data = await fetchProductsFromSupabase();
        if (isMounted && data && data.length > 0) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error('Error al sincronizar productos en la portada:', err);
      }
    };
    loadProducts();
    const handleStorage = () => {
      setHiddenProducts(getHiddenProductIdentifiers());
      loadProducts();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('patitas_products_updated', loadProducts);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('patitas_products_updated', loadProducts);
    };
  }, []);

  // Sync dispatch zones (cities, baseFee, freeThreshold) from Admin Panel in Supabase
  useEffect(() => {
    let isMounted = true;
    const loadDispatchZones = async () => {
      try {
        const zones = await getDispatchZonesFromSupabase();
        if (isMounted && Array.isArray(zones)) {
          setDispatchZones(zones);
        }
      } catch (err) {
        console.warn('Error al sincronizar zonas de despacho en la portada:', err);
      }
    };
    loadDispatchZones();
    const handleZonesUpdated = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setDispatchZones(e.detail);
      } else {
        loadDispatchZones();
      }
    };
    window.addEventListener('patitas_dispatch_zones_updated', handleZonesUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_dispatch_zones_updated', handleZonesUpdated);
    };
  }, []);

  const formatCLP = (price) => {
    if (!price && price !== 0) return '$19.990';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Dynamic values computed from Admin Panel dispatch_zones
  const dispatchSummary = useMemo(() => {
    const active = (dispatchZones || []).filter((z) => z && z.active !== false);
    const cityNames = Array.from(
      new Set(
        active
          .map((z) => (z.name || '').trim())
          .filter(Boolean)
      )
    );

    let citiesLabel = 'Frutillar';
    if (cityNames.length === 1) {
      citiesLabel = cityNames[0];
    } else if (cityNames.length === 2) {
      citiesLabel = `${cityNames[0]} y ${cityNames[1]}`;
    } else if (cityNames.length > 2) {
      citiesLabel = `${cityNames.slice(0, -1).join(', ')} y ${cityNames[cityNames.length - 1]}`;
    }

    const freeThresholds = active
      .map((z) => Number(z.freeThreshold))
      .filter((t) => !Number.isNaN(t) && t > 0);
    const freeThreshold =
      freeThresholds.length > 0
        ? Math.min(...freeThresholds)
        : active.length > 0
          ? 0
          : 25000;

    const baseFees = active
      .map((z) => Number(z.baseFee))
      .filter((f) => !Number.isNaN(f) && f >= 0);
    const minBaseFee = baseFees.length > 0 ? Math.min(...baseFees) : 2000;
    const maxBaseFee = baseFees.length > 0 ? Math.max(...baseFees) : 2000;

    return {
      citiesLabel,
      freeThreshold,
      minBaseFee,
      sameFee: minBaseFee === maxBaseFee,
    };
  }, [dispatchZones]);

  // Top 5 featured recipes/products for the Bento Grid
  const featuredFive = useMemo(() => {
    const visible = allProducts.filter((p) => !isProductHidden(p, hiddenProducts) && !p.isPaused);
    return visible.slice(0, 5);
  }, [allProducts, hiddenProducts]);

  // MASTER KIBORY ENGINE (Single requestAnimationFrame loop + Video Frame Decoder + Scroll FX)
  useEffect(() => {
    const html = document.documentElement;
    const page = pageRef.current;
    if (!page) return;

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
    const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const BONE = FINE && !RM;

    html.classList.add('js');
    if (!RM) {
      html.classList.add('motion', 'intro');
    }

    // Set --li on all mask lines
    page.querySelectorAll('[data-reveal="mask"]').forEach((el) => {
      el.querySelectorAll('.ln > span').forEach((sp, idx) => {
        sp.style.setProperty('--li', String(idx));
      });
    });

    // Split statement words for word-by-word scroll fill
    const statementEl = page.querySelector('.statement');
    const statementWords = [];
    if (statementEl && !RM && !statementEl.dataset.splitDone) {
      statementEl.dataset.splitDone = 'true';
      const splitNode = (node, inHl) => {
        if (node.nodeType === 3) {
          const parts = node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const sp = document.createElement('span');
              sp.className = 'w';
              if (inHl) sp.dataset.hl = '1';
              sp.style.color = inHl ? 'var(--muted-hl)' : 'var(--muted)';
              sp.textContent = part;
              frag.appendChild(sp);
              statementWords.push({ el: sp, hl: inHl, prev: -1 });
            }
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          const isHl = inHl || node.classList.contains('hl');
          Array.from(node.childNodes).forEach((child) => splitNode(child, isHl));
        }
      };
      splitNode(statementEl, false);
    }

    // Engine state
    const ptr = { x: window.innerWidth / 2, y: window.innerHeight / 2, nx: 0, ny: 0, seen: false };
    const scroll = { y: window.scrollY, prevY: window.scrollY, v: 0, dir: 1, dirty: true };
    const dog = {
      enabled: true,
      ready: false,
      target: 0.5,
      current: 0.5,
      lean: 0,
      shiftX: 0,
      hx: window.innerWidth * 0.5,
      hy: window.innerHeight * 0.42,
      visible: true,
    };
    const geo = { dirty: true, tx: -1e4, ty: -1e4, heroH: 0, hDirty: true };
    const req = { bite: false };
    let biteAt = -1e4;
    let hopAt = -1e4;

    const pills = Array.from(page.querySelectorAll('.hero .pill')).map((el) => ({
      el,
      depth: parseFloat(el.style.getPropertyValue('--depth')) || 12,
    }));
    let px = 0;
    let py = 0;
    let lastHeroKey = '';

    const measure = () => {
      if (kiraHeadRef.current) {
        const r = kiraHeadRef.current.getBoundingClientRect();
        if (r.width > 0 || r.left > 0) {
          dog.hx = r.left + r.width / 2;
          dog.hy = r.top + r.height / 2;
        }
      }
      if (tittleRef.current) {
        const r = tittleRef.current.getBoundingClientRect();
        geo.tx = r.left + r.width / 2;
        geo.ty = r.top + r.height / 2;
      }
      geo.dirty = false;
    };

    const mapX = (x) => clamp01(0.5 + (x - dog.hx) / (window.innerWidth * 0.65));

    // Direct 41-frame transparent atlas loader for Kira (zero video autoplay/codec restrictions)
    const ATLAS_COLS = 7;
    const ATLAS_FW = 320;
    const ATLAS_FH = 400;
    const ATLAS_FRAMES = 41;
    let atlasImg = null;
    let fctx = null;
    let lastFrameIdx = -1;
    let decodeCancelled = false;

    const drawAtlasFrame = (idx) => {
      if (!fctx || !atlasImg) return;
      const safeIdx = clamp(idx, 0, ATLAS_FRAMES - 1);
      const col = safeIdx % ATLAS_COLS;
      const row = (safeIdx / ATLAS_COLS) | 0;
      fctx.clearRect(0, 0, ATLAS_FW, ATLAS_FH);
      fctx.drawImage(
        atlasImg,
        col * ATLAS_FW,
        row * ATLAS_FH,
        ATLAS_FW,
        ATLAS_FH,
        0,
        0,
        ATLAS_FW,
        ATLAS_FH
      );
    };

    const dogEl = dogElRef.current;
    if (dogEl && !RM) {
      let canvas = dogEl.querySelector('.dog__canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'dog__canvas';
        canvas.width = ATLAS_FW;
        canvas.height = ATLAS_FH;
        canvas.setAttribute('aria-hidden', 'true');
        dogEl.insertBefore(canvas, dogEl.firstChild);
      }
      fctx = canvas.getContext('2d');

      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (decodeCancelled) return;
        atlasImg = img;
        dog.ready = true;
        dog.enabled = true;
        lastFrameIdx = 20;
        drawAtlasFrame(20);
        dogEl.classList.add('has-video');
      };
      img.src = '/images/kira_hero_atlas.png?v=4';
    }

    const enableDog = () => {
      measure();
      dog.enabled = true;
      if (dog.ready && dogElRef.current) {
        dogElRef.current.classList.add('has-video');
      }
      dog.target = ptr.seen ? mapX(ptr.x) : 0.5;
    };

    // Reveal IntersectionObserver
    const revealEls = Array.from(page.querySelectorAll('[data-reveal]'));
    let revealIO = null;
    if ('IntersectionObserver' in window) {
      revealIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((ent) => {
            if (ent.isIntersecting) {
              ent.target.classList.add('in');
              revealIO.unobserve(ent.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach((el) => revealIO.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('in'));
    }

    // Hero visibility IntersectionObserver
    let heroIO = null;
    if ('IntersectionObserver' in window && heroRef.current) {
      heroIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((ent) => {
            dog.visible = ent.isIntersecting;
            if (ent.isIntersecting) geo.dirty = true;
          });
        },
        { threshold: 0 }
      );
      heroIO.observe(heroRef.current);
    }

    // Count-up stats IntersectionObserver
    const counting = [];
    const statNums = Array.from(page.querySelectorAll('.stat__num[data-count]'));
    let countIO = null;
    if (!RM && 'IntersectionObserver' in window) {
      countIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((ent) => {
            if (ent.isIntersecting) {
              const el = ent.target;
              countIO.unobserve(el);
              const to = parseFloat(el.dataset.count || '0');
              const decimals = parseInt(el.dataset.decimals || '0', 10);
              const suffix = el.dataset.suffix || '';
              let fmt;
              try {
                fmt = new Intl.NumberFormat('es-ES', {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                  useGrouping: 'always',
                });
              } catch {
                fmt = new Intl.NumberFormat('es-ES', {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                  useGrouping: true,
                });
              }
              counting.push({ el, to, suffix, fmt, start: performance.now() });
            }
          });
        },
        { threshold: 0.6 }
      );
      statNums.forEach((el) => countIO.observe(el));
    }

    // Scroll FX registrations
    const band = (el, start = 0.88, span = 0.62) => {
      const rect = el.getBoundingClientRect();
      return clamp01((window.innerHeight * start - rect.top) / (window.innerHeight * span + rect.height * 0.35));
    };
    const traverse = (el) => {
      const rect = el.getBoundingClientRect();
      return clamp01((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
    };

    const pupEl = page.querySelector('.mf__pup');

    // 3D Tilt state for Recipe cards
    const tilt = { dirty: false, activeCard: null, x: 0, y: 0, resetSet: new Set() };

    // Reviews Carousel state
    const rv = {
      vis: true,
      dragging: false,
      moved: false,
      startX: 0,
      startScroll: 0,
      targetDelta: 0,
      pos: [],
      max: 0,
      lastScrollLeft: -1,
    };

    const measureReviews = () => {
      const track = rvTrackRef.current;
      if (!track) return;
      const cards = Array.from(track.querySelectorAll('.rv'));
      const padLeft = parseFloat(window.getComputedStyle(track).scrollPaddingLeft) || 28;
      rv.pos = cards.map((c) => c.offsetLeft - padLeft);
      rv.max = Math.max(0, track.scrollWidth - track.clientWidth);
    };
    measureReviews();

    // Event Listeners (ONLY store values; ZERO DOM writes here)
    const onPointerMove = (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.nx = e.clientX / window.innerWidth - 0.5;
      ptr.ny = e.clientY / window.innerHeight - 0.5;
      ptr.seen = true;

      if (dog.enabled && dog.visible) {
        dog.target = mapX(e.clientX);
      }

      if (BONE) {
        const rc = e.target && e.target.closest ? e.target.closest('.rc') : null;
        if (rc) {
          if (tilt.activeCard && tilt.activeCard !== rc) {
            tilt.resetSet.add(tilt.activeCard);
          }
          tilt.activeCard = rc;
          tilt.x = e.clientX;
          tilt.y = e.clientY;
          tilt.dirty = true;
        } else if (tilt.activeCard) {
          tilt.resetSet.add(tilt.activeCard);
          tilt.activeCard = null;
          tilt.dirty = true;
        }
      }
    };

    const onPointerDown = (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.seen = true;
      if (dog.enabled && dog.visible) {
        dog.target = mapX(e.clientX);
      }

      const now = performance.now();
      const hitRadius = Math.min(150, window.innerWidth * 0.12);
      const distKira = Math.hypot(e.clientX - dog.hx, e.clientY - dog.hy);
      const isBite =
        dog.enabled &&
        dog.visible &&
        now - biteAt > 900 &&
        distKira <= hitRadius;

      if (isBite) {
        biteAt = now;
        req.bite = true;
      }
    };

    const onScroll = () => {
      scroll.y = window.scrollY;
      scroll.dirty = true;
      geo.dirty = true;
    };

    const onResize = () => {
      geo.dirty = true;
      geo.hDirty = true;
      scroll.dirty = true;
      measureReviews();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Update functions called strictly inside the single rAF master loop
    const updPointerFx = (now) => {
      if (
        ptr.seen &&
        dog.visible &&
        !html.classList.contains('intro') &&
        now - hopAt > 1200 &&
        tittleRef.current &&
        Math.hypot(ptr.x - geo.tx, ptr.y - geo.ty) <= 140
      ) {
        hopAt = now;
        tittleRef.current.classList.add('is-hop');
      }
    };

    const updDog = () => {
      dog.current += (dog.target - dog.current) * 0.12;
      if (dog.ready && fctx && atlasImg) {
        const want = clamp01(dog.current);
        const idx = Math.round(want * (ATLAS_FRAMES - 1));
        if (idx !== lastFrameIdx) {
          lastFrameIdx = idx;
          drawAtlasFrame(idx);
        }
      }
      dog.lean += ((dog.current - 0.5) * 3 - dog.lean) * 0.1;
      if (dogElRef.current) {
        dogElRef.current.style.rotate = `${dog.lean.toFixed(3)}deg`;
      }
    };

    const updHero = () => {
      let e = 0;
      if (!RM && !html.classList.contains('intro') && geo.heroH) {
        const hp = clamp01(scroll.y / (geo.heroH * 0.65));
        e = hp * hp * (3 - 2 * hp);
      }
      const t4 = window.matchMedia('(max-width: 899px), (max-aspect-ratio: 11/10)').matches;
      if (BONE) {
        px += (-ptr.nx - px) * 0.07;
        py += (-ptr.ny - py) * 0.07;
      }
      pills.forEach(({ el, depth }) => {
        const d = depth * 2;
        const tx = px * d;
        const ty = py * d - (t4 ? 0 : 80 * e);
        el.style.translate = `calc(${tx.toFixed(2)} * var(--u)) calc(${ty.toFixed(2)} * var(--u))`;
        el.style.opacity = e > 0 ? String((1 - 0.9 * e).toFixed(3)) : '';
      });

      const k = t4 ? 0 : e;
      const key = `${k.toFixed(4)}_${t4}`;
      if (key !== lastHeroKey) {
        lastHeroKey = key;
        if (wmHalfLRef.current) wmHalfLRef.current.style.translate = `calc(${(-110 * k).toFixed(2)} * var(--u)) 0`;
        if (wmHalfRRef.current) wmHalfRRef.current.style.translate = `calc(${(110 * k).toFixed(2)} * var(--u)) 0`;
        if (dogWrapRef.current && !html.classList.contains('intro')) {
          dogWrapRef.current.style.translate = `0 calc(${(40 * k).toFixed(2)} * var(--u))`;
        }
      }
    };

    const updScrollFx = () => {
      if (RM) return;

      // 1. Manifesto puppy parallax
      if (pupEl) {
        const q = 0.5 - traverse(pupEl);
        pupEl.style.translate = `0 ${(q * 70).toFixed(1)}px`;
        pupEl.style.rotate = `${(q * 5).toFixed(2)}deg`;
      }

      // 2. Manifesto word-by-word fill
      if (statementEl && statementWords.length) {
        const p = band(statementEl, 0.9, 0.7);
        const head = p * statementWords.length;
        for (let i = 0; i < statementWords.length; i++) {
          const wObj = statementWords[i];
          const k = clamp01(head - i);
          if (Math.abs(k - wObj.prev) > 0.01 || ((k === 0 || k === 1) && k !== wObj.prev)) {
            wObj.prev = k;
            const to = wObj.hl ? 'var(--green-text)' : 'var(--ink)';
            const from = wObj.hl ? 'var(--muted-hl)' : 'var(--muted)';
            wObj.el.style.color = `color-mix(in oklab, ${to} ${(k * 100).toFixed(1)}%, ${from})`;
          }
        }
      }

      // 3. Reviews peek dog rising from floor
      if (rvStadiumRef.current && rvPeekRef.current) {
        const b = band(rvStadiumRef.current, 0.95, 0.55);
        const e = 1 - Math.pow(1 - b, 3);
        const peekVal = (1 - e) * 72;
        rvPeekRef.current.style.setProperty('--peek', `${peekVal.toFixed(2)}%`);
      }
    };

    const updReviews = () => {
      const track = rvTrackRef.current;
      if (!track) return;
      if (rv.dragging) {
        track.classList.add('is-dragging');
        track.scrollLeft = rv.startScroll - rv.targetDelta;
      } else if (track.classList.contains('is-dragging')) {
        track.classList.remove('is-dragging');
      }

      if (track.scrollLeft !== rv.lastScrollLeft) {
        rv.lastScrollLeft = track.scrollLeft;
        let idx = 0;
        if (track.scrollLeft >= rv.max - 2 && rv.pos.length) {
          idx = rv.pos.length - 1;
        } else {
          let best = Infinity;
          rv.pos.forEach((p, i) => {
            const d = Math.abs(track.scrollLeft - p);
            if (d < best) {
              best = d;
              idx = i;
            }
          });
        }
        setActiveReviewDot(idx);
      }
    };

    const updCounters = (now) => {
      for (let i = counting.length - 1; i >= 0; i--) {
        const item = counting[i];
        const p = clamp01((now - item.start) / 1400);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = item.to * eased;
        item.el.textContent = item.fmt.format(val) + item.suffix;
        if (p >= 1) {
          item.el.textContent = item.fmt.format(item.to) + item.suffix;
          counting.splice(i, 1);
        }
      }
    };

    const updTilt = () => {
      tilt.resetSet.forEach((card) => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
      tilt.resetSet.clear();

      if (tilt.activeCard) {
        const r = tilt.activeCard.getBoundingClientRect();
        const lx = clamp01((tilt.x - r.left) / (r.width || 1));
        const ly = clamp01((tilt.y - r.top) / (r.height || 1));
        const rx = clamp((0.5 - ly) * 10, -5, 5);
        const ry = clamp((lx - 0.5) * 10, -5, 5);
        tilt.activeCard.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        tilt.activeCard.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      }
      tilt.dirty = false;
    };

    const updNav = () => {
      const nav = navRef.current;
      if (!nav) return;
      const floating = scroll.y > (geo.heroH || 700) - 120;
      const wasFloating = nav.classList.contains('is-floating');
      if (floating !== wasFloating) {
        nav.classList.toggle('is-floating', floating);
        if (!floating) nav.classList.remove('is-hidden');
      }
      if (floating) {
        const menuOpen = nav.getAttribute('data-open') === 'true';
        const hasFocus = nav.contains(document.activeElement);
        if (menuOpen || hasFocus) {
          nav.classList.remove('is-hidden');
        } else if (scroll.v > 6) {
          nav.classList.add('is-hidden');
        } else if (scroll.v < -6) {
          nav.classList.remove('is-hidden');
        }
      }
    };

    // Master requestAnimationFrame loop
    let rafId = 0;
    let last = performance.now();

    const frame = (now) => {
      const _dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      scroll.v = scroll.y - scroll.prevY;
      scroll.prevY = scroll.y;
      if (scroll.v) scroll.dir = Math.sign(scroll.v);

      if (geo.hDirty && heroRef.current) {
        geo.heroH = heroRef.current.offsetHeight;
        geo.hDirty = false;
      }
      if (geo.dirty && dog.visible) {
        measure();
      }

      if (req.bite) {
        if (dogElRef.current) {
          dogElRef.current.classList.add('is-bump');
        }
        req.bite = false;
      }

      if (BONE) updPointerFx(now);
      if (dog.visible && dog.enabled) updDog(now);
      if (dog.visible) updHero();
      if (scroll.dirty) updScrollFx(now);
      if (rv.vis) updReviews();
      if (counting.length) updCounters(now);
      if (tilt.dirty) updTilt();
      updNav();

      scroll.dirty = false;
      rafId = requestAnimationFrame(frame);
    };

    measure();
    rafId = requestAnimationFrame(frame);

    // Entrance sequence driver
    let introTimer = 0;
    let failsafeTimer = 0;
    if (!html.classList.contains('intro')) {
      enableDog();
    } else {
      Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 500)),
      ]).then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            html.classList.add('play');
            setTimeout(enableDog, 1750);
            introTimer = window.setTimeout(() => {
              html.classList.remove('intro', 'play');
              html.classList.add('live');
              geo.dirty = true;
              scroll.dirty = true;
            }, 2700);
          });
        });
      });

      failsafeTimer = window.setTimeout(() => {
        html.classList.remove('intro', 'play');
        html.classList.add('live');
        enableDog();
      }, 3200);
    }

    // Track drag handlers for Reviews
    const track = rvTrackRef.current;
    const onTrackDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      rv.dragging = true;
      rv.moved = false;
      rv.startX = e.clientX;
      rv.startScroll = track.scrollLeft;
      rv.targetDelta = 0;
      track.setPointerCapture(e.pointerId);
    };
    const onTrackMove = (e) => {
      if (!rv.dragging) return;
      const dx = e.clientX - rv.startX;
      if (Math.abs(dx) > 6) rv.moved = true;
      rv.targetDelta = dx;
    };
    const onTrackUp = (e) => {
      if (!rv.dragging) return;
      rv.dragging = false;
      try {
        track.releasePointerCapture(e.pointerId);
      } catch {}
    };
    const onTrackClick = (e) => {
      if (rv.moved) {
        e.preventDefault();
        e.stopPropagation();
        rv.moved = false;
      }
    };

    if (track) {
      track.addEventListener('pointerdown', onTrackDown);
      track.addEventListener('pointermove', onTrackMove);
      track.addEventListener('pointerup', onTrackUp);
      track.addEventListener('pointercancel', onTrackUp);
      track.addEventListener('click', onTrackClick, true);
    }

    return () => {
      decodeCancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(introTimer);
      clearTimeout(failsafeTimer);
      html.classList.remove('intro', 'play', 'live', 'motion');
      document.body.classList.remove('menu-open');
      if (revealIO) revealIO.disconnect();
      if (heroIO) heroIO.disconnect();
      if (countIO) countIO.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (track) {
        track.removeEventListener('pointerdown', onTrackDown);
        track.removeEventListener('pointermove', onTrackMove);
        track.removeEventListener('pointerup', onTrackUp);
        track.removeEventListener('pointercancel', onTrackUp);
        track.removeEventListener('click', onTrackClick, true);
      }
    };
  }, []);

  // Mobile Menu helper (Phase 2.10)
  const setMenu = (open, refocus = false) => {
    const nav = navRef.current;
    const burger = burgerRef.current;
    if (!nav || !burger) return;
    nav.classList.add('is-snap');
    nav.setAttribute('data-open', open ? 'true' : 'false');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
    void nav.offsetWidth;
    nav.classList.remove('is-snap');
    if (open) {
      const firstLink = nav.querySelector('.nav__links a');
      if (firstLink) firstLink.focus({ preventScroll: true });
    } else if (refocus) {
      burger.focus({ preventScroll: true });
    }
  };

  // Carousel controls
  const scrollReviewsByDir = (dir) => {
    const track = rvTrackRef.current;
    if (!track) return;
    const firstCard = track.querySelector('.rv');
    const cardW = firstCard ? firstCard.offsetWidth : 380;
    const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: dir * (cardW + 16), behavior: RM ? 'auto' : 'smooth' });
  };

  const scrollToReviewDot = (idx) => {
    const track = rvTrackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.rv'));
    if (!cards[idx]) return;
    const padLeft = parseFloat(window.getComputedStyle(track).scrollPaddingLeft) || 28;
    const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: cards[idx].offsetLeft - padLeft, behavior: RM ? 'auto' : 'smooth' });
  };

  // Special Order Submit
  const handleEncargoSubmit = async (e) => {
    e.preventDefault();
    if (!encargoFood.trim()) {
      setEncargoError('Por favor indica qué alimento o marca buscas');
      return;
    }
    const nameParts = encargoName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      setEncargoError('Por favor ingresa tu nombre y apellido');
      return;
    }
    const cleanPhone = encargoPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      setEncargoError('El teléfono debe tener exactamente 9 dígitos (ej: 9 1234 5678)');
      return;
    }
    const cleanEmail = encargoEmail.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEncargoError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setEncargoError('');
    setEncargoSubmitting(true);
    const fullPhone = `${countryCode} ${cleanPhone}`;

    try {
      await saveSpecialOrderToSupabase({
        food_requested: encargoFood.trim(),
        customer_name: encargoName.trim(),
        customer_phone: fullPhone,
        customer_email: cleanEmail,
      });
    } catch (saveErr) {
      console.warn('Error al registrar encargo especial:', saveErr);
    } finally {
      setEncargoSubmitting(false);
    }

    setEncargoSubmitted(true);
    const message =
      `¡Hola Patitas del Sur! Quisiera consultar si pueden traer este alimento para mi regalón:\n\n` +
      `🐾 Alimento o Marca: ${encargoFood.trim()}\n` +
      `👤 Nombre y Apellido: ${encargoName.trim()}\n` +
      `📞 Teléfono o WhatsApp: ${fullPhone}\n` +
      `✉️ Correo Electrónico: ${cleanEmail}\n\n` +
      `¿Me podrían confirmar disponibilidad y fecha de entrega? ¡Muchas gracias!`;
    const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsappRaw || '56953332492'}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div ref={pageRef} className="kibo-page">
      <SEOHead
        title="Alimento y Snacks Naturales para Mascotas en la Patagonia | Patitas del Sur"
        description="Nutrición holística, libre de granos y snacks deshidratados para perros y gatos. Despacho rápido en Puerto Varas, Llanquihue, Frutillar y Puerto Montt."
        canonical="/"
        keywords="alimento para perros puerto varas, comida gatos llanquihue, snacks naturales mascotas chile, grain free patagonia"
        jsonLd={[getWebSiteSchema(), getOrganizationSchema(), getLocalBusinessSchema()]}
      />

      <a className="skip" href="#main-kibo">
        Saltar al contenido
      </a>

      {/* Shared SVG Symbols */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <symbol id="i-paw" viewBox="0 0 24 24">
          <g fill="currentColor">
            <ellipse cx="12" cy="16.2" rx="5.2" ry="4.4" />
            <ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-20 5.4 10.4)" />
            <ellipse cx="9.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(-8 9.5 6.3)" />
            <ellipse cx="14.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(8 14.5 6.3)" />
            <ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.6" transform="rotate(20 18.6 10.4)" />
          </g>
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
          />
        </symbol>
      </svg>

      {/* ONE Unified Header (Hero Nav -> Floating Pill -> Mobile Panel) */}
      <header ref={navRef} className="kibo-nav" data-open="false">
        <a
          className="nav__logo"
          href="#inicio"
          aria-label="Patitas del Sur, inicio"
          data-in="rise-down"
          style={{ '--d': '200ms' }}
        >
          <svg className="paw" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#i-paw" />
          </svg>
          <span>patitas</span>
        </a>

        <nav
          className="nav__links"
          id="nav-links"
          aria-label="Principal"
          data-in="rise-down"
          style={{ '--d': '240ms' }}
          onClick={(e) => {
            if (e.target.closest('a')) setMenu(false, false);
          }}
        >
          <a href="#recetas">Recetas</a>
          <a href="#ingredientes">Ingredientes</a>
          <a href="#opiniones">Opiniones</a>
          <Link to="/perros">Perros</Link>
          <Link to="/gatos">Gatos</Link>
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/mi-cuenta') : '/login'}>
            {user ? user.name?.split(' ')[0] || 'Mi Cuenta' : 'Ingresar'}
          </Link>
        </nav>

        <div className="nav__actions" data-in="rise-down" style={{ '--d': '280ms' }}>
          <button
            type="button"
            onClick={onOpenCart}
            className="nav__cta btn btn--ink"
            data-cursor-label="Abrir carrito"
          >
            {cartCount > 0 ? `Carrito (${cartCount})` : 'Pedir ahora'}
          </button>
          <button
            ref={burgerRef}
            className="nav__burger"
            type="button"
            aria-expanded="false"
            aria-controls="nav-links"
            aria-label="Abrir menú"
            onClick={() => {
              const isOpen = navRef.current?.getAttribute('data-open') === 'true';
              setMenu(!isOpen, isOpen);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="main-kibo">
        {/* ═══════════════════════════════════════════════════════════════════
            1 · HERO SECTION (#inicio) WITH KIRA & JACK TRANSPARENT CUTOUT
            ═══════════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="hero" id="inicio" aria-label="Patitas del Sur">
          <div className="hero__scene">
            <div className="card card-a" data-in="settle" style={{ '--d': '0ms' }}>
              <p className="hero__note hero__note--l" data-in="rise" style={{ '--d': '700ms' }}>
                Stock permanente de las marcas
                <br />
                favoritas de tu perro o gato.
              </p>
              <p className="hero__note hero__note--r" data-in="rise" style={{ '--d': '760ms' }}>
                <span className="live-dot" />
                Despacho en {dispatchSummary.citiesLabel} ·{' '}
                {dispatchSummary.sameFee
                  ? `Reparto ${formatCLP(dispatchSummary.minBaseFee)}`
                  : `desde ${formatCLP(dispatchSummary.minBaseFee)}`}
              </p>
            </div>

            <div className="card card-b" data-in="settle" style={{ '--d': '80ms' }} />

            <div className="stage">
              <h1 className="wm">
                <span className="sr-only">
                  Patitas del Sur, alimento real y nutrición natural para perros y gatos
                </span>
                <span ref={wmHalfLRef} className="wm__half wm__half--l" aria-hidden="true">
                  <span className="wm__mask">
                    <span className="wm__ch" data-in="reveal" style={{ '--d': '250ms' }}>
                      p
                    </span>
                  </span>
                  <span className="wm__mask">
                    <span className="wm__ch" data-in="reveal" style={{ '--d': '300ms' }}>
                      a
                    </span>
                  </span>
                  <span className="wm__mask">
                    <span className="wm__ch" data-in="reveal" style={{ '--d': '350ms' }}>
                      t
                    </span>
                  </span>
                  <span className="wm__i">
                    <span className="wm__mask">
                      <span className="wm__ch" data-in="reveal" style={{ '--d': '400ms' }}>
                        ı
                      </span>
                    </span>
                    <span
                      ref={tittleRef}
                      className="tittle"
                      data-in="drop"
                      style={{ '--d': '900ms' }}
                      onAnimationEnd={(e) => {
                        if (e.animationName === 'kibo-hop') {
                          e.currentTarget.classList.remove('is-hop');
                        }
                      }}
                    >
                      <svg className="tittle__paw" viewBox="0 0 24 24" aria-hidden="true">
                        <use href="#i-paw" />
                      </svg>
                    </span>
                  </span>
                </span>

                <span className="wm__gap" aria-hidden="true" />

                <span ref={wmHalfRRef} className="wm__half wm__half--r" aria-hidden="true">
                  <span className="wm__mask">
                    <span className="wm__ch" data-in="reveal" style={{ '--d': '460ms' }}>
                      t
                    </span>
                  </span>
                  <span className="wm__mask">
                    <span className="wm__ch" data-in="reveal" style={{ '--d': '530ms' }}>
                      a
                    </span>
                  </span>
                  <span className="wm__mask wm__mask--desc">
                    <span className="wm__ch" data-in="reveal" style={{ '--d': '600ms' }}>
                      s
                    </span>
                  </span>
                </span>
              </h1>

              {/* Kira Transparent Stage (4:5 portrait, Kibory §1.5) */}
              <div className="dog-clip">
                <div ref={dogWrapRef} className="dog-wrap" data-in="peek" style={{ '--d': '650ms' }}>
                  <div
                    ref={dogElRef}
                    className="dog"
                    onAnimationEnd={(e) => {
                      if (e.animationName === 'kibo-bump') {
                        e.currentTarget.classList.remove('is-bump');
                      }
                    }}
                  >
                    <img
                      className="dog__still"
                      src="/images/kira_hero_still_alpha.png?v=4"
                      alt="Kira, embajadora de Patitas del Sur"
                      width="400"
                      height="500"
                      decoding="async"
                    />
                    <span ref={kiraHeadRef} className="dog__head" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Floating Parallax Pills */}
              <div
                className="pill pill--1"
                aria-hidden="true"
                style={{ '--depth': 14, '--r': '-8deg' }}
              >
                <span className="pill__bob">
                  <span className="pill__face" data-in="pop" style={{ '--d': '1550ms' }}>
                    🐾 Kira · Peludos
                  </span>
                </span>
              </div>

              <div
                className="pill pill--2"
                aria-hidden="true"
                style={{ '--depth': 10, '--r': '7deg' }}
              >
                <span className="pill__bob">
                  <span className="pill__face" data-in="pop" style={{ '--d': '1640ms' }}>
                    🐱 Jack · Michis
                  </span>
                </span>
              </div>

              <div
                className="pill pill--3"
                aria-hidden="true"
                style={{ '--depth': 18, '--r': '5deg' }}
              >
                <span className="pill__bob">
                  <span className="pill__face" data-in="pop" style={{ '--d': '1730ms' }}>
                    ¡Plato limpio todos los días!
                  </span>
                </span>
              </div>

              <div
                className="pill pill--4"
                aria-hidden="true"
                style={{ '--depth': 12, '--r': '-6deg' }}
              >
                <span className="pill__bob">
                  <span className="pill__face" data-in="pop" style={{ '--d': '1820ms' }}>
                    {dispatchSummary.freeThreshold > 0
                      ? `Envío gratis sobre ${formatCLP(dispatchSummary.freeThreshold)}`
                      : `Despacho ${formatCLP(dispatchSummary.minBaseFee)}`}
                  </span>
                </span>
              </div>

              <svg
                className="paw paw--b1"
                data-in="pop"
                style={{ '--d': '1900ms', '--r': '-16deg' }}
                aria-hidden="true"
              >
                <use href="#i-paw" />
              </svg>
              <svg
                className="paw paw--b2"
                data-in="pop"
                style={{ '--d': '1980ms', '--r': '12deg' }}
                aria-hidden="true"
              >
                <use href="#i-paw" />
              </svg>
            </div>
          </div>

          <div className="hero__copy">
            <h2 className="hero__title">
              <span className="ln">
                <span data-in="reveal" style={{ '--d': '1050ms' }}>
                  Nunca más
                </span>
              </span>
              <span className="ln">
                <span data-in="reveal" style={{ '--d': '1120ms' }}>
                  sin su comida.
                </span>
              </span>
            </h2>
            <p className="hero__lead" data-in="rise" style={{ '--d': '1250ms' }}>
              Su marca favorita siempre en stock, directo a tu puerta hoy.
            </p>
            <div className="hero__ctas">
              <button
                type="button"
                onClick={() => navigate('/perros')}
                className="btn btn--ink btn--arrow"
                data-in="settle"
                style={{ '--d': '1380ms' }}
                data-cursor-label="Ir a Perros"
              >
                Explorar Perros
                <span className="btn__ico" aria-hidden="true">
                  ↗
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/gatos')}
                className="btn btn--ghost-light"
                data-in="settle"
                style={{ '--d': '1450ms' }}
                data-cursor-label="Ir a Gatos"
              >
                Explorar Gatos
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            2 · MANIFESTO SECTION (#manifiesto)
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          className="sec sec--manifesto card"
          id="manifiesto"
          aria-labelledby="mf-title"
        >
          <div className="mf__left">
            <h2 className="kicker" id="mf-title">
              Sobre Patitas del Sur
              <span className="kicker__dot" />
            </h2>
            <div className="experts" data-reveal="rise">
              <span className="avatars avatars--lg">
                <img src="/images/kira_dog.jpg" alt="" width="44" height="44" />
                <img src="/images/jack_cat.jpg" alt="" width="44" height="44" />
                <img
                  src="https://media.kolpusites.com/kibory/experto-1.webp"
                  alt=""
                  width="44"
                  height="44"
                />
              </span>
              <p>
                <b>100 %</b> comprometidos con que a tu perro o gato nunca le falte su comida
                favorita
              </p>
            </div>
            <figure className="mf__pup" data-scroll="parallax" data-ph="Kira con suéter">
              <img
                src="/images/kira_sweater_alpha.png?v=2"
                alt="Kira, Samoyedo de Patitas del Sur con suéter"
                width="770"
                height="1115"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>

          <div className="mf__right">
            <p className="statement">
              En Patitas del Sur nos aseguramos de que su plato <em className="hl">nunca quede vacío</em>: tenemos siempre disponible <em className="hl">su marca y formato favorito</em>, a precios bajos y con despacho rápido a tu puerta, para que tú tengas <em className="hl">cero preocupaciones y tu regalón su comida siempre a tiempo.</em>
            </p>

            <ul className="stats">
              <li data-reveal="draw" style={{ '--i': 0 }}>
                <span className="stat__num" data-count="100" data-suffix=" %" aria-hidden="true">
                  100 %
                </span>
                <span className="sr-only">100 %</span>
                <span className="stat__label">
                  disponibilidad cuidada en las marcas favoritas de perros y gatos
                </span>
              </li>
              <li data-reveal="draw" style={{ '--i': 1 }}>
                <span className="stat__num" data-count="1500" data-suffix="+" aria-hidden="true">
                  1.500+
                </span>
                <span className="sr-only">1.500+</span>
                <span className="stat__label">
                  familias del sur que ya reciben su alimento a tiempo en casa
                </span>
              </li>
              <li data-reveal="draw" style={{ '--i': 2 }}>
                <span
                  className="stat__num"
                  data-count="4.9"
                  data-decimals="1"
                  data-suffix="/5"
                  aria-hidden="true"
                >
                  4,9/5
                </span>
                <span className="sr-only">4,9 sobre 5</span>
                <span className="stat__label">
                  valoración media por nuestra rapidez, stock y atención cercana
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            3 · RECIPES / FEATURED PRODUCTS BENTO GRID (#recetas)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="sec sec--recipes card" id="recetas" aria-labelledby="rc-title">
          <header className="sec__head">
            <div>
              <h2 className="h2" id="rc-title" data-reveal="mask">
                <span className="ln">
                  <span>
                    <svg className="paw paw--inline" viewBox="0 0 24 24" aria-hidden="true">
                      <use href="#i-paw" />
                    </svg>
                    Nuestras recetas
                  </span>
                </span>
                <span className="ln">
                  <span>semanales</span>
                </span>
              </h2>
            </div>

            <div className="sec__aside" data-reveal="rise">
              <p>
                Fórmulas holísticas, libres de granos y ricas en proteína animal real listas para
                llegar hoy mismo a tu puerta.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link className="btn btn--ghost" to="/perros">
                  Catálogo Perros
                </Link>
                <Link className="btn btn--ghost" to="/gatos">
                  Catálogo Gatos
                </Link>
              </div>
            </div>
          </header>

          <figure className="rc__perch" data-reveal="rise" aria-hidden="true">
            <img
              src="/images/jack_perch_alpha.png?v=2"
              alt="Jack asomándose sobre las recetas"
              width="1024"
              height="1024"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <ul className="rc-grid" data-reveal="stagger">
            {featuredFive.map((product, idx) => {
              const isFeat = idx === 0;
              const numStr = `0${idx + 1}.`;
              const tags = [
                product.brand || (product.petType === 'gatos' ? 'Felinos' : 'Super Premium'),
                product.category || (product.weights && product.weights[0]) || 'Stock local',
              ].filter(Boolean);

              return (
                <li key={product.id || idx} style={{ '--i': idx }}>
                  <button
                    type="button"
                    onClick={() =>
                      onSelectProduct
                        ? onSelectProduct(product)
                        : navigate(`/producto/${product.id}`)
                    }
                    className={`rc ${isFeat ? 'rc--feat' : ''}`}
                    data-cursor-label="Ver producto"
                  >
                    <span className="rc__top">
                      <span className="rc__num">{numStr}</span>
                      <span className="rc__arrow" aria-hidden="true">
                        →
                      </span>
                    </span>
                    <h3 className="rc__name">{product.name}</h3>
                    <span className="tags">
                      {tags.map((t, ti) => (
                        <span key={ti} className="tag">
                          {t}
                        </span>
                      ))}
                    </span>
                    <figure className="rc__img" data-ph={product.name}>
                      <img
                        src={product.image}
                        alt={product.name}
                        width="600"
                        height="800"
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                    <span className="rc__price">desde {formatCLP(product.price)}</span>
                    {isFeat && (
                      <span className="hand-note" aria-hidden="true">
                        ¡el favorito de Kira y Jack!
                        <svg viewBox="0 0 80 50">
                          <path
                            d="M4 6 C 30 4, 58 14, 70 40 M 62 34 L 70 41 L 74 31"
                            pathLength="1"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                  {isFeat && (
                    <span className="rc__trio" aria-hidden="true">
                      <img
                        src="https://media.kolpusites.com/kibory/trio-1b-clean3.webp"
                        alt=""
                        width="600"
                        height="800"
                        style={{ '--e': 0.718 }}
                      />
                      <img
                        src="https://media.kolpusites.com/kibory/trio-2.webp"
                        alt=""
                        width="600"
                        height="800"
                        style={{ '--e': 0.771 }}
                      />
                      <img
                        src="https://media.kolpusites.com/kibory/trio-3.webp"
                        alt=""
                        width="600"
                        height="800"
                        style={{ '--e': 0.671 }}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            4 · POLAROID GALLERY (#ingredientes)
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          className="sec sec--ing card card--blush"
          id="ingredientes"
          aria-label="Nutrición biológicamente apropiada"
        >
          {/* Polaroid Fan Gallery */}
          <div className="gal" style={{ marginTop: 0 }}>
            <header className="gal__head" data-reveal="rise">
              <h3 className="gal__title">Nutrición biológicamente apropiada</h3>
              <span className="gal__note" aria-hidden="true">
                seleccionado con cariño en el sur
                <svg viewBox="0 0 60 48">
                  <path
                    d="M6 4 C 30 6, 46 18, 48 40 M 40 33 L 48 41 L 54 31"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </header>

            <ul className="gal__list" data-reveal="fan">
              {POLAROID_ITEMS.map((pol, idx) => (
                <li key={pol.num} style={{ '--i': idx, '--dx': pol.dx }}>
                  <figure
                    className="gal__card"
                    style={{ '--r': pol.r, '--y': pol.y, '--tape': pol.tape }}
                  >
                    <span className="gal__num" aria-hidden="true">
                      {pol.num}
                    </span>
                    <span className="gal__img" data-ph={pol.title}>
                      <img
                        src={pol.img}
                        alt={pol.sub}
                        width="962"
                        height="625"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <figcaption>
                      <b>{pol.title}</b>
                      <small>{pol.sub}</small>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            5 · PHOTO BAND A
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="card sec--photo" data-reveal="photo" aria-labelledby="ph-title">
          <figure className="ph__bg" data-ph="Kira y Jack en la Patagonia">
            <img
              src="/images/frutillar_mascot_story.jpg?v=3"
              alt="Kira y Jack contemplando el Volcán Osorno y el Lago Llanquihue"
              width="2048"
              height="1152"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="ph__copy">
            <h2 className="ph__title" id="ph-title" data-reveal="rise">
              Del Lago Llanquihue directo a su plato
            </h2>
            <p className="ph__text" data-reveal="rise">
              Despachamos directo a tu puerta en Frutillar, Llanquihue, Puerto Octay, Totoral,
              Fresia, Tegualda y alrededores. Tu regalón solo tiene que disfrutar su comida;
              nosotros nos encargamos del resto.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            6 · REVIEWS CAROUSEL (#opiniones)
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          className="sec sec--reviews card"
          id="opiniones"
          aria-labelledby="rv-title"
          aria-roledescription="carrusel"
        >
          <header className="rv__head">
            <p className="pill-label" data-reveal="rise">
              <svg className="paw" viewBox="0 0 24 24" aria-hidden="true">
                <use href="#i-paw" />
              </svg>
              Familias Patitas del Sur
            </p>
            <h2 className="h2" id="rv-title" data-reveal="mask">
              <span className="ln">
                <span>Lo que dicen en casa</span>
              </span>
              <span className="ln">
                <span>(y en el plato).</span>
              </span>
            </h2>
          </header>

          <figure className="rv__perch" data-reveal="rise" aria-hidden="true">
            <img
              src="https://media.kolpusites.com/kibory/perro-caja.webp"
              alt=""
              width="2048"
              height="1152"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="rv__box">
            <div ref={rvStadiumRef} className="rv__stadium">
              <ul
                ref={rvTrackRef}
                className="rv__track"
                id="rv-track"
                data-reveal="stagger"
                data-cursor-label="Arrastra"
                tabIndex={0}
                aria-label="Reseñas de clientes"
              >
                {REVIEWS_DATA.map((item, idx) => (
                  <li key={idx} className="rv" style={{ '--i': idx }}>
                    <figure className="rv__dog" data-ph={item.alt}>
                      <img
                        src={item.photo}
                        alt={item.alt}
                        width="750"
                        height="1000"
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                    <span className="rv__tag">{item.tag}</span>
                    <h3 className="rv__title">{item.title}</h3>
                    <p className="rv__text">{item.quote}</p>
                    <footer className="rv__foot">
                      <span className="rv__stars" role="img" aria-label="5 de 5">
                        {[0, 1, 2, 3, 4].map((s) => (
                          <svg key={s} viewBox="0 0 24 24" aria-hidden="true">
                            <use href="#i-star" />
                          </svg>
                        ))}
                      </span>
                      <span>
                        <b>{item.author}</b>
                        <small>{item.withPet}</small>
                      </span>
                    </footer>
                  </li>
                ))}
              </ul>

              <div className="rv__ctrl">
                <button
                  type="button"
                  className="rv__btn"
                  onClick={() => scrollReviewsByDir(-1)}
                  aria-controls="rv-track"
                  aria-label="Reseña anterior"
                >
                  ←
                </button>
                <div className="rv__dots" role="group" aria-label="Elegir reseña">
                  {REVIEWS_DATA.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Ir a la reseña ${idx + 1}`}
                      aria-current={activeReviewDot === idx ? 'true' : undefined}
                      onClick={() => scrollToReviewDot(idx)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="rv__btn"
                  onClick={() => scrollReviewsByDir(1)}
                  aria-controls="rv-track"
                  aria-label="Reseña siguiente"
                >
                  →
                </button>
              </div>

              <p className="rv__giant" aria-hidden="true" data-reveal="mask">
                <span className="ln">
                  <span>¡guau!</span>
                </span>
              </p>
            </div>

            <figure
              ref={rvPeekRef}
              className="rv__peek"
              data-scroll="peek"
              data-ph="Mascota asomándose"
            >
              <img
                src="https://media.kolpusites.com/kibory/perro-asoma.webp"
                alt=""
                width="882"
                height="987"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            7 · PHOTO BAND B (GIANT PAW SVG CLIPPATH)
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          className="card sec--photo sec--photo-b"
          data-reveal="photo"
          aria-labelledby="ph2-title"
        >
          <figure className="ph__bg ph__bg--paw">
            <svg
              className="ph__paw"
              viewBox="0 0 100 100"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <clipPath id="paw-clip">
                  <path d="M37 50C37 34 51 16 67 10C81 5 94 9 96 22C97 30 92 36 93 42C94 46 97 48 97 50C97 52 94 54 93 58C92 64 97 70 96 78C94 91 81 95 67 90C51 84 37 66 37 50Z" />
                  <ellipse
                    cx="22.5"
                    cy="61.5"
                    rx="13.5"
                    ry="10.5"
                    transform="rotate(-8 22.5 61.5)"
                  />
                  <ellipse
                    cx="22.5"
                    cy="38.5"
                    rx="13.5"
                    ry="10.5"
                    transform="rotate(8 22.5 38.5)"
                  />
                  <ellipse
                    cx="36.5"
                    cy="84"
                    rx="12.5"
                    ry="9.5"
                    transform="rotate(-35 36.5 84)"
                  />
                  <ellipse
                    cx="36.5"
                    cy="16"
                    rx="12.5"
                    ry="9.5"
                    transform="rotate(35 36.5 16)"
                  />
                </clipPath>
              </defs>
              <g clipPath="url(#paw-clip)">
                <g className="ph__zoom">
                  <rect width="100" height="100" fill="#78350F" />
                  <image
                    href="https://media.kolpusites.com/kibory/foto-fondo-2.webp"
                    x="8"
                    y="20"
                    width="96"
                    height="60"
                    preserveAspectRatio="xMidYMid slice"
                    transform="matrix(-1 0 0 1 112 0)"
                  />
                </g>
              </g>
            </svg>
            <img
              className="ph__flat"
              src="https://media.kolpusites.com/kibory/foto-fondo-2.webp"
              alt=""
              width="1778"
              height="1112"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="ph__copy">
            <h2 className="ph__title" id="ph2-title" data-reveal="rise">
              Cada bocado,
              <br />
              <span className="ph__hl">una fiesta</span>
            </h2>
            <p className="ph__text" data-reveal="rise">
              Alimentos con carne fresca, salmón y snacks deshidratados que perros y gatos disfrutan
              desde el primer día.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            8 · CTA & SPECIAL ORDERS (#empezar)
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          className="sec sec--cta card card--green"
          id="empezar"
          aria-labelledby="cta-title"
        >
          <div className="cta__text">
            <p className="eyebrow" data-reveal="rise">
              Club Patitas & Encargos Especiales
            </p>
            <h2 className="h2" id="cta-title" data-reveal="mask">
              <span className="ln">
                <span>Su alimento favorito,</span>
              </span>
              <span className="ln">
                <span>hoy mismo en casa.</span>
              </span>
            </h2>
            <p className="cta__lead" data-reveal="rise">
              Elige en nuestro catálogo de Perros y Gatos con despacho a domicilio en{' '}
              {dispatchSummary.citiesLabel}
              {dispatchSummary.freeThreshold > 0
                ? ` (gratis sobre ${formatCLP(dispatchSummary.freeThreshold)})`
                : ''}
              , o encárganos cualquier marca o formato y lo traemos para tu regalón.
            </p>

            <div className="cta__btns" data-reveal="rise">
              <button
                type="button"
                onClick={() => navigate('/perros')}
                className="btn btn--ink btn--arrow"
                data-cursor-label="Comprar ahora"
              >
                Ver catálogo completo
                <span className="btn__ico" aria-hidden="true">
                  ↗
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowSpecialOrderModal((prev) => !prev)}
                className="btn btn--ghost-light"
              >
                {showSpecialOrderModal ? 'Ocultar formulario' : 'Encargar un alimento especial'}
              </button>
              <span className="hand-note hand-note--light" aria-hidden="true">
                ¡sin letra chica!
              </span>
            </div>

            {showSpecialOrderModal && (
              <form
                onSubmit={handleEncargoSubmit}
                style={{
                  marginTop: '24px',
                  padding: '22px',
                  borderRadius: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'grid',
                  gap: '12px',
                  maxWidth: '520px',
                }}
              >
                <input
                  type="text"
                  required
                  placeholder="¿Qué alimento o marca buscas? (Ej: Bravery Salmón, Hill's...)"
                  value={encargoFood}
                  onChange={(e) => {
                    setEncargoFood(e.target.value);
                    if (encargoError) setEncargoError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(29,29,31,0.55)',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y apellido"
                    value={encargoName}
                    onChange={(e) => {
                      setEncargoName(e.target.value);
                      if (encargoError) setEncargoError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.25)',
                      background: 'rgba(29,29,31,0.55)',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'rgba(29,29,31,0.75)',
                        color: '#fff',
                        fontSize: '13px',
                      }}
                    >
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+51">🇵🇪 +51</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      placeholder="9 1234 5678"
                      value={encargoPhone}
                      onChange={(e) => {
                        setEncargoPhone(e.target.value.replace(/\D/g, '').slice(0, 9));
                        if (encargoError) setEncargoError('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'rgba(29,29,31,0.55)',
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={encargoEmail}
                  onChange={(e) => {
                    setEncargoEmail(e.target.value);
                    if (encargoError) setEncargoError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(29,29,31,0.55)',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                {encargoError && (
                  <p style={{ color: '#FDE68A', fontSize: '12.5px', fontWeight: 700 }}>
                    {encargoError}
                  </p>
                )}
                {encargoSubmitted && (
                  <p style={{ color: '#A7F3D0', fontSize: '12.5px', fontWeight: 700 }}>
                    ✓ ¡Consulta registrada! Se abrió WhatsApp para confirmarte fecha.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={encargoSubmitting}
                  className="btn btn--ink"
                  style={{ width: '100%', background: '#25D366', color: '#fff' }}
                >
                  <WhatsAppIcon className="w-4 h-4" colored={false} />
                  <span>
                    {encargoSubmitting ? 'Registrando...' : 'Consultar disponibilidad por WhatsApp'}
                  </span>
                </button>
              </form>
            )}
          </div>

          <figure className="cta__dog" aria-hidden="true">
            <img
              src="https://media.kolpusites.com/kibory/perro-bolsa-boca.webp"
              alt=""
              width="624"
              height="1000"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="cta__art">
            <figure className="cta__img" data-ph="Cuenco Patitas del Sur">
              <img
                src="https://media.kolpusites.com/kibory/cta-producto.webp"
                alt=""
                width="1626"
                height="1924"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <span className="cta__shadow" aria-hidden="true" />
            <span className="badge badge--biscuit" aria-hidden="true">
              <svg className="badge__ring" viewBox="0 0 128 128">
                <defs>
                  <path
                    id="ring-cta"
                    d="M64,64 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"
                  />
                </defs>
                <text>
                  <textPath href="#ring-cta" textLength="314" lengthAdjust="spacing">
                    {dispatchSummary.freeThreshold > 0
                      ? `ENVÍO GRATIS · SOBRE ${formatCLP(dispatchSummary.freeThreshold)} · `
                      : `DESPACHO DIRECTO · ${dispatchSummary.citiesLabel.toUpperCase()} · `}
                  </textPath>
                </text>
              </svg>
              <span className="badge__core">
                <svg viewBox="-2 -2 68 32" width="32" height="15">
                  <path
                    d="M48.68 11A7 7 0 1 1 58.61 14A7 7 0 1 1 48.68 17H15.32A7 7 0 1 1 5.39 14A7 7 0 1 1 15.32 11Z"
                    fill="#FFD452"
                  />
                </svg>
              </span>
            </span>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          9 · MONUMENTAL FOOTER STAGE
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="foot">
        <div className="foot__row">
          <p className="foot__claim">
            Nutrición real para mascotas <span>de verdad.</span>
          </p>
          <nav className="foot__links" aria-label="Pie">
            <a href="#recetas">Recetas</a>
            <a href="#ingredientes">Ingredientes</a>
            <a href="#opiniones">Opiniones</a>
            <Link to="/perros">Perros</Link>
            <Link to="/gatos">Gatos</Link>
            <Link to="/nosotros">Nosotros</Link>
          </nav>
          <div className="foot__social">
            <a
              className="foot__ico"
              href={COMPANY_INFO.instagramUrl || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              className="foot__ico"
              href={COMPANY_INFO.whatsappUrl || 'https://wa.me/56953332492'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" colored={false} />
            </a>
          </div>
        </div>

        <div className="foot__stage">
          <a className="foot__wm" href="#inicio" aria-label="Patitas del Sur, volver al inicio">
            patitas
          </a>
          <div className="foot__dogs" data-reveal="dogs">
            <img
              src="https://media.kolpusites.com/kibory/perros-fila.webp"
              alt=""
              width="2010"
              height="687"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="foot__legal">
          <span>© 2026 Patitas del Sur · Comercial Kira SpA</span>
          <Link to="/politicas-de-privacidad">Privacidad</Link>
          <Link to="/politicas-de-despacho">Despachos</Link>
          <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
          <Link to="/cambios-y-devoluciones">Cambios y devoluciones</Link>
        </div>
      </footer>
    </div>
  );
}
