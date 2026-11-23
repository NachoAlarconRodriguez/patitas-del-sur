-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: FIT FÓRMULA GATO ADULTO (2 KG Y 11 KG)
-- Actualiza ambas variantes existentes: PROD-07 (11 kg) y PROD-21 (2 kg)
-- Fuente: Etiqueta oficial Fit Fórmula Gato Adulto (estándares FEDIAF)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Fit',
  name = 'Fit Fórmula Gato Adulto',
  tagline = 'Alimento High Premium sin colorantes formulado por médicos veterinarios para gatos adultos desde 1 año: 32% de proteína cruda con 4 fuentes proteicas (pollo, salmón, vacuno y huevo), balance mineral para regular pH urinario, taurina, DHA y Omega 3, silimarina, cranberries y 700 mg/kg de Yucca Schidigera.',
  category = 'Alimento Seco',
  badge = 'Gato Adulto · 32% Prot.',
  image = '/images/products/fit-formula-gato-adulto/01-estudio-principal.webp',
  images = '[
    "/images/products/fit-formula-gato-adulto/01-estudio-principal.webp",
    "/images/products/fit-formula-gato-adulto/02-lifestyle-gato-adulto.webp",
    "/images/products/fit-formula-gato-adulto/03-beneficios-clave.webp",
    "/images/products/fit-formula-gato-adulto/04-ingredientes-nutricion.webp",
    "/images/products/fit-formula-gato-adulto/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 32,
  protein_percent = '32%',
  main_protein = 'Pollo',
  protein_subtitle = '4 fuentes proteicas (Pollo, Salmón, Vacuno y Huevo)',
  gama = 'with',
  gama_detail = 'Con Grano · Sin Colorantes · Arroz, Maíz y Salvado de Trigo',
  animal_percent = NULL,
  animal_percent_detail = 'Proteína animal como primer ingrediente (4 fuentes proteicas)',
  life_stage = 'adulto',
  target_stage_label = 'Gatos Adultos (Desde 1 Año)',
  benefits = '[
    "Salud del tracto urinario e hígado: balance mineral que ayuda a regular el pH urinario reduciendo el riesgo de cálculos renales, junto a cranberries (100 mg/kg) y silimarina (100 mg/kg).",
    "Corazón fuerte y visión saludable: enriquecido con taurina esencial y cuatro fuentes proteicas (pollo, salmón, carne bovina y huevo) que aseguran todos los aminoácidos esenciales.",
    "Piel sana y pelaje brillante: aceite de pescado y harina de salmón ricos en ácidos grasos esenciales DHA y Omega 3, complementados con biotina.",
    "Control de sarro dental y óptima absorción: incorpora hexametafosfato sódico para cuidar los dientes y minerales orgánicos e inorgánicos (zinc, hierro, cobre, manganeso, yodo y selenio).",
    "Heces más firmes y menor olor en el arenero: alto aporte de extracto de Yucca Schidigera (700 mg/kg), zeolita y prebióticos MOS e inulina de achicoria (550 mg/kg).",
    "Sin adición de colorantes y con antioxidantes naturales (tocoferoles, lecitina y extracto de romero), formulado por médicos veterinarios bajo estándares FEDIAF."
  ]'::jsonb,
  ingredients = '[
    "Harina de Ave (Subproductos de Aves)",
    "Arroz",
    "Harina de Soya",
    "Maíz",
    "Aceite de Ave",
    "Salvado de Trigo",
    "Harina de Salmón",
    "Harina de Carne (Carne y Hueso Bovino)",
    "Harina de Trigo",
    "Proteínas animales hidrolizadas",
    "Sulfato de Amonio",
    "Colina",
    "Vitaminas y Aminoácidos (Taurina, Vitamina A, D3, E, C, Biotina, B1, B2, B3, B5, B6, B9 y B12)",
    "Nucleótidos",
    "Zeolita",
    "Ácido Fosfórico",
    "Minerales Orgánicos e Inorgánicos (Zinc, Hierro, Cobre, Manganeso, Yodo y Selenio)",
    "Huevo Deshidratado",
    "Cloruro de Sodio",
    "Aceite de Pescado",
    "Extracto de Yucca Schidigera (700 mg/kg)",
    "Antioxidantes",
    "Manano Oligosacáridos (MOS)",
    "Preservante",
    "Hexametafosfato Sódico",
    "Extracto de achicoria (Fuente de Inulina 550 mg/kg)",
    "Pared celular de levadura",
    "Cranberries (100 mg/kg)",
    "Extracto de cardo mariano (Fuente de Silimarina 100 mg/kg)",
    "Antioxidantes naturales (Tocoferoles, Lecitina y Extracto de Romero)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '32% mín.',
    'Grasa Cruda', '12% mín.',
    'Humedad', '7% máx.',
    'Fibra Cruda', '2,5% máx.',
    'Energía Metabolizable', '3.700 kcal/kg mín. (1.678 kcal/lb)',
    'Extracto de Yucca Schidigera', '700 mg/kg',
    'Inulina (Achicoria)', '550 mg/kg',
    'Cranberries', '100 mg/kg',
    'Silimarina (Cardo Mariano)', '100 mg/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Los primeros 6 ingredientes reales en el orden exacto de la etiqueta Fit Fórmula Gato Adulto: proteína animal como primer ingrediente, sin colorantes y bajo estándares FEDIAF.",
      "stickers": [
        "32% Proteína Cruda",
        "Control pH Urinario",
        "Sin Colorantes",
        "Yucca 700 mg/kg · Taurina"
      ],
      "wedges": [
        {
          "name": "Harina de Ave",
          "pill": "Proteína Animal #1",
          "desc": "Harina de subproductos de aves como primer ingrediente para entregar proteína de alta digestibilidad y excelente sabor felino.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Arroz",
          "pill": "Energía Suave",
          "desc": "Cereal noble de muy fácil digestión que aporta energía limpia y cuida el sistema gastrointestinal del gato adulto.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Harina de Soya",
          "pill": "Proteína Vegetal",
          "desc": "Fuente complementaria de aminoácidos que acompaña a las 4 proteínas animales de la fórmula (ave, salmón, vacuno y huevo).",
          "img": "/images/bowl/ing-soya.webp"
        },
        {
          "name": "Maíz",
          "pill": "Energía Diaria",
          "desc": "Aporte energético balanceado que sostiene la vitalidad diaria del gato adulto.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Aceite de Ave",
          "pill": "Palatabilidad & Piel",
          "desc": "Aceite natural de ave rico en ácidos grasos que potencia el sabor de la croqueta y nutre la piel y el pelaje.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        },
        {
          "name": "Salvado de Trigo",
          "pill": "Fibra Digestiva",
          "desc": "Fibra natural que favorece el tránsito intestinal saludable y ayuda a lograr deposiciones más firmes.",
          "img": "/images/bowl/ing-trigo.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_conditions",
      "cupGrams": 90,
      "cupLabel": "1 taza de té (200 mL) = 90 g aprox.",
      "note": "Para gatos sobre 7 kg, sumar 10 g de alimento por cada kilo de peso extra. Alimenta como mínimo 2 veces al día en recipiente limpio y seco, y mantén siempre agua potable fresca disponible.",
      "conditions": [
        { "id": "neutered", "label": "Sedentario / Indoor", "subtitle": "Actividad baja o interior", "icon": "🏠" },
        { "id": "intact", "label": "Gato Activo", "subtitle": "Actividad normal / alta", "icon": "⚡" },
        { "id": "overweight", "label": "Baja Actividad", "subtitle": "Control de ración", "icon": "⚖️" }
      ],
      "rows": [
        {
          "id": "fit-cat-1",
          "min": 0,
          "max": 3,
          "label": "1 a 3 kg (2 a 7 lb)",
          "intact": "30 a 60 g / día (⅓ a ⅔ taza)",
          "neutered": "20 a 45 g / día (¼ a ½ taza)",
          "overweight": "20 a 45 g / día (¼ a ½ taza)"
        },
        {
          "id": "fit-cat-2",
          "min": 3.01,
          "max": 5,
          "label": "3 a 5 kg (7 a 11 lb)",
          "intact": "60 a 80 g / día (⅔ a 1 taza)",
          "neutered": "45 a 60 g / día (½ a ¾ taza)",
          "overweight": "45 a 60 g / día (½ a ¾ taza)"
        },
        {
          "id": "fit-cat-3",
          "min": 5.01,
          "max": 999,
          "label": "5 a 7 kg* (11 a 15 lb)",
          "intact": "80 a 100 g / día (1 a 1⅓ tazas)",
          "neutered": "60 a 75 g / día (¾ a 1 taza)",
          "overweight": "60 a 75 g / día (¾ a 1 taza)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id IN ('PROD-07', 'PROD-21');
