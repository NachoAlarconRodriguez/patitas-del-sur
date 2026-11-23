-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: NÓMADE ADULTO GATO (3 KG Y 10 KG)
-- Actualiza ambas variantes existentes: PROD-27 (10 kg) y PROD-28 (3 kg)
-- Fuente: Etiqueta oficial Nómade Premium Gato Adulto (Mix Proteico)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Nomade',
  name = 'Nomade Adulto',
  tagline = 'Alimento Premium completo y balanceado para gatos adultos con 32% de proteína mínima de mix proteico animal (ave, cerdo y salmón), defensa bioactiva con post-biótico, MOS y nucleótidos, pulpa de remolacha para eliminación de pelos, extracto de quillay, Omega 3 y 6, zinc orgánico y antioxidantes naturales.',
  category = 'Alimento Seco',
  badge = 'Mix Proteico · 32% Prot.',
  image = '/images/products/nomade-gato-adulto/01-estudio-principal.webp',
  images = '[
    "/images/products/nomade-gato-adulto/01-estudio-principal.webp",
    "/images/products/nomade-gato-adulto/02-lifestyle-gato-adulto.webp",
    "/images/products/nomade-gato-adulto/03-beneficios-clave.webp",
    "/images/products/nomade-gato-adulto/04-ingredientes-nutricion.webp",
    "/images/products/nomade-gato-adulto/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 32,
  protein_percent = '32%',
  main_protein = 'Pollo',
  protein_subtitle = 'Mix Proteico Animal (Ave, Cerdo y Pescado / Salmón)',
  gama = 'with',
  gama_detail = 'Con Grano · Arroz, Maíz y Salvado de Trigo · Antioxidantes Naturales',
  animal_percent = NULL,
  animal_percent_detail = 'Mix proteico de origen animal (ave, cerdo y pescado) como primer ingrediente',
  life_stage = 'adulto',
  target_stage_label = 'Gatos Adultos (Desde 1 Año)',
  benefits = '[
    "Pelaje más sano y brillante: formulado con aceite de origen marino (fuente de Omega 3), Omega 6, harina de salmón y zinc orgánico para nutrir piel y pelaje.",
    "Defensa bioactiva e intestinal: combina post-biótico, prebióticos MOS (manano-oligosacáridos), cultivo de levaduras y nucleótidos para fortalecer la inmunidad y salud digestiva.",
    "Facilita la eliminación de bolas de pelo: contiene coseta (pulpa) de remolacha que aporta fibra funcional para ayudar a transitar el pelo ingerido.",
    "Cuidado urinario, dental y corazón fuerte: incluye taurina, metionina, bisulfato de sodio para apoyar el equilibrio del pH urinario y hexametafosfato de sodio para control de sarro.",
    "Heces más firmes y menor olor en el arenero: incorpora extracto de quillay y zeolita natural para reducir el olor y mejorar la consistencia fecal.",
    "Formulado con antioxidantes naturales: elaborado con extracto de romero y tocoferoles, aportando 3.453 kcal/kg de energía metabolizable."
  ]'::jsonb,
  ingredients = '[
    "Harina de vísceras y carne de ave",
    "Gluten meal",
    "Arroz",
    "Maíz",
    "Salvado de trigo",
    "Aceite de ave, cerdo y/o vacuno",
    "Harina de soya",
    "Hidrolizado de hígado (ave, cerdo y/o vacuno)",
    "Harina de salmón",
    "Nucleótidos",
    "Coseta de remolacha",
    "Sal",
    "Bisulfato de sodio",
    "Hexametafosfato de Sodio",
    "Zeolita",
    "Aceite de origen marino (fuente de Omega 3)",
    "Extracto de quillay",
    "Cultivo de levaduras",
    "Metionina",
    "Taurina",
    "MOS (manano-oligosacáridos)",
    "Post-biótico",
    "Zinc orgánico",
    "Antioxidante natural (extracto de romero y tocoferoles)",
    "Vitaminas (A, D3, B1, B6, niacina, colina, pantotenato de calcio, ácido fólico)",
    "Minerales (Calcio, fósforo, hierro, zinc, cobre, manganeso, sodio, cloro, selenio)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '32% mín.',
    'Grasa Cruda', '12% mín.',
    'Fibra Cruda', '3,5% máx.',
    'Humedad', '8% máx.',
    'Energía Metabolizable', '3.453 kcal/kg',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Los primeros 6 ingredientes reales en el orden exacto de la etiqueta Nómade Premium Gato Adulto: mix proteico animal, cereales seleccionados y grasas altamente palatables.",
      "stickers": [
        "Mix Proteico Animal",
        "32% Proteína Mín.",
        "Post-Biótico + MOS",
        "Pulpa de Remolacha"
      ],
      "wedges": [
        {
          "name": "Carne y vísceras de ave",
          "pill": "Proteína Animal #1",
          "desc": "Harina de vísceras y carne de ave como primer ingrediente para entregar proteína de alta calidad y sabor irresistible para tu gato.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Gluten meal (Maíz)",
          "pill": "Proteína Concentrada",
          "desc": "Concentrado proteico de maíz de alta digestibilidad que refuerza la densidad proteica (32% mín.) y aporta metionina natural.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Arroz",
          "pill": "Energía Suave",
          "desc": "Cereal noble de fácil asimilación que cuida el sistema digestivo y aporta energía limpia para la actividad diaria.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Maíz",
          "pill": "Energía Diaria",
          "desc": "Fuente energética seleccionada que acompaña el estilo de vida activo de gatos adultos.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Salvado de trigo",
          "pill": "Fibra Digestiva",
          "desc": "Aporte natural de fibra dietaria que favorece el tránsito intestinal junto a la pulpa de remolacha.",
          "img": "/images/bowl/ing-trigo.webp"
        },
        {
          "name": "Aceite de ave, cerdo y vacuno",
          "pill": "Energía & Palatabilidad",
          "desc": "Mezcla de aceites animales que realza la palatabilidad de cada croqueta y aporta ácidos grasos esenciales.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_conditions",
      "cupLabel": "Transición oficial en 10 días: 25% → 50% → 75% → 100%",
      "note": "Guía oficial Nómade Premium Gato Adulto. Realiza el cambio de alimento gradualmente durante 10 días y mantén siempre agua fresca disponible.",
      "conditions": [
        { "id": "neutered", "label": "Sedentario / Indoor", "subtitle": "Actividad baja o interior", "icon": "🏠" },
        { "id": "intact", "label": "Actividad Normal", "subtitle": "Gato activo diario", "icon": "⚡" },
        { "id": "overweight", "label": "Baja Actividad", "subtitle": "Control de ración", "icon": "⚖️" }
      ],
      "rows": [
        {
          "id": "nom-cat-1",
          "min": 0,
          "max": 3,
          "label": "1 a 3 kg",
          "intact": "21 a 61 g / día",
          "neutered": "18 a 53 g / día",
          "overweight": "18 a 53 g / día"
        },
        {
          "id": "nom-cat-2",
          "min": 3.01,
          "max": 5,
          "label": "3 a 5 kg",
          "intact": "61 a 102 g / día",
          "neutered": "53 a 87 g / día",
          "overweight": "53 a 87 g / día"
        },
        {
          "id": "nom-cat-3",
          "min": 5.01,
          "max": 7,
          "label": "5 a 7 kg",
          "intact": "102 a 142 g / día",
          "neutered": "87 a 122 g / día",
          "overweight": "87 a 122 g / día"
        },
        {
          "id": "nom-cat-4",
          "min": 7.01,
          "max": 999,
          "label": "7 a 9 kg",
          "intact": "142 a 183 g / día",
          "neutered": "122 a 157 g / día",
          "overweight": "122 a 157 g / día"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id IN ('PROD-27', 'PROD-28');
