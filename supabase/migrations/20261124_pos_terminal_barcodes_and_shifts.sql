-- =========================================================================
-- PATITAS DEL SUR 2.0 - MIGRACIÓN: TERMINAL POS, BARCODES, CAJA Y TURNOS
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

-- 1. CÓDIGO DE BARRAS EN PRODUCTOS (EAN / UPC / Pistola USB)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS barcode TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique
  ON public.products (LOWER(TRIM(barcode)))
  WHERE barcode IS NOT NULL AND TRIM(barcode) <> '';

CREATE INDEX IF NOT EXISTS idx_products_barcode_lookup
  ON public.products (barcode);

-- 2. APERTURA Y CIERRE DIARIO DE CAJA POS
CREATE TABLE IF NOT EXISTS public.pos_cash_registers (
  id TEXT PRIMARY KEY, -- ej. 'CAJA-20261124-01'
  business_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Santiago')::DATE,
  status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opened_by_email TEXT NOT NULL,
  opened_by_name TEXT NOT NULL,
  closed_by_email TEXT,
  closed_by_name TEXT,
  opening_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expected_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
  counted_cash NUMERIC(12, 2),
  cash_difference NUMERIC(12, 2),
  total_sales_count INTEGER NOT NULL DEFAULT 0,
  total_sales_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_debit_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_credit_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_transfer_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_other_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_discounts NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_cash_registers_date
  ON public.pos_cash_registers (business_date DESC, opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_pos_cash_registers_status
  ON public.pos_cash_registers (status);

-- 3. MOVIMIENTOS MANUALES DE EFECTIVO EN CAJA (INGRESOS / RETIROS)
CREATE TABLE IF NOT EXISTS public.pos_cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id TEXT NOT NULL REFERENCES public.pos_cash_registers(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('ingreso', 'retiro')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  recorded_by_email TEXT,
  recorded_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_cash_movements_register
  ON public.pos_cash_movements (register_id, created_at DESC);

-- 4. TURNOS Y HORAS TRABAJADAS POR SOCIO EN TERMINAL POS
CREATE TABLE IF NOT EXISTS public.pos_work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id TEXT REFERENCES public.pos_cash_registers(id) ON DELETE SET NULL,
  business_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Santiago')::DATE,
  partner_key TEXT NOT NULL CHECK (partner_key IN ('ignacio', 'alamiro')),
  partner_email TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'cerrado')),
  sales_count INTEGER NOT NULL DEFAULT 0,
  sales_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_work_shifts_date
  ON public.pos_work_shifts (business_date DESC, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_pos_work_shifts_partner
  ON public.pos_work_shifts (partner_key, business_date DESC);

CREATE INDEX IF NOT EXISTS idx_pos_work_shifts_register
  ON public.pos_work_shifts (register_id);

-- 5. EXTENDER TABLA ORDERS CON TRAZABILIDAD POS Y PAGO DIVIDIDO
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pos_register_id TEXT REFERENCES public.pos_cash_registers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pos_shift_id UUID REFERENCES public.pos_work_shifts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sold_by_email TEXT,
  ADD COLUMN IF NOT EXISTS sold_by_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS cash_tendered NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cash_change NUMERIC(12, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_pos_register
  ON public.orders (pos_register_id)
  WHERE pos_register_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_channel
  ON public.orders (channel);

-- 6. SEGURIDAD ROW LEVEL SECURITY (SOLO ADMINISTRADORES)
ALTER TABLE public.pos_cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_work_shifts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pos_cash_registers' AND policyname = 'Admin gestiona cajas POS'
  ) THEN
    CREATE POLICY "Admin gestiona cajas POS"
      ON public.pos_cash_registers FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pos_cash_movements' AND policyname = 'Admin gestiona movimientos caja POS'
  ) THEN
    CREATE POLICY "Admin gestiona movimientos caja POS"
      ON public.pos_cash_movements FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pos_work_shifts' AND policyname = 'Admin gestiona turnos socios POS'
  ) THEN
    CREATE POLICY "Admin gestiona turnos socios POS"
      ON public.pos_work_shifts FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;
