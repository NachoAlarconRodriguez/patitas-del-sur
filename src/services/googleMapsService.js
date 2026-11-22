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

// Límites geográficos exactos que envuelven las 7 comunas de despacho en la Cuenca del Lago Llanquihue
// (Puerto Octay al norte, Puerto Varas al sur, Fresia al oeste, Totoral/Ensenada al este)
export const DELIVERY_AREA_BOUNDS = {
  south: -41.36,
  west: -73.48,
  north: -40.96,
  east: -72.50,
};

// Comunas vecinas fuera de la zona habitual (para evitar falsos positivos con "Provincia de Llanquihue")
const NON_ALLOWED_NEIGHBOR_COMMUNES = [
  'Puerto Montt',
  'Alerce',
  'Purranque',
  'Corte Alto',
  'Río Negro',
  'Rio Negro',
  'Osorno',
  'Los Muermos',
  'Calbuco',
  'Maullín',
  'Maullin',
  'Cochamó',
  'Cochamo',
  'Ancud',
  'Castro',
];

// Localidades y sectores conocidos que pertenecen a una de las 7 comunas permitidas
const LOCALITY_TO_COMMUNE_MAP = [
  { keywords: ['frutillar alto', 'frutillar bajo', 'punta larga', 'quilanto', 'pantanosa', 'los bajos'], commune: 'Frutillar' },
  { keywords: ['casma'], commune: 'Casma' },
  { keywords: ['fresia', 'tegualda', 'parga'], commune: 'Fresia' },
  { keywords: ['totoral'], commune: 'Totoral' },
  { keywords: ['puerto octay', 'las cascadas', 'centinela', 'nochaco'], commune: 'Puerto Octay' },
  { keywords: ['nueva braunau', 'ensenada', 'colonia tres puentes', 'peulla', 'ralún', 'ralun'], commune: 'Puerto Varas' },
  { keywords: ['los pellines', 'colegual', 'loncotoro'], commune: 'Llanquihue' },
];

