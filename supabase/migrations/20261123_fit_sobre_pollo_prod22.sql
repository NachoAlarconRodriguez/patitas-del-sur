-- =========================================================================
-- ACTUALIZACIÓN DE FICHA TÉCNICA COMPLETA: FIT SOBRE POLLO 85 GR
-- Actualiza la variante existente: PROD-22 (Fit Sobre Pollo · Agrupado como Fit Sobre 85 gr)
-- Fuente: Etiqueta oficial Fit Fórmula Pouch Gato Pollo (Drag Pharma Chile · Res. SAG N° 2748/2025)
-- Ejecutar en Supabase SQL Editor (mantiene weights, precio, stock y _shipping_unit_cost)
-- =========================================================================

UPDATE public.products
SET
  pet_type = 'gatos',
  brand = 'Fit',
  name = 'Fit Sobre Pollo',
  tagline = 'Irresistibles trocitos en salsa con carne de pollo para gatos de todas las edades: suplemento húmedo libre de colorantes con taurina, vitaminas A, D3 y E, minerales y 86% de humedad para apoyar su hidratación diaria.',
  category = 'Alimento Húmedo',
  badge = 'Con Pollo · Taurina',
  image = '/images/products/fit-sobre-pollo/01-estudio-principal.webp',
  images = '[
    "/images/products/fit-sobre-pollo/01-estudio-principal.webp",
    "/images/products/fit-sobre-pollo/02-lifestyle-sobre-pollo.webp",
    "/images/products/fit-sobre-pollo/03-beneficios-clave.webp",
    "/images/products/fit-sobre-pollo/04-ingredientes-nutricion.webp",
    "/images/products/fit-sobre-pollo/05-guia-racion-diaria.webp"
  ]'::jsonb,
  protein_value = 6,
  protein_percent = '6%',
  main_protein = 'Pollo',
  protein_subtitle = 'Trocitos en salsa con Carne, Hígado y Corazón de Pollo (Todas las Edades)',
  gama = 'with',
  gama_detail = 'Suplemento Húmedo en Salsa · Libre de Colorantes · Con Taurina y Vitaminas A, D3 y E',
  animal_percent = NULL,
  animal_percent_detail = 'Jugosos trocitos en salsa elaborados con carne, hígado y corazón de pollo',
  life_stage = 'adulto',
  target_stage_label = 'Gatos de Todas las Edades',
  benefits = '[
    "Hidratación diaria irresistible: jugosos trocitos en salsa (86% humedad máxima) que incentivan el consumo de agua y apoyan el cuidado del tracto urinario felino.",
    "Buena fuente de proteínas de pollo: elaborado con carne, hígado y corazón de pollo para entregar un sabor auténtico y fácil digestión.",
    "Con taurina esencial: aminoácido indispensable para mantener un corazón fuerte y una visión saludable en gatitos y gatos adultos.",
    "Vitaminas y minerales esenciales: enriquecido con vitaminas A, D3 y E y minerales para fortalecer las defensas y la vitalidad diaria.",
    "Libre de colorantes artificiales: fórmula limpia respaldada por Drag Pharma Chile (Res. SAG N° 2748/2025).",
    "Versátil y práctico (85 g): ideal para servir solo como premio nutritivo o mezclado sobre su alimento seco habitual (una vez abierto, refrigerar hasta 48 horas)."
  ]'::jsonb,
  ingredients = '[
    "Agua",
    "Carne de pollo",
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
    'Vitaminas', 'A, D3 y E',
    '_shipping_unit_cost', guaranteed_analysis->'_shipping_unit_cost',
    '_bowl_config', '{
      "subtitle": "Los primeros 6 ingredientes reales en el orden exacto del sobre Fit Fórmula Pollo 85 g: salsa hidratante, trocitos de pollo, vísceras nobles, almidón de patata y trigo.",
      "stickers": [
        "Con Carne de Pollo",
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
        },
        {
          "name": "Harina de trigo",
          "pill": "Energía & Textura",
          "desc": "Ayuda a dar forma tierna a los trocitos en salsa y complementa la textura del alimento húmedo.",
          "img": "/images/bowl/ing-trigo.webp"
        }
      ]
    }'::jsonb,
    '_feeding_guide', '{
      "type": "cat_all_stages",
      "cupLabel": "1 sobre = 85 g · Suplemento húmedo complementario",
      "note": "Suplemento húmedo complementario (no corresponde a un alimento completo). Servir en un recipiente limpio y seco, solo o mezclado con su alimento habitual. Una vez abierto, refrigerar hasta por 48 horas y mantener siempre agua fresca disponible.",
      "kittenRows": [
        {
          "id": "fit-ppol-k1",
          "min": 0,
          "max": 999,
          "label": "Gatitos (hasta 12 meses)",
          "maint": "1 sobre / día (85 g)"
        }
      ],
      "adultRows": [
        {
          "id": "fit-ppol-a1",
          "min": 0,
          "max": 999,
          "label": "Gatos adultos (desde 12 meses)",
          "maint": "2 sobres / día (170 g)"
        }
      ],
      "rows": [
        {
          "id": "fit-ppol-k1",
          "min": 0,
          "max": 3,
          "label": "Gatitos (hasta 12 meses)",
          "maint": "1 sobre / día (85 g)"
        },
        {
          "id": "fit-ppol-a1",
          "min": 3.01,
          "max": 999,
          "label": "Gatos adultos",
          "maint": "2 sobres / día (170 g)"
        }
      ]
    }'::jsonb
  )),
  updated_at = now()
WHERE id = 'PROD-22';
