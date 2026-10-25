/**
 * Google Maps & Places Integration Service for Patitas del Sur
 * 
 * Features:
 * - Dynamic asynchronous script loader with error handling & offline fallback
 * - Places Autocomplete restricted to Chile (country: 'cl') and biased to Región de Los Lagos
 * - Filtered strictly to allowed delivery communes: Frutillar, Casma, Fresia, Totoral, Llanquihue, Puerto Varas, Puerto Octay
 * - Zero-cost 1-Tap navigation intent URLs (Mobile Google Maps App & Desktop)
 * - In-browser multi-stop route optimizer (Traveling Salesperson / Nearest Neighbor) from Central Hub
 */

export const GOOGLE_MAPS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyAAD80GKT7xJBMfWPMHRGZxlRfq2Nnt9zw';

// Bodega Central / Centro de Operaciones
export const CENTRAL_HUB = {
  name: 'Bodega Central Patitas del Sur',
  address: 'Loteo Espacio Frutillar, Frutillar, Región de Los Lagos, Chile',
  city: 'Frutillar',
  lat: -41.08985,
  lng: -73.08013,
};

// Comunas permitidas para despacho
export const ALLOWED_COMMUNES = [
  'Puerto Varas',
  'Llanquihue',
  'Frutillar',
  'Casma',
  'Fresia',
  'Totoral',
  'Puerto Octay',
];

// Coordenadas de referencia para cada comuna (para cálculo de proximidad y fallback)
export const TOWN_COORDINATES = {
  'Puerto Varas': { lat: -41.3195, lng: -72.9854 },
  'Llanquihue': { lat: -41.2547, lng: -73.0075 },
  'Frutillar': { lat: -41.1278, lng: -73.0456 },
  'Casma': { lat: -41.0500, lng: -73.1833 },
  'Fresia': { lat: -41.1500, lng: -73.4167 },
  'Totoral': { lat: -41.2800, lng: -72.8800 },
  'Puerto Octay': { lat: -40.9739, lng: -72.8856 },
  'Alerce': { lat: -41.3965, lng: -72.9102 },
};