// Coordenadas de referencia para cada comuna (para cálculo de proximidad y fallback)
export const TOWN_COORDINATES = {
  'Puerto Varas': { lat: -41.3195, lng: -72.9854 },
  'Llanquihue': { lat: -41.2547, lng: -73.0075 },
  'Frutillar': { lat: -41.1278, lng: -73.0456 },
  'Casma': { lat: -41.0500, lng: -73.1833 },
  'Fresia': { lat: -41.1500, lng: -73.4167 },
  'Totoral': { lat: -41.218, lng: -73.012 },
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
      googleMapsScriptPromise = null;
      script.remove();
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
 * Evita el falso positivo de 'Provincia de Llanquihue' frente a comunas como Frutillar, Fresia, Puerto Montt, etc.
 */
export function detectCommuneFromAddress(fullText = '', addressComponents = []) {
  // 1. Si tenemos addressComponents de Google Maps
  if (Array.isArray(addressComponents) && addressComponents.length > 0) {
    // Prioridad 1: administrative_area_level_3 (Comuna oficial en Chile)
    const admin3 = addressComponents.find((c) =>
      c.types?.includes('administrative_area_level_3')
    );
    const admin3Name = (admin3?.longText || admin3?.long_name || '').trim();
    if (admin3Name) {
      const admin3Lower = admin3Name.toLowerCase();
      for (const com of ALLOWED_COMMUNES) {
        if (
          admin3Lower.includes(com.toLowerCase()) ||
          com.toLowerCase().includes(admin3Lower)
        ) {
          return com;
        }
      }
      // Si Google informa una comuna oficial (ej. "Puerto Montt") que NO está en ALLOWED_COMMUNES,
      // no seguir buscando para no confundir "Provincia de Llanquihue" con la comuna de Llanquihue
      if (
        NON_ALLOWED_NEIGHBOR_COMMUNES.some(
          (n) => admin3Lower.includes(n.toLowerCase()) || n.toLowerCase().includes(admin3Lower)
        )
      ) {
        return null;
      }
    }

    // Prioridad 2: sublocality / neighborhood / locality (validando primero localidades específicas)
    const localityComp = addressComponents.find((c) => c.types?.includes('locality'));
    const subComp = addressComponents.find(
      (c) => c.types?.includes('sublocality') || c.types?.includes('neighborhood')
    );
    const combinedCompText = `${subComp?.longText || subComp?.long_name || ''} ${
      localityComp?.longText || localityComp?.long_name || ''
    }`
      .trim()
      .toLowerCase();

    if (combinedCompText) {
      for (const entry of LOCALITY_TO_COMMUNE_MAP) {
        if (entry.keywords.some((kw) => combinedCompText.includes(kw))) {
          return entry.commune;
        }
      }
      // Priorizar comunas específicas antes que Llanquihue
      const specificCommunes = [
        'Frutillar',
        'Puerto Varas',
        'Puerto Octay',
        'Fresia',
        'Casma',
        'Totoral',
        'Llanquihue',
      ];
      for (const com of specificCommunes) {
        if (combinedCompText.includes(com.toLowerCase())) {
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

  // Revisar primero sectores/localidades conocidos (ej. "Frutillar Alto", "Nueva Braunau", "Las Cascadas")
  for (const entry of LOCALITY_TO_COMMUNE_MAP) {
    if (entry.keywords.some((kw) => cleanedText.includes(kw))) {
      return entry.commune;
    }
  }

  // Priorizar comunas específicas primero (sin Llanquihue aún)
  const specificAllowedCommunes = [
    'Frutillar',
    'Puerto Varas',
    'Puerto Octay',
    'Fresia',
    'Casma',
    'Totoral',
  ];

  for (const com of specificAllowedCommunes) {
    const regex = new RegExp(`\\b${com.toLowerCase()}\\b`, 'i');
    if (regex.test(cleanedText)) {
      return com;
    }
  }

  for (const com of specificAllowedCommunes) {
    if (cleanedText.includes(com.toLowerCase())) {
      return com;
    }
  }

  // Antes de asumir "Llanquihue", verificar que no sea otra comuna de la Provincia de Llanquihue (ej. "Puerto Montt, Llanquihue")
  for (const neighbor of NON_ALLOWED_NEIGHBOR_COMMUNES) {
    if (cleanedText.includes(neighbor.toLowerCase())) {
      return null;
    }
  }

  if (/\bllanquihue\b/i.test(cleanedText) || cleanedText.includes('llanquihue')) {
    return 'Llanquihue';
  }

  return null;
}

/**
 * Extrae la ciudad/comuna real informada por Google cuando la dirección no pertenece a las 7 comunas de reparto,
 * evitando sobreescribirla falsamente con 'Puerto Varas'.
 */
export function extractRealCityFromText(fullDescription = '', secondaryText = '', addressComponents = []) {
  const allowed =
    detectCommuneFromAddress(fullDescription, addressComponents) ||
    detectCommuneFromAddress(secondaryText);
  if (allowed) return allowed;

  if (Array.isArray(addressComponents) && addressComponents.length > 0) {
    const admin3 = addressComponents.find((c) => c.types?.includes('administrative_area_level_3'));
    const locality = addressComponents.find((c) => c.types?.includes('locality'));
    const compCity = (admin3?.longText || admin3?.long_name || locality?.longText || locality?.long_name || '').trim();
    if (compCity) return compCity;
  }

  const combined = `${secondaryText || ''}, ${fullDescription || ''}`;
  for (const neighbor of NON_ALLOWED_NEIGHBOR_COMMUNES) {
    if (combined.toLowerCase().includes(neighbor.toLowerCase())) {
      return neighbor;
    }
  }

  if (secondaryText && typeof secondaryText === 'string') {
    const parts = secondaryText
      .split(',')
      .map((p) => p.replace(/\b\d{5,8}\b/g, '').trim())
      .filter(
        (p) =>
          p &&
          !/^(chile|los lagos|regi[oó]n de los lagos|provincia de llanquihue)$/i.test(p)
      );
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }

  return '';
}

/**
 * Limpia el texto secundario de Google Maps para eliminar el nombre provincial redundante "Llanquihue"
 * cuando la dirección pertenece en realidad a Frutillar, Puerto Varas, Fresia, etc.
 * (Ej: "Llanquihue, Frutillar" -> "Frutillar, Región de Los Lagos")
 */
export function formatCleanSecondaryText(rawSecondaryText = '', detectedCity = '') {
  const cleanCity = (detectedCity || '').trim();
  const rawParts = String(rawSecondaryText || '')
    .split(',')
    .map((p) => p.replace(/\b\d{5,8}\b/g, '').trim())
    .filter(Boolean);

  const filteredParts = rawParts.filter((part) => {
    const lower = part.toLowerCase();
    if (lower === 'chile' || lower === 'los lagos' || lower === 'región de los lagos' || lower === 'region de los lagos') {
      return false;
    }
    if (lower === 'provincia de llanquihue') {
      return false;
    }
    // Si la comuna detectada es Frutillar, Puerto Varas, Fresia, etc. (distinta de Llanquihue),
    // quitar "Llanquihue" suelto que Google agrega por la Provincia de Llanquihue
    if (cleanCity && cleanCity.toLowerCase() !== 'llanquihue' && lower === 'llanquihue') {
      return false;
    }
    return true;
  });

  if (
    cleanCity &&
    !filteredParts.some((p) => p.toLowerCase() === cleanCity.toLowerCase())
  ) {
    filteredParts.push(cleanCity);
  }

  if (filteredParts.length === 0) {
    return 'Región de Los Lagos';
  }

  return `${filteredParts.join(', ')}, Región de Los Lagos`;
}

/**
 * Verifica si una dirección o comuna está dentro de las comunas permitidas
 */
export function isAllowedDeliveryArea(text = '', addressComponents = []) {
  return Boolean(detectCommuneFromAddress(text, addressComponents));
}

/**
 * Formatea una sugerencia cruda de Places API (New) en el objeto estándar de la aplicación
 */
function formatPlacePredictionItem(pred, extractText) {
  if (!pred) return null;

  const placeId = pred.placeId || pred.place_id;
  const structured = pred.structuredFormat || pred.structured_formatting;
  const mainText =
    extractText(pred.mainText) ||
    extractText(structured?.mainText) ||
    extractText(structured?.main_text) ||
    extractText(pred.text) ||
    extractText(pred.description);
  const rawSecondaryText =
    extractText(pred.secondaryText) ||
    extractText(structured?.secondaryText) ||
    extractText(structured?.secondary_text) ||
    '';
  const fullDescription =
    extractText(pred.text) ||
    extractText(pred.description) ||
    (rawSecondaryText ? `${mainText}, ${rawSecondaryText}` : mainText);

  const allowedCommune =
    detectCommuneFromAddress(fullDescription) ||
    detectCommuneFromAddress(rawSecondaryText) ||
    detectCommuneFromAddress(mainText);

  const realCity =
    allowedCommune ||
    extractRealCityFromText(fullDescription, rawSecondaryText) ||
    '';

  const inZone = Boolean(allowedCommune);
  const cleanSecondary = formatCleanSecondaryText(rawSecondaryText, realCity);

  return {
    placeId,
    address: mainText,
    mainText,
    secondaryText: cleanSecondary,
    rawSecondaryText,
    region: 'Región de Los Lagos',
    fullAddress: fullDescription,
    city: realCity,
    isAllowedZone: inZone,
    source: 'google',
  };
}

/**
 * Obtiene sugerencias de autocompletado desde Google Places API (New)
 * Restringido geográficamente a las 7 comunas de cobertura en la Cuenca del Lago Llanquihue
 */
export async function getGooglePlacePredictions(inputQuery) {
  if (!inputQuery || inputQuery.trim().length < 2) return [];

  const query = inputQuery.trim();

  // Helper para extraer texto seguro de los objetos FormattedText de Google
  const extractText = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val.text === 'string') return val.text;
    if (typeof val.toString === 'function') return val.toString();
    return String(val);
  };

  const sortAndFilterPredictions = (list) => {
    const valid = list.filter(Boolean);
    valid.sort((a, b) => {
      if (a.isAllowedZone && !b.isAllowedZone) return -1;
      if (!a.isAllowedZone && b.isAllowedZone) return 1;
      return 0;
    });
    return valid.slice(0, 6);
  };

  // 1. Método directo Places API (New) REST Endpoint con locationRestriction.rectangle exacto
  // (No requiere esperar la descarga del script Maps JS y filtra estrictamente al polígono de las 7 comunas)
  if (typeof fetch === 'function' && GOOGLE_MAPS_API_KEY) {
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        },
        body: JSON.stringify({
          input: query,
          languageCode: 'es',
          regionCode: 'cl',
          includedRegionCodes: ['cl'],
          locationRestriction: {
            rectangle: {
              low: {
                latitude: DELIVERY_AREA_BOUNDS.south,
                longitude: DELIVERY_AREA_BOUNDS.west,
              },
              high: {
                latitude: DELIVERY_AREA_BOUNDS.north,
                longitude: DELIVERY_AREA_BOUNDS.east,
              },
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const suggestions = data?.suggestions || [];
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const formatted = suggestions
            .map((sug) => formatPlacePredictionItem(sug.placePrediction, extractText))
            .filter(Boolean);

          if (formatted.length > 0) {
            return sortAndFilterPredictions(formatted);
          }
        } else {
          // Si Google respondió 200 OK y la dirección no existe dentro del polígono de las 7 comunas,
          // complementar únicamente si hay coincidencia en el catálogo de loteos locales (ej. "Espacio Frutillar")
          return getFallbackPredictions(query);
        }
      }
    } catch (restErr) {
      console.warn('Direct Places API (New) autocomplete fetch warning:', restErr);
    }
  }

  try {
    const maps = await loadGoogleMapsScript();

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

    // 2. Método JS SDK: Places API (New) - AutocompleteSuggestion con LatLngBoundsLiteral
    if (placesLib?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      try {
        const request = {
          input: query,
          includedRegionCodes: ['cl'],
          locationRestriction: DELIVERY_AREA_BOUNDS,
        };

        const response = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        const suggestions = response?.suggestions || [];

        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const formatted = suggestions
            .map((sug) => formatPlacePredictionItem(sug.placePrediction, extractText))
            .filter(Boolean);

          if (formatted.length > 0) {
            return sortAndFilterPredictions(formatted);
          }
        }
      } catch (newApiErr) {
        console.warn('AutocompleteSuggestion.fetchAutocompleteSuggestions warning:', newApiErr);
      }
    }

    // 3. Respaldo con Geocoding API (habilitada en Google Cloud) restringido a la cuenca del Lago Llanquihue
    if (maps?.Geocoder) {
      try {
        const geocoder = new maps.Geocoder();
        const geocodeResults = await new Promise((resolve) => {
          const timer = setTimeout(() => resolve([]), 2500);
          geocoder.geocode(
            {
              address: `${query}, Región de Los Lagos, Chile`,
              componentRestrictions: { country: 'CL' },
              bounds: DELIVERY_AREA_BOUNDS,
            },
            (results, status) => {
              clearTimeout(timer);
              if (status === 'OK' && Array.isArray(results)) {
                resolve(results);
              } else {
                resolve([]);
              }
            }
          );
        });

        if (geocodeResults.length > 0) {
          const formatted = geocodeResults
            .map((res) => {
              const comps = res.address_components || [];
              const route = comps.find((c) => c.types?.includes('route'))?.long_name || '';
              const streetNum = comps.find((c) => c.types?.includes('street_number'))?.long_name || '';
              const mainText = route
                ? streetNum
                  ? `${route} ${streetNum}`
                  : route
                : (res.formatted_address || '').split(',')[0] || query;

              const allowedCommune = detectCommuneFromAddress(res.formatted_address, comps);
              const realCity =
                allowedCommune ||
                extractRealCityFromText(res.formatted_address, '', comps) ||
                '';

              return {
                placeId: res.place_id,
                address: mainText,
                mainText,
                secondaryText: formatCleanSecondaryText(res.formatted_address, realCity),
                region: 'Región de Los Lagos',
                fullAddress: res.formatted_address || mainText,
                city: realCity,
                lat: res.geometry?.location?.lat?.() || null,
                lng: res.geometry?.location?.lng?.() || null,
                isAllowedZone: Boolean(allowedCommune),
                source: 'google',
              };
            })
            .filter((item) => item.city);

          if (formatted.length > 0) {
            return sortAndFilterPredictions(formatted);
          }
        }
      } catch (geoErr) {
        console.warn('Geocoder fallback warning:', geoErr);
      }
    }

    return getFallbackPredictions(query);
  } catch (err) {
    console.warn('Error fetching Google Place predictions:', err);
    return getFallbackPredictions(query);
  }
}

/**
 * Respaldo local inteligente para loteos y calles conocidas cuando no hay red.
 * NUNCA inventa direcciones falsas en Puerto Varas si la calle no existe en el catálogo.
 */
export function getFallbackPredictions(query) {
  const clean = (query || '').toLowerCase().trim();
  if (!clean || clean.length < 2) return [];

  // 1. Detectar si el usuario escribió explícitamente alguna comuna en su texto (ej: "Espacio Frutillar")
  const detectedCommune = detectCommuneFromAddress(clean);

  // 2. Buscar en el catálogo local de calles y loteos reales
  const matched = LOCAL_FALLBACK_STREETS.filter((p) => {
    const sLower = p.street.toLowerCase();
    const cLower = p.city.toLowerCase();
    const secLower = (p.sector || '').toLowerCase();

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
    secondaryText: `${m.city}, Región de Los Lagos`,
    region: 'Región de Los Lagos',
    fullAddress: `${m.street}, ${m.city}, Chile`,
    city: m.city,
    isAllowedZone: true,
    source: 'local',
  }));

  // 3. Deduplicar estrictamente por combinación única de (mainText + city)
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
 * Obtiene los detalles específicos de un Place de Google (calle, número, comuna oficial, lat/lng)
 */
export async function getPlaceDetails(placeId) {
  if (!placeId || placeId.startsWith('local-') || placeId.startsWith('gen-') || placeId.startsWith('custom-')) {
    return null;
  }

  // 1. Método directo REST Places API (New) v1/places/{placeId}
  if (typeof fetch === 'function' && GOOGLE_MAPS_API_KEY) {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=cl`,
        {
          method: 'GET',
          headers: {
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,addressComponents,location',
          },
        }
      );

      if (response.ok) {
        const place = await response.json();
        let streetNumber = '';
        let route = '';
        let locality = '';

        if (Array.isArray(place.addressComponents)) {
          for (const comp of place.addressComponents) {
            const types = comp.types || [];
            const text = comp.longText || comp.shortText || '';
            if (types.includes('street_number')) streetNumber = text;
            if (types.includes('route')) route = text;
            if (types.includes('administrative_area_level_3')) locality = text;
            if (types.includes('locality') && !locality) locality = text;
          }
        }

        const displayNameText =
          typeof place.displayName === 'string'
            ? place.displayName
            : place.displayName?.text || '';

        const cleanStreet = route
          ? streetNumber
            ? `${route} ${streetNumber}`
            : route
          : displayNameText || '';

        const detectedCity =
          detectCommuneFromAddress(place.formattedAddress, place.addressComponents) ||
          detectCommuneFromAddress(cleanStreet) ||
          extractRealCityFromText(place.formattedAddress, '', place.addressComponents) ||
          normalizeCommune(locality);

        return {
          street: cleanStreet,
          number: streetNumber,
          city: detectedCity,
          formattedAddress: place.formattedAddress || '',
          lat: place.location?.latitude ?? null,
          lng: place.location?.longitude ?? null,
        };
      }
    } catch (restDetailErr) {
      console.warn('Direct Place details REST warning:', restDetailErr);
    }
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

    // 2. Método JS SDK: Places API (New) - Place.fetchFields
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

        if (Array.isArray(place.addressComponents)) {
          for (const comp of place.addressComponents) {
            const types = comp.types || [];
            const text = comp.longText || comp.shortText || comp.long_name || comp.short_name || '';
            if (types.includes('street_number')) streetNumber = text;
            if (types.includes('route')) route = text;
            if (types.includes('administrative_area_level_3')) locality = text;
            if (types.includes('locality') && !locality) locality = text;
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
          extractRealCityFromText(place.formattedAddress, '', place.addressComponents) ||
          normalizeCommune(locality);

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
        console.warn('Place.fetchFields warning:', placeErr);
      }
    }

    return null;
  } catch (err) {
    console.warn('Error fetching place details:', err);
    return null;
  }
}

/**
 * Formatea una dirección completa evitando duplicar la comuna si ya está incluida
 */
function buildOrderGeocodableQuery(order) {
  const exactLat = Number(order?.lat ?? order?.delivery_lat ?? order?.deliveryLat ?? order?.latitude);
  const exactLng = Number(order?.lng ?? order?.delivery_lng ?? order?.deliveryLng ?? order?.longitude);
  if (Number.isFinite(exactLat) && Number.isFinite(exactLng) && exactLat !== 0 && exactLng !== 0) {
    return `${exactLat},${exactLng}`;
  }
  if (order?.id === 'PED-0001' || String(order?.address || '').toLowerCase().includes('espacio frutillar')) {
    return encodeURIComponent('Espacio Frutillar, Frutillar, Región de Los Lagos, Chile');
  }
  const rawAddress = String(order?.address || '').trim();
  const city = String(order?.city || CENTRAL_HUB.city || 'Frutillar').trim();
  if (!rawAddress) {
    return encodeURIComponent(`${city}, Región de Los Lagos, Chile`);
  }
  const hasCity = city && rawAddress.toLowerCase().includes(city.toLowerCase());
  const fullAddress = hasCity
    ? `${rawAddress}, Región de Los Lagos, Chile`
    : `${rawAddress}, ${city}, Región de Los Lagos, Chile`;
  return encodeURIComponent(fullAddress);
}

/**
 * Genera la URL universal de navegación para un solo pedido (100% Gratis)
 * Abre la app de Google Maps en móviles o la web en PC en modo indicaciones/conducción.
 * Si originHub.isLiveGps es true (o originHub === 'gps'), omite &origin para que Google Maps móvil
 * inicie navegación turn-by-turn directo desde el GPS real del conductor.
 */
export function getSingleOrderNavigationUrl(order, originHub = null) {
  if (!order) return 'https://www.google.com/maps';

  const destination = buildOrderGeocodableQuery(order);

  if (originHub === 'gps' || originHub?.isLiveGps) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  }

  const hub = originHub && Number.isFinite(Number(originHub.lat)) && Number.isFinite(Number(originHub.lng))
    ? originHub
    : CENTRAL_HUB;

  const origin =
    hub.lat && hub.lng
      ? `${hub.lat},${hub.lng}`
      : encodeURIComponent(hub.address || 'Loteo Espacio Frutillar, Frutillar, Chile');

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
 * Catálogo geográfico local gratuito ($0 llamadas a API) de sectores, barrios y calles
 * de la Cuenca del Lago Llanquihue, etiquetado por comuna para evitar colisiones entre pueblos.
 */
const LOCAL_SECTOR_COORDINATES = [
  // Frutillar — Loteo Espacio Frutillar & Sector Norte / Pantanosa
  { commune: 'Frutillar', match: ['espacio frutillar', 'parcela 115'], lat: -41.08985, lng: -73.08013 },
  { commune: 'Frutillar', match: ['pantanosa', 'tegualda', 'v-155'], lat: -41.1045, lng: -73.0715 },
  { commune: 'Frutillar', match: ['quilanto', 'los bajos'], lat: -41.052, lng: -72.978 },
  // Frutillar Alto (Eje Comercial y Residencial)
  {
    commune: 'Frutillar',
    match: [
      'carlos richter',
      'arturo alessandri',
      'cristino winkler',
      'carlos sprenger',
      'alianza cristiana',
      'vermont',
      'reserva frutillar',
      'los colonos frutillar',
      'frutillar alto',
    ],
    lat: -41.1245,
    lng: -73.0585,
  },
  // Frutillar Bajo & Costanera
  {
    commune: 'Frutillar',
    match: ['bernardo philippi', 'costanera', 'punta larga', 'teatro del lago', 'frutillar bajo'],
    lat: -41.1388,
    lng: -73.0265,
  },
  // Casma
  { commune: 'Casma', match: ['casma', 'los laureles'], lat: -41.05, lng: -73.1833 },
  // Fresia
  { commune: 'Fresia', match: ['fresia', 'trautmann', 'san carlos'], lat: -41.15, lng: -73.4167 },
  // Totoral
  { commune: 'Totoral', match: ['totoral', 'costanera totoral'], lat: -41.218, lng: -73.012 },
  // Llanquihue
  {
    commune: 'Llanquihue',
    match: ['baquedano', 'los volcanes', 'errazuriz', 'errázuriz', 'llanquihue'],
    lat: -41.2547,
    lng: -73.0075,
  },
  // Puerto Varas — Acceso Norte / Gramado / Santa Rosa
  {
    commune: 'Puerto Varas',
    match: ['gramado', 'santa rosa', 'los colonos', 'parque doña ema', 'dona ema'],
    lat: -41.3125,
    lng: -72.987,
  },
  // Puerto Varas — Centro
  {
    commune: 'Puerto Varas',
    match: ['san francisco', 'del salvador', 'walker martinez', 'walker martínez', 'san pedro', 'imperial'],
    lat: -41.3195,
    lng: -72.9854,
  },
  // Puerto Varas — Puerto Chico / Costanera Sur / Ensenada
  {
    commune: 'Puerto Varas',
    match: ['perez rosales', 'pérez rosales', 'puerto chico', 'ensenada', 'decher', 'mirador', 'costanera'],
    lat: -41.3265,
    lng: -72.964,
  },
  // Puerto Octay
  { commune: 'Puerto Octay', match: ['puerto octay', 'centinela', 'pedro montt', 'independencia'], lat: -40.9739, lng: -72.8856 },
  // Alerce / Puerto Montt
  { commune: 'Alerce', match: ['alerce', 'puerto montt'], lat: -41.3965, lng: -72.9102 },
];

/**
 * Resuelve las coordenadas exactas o de sector local de una orden (100% local, $0 costo API)
 */
export function resolveOrderCoordinates(order) {
  if (!order) return TOWN_COORDINATES['Frutillar'];

  const exactLat = Number(order.lat ?? order.delivery_lat ?? order.deliveryLat ?? order.latitude);
  const exactLng = Number(order.lng ?? order.delivery_lng ?? order.deliveryLng ?? order.longitude);
  if (Number.isFinite(exactLat) && Number.isFinite(exactLng) && exactLat !== 0 && exactLng !== 0) {
    return { lat: exactLat, lng: exactLng };
  }

  const rawAddress = String(order.address || '').toLowerCase().trim();
  const rawCity = String(order.city || '').toLowerCase().trim();
  const combined = `${rawAddress} ${rawCity}`.trim();
  const normalizedCity = rawCity ? normalizeCommune(order.city) : detectCommuneFromAddress(rawAddress) || 'Frutillar';

  // Extraer numeración de calle para micro-ordenar secuencialmente pedidos dentro de la misma calle/sector
  const numMatch = rawAddress.match(/\b(\d{1,5})\b/);
  const streetNum = numMatch ? parseInt(numMatch[1], 10) : 0;
  const microOffsetLat = ((streetNum % 500) - 250) * 0.000012;
  const microOffsetLng = ((streetNum % 300) - 150) * 0.000012;

  // 1. Priorizar sectores de la misma comuna del pedido (evita que "Costanera Totoral" caiga en Frutillar Bajo)
  const sameCommuneSectors = LOCAL_SECTOR_COORDINATES.filter(
    (s) => s.commune.toLowerCase() === normalizedCity.toLowerCase()
  );
  for (const sector of sameCommuneSectors) {
    if (sector.match.some((kw) => combined.includes(kw))) {
      return {
        lat: sector.lat + microOffsetLat,
        lng: sector.lng + microOffsetLng,
      };
    }
  }

  // 2. Fallback por centroide de la comuna conocida
  if (TOWN_COORDINATES[normalizedCity]) {
    const baseCoords = TOWN_COORDINATES[normalizedCity];
    return {
      lat: baseCoords.lat + microOffsetLat,
      lng: baseCoords.lng + microOffsetLng,
    };
  }

  // 3. Último fallback buscando en cualquier sector
  for (const sector of LOCAL_SECTOR_COORDINATES) {
    if (sector.match.some((kw) => combined.includes(kw))) {
      return {
        lat: sector.lat + microOffsetLat,
        lng: sector.lng + microOffsetLng,
      };
    }
  }

  const baseCoords = TOWN_COORDINATES['Frutillar'];
  return {
    lat: baseCoords.lat + microOffsetLat,
    lng: baseCoords.lng + microOffsetLng,
  };
}

/**
 * Determina el bloque de prioridad operativa de un pedido para la secuencia de reparto:
 * 0 = Urgente / Domingo expreso, 1 = Ventana Mañana (10-13h), 2 = Ventana Tarde / Otros
 */
function getOrderRoutePriorityBucket(order) {
  const slot = String(order?.deliverySlot || order?.delivery_slot || '').toLowerCase();
  const dayText = String(order?.deliveryDayText || order?.delivery_day_text || '').toLowerCase();
  if (slot.includes('urgente') || slot.includes('domingo') || dayText.includes('urgente')) {
    return 0;
  }
  if (slot.includes('mañana') || slot.includes('manana') || slot.includes('10:00')) {
    return 1;
  }
  return 2;
}

/**
 * Construye una URL de Google Maps Directions para un tramo de hasta 10 paradas (máx. 9 waypoints en móvil)
 */
function buildGoogleMapsLegUrl(legOrders, originParam, useLiveGpsOrigin = false) {
  if (!legOrders || legOrders.length === 0) return '';
  if (legOrders.length === 1) {
    const dest = buildOrderGeocodableQuery(legOrders[0]);
    if (useLiveGpsOrigin) {
      return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${dest}&travelmode=driving`;
  }

  const lastOrder = legOrders[legOrders.length - 1];
  const destination = buildOrderGeocodableQuery(lastOrder);
  const intermediateOrders = legOrders.slice(0, legOrders.length - 1);
  // Codificar separador como %7C para preservar enlaces al compartir por WhatsApp
  const waypoints = intermediateOrders.map((o) => buildOrderGeocodableQuery(o)).join('%7C');

  const originPart = useLiveGpsOrigin ? '' : `&origin=${originParam}`;
  let url = `https://www.google.com/maps/dir/?api=1${originPart}&destination=${destination}&travelmode=driving`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  return url;
}

/**
 * Optimizador inteligente de rutas multiparada para despachos (Prioridad Urgente/Ventana + Vecino Más Cercano)
 * Ordena las entregas encadenando: Origen -> Parada #1 -> Parada #2 -> ...
 * Divide automáticamente en tramos de máx. 10 paradas (límite de 9 waypoints en Google Maps móvil).
 * 100% Gratuito ($0 costo de API).
 */
export function optimizeDeliveryRoute(orders = [], hub = CENTRAL_HUB, options = {}) {
  const { prioritizeUrgent = true } = options || {};

  const startHub =
    hub && Number.isFinite(Number(hub.lat)) && Number.isFinite(Number(hub.lng))
      ? hub
      : CENTRAL_HUB;
  const originLabel = startHub.isLiveGps ? 'tu GPS' : 'Bodega';

  if (!orders || orders.length === 0) {
    return {
      optimizedOrders: [],
      googleMapsUrl: '',
      routeLegs: [],
      totalDistanceKm: 0,
      origin: startHub,
    };
  }

  // Si hay una sola orden
  if (orders.length === 1) {
    const single = orders[0];
    const coords = resolveOrderCoordinates(single);
    const dist = Math.max(0.1, calculateHaversineDistance(startHub.lat, startHub.lng, coords.lat, coords.lng));
    const roundedDist = Number(dist.toFixed(1));
    const singleUrl = getSingleOrderNavigationUrl(single, startHub);
    const singleOptimized = {
      ...single,
      stopNumber: 1,
      legDistanceKm: roundedDist,
      cumulativeDistanceKm: roundedDist,
      previousStopLabel: `desde ${originLabel}`,
    };
    return {
      optimizedOrders: [singleOptimized],
      googleMapsUrl: singleUrl,
      routeLegs: [
        {
          legIndex: 1,
          fromStop: 1,
          toStop: 1,
          stops: [singleOptimized],
          googleMapsUrl: singleUrl,
          distanceKm: roundedDist,
        },
      ],
      totalDistanceKm: roundedDist,
      origin: startHub,
    };
  }

  // Agrupar por fecha/prioridad (Urgentes -> Mañana -> Tarde) y encadenar Nearest Neighbor dentro de cada bloque
  const buckets = prioritizeUrgent
    ? [
        orders.filter((o) => getOrderRoutePriorityBucket(o) === 0),
        orders.filter((o) => getOrderRoutePriorityBucket(o) === 1),
        orders.filter((o) => getOrderRoutePriorityBucket(o) === 2),
      ].filter((b) => b.length > 0)
    : [[...orders]];

  const optimized = [];
  let currentLocation = { lat: Number(startHub.lat), lng: Number(startHub.lng) };
  let totalKm = 0;
  let stopCounter = 1;

  for (const bucket of buckets) {
    const unvisited = [...bucket];
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
      const legKm = Math.max(0.1, Number(shortestDist.toFixed(1)));
      totalKm += legKm;
      const currentStopNum = stopCounter++;

      optimized.push({
        ...nearestOrder,
        stopNumber: currentStopNum,
        legDistanceKm: legKm,
        cumulativeDistanceKm: Number(totalKm.toFixed(1)),
        previousStopLabel:
          currentStopNum === 1 ? `desde ${originLabel}` : `desde Parada #${currentStopNum - 1}`,
      });

      currentLocation = nextCoords;
    }
  }

  // Construir tramos de máx. 10 paradas (9 waypoints + 1 destino, límite oficial de Google Maps móvil)
  const MAX_STOPS_PER_LEG = 10;
  const originParam =
    startHub.lat && startHub.lng
      ? `${startHub.lat},${startHub.lng}`
      : encodeURIComponent(startHub.address || CENTRAL_HUB.address);

  const routeLegs = [];
  for (let offset = 0; offset < optimized.length; offset += MAX_STOPS_PER_LEG) {
    const slice = optimized.slice(offset, offset + MAX_STOPS_PER_LEG);
    const isFirstLeg = offset === 0;
    const prevStop = isFirstLeg ? null : optimized[offset - 1];
    const legOriginParam = isFirstLeg ? originParam : buildOrderGeocodableQuery(prevStop);
    const legDistanceKm = Number(
      slice.reduce((acc, o) => acc + (Number(o.legDistanceKm) || 0), 0).toFixed(1)
    );

    routeLegs.push({
      legIndex: routeLegs.length + 1,
      fromStop: slice[0].stopNumber,
      toStop: slice[slice.length - 1].stopNumber,
      stops: slice,
      googleMapsUrl: buildGoogleMapsLegUrl(slice, legOriginParam, isFirstLeg && Boolean(startHub.isLiveGps)),
      distanceKm: legDistanceKm,
    });
  }

  return {
    optimizedOrders: optimized,
    googleMapsUrl: routeLegs[0]?.googleMapsUrl || '',
    routeLegs,
    totalDistanceKm: Number(totalKm.toFixed(1)),
    origin: startHub,
  };
}
