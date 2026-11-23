-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ALPHA SPIRIT LATA VACUNO & MELÓN (400 GR)
-- Actualiza la variante existente: PROD-17 (Alpha Spirit Lata Vacuno & Melón · Ternera con Melón)
-- Fuente: Etiqueta oficial Alpha Spirit Wet Beef with Melon (Fabricado en UE · ESP-30000336)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Alpha Spirit',
  name = 'Alpha Spirit Lata Vacuno & Melón',
  tagline = 'Alimento húmedo completo monoproteico y libre de cereales para perros adultos de todas las razas: 93% ternera fresca, 4% melón natural, glucosamina (200 mg/kg), condroitina (200 mg/kg) y Omega-3 EPA+DHA.',
  category = 'Alimento Húmedo',
  badge = '93% Ternera · Grain Free',
  image = '/images/products/alpha-spirit-lata-vacuno-melon/01-estudio-principal.webp',
  images = '[
    "/images/products/alpha-spirit-lata-vacuno-melon/01-estudio-principal.webp",
    "/images/products/alpha-spirit-lata-vacuno-melon/02-lifestyle-ternera.webp",
    "/images/products/alpha-spirit-lata-vacuno-melon/03-beneficios-clave.webp",
    "/images/products/alpha-spirit-lata-vacuno-melon/04-ingredientes-nutricion.webp",
    "/images/products/alpha-spirit-lata-vacuno-melon/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 12,
  protein_percent = '12%',
  main_protein = 'Vacuno',
  protein_subtitle = '93% Ternera Monoproteica + 4% Melón Fresco (Base Húmeda)',
  gama = 'free',
  gama_detail = '100% Grain Free · Monoproteico · Sin Agua ni Colorantes Añadidos',
  animal_percent = '93',
  animal_percent_detail = '93% Ternera (única fuente de proteína animal) + 4% Melón fresco',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos (Todas las Razas)',
  benefits = '[
    "93% ternera monoproteica real: receta elaborada con una única fuente de proteína animal de alto valor biológico, ideal para perros exigentes o con sensibilidad alimentaria.",
    "100% Grain Free y sin agua añadida: libre de cereales, gluten y colorantes artificiales, conservando todo el aroma y sabor natural de la carne cocinada.",
    "Soporte articular avanzado: enriquecido con glucosamina (200 mg/kg) y sulfato de condroitina (200 mg/kg) para proteger cartílagos y movilidad.",
    "Hidratación y frescura natural: 75,5% de humedad natural junto a 4% de melón fresco y pulpa de remolacha molida para una digestión suave.",
    "Piel sana, defensas y vitalidad: aporta Omega-3 EPA+DHA (180 µg/kg), óxido de zinc (30 mg/kg), hierro (15 mg/kg) y vitaminas A, D y E.",
    "Versátil y completo (1.208 kcal/kg): apto como alimento completo diario o como irresistible topper mezclado con alimento seco. Fabricado en España (UE)."
  ]'::jsonb,
  ingredients = '[
    "Ternera (93%)",
    "Melón (4%)",
    "Gelatina",
    "Pulpa de remolacha molida",
    "Especias",
    "Minerales",
    "Glucosamina (200 mg/kg)",
    "Sulfato de condroitina (200 mg/kg)",
    "Óxido de zinc (30 mg/kg)",
    "Omega-3 EPA+DHA (180 µg/kg)",
    "Vitaminas (A, D y E)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '12%',
    'Grasa Cruda', '8%',
    'Fibra Cruda', '1,5%',
    'Humedad', '75,5%',
    'Ceniza Bruta', '2,8%',
    'Calcio', '0,09%',
    'Fósforo', '0,07%',
    'Omega-3 (EPA+DHA)', '180 µg/kg',
    'Glucosamina', '200 mg/kg',
    'Sulfato de Condroitina', '200 mg/kg',
    'Óxido de Zinc', '30 mg/kg',
    'Hierro', '15 mg/kg',
    'Vitamina A', '2.500 UI/kg',
    'Vitamina D', '125 UI/kg',
    'Vitamina E', '15 UI/kg',
    'Energía Metabolizable', '1.208 kcal/kg (4.632 kJ/kg)',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Receta europea ultracorta y transparente: 93% ternera monoproteica, 4% melón fresco, gelatina natural, pulpa de remolacha, especias y minerales con condroprotectores.",
      "stickers": [
        "93% Ternera Real",
        "4% Melón Fresco",
        "100% Grain Free",
        "Glucosamina + Condroitina"
      ],
      "wedges": [
        {
          "name": "Ternera (93%)",
          "pill": "Monoproteico #1",
          "desc": "93% de ternera fresca como única proteína animal: sabor cárnico irresistible, rica en hierro y aminoácidos esenciales.",
          "img": "/images/bowl/ing-vacuno.webp"
        },
        {
          "name": "Melón (4%)",
          "pill": "Fruta Fresca",
          "desc": "Melón fresco natural que aporta hidratación, frescura aromática y antioxidantes sin recurrir a cereales.",
          "img": "/images/bowl/ing-melon.webp"
        },
        {
          "name": "Gelatina natural",
          "pill": "Textura & Colágeno",
          "desc": "Gelatina natural del cocinado que brinda una textura jugosa, suave y de fácil digestión sin agua añadida.",
          "img": "/images/bowl/ing-caldo-gelatina.webp"
        },
        {
          "name": "Pulpa de remolacha molida",
          "pill": "Fibra Digestiva",
          "desc": "Fibra vegetal suave (Beta vulgaris) que apoya la microbiota intestinal y la firmeza de las deposiciones.",
          "img": "/images/bowl/ing-remolacha.webp"
        },
        {
          "name": "Especias naturales",
          "pill": "Aroma & Antioxidantes",
          "desc": "Toque natural de especias y botánicos que realzan el aroma natural del paté y apoyan el bienestar digestivo.",
          "img": "/images/bowl/ing-hierbas.webp"
        },
        {
          "name": "Minerales y Condroprotectores",
          "pill": "Articulaciones & Defensas",
          "desc": "Minerales esenciales (zinc, hierro, calcio, fósforo) junto a glucosamina (200 mg/kg) y condroitina (200 mg/kg).",
          "img": "/images/bowl/ing-minerales.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "weight_only",
      "cupLabel": "1 lata = 400 g (~483 kcal) · Servir a temperatura ambiente",
      "stageLabel": "Perro Adulto (Todas las Razas)",
      "stageBadge": "🥫 Alimento Completo Húmedo",
      "weightPrompt": "Ingresa el Peso de tu Perro Adulto",
      "quickWeights": [4, 12, 22, 35],
      "note": "Guía orientativa como dieta completa 100% húmeda (dividir en 2 tomas). Si lo usas como topper con alimento seco, reduce proporcionalmente las croquetas. Una vez abierta la lata, refrigerar hasta por 24 horas.",
      "rows": [
        {
          "id": "as-beef-1",
          "min": 0,
          "max": 7,
          "label": "2 a 5 kg (Perro pequeño)",
          "maint": "153 a 305 g / día (½ a ¾ lata)"
        },
        {
          "id": "as-beef-2",
          "min": 7.01,
          "max": 17,
          "label": "10 a 15 kg (Perro mediano)",
          "maint": "512 a 694 g / día (1¼ a 1¾ latas)"
        },
        {
          "id": "as-beef-3",
          "min": 17.01,
          "max": 27,
          "label": "20 a 25 kg (Perro mediano-grande)",
          "maint": "861 a 1.018 g / día (2¼ a 2½ latas)"
        },
        {
          "id": "as-beef-4",
          "min": 27.01,
          "max": 48,
          "label": "30 a 40 kg (Perro grande)",
          "maint": "1.167 a 1.448 g / día (3 a 3½ latas)"
        },
        {
          "id": "as-beef-5",
          "min": 48.01,
          "max": 999,
          "label": "60 kg (Perro gigante)",
          "maint": "1.963 g / día (~5 latas)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-17';