// Base referencial offline de calles para respaldo garantizado
export const LOCAL_FALLBACK_STREETS = [
  // Frutillar (Incluye Bodega Central, Condominios y Calles Principales)
  { street: 'Loteo Espacio Frutillar', city: 'Frutillar', sector: 'Sector Pantanosa / Bodega Central' },
  { street: 'Espacio Frutillar', city: 'Frutillar', sector: 'Loteo Residencial' },
  { street: 'Av. Bernardo Philippi 1250', city: 'Frutillar', sector: 'Costanera Bajo' },
  { street: 'Calle Carlos Richter 310', city: 'Frutillar', sector: 'Frutillar Alto' },
  { street: 'Calle Cristino Winkler 420', city: 'Frutillar', sector: 'Centro' },
  { street: 'Camino a Punta Larga Km 3', city: 'Frutillar', sector: 'Punta Larga' },
  { street: 'Condominio Reserva Frutillar', city: 'Frutillar', sector: 'Residencial' },
  { street: 'Condominio Los Colonos Frutillar', city: 'Frutillar', sector: 'Residencial' },
  { street: 'Camino a Quilanto Km 5', city: 'Frutillar', sector: 'Rural' },
  { street: 'Calle Arturo Alessandri 540', city: 'Frutillar', sector: 'Frutillar Alto' },
  { street: 'Av. Carlos Sprenger 210', city: 'Frutillar', sector: 'Frutillar Alto' },

  // Puerto Varas
  { street: 'San Francisco 412', city: 'Puerto Varas', sector: 'Centro' },
  { street: 'Calle Del Salvador 340', city: 'Puerto Varas', sector: 'Centro' },
  { street: 'Calle Santa Rosa 450', city: 'Puerto Varas', sector: 'Costanera' },
  { street: 'Calle Walker Martínez 280', city: 'Puerto Varas', sector: 'Centro' },
  { street: 'Av. Gramado 120', city: 'Puerto Varas', sector: 'Entrada Norte' },
  { street: 'Calle San Pedro 210', city: 'Puerto Varas', sector: 'Centro' },
  { street: 'Av. Los Colonos 1420', city: 'Puerto Varas', sector: 'Residencial' },
  { street: 'Condominio Parque Doña Ema', city: 'Puerto Varas', sector: 'Residencial' },
  { street: 'Camino a Ensenada Km 2', city: 'Puerto Varas', sector: 'Ruta Ch-225' },
  { street: 'Av. Vicente Pérez Rosales 1050', city: 'Puerto Varas', sector: 'Costanera' },
  { street: 'Condominio Santa Rosa de Puerto Varas', city: 'Puerto Varas', sector: 'Residencial' },

  // Llanquihue
  { street: 'Av. Vicente Pérez Rosales 890', city: 'Llanquihue', sector: 'Costanera' },
  { street: 'Calle Baquedano 410', city: 'Llanquihue', sector: 'Centro' },
  { street: 'Calle O\'Higgins 320', city: 'Llanquihue', sector: 'Centro' },
  { street: 'Calle Errázuriz 150', city: 'Llanquihue', sector: 'Centro' },
  { street: 'Condominio Los Volcanes', city: 'Llanquihue', sector: 'Residencial' },

  // Fresia
  { street: 'Calle San Carlos 250', city: 'Fresia', sector: 'Centro' },
  { street: 'Av. Trautmann 180', city: 'Fresia', sector: 'Acceso' },
  { street: 'Calle Bernardo O\'Higgins 410', city: 'Fresia', sector: 'Centro' },

  // Casma
  { street: 'Av. Principal s/n', city: 'Casma', sector: 'Centro' },
  { street: 'Calle Los Laureles 120', city: 'Casma', sector: 'Centro' },
  { street: 'Camino Casma - Frutillar', city: 'Casma', sector: 'Rural' },

  // Totoral
  { street: 'Camino a Totoral Km 4', city: 'Totoral', sector: 'Costanera' },
  { street: 'Costanera Totoral s/n', city: 'Totoral', sector: 'Costanera' },

  // Puerto Octay
  { street: 'Calle Pedro Montt 150', city: 'Puerto Octay', sector: 'Centro' },
  { street: 'Calle Independencia 340', city: 'Puerto Octay', sector: 'Plaza' },
  { street: 'Camino a Centinela Km 2', city: 'Puerto Octay', sector: 'Península' },
];

let googleMapsScriptPromise = null;
let placesServiceInstance = null;
let autocompleteServiceInstance = null;

/**
 * Carga el script de Google Maps API de forma dinámica y única
 */
