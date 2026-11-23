-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: LEONARDO ADULT LIGHT & STERILISED (1,8 KG Y 7,5 KG)
-- Actualiza ambas variantes existentes: PROD-24 (1,8 kg) y PROD-25 (7,5 kg)
-- Fuente: Etiqueta oficial ES/CL/PE Leonardo Adult Light & Sterilised (Made in Germany)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Leonardo',
  name = 'Leonardo Adult Light & Sterilised',
  tagline = 'Alimento Super Premium alemán para gatos adultos desde 1 año esterilizados o con tendencia al sobrepeso: 80% proteína animal sobre el total con 30% carne de ave extra fresca, 35% proteína, solo 12,5% grasa, krill marino, L-carnitina y 1.400 mg/kg de taurina.',
  category = 'Alimento Seco',
  badge = 'Light · 80% Prot. Animal',
  image = '/images/products/leonardo-adult-light-sterilised/01-estudio-principal.webp',
  images = '[
    "/images/products/leonardo-adult-light-sterilised/01-estudio-principal.webp",
    "/images/products/leonardo-adult-light-sterilised/02-lifestyle-light.webp",
    "/images/products/leonardo-adult-light-sterilised/03-beneficios-clave.webp",
    "/images/products/leonardo-adult-light-sterilised/04-ingredientes-nutricion.webp",
    "/images/products/leonardo-adult-light-sterilised/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 35,
  protein_percent = '35%',
  main_protein = 'Pollo',
  protein_subtitle = '30% Carne de Ave Extra Fresca + Pescado Marino (9%) + Krill',
  gama = 'with',
  gama_detail = 'Super Premium Alemán · Arroz, Maíz, Centeno Malteado y Salvado de Avena',
  animal_percent = '80',
  animal_percent_detail = '80% Proteína animal sobre el total de proteínas (carne de ave fresca 30%, proteína de ave 23%, pescado marino 9% y krill 2,5%)',
  life_stage = 'adulto',
  target_stage_label = 'Gatos Adultos Esterilizados / Control de Peso',
  benefits = '[
    "Control de peso saludable y gatos esterilizados: 35% de proteína bruta con bajo contenido graso (12,5%) y 200 mg/kg de L-carnitina para preservar masa muscular magra.",
    "80% proteína animal sobre el total: elaborado con 30% de carne de ave extra fresca, 23% proteína de ave baja en ceniza y 9% harina de pescado de agua salada.",
    "Superalimentos marinos y vegetales: zooplancton marino (krill 2,5%) rico en Omega-3 y astaxantina natural, junto a semillas de chía (1,3%) para piel sana y pelaje sedoso.",
    "Mayor saciedad y digestión suave: fibra natural proveniente de pulpa de manzana secada (4%), salvado de avena (2,5%), levadura de cerveza e inulina de achicoria.",
    "Corazón, visión y defensas fuertes: alto aporte de taurina esencial (1.400 mg/kg), vitamina C (245 mg/kg), vitamina A (15.000 UI/kg) y lecitina (2.000 mg/kg).",
    "Calidad Super Premium fabricada en Alemania (Made in Germany) con antioxidantes naturales de tocoferoles vegetales."
  ]'::jsonb,
  ingredients = '[
    "Carne de ave fresca (30%)",
    "Proteína de ave con bajo contenido en ceniza, secada (23%)",
    "Arroz",
    "Maíz",
    "Harina de pescado de agua salada (9%)",
    "Pulpa de manzana, secada (4%)",
    "Hígado de ave, hidrolizado",
    "Centeno, malteado",
    "Huevo, secado",
    "Zooplancton marino (krill), molido (2,5%)",
    "Salvado de avena (2,5%)",
    "Levadura de cerveza inactivada, secada",
    "Semillas de chía (1,3%)",
    "Grasa de ave",
    "Cloruro sódico",
    "Cloruro potásico",
    "Inulina de achicoria"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '35%',
    'Grasa Cruda', '12,5%',
    'Fibra Cruda', '3,5%',
    'Humedad', '10%',
    'Ceniza Bruta', '7,8%',
    'Calcio', '1%',
    'Fósforo', '0,8%',
    'Sodio', '0,4%',
    'Taurina', '1.400 mg/kg',
    'L-Carnitina', '200 mg/kg',
    'Vitamina A', '15.000 UI/kg',
    'Vitamina D3', '1.500 UI/kg',
    'Vitamina E', '150 mg/kg',
    'Vitamina C', '245 mg/kg',
    'Lecitina', '2.000 mg/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "80% de proteína animal sobre el total en el orden exacto de la receta alemana: 30% carne de ave extra fresca, pescado marino, manzana y krill para tu michi esterilizado.",
      "stickers": [
        "30% Ave Extra Fresca",
        "80% Prot. Animal",
        "12,5% Grasa Light",
        "Con Krill y Chía"
      ],
      "wedges": [
        {
          "name": "Carne de ave fresca (30%)",
          "pill": "80% Prot. Animal",
          "desc": "Carne de ave extra fresca como primer ingrediente: máxima palatabilidad y aminoácidos de alto valor biológico para mantener masa muscular magra.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Proteína de ave (23%)",
          "pill": "35% Proteína",
          "desc": "Proteína de ave secada con bajo contenido en ceniza que refuerza la densidad proteica cuidando el equilibrio mineral urinario.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Arroz",
          "pill": "Energía Suave",
          "desc": "Carbohidrato noble de muy fácil digestibilidad para una asimilación suave y energía balanceada.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Maíz",
          "pill": "Energía Diaria",
          "desc": "Fuente energética controlada que acompaña el metabolismo diario de gatos adultos de interior.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Pescado marino (9%)",
          "pill": "Omega 3 Marino",
          "desc": "Harina de pescado de agua salada rica en proteínas marinas y ácidos grasos esenciales para una piel sana y pelaje brillante.",
          "img": "/images/bowl/ing-pescado-blanco.webp"
        },
        {
          "name": "Pulpa de manzana (4%)",
          "pill": "Fibra & Saciedad",
          "desc": "Fibra natural soluble e insoluble que prolonga la sensación de saciedad y favorece el tránsito intestinal saludable.",
          "img": "/images/bowl/ing-manzana-verde.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_conditions",
      "cupLabel": "Alimentación mixta: 25 g seco = 100 g húmedo",
      "note": "Guía oficial Leonardo Adult Light & Sterilised. Administrar en seco, controlar periódicamente el peso de tu gato y asegurar agua fresca en todo momento.",
      "conditions": [
        { "id": "neutered", "label": "Esterilizado / Indoor", "subtitle": "Control de peso", "icon": "🏠" },
        { "id": "intact", "label": "Alta Actividad", "subtitle": "Gato muy activo", "icon": "⚡" },
        { "id": "overweight", "label": "Reducción de Peso", "subtitle": "Tendencia a sobrepeso", "icon": "⚖️" }
      ],
      "rows": [
        {
          "id": "leo-ls-1",
          "min": 0,
          "max": 3.4,
          "label": "3 kg (Peso ideal)",
          "intact": "65 g / día",
          "neutered": "45 g / día",
          "overweight": "45 g / día"
        },
        {
          "id": "leo-ls-2",
          "min": 3.41,
          "max": 4.4,
          "label": "4 kg (Peso ideal)",
          "intact": "80 g / día",
          "neutered": "50 g / día",
          "overweight": "50 g / día"
        },
        {
          "id": "leo-ls-3",
          "min": 4.41,
          "max": 5.4,
          "label": "5 kg (Peso ideal)",
          "intact": "85 g / día",
          "neutered": "60 g / día",
          "overweight": "60 g / día"
        },
        {
          "id": "leo-ls-4",
          "min": 5.41,
          "max": 6.4,
          "label": "6 kg (Peso ideal)",
          "intact": "100 g / día",
          "neutered": "70 g / día",
          "overweight": "70 g / día"
        },
        {
          "id": "leo-ls-5",
          "min": 6.41,
          "max": 999,
          "label": "7 kg (Peso ideal)",
          "intact": "110 g / día",
          "neutered": "75 g / día",
          "overweight": "75 g / día"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id IN ('PROD-24', 'PROD-25');
