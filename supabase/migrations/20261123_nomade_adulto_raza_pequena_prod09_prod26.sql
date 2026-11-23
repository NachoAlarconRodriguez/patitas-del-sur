-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: NÓMADE ADULTO RAZA PEQUEÑA (3 KG Y 10 KG)
-- Actualiza ambas variantes existentes: PROD-09 (10 kg) y PROD-26 (3 kg)
-- Fuente: Etiqueta oficial Nómade Premium Perro Adulto Razas Pequeñas (Producto Chileno)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Nomade',
  name = 'Nomade Adulto Raza Pequeña',
  tagline = 'Alimento completo y balanceado con ingredientes 100% chilenos para perros adultos de razas pequeñas: 27% proteína mínima con proteína animal como ingrediente principal, enriquecido con maqui, extracto de quillay, post-biótico, MOS y Omega 3.',
  category = 'Alimento Seco',
  badge = 'Raza Pequeña · 27% Proteína',
  image = '/images/products/nomade-adulto-raza-pequena/01-estudio-principal.webp',
  images = '[
    "/images/products/nomade-adulto-raza-pequena/01-estudio-principal.webp",
    "/images/products/nomade-adulto-raza-pequena/02-lifestyle-raza-pequena.webp",
    "/images/products/nomade-adulto-raza-pequena/03-beneficios-clave.webp",
    "/images/products/nomade-adulto-raza-pequena/04-ingredientes-nutricion.webp",
    "/images/products/nomade-adulto-raza-pequena/05-guia-racion-diaria.webp"
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
  target_stage_label = 'Perros Adultos Razas Pequeñas',
  benefits = '[
    "Defensa bioactiva para la inmunidad y salud intestinal: formulado con post-biótico, MOS (manano-oligosacáridos) y cultivo de levaduras.",
    "Antioxidantes naturales (AOX): enriquecido con extracto seco de maqui chileno, extracto de romero y tocoferoles que protegen contra el envejecimiento celular.",
    "Omega 3 y 6 + Zinc orgánico: aceite de origen marino y zinc orgánico para mantener la piel sana, el pelaje brillante y una mente activa.",
    "Control de olor y heces más firmes: contiene extracto de quillay chileno, zeolita y coseta de remolacha que reducen los molestos olores de las deposiciones.",
    "Cuidado dental diario: incluye hexametafosfato de sodio para ayudar a prevenir la acumulación de sarro en razas pequeñas.",
    "Producto 100% chileno con proteína de origen animal como ingrediente principal (27% proteína mínima y 3.265 kcal/kg)."
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
      "subtitle": "Ingredientes 100% chilenos en el orden exacto de la receta: proteína animal como ingrediente principal, energía equilibrada, maqui y quillay para perros adultos de razas pequeñas.",
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
          "desc": "Cereal energético de alta disponibilidad calórica para acompañar el ritmo activo de los perros adultos de razas pequeñas.",
          "img": "/images/bowl/ing-maiz.webp"
        },
        {
          "name": "Arroz",
          "pill": "Energía Noble",
          "desc": "Fuente suave y altamente digestible de carbohidratos nobles que cuida el sistema gastrointestinal.",
          "img": "/images/bowl/ing-arroz-avena.webp"
        },
        {
          "name": "Salvado de trigo",
          "pill": "Fibra Natural",
          "desc": "Fibra vegetal natural que promueve el tránsito intestinal saludable y deposiciones más firmes.",
          "img": "/images/bowl/ing-trigo.webp"
        },
        {
          "name": "Aceite animal natural",
          "pill": "Omega 6 y Energía",
          "desc": "Aceite de ave, cerdo y/o vacuno que aporta energía concentrada, palatabilidad superior y ácidos grasos para un pelaje brillante.",
          "img": "/images/bowl/ing-grasa-pollo.webp"
        },
        {
          "name": "Harina de soya",
          "pill": "Proteína Vegetal",
          "desc": "Leguminosa rica en aminoácidos vegetales y fibra que complementa el perfil proteico y nutricional de la fórmula.",
          "img": "/images/bowl/ing-soya.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "weight_only",
      "cupLabel": "Energía: 3.265 kcal/kg",
      "stageLabel": "Perro Adulto · Razas Pequeñas",
      "stageBadge": "🐕 Adulto Raza Pequeña",
      "weightPrompt": "Ingresa el Peso de tu Perro Adulto",
      "quickWeights": [3, 6, 9, 12],
      "note": "Consumo diario recomendado oficial de Nómade Adulto Razas Pequeñas. Realiza el cambio de alimento en forma gradual (7 días), divide la porción en 2 comidas y mantén siempre agua fresca disponible.",
      "rows": [
        {
          "id": "nomade-rp-1",
          "min": 0,
          "max": 5,
          "label": "1 - 5 kg (Raza Mini / Toy)",
          "maint": "40 - 119 g / día"
        },
        {
          "id": "nomade-rp-2",
          "min": 5.01,
          "max": 7,
          "label": "5 - 7 kg (Raza Pequeña Ligera)",
          "maint": "119 - 149 g / día"
        },
        {
          "id": "nomade-rp-3",
          "min": 7.01,
          "max": 10,
          "label": "7 - 10 kg (Raza Pequeña Estándar)",
          "maint": "149 - 189 g / día"
        },
        {
          "id": "nomade-rp-4",
          "min": 10.01,
          "max": 999,
          "label": "10 - 15 kg (Raza Pequeña - Mediana)",
          "maint": "189 - 248 g / día"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id IN ('PROD-09', 'PROD-26');