export function loadGoogleMapsScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google?.maps));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places,geometry&language=es&region=CL`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API script loaded but window.google.maps is undefined'));
      }
    };

    script.onerror = (err) => {
      console.warn('Error loading Google Maps API script:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

/**
 * Normaliza nombres de comunas
 */
export function normalizeCommune(cityName = '') {
  const clean = cityName.trim().toLowerCase();
  for (const allowed of ALLOWED_COMMUNES) {
    if (clean.includes(allowed.toLowerCase()) || allowed.toLowerCase().includes(clean)) {
      return allowed;
    }
  }
  return cityName.trim();
}

/**
 * Detecta de forma inteligente y exacta la comuna de despacho a partir de un texto
 * de dirección o de los addressComponents de Google Maps.
 * Evita el falso positivo de 'Provincia de Llanquihue' frente a comunas como Frutillar, Fresia, etc.
 */
export function detectCommuneFromAddress(fullText = '', addressComponents = []) {
  // 1. Si tenemos addressComponents de Google Maps
  if (Array.isArray(addressComponents) && addressComponents.length > 0) {
    // Prioridad 1: administrative_area_level_3 (Comuna oficial en Chile)
    const admin3 = addressComponents.find((c) =>
      c.types?.includes('administrative_area_level_3')
    );
    const admin3Name = admin3?.longText || admin3?.long_name || '';
    if (admin3Name) {
      for (const com of ALLOWED_COMMUNES) {
        if (
          admin3Name.toLowerCase().includes(com.toLowerCase()) ||
          com.toLowerCase().includes(admin3Name.toLowerCase())
        ) {
          return com;
        }
      }
    }

    // Prioridad 2: locality (Ciudad o pueblo, ej: Frutillar, Puerto Varas)
    const localityComp = addressComponents.find((c) =>
      c.types?.includes('locality')
    );
    const localityName = localityComp?.longText || localityComp?.long_name || '';
    if (localityName) {
      for (const com of ALLOWED_COMMUNES) {
        if (
          localityName.toLowerCase().includes(com.toLowerCase()) ||
          com.toLowerCase().includes(localityName.toLowerCase())
        ) {
          return com;
        }
      }
    }

    // Prioridad 3: sublocality / neighborhood
    const subComp = addressComponents.find((c) =>
      c.types?.includes('sublocality') || c.types?.includes('neighborhood')
    );
    const subName = subComp?.longText || subComp?.long_name || '';
    if (subName) {
      for (const com of ALLOWED_COMMUNES) {
        if (
          subName.toLowerCase().includes(com.toLowerCase()) ||
          com.toLowerCase().includes(subName.toLowerCase())
        ) {
          return com;
        }
      }
    }
  }

  // 2. Si buscamos en texto completo (fullText o description de Places)
  if (!fullText || typeof fullText !== 'string') return null;

  // Limpiar "Provincia de Llanquihue" para no generar falsos positivos con la comuna de Llanquihue
  const cleanedText = fullText
    .replace(/provincia\s+de\s+llanquihue/gi, '')
    .toLowerCase();

  // Priorizar comunas más específicas primero (Llanquihue al final)
  const prioritizedCommunes = [
    'Frutillar',
    'Puerto Varas',
    'Puerto Octay',
    'Fresia',
    'Casma',
    'Totoral',
    'Llanquihue',
  ];

  for (const com of prioritizedCommunes) {
    const regex = new RegExp(`\\b${com.toLowerCase()}\\b`, 'i');
    if (regex.test(cleanedText)) {
      return com;
    }
  }

  for (const com of prioritizedCommunes) {
    if (cleanedText.includes(com.toLowerCase())) {
      return com;
    }
  }

  return null;
}

/**
 * Verifica si una dirección o comuna está dentro de las comunas permitidas
 */
export function isAllowedDeliveryArea(text = '') {
  const lower = (text || '').toLowerCase();
  return ALLOWED_COMMUNES.some((commune) => lower.includes(commune.toLowerCase()));
}

/**
 * Obtiene sugerencias de autocompletado desde Google Places Autocomplete
 * Restringido a Chile y con sesgo geográfico a la cuenca del Lago Llanquihue
 */
export async function getGooglePlacePredictions(inputQuery) {
  if (!inputQuery || inputQuery.trim().length < 2) return [];

  const query = inputQuery.trim();

  try {
    const maps = await loadGoogleMapsScript();

    // Importar librería moderna de places
    let placesLib = null;
    if (typeof maps.importLibrary === 'function') {
      try {
        placesLib = await maps.importLibrary('places');
      } catch (libErr) {
        console.warn('places library import error, using maps.places:', libErr);
        placesLib = maps.places;
      }
    } else {
      placesLib = maps.places;
    }

    // Helper para extraer texto seguro de los objetos FormattedText de Google
    const extractText = (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val.text === 'string') return val.text;
      if (typeof val.toString === 'function') return val.toString();
      return String(val);
    };

    // 1. Método moderno: Places API (New) - AutocompleteSuggestion
    if (placesLib?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      try {
        const centerLocation = new maps.LatLng(-41.25, -72.95);
        const request = {
          input: query,
          includedRegionCodes: ['cl'],
          locationBias: new maps.Circle({
            center: centerLocation,
            radius: 45000,
          }),
        };

        const response = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        const suggestions = response?.suggestions || [];

        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const formatted = suggestions
            .map((sug) => {
              const pred = sug.placePrediction;
              if (!pred) return null;

              const placeId = pred.placeId;
              const mainText = extractText(pred.mainText) || extractText(pred.text);
              const secondaryText = extractText(pred.secondaryText);
              const fullDescription =
                extractText(pred.text) || (secondaryText ? `${mainText}, ${secondaryText}` : mainText);

              // Detectar comuna de la predicción de forma exacta
              const detectedCity =
                detectCommuneFromAddress(fullDescription) ||
                detectCommuneFromAddress(secondaryText) ||
                detectCommuneFromAddress(mainText) ||
                'Puerto Varas';

              const inZone = isAllowedDeliveryArea(fullDescription) || isAllowedDeliveryArea(secondaryText);

              return {
                placeId,
                address: mainText,
                mainText,
                secondaryText,
                region: 'Región de Los Lagos',
                fullAddress: fullDescription,
                city: detectedCity,
                isAllowedZone: inZone,
                source: 'google',
              };
            })
            .filter(Boolean);

          if (formatted.length > 0) {
            formatted.sort((a, b) => {
              if (a.isAllowedZone && !b.isAllowedZone) return -1;
              if (!a.isAllowedZone && b.isAllowedZone) return 1;
              return 0;
            });

            return formatted.slice(0, 6);
          }
        }
      } catch (newApiErr) {
        console.warn('AutocompleteSuggestion.fetchAutocompleteSuggestions warning:', newApiErr);
      }
    }

    // 2. Fallback método clásico: AutocompleteService
    if (placesLib?.AutocompleteService) {
      if (!autocompleteServiceInstance) {
        autocompleteServiceInstance = new placesLib.AutocompleteService();
      }

      return await new Promise((resolve) => {
        const centerLocation = new maps.LatLng(-41.25, -72.95);
        const request = {
          input: query,
          componentRestrictions: { country: 'cl' },
          locationBias: new maps.Circle({
            center: centerLocation,
            radius: 45000,
          }),
        };

        autocompleteServiceInstance.getPlacePredictions(request, (predictions, status) => {
          if (
            status === (maps.places?.PlacesServiceStatus?.OK || 'OK') &&
            Array.isArray(predictions) &&
            predictions.length > 0
          ) {
            const formatted = predictions.map((pred) => {
              const mainText = pred.structured_formatting?.main_text || pred.description;
              const secondaryText = pred.structured_formatting?.secondary_text || '';
              const fullDescription = pred.description || '';

              // Detectar comuna de la predicción de forma exacta
              const detectedCity =
                detectCommuneFromAddress(fullDescription) ||
                detectCommuneFromAddress(secondaryText) ||
                detectCommuneFromAddress(mainText) ||
                'Puerto Varas';

              const inZone = isAllowedDeliveryArea(fullDescription) || isAllowedDeliveryArea(secondaryText);

              return {
                placeId: pred.place_id,
                address: mainText,
                mainText,
                secondaryText,
                region: 'Región de Los Lagos',
                fullAddress: fullDescription,
                city: detectedCity,
                isAllowedZone: inZone,
                source: 'google',
              };
            });

            formatted.sort((a, b) => {
              if (a.isAllowedZone && !b.isAllowedZone) return -1;
              if (!a.isAllowedZone && b.isAllowedZone) return 1;
              return 0;
            });

            resolve(formatted.slice(0, 6));
          } else {
            resolve(getFallbackPredictions(query));
          }
        });
      });
    }

    // Respaldo offline garantizado
    return getFallbackPredictions(query);
  } catch (err) {
    console.warn('Error fetching Google Place predictions:', err);
    return getFallbackPredictions(query);
  }
}

/**
 * Respaldo local inteligente para búsquedas de calles cuando no hay red o cuota
 */
export function getFallbackPredictions(query) {
  const clean = (query || '').toLowerCase().trim();
  if (!clean || clean.length < 2) return [];

  // 1. Detectar si el usuario escribió o mencionó explícitamente alguna comuna en su texto (ej: "Espacio Frutillar")
  let detectedCommune = null;
  for (const commune of ALLOWED_COMMUNES) {
    if (clean.includes(commune.toLowerCase())) {
      detectedCommune = commune;
      break;
    }
  }

  // 2. Buscar en el catálogo local de calles y loteos reales
  const matched = LOCAL_FALLBACK_STREETS.filter((p) => {
    const sLower = p.street.toLowerCase();
    const cLower = p.city.toLowerCase();
    const secLower = (p.sector || '').toLowerCase();

    // Si el usuario especificó una comuna (ej. "Frutillar"), restringir estrictamente a esa comuna
    if (detectedCommune && cLower !== detectedCommune.toLowerCase()) {
      return false;
    }

    return (
      sLower.includes(clean) ||
      clean.includes(sLower) ||
      secLower.includes(clean) ||
      `${sLower} ${cLower}`.includes(clean)
    );
  });

  const results = matched.map((m) => ({
    placeId: `local-${m.street}-${m.city}`,
    address: m.street,
    mainText: m.street,
    secondaryText: `${m.city}, Región de Los Lagos, Chile`,
    region: 'Región de Los Lagos',
    fullAddress: `${m.street}, ${m.city}, Chile`,
    city: m.city,
    isAllowedZone: true,
    source: 'local',
  }));

  // 3. Si escribió una comuna explícita (ej. "Espacio Frutillar", "Philippi Frutillar"):
  if (detectedCommune) {
    // Asegurar que exista una sugerencia única para esa comuna, ¡y NUNCA duplicar a otras comunas!
    const alreadyPresent = results.some(
      (r) => r.city.toLowerCase() === detectedCommune.toLowerCase() && r.mainText.toLowerCase() === query.trim().toLowerCase()
    );

    if (!alreadyPresent) {
      results.unshift({
        placeId: `gen-${detectedCommune}-${clean}`,
        address: query.trim(),
        mainText: query.trim(),
        secondaryText: `${detectedCommune}, Región de Los Lagos, Chile`,
        region: 'Región de Los Lagos',
        fullAddress: `${query.trim()}, ${detectedCommune}, Chile`,
        city: detectedCommune,
        isAllowedZone: true,
        source: 'local',
      });
    }
  } else if (results.length === 0) {
    // Si NO mencionó ninguna comuna y no coincidió con ninguna calle del catálogo:
    // Mostrar UNA SOLA opción limpia con la dirección ingresada en la Región de Los Lagos
    // (sin clonarla absurdamente en 5 ciudades distintas).
    results.push({
      placeId: `custom-address-${clean}`,
      address: query.trim(),
      mainText: query.trim(),
      secondaryText: `Zona de Despacho, Región de Los Lagos, Chile`,
      region: 'Región de Los Lagos',
      fullAddress: `${query.trim()}, Región de Los Lagos, Chile`,
      city: 'Puerto Varas', // Comuna sugerida por defecto
      isAllowedZone: true,
      source: 'local',
    });
  }

  // 4. Deduplicar estrictamente por combinación única de (mainText + city)
  const unique = [];
  const seen = new Set();
  for (const item of results) {
    const key = `${item.mainText.toLowerCase()}__${item.city.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique.slice(0, 5);
}

