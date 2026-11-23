-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ACANA INDOOR ENTRÉE 1.8 KG (PROD-33)
-- Fuente: Etiqueta oficial Chile (Registro SAG N° 7396/2021) y tabla de ración
-- Ejecutar en Supabase SQL Editor (mantiene precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Acana',
  name = 'Acana Indoor Entrée',
  tagline = 'Alimento completo para gatos adultos de interior con 65% de ingredientes animales de calidad: pollo y pavo de corral, arenque entero, avena en grano y probióticos vivos para control de peso, bolas de pelo y salud digestiva.',
  category = 'Alimento Seco',
  badge = 'Indoor · 65% Animal',
  weights = '["1.8 kg"]'::jsonb,
  image = '/images/products/acana-indoor-entree/01-estudio-principal.webp',
  images = '[
    "/images/products/acana-indoor-entree/01-estudio-principal.webp",
    "/images/products/acana-indoor-entree/02-lifestyle-indoor.webp",
    "/images/products/acana-indoor-entree/03-beneficios-clave.webp",
    "/images/products/acana-indoor-entree/04-ingredientes-nutricion.webp",
    "/images/products/acana-indoor-entree/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 36,
  protein_percent = '36%',
  main_protein = 'Pollo',
  protein_subtitle = 'Pollo y Pavo de Corral + Arenque',
  gama = 'low',
  gama_detail = 'Low Grain Noble con avena en grano entero',
  animal_percent = '65',
  animal_percent_detail = '65% Ingredientes Animales de Calidad (pollo y pavo de corral, arenque y conejo)',
  life_stage = 'adulto',
  target_stage_label = 'Gatos Adultos Indoor',
  benefits = '[
    "Control de peso saludable: energía metabolizable equilibrada (3.670 kcal/kg), 14% de grasa cruda y L-carnitina para mantener la condición corporal ideal en gatos de interior.",
    "Control de bolas de pelo: combinación de fibra natural proveniente de hierba miscanthus molida, avena en grano entero y fibra de lenteja que favorece el tránsito intestinal.",
    "Salud digestiva óptima: enriquecido con 1 millón UFC/lb de probióticos vivos (Lactobacillus acidophilus, Bifidobacterium animalis y Lactobacillus casei) y fibra prebiótica.",
    "65% ingredientes animales de calidad: pollo y pavo de corral, arenque entero, conejo, hígado y corazón de pollo con 36% de proteína cruda mínima.",
    "Piel sana, pelaje brillante y salud cardíaca: aporte balanceado de Omega-3 (0,5%), Omega-6 (2%), EPA (0,1%), DHA (0,2%) y taurina esencial (0,1%).",
    "Elaborado en EE.UU. por Champion Petfoods bajo estrictos estándares de calidad y Registro SAG N° 7396/2021."
  ]'::jsonb,
  ingredients = '[
    "Pollo",
    "Pollo deshidratado",
    "Arenque deshidratado",
    "Avena en grano",
    "Guisantes enteros",
    "Grasa de pollo",
    "Hierba miscanthus molida",
    "Pavo",
    "Lentejas verdes enteras",
    "Garbanzos enteros",
    "Arenque entero",
    "Sabor natural de pollo",
    "Fibra de lenteja",
    "Conejo",
    "Hígado de pollo",
    "Corazón de pollo",
    "Arándanos enteros",
    "Algas marinas secas",
    "Cloruro de colina",
    "Proteinato de zinc",
    "Tocoferoles mezclados (preservante)",
    "Suplemento de vitamina E",
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
    'Proteína Cruda', '36%',
    'Grasa Cruda', '14%',
    'Fibra Cruda', '5%',
    'Humedad', '10%',
    'Almidón Dietético', '18%',
    'Azúcares', '1,2%',
    'EPA', '0,1%',
    'DHA', '0,2%',
    'Calcio', '1,4%',
    'Fósforo', '1%',
    'Magnesio', '0,1%',
    'Taurina', '0,1%',
    'Omega 3', '0,5%',
    'Omega 6', '2%',
    'Probióticos', '1M UFC/lb',
    'Energía', '3.670 kcal/kg',
    '_shipping_unit_cost', COALESCE(guaranteed_analysis->'_shipping_unit_cost', '1444'::jsonb),
    '_bowl_config', '{
      "subtitle": "65% ingredientes animales reales en el orden exacto de la receta. Pollo de corral, arenque, avena en grano y fibras funcionales pensadas para tu michi indoor.",
      "stickers": [
        "Pollo de Corral",
        "Avena en Grano",
        "36% Proteína",
        "Control Bolas de Pelo"
      ],
      "wedges": [
        {
          "name": "Pollo",
          "pill": "36% Proteína",
          "desc": "Pollo fresco de corral como primer ingrediente: proteína animal magra y altamente digestible para mantener la musculatura firme de tu michi.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Pollo deshidratado",
          "pill": "Proteína Conc.",
          "desc": "Fuente concentrada de aminoácidos esenciales de pollo que eleva el aporte proteico al 36% sin exceso de carbohidratos.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Arenque deshidratado",
          "pill": "Omega 3 · EPA/DHA",
          "desc": "Pescado marino rico en ácidos grasos esenciales EPA y DHA para nutrir la piel, dar brillo al pelaje y apoyar la salud cognitiva.",
          "img": "/images/bowl/ing-pescado-blanco.webp"
        },
        {
          "name": "Avena en grano",
          "pill": "Energía Noble",
          "desc": "Grano entero de bajo índice glicémico y fibra soluble natural que entrega energía estable y favorece el control de bolas de pelo.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Guisantes enteros",
          "pill": "Fibra & Minerales",
          "desc": "Legumbre entera rica en fibra vegetal, vitaminas y minerales clave para una digestión suave y mayor saciedad en gatos de interior.",
          "img": "/images/bowl/ing-arvejas.webp"
        },
        {
          "name": "Grasa de pollo",
          "pill": "Omega 6 y Energía",
          "desc": "Fuente natural de ácidos grasos esenciales Omega-6 (2%) y alta palatabilidad para un pelaje sedoso y vitalidad diaria.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_conditions",
      "cupGrams": 114,
      "cupLabel": "1 taza (240 ml / 8 fl.oz) = 114 g",
      "note": "Guía oficial Acana Indoor Entrée (418 kcal por taza de 114 g). Divide la ración diaria en 2 comidas, ajusta según actividad y mantén siempre agua fresca disponible.",
      "conditions": [
        { "id": "neutered", "label": "Esterilizado", "subtitle": "Mantenimiento indoor", "icon": "🏠" },
        { "id": "intact", "label": "Entero", "subtitle": "Sin esterilizar", "icon": "🐱" },
        { "id": "overweight", "label": "Sobrepeso", "subtitle": "Control de peso (≥ 4,5 kg)", "icon": "⚖️" }
      ],
      "rows": [
        {
          "id": "acana-ie-1",
          "min": 0,
          "max": 2.7,
          "label": "1,8 - 2,7 kg (4 - 6 lb)",
          "intact": "38 - 57 g / día (⅓ - ½ taza)",
          "neutered": "29 - 38 g / día (¼ - ⅓ taza)",
          "overweight": null
        },
        {
          "id": "acana-ie-2",
          "min": 2.71,
          "max": 3.6,
          "label": "2,7 - 3,6 kg (6 - 8 lb)",
          "intact": "57 - 71 g / día (½ - ⅝ taza)",
          "neutered": "38 - 43 g / día (⅓ - ⅜ taza)",
          "overweight": null
        },
        {
          "id": "acana-ie-3",
          "min": 3.61,
          "max": 4.5,
          "label": "3,6 - 4,5 kg (8 - 10 lb)",
          "intact": "71 - 76 g / día (⅝ - ⅔ taza)",
          "neutered": "43 - 57 g / día (⅜ - ½ taza)",
          "overweight": null
        },
        {
          "id": "acana-ie-4",
          "min": 4.51,
          "max": 5.4,
          "label": "4,5 - 5,4 kg (10 - 12 lb)",
          "intact": "76 - 86 g / día (⅔ - ¾ taza)",
          "neutered": "57 - 75 g / día (½ - ⅔ taza)",
          "overweight": "57 - 71 g / día (½ - ⅝ taza)"
        },
        {
          "id": "acana-ie-5",
          "min": 5.41,
          "max": 6.8,
          "label": "5,4 - 6,8 kg (12 - 15 lb)",
          "intact": "86 - 100 g / día (¾ - ⅞ taza)",
          "neutered": "75 - 86 g / día (⅔ - ¾ taza)",
          "overweight": "71 - 76 g / día (⅝ - ⅔ taza)"
        },
        {
          "id": "acana-ie-6",
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
WHERE id = 'PROD-33';
