-- =========================================================================
-- PATITAS DEL SUR 2.0 - MIGRACIÓN: CENTRO DE NOTIFICACIONES ADMIN EN VIVO
-- Fecha: 24 Noviembre 2026
-- =========================================================================

-- 0. ASEGURAR FUNCIÓN AUXILIAR DE ADMINISTRADOR PARA POLÍTICAS RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.customers
    WHERE role = 'admin'
      AND (
        auth_user_id = auth.uid()
        OR LOWER(COALESCE(email, '')) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. TABLA DE NOTIFICACIONES ADMINISTRATIVAS SINCRONIZADAS
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('order', 'status', 'payment', 'stock', 'pos')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT, -- 'order' | 'product' | 'pos_register'
  entity_id TEXT,   -- ej. 'PED-0042', 'PROD-11', 'CAJA-...'
  actor_name TEXT,  -- ej. 'Ignacio Alarcón', 'Alamiro Huerta', 'Tienda Web'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_by_emails TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created
  ON public.admin_notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_category
  ON public.admin_notifications (category, created_at DESC);

-- 2. SEGURIDAD ROW LEVEL SECURITY (SOLO ADMINISTRADORES)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_notifications'
      AND policyname = 'Admin gestiona notificaciones'
  ) THEN
    CREATE POLICY "Admin gestiona notificaciones"
      ON public.admin_notifications FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 3. HABILITAR SUPABASE REALTIME PARA SINCRONIZACIÓN INSTANTÁNEA ENTRE SOCIOS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'admin_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
