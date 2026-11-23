-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ACANA BOUNTIFUL CATCH 1.8 KG (PROD-34)
-- Fuente: Etiqueta oficial Chile (Registro SAG N° 2593/2021) y tabla de ración
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Acana',
  name = 'Acana Bountiful Catch',
  tagline = 'Alimento completo para gatos adultos con 65% de ingredientes animales de calidad: salmón fresco, bagre, arenque entero y trucha, junto a avena en grano, Omega-3 EPA+DHA y probióticos vivos para piel sana, corazón, visión y digestión.',
  category = 'Alimento Seco',
  badge = 'Salmón & Arenque · 65% Animal',
  image = '/images/products/acana-bountiful-catch/01-estudio-principal.webp',
  images = '[
    "/images/products/acana-bountiful-catch/01-estudio-principal.webp",
    "/images/products/acana-bountiful-catch/02-lifestyle-bountiful-catch.webp",
    "/images/products/acana-bountiful-catch/03-beneficios-clave.webp",
    "/images/products/acana-bountiful-catch/04-ingredientes-nutricion.webp",
    "/images/products/acana-bountiful-catch/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 33,
  protein_percent = '33%',
  main_protein = 'Salmón',
  protein_subtitle = 'Salmón, Bagre, Arenque Entero y Trucha (65% Animal)',
  gama = 'low',
  gama_detail = 'Low Grain Noble con avena en grano entero · Receta Marina',
  animal_percent = '65',
  animal_percent_detail = '65% Ingredientes Animales de Calidad (salmón, bagre, arenque entero y trucha)',
  life_stage = 'adulto',
  target_stage_label = 'Gatos Adultos',
  benefits = '[
    "Piel sana y pelaje sedoso: alto aporte marino de Omega-3 (0,8%), Omega-6 (2,5%), EPA (0,2%) y DHA (0,28%) provenientes de salmón, bagre, arenque y aceite de salmón.",
    "Corazón y visión saludables: formulado con taurina esencial (0,1% mín.), EPA, DHA y antioxidantes naturales para cuidar la salud cardíaca y ocular felina.",
    "Salud digestiva óptima: proteína de pescado de alta digestibilidad combinada con avena en grano, fibra de lenteja y 1 millón UFC/lb de probióticos vivos (Lactobacillus acidophilus, Bifidobacterium animalis y Lactobacillus casei).",
    "65% ingredientes animales de calidad: receta marina rica en pescados enteros y frescos (salmón, bagre, arenque y trucha) con 33% de proteína cruda mínima.",
    "Sabor irresistible para gatos exigentes: elaborado con pescado crudo y sabor natural de salmón sin colorantes artificiales (3.800 kcal/kg · 433 kcal/taza).",
    "Elaborado en EE.UU. por Champion Petfoods bajo estrictos estándares de calidad y Registro SAG N° 2593/2021."
  ]'::jsonb,
  ingredients = '[
    "Salmón",
    "Salmón deshidratado",
    "Bagre deshidratado",
    "Avena en grano",
    "Guisantes enteros",
    "Aceite de bagre",
    "Arenque entero",
    "Lentejas verdes enteras",
    "Garbanzos enteros",
    "Bagre",
    "Sabor natural de salmón",
    "Fibra de lenteja",
    "Aceite de girasol",
    "Trucha",
    "Aceite de salmón",
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
    "Niacina",
    "Mononitrato de tiamina",
    "Riboflavina",
    "Calcio pantotenato",
    "Clorhidrato de piridoxina",
    "Ácido fólico",
    "Suplemento de vitamina B12",
    "Biotina",
    "Ácido ascórbico (vitamina C)",
    "Ácido cítrico (preservante)",
    "Extracto de romero",
    "Producto de la fermentación del Lactobacillus acidophilus seco",
    "Producto de la fermentación del Bifidobacterium animalis seco",
    "Producto de la fermentación del Lactobacillus casei seco"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '33%',
    'Grasa Cruda', '16%',
    'Fibra Cruda', '4%',
    'Humedad', '10%',
    'EPA', '0,2%',
    'DHA', '0,28%',
    'Calcio', '2%',
    'Fósforo', '1,4%',
    'Magnesio', '0,1%',
    'Taurina', '0,1%',
    'Omega 3', '0,8%',
    'Omega 6', '2,5%',
    'Probióticos', '1M UFC/lb',
    'Energía', '3.800 kcal/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "65% ingredientes animales marinos en el orden exacto de la receta: salmón fresco, bagre, avena en grano, guisantes enteros y aceites ricos en Omega-3 EPA y DHA.",
      "stickers": [
        "Salmón & Arenque",
        "65% Animal",
        "33% Proteína",
        "Probióticos Vivos"
      ],
      "wedges": [
        {
          "name": "Salmón",
          "pill": "33% Proteína",
          "desc": "Salmón fresco como primer ingrediente: proteína marina de altísima palatabilidad y fuente natural de Omega-3 para piel y pelaje radiantes.",
          "img": "/images/bowl/ing-salmon.webp"
        },
        {
          "name": "Salmón deshidratado",
          "pill": "Proteína Conc.",
          "desc": "Concentrado de salmón rico en aminoácidos esenciales y taurina natural que sostiene la masa muscular magra de tu gato.",
          "img": "/images/bowl/ing-salmon.webp"
        },
        {
          "name": "Bagre deshidratado",
          "pill": "Pescado Noble",
          "desc": "Pescado blanco de agua dulce altamente digestible que complementa el perfil proteico marino y aporta minerales esenciales.",
          "img": "/images/bowl/ing-pescado-blanco.webp"
        },
        {
          "name": "Avena en grano",
          "pill": "Energía Noble",
          "desc": "Grano entero de bajo índice glicémico y fibra soluble natural que apoya la salud digestiva y libera energía estable.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Guisantes enteros",
          "pill": "Fibra & Minerales",
          "desc": "Legumbre entera fuente de fibra prebiótica, vitaminas y minerales clave para una digestión equilibrada.",
          "img": "/images/bowl/ing-arvejas.webp"
        },
        {
          "name": "Aceite de bagre",
          "pill": "Omega 3 · EPA/DHA",
          "desc": "Aceite marino puro que eleva el aporte de EPA (0,2%) y DHA (0,28%) para nutrir el pelaje, el corazón y la visión.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_conditions",
      "cupGrams": 114,
      "cupLabel": "1 taza (240 ml / 8 fl.oz) = 114 g",
      "note": "Guía oficial Acana Bountiful Catch (433 kcal por taza de 114 g). Divide la ración diaria en 2 comidas, ajusta según actividad y mantén siempre agua fresca disponible.",
      "conditions": [
        { "id": "neutered", "label": "Esterilizado", "subtitle": "Mantenimiento", "icon": "🏠" },
        { "id": "intact", "label": "Entero", "subtitle": "Sin esterilizar", "icon": "🐱" },
        { "id": "overweight", "label": "Sobrepeso", "subtitle": "Control de peso (≥ 4,5 kg)", "icon": "⚖️" }
      ],
      "rows": [
        {
          "id": "acana-bc-0",
          "min": 0,
          "max": 1.8,
          "label": "0,9 - 1,8 kg (2 - 4 lb)",
          "intact": "29 - 38 g / día (¼ - ⅓ taza)",
          "neutered": "19 - 29 g / día (⅙ - ¼ taza)",
          "overweight": null
        },
        {
          "id": "acana-bc-1",
          "min": 1.81,
          "max": 2.7,
          "label": "1,8 - 2,7 kg (4 - 6 lb)",
          "intact": "38 - 57 g / día (⅓ - ½ taza)",
          "neutered": "29 - 38 g / día (¼ - ⅓ taza)",
          "overweight": null
        },
        {
          "id": "acana-bc-2",
          "min": 2.71,
          "max": 3.6,
          "label": "2,7 - 3,6 kg (6 - 8 lb)",
          "intact": "57 - 71 g / día (½ - ⅝ taza)",
          "neutered": "38 - 43 g / día (⅓ - ⅜ taza)",
          "overweight": null
        },
        {
          "id": "acana-bc-3",
          "min": 3.61,
          "max": 4.5,
          "label": "3,6 - 4,5 kg (8 - 10 lb)",
          "intact": "71 - 76 g / día (⅝ - ⅔ taza)",
          "neutered": "43 - 57 g / día (⅜ - ½ taza)",
          "overweight": null
        },
        {
          "id": "acana-bc-4",
          "min": 4.51,
          "max": 5.4,
          "label": "4,5 - 5,4 kg (10 - 12 lb)",
          "intact": "76 - 86 g / día (⅔ - ¾ taza)",
          "neutered": "57 - 75 g / día (½ - ⅔ taza)",
          "overweight": "57 - 71 g / día (½ - ⅝ taza)"
        },
        {
          "id": "acana-bc-5",
          "min": 5.41,
          "max": 6.8,
          "label": "5,4 - 6,8 kg (12 - 15 lb)",
          "intact": "86 - 100 g / día (¾ - ⅞ taza)",
          "neutered": "75 - 86 g / día (⅔ - ¾ taza)",
          "overweight": "71 - 76 g / día (⅝ - ⅔ taza)"
        },
        {
          "id": "acana-bc-6",
          "min": 6.81,
          "max": 999,
          "label": "6,8 - 9,1 kg (15 - 20 lb)",
          "intact": "100 - 114 g / día (⅞ - 1 taza)",
          "neutered": "86 - 100 g / día (¾ - ⅞ taza)",
          "overweight": "76 - 86 g / día (⅔ - ¾ taza)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-34';