/**
 * Obtiene los detalles específicos de un Place de Google (calle, número, comuna, lat/lng)
 */
export async function getPlaceDetails(placeId) {
  if (!placeId || placeId.startsWith('local-') || placeId.startsWith('gen-')) {
    return null;
  }

  try {
    const maps = await loadGoogleMapsScript();
    let placesLib = null;
    if (typeof maps.importLibrary === 'function') {
      try {
        placesLib = await maps.importLibrary('places');
      } catch {
        placesLib = maps.places;
      }
    } else {
      placesLib = maps.places;
    }

    // 1. Método moderno: Places API (New) - Place.fetchFields
    if (placesLib?.Place) {
      try {
        const place = new placesLib.Place({
          id: placeId,
          requestedLanguage: 'es',
          requestedRegion: 'CL',
        });

        await place.fetchFields({
          fields: ['addressComponents', 'formattedAddress', 'location', 'displayName'],
        });

        let streetNumber = '';
        let route = '';
        let locality = '';
        let adminArea2 = '';

        if (Array.isArray(place.addressComponents)) {
          for (const comp of place.addressComponents) {
            const types = comp.types || [];
            const text = comp.longText || comp.shortText || comp.long_name || comp.short_name || '';
            if (types.includes('street_number')) streetNumber = text;
            if (types.includes('route')) route = text;
            if (types.includes('locality')) locality = text;
            if (types.includes('administrative_area_level_3')) locality = locality || text;
            if (types.includes('administrative_area_level_2')) adminArea2 = comp.longText || comp.long_name || text;
          }
        }

        const cleanStreet = route
          ? streetNumber
            ? `${route} ${streetNumber}`
            : route
          : place.displayName || '';

        const detectedCity =
          detectCommuneFromAddress(place.formattedAddress, place.addressComponents) ||
          detectCommuneFromAddress(cleanStreet) ||
          normalizeCommune(locality || 'Puerto Varas');

        const latVal = typeof place.location?.lat === 'function' ? place.location.lat() : place.location?.lat || null;
        const lngVal = typeof place.location?.lng === 'function' ? place.location.lng() : place.location?.lng || null;

        return {
          street: cleanStreet,
          number: streetNumber,
          city: detectedCity,
          formattedAddress: place.formattedAddress || '',
          lat: latVal,
          lng: lngVal,
        };
      } catch (placeErr) {
        console.warn('Place.fetchFields warning, trying fallback:', placeErr);
      }
    }

    // 2. Fallback clásico: PlacesService
    if (!placesServiceInstance && placesLib?.PlacesService) {
      const dummyElem = document.createElement('div');
      placesServiceInstance = new placesLib.PlacesService(dummyElem);
    }

    if (placesServiceInstance) {
      return new Promise((resolve) => {
        placesServiceInstance.getDetails(
          {
            placeId,
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
          },
          (place, status) => {
            if (status === (maps.places?.PlacesServiceStatus?.OK || 'OK') && place) {
              let streetNumber = '';
              let route = '';
              let locality = '';
              let adminArea2 = '';

              if (Array.isArray(place.address_components)) {
                for (const comp of place.address_components) {
                  if (comp.types.includes('street_number')) streetNumber = comp.long_name;
                  if (comp.types.includes('route')) route = comp.long_name;
                  if (comp.types.includes('locality')) locality = comp.long_name;
                  if (comp.types.includes('administrative_area_level_3')) locality = locality || comp.long_name;
                  if (comp.types.includes('administrative_area_level_2')) adminArea2 = comp.long_name;
                }
              }

              const cleanStreet = route
                ? streetNumber
                  ? `${route} ${streetNumber}`
                  : route
                : place.name || '';

              const detectedCity =
                detectCommuneFromAddress(place.formatted_address, place.address_components) ||
                detectCommuneFromAddress(cleanStreet) ||
                normalizeCommune(locality || 'Puerto Varas');

              resolve({
                street: cleanStreet,
                number: streetNumber,
                city: detectedCity,
                formattedAddress: place.formatted_address || '',
                lat: place.geometry?.location?.lat?.() || null,
                lng: place.geometry?.location?.lng?.() || null,
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    }

    return null;
  } catch (err) {
    console.warn('Error fetching place details:', err);
    return null;
  }
}

/**
 * Genera la URL universal de navegación para un solo pedido (100% Gratis)
 * Abre la app de Google Maps en móviles o la web en PC en modo indicaciones/conducción
 */
export function getSingleOrderNavigationUrl(order) {
  if (!order) return 'https://www.google.com/maps';

  // Origen: Bodega Central Patitas del Sur (Loteo Espacio Frutillar)
  // Usamos coordenadas exactas para que Google Maps trace la ruta sin errores de geocodificación
  const origin = CENTRAL_HUB.lat && CENTRAL_HUB.lng
    ? `${CENTRAL_HUB.lat},${CENTRAL_HUB.lng}`
    : encodeURIComponent(CENTRAL_HUB.address || 'Loteo Espacio Frutillar, Frutillar, Chile');

  // Destino: Dirección o coordenadas del cliente
  let destination = '';
  if (order.lat && order.lng) {
    destination = `${order.lat},${order.lng}`;
  } else if (order.id === 'PED-0001' || String(order.address || '').toLowerCase().includes('espacio frutillar')) {
    destination = encodeURIComponent('Espacio Frutillar, Frutillar, Región de Los Lagos, Chile');
  } else {
    const rawAddress = String(order.address || '').trim();
    const city = String(order.city || CENTRAL_HUB.city || 'Frutillar').trim();

    const hasCity = rawAddress.toLowerCase().includes(city.toLowerCase());
    const fullAddress = hasCity
      ? `${rawAddress}, Región de Los Lagos, Chile`
      : `${rawAddress}, ${city}, Región de Los Lagos, Chile`;

    destination = encodeURIComponent(fullAddress);
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

/**
 * Calcula la distancia haversiana en kilómetros entre dos coordenadas
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resuelve las coordenadas aproximadas o exactas de una orden
 */
export function resolveOrderCoordinates(order) {
  if (order.lat && order.lng) {
    return { lat: Number(order.lat), lng: Number(order.lng) };
  }
  const city = normalizeCommune(order.city || 'Puerto Varas');
  return TOWN_COORDINATES[city] || TOWN_COORDINATES['Puerto Varas'];
}

/**
 * Optimizador inteligente de rutas multiparada para despachos (Algoritmo Vecino Más Cercano)
 * Ordena las entregas desde la Bodega Central minimizando el kilometraje y tiempo.
 * Genera la URL universal multiparada de Google Maps (100% Gratuita, sin consumir APIs de pago).
 */
export function optimizeDeliveryRoute(orders = [], hub = CENTRAL_HUB) {
  if (!orders || orders.length === 0) {
    return {
      optimizedOrders: [],
      googleMapsUrl: '',
      totalDistanceKm: 0,
    };
  }

  // Si hay una sola orden
  if (orders.length === 1) {
    const single = orders[0];
    const coords = resolveOrderCoordinates(single);
    const dist = calculateHaversineDistance(hub.lat, hub.lng, coords.lat, coords.lng);
    return {
      optimizedOrders: [{ ...single, stopNumber: 1, legDistanceKm: Number(dist.toFixed(1)) }],
      googleMapsUrl: getSingleOrderNavigationUrl(single),
      totalDistanceKm: Number(dist.toFixed(1)),
    };
  }

  // Algoritmo Greedy Nearest Neighbor desde Bodega Central
  const unvisited = [...orders];
  const optimized = [];
  let currentLocation = { lat: hub.lat, lng: hub.lng };
  let totalKm = 0;
  let stopCounter = 1;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const orderCoords = resolveOrderCoordinates(unvisited[i]);
      const dist = calculateHaversineDistance(
        currentLocation.lat,
        currentLocation.lng,
        orderCoords.lat,
        orderCoords.lng
      );
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const [nearestOrder] = unvisited.splice(nearestIndex, 1);
    const nextCoords = resolveOrderCoordinates(nearestOrder);
    totalKm += shortestDist;

    optimized.push({
      ...nearestOrder,
      stopNumber: stopCounter++,
      legDistanceKm: Number(shortestDist.toFixed(1)),
    });

    currentLocation = nextCoords;
  }

  // Construir la URL universal de Google Maps con waypoints
  const origin = encodeURIComponent(hub.address);
  const lastOrder = optimized[optimized.length - 1];
  const destination = encodeURIComponent(
    `${lastOrder.address || ''}, ${lastOrder.city || 'Puerto Varas'}, Chile`
  );

  const intermediateOrders = optimized.slice(0, optimized.length - 1);
  const waypoints = intermediateOrders
    .map((o) => encodeURIComponent(`${o.address || ''}, ${o.city || 'Puerto Varas'}, Chile`))
    .join('|');

  let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  if (waypoints) {
    googleMapsUrl += `&waypoints=${waypoints}`;
  }

  return {
    optimizedOrders: optimized,
    googleMapsUrl,
    totalDistanceKm: Number(totalKm.toFixed(1)),
  };
}
