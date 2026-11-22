-- =========================================================================
-- MIGRACIÓN: PWA ADMIN — COORDENADAS DE DESPACHO, ID ATÓMICO Y WEB PUSH
-- Fecha: 2026-11-21
-- =========================================================================

-- 1. Coordenadas exactas y datos de mascota en pedidos (web y manuales)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pet_name TEXT,
ADD COLUMN IF NOT EXISTS pet_type TEXT;

COMMENT ON COLUMN public.orders.delivery_lat IS 'Latitud GPS exacta de la dirección de despacho (Google Maps)';
COMMENT ON COLUMN public.orders.delivery_lng IS 'Longitud GPS exacta de la dirección de despacho (Google Maps)';
COMMENT ON COLUMN public.orders.pet_name IS 'Nombre de la mascota asociada al pedido (opcional en pedidos manuales)';
COMMENT ON COLUMN public.orders.pet_type IS 'Especie de la mascota asociada al pedido (perro/gato)';

-- 2. Secuencia atómica y RPC para evitar colisiones PED-XXXX entre pedidos web y manuales
CREATE SEQUENCE IF NOT EXISTS public.patitas_order_seq START WITH 1 INCREMENT BY 1;

DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(
    MAX(NULLIF(regexp_replace(id, '^PED-0*', '', 'i'), '')::INTEGER),
    0
  )
  INTO max_num
  FROM public.orders
  WHERE id ~* '^PED-[0-9]+$';

  IF max_num > 0 THEN
    PERFORM setval('public.patitas_order_seq', max_num, true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_next_order_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val BIGINT;
  max_existing BIGINT;
BEGIN
  SELECT COALESCE(
    MAX(NULLIF(regexp_replace(id, '^PED-0*', '', 'i'), '')::BIGINT),
    0
  )
  INTO max_existing
  FROM public.orders
  WHERE id ~* '^PED-[0-9]+$';

  next_val := nextval('public.patitas_order_seq');
  IF next_val <= max_existing THEN
    next_val := setval('public.patitas_order_seq', max_existing + 1, true);
  END IF;

  RETURN 'PED-' || lpad(next_val::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_next_order_id() TO anon, authenticated;

-- 3. Suscripciones Web Push exclusivas para administradores (notificaciones con app cerrada)
CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email TEXT,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_label TEXT,
  user_agent TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_push_active ON public.admin_push_subscriptions(active);

ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage own push subscriptions" ON public.admin_push_subscriptions;
CREATE POLICY "Admins manage own push subscriptions"
ON public.admin_push_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.auth_user_id = auth.uid() AND lower(coalesce(c.role, '')) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.auth_user_id = auth.uid() AND lower(coalesce(c.role, '')) = 'admin'
  )
);

-- 4. Habilitar Supabase Realtime para public.orders (si aún no pertenece a la publicación)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
