-- Migration: Registro de Administrador / Repartidor en la Entrega de Pedidos
-- Fecha: 2026-10-24

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivered_by TEXT,
ADD COLUMN IF NOT EXISTS delivered_by_name TEXT,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.delivered_by IS 'Identificador o ID de usuario del administrador o repartidor responsable';
COMMENT ON COLUMN public.orders.delivered_by_name IS 'Nombre completo del administrador que realizó el reparto físico (ej: Ignacio Alarcón)';
COMMENT ON COLUMN public.orders.delivered_at IS 'Fecha y hora exacta en que se marcó el pedido como entregado';
