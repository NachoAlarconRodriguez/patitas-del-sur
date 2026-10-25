-- Migration: Add saved_addresses JSONB column to customers table
-- Permite almacenar una libreta de direcciones múltiples por cliente (Casa, Trabajo, Parcela, etc.)

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS saved_addresses JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.customers.saved_addresses IS 'Libreta de direcciones guardadas del cliente en formato JSONB con etiquetas y referencias';
