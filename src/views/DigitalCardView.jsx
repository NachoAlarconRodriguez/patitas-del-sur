import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  UserPlus,
  QrCode,
  Share2,
  Check,
  Copy,
  X,
  MapPin,
  ArrowUpRight,
  Wifi,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppIcon } from '../components/OfficialIcons';
import { SITE_URL } from '../constants';
import { getBusinessCardBySlug, buildVCardContent } from '../data/businessCards';

function InstagramBrandIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookBrandIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.5 21.5v-8.2h2.76l.41-3.2H13.5V8.05c0-.93.26-1.56 1.59-1.56h1.7V3.63c-.3-.04-1.3-.13-2.48-.13-2.45 0-4.13 1.5-4.13 4.24v2.36H7.4v3.2h2.78v8.2h3.32Z" />
    </svg>
  );
}

/**
 * Tarjeta de Presentación Digital NFC / QR (/tarjeta/:slug)
 * Diseñada para apertura instantánea al acercar la tarjeta NFC física en iOS y Android.
 */
export default function DigitalCardView() {
  const { slug } = useParams();
  const card = useMemo(() => getBusinessCardBySlug(slug), [slug]);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [savedVCard, setSavedVCard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanBaseUrl = String(SITE_URL || 'https://patitas-del-sur.vercel.app').replace(/\/+$/, '');
  const shareUrl = card ? `${cleanBaseUrl}/tarjeta/${card.slug}` : cleanBaseUrl;

  // Generar QR en alta calidad (nivel H) sin depender de servicios externos
  useEffect(() => {
    if (!card || !isQrOpen) return;
    let active = true;
    const targetUrl =
      typeof window !== 'undefined' && window.location?.origin?.startsWith('http') && !window.location.hostname.includes('localhost')
        ? window.location.href
        : shareUrl;

    QRCode.toDataURL(targetUrl, {
      width: 560,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1D1D1F',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generando código QR:', err);
      });

    return () => {
      active = false;
    };
  }, [card, isQrOpen, shareUrl]);

  if (!card) {
    return (
      <div className="min-h-[100dvh] bg-[#FAF8F4] text-[#1D1D1F] flex items-center justify-center p-6">
        <SEOHead
          title="Tarjeta no encontrada"
          description="La tarjeta digital solicitada no existe en Patitas del Sur."
          noindex={true}
        />
        <div className="max-w-sm w-full bg-white rounded-3xl border border-[#1D1D1F]/10 p-8 text-center shadow-sm space-y-4">
          <img
            src="/images/logo_patitas_del_sur_amber.svg"
            alt="Patitas del Sur"
            className="h-16 mx-auto object-contain"
          />
          <h1 className="text-xl font-black tracking-tight">Tarjeta no encontrada</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            El enlace que escaneaste no corresponde a una tarjeta activa de Patitas del Sur.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/catalogo"
              className="w-full py-3 px-5 rounded-2xl bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] text-sm font-black transition-colors"
            >
              Ver Catálogo Digital
            </Link>
            <Link
              to="/"
              className="w-full py-3 px-5 rounded-2xl bg-[#1D1D1F] text-white text-sm font-bold transition-colors"
            >
              Ir a Patitas del Sur
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${card.phoneRaw}?text=${encodeURIComponent(card.whatsappMessage)}`;
  const telUrl = `tel:+${card.phoneRaw}`;
  const mailUrl = `mailto:${card.email}?subject=${encodeURIComponent('Contacto desde Tarjeta Digital · Patitas del Sur')}`;

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${shareUrl}#person`,
    name: card.fullName,
    jobTitle: card.role,
    email: `mailto:${card.email}`,
    telephone: `+${card.phoneRaw}`,
    url: shareUrl,
    worksFor: {
      '@type': 'Organization',
      name: card.company,
      url: cleanBaseUrl,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Frutillar',
      addressRegion: 'Región de Los Lagos',
      addressCountry: 'CL',
    },
    sameAs: [card.instagram?.url, card.facebook?.url].filter(Boolean),
  };

  const handleSaveContact = () => {
    const vcf = buildVCardContent(card);
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = `${card.fullName.replace(/\s+/g, '_')}_Patitas_del_Sur.vcf`;
    link.setAttribute('download', safeFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setSavedVCard(true);
    setTimeout(() => setSavedVCard(false), 2600);
  };

  const handleShareCard = async () => {
    const targetUrl =
      typeof window !== 'undefined' && window.location?.origin?.startsWith('http') && !window.location.hostname.includes('localhost')
        ? window.location.href
        : shareUrl;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.fullName} · ${card.role} | ${card.company}`,
          text: `Contacto digital de ${card.fullName} (${card.role} en ${card.company}, Frutillar):`,
          url: targetUrl,
        });
        return;
      }
    } catch {
      // Usuario canceló compartir nativo
    }

    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setIsQrOpen(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F4] text-[#1D1D1F] flex flex-col items-center justify-between px-4 py-6 sm:py-10 selection:bg-[#F5BA13] selection:text-[#1D1D1F]">
      <SEOHead
        title={`${card.fullName} · ${card.role}`}
        description={`Tarjeta de presentación digital de ${card.fullName}, ${card.role} en ${card.company} (${card.location}). WhatsApp, teléfono, correo, redes sociales y catálogo digital.`}
        canonical={`/tarjeta/${card.slug}`}
        ogImage="/images/og-patitas-frutillar.jpg"
        noindex={!card.isPublic}
        jsonLd={personSchema}
      />

      {/* Contenedor Principal de la Tarjeta NFC */}
      <main className="w-full max-w-[430px] mx-auto my-auto space-y-4">
        <article className="bg-white rounded-[2rem] border border-[#1D1D1F]/10 shadow-[0_22px_60px_-24px_rgba(29,29,31,0.22)] overflow-hidden">
          {/* =============================================================== */}
          {/* CABECERA EJECUTIVA OSCURA (LOGO ELEGANTE + MONOGRAMA)           */}
          {/* =============================================================== */}
          <header className="relative bg-[#1D1D1F] text-white px-6 pt-5 pb-8 text-center overflow-hidden">
            {/* Línea superior dorada de acento */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1D1D1F] via-[#F5BA13] to-[#D97706]"
            />
            {/* Halo sutil cálido */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-56 rounded-full bg-[#F5BA13]/14 blur-3xl"
            />

            {/* Barra superior discreta: NFC badge + QR / Compartir */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/12 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F5BA13]">
                <Wifi className="w-3 h-3 rotate-90" />
                <span>Tarjeta NFC</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsQrOpen(true)}
                  aria-label="Mostrar código QR"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#F5BA13] text-white hover:text-[#1D1D1F] border border-white/12 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleShareCard}
                  aria-label="Compartir tarjeta"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#F5BA13] text-white hover:text-[#1D1D1F] border border-white/12 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Emblema: Logo Oficial + Medallón Monograma Elegante */}
            <div className="relative z-10 flex flex-col items-center">
              <img
                src="/images/logo_patitas_del_sur_light.svg"
                alt="Patitas del Sur"
                className="h-20 sm:h-24 w-auto object-contain mb-3 drop-shadow-sm"
              />

              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-[#F5BA13] via-[#FDE68A] to-[#B45309] shadow-[0_10px_28px_-6px_rgba(245,186,19,0.45)]">
                  <div className="w-full h-full rounded-full bg-[#1D1D1F] flex items-center justify-center">
                    <span className="text-lg font-black tracking-[0.14em] text-[#F5BA13] pl-[0.14em]">
                      {card.monogram}
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-white leading-tight">
                {card.fullName}
              </h1>

              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5BA13]/15 border border-[#F5BA13]/40">
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#F5BA13]">
                  {card.role}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-xs font-bold text-white/90">{card.company}</span>
              </div>

              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/65 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#F5BA13]" />
                <span>{card.location}</span>
              </p>
            </div>
          </header>

          {/* =============================================================== */}
          {/* CUERPO DE ACCIONES DE 1 TOQUE                                   */}
          {/* =============================================================== */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* CTA Principal: Guardar Contacto (.vcf) + WhatsApp */}
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] font-black text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {savedVCard ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.6]" />
                    <span>¡Contacto listo para guardar!</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 stroke-[2.4]" />
                    <span>Guardar Contacto</span>
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" colored />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>

            {/* Accesos Rápidos: Llamar · Correo · Código QR */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={telUrl}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#FAF8F4] hover:bg-[#FEF3C7]/70 border border-[#1D1D1F]/8 transition-colors active:scale-95"
              >
                <span className="w-9 h-9 rounded-xl bg-white border border-[#1D1D1F]/8 flex items-center justify-center text-[#1D1D1F] shadow-2xs">
                  <Phone className="w-4 h-4 text-[#D97706]" />
                </span>
                <span className="text-[11px] font-extrabold text-[#1D1D1F]">Llamar</span>
              </a>

              <a
                href={mailUrl}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#FAF8F4] hover:bg-[#FEF3C7]/70 border border-[#1D1D1F]/8 transition-colors active:scale-95"
              >
                <span className="w-9 h-9 rounded-xl bg-white border border-[#1D1D1F]/8 flex items-center justify-center text-[#1D1D1F] shadow-2xs">
                  <Mail className="w-4 h-4 text-[#D97706]" />
                </span>
                <span className="text-[11px] font-extrabold text-[#1D1D1F]">Correo</span>
              </a>

              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#FAF8F4] hover:bg-[#FEF3C7]/70 border border-[#1D1D1F]/8 transition-colors active:scale-95 cursor-pointer"
              >
                <span className="w-9 h-9 rounded-xl bg-white border border-[#1D1D1F]/8 flex items-center justify-center text-[#1D1D1F] shadow-2xs">
                  <QrCode className="w-4 h-4 text-[#D97706]" />
                </span>
                <span className="text-[11px] font-extrabold text-[#1D1D1F]">Código QR</span>
              </button>
            </div>

            {/* Datos directos legibles */}
            <div className="rounded-2xl bg-[#FAF8F4] border border-[#1D1D1F]/8 divide-y divide-[#1D1D1F]/6 text-xs">
              <a
                href={telUrl}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/70 transition-colors"
              >
                <span className="font-bold text-slate-500">Teléfono</span>
                <span className="font-extrabold text-[#1D1D1F]">{card.phone}</span>
              </a>
              <a
                href={mailUrl}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/70 transition-colors"
              >
                <span className="font-bold text-slate-500">Email</span>
                <span className="font-extrabold text-[#1D1D1F] truncate">{card.email}</span>
              </a>
            </div>

            {/* Canales Oficiales y Tienda */}
            <div className="space-y-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 px-1">
                Canales Oficiales · Patitas del Sur
              </h2>

              <Link
                to="/catalogo"
                className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#F5BA13]/45 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[#F5BA13] text-[#1D1D1F] flex items-center justify-center shrink-0 shadow-2xs">
                    <ShoppingBag className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-[#1D1D1F] truncate">Catálogo Digital</div>
                    <div className="text-[11px] font-semibold text-[#78350F] truncate">
                      Stock en vivo · Despacho hoy en Frutillar
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#B45309] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                to="/"
                className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#FAF8F4] border border-[#1D1D1F]/10 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[#1D1D1F] truncate">Sitio Web</div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      patitasdelsur.cl · Tienda Online
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1D1D1F] shrink-0 transition-colors" />
              </Link>

              <a
                href={card.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#FAF8F4] border border-[#1D1D1F]/10 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF8F4] text-[#1D1D1F] border border-[#1D1D1F]/10 flex items-center justify-center shrink-0">
                    <InstagramBrandIcon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[#1D1D1F] truncate">Instagram</div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      {card.instagram.handle}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1D1D1F] shrink-0 transition-colors" />
              </a>

              <a
                href={card.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#FAF8F4] border border-[#1D1D1F]/10 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF8F4] text-[#1D1D1F] border border-[#1D1D1F]/10 flex items-center justify-center shrink-0">
                    <FacebookBrandIcon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[#1D1D1F] truncate">Facebook</div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      {card.facebook.handle}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#1D1D1F] shrink-0 transition-colors" />
              </a>
            </div>
          </div>
        </article>

        {/* Pie minimalista */}
        <footer className="text-center pb-2">
          <p className="text-[11px] font-semibold text-slate-500">
            {card.company} · Alimento y Snacks para Mascotas · Frutillar
          </p>
        </footer>
      </main>

      {/* ================================================================= */}
      {/* MODAL DE CÓDIGO QR ESCANEABLE                                     */}
      {/* ================================================================= */}
      {isQrOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1D1F]/70 backdrop-blur-xs"
          onClick={() => setIsQrOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[2rem] border border-[#1D1D1F]/10 shadow-2xl p-6 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrOpen(false)}
              aria-label="Cerrar código QR"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF8F4] hover:bg-[#FEF3C7] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#FEF3C7] text-[#78350F] text-[10px] font-black uppercase tracking-wider">
                Escanea para guardar contacto
              </span>
              <h2 id="qr-modal-title" className="text-lg font-black text-[#1D1D1F]">
                {card.fullName}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {card.role} · {card.company}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-[#FAF8F4] border border-[#1D1D1F]/10 flex flex-col items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Código QR de la tarjeta digital de ${card.fullName}`}
                  className="w-56 h-56 rounded-2xl bg-white p-2 shadow-2xs"
                />
              ) : (
                <div className="w-56 h-56 rounded-2xl bg-white animate-pulse" />
              )}
              <span className="mt-3 text-[11px] font-bold text-slate-500 break-all text-center">
                {shareUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="py-3 px-4 rounded-2xl bg-[#FAF8F4] hover:bg-[#FEF3C7] border border-[#1D1D1F]/10 text-xs font-extrabold text-[#1D1D1F] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar link'}</span>
              </button>
              <button
                type="button"
                onClick={handleShareCard}
                className="py-3 px-4 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#F5BA13]" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
