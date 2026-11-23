-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: ALPHA SPIRIT LATA CONEJO & PLÁTANO (400 GR)
-- Actualiza la variante existente: PROD-11 (Alpha Spirit Lata Conejo & Plátano)
-- Fuente: Etiqueta oficial Alpha Spirit Wet Rabbit with Banana (Fabricado en UE · ESP-30000336)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'perros',
  brand = 'Alpha Spirit',
  name = 'Alpha Spirit Lata Conejo & Plátano',
  tagline = 'Alimento húmedo completo y libre de cereales para perros adultos de todas las razas: 93% carnes magras (63% pollo + 30% conejo), 4% plátano fresco, glucosamina (200 mg/kg), condroitina (200 mg/kg) y Omega-3 EPA+DHA.',
  category = 'Alimento Húmedo',
  badge = '93% Pollo y Conejo · Grain Free',
  image = '/images/products/alpha-spirit-lata-conejo-platano/01-estudio-principal.webp',
  images = '[
    "/images/products/alpha-spirit-lata-conejo-platano/01-estudio-principal.webp",
    "/images/products/alpha-spirit-lata-conejo-platano/02-lifestyle-conejo.webp",
    "/images/products/alpha-spirit-lata-conejo-platano/03-beneficios-clave.webp",
    "/images/products/alpha-spirit-lata-conejo-platano/04-ingredientes-nutricion.webp",
    "/images/products/alpha-spirit-lata-conejo-platano/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 12,
  protein_percent = '12%',
  main_protein = 'Conejo',
  protein_subtitle = '63% Pollo + 30% Conejo (Carne, Hígado y Corazón) + 4% Plátano',
  gama = 'free',
  gama_detail = '100% Grain Free · 93% Carnes Magras · Sin Agua ni Colorantes Añadidos',
  animal_percent = '93',
  animal_percent_detail = '93% carnes frescas (63% pollo y 30% conejo) + 4% plátano natural',
  life_stage = 'adulto',
  target_stage_label = 'Perros Adultos (Todas las Razas)',
  benefits = '[
    "93% carnes magras de fácil digestión: combina 63% pollo y 30% conejo (carne, hígado y corazón) para aportar proteína noble, baja en grasa y de sabor suave.",
    "100% Grain Free y sin agua añadida: libre de cereales, gluten y colorantes artificiales, preservando el aroma natural de la carne cocinada.",
    "Soporte articular avanzado: enriquecido con glucosamina (200 mg/kg) y sulfato de condroitina (200 mg/kg) para proteger articulaciones y movilidad.",
    "Potasio natural e hidratación: 75,5% de humedad natural junto a 4% de plátano fresco y pulpa de remolacha molida para cuidar la salud intestinal.",
    "Piel sana, defensas y vitalidad: aporta Omega-3 EPA+DHA (180 µg/kg), óxido de zinc (30 mg/kg), hierro (15 mg/kg) y vitaminas A, D y E.",
    "Versátil y completo (1.208 kcal/kg): apto como alimento completo diario o como irresistible topper sobre su alimento seco. Fabricado en España (UE)."
  ]'::jsonb,
  ingredients = '[
    "Pollo 63% (carne, hígado, corazón)",
    "Conejo 30% (carne, hígado, corazón)",
    "Plátano 4%",
    "Gelatina",
    "Pulpa de remolacha molida",
    "Especias y minerales",
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
      "subtitle": "Receta europea transparente de carnes magras: 63% pollo, 30% conejo, 4% plátano fresco, gelatina natural, pulpa de remolacha y especias con minerales y condroprotectores.",
      "stickers": [
        "63% Pollo + 30% Conejo",
        "4% Plátano Fresco",
        "100% Grain Free",
        "Glucosamina + Condroitina"
      ],
      "wedges": [
        {
          "name": "Pollo (63%)",
          "pill": "Proteína Magra #1",
          "desc": "Carne, hígado y corazón de pollo como base principal: altamente digestible, sabrosa y rica en aminoácidos esenciales.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Conejo (30%)",
          "pill": "Carne Ligera",
          "desc": "Carne, hígado y corazón de conejo: proteína noble, baja en colesterol y de excelente tolerancia digestiva.",
          "img": "/images/bowl/ing-conejo.webp"
        },
        {
          "name": "Plátano (4%)",
          "pill": "Potasio & Fibra",
          "desc": "Plátano fresco natural rico en potasio, fibra prebiótica y energía suave sin recurrir a cereales.",
          "img": "/images/bowl/ing-platano.webp"
        },
        {
          "name": "Gelatina natural",
          "pill": "Textura & Colágeno",
          "desc": "Gelatina natural del cocinado que ofrece una textura tierna, jugosa y fácil de digerir sin agua añadida.",
          "img": "/images/bowl/ing-caldo-gelatina.webp"
        },
        {
          "name": "Pulpa de remolacha molida",
          "pill": "Fibra Digestiva",
          "desc": "Fibra vegetal suave (Beta vulgaris) que nutre la microbiota intestinal y favorece deposiciones firmes.",
          "img": "/images/bowl/ing-remolacha.webp"
        },
        {
          "name": "Especias y minerales",
          "pill": "Botánicos & Articulaciones",
          "desc": "Especias naturales y minerales esenciales junto a glucosamina (200 mg/kg) y condroitina (200 mg/kg).",
          "img": "/images/bowl/ing-hierbas.webp"
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
          "id": "as-rab-1",
          "min": 0,
          "max": 7,
          "label": "2 a 5 kg (Perro pequeño)",
          "maint": "153 a 305 g / día (½ a ¾ lata)"
        },
        {
          "id": "as-rab-2",
          "min": 7.01,
          "max": 17,
          "label": "10 a 15 kg (Perro mediano)",
          "maint": "512 a 694 g / día (1¼ a 1¾ latas)"
        },
        {
          "id": "as-rab-3",
          "min": 17.01,
          "max": 27,
          "label": "20 a 25 kg (Perro mediano-grande)",
          "maint": "861 a 1.018 g / día (2¼ a 2½ latas)"
        },
        {
          "id": "as-rab-4",
          "min": 27.01,
          "max": 48,
          "label": "30 a 40 kg (Perro grande)",
          "maint": "1.167 a 1.448 g / día (3 a 3½ latas)"
        },
        {
          "id": "as-rab-5",
          "min": 48.01,
          "max": 999,
          "label": "60 kg (Perro gigante)",
          "maint": "1.963 g / día (~5 latas)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-11';
