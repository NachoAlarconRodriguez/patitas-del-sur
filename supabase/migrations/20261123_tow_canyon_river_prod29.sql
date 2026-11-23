-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: TASTE OF THE WILD CANYON RIVER 2 KG (PROD-29)
-- Fuente: Etiqueta oficial ES (Fórmula Canyon River Feline con trucha y salmón ahumado)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'TOW',
  name = 'TOW Canyon River Trucha & Salmón',
  tagline = 'Alimento completo 100% Grain Free y 100% proteína de pescado (sin pollo) para gatos de todas las etapas y esterilizados, con trucha sustentable (19%) como primer ingrediente, salmón ahumado (4%), prebióticos y 1.000 mg/kg de taurina.',
  category = 'Alimento Seco',
  badge = 'Grain Free · Trucha 19%',
  weights = '["2 kg"]'::jsonb,
  image = '/images/products/tow-canyon-river/01-estudio-principal.webp',
  images = '[
    "/images/products/tow-canyon-river/01-estudio-principal.webp",
    "/images/products/tow-canyon-river/02-lifestyle-canyon.webp",
    "/images/products/tow-canyon-river/03-beneficios-clave.webp",
    "/images/products/tow-canyon-river/04-ingredientes-nutricion.webp",
    "/images/products/tow-canyon-river/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 32,
  protein_percent = '32%',
  main_protein = 'Trucha',
  protein_subtitle = 'Trucha (19%), Pescado Oceánico y Salmón Ahumado (4%) · Sin Pollo',
  gama = 'free',
  gama_detail = '100% Grain Free · Sin Cereales ni Pollo',
  animal_percent = NULL,
  animal_percent_detail = 'Trucha sustentable (19%) como #1 ingrediente · Proteína animal 100% de pescado',
  life_stage = 'adulto',
  target_stage_label = 'Todas las Etapas · Apto Esterilizados',
  benefits = '[
    "100% proteína animal de pescado (sin pollo): trucha de origen sustentable (19%) como primer ingrediente, harina de pescado oceánico y salmón ahumado (4%), ideal para gatos sensibles al pollo.",
    "100% Grain Free (sin cereales): formulado con boniatos (camote) y patatas como carbohidratos suaves y altamente digestibles.",
    "Apto para todas las etapas de vida y gatos esterilizados: nutrición completa y balanceada para gatitos en crecimiento, gatos adultos y esterilizados.",
    "Corazón, visión, piel y pelaje: enriquecido con 1.000 mg/kg de taurina esencial, ácidos grasos Omega-6 (2,4%) y Omega-3 (0,3%).",
    "Prebióticos y defensa antioxidante: raíces de achicoria secas, jugo de yuca schidigera, tomates, arándanos azules y frambuesas.",
    "Elaborado en EE.UU. por Diamond Pet Foods (Taste of the Wild · Family-Owned Brand) con vitaminas A, D3, E y minerales quelados."
  ]'::jsonb,
  ingredients = '[
    "Trucha (19%)",
    "Harina de pescado oceánico",
    "Boniatos",
    "Patatas",
    "Proteína de guisantes",
    "Proteína de patata",
    "Aceite de canola",
    "Salmón ahumado (4%)",
    "Cloruro de potasio",
    "Minerales",
    "Raíces de achicoria secas",
    "Tomates",
    "Arándanos azules",
    "Frambuesas",
    "Jugo de yuca schidigera"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '32%',
    'Grasa Cruda', '16%',
    'Fibra Cruda', '3%',
    'Humedad', '10%',
    'Ceniza Bruta', '8%',
    'Omega 6', '2,4%',
    'Omega 3', '0,3%',
    'Taurina', '1.000 mg/kg',
    'Vitamina A', '10.000 UI/kg',
    'Vitamina D3', '750 UI/kg',
    'Vitamina E', '150 UI/kg',
    'Zinc', '30,3 mg/kg',
    'Cobre', '2,87 mg/kg',
    'Yodo', '1,78 mg/kg',
    'Selenio', '0,018 mg/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Receta 100% libre de granos y sin pollo en el orden exacto de la etiqueta: trucha sustentable (19%), pescado oceánico, camote y frutos rojos antioxidantes para tu michi.",
      "stickers": [
        "Trucha 19% #1",
        "100% Grain Free",
        "Sin Pollo · Pescado",
        "Apto Esterilizados"
      ],
      "wedges": [
        {
          "name": "Trucha (19%)",
          "pill": "32% Proteína",
          "desc": "Trucha de origen sustentable como primer ingrediente: proteína marina de altísima digestibilidad y sabor irresistible para tu michi.",
          "img": "/images/bowl/ing-trucha.webp"
        },
        {
          "name": "Pescado oceánico",
          "pill": "Omega 3 Marino",
          "desc": "Harina de pescado oceánico rica en aminoácidos marinos y ácidos grasos esenciales para una piel sana y pelaje sedoso.",
          "img": "/images/bowl/ing-pescado-blanco.webp"
        },
        {
          "name": "Boniatos (Camote)",
          "pill": "Energía Grain Free",
          "desc": "Carbohidrato noble de alta digestibilidad rico en fibra natural, potasio y antioxidantes sin cereales.",
          "img": "/images/bowl/ing-camote.webp"
        },
        {
          "name": "Patatas (Papa)",
          "pill": "Sin Cereales",
          "desc": "Fuente limpia y libre de gluten que entrega energía estable para acompañar la vitalidad diaria.",
          "img": "/images/bowl/ing-papa.webp"
        },
        {
          "name": "Proteína de guisantes",
          "pill": "Proteína Vegetal",
          "desc": "Aporte proteico libre de granos que complementa el balance nutricional de la receta junto al salmón ahumado (4%).",
          "img": "/images/bowl/ing-arvejas.webp"
        },
        {
          "name": "Proteína de patata",
          "pill": "Alta Digestibilidad",
          "desc": "Aminoácidos vegetales de fácil asimilación ideales para estómagos felinos delicados.",
          "img": "/images/bowl/ing-papa.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_all_stages",
      "cupLabel": "Todas las Etapas · Apto Esterilizados",
      "note": "Guía oficial Taste of the Wild Canyon River. Realiza la transición gradual durante 7 a 10 días mezclando con el alimento anterior y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "tow-cr-a1",
          "min": 0,
          "max": 2.25,
          "label": "1 - 2,25 kg (Gato Adulto Pequeño)",
          "maint": "22 - 41 g / día"
        },
        {
          "id": "tow-cr-a2",
          "min": 2.26,
          "max": 4.5,
          "label": "2,25 - 4,5 kg (Gato Adulto Promedio)",
          "maint": "41 - 69 g / día"
        },
        {
          "id": "tow-cr-a3",
          "min": 4.51,
          "max": 6.8,
          "label": "4,5 - 6,8 kg (Gato Adulto Grande)",
          "maint": "69 - 95 g / día"
        },
        {
          "id": "tow-cr-a4",
          "min": 6.81,
          "max": 999,
          "label": "6,8 - 9 kg (Gato Adulto Robusto)",
          "maint": "95 - 117 g / día"
        }
      ],
      "adultRows": [
        {
          "id": "tow-cr-a1",
          "min": 0,
          "max": 2.25,
          "label": "1 - 2,25 kg (Gato Adulto Pequeño)",
          "maint": "22 - 41 g / día"
        },
        {
          "id": "tow-cr-a2",
          "min": 2.26,
          "max": 4.5,
          "label": "2,25 - 4,5 kg (Gato Adulto Promedio)",
          "maint": "41 - 69 g / día"
        },
        {
          "id": "tow-cr-a3",
          "min": 4.51,
          "max": 6.8,
          "label": "4,5 - 6,8 kg (Gato Adulto Grande)",
          "maint": "69 - 95 g / día"
        },
        {
          "id": "tow-cr-a4",
          "min": 6.81,
          "max": 999,
          "label": "6,8 - 9 kg (Gato Adulto Robusto)",
          "maint": "95 - 117 g / día"
        }
      ],
      "kittenRows": [
        {
          "id": "tow-cr-k1",
          "min": 0,
          "max": 1.75,
          "label": "0,5 - 1,75 kg (Gatito)",
          "maint": "Destete-16 sem: 33-85 g | 5-7 m: 28-71 g | 7-9 m: 22-57 g | 9-12 m: 18-46 g"
        },
        {
          "id": "tow-cr-k2",
          "min": 1.76,
          "max": 2.75,
          "label": "1,75 - 2,75 kg (Gatito)",
          "maint": "Destete-16 sem: 85-120 g | 5-7 m: 71-100 g | 7-9 m: 57-80 g | 9-12 m: 46-64 g"
        },
        {
          "id": "tow-cr-k3",
          "min": 2.76,
          "max": 4,
          "label": "2,75 - 4 kg (Gatito Joven)",
          "maint": "Destete-16 sem: 120-159 g | 5-7 m: 100-132 g | 7-9 m: 80-106 g | 9-12 m: 64-85 g"
        },
        {
          "id": "tow-cr-k4",
          "min": 4.01,
          "max": 999,
          "label": "4 - 5,5 kg (Gatito Grande)",
          "maint": "Destete-16 sem: 159-202 g | 5-7 m: 132-168 g | 7-9 m: 106-134 g | 9-12 m: 85-108 g"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-29';
