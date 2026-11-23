-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: FIT SOBRE SALMÓN 85 GR
-- Actualiza la variante existente: PROD-23 (Fit Sobre Salmón · Agrupado como Fit Sobre 85 gr)
-- Fuente: Etiqueta oficial Fit Fórmula Pouch Gato Salmón (Drag Pharma Chile · Res. SAG N° 2748/2025)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Fit',
  name = 'Fit Sobre Salmón',
  tagline = 'Irresistibles trocitos en salsa con carne de salmón y pollo para gatos de todas las edades: suplemento húmedo libre de colorantes con taurina, Omega 3, vitaminas A, D3 y E y 86% de humedad para apoyar su hidratación diaria.',
  category = 'Alimento Húmedo',
  badge = 'Con Salmón · Taurina',
  image = '/images/products/fit-sobre-salmon/01-estudio-principal.webp',
  images = '[
    "/images/products/fit-sobre-salmon/01-estudio-principal.webp",
    "/images/products/fit-sobre-salmon/02-lifestyle-sobre-salmon.webp",
    "/images/products/fit-sobre-salmon/03-beneficios-clave.webp",
    "/images/products/fit-sobre-salmon/04-ingredientes-nutricion.webp",
    "/images/products/fit-sobre-salmon/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 6,
  protein_percent = '6%',
  main_protein = 'Salmón',
  protein_subtitle = 'Trocitos en salsa con Carne de Pollo y Salmón (Todas las Edades)',
  gama = 'with',
  gama_detail = 'Suplemento Húmedo en Salsa · Libre de Colorantes · Con Taurina y Omega 3',
  animal_percent = NULL,
  animal_percent_detail = 'Jugosos trocitos en salsa con carne de pollo, salmón, hígado y corazón de pollo',
  life_stage = 'adulto',
  target_stage_label = 'Gatos de Todas las Edades',
  benefits = '[
    "Hidratación diaria irresistible: jugosos trocitos en salsa (86% humedad máxima) que incentivan el consumo de agua y apoyan el cuidado del tracto urinario felino.",
    "Buena fuente de proteínas reales: elaborado con carne de pollo, salmón, hígado y corazón de pollo de alta palatabilidad.",
    "Con taurina esencial: aminoácido indispensable para mantener un corazón fuerte y una visión saludable en gatitos y gatos adultos.",
    "Aporte de Omega 3 y vitaminas: el salmón y las vitaminas A, D3 y E ayudan a mantener una piel sana, pelaje brillante y defensas activas.",
    "Libre de colorantes artificiales: fórmula limpia respaldada por Drag Pharma Chile (Res. SAG N° 2748/2025).",
    "Versátil y práctico (85 g): ideal para servir solo como premio nutritivo o mezclado sobre su alimento seco habitual (una vez abierto, refrigerar hasta 48 horas)."
  ]'::jsonb,
  ingredients = '[
    "Agua",
    "Carne de pollo",
    "Salmón",
    "Hígado de pollo",
    "Corazón de pollo",
    "Almidón de patata",
    "Harina de trigo",
    "Proteína de soya en polvo",
    "Proteína de maní en polvo",
    "Aceite de pollo",
    "Goma guar",
    "Taurina",
    "Vitaminas y minerales (A, D3, E, tripolifosfato de sodio, cloruro de sodio)"
  ]'::jsonb,
  guaranteed_analysis = jsonb_strip_nulls(jsonb_build_object(
    'Proteína Cruda', '6% mín.',
    'Grasa Cruda', '1,5% mín.',
    'Fibra Cruda', '1% máx.',
    'Humedad', '86% máx.',
    'Taurina', 'Incluida',
    'Omega 3', 'Incluido',
    'Vitaminas', 'A, D3 y E',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Los primeros 6 ingredientes reales en el orden exacto del sobre Fit Fórmula Salmón 85 g: salsa hidratante, trocitos de pollo, salmón, vísceras nobles y almidón de patata.",
      "stickers": [
        "Con Carne de Salmón",
        "Contiene Taurina",
        "86% Hidratación",
        "Libre de Colorantes"
      ],
      "wedges": [
        {
          "name": "Agua (Salsa hidratante)",
          "pill": "86% Humedad",
          "desc": "Base jugosa en salsa que aporta hidratación extra diaria, ideal para gatos que beben poca agua.",
          "img": "/images/bowl/ing-caldo-gelatina.webp"
        },
        {
          "name": "Carne de pollo",
          "pill": "Proteína Tierna",
          "desc": "Trocitos de carne de pollo altamente digestibles y sabrosos para gatos de todas las edades.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Salmón",
          "pill": "Omega 3 Natural",
          "desc": "Carne de salmón rica en ácidos grasos esenciales Omega 3 para un pelaje brillante y un sabor marino irresistible.",
          "img": "/images/bowl/ing-salmon.webp"
        },
        {
          "name": "Hígado de pollo",
          "pill": "Palatabilidad & Vitaminas",
          "desc": "Fuente natural de vitamina A, hierro y sabor altamente atractivo incluso para gatos exigentes.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Corazón de pollo",
          "pill": "Taurina Natural",
          "desc": "Órgano magro fuente natural de proteínas y taurina para apoyar la salud cardiovascular felina.",
          "img": "/images/bowl/ing-pollo.webp"
        },
        {
          "name": "Almidón de patata",
          "pill": "Textura en Salsa",
          "desc": "Aporta la consistencia cremosa y suave de la salsa para una experiencia húmeda irresistible.",
          "img": "/images/bowl/ing-papa.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_all_stages",
      "cupLabel": "1 sobre = 85 g · Suplemento húmedo complementario",
      "note": "Suplemento húmedo complementario (no corresponde a un alimento completo). Servir en un recipiente limpio y seco, solo o mezclado con su alimento habitual. Una vez abierto, refrigerar hasta por 48 horas y mantener siempre agua fresca disponible.",
      "kittenRows": [
        {
          "id": "fit-psal-k1",
          "min": 0,
          "max": 999,
          "label": "Gatitos (hasta 12 meses)",
          "maint": "1 sobre / día (85 g)"
        }
      ],
      "adultRows": [
        {
          "id": "fit-psal-a1",
          "min": 0,
          "max": 999,
          "label": "Gatos adultos (desde 12 meses)",
          "maint": "2 sobres / día (170 g)"
        }
      ],
      "rows": [
        {
          "id": "fit-psal-k1",
          "min": 0,
          "max": 3,
          "label": "Gatitos (hasta 12 meses)",
          "maint": "1 sobre / día (85 g)"
        },
        {
          "id": "fit-psal-a1",
          "min": 3.01,
          "max": 999,
          "label": "Gatos adultos",
          "maint": "2 sobres / día (170 g)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-23';
