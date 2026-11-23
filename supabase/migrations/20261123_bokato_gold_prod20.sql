-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: BOKATO GOLD 20 KG (PROD-20)
-- Fuente: Etiqueta oficial Bokato Gold Super Premium (N.R.C. y AAFCO)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Bokato',
  name = 'Bokato Gold',
  tagline = 'Alimento natural Super Premium para perros adultos con 85% de proteína de origen animal, libre de soya y trigo, enriquecido con diatomita antiparasitaria bio-orgánica, cúrcuma, blackberry, glucosamina, condroitina, L-carnitina y betaglucanos.',
  category = 'Alimento Seco',
  badge = 'Super Premium · 85% Prot. Animal',
  image = '/images/products/bokato-gold/01-estudio-principal.webp',
  images = '[
    "/images/products/bokato-gold/01-estudio-principal.webp",
    "/images/products/bokato-gold/02-lifestyle-bokato-gold.webp",
    "/images/products/bokato-gold/03-beneficios-clave.webp",
    "/images/products/bokato-gold/04-ingredientes-nutricion.webp",
    "/images/products/bokato-gold/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 26,
  protein_percent = '26%',
  main_protein = 'Ave y Cerdo',
  protein_subtitle = '85% de la proteína es de origen animal (Carne de Ave y Cerdo)',
  gama = 'with',
  gama_detail = 'Super Premium Natural · Libre de Soya y Trigo · Sin Colorantes ni Saborizantes',
  animal_percent = '85',
  animal_percent_detail = '85% de la proteína total es de origen animal (carne de ave y cerdo)',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos',
  benefits = '[
    "Diatomita antiparasitaria bio-orgánica (Kieselgur Earth): apoyo natural para el control de parásitos internos que no interfiere con los tratamientos veterinarios habituales de desparasitación.",
    "Joint Care articular + antiinflamatorio natural: enriquecido con glucosamina, condroitina, cúrcuma longa y piperina para proteger articulaciones y movilidad en perros adultos.",
    "85% proteína de origen animal (26% proteína cruda mín.): carne de ave y cerdo como primer ingrediente, libre de soya y trigo, sin colorantes ni saborizantes artificiales.",
    "Defensas y energía metabólica: incluye betaglucanos, MOS, L-carnitina, bioselenio (Se++) y antioxidantes naturales de romero y blackberry (Aristotelia sp.).",
    "Piel sana y pelaje brillante: blend marino de Omega 3, 6 y 9 con EPA y DHA (Omega 3 mín. 0,7%) y aceite de ave de alta digestibilidad.",
    "Digestión limpia y control de olor: fibra soluble (tomasa), Yucca schidigera y Quillaja saponina para heces firmes y con menor olor en un formato rendidor de 20 kg."
  ]'::jsonb,
  ingredients = '[
    "Carne de ave y cerdo",
    "Maíz de grano molido",
    "Arroz de grano molido",
    "Salvado de arroz",
    "Aceite de ave",
    "Tomasa (fibra soluble)",
    "Hemoglobina de bovino spray dried",
    "Hidrolizado en base a hígado",
    "Blend marino de omega 3, 6 y 9 con EPA y DHA",
    "L-Carnitina",
    "Diatomita (Kieselgur Earth)",
    "Betaglucanos",
    "MOS (manano-oligosacáridos)",
    "Fibra natural",
    "Yucca schidigera",
    "Quillaja saponina",
    "Glucosamina y Condroitina",
    "Cúrcuma longa",
    "Piperina",
    "Vitaminas (A, D3, E, K3, B1, B2, B6, B12, Biotina, Niacina B3 y Colina)",
    "Minerales orgánicos y ácidos orgánicos",
    "Se++ como bioselenio",
    "Antioxidante natural (extracto de romero y Blackberry Aristotelia sp.)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '26% mín.',
    'Grasa Cruda', '12% mín.',
    'Fibra Cruda', '2,5% máx.',
    'Humedad', '10% máx.',
    'Calcio', '1,1% mín.',
    'Fósforo', '0,9% mín.',
    'Omega 3', '0,7% mín.',
    'Proteína Animal', '85% del total',
    'Joint Care', 'Glucosamina + Condroitina',
    'Antiparasitario', 'Diatomita Natural',
    'Antioxidantes', 'Cúrcuma + Blackberry',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Los primeros 6 ingredientes reales en el orden exacto de la etiqueta Bokato Gold: carne de ave y cerdo (85% proteína de origen animal), cereales libres de trigo y soya, aceite de ave y fibra soluble.",
      "stickers": [
        "85% Proteína Animal",
        "Con Diatomita Natural",
        "Glucosamina + Cúrcuma",
        "Libre de Soya y Trigo"
      ],
      "wedges": [
        {
          "name": "Carne de ave y cerdo",
          "pill": "26% Proteína",
          "desc": "Primer ingrediente con 85% de la proteína total de origen animal para mantener musculatura fuerte, vitalidad y alta palatabilidad.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Maíz de grano molido",
          "pill": "Energía Diaria",
          "desc": "Cereal molido libre de trigo y soya que aporta energía sostenida para perros adultos desde actividad normal hasta muy activos.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Arroz de grano molido",
          "pill": "Fácil Digestión",
          "desc": "Carbohidrato noble de alta tolerancia digestiva que entrega energía limpia y favorece la consistencia de las heces.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Salvado de arroz",
          "pill": "Fibra & Vitaminas B",
          "desc": "Aporta fibra dietaria natural, antioxidantes y vitaminas del complejo B para el equilibrio intestinal diario.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Aceite de ave",
          "pill": "12% Grasa & Brillo",
          "desc": "Fuente energética altamente palatable que complementa el blend marino de Omega 3, 6 y 9 con EPA y DHA para un pelaje brillante.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        },
        {
          "name": "Tomasa (fibra soluble)",
          "pill": "Salud Intestinal",
          "desc": "Fibra soluble vegetal que, junto a betaglucanos, MOS, Yucca schidigera y Quillaja, cuida la flora intestinal y reduce olores.",
          "img": "/images/bowl/ing-remolacha.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "weight_only",
      "cupLabel": "Ración diaria en gramos · Según peso y nivel de actividad",
      "stageLabel": "Perro Adulto (Todas las Razas)",
      "stageBadge": "🐶 Adulto · 2,5 a +50 kg",
      "weightPrompt": "Ingresa el Peso de tu Perro Adulto",
      "quickWeights": [10, 20, 30, 45],
      "note": "Guía oficial Bokato Gold (N.R.C. y AAFCO). Los valores muestran Actividad Normal como referencia principal junto a Inactivo/Senior, Activo y Muy Activo. Divide en 2 comidas y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "bokato-g-1",
          "min": 0,
          "max": 3.5,
          "label": "2,5 kg",
          "maint": "60 g / día (Inactivo: 45 g · Activo: 65 g · Muy activo: 90 g)"
        },
        {
          "id": "bokato-g-2",
          "min": 3.51,
          "max": 7.5,
          "label": "5 kg",
          "maint": "100 g / día (Inactivo: 80 g · Activo: 110 g · Muy activo: 250 g)"
        },
        {
          "id": "bokato-g-3",
          "min": 7.51,
          "max": 12.5,
          "label": "10 kg",
          "maint": "160 g / día (Inactivo: 130 g · Activo: 185 g · Muy activo: 260 g)"
        },
        {
          "id": "bokato-g-4",
          "min": 12.51,
          "max": 17.5,
          "label": "15 kg",
          "maint": "220 g / día (Inactivo: 180 g · Activo: 250 g · Muy activo: 350 g)"
        },
        {
          "id": "bokato-g-5",
          "min": 17.51,
          "max": 22.5,
          "label": "20 kg",
          "maint": "270 g / día (Inactivo: 225 g · Activo: 300 g · Muy activo: 440 g)"
        },
        {
          "id": "bokato-g-6",
          "min": 22.51,
          "max": 27.5,
          "label": "25 kg",
          "maint": "325 g / día (Inactivo: 265 g · Activo: 370 g · Muy activo: 520 g)"
        },
        {
          "id": "bokato-g-7",
          "min": 27.51,
          "max": 35,
          "label": "30 kg",
          "maint": "370 g / día (Inactivo: 300 g · Activo: 420 g · Muy activo: 590 g)"
        },
        {
          "id": "bokato-g-8",
          "min": 35.01,
          "max": 45,
          "label": "40 kg",
          "maint": "460 g / día (Inactivo: 380 g · Activo: 520 g · Muy activo: 730 g)"
        },
        {
          "id": "bokato-g-9",
          "min": 45.01,
          "max": 999,
          "label": "+50 kg",
          "maint": "550 g / día (Inactivo: 450 g · Activo: 620 g · Muy activo: 870 g)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-20';
