-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: NÓMADE ADULTO RAZA MEDIANA Y GRANDE (20 KG)
-- Actualiza la variante existente: PROD-08 (20 kg)
-- Fuente: Etiqueta oficial Nómade Premium Perro Adulto Razas Medianas y Grandes (Producto Chileno)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Nomade',
  name = 'Nomade Adulto Raza Mediana y Grande',
  tagline = 'Alimento completo y balanceado con ingredientes 100% chilenos para perros adultos de razas medianas y grandes: 27% proteína mínima con proteína animal como ingrediente principal, enriquecido con maqui, extracto de quillay, post-biótico, MOS y Omega 3.',
  category = 'Alimento Seco',
  badge = 'Raza Mediana y Grande · 27% Proteína',
  image = '/images/products/nomade-adulto-raza-mediana-grande/01-estudio-principal.webp',
  images = '[
    "/images/products/nomade-adulto-raza-mediana-grande/01-estudio-principal.webp",
    "/images/products/nomade-adulto-raza-mediana-grande/02-lifestyle-raza-mediana-grande.webp",
    "/images/products/nomade-adulto-raza-mediana-grande/03-beneficios-clave.webp",
    "/images/products/nomade-adulto-raza-mediana-grande/04-ingredientes-nutricion.webp",
    "/images/products/nomade-adulto-raza-mediana-grande/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 27,
  protein_percent = '27%',
  main_protein = 'Vacuno',
  protein_subtitle = 'Proteína de origen animal como ingrediente principal',
  gama = 'with',
  gama_detail = 'Con Grano · Cereales chilenos (Maíz, Arroz y Salvado de Trigo)',
  animal_percent = NULL,
  animal_percent_detail = 'Proteína de origen animal como ingrediente principal · Ingredientes 100% chilenos',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos Razas Medianas y Grandes',
  benefits = '[
    "Defensa bioactiva para la inmunidad y salud intestinal: formulado con post-biótico, MOS (manano-oligosacáridos) y cultivo de levaduras.",
    "Antioxidantes naturales (AOX): enriquecido con extracto seco de maqui chileno, extracto de romero y tocoferoles que protegen contra el envejecimiento celular.",
    "Omega 3 y 6 + Zinc orgánico: aceite de origen marino y zinc orgánico para mantener la piel sana, el pelaje brillante y una mente activa.",
    "Control de olor y heces más firmes: contiene extracto de quillay chileno, zeolita y coseta de remolacha que reducen los molestos olores de las deposiciones.",
    "Cuidado dental diario: incluye hexametafosfato de sodio para ayudar a prevenir la acumulación de sarro en perros adultos.",
    "Formato rendidor de 20 kg 100% chileno: proteína de origen animal como primer ingrediente (27% proteína mínima y 3.265 kcal/kg)."
  ]'::jsonb,
  ingredients = '[
    "Harina de carne y hueso (bovino, cerdo y/o ave)",
    "Maíz",
    "Arroz",
    "Salvado de trigo",
    "Aceite de ave, cerdo y/o vacuno",
    "Harina de soya",
    "Gluten meal",
    "Salvado de arroz",
    "Hidrolizado de hígado (vacuno, ave y/o cerdo)",
    "Coseta de remolacha",
    "Colorante caramelo natural",
    "Sal",
    "Zeolita",
    "Aceite de origen marino (fuente de Omega 3)",
    "Cultivo de levaduras",
    "Hexametafosfato de sodio",
    "Extracto de quillay",
    "Extracto seco de maqui",
    "Post-biótico",
    "MOS (manano-oligosacáridos)",
    "Zinc orgánico",
    "Antioxidante natural (extracto de romero y tocoferoles)",
    "Vitaminas (A, D3, B1, B6, niacina, colina, pantotenato de calcio, ácido fólico)",
    "Minerales (Calcio, fósforo, hierro, zinc, cobre, manganeso, sodio, cloro, selenio)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '27%',
    'Grasa Cruda', '10%',
    'Fibra Cruda', '3,5%',
    'Humedad', '10%',
    'Energía', '3.265 kcal/kg',
    'Antioxidantes', 'Maqui + Romero',
    'Control Olor', 'Quillay + Zeolita',
    'Defensa Intestinal', 'Post-biótico + MOS',
    'Omega 3', 'Aceite Marino',
    'Cuidado Dental', 'Hexametafosfato',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Ingredientes 100% chilenos en el orden exacto de la receta: proteína animal como ingrediente principal, energía equilibrada, maqui y quillay para perros adultos de razas medianas y grandes.",
      "stickers": [
        "Proteína Animal #1",
        "27% Proteína",
        "Enriquecido con Maqui",
        "Extracto de Quillay"
      ],
      "wedges": [
        {
          "name": "Harina de carne y hueso",
          "pill": "27% Proteína",
          "desc": "Proteína de origen animal (bovino, cerdo y/o ave) como primer ingrediente para mantener masa muscular firme, huesos fuertes y vitalidad diaria.",
          "img": "/images/bowl/ing-vacuno.webp"
        },
        {
          "name": "Maíz",
          "pill": "Energía Diaria",
          "desc": "Cereal energético de alta disponibilidad calórica para acompañar la actividad física diaria de perros medianos y grandes.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Arroz",
          "pill": "Fácil Digestión",
          "desc": "Carbohidrato noble de excelente tolerancia gastrointestinal que aporta energía sostenida y heces consistentes.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Salvado de trigo",
          "pill": "Fibra Digestiva",
          "desc": "Fuente natural de fibra dietaria que favorece el tránsito intestinal saludable y la saciedad diaria.",
          "img": "/images/bowl/ing-trigo.webp"
        },
        {
          "name": "Aceite de ave, cerdo y/o vacuno",
          "pill": "Omega & Palatabilidad",
          "desc": "Grasas animales seleccionadas que aportan energía concentrada (10% grasa mín.), ácidos grasos esenciales y alto sabor.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        },
        {
          "name": "Harina de soya",
          "pill": "Aporte Proteico",
          "desc": "Complementa el perfil de aminoácidos esenciales junto a la proteína animal principal para una nutrición completa y balanceada.",
          "img": "/images/bowl/ing-soya.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "weight_only",
      "cupLabel": "Consumo diario en gramos · Dividir en 2 comidas al día",
      "stageLabel": "Perro Adulto (Razas Medianas y Grandes)",
      "stageBadge": "🐶 Adulto · 10 a 70 kg",
      "weightPrompt": "Ingresa el Peso de tu Perro Adulto",
      "quickWeights": [15, 25, 35, 50],
      "note": "Consumo diario recomendado oficial de Nómade Adulto Razas Medianas y Grandes. Realiza el cambio de alimento en forma gradual (7 días), divide la porción en 2 comidas y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "nomade-mg-1",
          "min": 0,
          "max": 15,
          "label": "10 a 15 kg",
          "maint": "189 a 248 g / día"
        },
        {
          "id": "nomade-mg-2",
          "min": 15.01,
          "max": 20,
          "label": "15 a 20 kg",
          "maint": "248 a 301 g / día"
        },
        {
          "id": "nomade-mg-3",
          "min": 20.01,
          "max": 30,
          "label": "20 a 30 kg",
          "maint": "301 a 395 g / día"
        },
        {
          "id": "nomade-mg-4",
          "min": 30.01,
          "max": 40,
          "label": "30 a 40 kg",
          "maint": "395 a 480 g / día"
        },
        {
          "id": "nomade-mg-5",
          "min": 40.01,
          "max": 50,
          "label": "40 a 50 kg",
          "maint": "480 a 560 g / día"
        },
        {
          "id": "nomade-mg-6",
          "min": 50.01,
          "max": 60,
          "label": "50 a 60 kg",
          "maint": "560 a 630 g / día"
        },
        {
          "id": "nomade-mg-7",
          "min": 60.01,
          "max": 999,
          "label": "60 a 70 kg",
          "maint": "630 a 700 g / día"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-08';
