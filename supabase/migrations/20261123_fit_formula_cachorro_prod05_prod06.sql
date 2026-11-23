-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: FIT FÓRMULA CACHORRO 3 KG Y 10 KG
-- Actualiza ambas variantes existentes: PROD-05 (10 kg) y PROD-06 (3 kg)
-- Fuente: Etiqueta oficial Fit Fórmula Perro Cachorro (estándares FEDIAF)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Fit',
  name = 'Fit Fórmula Cachorro',
  tagline = 'Alimento High Premium formulado por médicos veterinarios para perros cachorros con 29% de proteína cruda (proteína animal como primer ingrediente), betaglucanos, DHA, Omega 3, prebióticos MOS e inulina, hexametafosfato de sodio y Yucca Schidigera.',
  category = 'Alimento Seco',
  badge = 'Cachorro · 29% Proteína',
  image = '/images/products/fit-formula-cachorro/01-estudio-principal.webp',
  images = '[
    "/images/products/fit-formula-cachorro/01-estudio-principal.webp",
    "/images/products/fit-formula-cachorro/02-lifestyle-cachorro.webp",
    "/images/products/fit-formula-cachorro/03-beneficios-clave.webp",
    "/images/products/fit-formula-cachorro/04-ingredientes-nutricion.webp",
    "/images/products/fit-formula-cachorro/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 29,
  protein_percent = '29%',
  main_protein = 'Pollo',
  protein_subtitle = 'Proteína animal primer ingrediente (Ave y Bovino)',
  gama = 'with',
  gama_detail = 'Con Grano · Cereales seleccionados (Maíz, Trigo y Arroz)',
  animal_percent = NULL,
  animal_percent_detail = 'Proteína animal como primer ingrediente',
  life_stage = 'cachorro',
  target_stage_label = 'Perros Cachorros (Todas las Razas)',
  benefits = '[
    "Refuerzo inmune superior: enriquecido con betaglucanos (250 mg/kg), vitamina C, nucleótidos, silimarina (100 mg/kg) y cranberries (100 mg/kg) para fortalecer sus defensas naturales.",
    "Piel sana y pelaje brillante: aceite de pescado rico en DHA y Omega 3 junto con biotina para nutrir la piel y realzar el brillo del pelaje.",
    "Optimiza la absorción de nutrientes: formulado con minerales orgánicos e inorgánicos (zinc, hierro, cobre, manganeso, yodo y selenio) y proteínas animales hidrolizadas.",
    "Control de sarro dental: incorpora hexametafosfato de sodio para ayudar a prevenir la formación de sarro desde cachorro.",
    "Digestión saludable y heces más firmes con menos olor: prebióticos MOS e inulina de achicoria (550 mg/kg), extracto de Yucca Schidigera (500 mg/kg) y zeolita.",
    "Formulado por médicos veterinarios bajo requerimientos nutricionales FEDIAF (energía metabolizable mínima 3.400 kcal/kg)."
  ]'::jsonb,
  ingredients = '[
    "Harina de Ave (Subproductos de Aves)",
    "Maíz",
    "Salvado de Trigo",
    "Harina de Carne (Carne y Hueso Bovino)",
    "Arroz",
    "Gluten de Maíz",
    "Aceite de Ave",
    "Harina de Soya",
    "Harina de Trigo",
    "Proteínas animales hidrolizadas",
    "Aceite de Soya",
    "Cloruro de Sodio",
    "Aceite de Pescado",
    "Vitaminas (A, D3, E, C, B1, B2, B3, B5, B6, B9 y B12)",
    "Nucleótidos y Biotina",
    "Minerales Orgánicos e Inorgánicos (Zinc, Hierro, Cobre, Manganeso, Yodo y Selenio)",
    "Preservante",
    "Antioxidantes",
    "Extracto de achicoria (Fuente de Inulina 550 mg/Kg)",
    "Manano Oligosacáridos (MOS)",
    "Pared celular de levadura",
    "Colina",
    "Extracto de Yucca Schidigera (500 mg/Kg)",
    "Hexametafosfato Sódico",
    "Beta-glucanos (250 mg/Kg)",
    "Esencia de Carne",
    "Zeolita",
    "Cranberries (100 mg/Kg)",
    "Extracto de cardo mariano (Fuente de Silimarina 100 mg/Kg)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '29%',
    'Grasa Cruda', '10%',
    'Fibra Cruda', '3%',
    'Humedad', '11%',
    'Energía', '3.400 kcal/kg',
    'Inulina', '550 mg/kg',
    'Yucca Schidigera', '500 mg/kg',
    'Beta-glucanos', '250 mg/kg',
    'Cranberries', '100 mg/kg',
    'Silimarina', '100 mg/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Proteína animal como primer ingrediente en el orden exacto de la receta, combinada con energía para el crecimiento, prebióticos y defensa inmune para tu cachorro.",
      "stickers": [
        "Proteína Animal #1",
        "29% Proteína",
        "Prebióticos MOS",
        "Control Sarro"
      ],
      "wedges": [
        {
          "name": "Harina de Ave",
          "pill": "29% Proteína",
          "desc": "Proteína animal como primer ingrediente (subproductos de aves) que aporta aminoácidos esenciales para el desarrollo muscular de tu cachorro.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Maíz",
          "pill": "Energía Diaria",
          "desc": "Fuente energética de carbohidratos altamente aprovechables para acompañar el ritmo de juego y crecimiento diario de tu perro cachorro.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Salvado de Trigo",
          "pill": "Fibra Natural",
          "desc": "Aporte natural de fibra dietaria insoluble que favorece la motilidad intestinal y la consistencia óptima de las deposiciones.",
          "img": "/images/bowl/ing-trigo.webp"
        },
        {
          "name": "Harina de Carne",
          "pill": "Proteína Bovina",
          "desc": "Harina de carne y hueso bovino rica en proteínas, calcio y fósforo natural para huesos fuertes y dientes sanos en crecimiento.",
          "img": "/images/bowl/ing-vacuno.webp"
        },
        {
          "name": "Arroz",
          "pill": "Energía Noble",
          "desc": "Cereal suave y de fácil digestibilidad que aporta energía sostenida y cuida el sistema digestivo en desarrollo.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Gluten de Maíz",
          "pill": "Proteína Vegetal",
          "desc": "Concentrado proteico vegetal de alta digestibilidad que complementa el perfil de aminoácidos de la fórmula cachorro.",
          "img": "/images/bowl/ing-maiz.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "weight_only",
      "cupGrams": 85,
      "cupLabel": "1 taza de té (200 mL) = 85 g aprox.",
      "stageLabel": "Perro Cachorro (Todas las Razas)",
      "stageBadge": "🐾 Cachorro",
      "weightPrompt": "Ingresa el Peso Actual de tu Cachorro",
      "quickWeights": [3, 8, 18, 32],
      "extraPerKgOver": {
        "thresholdKg": 30,
        "baseGrams": 500,
        "gramsPerKg": 10
      },
      "note": "Para cachorros sobre 30 kg, sumar 10 g de alimento por cada kilo de peso extra. Limpia su plato antes de servir, no dejes el alimento más de 8 h y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "fit-pup-1",
          "min": 0,
          "max": 5,
          "label": "Hasta 5 kg (Hasta 11 lb)",
          "maint": "40 a 130 g / día (½ a 1½ taza)"
        },
        {
          "id": "fit-pup-2",
          "min": 5.01,
          "max": 15,
          "label": "De 5 a 15 kg (11 a 33 lb)",
          "maint": "130 a 300 g / día (1½ a 3½ tazas)"
        },
        {
          "id": "fit-pup-3",
          "min": 15.01,
          "max": 30,
          "label": "De 15 a 30 kg (33 a 66 lb)",
          "maint": "300 a 500 g / día (3½ a 6 tazas)"
        },
        {
          "id": "fit-pup-4",
          "min": 30.01,
          "max": 999,
          "label": "De 30 kg o más* (66 lb o más)",
          "maint": "500 g / día (6 tazas) + 10 g por kg extra"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id IN ('PROD-05', 'PROD-06');
