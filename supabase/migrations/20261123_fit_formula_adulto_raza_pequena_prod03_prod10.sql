-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: FIT FÓRMULA ADULTO RAZA PEQUEÑA (3 KG Y 10 KG)
-- Actualiza ambas variantes existentes: PROD-03 (3 kg) y PROD-10 (10 kg)
-- Fuente: Etiqueta oficial Fit Fórmula Perro Adulto Raza Pequeña (estándares FEDIAF)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Fit',
  name = 'Fit Fórmula Adulto Raza Pequeña',
  tagline = 'Alimento High Premium formulado por médicos veterinarios para perros adultos de raza pequeña con 27% de proteína cruda (proteína animal como primer ingrediente), DHA y Omega 3, prebióticos MOS e inulina, silimarina, cranberries, hexametafosfato de sodio y Yucca Schidigera.',
  category = 'Alimento Seco',
  badge = 'Raza Pequeña · 27% Prot.',
  image = '/images/products/fit-formula-adulto-raza-pequena/01-estudio-principal.webp',
  images = '[
    "/images/products/fit-formula-adulto-raza-pequena/01-estudio-principal.webp",
    "/images/products/fit-formula-adulto-raza-pequena/02-lifestyle-raza-pequena.webp",
    "/images/products/fit-formula-adulto-raza-pequena/03-beneficios-clave.webp",
    "/images/products/fit-formula-adulto-raza-pequena/04-ingredientes-nutricion.webp",
    "/images/products/fit-formula-adulto-raza-pequena/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 27,
  protein_percent = '27%',
  main_protein = 'Vacuno',
  protein_subtitle = 'Proteína animal primer ingrediente (Vacuno y Ave)',
  gama = 'with',
  gama_detail = 'Con Grano · Cereales seleccionados (Maíz, Trigo y Arroz)',
  animal_percent = NULL,
  animal_percent_detail = 'Proteína animal como primer ingrediente',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos Raza Pequeña',
  benefits = '[
    "Inmunidad y defensa natural: enriquecido con vitamina C, nucleótidos, extracto de cardo mariano (silimarina 100 mg/kg) y cranberries (100 mg/kg) que ayudan a proteger el hígado, el sistema urinario y reducir el estrés oxidativo.",
    "Piel sana y pelaje brillante: formulado con aceite de pescado rico en ácidos grasos esenciales DHA y Omega 3 junto a biotina para un manto sano y luminoso.",
    "Control de sarro dental: incorpora hexametafosfato sódico para ayudar a prevenir la formación de sarro, ideal para perros de razas pequeñas.",
    "Óptima absorción de nutrientes: incluye minerales orgánicos e inorgánicos (zinc, hierro, cobre, manganeso, yodo y selenio) y proteínas animales hidrolizadas de alta digestibilidad.",
    "Digestión saludable y heces más firmes con menos olor: prebióticos MOS e inulina de achicoria (550 mg/kg), extracto de Yucca schidigera (500 mg/kg) y zeolita.",
    "Formulado por médicos veterinarios bajo requerimientos nutricionales FEDIAF (energía metabolizable mínima 3.340 kcal/kg)."
  ]'::jsonb,
  ingredients = '[
    "Harina de Carne (Carne y Hueso Bovino)",
    "Maíz",
    "Harina de Soya",
    "Salvado de Trigo",
    "Arroz",
    "Harina de Ave (Subproductos de Aves)",
    "Gluten de Maíz",
    "Aceite de Ave",
    "Proteínas animales hidrolizadas",
    "Harina de Trigo",
    "Aceite de Soya",
    "Vitaminas (A, D3, E, C, B1, B2, B3, B5, B6, B9 y B12)",
    "Nucleótidos y Biotina",
    "Cloruro de Sodio",
    "Pared celular de levadura",
    "Aceite de Pescado",
    "Minerales Orgánicos e Inorgánicos (Zinc, Hierro, Cobre, Manganeso, Yodo y Selenio)",
    "Preservante",
    "Antioxidantes",
    "Extracto de achicoria (Fuente de Inulina 550 mg/kg)",
    "Manano Oligosacáridos (MOS)",
    "Colina",
    "Extracto de Yucca schidigera (500 mg/kg)",
    "Hexametafosfato Sódico",
    "Esencia de Carne",
    "Zeolita",
    "Cranberries (100 mg/kg)",
    "Extracto de cardo mariano (Fuente de Silimarina 100 mg/kg)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '27% mín.',
    'Grasa Cruda', '8% mín.',
    'Humedad', '11% máx.',
    'Fibra Cruda', '3% máx.',
    'Energía Metabolizable', '3.340 kcal/kg mín. (1.515 kcal/lb)',
    'Inulina (Achicoria)', '550 mg/kg',
    'Extracto de Yucca Schidigera', '500 mg/kg',
    'Cranberries', '100 mg/kg',
    'Silimarina (Cardo Mariano)', '100 mg/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Los primeros 6 ingredientes reales en el orden exacto de la etiqueta Fit Fórmula Adulto Raza Pequeña, formulado por médicos veterinarios bajo estándares FEDIAF.",
      "stickers": [
        "Proteína Animal #1",
        "27% Proteína Cruda",
        "Control de Sarro",
        "DHA · Omega 3 · MOS"
      ],
      "wedges": [
        {
          "name": "Harina de Carne (Bovino)",
          "pill": "Proteína Animal #1",
          "desc": "Harina de carne y hueso bovino como primer ingrediente para aportar proteína de alta calidad y soporte muscular y óseo diario.",
          "img": "/images/bowl/ing-vacuno.webp"
        },
        {
          "name": "Maíz",
          "pill": "Energía Diaria",
          "desc": "Cereal energético seleccionado que entrega vitalidad constante para el activo metabolismo de los perros de raza pequeña.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Harina de Soya",
          "pill": "Proteína Vegetal",
          "desc": "Fuente vegetal complementaria de aminoácidos esenciales que refuerza el equilibrio nutricional de la receta.",
          "img": "/images/bowl/ing-soya.webp"
        },
        {
          "name": "Salvado de Trigo",
          "pill": "Fibra Digestiva",
          "desc": "Aporte natural de fibra dietaria que favorece la motilidad intestinal y contribuye a deposiciones mejor conformadas.",
          "img": "/images/bowl/ing-trigo.webp"
        },
        {
          "name": "Arroz",
          "pill": "Energía Noble",
          "desc": "Carbohidrato suave y altamente digestible ideal para cuidar el sistema digestivo de razas pequeñas.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Harina de Ave",
          "pill": "Proteína & Sabor",
          "desc": "Harina de subproductos de aves que complementa el perfil proteico animal y eleva la palatabilidad natural de cada croqueta.",
          "img": "/images/bowl/ing-pollo.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "weight_only",
      "cupGrams": 90,
      "cupLabel": "1 taza de té (200 mL) = 90 g aprox.",
      "stageLabel": "Perro Adulto Raza Pequeña",
      "stageBadge": "🐾 Adulto Raza Pequeña",
      "weightPrompt": "Ingresa el Peso Actual de tu Perro",
      "quickWeights": [2, 5, 8, 12],
      "extraPerKgOver": {
        "thresholdKg": 15,
        "baseGrams": 250,
        "gramsPerKg": 10
      },
      "note": "Para perros sobre 15 kg, sumar 10 g de alimento por cada kilo de peso extra. Limpia su plato antes de servir, no dejes el alimento más de 8 h y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "fit-sm-1",
          "min": 0,
          "max": 2,
          "label": "Hasta 2 kg (Hasta 4 lb)",
          "maint": "60 g / día (¾ taza)"
        },
        {
          "id": "fit-sm-2",
          "min": 2.01,
          "max": 4,
          "label": "De 2 a 4 kg (4 a 9 lb)",
          "maint": "60 a 100 g / día (¾ a 1 taza)"
        },
        {
          "id": "fit-sm-3",
          "min": 4.01,
          "max": 6,
          "label": "De 4 a 6 kg (9 a 13 lb)",
          "maint": "100 a 130 g / día (1 a 1½ tazas)"
        },
        {
          "id": "fit-sm-4",
          "min": 6.01,
          "max": 8,
          "label": "De 6 a 8 kg (13 a 18 lb)",
          "maint": "130 a 160 g / día (1½ a 1¾ tazas)"
        },
        {
          "id": "fit-sm-5",
          "min": 8.01,
          "max": 10,
          "label": "De 8 a 10 kg (18 a 22 lb)",
          "maint": "160 a 190 g / día (1¾ a 2 tazas)"
        },
        {
          "id": "fit-sm-6",
          "min": 10.01,
          "max": 12,
          "label": "De 10 a 12 kg (22 a 26 lb)",
          "maint": "190 a 220 g / día (2 a 2½ tazas)"
        },
        {
          "id": "fit-sm-7",
          "min": 12.01,
          "max": 999,
          "label": "De 12 a 15 kg (26 a 33 lb)",
          "maint": "220 a 250 g / día (2½ a 3 tazas)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id IN ('PROD-03', 'PROD-10');
