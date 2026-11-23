-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ALPHA SPIRIT LATA PATO & MANZANA VERDE (400 GR)
-- Actualiza la variante existente: PROD-12 (Alpha Spirit Lata Pato & Manzana Verde)
-- Fuente: Etiqueta oficial Alpha Spirit Wet Duck with Green Apple (Fabricado en UE · ESP-30000336)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Alpha Spirit',
  name = 'Alpha Spirit Lata Pato & Manzana Verde',
  tagline = 'Alimento húmedo completo libre de cereales para perros adultos de todas las razas: 93% carnes reales de ave (63% pollo y 30% pato con vísceras nobles), 4% manzana verde fresca, glucosamina (200 mg/kg), condroitina (200 mg/kg) y óxido de zinc.',
  category = 'Alimento Húmedo',
  badge = '93% Carne · Grain Free',
  image = '/images/products/alpha-spirit-lata-pato-manzana/01-estudio-principal.webp',
  images = '[
    "/images/products/alpha-spirit-lata-pato-manzana/01-estudio-principal.webp",
    "/images/products/alpha-spirit-lata-pato-manzana/02-lifestyle-pato.webp",
    "/images/products/alpha-spirit-lata-pato-manzana/03-beneficios-clave.webp",
    "/images/products/alpha-spirit-lata-pato-manzana/04-ingredientes-nutricion.webp",
    "/images/products/alpha-spirit-lata-pato-manzana/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 12,
  protein_percent = '12%',
  main_protein = 'Pato y Pollo',
  protein_subtitle = '93% Aves (63% Pollo + 30% Pato) + 4% Manzana Verde (Base Húmeda)',
  gama = 'free',
  gama_detail = '100% Grain Free · 93% Carnes Reales · Sin Agua ni Colorantes Añadidos',
  animal_percent = '93',
  animal_percent_detail = '93% Carnes de ave reales (63% pollo y 30% pato con hígado y corazón) + 4% manzana verde',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos (Todas las Razas)',
  benefits = '[
    "93% carnes reales de ave (63% pollo + 30% pato): combinación sabrosa de carne, hígado y corazón que aporta aminoácidos esenciales de alta digestibilidad.",
    "4% manzana verde fresca y fibra natural: rica en pectina y antioxidantes suaves junto a pulpa de remolacha molida para cuidar la digestión diaria.",
    "100% Grain Free y sin agua añadida: libre de cereales, gluten y colorantes artificiales, conservando todo el aroma natural del paté en su propia gelatina.",
    "Soporte articular completo: enriquecido con glucosamina (200 mg/kg) y sulfato de condroitina (200 mg/kg) para proteger cartílagos y movilidad.",
    "Piel sana y defensas fuertes: aporta Omega-3 EPA+DHA (180 µg/kg), óxido de zinc (30 mg/kg), hierro (15 mg/kg) y vitaminas A, D y E.",
    "Versátil y completo (1.208 kcal/kg): apto como alimento completo diario o como irresistible topper sobre croquetas. Fabricado en España (UE)."
  ]'::jsonb,
  ingredients = '[
    "Pollo 63% (carne, hígado, corazón)",
    "Pato 30% (carne, hígado, corazón)",
    "Manzana verde (4%)",
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
      "subtitle": "Receta europea ultracorta y transparente: 63% pollo, 30% pato, 4% manzana verde fresca, gelatina natural, pulpa de remolacha y minerales con condroprotectores.",
      "stickers": [
        "93% Pollo y Pato",
        "4% Manzana Verde",
        "100% Grain Free",
        "Glucosamina + Condroitina"
      ],
      "wedges": [
        {
          "name": "Pollo (63%)",
          "pill": "Proteína Magra #1",
          "desc": "63% pollo real (carne, hígado y corazón): proteína tierna y altamente digestible con aporte natural de vitaminas y minerales.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Pato (30%)",
          "pill": "Sabor & Energía",
          "desc": "30% pato real (carne, hígado y corazón): ave sabrosa rica en hierro y aminoácidos esenciales de altísima palatabilidad.",
          "img": "/images/bowl/ing-pato.webp"
        },
        {
          "name": "Manzana verde (4%)",
          "pill": "Pectina & Antioxidantes",
          "desc": "Manzana verde fresca natural que aporta fibra soluble, vitamina C y frescura antioxidante sin cereales.",
          "img": "/images/bowl/ing-manzana-verde.webp"
        },
        {
          "name": "Gelatina natural",
          "pill": "Textura & Colágeno",
          "desc": "Gelatina natural del cocinado que brinda una textura jugosa, suave y de alta aceptación sin agua añadida.",
          "img": "/images/bowl/ing-caldo-gelatina.webp"
        },
        {
          "name": "Pulpa de remolacha molida",
          "pill": "Fibra Digestiva",
          "desc": "Fibra vegetal suave (Beta vulgaris) que cuida la flora intestinal y contribuye a deposiciones firmes.",
          "img": "/images/bowl/ing-remolacha.webp"
        },
        {
          "name": "Especias, Minerales y Condroprotectores",
          "pill": "Articulaciones & Defensas",
          "desc": "Especias naturales y minerales esenciales (zinc, hierro, calcio, fósforo) junto a glucosamina (200 mg/kg) y condroitina (200 mg/kg).",
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
          "id": "as-pat-1",
          "min": 0,
          "max": 7,
          "label": "2 a 5 kg (Perro pequeño)",
          "maint": "153 a 305 g / día (½ a ¾ lata)"
        },
        {
          "id": "as-pat-2",
          "min": 7.01,
          "max": 17,
          "label": "10 a 15 kg (Perro mediano)",
          "maint": "512 a 694 g / día (1¼ a 1¾ latas)"
        },
        {
          "id": "as-pat-3",
          "min": 17.01,
          "max": 27,
          "label": "20 a 25 kg (Perro mediano-grande)",
          "maint": "861 a 1.018 g / día (2¼ a 2½ latas)"
        },
        {
          "id": "as-pat-4",
          "min": 27.01,
          "max": 48,
          "label": "30 a 40 kg (Perro grande)",
          "maint": "1.167 a 1.448 g / día (3 a 3½ latas)"
        },
        {
          "id": "as-pat-5",
          "min": 48.01,
          "max": 999,
          "label": "60 kg (Perro gigante)",
          "maint": "1.963 g / día (~5 latas)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-12';
