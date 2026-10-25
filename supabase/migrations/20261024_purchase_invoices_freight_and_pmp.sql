-- Migration: Soporte de Flete/Transporte y Costo Puesto en Bodega (Landed Cost & PMP)
-- Fecha: 2026-10-24

ALTER TABLE public.purchase_invoices
ADD COLUMN IF NOT EXISTS has_shipping_cost BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shipping_cost_neto NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_invoice_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_provider TEXT,
ADD COLUMN IF NOT EXISTS shipping_distribution_method TEXT DEFAULT 'units',
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.purchase_invoices.has_shipping_cost IS 'Indica si la compra requirió pago de flete o despacho separado';
COMMENT ON COLUMN public.purchase_invoices.shipping_cost_neto IS 'Monto neto pagado por concepto de transporte/flete';
COMMENT ON COLUMN public.purchase_invoices.shipping_invoice_number IS 'N° de factura o DTE emitido por la empresa de transporte';
COMMENT ON COLUMN public.purchase_invoices.shipping_provider IS 'Nombre o razón social de la empresa transportista (ej: Starken, Cruz del Sur)';
COMMENT ON COLUMN public.purchase_invoices.shipping_distribution_method IS 'Criterio de distribución del flete: units (por unidades) o value (proporcional al valor neto)';
COMMENT ON COLUMN public.purchase_invoices.items IS 'Detalle JSON estructurado de los productos, costos proveedor, flete unitario y costo landed';
