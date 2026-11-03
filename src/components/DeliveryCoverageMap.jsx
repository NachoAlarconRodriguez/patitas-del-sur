import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Compass, Layers, RotateCcw } from 'lucide-react';
import { loadGoogleMapsScript, CENTRAL_HUB } from '../services/googleMapsService.js';

// Estilo personalizado para Google Maps con estética Apple / Región de Los Lagos
const SOUTHERN_LAKES_MAP_STYLE = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#bfe3f7' }], // Azul fresco lago Llanquihue
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3b82f6' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#f3f6f0' }], // Tono naturaleza suave
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fed7aa' }], // Autopista cálida (Ruta 5 / Ruta 225)
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f97316' }, { weight: 0.8 }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e2f1dd' }],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0f172a' }, { weight: 1.2 }],
  },
];

export default function DeliveryCoverageMap({
  activeZone,
  selectedSpotId = null,
  onSelectSpot = () => {},
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleOverlayRef = useRef(null);
  const hubMarkerRef = useRef(null);
  const labelMarkerRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'terrain' | 'hybrid'
  const [, setActiveSpotTooltip] = useState(null);

  // Inicializar Google Maps
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript()
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const initialCenter = activeZone?.coordinates || {
            lat: CENTRAL_HUB.lat,
            lng: CENTRAL_HUB.lng,
          };

          const map = new maps.Map(mapContainerRef.current, {
            center: initialCenter,
            zoom: activeZone?.mapZoom || 12,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            gestureHandling: 'cooperative',
            styles: SOUTHERN_LAKES_MAP_STYLE,
            minZoom: 9,
            maxZoom: 16,
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new maps.InfoWindow();
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Error cargando Google Maps en DeliveryCoverageMap:', err);
        if (isMounted) setLoadError(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Actualizar vista, polígono/radio, bodega central y marcadores cuando cambia la comuna activa
  const updateMapForZone = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps || !activeZone) return;

    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    // Centrar mapa con animación suave
    const targetCenter = activeZone.coordinates || {
      lat: CENTRAL_HUB.lat,
      lng: CENTRAL_HUB.lng,
    };
    map.panTo(targetCenter);
    map.setZoom(activeZone.mapZoom || 12);

    // 1. Limpiar círculo de cobertura previo
    if (circleOverlayRef.current) {
      circleOverlayRef.current.setMap(null);
      circleOverlayRef.current = null;
    }

    // 2. Limpiar etiqueta flotante previa
    if (labelMarkerRef.current) {
      labelMarkerRef.current.setMap(null);
      labelMarkerRef.current = null;
    }

    // 3. Limpiar y posicionar Marcador de Bodega Central (Hub Frutillar)
    if (hubMarkerRef.current) {
      hubMarkerRef.current.setMap(null);
      hubMarkerRef.current = null;
    }

    const hubMarker = new maps.Marker({
      position: { lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng },
      map,
      title: `${CENTRAL_HUB.name} (Origen de Despachos)`,
      icon: {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="56" viewBox="0 0 48 58">
            <defs>
              <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.35"/>
              </filter>
            </defs>
            <g filter="url(#hubShadow)">
              <path d="M24 2 C11.85 2 2 11.85 2 24 C2 37.5 24 54 24 54 C24 54 46 37.5 46 24 C46 11.85 36.15 2 24 2 Z" fill="#0A3E40" stroke="#FFFFFF" stroke-width="2.5"/>
              <circle cx="24" cy="23" r="14" fill="#0E8388"/>
              <text x="24" y="28" font-size="15" text-anchor="middle" fill="#FFFFFF">🏠</text>
            </g>
          </svg>
        `),
        scaledSize: new maps.Size(42, 52),
        anchor: new maps.Point(21, 50),
      },
      zIndex: 999,
    });

    hubMarker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="font-family: inherit; padding: 6px 10px; max-width: 220px;">
            <div style="font-size: 10px; font-weight: 900; color: #0E8388; text-transform: uppercase;">Centro de Despachos</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${CENTRAL_HUB.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${CENTRAL_HUB.address}</div>
            <div style="margin-top: 6px; display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #e6f4f1; color: #0e8388; font-size: 10px; font-weight: 900;">Km 0 (Origen de Rutas)</div>
          </div>
        `);
        infoWindowRef.current.open(map, hubMarker);
      }
    });

    hubMarkerRef.current = hubMarker;

    // 4. Dibujar radio de cobertura visible sincronizado con el color y radio configurado en el Admin
    const zoneColor = activeZone.color || '#10B981';
    const radiusMeters = activeZone.coverageRadiusMeters || ((activeZone.radiusMaxKm || 7) * 1000);

    const circle = new maps.Circle({
      strokeColor: zoneColor,
      strokeOpacity: 0.9,
      strokeWeight: 2.5,
      fillColor: zoneColor,
      fillOpacity: 0.15,
      map,
      center: targetCenter,
      radius: radiusMeters,
      zIndex: 50,
    });
    circleOverlayRef.current = circle;

    // 5. Etiqueta flotante identificadora en el perímetro (Estilo Admin Panel: "Frutillar (7k) • $2.000")
    const angle = Math.PI / 4;
    const rKm = radiusMeters / 1000;
    const dLat = (rKm / 111) * Math.sin(angle);
    const dLng = (rKm / (111 * Math.cos((targetCenter.lat * Math.PI) / 180))) * Math.cos(angle);
    const labelPos = { lat: targetCenter.lat + dLat, lng: targetCenter.lng + dLng };

    const badgeText = `${activeZone.name} (${activeZone.radiusMaxKm || rKm}k) • ${activeZone.standardCost}`;

    const labelMarker = new maps.Marker({
      position: labelPos,
      map,
      title: badgeText,
      icon: {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="190" height="34" viewBox="0 0 190 34">
            <defs>
              <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
              </filter>
            </defs>
            <g filter="url(#badgeShadow)">
              <rect x="2" y="2" width="186" height="30" rx="15" fill="${zoneColor}" stroke="#ffffff" stroke-width="2"/>
              <text x="95" y="21" font-size="11.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif" fill="#ffffff" text-anchor="middle">
                ${badgeText}
              </text>
            </g>
          </svg>
        `),
        scaledSize: new maps.Size(175, 31),
        anchor: new maps.Point(87, 15),
      },
      zIndex: 100,
    });
    labelMarkerRef.current = labelMarker;

    // 6. Limpiar marcadores previos de sectores
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 7. Crear marcadores para sectores y parcelaciones
    const spots = activeZone.ruralSpots || [];
    spots.forEach((spot) => {
      const isRural = spot.type === 'parcelas' || spot.type === 'condominio';
      const pinColor = isRural ? '#15803D' : '#D97706';
      const pinLabel = isRural ? '🏡' : '📍';

      const marker = new maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map,
        title: spot.name,
        animation: maps.Animation.DROP,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                </filter>
              </defs>
              <g filter="url(#shadow)">
                <path d="M19 0 C8.5 0 0 8.5 0 19 C0 31 19 44 19 44 C19 44 38 31 38 19 C38 8.5 29.5 0 19 0 Z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="19" cy="18" r="13" fill="#FFFFFF"/>
                <text x="19" y="23" font-size="14" text-anchor="middle" font-family="sans-serif">${pinLabel}</text>
              </g>
            </svg>
          `),
          scaledSize: new maps.Size(34, 42),
          anchor: new maps.Point(17, 42),
        },
      });

      marker.addListener('click', () => {
        map.panTo(marker.getPosition());
        map.setZoom(13);
        setActiveSpotTooltip(spot);
        onSelectSpot(spot.id);

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px 12px; font-family: system-ui, -apple-system, sans-serif; max-width: 240px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 16px;">${isRural ? '🏡' : '📍'}</span>
                <strong style="font-size: 13px; color: #0F172A; font-weight: 800;">${spot.name}</strong>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.4; margin-bottom: 6px;">
                ${spot.desc || 'Despacho directo y regular hasta tu portón.'}
              </div>
              <div style="display: inline-flex; align-items: center; gap: 4px; background: #ECFDF5; color: #065F46; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; border: 1px solid #A7F3D0;">
                ✓ Cobertura Garantizada
              </div>
            </div>
          `);
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });
  }, [activeZone, onSelectSpot]);

  useEffect(() => {
    if (isLoaded) {
      updateMapForZone();
    }
  }, [isLoaded, updateMapForZone]);

  // Si se selecciona un spot desde la ficha exterior
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSpotId || !activeZone?.ruralSpots) return;
    const foundSpot = activeZone.ruralSpots.find((s) => s.id === selectedSpotId);
    if (foundSpot) {
      mapInstanceRef.current.panTo({ lat: foundSpot.lat, lng: foundSpot.lng });
      mapInstanceRef.current.setZoom(13);
      setActiveSpotTooltip(foundSpot);
    }
  }, [selectedSpotId, activeZone]);

  // Cambiar tipo de mapa
  const handleToggleMapType = () => {
    if (!mapInstanceRef.current) return;
    const nextType = mapType === 'roadmap' ? 'terrain' : mapType === 'terrain' ? 'hybrid' : 'roadmap';
    setMapType(nextType);
    mapInstanceRef.current.setMapTypeId(nextType);
  };

  // Re-centrar en la comuna
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !activeZone?.coordinates) return;
    mapInstanceRef.current.panTo(activeZone.coordinates);
    mapInstanceRef.current.setZoom(activeZone.mapZoom || 12);
    setActiveSpotTooltip(null);
    if (infoWindowRef.current) infoWindowRef.current.close();
  };

  return (
    <div
      className={`relative w-full h-[380px] sm:h-[440px] lg:h-full min-h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 flex flex-col ${className}`}
    >
      {/* Contenedor del Mapa Nativo de Google Maps */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Fallback elegante si no carga el mapa por conexión */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Compass className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Mapa de Cobertura Activo</h4>
          <p className="text-xs text-slate-600 max-w-sm mt-1">
            Repartimos a todo el radio urbano y parcelaciones de {activeZone?.name}.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
            {activeZone?.ruralSpots?.map((spot) => (
              <span
                key={spot.id}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
              >
                {spot.type === 'parcelas' ? '🏡' : '📍'} {spot.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controles Flotantes Superiores Derechos (Zoom / Capas / Re-centrar) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggleMapType}
          title={`Cambiar vista (Actual: ${mapType})`}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl backdrop-blur-md bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Layers className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline capitalize">{mapType === 'roadmap' ? 'Relieve' : 'Calles'}</span>
        </button>

        <button
          type="button"
          onClick={handleRecenter}
          title="Centrar en la comuna"
          className="p-2 rounded-xl backdrop-blur-md bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-sm text-xs font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
