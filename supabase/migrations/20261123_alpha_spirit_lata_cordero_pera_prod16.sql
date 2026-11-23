-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ALPHA SPIRIT LATA CORDERO & PERA (400 GR)
-- Actualiza la variante existente: PROD-16 (Alpha Spirit Lata Cordero & Pera)
-- Fuente: Etiqueta oficial Alpha Spirit Wet Lamb with Pear (Fabricado en UE · ESP-30000336)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Alpha Spirit',
  name = 'Alpha Spirit Lata Cordero & Pera',
  tagline = 'Alimento húmedo completo monoproteico y libre de cereales para perros adultos de todas las razas: 93% cordero real altamente digestible, 4% pera fresca natural, glucosamina (200 mg/kg), condroitina (200 mg/kg) y óxido de zinc.',
  category = 'Alimento Húmedo',
  badge = '93% Cordero · Grain Free',
  image = '/images/products/alpha-spirit-lata-cordero-pera/01-estudio-principal.webp',
  images = '[
    "/images/products/alpha-spirit-lata-cordero-pera/01-estudio-principal.webp",
    "/images/products/alpha-spirit-lata-cordero-pera/02-lifestyle-cordero.webp",
    "/images/products/alpha-spirit-lata-cordero-pera/03-beneficios-clave.webp",
    "/images/products/alpha-spirit-lata-cordero-pera/04-ingredientes-nutricion.webp",
    "/images/products/alpha-spirit-lata-cordero-pera/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 12,
  protein_percent = '12%',
  main_protein = 'Cordero',
  protein_subtitle = '93% Cordero Monoproteico + 4% Pera Fresca (Base Húmeda)',
  gama = 'free',
  gama_detail = '100% Grain Free · Monoproteico Hipoalergénico · Sin Agua ni Colorantes Añadidos',
  animal_percent = '93',
  animal_percent_detail = '93% Cordero (única fuente de proteína animal) + 4% Pera fresca',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos (Todas las Razas)',
  benefits = '[
    "93% cordero monoproteico real: receta hipoalergénica de una sola proteína animal, ideal para perros con estómagos sensibles o intolerancias al pollo y vacuno.",
    "100% Grain Free y sin agua añadida: libre de cereales, gluten y colorantes artificiales, conservando todo el sabor y nutrición natural del cordero.",
    "Soporte articular completo: enriquecido con glucosamina (200 mg/kg) y sulfato de condroitina (200 mg/kg) para proteger cartílagos y articulaciones.",
    "Digestión suave y frescura natural: 75,5% de humedad junto a 4% de pera fresca y pulpa de remolacha molida para favorecer el tránsito intestinal.",
    "Piel sana y defensas fuertes: aporta Omega-3 EPA+DHA (180 µg/kg), óxido de zinc (30 mg/kg), hierro (15 mg/kg) y vitaminas A, D y E.",
    "Versátil y completo (1.208 kcal/kg): apto como dieta húmeda completa diaria o como irresistible topper sobre croquetas. Fabricado en España (UE)."
  ]'::jsonb,
  ingredients = '[
    "Cordero (93%)",
    "Pera (4%)",
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
      "subtitle": "Receta europea ultracorta y transparente: 93% cordero monoproteico, 4% pera fresca, gelatina natural, pulpa de remolacha, especias y minerales con condroprotectores.",
      "stickers": [
        "93% Cordero Real",
        "4% Pera Fresca",
        "100% Grain Free",
        "Glucosamina + Condroitina"
      ],
      "wedges": [
        {
          "name": "Cordero (93%)",
          "pill": "Monoproteico #1",
          "desc": "93% cordero real como única fuente de proteína animal: carne noble, sabrosa y altamente tolerable para perros sensibles.",
          "img": "/images/bowl/ing-cordero.webp"
        },
        {
          "name": "Pera (4%)",
          "pill": "Fibra & Frescura",
          "desc": "Pera fresca natural rica en fibra soluble, vitamina C y antioxidantes suaves para acompañar la digestión sin cereales.",
          "img": "/images/bowl/ing-pera.webp"
        },
        {
          "name": "Gelatina natural",
          "pill": "Textura & Colágeno",
          "desc": "Gelatina natural del cocinado que brinda una textura jugosa, tierna y de alta aceptación sin agua añadida.",
          "img": "/images/bowl/ing-caldo-gelatina.webp"
        },
        {
          "name": "Pulpa de remolacha molida",
          "pill": "Fibra Digestiva",
          "desc": "Fibra vegetal suave (Beta vulgaris) que cuida la flora intestinal y contribuye a deposiciones firmes.",
          "img": "/images/bowl/ing-remolacha.webp"
        },
        {
          "name": "Especias naturales",
          "pill": "Aroma & Antioxidantes",
          "desc": "Toque natural de especias y botánicos que realzan el aroma del paté y apoyan el bienestar digestivo.",
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
          "id": "as-cor-1",
          "min": 0,
          "max": 7,
          "label": "2 a 5 kg (Perro pequeño)",
          "maint": "153 a 305 g / día (½ a ¾ lata)"
        },
        {
          "id": "as-cor-2",
          "min": 7.01,
          "max": 17,
          "label": "10 a 15 kg (Perro mediano)",
          "maint": "512 a 694 g / día (1¼ a 1¾ latas)"
        },
        {
          "id": "as-cor-3",
          "min": 17.01,
          "max": 27,
          "label": "20 a 25 kg (Perro mediano-grande)",
          "maint": "861 a 1.018 g / día (2¼ a 2½ latas)"
        },
        {
          "id": "as-cor-4",
          "min": 27.01,
          "max": 48,
          "label": "30 a 40 kg (Perro grande)",
          "maint": "1.167 a 1.448 g / día (3 a 3½ latas)"
        },
        {
          "id": "as-cor-5",
          "min": 48.01,
          "max": 999,
          "label": "60 kg (Perro gigante)",
          "maint": "1.963 g / día (~5 latas)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-16';
