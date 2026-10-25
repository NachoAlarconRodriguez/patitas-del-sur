import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Compass, Search, MapPin, Layers, Navigation, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { loadGoogleMapsScript, CENTRAL_HUB } from '../services/googleMapsService.js';

// Format currency CLP helper
const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function DispatchGoogleMap({
  dispatchZones = [],
  selectedZoneId = null,
  onSelectZone = () => {},
  simulatedAddress = 'Alerce Norte, Puerto Varas',
  simulatedDistanceKm = 11.5,
  onAddressSelected = () => {},
}) {
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hubMarkerRef = useRef(null);
  const hubInfoWindowRef = useRef(null);
  const destMarkerRef = useRef(null);
  const destInfoWindowRef = useRef(null);
  const routeLineRef = useRef(null);
  const circlesRef = useRef([]);
  const labelMarkersRef = useRef([]);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'hybrid' | 'terrain'
  const [localSearchQuery, setLocalSearchQuery] = useState(simulatedAddress || '');
  const [isSearching, setIsSearching] = useState(false);

  // 1. Inicializar Google Maps
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = new maps.Map(mapContainerRef.current, {
            center: { lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng },
            zoom: 11,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            styles: [
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#a3d3f5' }],
              },
              {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#f5f7f4' }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#fb923c' }],
              },
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          mapInstanceRef.current = map;

          // Marcador de Bodega Central (Hub)
          const hubMarker = new maps.Marker({
            position: { lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng },
            map,
            title: CENTRAL_HUB.name,
            icon: {
              url:
                'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
                  <defs>
                    <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4"/>
                    </filter>
                  </defs>
                  <g filter="url(#hubShadow)">
                    <path d="M24 2 C11.85 2 2 11.85 2 24 C2 37.5 24 54 24 54 C24 54 46 37.5 46 24 C46 11.85 36.15 2 24 2 Z" fill="#0A3E40" stroke="#FFFFFF" stroke-width="2.5"/>
                    <circle cx="24" cy="23" r="14" fill="#0E8388"/>
                    <text x="24" y="28" font-size="15" text-anchor="middle" fill="#FFFFFF">🏠</text>
                  </g>
                </svg>
              `),
              scaledSize: new maps.Size(48, 58),
              anchor: new maps.Point(24, 54),
            },
            zIndex: 9999,
          });

          const hubInfoWindow = new maps.InfoWindow({
            content: `
              <div style="font-family: inherit; padding: 6px 10px; max-width: 220px;">
                <div style="font-size: 10px; font-weight: 900; color: #0E8388; text-transform: uppercase; letter-spacing: 0.5px;">Centro de Despachos</div>
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${CENTRAL_HUB.name}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${CENTRAL_HUB.address}</div>
                <div style="margin-top: 6px; display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #e6f4f1; color: #0e8388; font-size: 10px; font-weight: 900;">Km 0 (Origen de Rutas)</div>
              </div>
            `,
          });

          hubMarker.addListener('click', () => {
            hubInfoWindow.open(map, hubMarker);
          });

          hubMarkerRef.current = hubMarker;
          hubInfoWindowRef.current = hubInfoWindow;

          // Autocomplete de Google Places en el buscador
          if (searchInputRef.current && maps.places?.Autocomplete) {
            const autocomplete = new maps.places.Autocomplete(searchInputRef.current, {
              componentRestrictions: { country: 'cl' },
              fields: ['formatted_address', 'geometry', 'name'],
            });

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place?.geometry?.location) {
                const destLat = place.geometry.location.lat();
                const destLng = place.geometry.location.lng();
                const addressName = place.formatted_address || place.name || 'Destino seleccionado';

                // Calcular distancia geodésica real en KM con la librería geometry
                let distKm = 0;
                if (maps.geometry?.spherical) {
                  const hubLatLng = new maps.LatLng(CENTRAL_HUB.lat, CENTRAL_HUB.lng);
                  const destLatLng = new maps.LatLng(destLat, destLng);
                  const meters = maps.geometry.spherical.computeDistanceBetween(hubLatLng, destLatLng);
                  distKm = Math.round((meters / 1000) * 10) / 10;
                } else {
                  // Fallback Haversine
                  const toRad = (x) => (x * Math.PI) / 180;
                  const R = 6371;
                  const dLat = toRad(destLat - CENTRAL_HUB.lat);
                  const dLon = toRad(destLng - CENTRAL_HUB.lng);
                  const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(CENTRAL_HUB.lat)) *
                      Math.cos(toRad(destLat)) *
                      Math.sin(dLon / 2) *
                      Math.sin(dLon / 2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                  distKm = Math.round(R * c * 10) / 10;
                }

                setLocalSearchQuery(addressName);
                onAddressSelected({
                  address: addressName,
                  distanceKm: distKm,
                  lat: destLat,
                  lng: destLng,
                });

                // Posicionar destino en el mapa
                renderDestinationOnMap(destLat, destLng, addressName, distKm);
              }
            });
          }
        }

        setIsMapLoaded(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error al inicializar Google Maps:', err);
        setLoadError(err.message || 'No fue posible cargar Google Maps');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Renderizar o actualizar las Zonas de Despacho (Círculos Radiales Reales)
  useEffect(() => {
    if (!isMapLoaded || !window.google?.maps || !mapInstanceRef.current) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    // Limpiar círculos anteriores
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    // Limpiar marcadores de etiquetas anteriores
    labelMarkersRef.current.forEach((m) => m.setMap(null));
    labelMarkersRef.current = [];

    if (!dispatchZones || dispatchZones.length === 0) return;

    // Ordenar de mayor a menor radio para renderizar correctamente y que los interiores tengan zIndex superior
    const sortedZones = [...dispatchZones].sort(
      (a, b) => (b.radiusMaxKm || 0) - (a.radiusMaxKm || 0)
    );

    sortedZones.forEach((zone, idx) => {
      const radiusMeters = Math.max(1, parseFloat(zone.radiusMaxKm) || 5) * 1000;
      const isSelected = zone.id === selectedZoneId;
      const color = zone.color || '#10B981';

      // Círculo geográfico real en metros proyectado sobre el mapa
      const circle = new maps.Circle({
        center: { lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng },
        radius: radiusMeters,
        strokeColor: color,
        strokeOpacity: isSelected ? 0.95 : 0.65,
        strokeWeight: isSelected ? 3.5 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.22 : 0.1,
        map,
        clickable: true,
        zIndex: 50 + (sortedZones.length - idx),
      });

      // InfoWindow informativa al hacer clic en el círculo
      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="font-family: inherit; padding: 6px 10px; max-width: 240px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
              <strong style="font-size: 13px; color: #0f172a;">${zone.name || 'Zona de Despacho'}</strong>
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">
              Cobertura radial: <strong>Hasta ${zone.radiusMaxKm} km</strong>
            </div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">
              Tarifa estándar: <strong>${zone.baseFee === 0 ? 'GRATIS' : formatCLP(zone.baseFee)}</strong>
            </div>
            ${
              zone.freeThreshold > 0
                ? `<div style="font-size: 10px; color: #0284c7; margin-top: 3px; font-weight: 700;">
                     Envío gratis sobre ${formatCLP(zone.freeThreshold)}
                   </div>`
                : ''
            }
          </div>
        `,
      });

      circle.addListener('click', (e) => {
        onSelectZone(zone.id);
        infoWindow.setPosition(e.latLng);
        infoWindow.open(map);
      });

      circlesRef.current.push(circle);

      // Etiqueta flotante identificadora en el perímetro del círculo (lado Este/Noreste)
      const angle = (Math.PI / 4) + idx * 0.15;
      const rKm = zone.radiusMaxKm || 5;
      const dLat = (rKm / 111) * Math.sin(angle);
      const dLng = (rKm / (111 * Math.cos((CENTRAL_HUB.lat * Math.PI) / 180))) * Math.cos(angle);
      const labelPos = { lat: CENTRAL_HUB.lat + dLat, lng: CENTRAL_HUB.lng + dLng };

      const feeText = zone.baseFee === 0 ? 'Gratis' : formatCLP(zone.baseFee);
      const labelMarker = new maps.Marker({
        position: labelPos,
        map,
        title: `${zone.name} - Hasta ${zone.radiusMaxKm} km`,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="130" height="26" viewBox="0 0 130 26">
              <rect x="1" y="1" width="128" height="24" rx="12" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" />
              <text x="65" y="16" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9.5" font-weight="900" text-anchor="middle" fill="#FFFFFF">
                ${zone.name} (${zone.radiusMaxKm}k) • ${feeText}
              </text>
            </svg>
          `),
          scaledSize: new maps.Size(130, 26),
          anchor: new maps.Point(65, 13),
        },
        zIndex: 200 + idx,
      });

      labelMarker.addListener('click', () => {
        onSelectZone(zone.id);
        infoWindow.setPosition(labelPos);
        infoWindow.open(map);
      });

      labelMarkersRef.current.push(labelMarker);
    });
  }, [isMapLoaded, dispatchZones, selectedZoneId, onSelectZone]);

  // 3. Renderizar Destino Simulado y Vector de Entrega
  const renderDestinationOnMap = useCallback(
    (destLat, destLng, addressText, distKm) => {
      if (!isMapLoaded || !window.google?.maps || !mapInstanceRef.current) return;
      const maps = window.google.maps;
      const map = mapInstanceRef.current;

      // Limpiar marcador anterior
      if (destMarkerRef.current) {
        destMarkerRef.current.setMap(null);
      }
      if (routeLineRef.current) {
        routeLineRef.current.setMap(null);
      }

      // Marcador de destino (Pin rojo animado)
      const destMarker = new maps.Marker({
        position: { lat: destLat, lng: destLng },
        map,
        title: addressText,
        animation: maps.Animation.DROP,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
              <defs>
                <filter id="destShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4"/>
                </filter>
              </defs>
              <g filter="url(#destShadow)">
                <path d="M20 2 C10.05 2 2 10.05 2 20 C2 31.5 20 46 20 46 C20 46 38 31.5 38 20 C38 10.05 29.95 2 20 2 Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="2.5"/>
                <circle cx="20" cy="19" r="11" fill="#FFFFFF"/>
                <text x="20" y="24" font-size="12" text-anchor="middle" fill="#EF4444">📍</text>
              </g>
            </svg>
          `),
          scaledSize: new maps.Size(40, 50),
          anchor: new maps.Point(20, 46),
        },
        zIndex: 9998,
      });

      // Determinar la tarifa de la zona correspondiente
      const sorted = [...dispatchZones].sort((a, b) => (a.radiusMaxKm || 0) - (b.radiusMaxKm || 0));
      const matchedZone = sorted.find((z) => distKm <= (z.radiusMaxKm ?? 999));
      const feeText = matchedZone ? (matchedZone.baseFee === 0 ? 'GRATIS' : formatCLP(matchedZone.baseFee)) : 'Fuera de Cobertura';

      const destInfoWindow = new maps.InfoWindow({
        content: `
          <div style="font-family: inherit; padding: 6px 10px; max-width: 230px;">
            <div style="font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase;">Dirección de Entrega</div>
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 2px;">${addressText}</div>
            <div style="margin-top: 6px; padding: 4px 8px; border-radius: 8px; background: #fef2f2; border: 1px solid #fee2e2; font-size: 11px;">
              <div style="color: #991b1b; font-weight: 700;">Distancia: ${distKm} km</div>
              <div style="color: #0f172a; font-weight: 800; margin-top: 1px;">Tarifa: ${feeText}</div>
            </div>
          </div>
        `,
      });

      destMarker.addListener('click', () => {
        destInfoWindow.open(map, destMarker);
      });

      destMarkerRef.current = destMarker;
      destInfoWindowRef.current = destInfoWindow;

      // Línea de ruta directa punteada
      const routeLine = new maps.Polyline({
        path: [
          { lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng },
          { lat: destLat, lng: destLng },
        ],
        geodesic: true,
        strokeColor: '#EF4444',
        strokeOpacity: 0.8,
        strokeWeight: 3.5,
        map,
      });
      routeLineRef.current = routeLine;

      // Ajustar encuadre para mostrar tanto la Bodega como el Destino
      const bounds = new maps.LatLngBounds();
      bounds.extend({ lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng });
      bounds.extend({ lat: destLat, lng: destLng });
      map.fitBounds(bounds, { top: 70, right: 50, bottom: 50, left: 50 });
    },
    [isMapLoaded, dispatchZones]
  );

  // 4. Manejar búsqueda manual rápida (ej. presionar Enter)
  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!localSearchQuery.trim() || !window.google?.maps) return;

    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      {
        address: `${localSearchQuery.trim()}, Región de Los Lagos, Chile`,
        componentRestrictions: { country: 'cl' },
      },
      (results, status) => {
        setIsSearching(false);
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const destLat = loc.lat();
          const destLng = loc.lng();
          const addr = results[0].formatted_address || localSearchQuery;

          let distKm = 0;
          if (window.google.maps.geometry?.spherical) {
            const hubLatLng = new window.google.maps.LatLng(CENTRAL_HUB.lat, CENTRAL_HUB.lng);
            distKm =
              Math.round(
                (window.google.maps.geometry.spherical.computeDistanceBetween(hubLatLng, loc) /
                  1000) *
                  10
              ) / 10;
          }

          onAddressSelected({
            address: addr,
            distanceKm: distKm,
            lat: destLat,
            lng: destLng,
          });

          renderDestinationOnMap(destLat, destLng, addr, distKm);
        }
      }
    );
  };

  // Controles de zoom y centrado
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng });
      mapInstanceRef.current.setZoom(11);
    }
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full relative">
      {/* Header del Mapa & Barra de Herramientas */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-white flex items-center justify-center shadow-xs shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-slate-900 text-base block truncate flex items-center gap-1.5">
              <span>Mapa de Cobertura y Distancias</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Google Maps Real
              </span>
            </span>
            <p className="text-xs text-slate-500 font-medium truncate">
              Bodega Central: {CENTRAL_HUB.address}
            </p>
          </div>
        </div>

        {/* Controles de Vista & Zoom */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Selector de Tipo de Mapa */}
          <div className="hidden sm:inline-flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => handleMapTypeChange('roadmap')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                mapType === 'roadmap' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mapa
            </button>
            <button
              type="button"
              onClick={() => handleMapTypeChange('hybrid')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                mapType === 'hybrid' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satélite
            </button>
            <button
              type="button"
              onClick={() => handleMapTypeChange('terrain')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                mapType === 'terrain' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Relieve
            </button>
          </div>

          {/* Zoom & Centrado */}
          <div className="inline-flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-black cursor-pointer text-base rounded-lg hover:bg-slate-100"
              title="Acercar mapa"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-black cursor-pointer border-l border-slate-200 text-base rounded-lg hover:bg-slate-100"
              title="Alejar mapa"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="px-2.5 h-8 flex items-center justify-center text-slate-700 hover:text-[#0E8388] font-bold cursor-pointer border-l border-slate-200 text-xs rounded-lg hover:bg-slate-100"
              title="Re-centrar en Bodega Central"
            >
              Centrar
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor del Mapa Real de Google */}
      <div className="relative w-full h-[580px] bg-slate-100 flex-1">
        {/* Barra Flotante de Búsqueda y Prueba de Dirección con Autocomplete */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-20 pointer-events-auto">
          <form
            onSubmit={handleManualSearch}
            className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 w-full transition-all focus-within:ring-2 focus-within:ring-[#0E8388]"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Escribe una dirección para probar (ej. Llanquihue, Frutillar, Alerce, Puerto Montt)..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs font-bold focus:outline-hidden placeholder:text-slate-400 placeholder:font-medium"
            />
            {isSearching && (
              <span className="text-[10px] text-slate-400 font-medium shrink-0 animate-pulse">
                Calculando...
              </span>
            )}
            {simulatedDistanceKm > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs shrink-0 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <span>📍</span>
                <span>{simulatedDistanceKm} km</span>
              </span>
            )}
          </form>
        </div>

        {/* DOM real para la instancia de Google Maps */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Estado de carga con indicador elegante */}
        {!isMapLoaded && !loadError && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-10 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] flex items-center justify-center mb-3">
              <Compass className="w-6 h-6 animate-spin" />
            </div>
            <span className="text-sm font-black text-slate-800">Cargando Google Maps en tiempo real...</span>
            <p className="text-xs text-slate-500 font-medium mt-1">Conectando con la API de mapas y trazando cuadrante de Los Lagos.</p>
          </div>
        )}

        {/* Estado de error si la API de Google Maps falla */}
        {loadError && (
          <div className="absolute inset-0 bg-rose-50/95 flex flex-col items-center justify-center p-6 text-center z-10">
            <AlertCircle className="w-10 h-10 text-rose-600 mb-2" />
            <span className="text-sm font-black text-rose-900">No se pudo cargar Google Maps</span>
            <p className="text-xs text-rose-700 max-w-sm mt-1">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-rose-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Watermark / Badge informativo inferior */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Google Maps API Activa • Región de Los Lagos</span>
        </div>

        {/* Leyenda flotante de Zonas Activas */}
        {dispatchZones.length > 0 && (
          <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-lg hidden md:flex items-center gap-2.5 text-[11px] font-bold text-slate-800">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mr-0.5">
              Zonas:
            </span>
            {dispatchZones.map((z, idx) => (
              <button
                key={z.id || idx}
                type="button"
                onClick={() => onSelectZone(z.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  z.id === selectedZoneId
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: z.color || '#10B981' }} />
                <span>{z.name || `Zona ${idx + 1}`}</span>
                <span className="text-[10px] opacity-75 font-mono">({z.radiusMaxKm}k)</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
