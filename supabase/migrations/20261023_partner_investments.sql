-- =========================================================================
-- PATITAS DEL SUR 2.0 - MIGRACIÓN: INVERSIONES Y APORTES DE SOCIOS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.partner_investments (
    id TEXT PRIMARY KEY, -- 'INV-01', 'INV-02'
    partner_name TEXT NOT NULL,
    partner_rut TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    investment_type TEXT NOT NULL DEFAULT 'capital_inicial', -- 'capital_inicial', 'aumento_capital', 'liquidez', 'compra_activos', 'prestamo_socio', 'otro'
    investment_type_label TEXT,
    payment_method TEXT DEFAULT 'Transferencia Bancaria',
    destination_account TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_investments_date ON public.partner_investments(date DESC);

-- Habilitar RLS
ALTER TABLE public.partner_investments ENABLE ROW LEVEL SECURITY;

-- Política de lectura y escritura
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'partner_investments' AND policyname = 'Allow all access to partner_investments'
  ) THEN
    CREATE POLICY "Allow all access to partner_investments" ON public.partner_investments
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
