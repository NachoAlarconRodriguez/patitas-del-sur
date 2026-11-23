-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ACANA SENIOR ENTRÉE 1.8 KG (PROD-35)
-- Fuente: Etiqueta oficial Chile (Registro SAG N° 2456-2023) y tabla de ración
-- Ejecutar en Supabase SQL Editor (mantiene precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Acana',
  name = 'Acana Senior Entrée',
  tagline = 'Alimento completo para gatos senior con 65% de ingredientes animales de calidad: pollo y pavo de corral, huevos, aceite de pescado, taurina esencial y probióticos vivos para salud digestiva, cardíaca, ocular y articular.',
  category = 'Alimento Seco',
  badge = 'Senior · 65% Animal',
  weights = '["1.8 kg"]'::jsonb,
  image = '/images/products/acana-senior-entree/01-estudio-principal.webp',
  images = '[
    "/images/products/acana-senior-entree/01-estudio-principal.webp",
    "/images/products/acana-senior-entree/02-lifestyle-senior.webp",
    "/images/products/acana-senior-entree/03-beneficios-clave.webp",
    "/images/products/acana-senior-entree/04-ingredientes-nutricion.webp",
    "/images/products/acana-senior-entree/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 33,
  protein_percent = '33%',
  main_protein = 'Pollo',
  protein_subtitle = 'Pollo y Pavo de Corral + Aceite de Pescado',
  gama = 'low',
  gama_detail = 'Low Grain Noble con avena en grano entero',
  animal_percent = '65',
  animal_percent_detail = '65% Ingredientes Animales de Calidad (pollo y pavo de corral, huevos y pato)',
  life_stage = 'senior',
  target_stage_label = 'Gatos Senior (7+ años)',
  benefits = '[
    "Salud digestiva óptima: enriquecido con 1 millón UFC/lb de probióticos vivos (Lactobacillus acidophilus, Bifidobacterium animalis y Lactobacillus casei), avena en grano entero y fibra de lenteja.",
    "Corazón y visión saludables: aporte balanceado de taurina esencial (0,1%), EPA (0,15%) y DHA (0,15%) para cuidar la función cardíaca y ocular de gatos mayores.",
    "Salud articular y movilidad: ácidos grasos Omega-3 (0,6%) provenientes de aceite de pescado y L-carnitina para apoyar las articulaciones en la etapa senior.",
    "65% ingredientes animales de calidad: pollo y pavo de corral, huevos, pato, hígado y corazón de pollo con 33% de proteína cruda mínima para preservar masa muscular magra.",
    "Piel sana y pelaje brillante: alta concentración de Omega-6 (2,8%) y Omega-3 (0,6%) con antioxidantes naturales de arándanos enteros y algas marinas.",
    "Elaborado en EE.UU. por Champion Petfoods bajo estrictos estándares de calidad y Registro SAG N° 2456-2023."
  ]'::jsonb,
  ingredients = '[
    "Pollo",
    "Pollo deshidratado",
    "Pavo deshidratado",
    "Avena en grano",
    "Guisantes enteros",
    "Lentejas verdes enteras",
    "Garbanzos enteros",
    "Grasa de pollo",
    "Huevos",
    "Pavo",
    "Fibra de lenteja",
    "Sabor natural de pollo",
    "Aceite de pescado",
    "Pato",
    "Hígado de pollo",
    "Corazón de pollo",
    "Cloruro de colina",
    "Arándanos enteros",
    "Algas marinas secas",
    "Sal",
    "Proteinato de zinc",
    "Suplemento de vitamina E",
    "Tocoferoles mezclados (preservante)",
    "Taurina",
    "Suplemento de vitamina D3",
    "Acetato de vitamina A",
    "L-carnitina",
    "DL-metionina",
    "Proteinato de cobre",
    "Biotina",
    "Niacina",
    "Mononitrato de tiamina",
    "Riboflavina",
    "Calcio pantotenato",
    "Clorhidrato de piridoxina",
    "Ácido fólico",
    "Suplemento de vitamina B12",
    "Ácido ascórbico (vitamina C)",
    "Ácido cítrico (preservante)",
    "Extracto de romero",
    "Producto de la fermentación del Lactobacillus acidophilus seco",
    "Producto de la fermentación del Bifidobacterium animalis seco",
    "Producto de la fermentación del Lactobacillus casei seco"
  ]'::jsonb,
  guaranteed_analysis = jsonb_build_object(
    'Proteína Cruda', '33%',
    'Grasa Cruda', '14%',
    'Fibra Cruda', '4%',
    'Humedad', '10%',
    'EPA', '0,15%',
    'DHA', '0,15%',
    'Calcio', '1,8%',
    'Fósforo', '1,2%',
    'Magnesio', '0,1%',
    'Taurina', '0,1%',
    'Omega 3', '0,6%',
    'Omega 6', '2,8%',
    'Probióticos', '1M UFC/lb',
    'Energía', '3.670 kcal/kg',
    '_shipping_unit_cost', COALESCE(guaranteed_analysis->'_shipping_unit_cost', '1444'::jsonb),
    '_bowl_config', '{
      "subtitle": "65% ingredientes animales reales en el orden exacto de la receta. Pollo y pavo de corral, avena en grano y legumbres nobles pensadas para la vitalidad de tu michi senior.",
      "stickers": [
        "Pollo y Pavo de Corral",
        "Avena en Grano",
        "33% Proteína",
        "Cuidado Articular"
      ],
      "wedges": [
        {
          "name": "Pollo",
          "pill": "33% Proteína",
          "desc": "Pollo fresco de corral como primer ingrediente: proteína animal altamente digestible para preservar la masa muscular magra en gatos senior.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Pollo deshidratado",
          "pill": "Proteína Conc.",
          "desc": "Fuente concentrada de aminoácidos esenciales de pollo que refuerza el aporte proteico diario sin sobrecargar la digestión.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Pavo deshidratado",
          "pill": "Proteína Magra",
          "desc": "Ave magra de excelente palatabilidad y alto valor biológico que complementa la vitalidad y condición corporal de tu gato mayor.",
          "img": "/images/bowl/ing-pavo.webp"
        },
        {
          "name": "Avena en grano",
          "pill": "Energía Noble",
          "desc": "Grano entero de bajo índice glicémico y fibra soluble natural para una digestión suave y energía estable durante el día.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Guisantes enteros",
          "pill": "Fibra & Minerales",
          "desc": "Legumbre entera rica en fibra vegetal, vitaminas y minerales clave que favorecen el tránsito intestinal y la saciedad.",
          "img": "/images/bowl/ing-arvejas.webp"
        },
        {
          "name": "Lentejas verdes enteras",
          "pill": "Fibra Prebiótica",
          "desc": "Fuente natural de carbohidratos complejos y fibra prebiótica que nutre la flora intestinal junto a los probióticos vivos.",
          "img": "/images/bowl/ing-lentejas.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_conditions",
      "cupGrams": 114,
      "cupLabel": "1 taza (240 ml / 8 fl.oz) = 114 g",
      "note": "Guía oficial Acana Senior Entrée (418 kcal por taza de 114 g). Divide la ración diaria en 2 comidas, ajusta según actividad y mantén siempre agua fresca disponible.",
      "conditions": [
        { "id": "neutered", "label": "Esterilizado", "subtitle": "Mantenimiento senior", "icon": "🏠" },
        { "id": "intact", "label": "Entero", "subtitle": "Sin esterilizar", "icon": "🐱" },
        { "id": "overweight", "label": "Sobrepeso", "subtitle": "Control de peso (≥ 4,5 kg)", "icon": "⚖️" }
      ],
      "rows": [
        {
          "id": "acana-se-1",
          "min": 0,
          "max": 1.8,
          "label": "0,9 - 1,8 kg (2 - 4 lb)",
          "intact": "29 - 38 g / día (¼ - ⅓ taza)",
          "neutered": "19 - 29 g / día (⅙ - ¼ taza)",
          "overweight": null
        },
        {
          "id": "acana-se-2",
          "min": 1.81,
          "max": 2.7,
          "label": "1,8 - 2,7 kg (4 - 6 lb)",
          "intact": "38 - 57 g / día (⅓ - ½ taza)",
          "neutered": "29 - 38 g / día (¼ - ⅓ taza)",
          "overweight": null
        },
        {
          "id": "acana-se-3",
          "min": 2.71,
          "max": 3.6,
          "label": "2,7 - 3,6 kg (6 - 8 lb)",
          "intact": "57 - 71 g / día (½ - ⅝ taza)",
          "neutered": "38 - 43 g / día (⅓ - ⅜ taza)",
          "overweight": null
        },
        {
          "id": "acana-se-4",
          "min": 3.61,
          "max": 4.5,
          "label": "3,6 - 4,5 kg (8 - 10 lb)",
          "intact": "71 - 76 g / día (⅝ - ⅔ taza)",
          "neutered": "43 - 57 g / día (⅜ - ½ taza)",
          "overweight": null
        },
        {
          "id": "acana-se-5",
          "min": 4.51,
          "max": 5.4,
          "label": "4,5 - 5,4 kg (10 - 12 lb)",
          "intact": "76 - 86 g / día (⅔ - ¾ taza)",
          "neutered": "57 - 75 g / día (½ - ⅔ taza)",
          "overweight": "57 - 71 g / día (½ - ⅝ taza)"
        },
        {
          "id": "acana-se-6",
          "min": 5.41,
          "max": 6.8,
          "label": "5,4 - 6,8 kg (12 - 15 lb)",
          "intact": "86 - 100 g / día (¾ - ⅞ taza)",
          "neutered": "75 - 86 g / día (⅔ - ¾ taza)",
          "overweight": "71 - 76 g / día (⅝ - ⅔ taza)"
        },
        {
          "id": "acana-se-7",
          "min": 6.81,
          "max": 999,
          "label": "6,8 - 9,1 kg (15 - 20 lb)",
          "intact": "100 - 114 g / día (⅞ - 1 taza)",
          "neutered": "86 - 100 g / día (¾ - ⅞ taza)",
          "overweight": "76 - 86 g / día (⅔ - ¾ taza)"
        }
      ]
    }'::jsonb
  ),
  updated_at = now()
WHERE id = 'PROD-35';
