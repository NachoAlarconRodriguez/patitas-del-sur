-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: TASTE OF THE WILD ROCKY MOUNTAIN 2 KG (PROD-30)
-- Fuente: Etiqueta oficial ES (Fórmula Rocky Mountain Feline con ciervo asado y salmón ahumado)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'TOW',
  name = 'TOW Rocky Mountain Venado & Salmón',
  tagline = 'Alimento completo 100% Grain Free para gatos de todas las etapas (apto para esterilizados) con 42% de proteína cruda, ciervo asado, salmón ahumado, prebióticos de raíz de achicoria y 1.000 mg/kg de taurina esencial.',
  category = 'Alimento Seco',
  badge = 'Grain Free · 42% Proteína',
  weights = '["2 kg"]'::jsonb,
  image = '/images/products/tow-rocky-mountain/01-estudio-principal.webp',
  images = '[
    "/images/products/tow-rocky-mountain/01-estudio-principal.webp",
    "/images/products/tow-rocky-mountain/02-lifestyle-rocky.webp",
    "/images/products/tow-rocky-mountain/03-beneficios-clave.webp",
    "/images/products/tow-rocky-mountain/04-ingredientes-nutricion.webp",
    "/images/products/tow-rocky-mountain/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 42,
  protein_percent = '42%',
  main_protein = 'Venado',
  protein_subtitle = 'Ciervo Asado (4%), Salmón Ahumado (4%) y Pollo',
  gama = 'free',
  gama_detail = '100% Grain Free · Sin Cereales (con guisantes y boniatos)',
  animal_percent = NULL,
  animal_percent_detail = '42% Proteína de alta densidad con pollo, ciervo asado, salmón ahumado y pescado oceánico',
  life_stage = 'adulto',
  target_stage_label = 'Todas las Etapas · Apto Esterilizados',
  benefits = '[
    "42% de proteína de alta densidad: receta con harina de pollo, ciervo asado (4%), salmón ahumado (4%) y harina de pescado oceánico para una musculatura fuerte y alta palatabilidad.",
    "100% Grain Free (sin cereales): carbohidratos altamente digestibles provenientes de guisantes y boniatos (camote) para una energía limpia y suave digestión.",
    "Apto para todas las etapas de vida y gatos esterilizados: nutrición balanceada tanto para gatitos en crecimiento como para gatos adultos y esterilizados.",
    "Corazón, visión, piel y pelaje: enriquecido con 1.000 mg/kg de taurina esencial, ácidos grasos Omega-6 (2,8%) y Omega-3 (0,3%).",
    "Prebióticos y defensa antioxidante: raíces de achicoria secas prebióticas, jugo de yuca schidigera, tomates, arándanos azules y frambuesas.",
    "Elaborado en EE.UU. por Diamond Pet Foods (Taste of the Wild · Family-Owned Brand) con vitaminas A, D3, E y minerales quelados."
  ]'::jsonb,
  ingredients = '[
    "Harina de pollo",
    "Guisantes",
    "Boniatos",
    "Grasa de pollo (conservada con tocoferoles mezclados)",
    "Proteína de guisantes",
    "Proteína de patata",
    "Ciervo asado (4%)",
    "Salmón ahumado (4%)",
    "Harina de pescado oceánico",
    "Cloruro de potasio",
    "Minerales",
    "Raíces de achicoria secas",
    "Tomates",
    "Arándanos azules",
    "Frambuesas",
    "Jugo de yuca schidigera"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '42%',
    'Grasa Cruda', '18%',
    'Fibra Cruda', '3%',
    'Humedad', '10%',
    'Ceniza Bruta', '8,3%',
    'Omega 6', '2,8%',
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
      "subtitle": "Receta 100% libre de granos en el orden exacto de la etiqueta, con 42% de proteína, camote, ciervo asado, salmón ahumado y frutos rojos antioxidantes para tu michi.",
      "stickers": [
        "42% Proteína",
        "100% Grain Free",
        "Ciervo y Salmón",
        "Apto Esterilizados"
      ],
      "wedges": [
        {
          "name": "Harina de pollo",
          "pill": "42% Proteína",
          "desc": "Proteína animal concentrada como primer ingrediente que aporta los aminoácidos esenciales para mantener una musculatura firme y vitalidad diaria.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Guisantes",
          "pill": "Fibra & Energía",
          "desc": "Legumbre natural rica en fibra, vitaminas y carbohidratos de asimilación gradual sin cereales.",
          "img": "/images/bowl/ing-arvejas.webp"
        },
        {
          "name": "Boniatos (Camote)",
          "pill": "Energía Grain Free",
          "desc": "Carbohidrato noble de alta digestibilidad rico en fibra, potasio y antioxidantes naturales.",
          "img": "/images/bowl/ing-camote.webp"
        },
        {
          "name": "Grasa de pollo",
          "pill": "Omega 6 y Energía",
          "desc": "Conservada naturalmente con tocoferoles mezclados: aporta ácidos grasos Omega-6 (2,8%) y energía concentrada para un pelaje brillante.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        },
        {
          "name": "Proteína de guisantes",
          "pill": "Proteína Vegetal",
          "desc": "Aporte proteico complementario libre de granos que apoya la densidad nutricional del 42% de proteína total.",
          "img": "/images/bowl/ing-arvejas.webp"
        },
        {
          "name": "Proteína de patata",
          "pill": "Sin Cereales",
          "desc": "Fuente altamente digestible de aminoácidos libre de gluten, complementada en receta con ciervo asado (4%) y salmón ahumado (4%).",
          "img": "/images/bowl/ing-papa.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_all_stages",
      "cupLabel": "Todas las Etapas · Apto Esterilizados",
      "note": "Guía oficial Taste of the Wild Rocky Mountain. Realiza la transición gradual durante 7 a 10 días mezclando con el alimento anterior y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "tow-rm-a1",
          "min": 0,
          "max": 2.25,
          "label": "1 - 2,25 kg (Gato Adulto Pequeño)",
          "maint": "35 - 53 g / día"
        },
        {
          "id": "tow-rm-a2",
          "min": 2.26,
          "max": 4.5,
          "label": "2,25 - 4,5 kg (Gato Adulto Promedio)",
          "maint": "53 - 70 g / día"
        },
        {
          "id": "tow-rm-a3",
          "min": 4.51,
          "max": 6.8,
          "label": "4,5 - 6,8 kg (Gato Adulto Grande)",
          "maint": "70 - 106 g / día"
        },
        {
          "id": "tow-rm-a4",
          "min": 6.81,
          "max": 999,
          "label": "6,8 - 9 kg (Gato Adulto Robusto)",
          "maint": "106 - 133 g / día"
        }
      ],
      "adultRows": [
        {
          "id": "tow-rm-a1",
          "min": 0,
          "max": 2.25,
          "label": "1 - 2,25 kg (Gato Adulto Pequeño)",
          "maint": "35 - 53 g / día"
        },
        {
          "id": "tow-rm-a2",
          "min": 2.26,
          "max": 4.5,
          "label": "2,25 - 4,5 kg (Gato Adulto Promedio)",
          "maint": "53 - 70 g / día"
        },
        {
          "id": "tow-rm-a3",
          "min": 4.51,
          "max": 6.8,
          "label": "4,5 - 6,8 kg (Gato Adulto Grande)",
          "maint": "70 - 106 g / día"
        },
        {
          "id": "tow-rm-a4",
          "min": 6.81,
          "max": 999,
          "label": "6,8 - 9 kg (Gato Adulto Robusto)",
          "maint": "106 - 133 g / día"
        }
      ],
      "kittenRows": [
        {
          "id": "tow-rm-k1",
          "min": 0,
          "max": 1.75,
          "label": "0,5 - 1,75 kg (Gatito)",
          "maint": "Destete-16 sem: 35-133 g | 5-7 m: 35-70 g | 7-12 m: 27-53 g"
        },
        {
          "id": "tow-rm-k2",
          "min": 1.76,
          "max": 2.75,
          "label": "1,75 - 2,75 kg (Gatito)",
          "maint": "Destete-16 sem: 133-159 g | 5-7 m: 70-106 g | 7-9 m: 53-80 g | 9-12 m: 53-70 g"
        },
        {
          "id": "tow-rm-k3",
          "min": 2.76,
          "max": 4,
          "label": "2,75 - 4 kg (Gatito Joven)",
          "maint": "Destete-16 sem: 159-186 g | 5-7 m: 106-133 g | 7-9 m: 80-106 g | 9-12 m: 70-80 g"
        },
        {
          "id": "tow-rm-k4",
          "min": 4.01,
          "max": 999,
          "label": "4 - 5,5 kg (Gatito Grande)",
          "maint": "5-7 m: 133-159 g | 7-9 m: 106-133 g | 9-12 m: 80-106 g"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-30';
