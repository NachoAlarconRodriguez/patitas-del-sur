-- =========================================================================
-- MIGRACIÓN: PREFERENCIAS DE RECORDATORIOS Y CANALES DE NOTIFICACIÓN
-- Agrega columna para integración con Brevo (email) en la tabla customers
-- =========================================================================

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.customers.email_notifications IS 'Indica si el cliente autoriza recordatorios de antiparasitarios y vacunas por correo electrónico (Brevo).';
COMMENT ON COLUMN public.customers.whatsapp_notifications IS 'Indica si el cliente autoriza avisos de reposición de alimento por WhatsApp.';
